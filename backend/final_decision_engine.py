import re
import sys

def num(text, key, default=0.0):
    m = re.search(rf'{re.escape(key)}=([0-9.]+)', text)
    return float(m.group(1)) if m else default

def word(text, key, default="UNKNOWN"):
    m = re.search(rf'{re.escape(key)}=([A-Z_]+)', text)
    return m.group(1) if m else default

for line in sys.stdin:
    line = line.rstrip("\n")

    if not line.strip():
        continue

    venue_win = num(line, "VenueWin%")
    overall_win = num(line, "OverallWin%")
    matches = num(line, "Matches")
    toss_conversion = num(line, "TossConversion%")
    bat_pct = num(line, "BatFirstWin%")
    field_pct = num(line, "FieldFirstWin%")

    # ------------------------------------------------------------
    # 1. VENUE CONFIDENCE
    # ------------------------------------------------------------
    if matches < 3:
        venue_confidence = "VERY_LOW"
    elif matches < 5:
        venue_confidence = "LOW"
    elif matches < 10:
        venue_confidence = "MODERATE"
    else:
        venue_confidence = "STRONG"

    # ------------------------------------------------------------
    # 2. SAMPLE-SIZE WEIGHTING
    #
    # Venue influence grows with evidence but never exceeds 60%.
    # Overall matchup history always contributes at least 40%.
    # ------------------------------------------------------------
    venue_weight = min(0.60, 0.20 + (matches / 25.0))
    overall_weight = 1.0 - venue_weight

    performance_score = (
        venue_win * venue_weight +
        overall_win * overall_weight
    )

    # ------------------------------------------------------------
    # 3. STRATEGY SIGNAL
    # Small adjustment only when there is enough strategy data.
    # ------------------------------------------------------------
    strategy_bonus = 0.0
    strategy_signal = "NONE"

    bat_matches = num(line, "BatFirst")
    field_matches = num(line, "FieldFirst")

    if bat_matches >= 3 and field_matches >= 3:
        if field_pct >= bat_pct + 10:
            strategy_bonus = 3.0
            strategy_signal = "FIELD_FIRST"
        elif bat_pct >= field_pct + 10:
            strategy_bonus = 3.0
            strategy_signal = "BAT_FIRST"
        else:
            strategy_signal = "BALANCED"

    # ------------------------------------------------------------
    # 4. TOSS SIGNAL
    # Small adjustment only when there is enough toss data.
    # ------------------------------------------------------------
    toss_bonus = 0.0
    toss_signal = "NONE"

    toss_wins = num(line, "TossWins")
    toss_losses = num(line, "TossLosses")

    if toss_wins + toss_losses >= 5:
        if toss_conversion >= 70:
            toss_bonus = 2.0
            toss_signal = "STRONG"
        elif toss_conversion >= 55:
            toss_bonus = 1.0
            toss_signal = "MODERATE"
        else:
            toss_signal = "LOW"

    # ------------------------------------------------------------
    # 5. FINAL SCORE
    # Maximum = 105 approximately.
    # Score remains interpretable as a percentage-like strength.
    # ------------------------------------------------------------
    final_score = performance_score + strategy_bonus + toss_bonus

    # ------------------------------------------------------------
    # 6. FINAL DECISION
    #
    # Do NOT hide low-sample records.
    # We label their reliability separately.
    # ------------------------------------------------------------
    if final_score >= 75:
        decision = "STRONG_POSITIVE"
    elif final_score >= 60:
        decision = "POSITIVE"
    elif final_score >= 45:
        decision = "BALANCED"
    elif final_score >= 30:
        decision = "NEGATIVE"
    else:
        decision = "STRONG_NEGATIVE"

    # ------------------------------------------------------------
    # 7. DECISION CONFIDENCE
    # Combines sample size and strength of the final score.
    # ------------------------------------------------------------
    if matches < 3:
        decision_confidence = "VERY_LOW"
    elif matches < 5:
        decision_confidence = "LOW"
    elif matches < 10:
        decision_confidence = "MODERATE"
    elif abs(final_score - 50) >= 20:
        decision_confidence = "HIGH"
    else:
        decision_confidence = "MODERATE"

    print(
        line +
        f"\tPerformanceScore={performance_score:.2f}" +
        f"\tStrategyBonus={strategy_bonus:.2f}" +
        f"\tTossBonus={toss_bonus:.2f}" +
        f"\tFinalScore={final_score:.2f}" +
        f"\tFinalDecision={decision}" +
        f"\tDecisionConfidence={decision_confidence}" +
        f"\tStrategySignal={strategy_signal}" +
        f"\tTossSignal={toss_signal}" +
        f"\tVenueConfidence={venue_confidence}"
    )
