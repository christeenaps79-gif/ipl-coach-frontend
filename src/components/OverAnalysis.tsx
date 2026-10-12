
import { useEffect, useMemo, useState } from "react";
import {
    getOverAnalysis,
    type OverAnalysisRecord,
} from "../api";

const panel: React.CSSProperties = {
    border: "1px solid var(--border, rgba(255,255,255,.1))",
    background: "var(--panel, #0a0e14)",
    padding: "18px",
    minWidth: 0,
};

function format(value: number, digits = 2) {
    return Number(value).toLocaleString("en-IN", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    });
}

function RunsChart({ data }: { data: OverAnalysisRecord[] }) {
    const width = 760;
    const height = 230;
    const left = 36;
    const right = 18;
    const top = 18;
    const bottom = 32;
    const max = Math.max(
        10,
        Math.ceil(Math.max(...data.map((r) => r.avg_runs), 0) / 2) * 2
    );

    const points = data.map((record, index) => {
        const x = left + (index / 19) * (width - left - right);
        const y =
            height -
            bottom -
            (record.avg_runs / max) * (height - top - bottom);
        return `${x},${y}`;
    });

    return (
        <div className="oa-chart-wrap">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                role="img"
                aria-label="Average runs scored in each over"
                className="oa-chart"
            >
                {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                    const y =
                        height - bottom - fraction * (height - top - bottom);

                    return (
                        <g key={fraction}>
                            <line
                                x1={left}
                                y1={y}
                                x2={width - right}
                                y2={y}
                                stroke="rgba(148,163,184,.15)"
                                strokeDasharray="3 5"
                            />
                            <text
                                x={left - 8}
                                y={y + 4}
                                fill="#8b949e"
                                textAnchor="end"
                                fontSize="10"
                            >
                                {format(max * fraction, 0)}
                            </text>
                        </g>
                    );
                })}

                <polyline
                    points={points.join(" ")}
                    fill="none"
                    stroke="#58a6ff"
                    strokeWidth="2.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {data.map((record, index) => {
                    const x = left + (index / 19) * (width - left - right);
                    const y =
                        height -
                        bottom -
                        (record.avg_runs / max) * (height - top - bottom);

                    return (
                        <g key={record.over}>
                            <circle cx={x} cy={y} r="3.5" fill="#58a6ff">
                                <title>
                                    Over {record.over}: {format(record.avg_runs)} average runs
                                </title>
                            </circle>
                            {(record.over === 1 ||
                                record.over % 2 === 0 ||
                                record.over === 20) && (
                                    <text
                                        x={x}
                                        y={height - 10}
                                        fill="#8b949e"
                                        textAnchor="middle"
                                        fontSize="10"
                                    >
                                        {record.over}
                                    </text>
                                )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function WicketsChart({ data }: { data: OverAnalysisRecord[] }) {
    const max = Math.max(
        0.5,
        Math.ceil(Math.max(...data.map((r) => r.avg_wickets), 0) * 2) / 2
    );

    return (
        <div className="oa-wicket-chart">
            {data.map((record) => (
                <div className="oa-wicket-column" key={record.over}>
                    <span className="oa-wicket-value">
                        {format(record.avg_wickets)}
                    </span>
                    <div className="oa-wicket-track">
                        <div
                            className="oa-wicket-bar"
                            style={{
                                height: `${Math.max(2, (record.avg_wickets / max) * 100)}%`,
                            }}
                            title={`Over ${record.over}: ${format(record.avg_wickets)} average wickets`}
                        />
                    </div>
                    <span className="oa-wicket-label">
                        {record.over % 2 === 0 || record.over === 1
                            ? record.over
                            : ""}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function OverAnalysis() {
    const [records, setRecords] = useState<OverAnalysisRecord[]>([]);
    const [teams, setTeams] = useState<string[]>([]);
    const [selectedTeam, setSelectedTeam] = useState(
        "Chennai Super Kings"
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");

            try {
                const result = await getOverAnalysis();

                if (cancelled) return;

                setRecords(result.data);
                setTeams(result.teams);

                if (!result.teams.includes(selectedTeam) && result.teams.length) {
                    setSelectedTeam(result.teams[0]);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Unable to load over-analysis data."
                    );
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void load();

        return () => {
            cancelled = true;
        };
    }, []);

    const data = useMemo(
        () =>
            records
                .filter((record) => record.team === selectedTeam)
                .sort((a, b) => a.over - b.over),
        [records, selectedTeam]
    );

    const summary = useMemo(() => {
        if (!data.length) return null;

        const totalRuns = data.reduce((sum, row) => sum + row.total_runs, 0);
        const totalWickets = data.reduce(
            (sum, row) => sum + row.total_wickets,
            0
        );
        const innings = Math.max(...data.map((row) => row.innings_count));

        return {
            innings,
            totalRuns,
            totalWickets,
            averageRuns: data.reduce((sum, row) => sum + row.avg_runs, 0),
        };
    }, [data]);

    return (
        <div className="oa-root">
            <style>{`
        .oa-root { color: var(--text, #e6edf3); }
        .oa-heading { display:flex; justify-content:space-between; align-items:flex-end; gap:16px; flex-wrap:wrap; margin-bottom:22px; }
        .oa-eyebrow { font:9px var(--mono,monospace); letter-spacing:.15em; color:#58a6ff; margin-bottom:9px; }
        .oa-title { font-size:clamp(22px,3vw,32px); font-weight:650; margin:0 0 7px; }
        .oa-subtitle { color:var(--text-muted,#8b949e); font-size:11px; line-height:1.6; margin:0; }
        .oa-select-wrap { display:flex; flex-direction:column; gap:7px; min-width:min(270px,100%); }
        .oa-select-wrap label,.oa-label { font:9px var(--mono,monospace); color:var(--text-muted,#8b949e); letter-spacing:.1em; }
        .oa-select { min-height:42px; padding:10px 12px; border:1px solid var(--border,rgba(255,255,255,.15)); background:#0d131b; color:#e6edf3; border-radius:0; font:11px var(--mono,monospace); }
        .oa-summary { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:1px; background:var(--border,rgba(255,255,255,.1)); border:1px solid var(--border,rgba(255,255,255,.1)); margin-bottom:18px; }
        .oa-stat { background:var(--panel,#0a0e14); padding:15px; min-width:0; }
        .oa-stat span { display:block; font:8px var(--mono,monospace); letter-spacing:.09em; color:var(--text-muted,#8b949e); margin-bottom:9px; }
        .oa-stat strong { font:600 clamp(18px,2vw,25px) var(--mono,monospace); overflow-wrap:anywhere; }
        .oa-stat small { display:block; margin-top:6px; color:var(--text-muted,#8b949e); font-size:9px; }
        .oa-grid { display:grid; grid-template-columns:minmax(0,1.5fr) minmax(260px,1fr); gap:18px; margin-bottom:18px; }
        .oa-panel-title { margin:0 0 5px; font-size:12px; font-weight:600; }
        .oa-panel-subtitle { margin:0 0 18px; font-size:10px; color:var(--text-muted,#8b949e); line-height:1.6; }
        .oa-chart-wrap { width:100%; overflow:hidden; }
        .oa-chart { width:100%; height:auto; display:block; overflow:visible; }
        .oa-legend { display:flex; align-items:center; gap:8px; font-size:9px; color:var(--text-muted,#8b949e); margin-top:10px; }
        .oa-legend-dot { width:7px; height:7px; background:#58a6ff; border-radius:50%; }
        .oa-wicket-chart { height:205px; display:grid; grid-template-columns:repeat(20,minmax(0,1fr)); gap:4px; align-items:end; padding-top:10px; }
        .oa-wicket-column { height:100%; min-width:0; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; gap:5px; }
        .oa-wicket-value { font:7px var(--mono,monospace); color:var(--text-muted,#8b949e); }
        .oa-wicket-track { width:100%; max-width:14px; height:145px; display:flex; align-items:flex-end; background:rgba(255,255,255,.035); }
        .oa-wicket-bar { width:100%; background:#d29922; min-height:2px; }
        .oa-wicket-label { height:10px; font:8px var(--mono,monospace); color:var(--text-muted,#8b949e); }
        .oa-table-wrap { overflow-x:auto; border:1px solid var(--border,rgba(255,255,255,.1)); }
        .oa-table { width:100%; border-collapse:collapse; font:10px var(--mono,monospace); white-space:nowrap; }
        .oa-table th { text-align:right; padding:12px 14px; background:#0d131b; color:var(--text-muted,#8b949e); font-size:8px; letter-spacing:.07em; font-weight:500; }
        .oa-table th:first-child,.oa-table td:first-child { text-align:left; }
        .oa-table td { text-align:right; padding:12px 14px; border-top:1px solid var(--border,rgba(255,255,255,.07)); }
        .oa-table tbody tr:hover { background:rgba(255,255,255,.025); }
        .oa-table td:first-child { color:#58a6ff; }
        .oa-message { padding:18px; border:1px solid var(--border,rgba(255,255,255,.1)); background:var(--panel,#0a0e14); font-size:11px; line-height:1.7; }
        .oa-error { color:#f85149; }
        .oa-footnote { margin-top:12px; font-size:9px; line-height:1.6; color:var(--text-muted,#8b949e); }
        @media(max-width:850px) { .oa-grid { grid-template-columns:1fr; } }
        @media(max-width:600px) { .oa-summary { grid-template-columns:repeat(2,minmax(0,1fr)); } .oa-stat { padding:12px; } }
      `}</style>

            <header className="oa-heading">
                <div>
                    <div className="oa-eyebrow">PIG / HADOOP ANALYTICS</div>
                    <h1 className="oa-title">Over Analysis</h1>
                    <p className="oa-subtitle">
                        Historical scoring and wicket patterns across all 20 overs.
                    </p>
                </div>

                <div className="oa-select-wrap">
                    <label htmlFor="oa-team">SELECT TEAM</label>
                    <select
                        id="oa-team"
                        className="oa-select"
                        value={selectedTeam}
                        onChange={(event) => setSelectedTeam(event.target.value)}
                        disabled={loading || teams.length === 0}
                    >
                        {teams.map((team) => (
                            <option key={team} value={team}>
                                {team}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            {loading ? (
                <div className="oa-message">Loading Pig over-analysis data…</div>
            ) : error ? (
                <div className="oa-message oa-error">
                    <strong>DATA LOAD FAILED</strong>
                    <p>{error}</p>
                    Check that the deployed frontend can reach `/api/over-analysis`.
                </div>
            ) : !data.length || !summary ? (
                <div className="oa-message">
                    No over-analysis records were returned for this team.
                </div>
            ) : (
                <>
                    <div className="oa-summary">
                        <div className="oa-stat">
                            <span>INNINGS SAMPLED</span>
                            <strong>{summary.innings.toLocaleString("en-IN")}</strong>
                            <small>Historical innings</small>
                        </div>
                        <div className="oa-stat">
                            <span>TOTAL RUNS</span>
                            <strong>{summary.totalRuns.toLocaleString("en-IN")}</strong>
                            <small>Across the 20 over groups</small>
                        </div>
                        <div className="oa-stat">
                            <span>TOTAL WICKETS</span>
                            <strong>{summary.totalWickets.toLocaleString("en-IN")}</strong>
                            <small>Across the 20 over groups</small>
                        </div>
                        <div className="oa-stat">
                            <span>AVG RUNS / OVER</span>
                            <strong>{format(summary.averageRuns / data.length)}</strong>
                            <small>Mean of the 20 over averages</small>
                        </div>
                    </div>

                    <div className="oa-grid">
                        <section style={panel}>
                            <h2 className="oa-panel-title">Scoring progression</h2>
                            <p className="oa-panel-subtitle">
                                Average runs scored in each over. Hover over a point for its value.
                            </p>
                            <RunsChart data={data} />
                            <div className="oa-legend">
                                <span className="oa-legend-dot" />
                                Average runs per over
                            </div>
                        </section>

                        <section style={panel}>
                            <h2 className="oa-panel-title">Wicket distribution</h2>
                            <p className="oa-panel-subtitle">
                                Average wickets recorded in each over.
                            </p>
                            <WicketsChart data={data} />
                            <div className="oa-legend">
                                <span className="oa-legend-dot" style={{ background: "#d29922" }} />
                                Average wickets per over
                            </div>
                        </section>
                    </div>

                    <section style={panel}>
                        <h2 className="oa-panel-title">Over-by-over records</h2>
                        <p className="oa-panel-subtitle">
                            {selectedTeam} · {data.length} overs · Pig output
                        </p>

                        <div className="oa-table-wrap">
                            <table className="oa-table">
                                <thead>
                                    <tr>
                                        <th>OVER</th>
                                        <th>INNINGS</th>
                                        <th>TOTAL RUNS</th>
                                        <th>TOTAL WICKETS</th>
                                        <th>AVG RUNS</th>
                                        <th>AVG WICKETS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((row) => (
                                        <tr key={`${row.team}-${row.over}`}>
                                            <td>{String(row.over).padStart(2, "0")}</td>
                                            <td>{row.innings_count.toLocaleString("en-IN")}</td>
                                            <td>{row.total_runs.toLocaleString("en-IN")}</td>
                                            <td>{row.total_wickets.toLocaleString("en-IN")}</td>
                                            <td>{format(row.avg_runs)}</td>
                                            <td>{format(row.avg_wickets, 3)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="oa-footnote">
                            These figures describe the historical Pig analysis output. The
                            average wickets and runs are aggregated by over and should not be
                            interpreted as a prediction for an individual match.
                        </p>
                    </section>
                </>
            )}
        </div>
    );
}
