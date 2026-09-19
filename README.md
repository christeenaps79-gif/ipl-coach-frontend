# STUMPS // COACH OS

## IPL Cricket Analytics & Decision-Support System

**STUMPS // COACH OS** is a cricket analytics and decision-support system designed for IPL performance analysis.

The system combines a React-based operational interface with a Flask analytics API, Hadoop/MapReduce processing, historical IPL data, statistical calculations, player matchups, venue intelligence, recent-form analysis, and rule-based recommendation logic.

The goal is to turn historical IPL performance data into structured insights that can support cricket decision-making.

---

## Live Demo

**Frontend:**
https://ipl-coach-frontend.vercel.app/

**GitHub:**
https://github.com/christeenaps79-gif/ipl-coach-frontend

---

## Key Features

### Player Analysis

* Player performance statistics
* Batting and bowling metrics
* Recent-form analysis
* Historical performance context
* Player-specific venue performance

### Team Analysis

* Team performance statistics
* Team-vs-opponent analysis
* Historical win-performance context
* Team and venue intelligence

### Matchup Analysis

* Batter vs bowler battles
* Player-vs-player analysis
* Historical matchup statistics
* Runs, balls, wickets and other performance metrics

### Venue Intelligence

* Venue-based performance analysis
* Player performance at specific venues
* Team/opponent/venue combinations
* Venue-specific confidence context

### Coach Calculation

* Data-driven recommendations
* Rule-based decision logic
* Confidence-aware recommendations
* Strategy and matchup context
* Historical sample-size consideration

---

## System Architecture

```text
                    STUMPS // COACH OS
                           |
                           v
              React + TypeScript + Vite
                           |
                           v
                    Flask REST API
                           |
             +-------------+-------------+
             |                           |
             v                           v
      Analytics Engine          Recommendation Engine
             |                           |
             +-------------+-------------+
                           |
                           v
                 Processed IPL Data
                           |
                           v
                 Hadoop / MapReduce
                           |
                           v
                 Historical IPL Data
```

---

## Technology Stack

### Frontend

* React
* TypeScript
* Vite
* CSS
* Lucide React
* React-based data visualization/interface components

### Backend

* Python
* Flask
* Flask-CORS
* REST API
* Statistical and rule-based analytics

### Big Data Processing

* Apache Hadoop
* Hadoop MapReduce
* Java MapReduce programs
* Python data-processing scripts
* HDFS

### Data Processing

The backend processes historical IPL match and delivery data to calculate metrics including:

* Runs
* Balls faced
* Fours
* Sixes
* Wickets
* Runs conceded
* Economy rate
* Strike rate
* Win percentage
* Recent form
* Batter-bowler matchup performance
* Venue performance
* Team/opponent performance

---

## Project Structure

```text
ipl-coach-frontend/
│
├── backend/
│   ├── app.py
│   ├── inference_service.py
│   ├── final_decision_engine.py
│   ├── build_coach_recommendations.py
│   ├── add_confidence.py
│   ├── add_strategy_recommendations.py
│   ├── add_venue_confidence.py
│   │
│   ├── coach_recommendations_final.tsv
│   ├── normalized_venue_team_opponent.tsv
│   ├── team_opponent_overall.tsv
│   └── team_opponent_overall_confidence.tsv
│
├── hadoop/
│   ├── TeamRuns.java
│   ├── TopBatsmen.java
│   ├── VenueTeamOpponent.java
│   ├── batting_mapper.py
│   ├── batting_reducer.py
│   ├── aggregate_normalized.py
│   ├── aggregate_team_opponent.py
│   ├── normalize_venue_output.py
│   └── team_aliases.txt
│
├── src/
│   ├── App.tsx
│   ├── Dashboard.tsx
│   ├── api.ts
│   ├── components/
│   └── ...
│
├── public/
│
├── package.json
├── vite.config.ts
├── vercel.json
└── README.md
```

---

## Backend API

The Flask backend exposes endpoints for different analytics operations.

### Health

```text
GET /api/health
```

### Records

```text
GET /api/records
```

### Coaching Recommendations

```text
GET /api/coaching-recommendations
GET /api/coach-recommendation
```

### Player Analytics

```text
GET /api/player-rankings
GET /api/player/<player_name>
GET /api/team-players/<team_name>
```

### Team Analytics

```text
GET /api/team-performance
GET /api/team-performance/<team_name>
```

### Matchups

```text
GET /api/head-to-head
GET /api/player-vs-player
GET /api/player-battles/<batter_name>
```

### Venue and Form

```text
GET /api/venue-intelligence
GET /api/recent-form
```

### Dashboard

```text
GET /api/dashboard
```

---

## Data Processing Pipeline

The system follows a multi-stage processing workflow.

```text
IPL Historical Data
        |
        v
      HDFS
        |
        v
 Hadoop / MapReduce Processing
        |
        v
Aggregated Performance Data
        |
        v
Venue / Team / Opponent Processing
        |
        v
Confidence & Strategy Processing
        |
        v
Coach Recommendation Dataset
        |
        v
Flask Analytics API
        |
        v
React Dashboard
```

The processed recommendation dataset used by the backend is:

```text
backend/coach_recommendations_final.tsv
```

---

## Hadoop / MapReduce Components

The repository contains Java and Python processing programs used in the IPL analytics pipeline.

### Java MapReduce

```text
TeamRuns.java
TopBatsmen.java
VenueTeamOpponent.java
```

These programs support large-scale IPL data processing and aggregation.

### Python Processing

```text
batting_mapper.py
batting_reducer.py
aggregate_normalized.py
aggregate_team_opponent.py
normalize_venue_output.py
```

Additional processing scripts generate confidence and recommendation information.

---

## HDFS Data

The system works with historical IPL match and delivery data stored in HDFS.

The main HDFS paths used by the backend are:

```text
/ipl/matches.csv
/ipl/deliveries.csv
```

The raw IPL datasets are **not included in this GitHub repository**.

This keeps the repository lightweight and avoids duplicating the large raw datasets.

---

## Running the Frontend

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend can then be accessed through the local development URL shown by Vite.

---

## Running the Backend

The Flask backend is located at:

```text
backend/app.py
```

The backend expects the required processed TSV files to be available in its working directory and uses HDFS IPL data for its analytics pipeline.

The Flask service runs on:

```text
http://localhost:5000
```

---

## Important Data Note

The repository contains selected processed datasets required by the current backend.

It does **not** contain:

* Raw `matches.csv`
* Raw `deliveries.csv`
* HDFS metadata
* Python virtual environments
* Compiled Java `.class` files
* Hadoop `.jar` build artifacts
* Environment variable files
* Private credentials or AWS keys

The raw IPL datasets are maintained separately from the source repository.

---

## Recommendation Pipeline

The recommendation system combines multiple forms of cricket performance context rather than relying on a single statistic.

The pipeline considers information such as:

```text
Player Performance
       +
Recent Form
       +
Venue Performance
       +
Team / Opponent Context
       +
Batter-Bowler Matchups
       +
Historical Sample Size
       +
Confidence Information
       |
       v
Coach Recommendation
```

This allows the system to present contextual recommendations rather than isolated historical statistics.

---

## Deployment

The frontend is deployed as a Vite/React application and is accessible through the live demo.

```text
Frontend
   |
   v
Vercel
   |
   v
STUMPS // COACH OS
```

The analytics backend and Hadoop processing environment are maintained separately because Hadoop/HDFS processing requires a server-side environment.

---

## Project Purpose

STUMPS // COACH OS was developed to explore how big-data processing and cricket analytics can be combined into an interactive decision-support system.

The project brings together:

* Big-data processing
* Hadoop MapReduce
* Python analytics
* Flask API development
* React frontend development
* Statistical analysis
* Cricket performance analysis
* Rule-based recommendation systems
* Data-driven decision support

---

## Repository

GitHub:

https://github.com/christeenaps79-gif/ipl-coach-frontend

Live Demo:

https://ipl-coach-frontend.vercel.app/
