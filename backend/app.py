from flask import Flask, jsonify, request
from flask_cors import CORS
import csv
import io
import os
import re
import subprocess
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# ============================================================
# FILES
# ============================================================

DATA_FILE = "coach_recommendations_final.tsv"

HDFS_MATCHES = "/ipl/matches.csv"
HDFS_DELIVERIES = "/ipl/deliveries.csv"

# ============================================================
# EXISTING COACH RECOMMENDATION ENGINE
# ============================================================

def parse_value(text, key, default=0):
    match = re.search(rf"{re.escape(key)}=([0-9.]+)", text)
    if match:
        value = float(match.group(1))
        return int(value) if value.is_integer() else value
    return default


def parse_word(text, key, default="UNKNOWN"):
    match = re.search(rf"{re.escape(key)}=([A-Z_]+)", text)
    return match.group(1) if match else default


def parse_record(line):
    parts = line.split("\t")

    if len(parts) < 3:
        return None

    return {
        "venue": parts[0].strip(),
        "team": parts[1].strip(),
        "opponent": parts[2].strip(),

        "venueWinPct": parse_value(line, "VenueWin%"),
        "overallWinPct": parse_value(line, "OverallWin%"),
        "matches": parse_value(line, "Matches"),
        "wins": parse_value(line, "Wins"),
        "losses": parse_value(line, "Losses"),
        "winPct": parse_value(line, "Win%"),

        "tossWins": parse_value(line, "TossWins"),
        "tossLosses": parse_value(line, "TossLosses"),
        "tossWinMatchWins": parse_value(line, "TossWinMatchWins"),
        "tossWinMatchLosses": parse_value(line, "TossWinMatchLosses"),
        "tossConversionPct": parse_value(line, "TossConversion%"),

        "batFirst": parse_value(line, "BatFirst"),
        "batFirstWins": parse_value(line, "BatFirstWins"),
        "batFirstWinPct": parse_value(line, "BatFirstWin%"),

        "fieldFirst": parse_value(line, "FieldFirst"),
        "fieldFirstWins": parse_value(line, "FieldFirstWins"),
        "fieldFirstWinPct": parse_value(line, "FieldFirstWin%"),

        "overallConfidence": parse_word(line, "OverallConfidence"),
        "recommendation": parse_word(line, "Recommendation"),
        "tossRecommendation": parse_word(line, "TossRecommendation"),
        "strategyRecommendation": parse_word(line, "StrategyRecommendation"),
        "venueConfidence": parse_word(line, "VenueConfidence"),

        "performanceScore": parse_value(line, "PerformanceScore"),
        "strategyBonus": parse_value(line, "StrategyBonus"),
        "tossBonus": parse_value(line, "TossBonus"),
        "finalScore": parse_value(line, "FinalScore"),

        "finalDecision": parse_word(line, "FinalDecision"),
        "decisionConfidence": parse_word(line, "DecisionConfidence"),
        "strategySignal": parse_word(line, "StrategySignal"),
        "tossSignal": parse_word(line, "TossSignal")
    }


def load_records():
    if not os.path.exists(DATA_FILE):
        raise FileNotFoundError(f"{DATA_FILE} not found")

    records = []

    with open(DATA_FILE, "r", encoding="utf-8") as file:
        for line in file:
            line = line.strip()

            if not line:
                continue

            record = parse_record(line)

            if record:
                records.append(record)

    return records


COACH_RECORDS = load_records()

# ============================================================
# HDFS DATA LOADING
# ============================================================

MATCHES = []
DELIVERIES = []

MATCH_BY_ID = {}

PLAYER_STATS = {}
TEAM_STATS = {}
VENUE_STATS = {}
PLAYER_VENUE_STATS = {}
PLAYER_FORM = {}
BATTLES = {}


def read_hdfs_file(path):
    """
    Reads a file directly from HDFS.
    """
    try:
        result = subprocess.run(
            ["hdfs", "dfs", "-cat", path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=True
        )

        return result.stdout.decode("utf-8", errors="replace")

    except Exception as e:
        print(f"Could not read HDFS file {path}: {e}")
        return ""


def safe_int(value, default=0):
    try:
        return int(float(value))
    except:
        return default


def safe_float(value, default=0.0):
    try:
        return float(value)
    except:
        return default


def load_ipl_data():

    global MATCHES
    global DELIVERIES
    global MATCH_BY_ID

    print("")
    print("=" * 60)
    print("LOADING IPL DATA FROM HDFS")
    print("=" * 60)

    # --------------------------------------------------------
    # MATCHES
    # --------------------------------------------------------

    matches_text = read_hdfs_file(HDFS_MATCHES)

    if matches_text:

        reader = csv.DictReader(io.StringIO(matches_text))

        for row in reader:

            MATCHES.append(row)

            match_id = str(row.get("id", "")).strip()

            if match_id:
                MATCH_BY_ID[match_id] = row

    print(f"Matches loaded: {len(MATCHES)}")

    # --------------------------------------------------------
    # DELIVERIES
    # --------------------------------------------------------

    deliveries_text = read_hdfs_file(HDFS_DELIVERIES)

    if deliveries_text:

        reader = csv.DictReader(io.StringIO(deliveries_text))

        for row in reader:
            DELIVERIES.append(row)

    print(f"Deliveries loaded: {len(DELIVERIES)}")

    print("=" * 60)


# ============================================================
# BUILD ANALYTICS
# ============================================================

def build_analytics():

    global PLAYER_STATS
    global TEAM_STATS
    global VENUE_STATS
    global PLAYER_VENUE_STATS
    global PLAYER_FORM
    global BATTLES

    player = defaultdict(lambda: {
        "runs": 0,
        "balls": 0,
        "fours": 0,
        "sixes": 0,
        "dismissals": 0,
        "matches": set(),
        "wickets": 0,
        "runs_conceded": 0,
        "bowling_balls": 0
    })

    team = defaultdict(lambda: {
        "matches": 0,
        "wins": 0,
        "losses": 0,
        "runs": 0,
        "runs_conceded": 0
    })

    venue = defaultdict(lambda: {
        "matches": 0,
        "team_matches": defaultdict(int),
        "team_wins": defaultdict(int)
    })

    player_venue = defaultdict(lambda: {
        "runs": 0,
        "balls": 0,
        "wickets": 0,
        "matches": set()
    })

    battles = defaultdict(lambda: {
        "balls": 0,
        "runs": 0,
        "wickets": 0,
        "dots": 0,
        "fours": 0,
        "sixes": 0
    })

    # --------------------------------------------------------
    # MATCH LEVEL ANALYTICS
    # --------------------------------------------------------

    for match in MATCHES:

        match_id = str(match.get("id", "")).strip()
        venue_name = match.get("venue", "Unknown")
        winner = match.get("winner", "")
        team1 = match.get("team1", "")
        team2 = match.get("team2", "")

        teams = [team1, team2]

        for t in teams:

            if not t:
                continue

            team[t]["matches"] += 1

            if winner == t:
                team[t]["wins"] += 1

            elif winner:
                team[t]["losses"] += 1

        if venue_name:

            venue[venue_name]["matches"] += 1

            for t in teams:

                if not t:
                    continue

                venue[venue_name]["team_matches"][t] += 1

                if winner == t:
                    venue[venue_name]["team_wins"][t] += 1

    # --------------------------------------------------------
    # BALL-BY-BALL ANALYTICS
    # --------------------------------------------------------

    for ball in DELIVERIES:

        match_id = str(ball.get("match_id", "")).strip()

        match = MATCH_BY_ID.get(match_id)

        if not match:
            continue

        venue_name = match.get("venue", "Unknown")

        batter = ball.get("batter", "")
        bowler = ball.get("bowler", "")

        runs = safe_int(ball.get("batsman_runs"))
        extra_runs = safe_int(ball.get("extra_runs"))
        total_runs = safe_int(ball.get("total_runs"))

        is_wicket = str(ball.get("is_wicket", "0")) == "1"

        dismissal = ball.get("player_dismissed", "")

        extras_type = ball.get("extras_type", "")

        # ----------------------------------------------------
        # BATTER
        # ----------------------------------------------------

        if batter:

            p = player[batter]

            p["runs"] += runs
            p["matches"].add(match_id)

            # Wides do not count as legal balls
            if extras_type != "wides":
                p["balls"] += 1

            if runs == 4:
                p["fours"] += 1

            if runs == 6:
                p["sixes"] += 1

            if is_wicket and dismissal == batter:
                p["dismissals"] += 1

            pv = player_venue[(batter, venue_name)]

            pv["runs"] += runs
            pv["matches"].add(match_id)

            if extras_type != "wides":
                pv["balls"] += 1

        # ----------------------------------------------------
        # BOWLER
        # ----------------------------------------------------

        if bowler:

            b = player[bowler]

            if extras_type != "wides" and extras_type != "noballs":
                b["bowling_balls"] += 1

            b["runs_conceded"] += total_runs

            if is_wicket:

                dismissal_kind = ball.get("dismissal_kind", "")

                # Count normal bowler wickets
                if dismissal_kind not in [
                    "run out",
                    "retired hurt",
                    "obstructing the field"
                ]:
                    b["wickets"] += 1

            pv = player_venue[(bowler, venue_name)]

            if is_wicket:

                dismissal_kind = ball.get("dismissal_kind", "")

                if dismissal_kind not in [
                    "run out",
                    "retired hurt",
                    "obstructing the field"
                ]:
                    pv["wickets"] += 1

        # ----------------------------------------------------
        # PLAYER VS PLAYER
        # ----------------------------------------------------

        if batter and bowler:

            battle = battles[(batter, bowler)]

            if extras_type != "wides":
                battle["balls"] += 1

            battle["runs"] += runs

            if runs == 0:
                battle["dots"] += 1

            if runs == 4:
                battle["fours"] += 1

            if runs == 6:
                battle["sixes"] += 1

            if is_wicket and dismissal == batter:

                dismissal_kind = ball.get("dismissal_kind", "")

                if dismissal_kind not in [
                    "run out",
                    "retired hurt",
                    "obstructing the field"
                ]:
                    battle["wickets"] += 1

    # ========================================================
    # FINALIZE PLAYER STATS
    # ========================================================

    for name, data in player.items():

        runs = data["runs"]
        balls = data["balls"]
        wickets = data["wickets"]
        bowling_balls = data["bowling_balls"]

        strike_rate = (
            (runs / balls) * 100
            if balls > 0 else 0
        )

        economy = (
            (data["runs_conceded"] / bowling_balls) * 6
            if bowling_balls > 0 else 0
        )

        PLAYER_STATS[name] = {
            "player": name,
            "runs": runs,
            "balls": balls,
            "strikeRate": round(strike_rate, 2),
            "fours": data["fours"],
            "sixes": data["sixes"],
            "dismissals": data["dismissals"],
            "wickets": wickets,
            "bowlingBalls": bowling_balls,
            "runsConceded": data["runs_conceded"],
            "economy": round(economy, 2),
            "matches": len(data["matches"])
        }

    # ========================================================
    # TEAM STATS
    # ========================================================

    for name, data in team.items():

        win_pct = (
            data["wins"] / data["matches"] * 100
            if data["matches"] > 0 else 0
        )

        TEAM_STATS[name] = {
            "team": name,
            "matches": data["matches"],
            "wins": data["wins"],
            "losses": data["losses"],
            "winPct": round(win_pct, 2)
        }

    # ========================================================
    # VENUE STATS
    # ========================================================

    for venue_name, data in venue.items():

        team_data = {}

        for team_name in data["team_matches"]:

            matches_count = data["team_matches"][team_name]
            wins_count = data["team_wins"][team_name]

            win_pct = (
                wins_count / matches_count * 100
                if matches_count > 0 else 0
            )

            team_data[team_name] = {
                "matches": matches_count,
                "wins": wins_count,
                "winPct": round(win_pct, 2)
            }

        VENUE_STATS[venue_name] = {
            "venue": venue_name,
            "matches": data["matches"],
            "teams": team_data
        }

    # ========================================================
    # PLAYER-VENUE
    # ========================================================

    for (player_name, venue_name), data in player_venue.items():

        runs = data["runs"]
        balls = data["balls"]

        strike_rate = (
            runs / balls * 100
            if balls > 0 else 0
        )

        PLAYER_VENUE_STATS[(player_name, venue_name)] = {
            "player": player_name,
            "venue": venue_name,
            "runs": runs,
            "balls": balls,
            "strikeRate": round(strike_rate, 2),
            "wickets": data["wickets"],
            "matches": len(data["matches"])
        }

    # ========================================================
    # BATTLES
    # ========================================================

    for (batter, bowler), data in battles.items():

        balls = data["balls"]
        runs = data["runs"]

        strike_rate = (
            runs / balls * 100
            if balls > 0 else 0
        )

        BATTLES[(batter, bowler)] = {
            "batter": batter,
            "bowler": bowler,
            "balls": balls,
            "runs": runs,
            "strikeRate": round(strike_rate, 2),
            "wickets": data["wickets"],
            "dots": data["dots"],
            "fours": data["fours"],
            "sixes": data["sixes"]
        }

    # ========================================================
    # RECENT FORM
    # ========================================================

    # Build match dates for each player
    player_matches = defaultdict(list)

    for match in MATCHES:

        match_id = str(match.get("id", "")).strip()
        date = match.get("date", "")

        if not match_id:
            continue

        players_in_match = set()

        for ball in DELIVERIES:

            if str(ball.get("match_id", "")).strip() != match_id:
                continue

            batter = ball.get("batter", "")
            bowler = ball.get("bowler", "")

            if batter:
                players_in_match.add(batter)

            if bowler:
                players_in_match.add(bowler)

        for p in players_in_match:
            player_matches[p].append(
                (date, match_id)
            )

    for p, matches_list in player_matches.items():

        matches_list.sort(reverse=True)

        recent = matches_list[:5]

        PLAYER_FORM[p] = {
            "player": p,
            "last5Matches": len(recent),
            "recentMatches": [
                {
                    "date": x[0],
                    "matchId": x[1]
                }
                for x in recent
            ]
        }

    print("")
    print("=" * 60)
    print("ANALYTICS READY")
    print("=" * 60)
    print(f"Players: {len(PLAYER_STATS)}")
    print(f"Teams: {len(TEAM_STATS)}")
    print(f"Venues: {len(VENUE_STATS)}")
    print(f"Player battles: {len(BATTLES)}")
    print("=" * 60)


# ============================================================
# EXISTING API
# ============================================================

@app.route("/api/health", methods=["GET"])
def health():

    return jsonify({
        "status": "healthy",
        "service": "IPL Coach Recommendation Backend",
        "records_loaded": len(COACH_RECORDS),
        "players_loaded": len(PLAYER_STATS),
        "matches_loaded": len(MATCHES)
    })


@app.route("/api/records", methods=["GET"])
def records():

    return jsonify({
        "status": "success",
        "count": len(COACH_RECORDS)
    })


@app.route("/api/coaching-recommendations", methods=["GET"])
def coaching_recommendations():

    return jsonify({
        "status": "success",
        "count": len(COACH_RECORDS),
        "data": COACH_RECORDS
    })


@app.route("/api/coach-recommendation", methods=["GET"])
def coach_recommendation():

    venue = request.args.get("venue", "").strip()
    team_name = request.args.get("team", "").strip()
    opponent = request.args.get("opponent", "").strip()

    if not venue or not team_name or not opponent:

        return jsonify({
            "status": "error",
            "message": "venue, team and opponent are required"
        }), 400

    record = next(
        (
            item for item in COACH_RECORDS
            if item["venue"].lower() == venue.lower()
            and item["team"].lower() == team_name.lower()
            and item["opponent"].lower() == opponent.lower()
        ),
        None
    )

    fallback = False

    if record is None:

        matching = [
            item for item in COACH_RECORDS
            if item["team"].lower() == team_name.lower()
            and item["opponent"].lower() == opponent.lower()
        ]

        if matching:
            record = max(
                matching,
                key=lambda item: item["matches"]
            )
            fallback = True

    if record is None:

        matching = [
            item for item in COACH_RECORDS
            if item["team"].lower() == team_name.lower()
        ]

        if matching:
            record = max(
                matching,
                key=lambda item: item["matches"]
            )
            fallback = True

    if record is None:

        return jsonify({
            "status": "error",
            "message": "No data available for this team"
        }), 404

    return jsonify({
        "status": "success",
        "data": record,
        "fallback": fallback
    })


# ============================================================
# PLAYER RANKINGS
# ============================================================

@app.route("/api/player-rankings", methods=["GET"])
def player_rankings():

    players = list(PLAYER_STATS.values())

    sort_by = request.args.get("sort", "runs")

    allowed = [
        "runs",
        "strikeRate",
        "wickets",
        "sixes",
        "fours"
    ]

    if sort_by not in allowed:
        sort_by = "runs"

    players.sort(
        key=lambda x: x.get(sort_by, 0),
        reverse=True
    )

    limit = safe_int(
        request.args.get("limit", 20),
        20
    )

    return jsonify({
        "status": "success",
        "count": len(players),
        "data": players[:limit]
    })


# ============================================================
# INDIVIDUAL PLAYER
# ============================================================

@app.route("/api/player/<path:player_name>", methods=["GET"])
def player_details(player_name):

    player_name = player_name.strip()

    stats = PLAYER_STATS.get(player_name)

    if stats is None:

        matches = [
            name for name in PLAYER_STATS
            if name.lower() == player_name.lower()
        ]

        if matches:
            stats = PLAYER_STATS[matches[0]]

    if stats is None:

        return jsonify({
            "status": "error",
            "message": "Player not found"
        }), 404

    return jsonify({
        "status": "success",
        "data": {
            **stats,
            "recentForm": PLAYER_FORM.get(
                stats["player"],
                {
                    "player": stats["player"],
                    "last5Matches": 0,
                    "recentMatches": []
                }
            )
        }
    })


# ============================================================
# TEAM PERFORMANCE
# ============================================================

@app.route("/api/team-performance", methods=["GET"])
def team_performance():

    data = list(TEAM_STATS.values())

    data.sort(
        key=lambda x: x["winPct"],
        reverse=True
    )

    return jsonify({
        "status": "success",
        "count": len(data),
        "data": data
    })


@app.route("/api/team-performance/<path:team_name>", methods=["GET"])
def team_performance_single(team_name):

    team_name = team_name.strip()

    result = None

    for name, data in TEAM_STATS.items():

        if name.lower() == team_name.lower():
            result = data
            break

    if result is None:

        return jsonify({
            "status": "error",
            "message": "Team not found"
        }), 404

    return jsonify({
        "status": "success",
        "data": result
    })


# ============================================================
# HEAD TO HEAD
# ============================================================

@app.route("/api/head-to-head", methods=["GET"])
def head_to_head():

    team_a = request.args.get("team", "").strip()
    team_b = request.args.get("opponent", "").strip()

    if not team_a or not team_b:

        return jsonify({
            "status": "error",
            "message": "team and opponent are required"
        }), 400

    matches = 0
    wins_a = 0
    wins_b = 0

    for match in MATCHES:

        t1 = match.get("team1", "")
        t2 = match.get("team2", "")
        winner = match.get("winner", "")

        if (
            {t1.lower(), t2.lower()}
            == {team_a.lower(), team_b.lower()}
        ):

            matches += 1

            if winner.lower() == team_a.lower():
                wins_a += 1

            elif winner.lower() == team_b.lower():
                wins_b += 1

    return jsonify({
        "status": "success",
        "data": {
            "team": team_a,
            "opponent": team_b,
            "matches": matches,
            "teamWins": wins_a,
            "opponentWins": wins_b,
            "draws": matches - wins_a - wins_b
        }
    })


# ============================================================
# VENUE INTELLIGENCE
# ============================================================

@app.route("/api/venue-intelligence", methods=["GET"])
def venue_intelligence():

    venue_name = request.args.get("venue", "").strip()
    team_name = request.args.get("team", "").strip()

    if not venue_name:

        return jsonify({
            "status": "error",
            "message": "venue is required"
        }), 400

    venue_data = None

    for name, data in VENUE_STATS.items():

        if name.lower() == venue_name.lower():
            venue_data = data
            break

    if venue_data is None:

        return jsonify({
            "status": "error",
            "message": "Venue not found"
        }), 404

    response = dict(venue_data)

    if team_name:

        team_data = None

        for name, data in venue_data["teams"].items():

            if name.lower() == team_name.lower():
                team_data = data
                break

        response["selectedTeam"] = team_name
        response["teamPerformance"] = team_data

    return jsonify({
        "status": "success",
        "data": response
    })


# ============================================================
# PLAYER VS PLAYER
# ============================================================

@app.route("/api/player-vs-player", methods=["GET"])
def player_vs_player():

    batter = request.args.get("batter", "").strip()
    bowler = request.args.get("bowler", "").strip()

    if not batter or not bowler:

        return jsonify({
            "status": "error",
            "message": "batter and bowler are required"
        }), 400

    result = None

    for (b, bw), data in BATTLES.items():

        if (
            b.lower() == batter.lower()
            and bw.lower() == bowler.lower()
        ):
            result = data
            break

    if result is None:

        return jsonify({
            "status": "error",
            "message": "No player-vs-player data found"
        }), 404

    return jsonify({
        "status": "success",
        "data": result
    })


# ============================================================
# ALL PLAYER BATTLES FOR A BATTER
# ============================================================

@app.route("/api/player-battles/<path:batter_name>", methods=["GET"])
def player_battles(batter_name):

    results = []

    for (batter, bowler), data in BATTLES.items():

        if batter.lower() == batter_name.lower():

            results.append(data)

    results.sort(
        key=lambda x: (
            x["wickets"],
            x["balls"]
        ),
        reverse=True
    )

    return jsonify({
        "status": "success",
        "batter": batter_name,
        "count": len(results),
        "data": results
    })


# ============================================================
# RECENT FORM
# ============================================================

@app.route("/api/recent-form", methods=["GET"])
def recent_form():

    player_name = request.args.get("player", "").strip()

    if player_name:

        for name, data in PLAYER_FORM.items():

            if name.lower() == player_name.lower():

                return jsonify({
                    "status": "success",
                    "data": data
                })

        return jsonify({
            "status": "error",
            "message": "Player not found"
        }), 404

    # Return top players by overall runs
    players = []

    for name, stats in PLAYER_STATS.items():

        players.append({
            "player": name,
            "runs": stats["runs"],
            "strikeRate": stats["strikeRate"],
            "wickets": stats["wickets"],
            "matches": stats["matches"]
        })

    players.sort(
        key=lambda x: x["runs"],
        reverse=True
    )

    return jsonify({
        "status": "success",
        "count": len(players),
        "data": players[:20]
    })


# ============================================================
# DASHBOARD SUMMARY
# ============================================================

@app.route("/api/dashboard", methods=["GET"])
def dashboard():

    top_batsmen = sorted(
        PLAYER_STATS.values(),
        key=lambda x: x["runs"],
        reverse=True
    )[:5]

    top_bowlers = sorted(
        PLAYER_STATS.values(),
        key=lambda x: x["wickets"],
        reverse=True
    )[:5]

    top_teams = sorted(
        TEAM_STATS.values(),
        key=lambda x: x["winPct"],
        reverse=True
    )[:5]

    return jsonify({
        "status": "success",

        "summary": {
            "matches": len(MATCHES),
            "deliveries": len(DELIVERIES),
            "players": len(PLAYER_STATS),
            "teams": len(TEAM_STATS),
            "venues": len(VENUE_STATS),
            "playerBattles": len(BATTLES),
            "coachRecords": len(COACH_RECORDS)
        },

        "topBatsmen": top_batsmen,
        "topBowlers": top_bowlers,
        "topTeams": top_teams
    })


# ============================================================
# STARTUP
# ============================================================
@app.route("/api/team-players/<path:team_name>", methods=["GET"])
def team_players(team_name):
    try:
        players = {}

        for d in DELIVERIES:
            batting_team = str(d.get("batting_team", "")).strip()
            bowling_team = str(d.get("bowling_team", "")).strip()
            match_id = str(d.get("match_id", "")).strip()

            # Batting statistics
            if batting_team == team_name:
                name = str(d.get("batter", "")).strip()

                if name:
                    if name not in players:
                        players[name] = {
                            "player": name,
                            "runs": 0,
                            "balls": 0,
                            "fours": 0,
                            "sixes": 0,
                            "wickets": 0,
                            "matches": set(),
                            "bowlingBalls": 0,
                            "runsConceded": 0
                        }

                    p = players[name]
                    p["matches"].add(match_id)

                    runs = int(d.get("batsman_runs", 0) or 0)
                    p["runs"] += runs
                    p["balls"] += 1

                    if runs == 4:
                        p["fours"] += 1
                    elif runs == 6:
                        p["sixes"] += 1

            # Bowling statistics
            if bowling_team == team_name:
                name = str(d.get("bowler", "")).strip()

                if name:
                    if name not in players:
                        players[name] = {
                            "player": name,
                            "runs": 0,
                            "balls": 0,
                            "fours": 0,
                            "sixes": 0,
                            "wickets": 0,
                            "matches": set(),
                            "bowlingBalls": 0,
                            "runsConceded": 0
                        }

                    p = players[name]
                    p["matches"].add(match_id)
                    p["bowlingBalls"] += 1

                    total_runs = int(d.get("total_runs", 0) or 0)
                    extras = str(d.get("extras_type", "")).lower()

                    if extras not in ["byes", "legbyes"]:
                        p["runsConceded"] += total_runs

                    dismissal = str(
                        d.get("dismissal_kind", "")
                    ).lower()

                    if d.get("is_wicket") in [1, "1", True]:
                        if dismissal not in [
                            "run out",
                            "retired hurt",
                            "retired out",
                            "obstructing the field"
                        ]:
                            p["wickets"] += 1

        result = []

        for p in players.values():
            p["matches"] = len(p["matches"])

            p["strikeRate"] = round(
                (p["runs"] / p["balls"]) * 100, 2
            ) if p["balls"] else 0

            p["economy"] = round(
                (p["runsConceded"] / p["bowlingBalls"]) * 6, 2
            ) if p["bowlingBalls"] else 0

            result.append(p)

        result.sort(
            key=lambda x: (x["runs"], x["wickets"]),
            reverse=True
        )

        return {
            "status": "success",
            "team": team_name,
            "count": len(result),
            "players": result
        }

    except Exception as e:
        return {
            "status": "error",
            "message": str(e)
        }, 500
if __name__ == "__main__":

    print("=" * 60)
    print("IPL COACH RECOMMENDATION BACKEND")
    print("=" * 60)

    print(f"Coach records loaded: {len(COACH_RECORDS)}")

    load_ipl_data()
    build_analytics()

    print("")
    print("Server: http://localhost:5000")
    print("")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )
