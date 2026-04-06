import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../services/supabase.js";

const S = {
  root: { minHeight: "100vh", background: "linear-gradient(160deg, #0d1117 0%, #161b27 60%, #0d1117 100%)", fontFamily: "'Nunito', sans-serif", color: "#fff" },
  navWrap: { borderBottom: "1px solid rgba(255,255,255,0.06)" },
  nav: { maxWidth: "900px", margin: "0 auto", padding: "0 2rem", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logoRow: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { width: "34px", height: "34px", borderRadius: "10px", background: "rgba(76,110,245,0.18)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontWeight: "700", fontSize: "15px", color: "#fff" },
  backBtn: { fontSize: "13px", color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontFamily: "'Nunito', sans-serif", textDecoration: "none" },
  main: { maxWidth: "900px", margin: "0 auto", padding: "3rem 2rem", display: "flex", flexDirection: "column", gap: "2rem" },
  h1: { fontSize: "1.75rem", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", margin: "0 0 4px" },
  sub: { fontSize: "14px", color: "rgba(255,255,255,0.35)", margin: 0 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" },
  statCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "1rem 1.25rem" },
  statLabel: { fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 6px" },
  statValue: { fontSize: "1.5rem", fontWeight: "700", color: "#fff", letterSpacing: "-0.3px", margin: 0 },
  statUnit: { fontSize: "0.85rem", color: "rgba(255,255,255,0.3)", fontWeight: "400" },
  sectionLabel: { fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 1rem" },
  sessionCard: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.25rem 1.5rem", display: "grid", gridTemplateColumns: "1fr auto", gap: "1rem", alignItems: "start", cursor: "pointer" },
  metricLabel: { fontSize: "10px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.25)", margin: "0 0 3px" },
  metricValue: { fontSize: "15px", fontWeight: "700", color: "#fff", margin: 0 },
  viewBtn: { background: "rgba(76,110,245,0.1)", border: "1px solid rgba(76,110,245,0.2)", color: "#4c6ef5", fontSize: "12px", fontWeight: "700", padding: "8px 18px", borderRadius: "99px", cursor: "pointer", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap" },
  emptyState: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "4rem", textAlign: "center" },
  startBtn: { background: "#4c6ef5", color: "#fff", border: "none", borderRadius: "50px", padding: "12px 28px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
};

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <rect x="19" y="10" width="10" height="18" rx="5" fill="#4c6ef5" />
      <path d="M14 24c0 5.523 4.477 10 10 10s10-4.477 10-10" stroke="#4c6ef5" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="34" x2="24" y2="39" stroke="#4c6ef5" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="19" y1="39" x2="29" y2="39" stroke="#4c6ef5" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function clarityColor(score) {
  if (!score && score !== 0) return "rgba(255,255,255,0.3)";
  if (score >= 8) return "#4ade80";
  if (score >= 5) return "#fbbf24";
  return "#f87171";
}

function paceLabel(wpm) {
  if (!wpm) return { text: "—", color: "rgba(255,255,255,0.3)" };
  if (wpm >= 110 && wpm <= 160) return { text: "Good pace", color: "#4ade80" };
  if (wpm < 110) return { text: "Too slow", color: "#fbbf24" };
  return { text: "Too fast", color: "#fbbf24" };
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("sessions")
        .select(`
          id,
          duration_seconds,
          created_at,
          speech_reports (
            clarity_score,
            pace_wpm,
            filler_count,
            filler_words,
            word_count,
            transcript,
            suggestions
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) setSessions(data || []);
      setLoading(false);
    }
    load();
  }, []);

  const sessionsWithData = sessions.filter(s => s.speech_reports?.[0]?.clarity_score !== null && s.speech_reports?.[0]?.clarity_score !== undefined);
  const totalSessions = sessions.length;
  const avgClarity = sessionsWithData.length > 0
    ? (sessionsWithData.reduce((a, s) => a + (s.speech_reports[0].clarity_score || 0), 0) / sessionsWithData.length).toFixed(1)
    : "—";
  const avgPace = sessionsWithData.length > 0
    ? Math.round(sessionsWithData.reduce((a, s) => a + (s.speech_reports[0].pace_wpm || 0), 0) / sessionsWithData.length)
    : "—";

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .fu{animation:fadeUp 0.45s ease both}
        .fu1{animation-delay:0.05s}.fu2{animation-delay:0.12s}.fu3{animation-delay:0.2s}
        .s-card:hover{background:rgba(255,255,255,0.06)!important;border-color:rgba(255,255,255,0.12)!important}
        .v-btn:hover{background:rgba(76,110,245,0.2)!important}
      `}</style>

      <div style={S.navWrap}>
        <div style={S.nav}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}><MicIcon /></div>
            <span style={S.logoText}>CogniTalk</span>
          </div>
          <Link to="/dashboard" style={S.backBtn}>← Dashboard</Link>
        </div>
      </div>

      <main style={S.main}>
        {/* Header */}
        <div className="fu fu1" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <h1 style={S.h1}>Session History</h1>
            <p style={S.sub}>{totalSessions} session{totalSessions !== 1 ? "s" : ""} recorded</p>
          </div>
          <button onClick={() => navigate("/recorder")} style={{ background: "#4c6ef5", color: "#fff", border: "none", borderRadius: "50px", padding: "10px 22px", fontSize: "13px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" }}>
            + New Session
          </button>
        </div>

        {/* Stats */}
        {totalSessions > 0 && (
          <div className="fu fu2" style={S.statsRow}>
            <div style={S.statCard}>
              <p style={S.statLabel}>Total Sessions</p>
              <p style={S.statValue}>{totalSessions}</p>
            </div>
            <div style={S.statCard}>
              <p style={S.statLabel}>Avg Clarity</p>
              <p style={S.statValue}>{avgClarity}<span style={S.statUnit}>{avgClarity !== "—" ? "/10" : ""}</span></p>
            </div>
            <div style={S.statCard}>
              <p style={S.statLabel}>Avg Pace</p>
              <p style={S.statValue}>{avgPace}<span style={S.statUnit}>{avgPace !== "—" ? " wpm" : ""}</span></p>
            </div>
          </div>
        )}

        {/* List */}
        <div className="fu fu3">
          <p style={S.sectionLabel}>All Sessions</p>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
              <div style={{ width: "32px", height: "32px", border: "2px solid rgba(76,110,245,0.2)", borderTop: "2px solid #4c6ef5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : sessions.length === 0 ? (
            <div style={S.emptyState}>
              <div style={{ fontSize: "2.5rem", marginBottom: "12px" }}>🎙</div>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "rgba(255,255,255,0.5)", margin: "0 0 6px" }}>No sessions yet</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", margin: "0 0 1.5rem" }}>Record your first session to start tracking your progress</p>
              <button onClick={() => navigate("/recorder")} style={S.startBtn}>Start Recording</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sessions.map((session, i) => {
                const report = session.speech_reports?.[0];
                const hasData = report?.clarity_score !== null && report?.clarity_score !== undefined;
                const pace = paceLabel(report?.pace_wpm);
                const isExpanded = expanded === session.id;

                return (
                  <div key={session.id} style={{ animation: `fadeUp 0.4s ease both`, animationDelay: `${i * 0.06}s` }}>
                    <div className="s-card" style={{ ...S.sessionCard, transition: "all 0.15s" }} onClick={() => setExpanded(isExpanded ? null : session.id)}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {/* Title */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <p style={{ fontSize: "14px", fontWeight: "700", color: "#fff", margin: 0 }}>Session — {formatDate(session.created_at)}</p>
                          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{formatTime(session.created_at)}</span>
                        </div>

                        {/* Metrics */}
                        {hasData ? (
                          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                            <div>
                              <p style={S.metricLabel}>Clarity</p>
                              <p style={{ ...S.metricValue, color: clarityColor(report.clarity_score) }}>{report.clarity_score}/10</p>
                            </div>
                            <div>
                              <p style={S.metricLabel}>Pace</p>
                              <p style={S.metricValue}>{report.pace_wpm} <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>wpm</span></p>
                            </div>
                            <div>
                              <p style={S.metricLabel}>Fillers</p>
                              <p style={S.metricValue}>{report.filler_count}</p>
                            </div>
                            <div>
                              <p style={S.metricLabel}>Words</p>
                              <p style={S.metricValue}>{report.word_count}</p>
                            </div>
                            <span style={{ fontSize: "11px", fontWeight: "700", color: pace.color, background: pace.color + "18", border: `1px solid ${pace.color}30`, padding: "3px 10px", borderRadius: "99px" }}>
                              {pace.text}
                            </span>
                          </div>
                        ) : (
                          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", margin: 0 }}>No report data</p>
                        )}

                        {/* Expanded content */}
                        {isExpanded && hasData && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            {report.filler_words && Object.keys(report.filler_words).length > 0 && (
                              <div>
                                <p style={{ ...S.metricLabel, marginBottom: "8px" }}>Filler Words</p>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                  {Object.entries(report.filler_words).map(([word, count]) => (
                                    <span key={word} style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24", fontSize: "12px", fontWeight: "600", padding: "4px 10px", borderRadius: "99px" }}>
                                      "{word}" ×{count}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {report.suggestions?.length > 0 && (
                              <div>
                                <p style={{ ...S.metricLabel, marginBottom: "8px" }}>Suggestions</p>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                  {report.suggestions.map((s, i) => (
                                    <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                                      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(76,110,245,0.15)", border: "1px solid rgba(76,110,245,0.3)", color: "#4c6ef5", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>{i + 1}</div>
                                      <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: "1.6", margin: 0 }}>{s}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {report.transcript && (
                              <div>
                                <p style={{ ...S.metricLabel, marginBottom: "8px" }}>Transcript</p>
                                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", lineHeight: "1.7", margin: 0, fontStyle: "italic" }}>"{report.transcript}"</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <button className="v-btn" style={S.viewBtn} onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : session.id); }}>
                        {isExpanded ? "Collapse ↑" : "View ↓"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}