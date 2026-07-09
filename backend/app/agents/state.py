from typing import Annotated, Any, Dict, List, TypedDict

from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    messages: Annotated[List, add_messages]
    interaction: Dict[str, Any]
    active_tool: str
    saved_interaction_id: int | None