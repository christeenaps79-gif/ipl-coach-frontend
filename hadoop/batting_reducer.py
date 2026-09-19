#!/usr/bin/env python3
import sys

batter_stats = {}

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue

    try:
        parts = line.split('\t', 1)
        if len(parts) != 2:
            continue

        batter = parts[0]
        values = parts[1].split('|')

        runs = int(values[0])
        balls = int(values[1])
        fours = int(values[2])
        sixes = int(values[3])
        dots = int(values[4])
        match_id = values[5]
        phase = values[6]
        dismissal = values[7]

        if batter not in batter_stats:
            batter_stats[batter] = {
                'runs': 0,
                'balls': 0,
                'fours': 0,
                'sixes': 0,
                'dots': 0,
                'dismissals': 0,
                'matches': set(),
                'phases': {
                    'powerplay': {'runs': 0, 'balls': 0},
                    'middle': {'runs': 0, 'balls': 0},
                    'death': {'runs': 0, 'balls': 0}
                }
            }

        s = batter_stats[batter]

        s['runs'] += runs
        s['balls'] += balls
        s['fours'] += fours
        s['sixes'] += sixes
        s['dots'] += dots
        s['matches'].add(match_id)

        if dismissal == "Y":
            s['dismissals'] += 1

        if phase in s['phases']:
            s['phases'][phase]['runs'] += runs
            s['phases'][phase]['balls'] += balls

    except (ValueError, IndexError):
        continue

for batter in sorted(batter_stats):
    s = batter_stats[batter]

    runs = s['runs']
    balls = s['balls']
    dismissals = s['dismissals']
    matches = len(s['matches'])

    avg = runs / dismissals if dismissals else 0
    sr = runs / balls * 100 if balls else 0
    dot_pct = s['dots'] / balls * 100 if balls else 0

    boundary_runs = s['fours'] * 4 + s['sixes'] * 6
    boundary_pct = boundary_runs / runs * 100 if runs else 0
    rpm = runs / matches if matches else 0

    pp = s['phases']['powerplay']
    mid = s['phases']['middle']
    death = s['phases']['death']

    pp_sr = pp['runs'] / pp['balls'] * 100 if pp['balls'] else 0
    mid_sr = mid['runs'] / mid['balls'] * 100 if mid['balls'] else 0
    death_sr = death['runs'] / death['balls'] * 100 if death['balls'] else 0

    print(
        f"{batter}|{runs}|{balls}|{avg:.2f}|{sr:.2f}|"
        f"{s['fours']}|{s['sixes']}|{s['dots']}|{dot_pct:.2f}|"
        f"{boundary_pct:.2f}|{rpm:.2f}|{matches}|"
        f"{pp['runs']}|{pp['balls']}|{pp_sr:.2f}|"
        f"{mid['runs']}|{mid['balls']}|{mid_sr:.2f}|"
        f"{death['runs']}|{death['balls']}|{death_sr:.2f}"
    )
