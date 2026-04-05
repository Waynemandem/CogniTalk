import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../services/supabase.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: sessions } = await supabase
        .from("sessions")
        .select("*, speech_reports(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setUser(user);
      setSessions(sessions || []);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  const latestSession = sessions[0];
  const latestReport = latestSession?.speech_reports?.[0];

  const styles = {
    root: {
      minHeight: "100vh",
      background: "linear-gradient(160deg, #0d1117 0%, #161b27 60%, #0d1117 100%)",
      fontFamily: "'Nunito', sans-serif",
      color: "#fff",
    },
    nav: {
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 2rem",
      height: "60px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      maxWidth: "1100px",
      margin: "0 auto",
      width: "100%",
    },
    navWrap: {
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    logoRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
    },
    logoIcon: {
      width: "34px",
      height: "34px",
      borderRadius: "10px",
      background: "rgba(76,110,245,0.18)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontWeight: "700",
      fontSize: "15px",
      letterSpacing: "-0.2px",
      color: "#fff",
    },
    navLinks: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    navLink: {
      fontSize: "13px",
      color: "rgba(255,255,255,0.4)",
      textDecoration: "none",
      padding: "6px 14px",
      borderRadius: "8px",
      border: "none",
      background: "transparent",
      cursor: "pointer",
      fontFamily: "'Nunito', sans-serif",
      transition: "color 0.2s, background 0.2s",
    },
    signOutBtn: {
      fontSize: "13px",
      color: "rgba(255,255,255,0.4)",
      padding: "6px 14px",
      borderRadius: "8px",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "transparent",
      cursor: "pointer",
      fontFamily: "'Nunito', sans-serif",
    },
    main: {
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "3rem 2rem",
      display: "flex",
      flexDirection: "column",
      gap: "2.5rem",
    },
    // Hero greeting
    greeting: {
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    },
    greetingH1: {
      fontSize: "2rem",
      fontWeight: "700",
      color: "#fff",
      letterSpacing: "-0.5px",
      margin: 0,
    },
    greetingSub: {
      fontSize: "14px",
      color: "rgba(255,255,255,0.35)",
      margin: 0,
    },
    // Stats row
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px",
    },
    statCard: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "16px",
      padding: "1.25rem 1.5rem",
    },
    statLabel: {
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.08em",
      color: "rgba(255,255,255,0.3)",
      textTransform: "uppercase",
      marginBottom: "8px",
    },
    statValue: {
      fontSize: "1.75rem",
      fontWeight: "700",
      color: "#fff",
      letterSpacing: "-0.5px",
    },
    statSub: {
      fontSize: "12px",
      color: "rgba(255,255,255,0.3)",
      marginTop: "4px",
    },
    // CTA banner
    ctaBanner: {
      background: "rgba(76,110,245,0.12)",
      border: "1px solid rgba(76,110,245,0.25)",
      borderRadius: "20px",
      padding: "2rem 2.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "2rem",
    },
    ctaLeft: {
      display: "flex",
      alignItems: "center",
      gap: "1.25rem",
    },
    ctaMicCircle: {
      width: "52px",
      height: "52px",
      borderRadius: "50%",
      background: "rgba(76,110,245,0.2)",
      border: "1px solid rgba(76,110,245,0.3)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    ctaTitle: {
      fontSize: "17px",
      fontWeight: "700",
      color: "#fff",
      margin: "0 0 4px",
    },
    ctaDesc: {
      fontSize: "13px",
      color: "rgba(255,255,255,0.4)",
      margin: 0,
    },
    ctaBtn: {
      background: "#4c6ef5",
      color: "#fff",
      border: "none",
      borderRadius: "50px",
      padding: "12px 28px",
      fontSize: "14px",
      fontWeight: "700",
      cursor: "pointer",
      fontFamily: "'Nunito', sans-serif",
      whiteSpace: "nowrap",
      flexShrink: 0,
    },
    // Section label
    sectionLabel: {
      fontSize: "11px",
      fontWeight: "700",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      color: "rgba(255,255,255,0.3)",
      marginBottom: "1rem",
    },
    // Latest report card
    reportCard: {
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: "20px",
      padding: "1.75rem 2rem",
    },
    reportGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "2rem",
      marginBottom: "1.5rem",
    },
    reportMetricLabel: {
      fontSize: "11px",
      fontWeight: "600",
      letterSpacing: "0.08em",
      color: "rgba(255,255,255,0.3)",
      textTransform: "uppercase",
      marginBottom: "10px",
    },
    reportMetricValue: {
      fontSize: "1.4rem",
      fontWeight: "700",
      color: "#fff",
      letterSpacing: "-0.3px",
    },
    progressTrack: {
      height: "4px",
      background: "rgba(255,255,255,0.08)",
      borderRadius: "99px",
      overflow: "hidden",
      marginTop: "8px",
    },
    fillerTag: {
      background: "rgba(255,255,255,0.06)",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.6)",
      fontSize: "12px",
      fontWeight: "600",
      padding: "5px 12px",
      borderRadius: "99px",
    },
    viewReportBtn: {
      background: "transparent",
      border: "none",
      color: "#4c6ef5",
      fontSize: "13px",
      fontWeight: "700",
      cursor: "pointer",
      fontFamily: "'Nunito', sans-serif",
      padding: 0,
    },
    // Sessions list
    sessionRow: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      padding: "1rem 1.5rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "10px",
    },
    sessionTitle: {
      fontSize: "14px",
      fontWeight: "600",
      color: "#fff",
      margin: "0 0 3px",
    },
    sessionSub: {
      fontSize: "12px",
      color: "rgba(255,255,255,0.3)",
      margin: 0,
    },
    sessionViewBtn: {
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "rgba(255,255,255,0.4)",
      fontSize: "12px",
      fontWeight: "600",
      padding: "6px 16px",
      borderRadius: "99px",
      cursor: "pointer",
      fontFamily: "'Nunito', sans-serif",
    },
    emptyState: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      padding: "3rem",
      textAlign: "center",
    },
    emptyTitle: {
      fontSize: "15px",
      fontWeight: "600",
      color: "rgba(255,255,255,0.6)",
      margin: "0 0 6px",
    },
    emptyDesc: {
      fontSize: "13px",
      color: "rgba(255,255,255,0.25)",
      margin: 0,
    },
  };

  if (loading) {
    return (
      <div style={{ ...styles.root, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "32px", height: "32px",
            border: "2px solid rgba(76,110,245,0.3)",
            borderTop: "2px solid #4c6ef5",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: 0 }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalSessions = sessions.length;
  const avgClarity = sessions.length > 0
    ? (sessions.reduce((acc, s) => acc + (s.speech_reports?.[0]?.clarity_score || 0), 0) / sessions.length).toFixed(1)
    : "—";
  const avgPace = sessions.length > 0
    ? Math.round(sessions.reduce((acc, s) => acc + (s.speech_reports?.[0]?.pace_wpm || 0), 0) / sessions.length)
    : "—";

  return (
    <div style={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.12s; }
        .fade-up-3 { animation-delay: 0.2s; }
        .fade-up-4 { animation-delay: 0.28s; }
        .fade-up-5 { animation-delay: 0.36s; }
        .nav-link-hover:hover { color: rgba(255,255,255,0.8) !important; background: rgba(255,255,255,0.05) !important; }
        .cta-btn-hover:hover { background: #3b5bdb !important; }
        .session-row-hover:hover { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.1) !important; }
        .session-view-hover:hover { color: rgba(255,255,255,0.7) !important; border-color: rgba(255,255,255,0.15) !important; }
        @media (max-width: 640px) {
          .stats-row { grid-template-columns: 1fr !important; }
          .report-grid { grid-template-columns: 1fr !important; }
          .cta-banner { flex-direction: column !important; align-items: flex-start !important; }
        }
      `}</style>

      {/* Navbar */}
      <div style={styles.navWrap}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 2rem" }}>
          <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={styles.logoRow}>
              <div style={styles.logoIcon}>
                <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
                  <rect x="19" y="10" width="10" height="18" rx="5" fill="#4c6ef5" />
                  <path d="M14 24c0 5.523 4.477 10 10 10s10-4.477 10-10" stroke="#4c6ef5" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="24" y1="34" x2="24" y2="39" stroke="#4c6ef5" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="19" y1="39" x2="29" y2="39" stroke="#4c6ef5" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <span style={styles.logoText}>CogniTalk</span>
            </div>
            <div style={styles.navLinks}>
              <Link to="/history" className="nav-link-hover" style={{ ...styles.navLink, textDecoration: "none" }}>History</Link>
              <button onClick={handleSignOut} style={styles.signOutBtn} className="session-view-hover">Sign out</button>
            </div>
          </div>
        </div>
      </div>

      <main style={styles.main}>

        {/* Greeting */}
        <div className="fade-up fade-up-1" style={styles.greeting}>
          <h1 style={styles.greetingH1}>
            Good day, {user?.email?.split("@")[0]} 👋
          </h1>
          <p style={styles.greetingSub}>Ready to work on your speaking skills?</p>
        </div>

        {/* Stats Row */}
        <div className="fade-up fade-up-2 stats-row" style={styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Sessions</p>
            <p style={styles.statValue}>{totalSessions}</p>
            <p style={styles.statSub}>{totalSessions === 0 ? "No sessions yet" : "sessions recorded"}</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Avg Clarity</p>
            <p style={styles.statValue}>{avgClarity}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}>/10</span></p>
            <p style={styles.statSub}>across all sessions</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Avg Pace</p>
            <p style={styles.statValue}>{avgPace}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}>{avgPace !== "—" ? " wpm" : ""}</span></p>
            <p style={styles.statSub}>words per minute</p>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="fade-up fade-up-3 cta-banner" style={styles.ctaBanner}>
          <div style={styles.ctaLeft}>
            <div style={styles.ctaMicCircle}>
              <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
                <rect x="19" y="10" width="10" height="18" rx="5" fill="#4c6ef5" />
                <path d="M14 24c0 5.523 4.477 10 10 10s10-4.477 10-10" stroke="#4c6ef5" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="24" y1="34" x2="24" y2="39" stroke="#4c6ef5" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="19" y1="39" x2="29" y2="39" stroke="#4c6ef5" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <p style={styles.ctaTitle}>Start a new session</p>
              <p style={styles.ctaDesc}>Record yourself speaking and get instant AI feedback</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/recorder")}
            className="cta-btn-hover"
            style={styles.ctaBtn}
          >
            Start Recording
          </button>
        </div>

        {/* Latest Result */}
        {latestReport && (
          <div className="fade-up fade-up-4">
            <p style={styles.sectionLabel}>Latest Result</p>
            <div style={styles.reportCard}>
              <div className="report-grid" style={styles.reportGrid}>
                {/* Clarity */}
                <div>
                  <p style={styles.reportMetricLabel}>Clarity</p>
                  <p style={styles.reportMetricValue}>{latestReport.clarity_score}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}>/10</span></p>
                  <div style={styles.progressTrack}>
                    <div style={{
                      height: "100%",
                      width: `${(latestReport.clarity_score / 10) * 100}%`,
                      background: "#4c6ef5",
                      borderRadius: "99px",
                    }} />
                  </div>
                </div>
                {/* Pace */}
                <div>
                  <p style={styles.reportMetricLabel}>Speaking Pace</p>
                  <p style={styles.reportMetricValue}>
                    {latestReport.pace_wpm}
                    <span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}> wpm</span>
                  </p>
                  <p style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    marginTop: "6px",
                    color: latestReport.pace_wpm >= 110 && latestReport.pace_wpm <= 160 ? "#4ade80" : "#fbbf24",
                  }}>
                    {latestReport.pace_wpm < 110 ? "Too slow" : latestReport.pace_wpm > 160 ? "Too fast" : "Good pace"}
                  </p>
                </div>
                {/* Filler Words */}
                <div>
                  <p style={styles.reportMetricLabel}>Filler Words</p>
                  <p style={styles.reportMetricValue}>{latestReport.filler_count}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}> total</span></p>
                  {latestReport.filler_words && Object.keys(latestReport.filler_words).length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                      {Object.entries(latestReport.filler_words).map(([word, count]) => (
                        <span key={word} style={styles.fillerTag}>"{word}" ×{count}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
                <button style={styles.viewReportBtn}>View full report →</button>
              </div>
            </div>
          </div>
        )}

        {/* Past Sessions */}
        <div className="fade-up fade-up-5">
          <p style={styles.sectionLabel}>Past Sessions</p>
          {sessions.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: "2rem", marginBottom: "12px" }}>🎙</div>
              <p style={styles.emptyTitle}>No sessions yet</p>
              <p style={styles.emptyDesc}>Hit "Start Recording" to analyze your first speech</p>
            </div>
          ) : (
            <div>
              {sessions.map((session) => {
                const report = session.speech_reports?.[0];
                return (
                  <div key={session.id} className="session-row-hover" style={{ ...styles.sessionRow, transition: "all 0.15s" }}>
                    <div>
                      <p style={styles.sessionTitle}>Session — {formatDate(session.created_at)}</p>
                      <p style={styles.sessionSub}>
                        {session.duration_seconds}s recording
                        {report ? ` · Clarity ${report.clarity_score}/10 · ${report.pace_wpm} wpm` : ""}
                      </p>
                    </div>
                    <button className="session-view-hover" style={{ ...styles.sessionViewBtn, transition: "all 0.15s" }}>
                      View →
                    </button>
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