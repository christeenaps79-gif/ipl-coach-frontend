import sys
from collections import defaultdict

totals = defaultdict(lambda: [0] * 11)

for line in sys.stdin:
    line = line.rstrip("\n")
    parts = line.split("\t", 3)

    if len(parts) < 4:
        continue

    venue, team, opponent, stats = parts

    fields = {}
    for item in stats.split("\t"):
        if "=" in item:
            k, v = item.split("=", 1)
            fields[k] = v

    key = (venue, team, opponent)

    values = [
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

    for i, name in enumerate(values):
        totals[key][i] += int(fields.get(name, 0))

for (venue, team, opponent), v in sorted(totals.items()):
    matches, wins, losses, tosswins, tosslosses, tossmatchwins, tossmatchlosses, batfirst, batwins, fieldfirst, fieldwins = v

    winpct = wins * 100.0 / matches if matches else 0
    tosspct = tossmatchwins * 100.0 / tosswins if tosswins else 0
    batpct = batwins * 100.0 / batfirst if batfirst else 0
    fieldpct = fieldwins * 100.0 / fieldfirst if fieldfirst else 0

    print(
        f"{venue}\t{team}\t{opponent}\t"
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
