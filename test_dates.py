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
