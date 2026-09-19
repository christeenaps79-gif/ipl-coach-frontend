import sys

for line in sys.stdin:
    line = line.rstrip("\n")

    if not line:
        continue

    parts = line.split("\t")

    if len(parts) < 4:
        continue

    team = parts[0]
    opponent = parts[1]

    stats = {}
    for item in parts[2:]:
        if "=" in item:
            k, v = item.split("=", 1)
            stats[k] = v

    matches = int(stats.get("Matches", 0))
    winpct = float(stats.get("Win%", 0))
    tosspct = float(stats.get("TossConversion%", 0))
    batpct = float(stats.get("BatFirstWin%", 0))
    fieldpct = float(stats.get("FieldFirstWin%", 0))

    if matches <= 2:
        confidence = "VERY_LOW"
    elif matches <= 4:
        confidence = "LOW"
    elif matches <= 9:
        confidence = "MODERATE"
    elif matches <= 19:
        confidence = "STRONG"
    else:
        confidence = "VERY_STRONG"

    print(
        f"{team}\t{opponent}\t"
        + "\t".join(parts[2:])
        + f"\tConfidence={confidence}"
    )
