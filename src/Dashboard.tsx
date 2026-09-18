import { useMemo, useState } from 'react'
import CircuitBackground from './components/CircuitBackground'
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  CheckCircle2,
  ChevronDown,
  CircleGauge,
  Database,
  RefreshCw,
  ShieldCheck,
  Target,
  Trophy,
  Zap,
} from 'lucide-react'

import {
  getCoachRecommendation,
  type CoachRecommendationRecord,
} from './api'

const TEAMS = [
  'Chennai Super Kings',
  'Delhi Capitals',
  'Mumbai Indians',
  'Kolkata Knight Riders',
  'Royal Challengers Bengaluru',
  'Rajasthan Royals',
  'Punjab Kings',
  'Sunrisers Hyderabad',
  'Gujarat Titans',
  'Lucknow Super Giants',
]

const VENUES = [
  'Arun Jaitley Stadium',
  'M Chinnaswamy Stadium',
  'Wankhede Stadium',
  'MA Chidambaram Stadium',
  'Eden Gardens',
  'Rajiv Gandhi International Stadium',
]

function AppBadge({
  children,
  type = 'cyan',
}: {
  children: React.ReactNode
  type?: 'cyan' | 'green' | 'amber' | 'red'
}) {
  return <span className={`badge badge-${type}`}>{children}</span>
}

function Metric({
  label,
  value,
  onClick,
}: {
  label: string
  value: string | number
  onClick?: () => void
}) {
  return (
    <button
      className={`metric-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      type="button"
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </button>
  )
}

function Dashboard() {
  const [venue, setVenue] = useState('Arun Jaitley Stadium')
  const [team, setTeam] = useState('Chennai Super Kings')
  const [opponent, setOpponent] = useState('Delhi Capitals')

  const [record, setRecord] =
    useState<CoachRecommendationRecord | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState('')
  const [calcStage, setCalcStage] = useState(
    'INITIALIZING COACH ENGINE',
  )

  const loadRecommendation = async () => {
    setShowResults(false)
    setLoading(true)
    setError('')
    setRecord(null)

    const stages = [
      'INGESTING VENUE MATRICES...',
      'INTERSECTING OPPONENT DATA...',
      'CALCULATING PERFORMANCE SCORE...',
      'APPLYING TOSS CONVERSION...',
      'EVALUATING BATTING STRATEGY...',
      'RESOLVING FINAL DECISION...',
    ]

    let stage = 0
    setCalcStage(stages[stage])

    const stageTimer = window.setInterval(() => {
      stage += 1

      if (stage < stages.length) {
        setCalcStage(stages[stage])
      }
    }, 500)

    try {
      const result = await getCoachRecommendation(
        venue,
        team,
        opponent,
      )

      setRecord(result)

      window.setTimeout(() => {
        setShowResults(true)
      }, 350)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to connect to the backend.',
      )
    } finally {
      window.clearInterval(stageTimer)
      setLoading(false)
    }
  }

  const decisionClass = useMemo(() => {
    if (!record) return 'balanced'

    return record.finalDecision
      .toLowerCase()
      .replace('_', '-')
  }, [record])

  const decisionTitle = useMemo(() => {
    if (!record) return 'TACTICAL ANALYSIS'

    switch (record.finalDecision) {
      case 'STRONG_POSITIVE':
        return 'CRUSHING TACTICAL ADVANTAGE'

      case 'POSITIVE':
        return 'FAVORABLE MATCHUP BIAS'

      case 'BALANCED':
        return 'NEUTRAL / BALANCED ENGAGEMENT'

      case 'NEGATIVE':
        return 'RESISTANCE / ADVERSE CONDITIONS'

      case 'STRONG_NEGATIVE':
        return 'CRITICAL DEFICIT / HEAVY UNDERDOG'

      default:
        return 'TACTICAL ANALYSIS'
    }
  }, [record])

  return (
    <div className="app-shell">
      <CircuitBackground />

      <header className="coach-hud">
        <div className="hud-brand">
          <div className="hud-pulse" />

          <div>
            <h1>STUMPS // COACH OS</h1>
            <p>IPL PERFORMANCE & DECISION INTELLIGENCE</p>
          </div>
        </div>

        <div className="hud-status">
          <div>
            ENGINE:
            <strong> v4.1_HYBRID</strong>
          </div>

          <div>
            DATASET:
            <strong> 1188 RECORDS</strong>
          </div>

          <div className="system-online">
            SYSTEM STATUS: OPERATIONAL
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="control-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">
                MATCH CONFIGURATION
              </span>
              <h2>Coach Recommendation Engine</h2>
            </div>

            <button
              className="refresh-button"
              onClick={loadRecommendation}
              disabled={loading}
              type="button"
            >
              <RefreshCw
                size={15}
                className={loading ? 'spin' : ''}
              />

              {loading ? 'ANALYZING' : 'RUN ANALYSIS'}
            </button>
          </div>

          <div className="selectors">
            <label>
              <span>VENUE</span>

              <div className="select-wrap">
                <select
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                >
                  {VENUES.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <ChevronDown size={15} />
              </div>
            </label>

            <label>
              <span>TEAM</span>

              <div className="select-wrap">
                <select
                  value={team}
                  onChange={(e) => setTeam(e.target.value)}
                >
                  {TEAMS.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <ChevronDown size={15} />
              </div>
            </label>

            <label>
              <span>OPPONENT</span>

              <div className="select-wrap">
                <select
                  value={opponent}
                  onChange={(e) =>
                    setOpponent(e.target.value)
                  }
                >
                  {TEAMS.filter(
                    (item) => item !== team,
                  ).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <ChevronDown size={15} />
              </div>
            </label>
          </div>
        </section>

        {error && (
          <section className="error-panel">
            <AlertTriangle size={20} />

            <div>
              <strong>BACKEND CONNECTION ERROR</strong>
              <p>{error}</p>
            </div>
          </section>
        )}

        {loading && (
          <section className="calculation-hud">
            <div className="calculation-core">
              <div className="core-ring ring-one" />
              <div className="core-ring ring-two" />
              <div className="core-ring ring-three" />

              <div className="core-center">
                <BrainCircuit size={34} />
              </div>
            </div>

            <div className="calculation-text">
              <span>COACH OS // DECISION ENGINE</span>

              <strong>{calcStage}</strong>

              <small>
                Processing venue, matchup, toss and strategy
                evidence
              </small>
            </div>

            <div className="calculation-progress">
              <div />
            </div>
          </section>
        )}

        {record && showResults && (
          <div className="results-transition">
            <section
              className={`decision-panel ${decisionClass}`}
            >
              <div className="decision-main">
                <div className="directive-label">
                  <Zap size={14} />
                  ULTIMATE TACTICAL DIRECTIVE
                </div>

                <h2>{decisionTitle}</h2>

                <p className="target-line">
                  <strong>{record.team}</strong>
                  <span>vs</span>
                  <strong>{record.opponent}</strong>
                </p>

                <p className="venue-line">
                  <Target size={14} />
                  {record.venue}
                </p>
              </div>

              <div className="score-box">
                <span>FINAL SCORE</span>

                <strong>
                  {record.finalScore.toFixed(2)}
                </strong>

                <div className="badges">
                  <AppBadge
                    type={
                      record.finalDecision.includes(
                        'POSITIVE',
                      )
                        ? 'green'
                        : record.finalDecision ===
                            'BALANCED'
                          ? 'amber'
                          : 'red'
                    }
                  >
                    {record.finalDecision}
                  </AppBadge>

                  <AppBadge type="cyan">
                    {record.decisionConfidence}
                  </AppBadge>
                </div>
              </div>
            </section>

            <section className="metric-grid">
              <Metric
                label="Performance Score"
                value={record.performanceScore.toFixed(2)}
              />

              <Metric
                label="Matches"
                value={record.matches}
              />

              <Metric
                label="Wins"
                value={record.wins}
              />

              <Metric
                label="Losses"
                value={record.losses}
              />

              <Metric
                label="Venue Win %"
                value={`${record.venueWinPct.toFixed(
                  2,
                )}%`}
              />

              <Metric
                label="Overall Win %"
                value={`${record.overallWinPct.toFixed(
                  2,
                )}%`}
              />
            </section>

            <section className="analysis-grid">
              <div className="panel">
                <div className="panel-title">
                  <BarChart3 size={17} />
                  VENUE & PERFORMANCE
                </div>

                <div className="progress-row">
                  <div>
                    <span>Venue Win Rate</span>

                    <strong>
                      {record.venueWinPct.toFixed(2)}%
                    </strong>
                  </div>

                  <div className="progress">
                    <div
                      style={{
                        width: `${Math.min(
                          record.venueWinPct,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="progress-row">
                  <div>
                    <span>Overall Win Rate</span>

                    <strong>
                      {record.overallWinPct.toFixed(2)}%
                    </strong>
                  </div>

                  <div className="progress">
                    <div
                      style={{
                        width: `${Math.min(
                          record.overallWinPct,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="data-list">
                  <div>
                    <span>Venue confidence</span>
                    <strong>
                      {record.venueConfidence}
                    </strong>
                  </div>

                  <div>
                    <span>Overall confidence</span>
                    <strong>
                      {record.overallConfidence}
                    </strong>
                  </div>

                  <div>
                    <span>Recommendation</span>
                    <strong>
                      {record.recommendation}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-title">
                  <CircleGauge size={17} />
                  STRATEGY ENGINE
                </div>

                <div className="strategy-grid">
                  <div>
                    <span>Bat First</span>

                    <strong>
                      {record.batFirst}
                    </strong>

                    <small>
                      {record.batFirstWinPct.toFixed(2)}%
                      win rate
                    </small>
                  </div>

                  <div>
                    <span>Field First</span>

                    <strong>
                      {record.fieldFirst}
                    </strong>

                    <small>
                      {record.fieldFirstWinPct.toFixed(
                        2,
                      )}
                      % win rate
                    </small>
                  </div>
                </div>

                <div className="data-list">
                  <div>
                    <span>Strategy signal</span>
                    <strong>
                      {record.strategySignal}
                    </strong>
                  </div>

                  <div>
                    <span>Strategy bonus</span>
                    <strong>
                      +{record.strategyBonus.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Recommendation</span>
                    <strong>
                      {record.strategyRecommendation}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-title">
                  <Trophy size={17} />
                  TOSS INTELLIGENCE
                </div>

                <div className="strategy-grid">
                  <div>
                    <span>Toss Wins</span>

                    <strong>
                      {record.tossWins}
                    </strong>
                  </div>

                  <div>
                    <span>Conversion</span>

                    <strong>
                      {record.tossConversionPct.toFixed(
                        2,
                      )}
                      %
                    </strong>
                  </div>
                </div>

                <div className="data-list">
                  <div>
                    <span>Toss losses</span>
                    <strong>
                      {record.tossLosses}
                    </strong>
                  </div>

                  <div>
                    <span>Toss signal</span>
                    <strong>
                      {record.tossSignal}
                    </strong>
                  </div>

                  <div>
                    <span>Recommendation</span>
                    <strong>
                      {record.tossRecommendation}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="panel">
                <div className="panel-title">
                  <ShieldCheck size={17} />
                  DECISION AUDIT
                </div>

                <div className="audit-list">
                  <div>
                    <span>Performance baseline</span>

                    <strong>
                      {record.performanceScore.toFixed(
                        2,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Strategy modifier</span>

                    <strong>
                      +{record.strategyBonus.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Toss modifier</span>

                    <strong>
                      +{record.tossBonus.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Final score</span>

                    <strong>
                      {record.finalScore.toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    <span>Decision confidence</span>

                    <strong>
                      {record.decisionConfidence}
                    </strong>
                  </div>

                  <div>
                    <span>Venue confidence</span>

                    <strong>
                      {record.venueConfidence}
                    </strong>
                  </div>
                </div>
              </div>
            </section>

            <section className="recommendation-panel">
              <div className="recommendation-icon">
                <BrainCircuit size={22} />
              </div>

              <div>
                <span>COACHING RECOMMENDATION</span>

                <h3>{record.recommendation}</h3>

                <p>
                  The engine combines venue history,
                  overall matchup performance, toss
                  conversion and bat/field strategy
                  evidence. Low-sample evidence is
                  explicitly reflected in confidence.
                </p>
              </div>
            </section>

            <section className="system-footer">
              <div>
                <Database size={14} />
                1,188 recommendation records loaded
              </div>

              <div>
                <CheckCircle2 size={14} />
                Decision Engine Active
              </div>

              <div>
                <Activity size={14} />
                API: localhost:5000
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard