import re
import sys

def get_num(text, key, default=0):
    m = re.search(rf'{key}=([0-9.]+)', text)
    return float(m.group(1)) if m else default

for line in sys.stdin:
    line = line.rstrip("\n")

    matches = get_num(line, "Matches")
    toss_conversion = get_num(line, "TossConversion%")
    bat_first_pct = get_num(line, "BatFirstWin%")
    field_first_pct = get_num(line, "FieldFirstWin%")
    bat_first = get_num(line, "BatFirst")
    field_first = get_num(line, "FieldFirst")

    # Toss recommendation
    if matches < 3:
        toss_rec = "TOSS_DATA_INSUFFICIENT"
    elif toss_conversion >= 70:
        toss_rec = "TOSS_WIN_HAS_STRONG_VALUE"
    elif toss_conversion >= 55:
        toss_rec = "TOSS_WIN_HAS_MODERATE_VALUE"
    elif toss_conversion <= 40:
        toss_rec = "TOSS_WIN_HAS_LOW_VALUE"
    else:
        toss_rec = "TOSS_IMPACT_BALANCED"

    # Bat vs field recommendation
    if bat_first >= 3 and field_first >= 3:
        if bat_first_pct >= field_first_pct + 10:
            decision = "PREFER_BAT_FIRST"
        elif field_first_pct >= bat_first_pct + 10:
            decision = "PREFER_FIELD_FIRST"
        else:
            decision = "BAT_FIELD_BALANCED"
    elif bat_first >= 3:
        decision = "BAT_FIRST_DATA_STRONGER"
    elif field_first >= 3:
        decision = "FIELD_FIRST_DATA_STRONGER"
    else:
        decision = "BAT_FIELD_DATA_INSUFFICIENT"

    print(
        line +
        f"\tTossRecommendation={toss_rec}" +
        f"\tStrategyRecommendation={decision}"
    )
