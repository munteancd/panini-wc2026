#!/usr/bin/env python3
"""Regression tests for refresh_matches.parse_group (stdlib only, no network).

Run: python scripts/test_refresh_matches.py
"""

import os
import sys
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import refresh_matches as rm  # noqa: E402

# A *played* group match as Wikipedia stores it: |Match N is gone (the score
# link now shows the score), and the FIFA report URL no longer carries a
# PMSR-Mxx number. This is exactly the box that broke the run (Match 3).
PLAYED_BOX = """
|date={{Start date|2026|6|12}}
|time=3:00&nbsp;p.m. [[UTC−04:00|UTC−4]]
|team1={{#invoke:flag|fb-rt|CAN}}
|score={{score link|2026 FIFA World Cup Group B#Canada vs Bosnia and Herzegovina|1–1}}
|team2={{#invoke:flag|fb|BIH}}
|stadium=[[BMO Field]], [[Toronto]]
|report=[https://fdp.fifa.org/assetspublic/ce281/r12458/pdf/FullTimeMatchReport-English.pdf Report]
}}
"""

# An *unplayed* match still carries |Match N inside the score-link label.
UNPLAYED_BOX = """
|date={{Start date|2026|6|13}}
|time=6:00&nbsp;p.m. [[UTC−04:00|UTC−4]]
|team1={{#invoke:flag|fb-rt|QAT}}
|score={{score link|2026 FIFA World Cup Group B#Qatar vs Switzerland|Match 8}}
|team2={{#invoke:flag|fb|SUI}}
|stadium=[[Stadium]], [[City]]
}}
"""


class ParseGroupTests(unittest.TestCase):
    def _wrap(self, box):
        # parse_group scans for "football box|main ... \n}}".
        return "{{football box|main" + box

    def test_played_match_recovers_number_from_lookup(self):
        lookup = {("B", frozenset(("CAN", "BIH"))): 3}
        matches = []
        rm.parse_group(self._wrap(PLAYED_BOX), "B", matches, lookup)
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["n"], 3)
        self.assertEqual(matches[0]["team1"], "CAN")
        self.assertEqual(matches[0]["team2"], "BIH")

    def test_played_match_skipped_when_not_in_lookup(self):
        matches = []
        rm.parse_group(self._wrap(PLAYED_BOX), "B", matches, {})
        self.assertEqual(matches, [])

    def test_unplayed_match_uses_inline_number(self):
        matches = []
        rm.parse_group(self._wrap(UNPLAYED_BOX), "B", matches, {})
        self.assertEqual(len(matches), 1)
        self.assertEqual(matches[0]["n"], 8)


if __name__ == "__main__":
    unittest.main()
