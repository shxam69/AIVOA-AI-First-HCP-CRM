import json
import os
from datetime import date
from typing import Any, Dict
from app.tools.interaction_tools import TOOLS, resolve_relative_weekday

from dotenv import load_dotenv
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from langchain_groq import ChatGroq
from langgraph.graph import END, StateGraph

from app.agents.state import AgentState
from app.tools.interaction_tools import TOOLS

load_dotenv()

MODEL_NAME = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

llm = ChatGroq(
    model=MODEL_NAME,
    temperature=0,
)

llm_with_tools = llm.bind_tools(TOOLS)

tools_by_name = {tool.name: tool for tool in TOOLS}

def _latest_human_message(messages) -> str:
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            return msg.content
    return ""

SYSTEM_PROMPT = f"""
You are an AI assistant for a life-sciences CRM used by pharmaceutical
field representatives to log interactions with Healthcare Professionals.
Today's date is {date.today().isoformat()} and today's weekday is {date.today().strftime("%A")}.

RELATIVE DATE RULES:

- Resolve all relative dates using today's exact date and weekday above.
- "today" means {date.today().isoformat()}.
- "tomorrow" means the calendar day immediately after today.
- For phrases such as "next Monday", "next Tuesday", or another named weekday,
  calculate the actual next occurrence of that weekday after today's date.
- Always return resolved dates in YYYY-MM-DD format.
- Never guess relative dates.

You MUST use the available tools to modify or save interaction data.

AVAILABLE TOOLS:

1. log_interaction
Use when the user describes a new HCP interaction.

2. edit_interaction
Use when the user corrects or changes fields in the current interaction.

3. add_material
Use when the user adds materials shared with the HCP.

4. schedule_follow_up
Use when the user requests a follow-up action.

5. save_interaction
Use only when the user explicitly asks to save or submit the interaction.

IMPORTANT RULES:
- The current interaction state represents the interaction already being edited.
- If current interaction state is not empty and the user corrects or changes
  interaction details, use edit_interaction rather than log_interaction.
- Do not call log_interaction for corrections to an existing interaction.
- Do not call save_interaction more than once in a single request.

- Extract information from natural language using the LLM.
- Convert relative dates such as today and tomorrow into YYYY-MM-DD.
- Never invent information that the user did not provide.
- When editing, update only explicitly requested fields.
- Preserve all other existing interaction fields.
- When adding materials, use the add_material tool.
- When scheduling follow-up actions, use schedule_follow_up.
- Never save unless explicitly requested.
"""


def agent_node(state: AgentState) -> Dict[str, Any]:
    current_interaction = state.get("interaction", {})

    context_message = SystemMessage(
        content=(
            SYSTEM_PROMPT
            + "\n\nCURRENT INTERACTION STATE:\n"
            + json.dumps(current_interaction, default=str)
        )
    )

    response = llm_with_tools.invoke(
        [context_message] + state["messages"]
    )

    return {"messages": [response]}


def should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]

    if getattr(last_message, "tool_calls", None):
        return "tools"

    return END


def tool_node(state: AgentState) -> Dict[str, Any]:
    last_message = state["messages"][-1]

    interaction = dict(state.get("interaction", {}))
    tool_messages = []

    active_tool = ""
    saved_interaction_id = state.get("saved_interaction_id")

    for tool_call in last_message.tool_calls:
        tool_name = tool_call["name"]
        tool_args = dict(tool_call["args"])

        active_tool = tool_name

        # Save must receive the complete current interaction state.
        if tool_name == "save_interaction":
            complete_data = dict(interaction)
            complete_data.update(
                {
                    key: value
                    for key, value in tool_args.items()
                    if value is not None
                }
            )
            tool_args = complete_data

        # Deterministic date resolution for follow-up actions
        if "follow_up_actions" in tool_args and tool_args["follow_up_actions"]:
            original_message = _latest_human_message(state["messages"])
            resolved_msg = resolve_relative_weekday(original_message)

            if resolved_msg != original_message:
                import re
                resolved_dates = re.findall(r"\d{4}-\d{2}-\d{2}", resolved_msg)
                if resolved_dates:
                    correct_date = max(resolved_dates)
                    current_action = tool_args["follow_up_actions"]
                    
                    if re.search(r"\d{4}-\d{2}-\d{2}", current_action):
                        current_action = re.sub(r"\d{4}-\d{2}-\d{2}", correct_date, current_action)
                    else:
                        lower_action = current_action.lower()
                        replaced = False
                        
                        for phrase in ["tomorrow", "today"]:
                            if phrase in lower_action:
                                current_action = re.sub(phrase, correct_date, current_action, flags=re.IGNORECASE)
                                replaced = True
                        
                        if not replaced:
                            for day in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
                                for prefix in ["next ", "this ", "upcoming "]:
                                    if (prefix + day) in lower_action:
                                        current_action = re.sub(prefix + day, correct_date, current_action, flags=re.IGNORECASE)
                                        replaced = True
                                        
                        if not replaced:
                            current_action = f"{current_action} on {correct_date}"
                        
                    tool_args["follow_up_actions"] = current_action
        

        selected_tool = tools_by_name[tool_name]
        result = selected_tool.invoke(tool_args)
        parsed_result = json.loads(result)

        updates = parsed_result.get("updates", {})

        # Append new materials without destroying existing materials.
        if tool_name == "add_material":
            new_materials = updates.get("materials_shared")
            existing_materials = interaction.get("materials_shared")

            if existing_materials and new_materials:
                interaction["materials_shared"] = (
                    f"{existing_materials}, {new_materials}"
                )
            elif new_materials:
                interaction["materials_shared"] = new_materials

        else:
            interaction.update(
                {
                    key: value
                    for key, value in updates.items()
                    if value is not None
                }
            )

        if parsed_result.get("interaction_id"):
            saved_interaction_id = parsed_result["interaction_id"]

        tool_messages.append(
            ToolMessage(
                content=result,
                tool_call_id=tool_call["id"],
            )
        )

    return {
        "messages": tool_messages,
        "interaction": interaction,
        "active_tool": active_tool,
        "saved_interaction_id": saved_interaction_id,
    }
workflow = StateGraph(AgentState)

workflow.add_node("agent", agent_node)
workflow.add_node("tools", tool_node)

workflow.set_entry_point("agent")

workflow.add_conditional_edges(
    "agent",
    should_continue,
    {
        "tools": "tools",
        END: END,
    },
)

workflow.add_edge("tools", END)

graph = workflow.compile()


def run_agent(
    message: str,
    interaction: Dict[str, Any] | None = None,
) -> Dict[str, Any]:

    initial_state: AgentState = {
        "messages": [HumanMessage(content=message)],
        "interaction": interaction or {},
        "active_tool": "",
        "saved_interaction_id": None,
    }

    result = graph.invoke(initial_state)

    active_tool = result.get("active_tool", "")
    updated_interaction = result.get("interaction", {})
    saved_interaction_id = result.get("saved_interaction_id")

    replies = {
        "log_interaction": "Interaction details extracted successfully.",
        "edit_interaction": "Interaction details updated successfully.",
        "add_material": "Materials added successfully.",
        "schedule_follow_up": "Follow-up action scheduled successfully.",
        "save_interaction": "Interaction saved successfully.",
    }

    return {
        "reply": replies.get(
            active_tool,
            "I could not determine the requested interaction action.",
        ),
        "interaction": updated_interaction,
        "active_tool": active_tool,
        "saved_interaction_id": saved_interaction_id,
    }