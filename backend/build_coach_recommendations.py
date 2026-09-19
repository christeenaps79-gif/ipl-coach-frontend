import re
import sys

overall = {}

def parse_stats(line):
    stats = {}
    for key, value in re.findall(
        r'([A-Za-z]+(?:Win)?%?|Matches|Wins|Losses|TossWins|TossLosses|'
        r'TossWinMatchWins|TossWinMatchLosses|BatFirst|BatFirstWins|'
        r'FieldFirst|FieldFirstWins)=([0-9.]+|[A-Z_]+)',
        line
    ):
        stats[key] = value
    return stats


# Load overall team-vs-opponent data
with open("team_opponent_overall_confidence.tsv", "r") as f:
    for line in f:
        line = line.rstrip("\n")
        parts = line.split("\t")

        if len(parts) < 3:
            continue

        team = parts[0]
        opponent = parts[1]
        stats_text = "\t".join(parts[2:])

        overall[(team, opponent)] = parse_stats(stats_text)


# Process venue-level data
for line in sys.stdin:
    line = line.rstrip("\n")
    parts = line.split("\t")

    if len(parts) < 4:
        continue

    venue = parts[0]
    team = parts[1]
    opponent = parts[2]
    venue_stats_text = "\t".join(parts[3:])

    venue_stats = parse_stats(venue_stats_text)
    overall_stats = overall.get((team, opponent), {})

    matches = int(float(venue_stats.get("Matches", 0)))
    wins = int(float(venue_stats.get("Wins", 0)))

    if matches > 0:
        venue_win_pct = wins * 100.0 / matches
    else:
        venue_win_pct = 0

    overall_matches = int(float(overall_stats.get("Matches", 0)))
    overall_wins = int(float(overall_stats.get("Wins", 0)))

    if overall_matches > 0:
        overall_win_pct = overall_wins * 100.0 / overall_matches
    else:
        overall_win_pct = 0

    overall_confidence = overall_stats.get("Confidence", "UNKNOWN")

    # ---------------------------------------------------------
    # RECOMMENDATION LOGIC
    # ---------------------------------------------------------
    #
    # Use venue data when there are at least 3 matches.
    # Otherwise fall back to overall team-vs-opponent data.
    #

    if matches >= 3:

        if venue_win_pct >= 70:
            recommendation = "STRONG_VENUE_ADVANTAGE"
        elif venue_win_pct >= 55:
            recommendation = "VENUE_ADVANTAGE"
        elif venue_win_pct <= 40:
            recommendation = "VENUE_DISADVANTAGE"
        else:
            recommendation = "BALANCED_VENUE"

        recommendation_source = "VENUE"

    elif overall_matches >= 3:

        if overall_win_pct >= 70:
            recommendation = "OVERALL_MATCHUP_STRONG_ADVANTAGE"
        elif overall_win_pct >= 55:
            recommendation = "OVERALL_MATCHUP_ADVANTAGE"
        elif overall_win_pct <= 40:
            recommendation = "OVERALL_MATCHUP_DISADVANTAGE"
        else:
            recommendation = "OVERALL_MATCHUP_BALANCED"

        recommendation_source = "OVERALL_MATCHUP"

    else:

        recommendation = "INSUFFICIENT_DATA"
        recommendation_source = "INSUFFICIENT"


    print(
        f"{venue}\t{team}\t{opponent}\t"
        f"VenueWin%={venue_win_pct:.2f}\t"
        f"OverallWin%={overall_win_pct:.2f}\t"
        f"VenueMatches={matches}\t"
        f"OverallMatches={overall_matches}\t"
        f"{venue_stats_text}\t"
        f"OverallConfidence={overall_confidence}\t"
        f"RecommendationSource={recommendation_source}\t"
        f"Recommendation={recommendation}"
    )
