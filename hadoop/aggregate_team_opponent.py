import sys
from collections import defaultdict

totals = defaultdict(lambda: [0] * 11)

for line in sys.stdin:
    line = line.rstrip("\n")
    parts = line.split("\t")

    if len(parts) < 4:
        continue

    team = parts[1]
    opponent = parts[2]

    stats = {}

    for item in parts[3:]:
        if "=" in item:
            k, v = item.split("=", 1)
            stats[k] = v

    key = (team, opponent)

    names = [
        "Matches",
        "Wins",
        "Losses",
        "TossWins",
        "TossLosses",
        "TossWinMatchWins",
        "TossWinMatchLosses",
        "BatFirst",
        "BatFirstWins",
        "FieldFirst",
        "FieldFirstWins"
    ]

    for i, name in enumerate(names):
        totals[key][i] += int(stats.get(name, 0))

for (team, opponent), v in sorted(totals.items()):
    (
        matches, wins, losses,
        tosswins, tosslosses,
        tossmatchwins, tossmatchlosses,
        batfirst, batwins,
        fieldfirst, fieldwins
    ) = v

    winpct = wins * 100.0 / matches if matches else 0
    tosspct = tossmatchwins * 100.0 / tosswins if tosswins else 0
    batpct = batwins * 100.0 / batfirst if batfirst else 0
    fieldpct = fieldwins * 100.0 / fieldfirst if fieldfirst else 0

    print(
        f"{team}\t{opponent}\t"
        f"Matches={matches}\t"
        f"Wins={wins}\t"
        f"Losses={losses}\t"
        f"Win%={winpct:.2f}\t"
        f"TossWins={tosswins}\t"
        f"TossLosses={tosslosses}\t"
        f"TossWinMatchWins={tossmatchwins}\t"
        f"TossWinMatchLosses={tossmatchlosses}\t"
        f"TossConversion%={tosspct:.2f}\t"
        f"BatFirst={batfirst}\t"
        f"BatFirstWins={batwins}\t"
        f"BatFirstWin%={batpct:.2f}\t"
        f"FieldFirst={fieldfirst}\t"
        f"FieldFirstWins={fieldwins}\t"
        f"FieldFirstWin%={fieldpct:.2f}"
    )
