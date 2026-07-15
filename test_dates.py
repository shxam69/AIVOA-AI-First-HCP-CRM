import sys
from datetime import date, timedelta
from backend.app.tools.interaction_tools import resolve_relative_weekday

# Mock today for predictable tests
class MockDate(date):
    @classmethod
    def today(cls):
        # Let's say today is Wednesday, 2026-07-15
        return cls(2026, 7, 15)

import datetime
datetime.date = MockDate

def test_resolve():
    tests = {
        "follow up tomorrow": "follow up 2026-07-16",
        "follow up today": "follow up 2026-07-15",
        "next monday": "2026-07-20", # (0 - 2) % 7 = 5 days ahead -> 15 + 5 = 20
        "last monday": "2026-07-13",
        "last wednesday": "2026-07-08",
        "this monday": "2026-07-13", # 15 - 2 days
        "upcoming monday": "2026-07-20", 
    }
    
    passed = 0
    for input_text, expected in tests.items():
        actual = resolve_relative_weekday(input_text)
        if actual == expected:
            passed += 1
        else:
            print(f"FAILED: '{input_text}' -> Expected: '{expected}', Got: '{actual}'")
            
    print(f"Passed {passed}/{len(tests)} tests.")

if __name__ == "__main__":
    test_resolve()

    print("\n--- Running Graph Regression Tests ---")
    
    # Simulate the logic from graph.py for date resolution
    def simulate_graph_logic(original_message: str, tool_args: dict) -> dict:
        import re
        args = dict(tool_args)
        lower_msg = original_message.lower()
        
        # Interaction Date Logic
        if "interaction_date" in args and args["interaction_date"]:
            follow_up_text = args.get("follow_up_actions", "").lower() if args.get("follow_up_actions") else ""
            
            def is_interaction(phrase):
                return phrase in lower_msg and phrase not in follow_up_text
                
            interaction_date_str = None
            today = date.today()
            if is_interaction("yesterday"):
                interaction_date_str = (today - timedelta(days=1)).isoformat()
            elif is_interaction("today"):
                interaction_date_str = today.isoformat()
            else:
                for w_name, w_idx in [("monday", 0), ("tuesday", 1), ("wednesday", 2), ("thursday", 3), ("friday", 4), ("saturday", 5), ("sunday", 6)]:
                    if is_interaction(f"last {w_name}"):
                        days_behind = (today.weekday() - w_idx) % 7
                        if days_behind == 0: days_behind = 7
                        interaction_date_str = (today - timedelta(days=days_behind)).isoformat()
                        break
                    elif is_interaction(f"this {w_name}"):
                        current_monday = today - timedelta(days=today.weekday())
                        interaction_date_str = (current_monday + timedelta(days=w_idx)).isoformat()
                        break
                        
            if interaction_date_str:
                args["interaction_date"] = interaction_date_str
                
        # Follow-up Logic
        if "follow_up_actions" in args and args["follow_up_actions"]:
            current_action = args["follow_up_actions"]
            today = date.today()
            follow_up_date_str = None
            if "tomorrow" in lower_msg:
                follow_up_date_str = (today + timedelta(days=1)).isoformat()
            else:
                for w_name, w_idx in [("monday", 0), ("tuesday", 1), ("wednesday", 2), ("thursday", 3), ("friday", 4), ("saturday", 5), ("sunday", 6)]:
                    if f"next {w_name}" in lower_msg or f"upcoming {w_name}" in lower_msg:
                        days_ahead = (w_idx - today.weekday()) % 7
                        if days_ahead == 0: days_ahead = 7
                        follow_up_date_str = (today + timedelta(days=days_ahead)).isoformat()
                        break
                    elif f"this {w_name}" in lower_msg and f"this {w_name}" in current_action.lower():
                        current_monday = today - timedelta(days=today.weekday())
                        follow_up_date_str = (current_monday + timedelta(days=w_idx)).isoformat()
                        break

            if follow_up_date_str:
                if re.search(r"\d{4}-\d{2}-\d{2}", current_action):
                    current_action = re.sub(r"\d{4}-\d{2}-\d{2}", follow_up_date_str, current_action)
                else:
                    replaced = False
                    for phrase in ["tomorrow"]:
                        if phrase in current_action.lower():
                            current_action = re.sub(phrase, follow_up_date_str, current_action, flags=re.IGNORECASE)
                            replaced = True
                    if not replaced:
                        for w_name in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]:
                            for prefix in ["next ", "this ", "upcoming "]:
                                if (prefix + w_name) in current_action.lower():
                                    current_action = re.sub(prefix + w_name, follow_up_date_str, current_action, flags=re.IGNORECASE)
                                    replaced = True
                    if not replaced:
                        current_action = f"{current_action} on {follow_up_date_str}"
                args["follow_up_actions"] = current_action
                
        return args

    # Test A
    res_a = simulate_graph_logic(
        "Yesterday I met Dr. Arjun Mehta, and we agreed to follow up next Monday.",
        {"interaction_date": "2026-07-15", "follow_up_actions": "follow up next Monday"}
    )
    assert res_a["interaction_date"] == "2026-07-14", f"A fail int: {res_a}"
    assert "2026-07-20" in res_a["follow_up_actions"], f"A fail fol: {res_a}"
    print("Test A Passed")

    # Test B
    res_b = simulate_graph_logic(
        "Schedule a follow-up next Wednesday.",
        {"interaction_date": "2026-07-13", "follow_up_actions": "follow up next Wednesday"}
    )
    assert res_b["interaction_date"] == "2026-07-13", f"B fail int: {res_b}"
    print("Test B Passed")

    # Test C
    res_c = simulate_graph_logic(
        "Last Monday I met Dr. Arjun Mehta.",
        {"interaction_date": "2026-07-08"} # LLM hallucinates 08
    )
    assert res_c["interaction_date"] == "2026-07-13", f"C fail int: {res_c}"
    print("Test C Passed")

    # Test D
    res_d = simulate_graph_logic(
        "Add a brochure and schedule a follow-up upcoming Friday.",
        {"interaction_date": "2026-07-10", "follow_up_actions": "follow up upcoming Friday"}
    )
    assert res_d["interaction_date"] == "2026-07-10", f"D fail int: {res_d}"
    print("Test D Passed")
