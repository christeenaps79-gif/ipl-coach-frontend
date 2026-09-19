import json
import os
from typing import Any

from flask import Flask, jsonify, request
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()

MODEL = os.environ.get(
    "GEMINI_MODEL",
    "gemini-2.5-flash",
)


def clean_text(value: Any) -> str:
    if value is None:
        return ""

    return str(value).strip()


def deterministic_inference(
    module: str,
    data: dict[str, Any],
) -> dict[str, str]:
    """
    Safe fallback used when Gemini is unavailable.

    This service NEVER calculates the cricket statistics.
    It only interprets values already calculated by the
    existing analytics backend.
    """

    if module == "player-analysis":
        player = clean_text(data.get("player"))
        runs = data.get("runs", 0)
        strike_rate = data.get("strikeRate", 0)
        matches = data.get("matches", 0)

        return {
            "meaning": (
                f"{player} has {runs} recorded runs across "
                f"{matches} returned matches, with a historical "
                f"strike rate of {strike_rate}."
            ),
            "suggestion": (
                "Use this historical record as a player-role "
                "reference and compare it with opposition, "
                "phase and current form before selection."
            ),
            "limitation": (
                "This is an aggregate historical record and "
                "does not establish current match form."
            ),
        }

    if module == "team-analysis":
        team = clean_text(data.get("team"))
        wins = data.get("wins", 0)
        matches = data.get("matches", 0)
        win_pct = data.get("winPct", 0)

        return {
            "meaning": (
                f"{team} has {wins} wins from {matches} "
                f"returned matches, producing a historical "
                f"win rate of {win_pct}%."
            ),
            "suggestion": (
                "Use this as the team's historical baseline. "
                "Combine it with opponent, venue and player "
                "evidence for a match-specific plan."
            ),
            "limitation": (
                "Historical team performance does not account "
                "for current squad composition or current form."
            ),
        }

    if module == "head-to-head":
        team = clean_text(data.get("team"))
        opponent = clean_text(data.get("opponent"))
        team_wins = data.get("teamWins", 0)
        opponent_wins = data.get("opponentWins", 0)
        matches = data.get("matches", 0)

        if team_wins == opponent_wins:
            meaning = (
                f"The returned matchup is balanced, with "
                f"{team_wins} wins for {team} and "
                f"{opponent_wins} wins for {opponent} "
                f"across {matches} matches."
            )
        elif team_wins > opponent_wins:
            meaning = (
                f"{team} has more historical wins in the "
                f"returned matchup: {team_wins} versus "
                f"{opponent_wins} for {opponent}."
            )
        else:
            meaning = (
                f"{opponent} has more historical wins in the "
                f"returned matchup: {opponent_wins} versus "
                f"{team_wins} for {team}."
            )

        return {
            "meaning": meaning,
            "suggestion": (
                "Use the historical matchup as preparation "
                "context and combine it with venue and "
                "player-battle evidence."
            ),
            "limitation": (
                "A historical matchup does not guarantee the "
                "same result in a future match."
            ),
        }

    if module == "venue-analysis":
        venue = clean_text(data.get("venue"))
        matches = data.get("matches", 0)

        return {
            "meaning": (
                f"The returned venue record contains "
                f"{matches} historical matches for {venue}."
            ),
            "suggestion": (
                "Compare the selected team's venue record "
                "with the opponent's venue record before "
                "using venue history in planning."
            ),
            "limitation": (
                "Small venue samples can produce unstable "
                "signals and should be treated cautiously."
            ),
        }

    if module == "player-battle":
        batter = clean_text(data.get("batter"))
        bowler = clean_text(data.get("bowler"))
        balls = data.get("balls", 0)
        strike_rate = data.get("strikeRate", 0)
        wickets = data.get("wickets", 0)

        return {
            "meaning": (
                f"The returned {batter} versus {bowler} "
                f"sample contains {balls} balls, with a "
                f"strike rate of {strike_rate} and "
                f"{wickets} recorded dismissals."
            ),
            "suggestion": (
                "Use this matchup evidence to identify "
                "possible tactical pressure points, then "
                "validate it against current form and match phase."
            ),
            "limitation": (
                "Small batter-bowler samples can exaggerate "
                "historical matchup patterns."
            ),
        }

    if module == "coach-calculation":
        final_score = data.get("finalScore", 0)
        decision = clean_text(
            data.get("finalDecision")
        )

        return {
            "meaning": (
                f"The backend returned a final score of "
                f"{final_score} with decision classification "
                f"{decision or 'not specified'}."
            ),
            "suggestion": (
                "Inspect performance, strategy and toss "
                "components separately before using the "
                "combined result in a match plan."
            ),
            "limitation": (
                "The calculation is based on historical "
                "evidence and may contain low-sample records."
            ),
        }

    return {
        "meaning": (
            "The analytical service returned a calculation "
            "that can be interpreted from its supplied evidence."
        ),
        "suggestion": (
            "Use the returned calculation together with the "
            "module-specific evidence before making a decision."
        ),
        "limitation": (
            "Interpretation is limited to the data supplied "
            "by the analytical service."
        ),
    }


def gemini_inference(
    module: str,
    data: dict[str, Any],
) -> dict[str, str] | None:
    """
    Optional Gemini layer.

    Gemini receives already-calculated evidence.
    It is NOT allowed to invent or recalculate statistics.
    """

    if not GEMINI_API_KEY:
        return None

    try:
        from google import genai

        client = genai.Client(
            api_key=GEMINI_API_KEY
        )

        prompt = f"""
You are a professional cricket performance analyst
working inside a cricket coaching management system.

Module:
{module}

The following JSON contains statistics already calculated
by the analytics backend:

{json.dumps(data, ensure_ascii=False, indent=2)}

Your job is ONLY to interpret these supplied values.

Rules:
1. Do not invent statistics.
2. Do not change supplied numbers.
3. Do not calculate new unsupported facts.
4. Do not claim certainty from small samples.
5. Do not use hype or marketing language.
6. Do not use phrases like "AI-powered", "revolutionary",
   "crushing advantage", "game changer", etc.
7. Write like a professional cricket analyst preparing
   information for coaching staff.
8. Keep the interpretation concise.
9. Clearly distinguish historical evidence from current
   match conditions.
10. Return exactly these three fields:
    meaning
    suggestion
    limitation

meaning:
Explain what the supplied calculation indicates.

suggestion:
Give a practical coaching/staff suggestion that follows
from the supplied evidence.

limitation:
State the most important sample-size or data limitation.
"""

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt,
        )

        text = clean_text(
            getattr(response, "text", "")
        )

        if not text:
            return None

        # Attempt to parse JSON if Gemini returned JSON.
        try:
            parsed = json.loads(text)

            if (
                isinstance(parsed, dict)
                and parsed.get("meaning")
                and parsed.get("suggestion")
            ):
                return {
                    "meaning": clean_text(
                        parsed.get("meaning")
                    ),
                    "suggestion": clean_text(
                        parsed.get("suggestion")
                    ),
                    "limitation": clean_text(
                        parsed.get("limitation")
                    ),
                }
        except Exception:
            pass

        # If the model returned normal text instead of JSON,
        # do not try to guess which sentences belong to which
        # field. Fall back safely.
        return None

    except Exception as exc:
        print(
            f"Gemini inference unavailable: {exc}"
        )
        return None


@app.get("/api/health")
def health():
    return jsonify(
        {
            "status": "healthy",
            "service": "STUMPS inference service",
            "gemini_enabled": bool(GEMINI_API_KEY),
            "model": MODEL,
        }
    )


@app.post("/api/inference")
def inference():
    payload = request.get_json(
        silent=True
    ) or {}

    module = clean_text(
        payload.get("module")
    )

    data = payload.get("data")

    if not module:
        return jsonify(
            {
                "status": "error",
                "message": "module is required",
            }
        ), 400

    if not isinstance(data, dict):
        return jsonify(
            {
                "status": "error",
                "message": "data must be a JSON object",
            }
        ), 400

    fallback = deterministic_inference(
        module,
        data,
    )

    generated = gemini_inference(
        module,
        data,
    )

    result = generated or fallback

    return jsonify(
        {
            "status": "success",
            "inference": result,
            "generated": generated is not None,
            "module": module,
        }
    )


if __name__ == "__main__":
    print("=" * 60)
    print("STUMPS INFERENCE SERVICE")
    print("=" * 60)
    print(
        f"Gemini enabled: {bool(GEMINI_API_KEY)}"
    )
    print(f"Model: {MODEL}")
    print("Server: http://localhost:5001")
    print("=" * 60)

    app.run(
        host="0.0.0.0",
        port=5001,
        debug=False,
    )
