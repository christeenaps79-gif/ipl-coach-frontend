#!/usr/bin/env python3
import sys
import csv

def get_phase(over):
    if over < 6:
        return "powerplay"
    elif over < 15:
        return "middle"
    else:
        return "death"

reader = csv.DictReader(sys.stdin)

for row in reader:
    try:
        batter = row['batter'].strip()
        over = int(row['over'])
        batsman_runs = int(row['batsman_runs'])
        extras_type = row['extras_type'].strip().lower()
        is_wicket = row['is_wicket'].strip()
        player_dismissed = row['player_dismissed'].strip()

        if not batter or batter == "NA":
            continue

        balls = 0 if extras_type == "wides" else 1
        fours = 1 if batsman_runs == 4 else 0
        sixes = 1 if batsman_runs == 6 else 0
        dots = 1 if balls == 1 and batsman_runs == 0 else 0
        dismissal = "Y" if is_wicket == "Y" and player_dismissed == batter else "N"

        phase = get_phase(over)
        match_id = row['match_id']

        value = f"{batsman_runs}|{balls}|{fours}|{sixes}|{dots}|{match_id}|{phase}|{dismissal}"
        print(f"{batter}\t{value}")

    except (KeyError, ValueError):
        pass
