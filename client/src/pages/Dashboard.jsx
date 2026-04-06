import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../services/supabase.js";

const S = {
  root: { minHeight: "100vh", background: "linear-gradient(160deg, #0d1117 0%, #161b27 60%, #0d1117 100%)", fontFamily: "'Nunito', sans-serif", color: "#fff" },
  navWrap: { borderBottom: "1px solid rgba(255,255,255,0.06)" },
  nav: { maxWidth: "1100px", margin: "0 auto", padding: "0 2rem", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logoRow: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { width: "34px", height: "34px", borderRadius: "10px", background: "rgba(76,110,245,0.18)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontWeight: "700", fontSize: "15px", letterSpacing: "-0.2px", color: "#fff" },
  navLinks: { display: "flex", alignItems: "center", gap: "8px" },
  navLink: { fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", padding: "6px 14px", borderRadius: "8px" },
  signOutBtn: { fontSize: "13px", color: "rgba(255,255,255,0.4)", padding: "6px 14px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)", background: "transparent", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  main: { maxWidth: "1100px", margin: "0 auto", padding: "3rem 2rem", display: "flex", flexDirection: "column", gap: "2.5rem" },
  greeting: { display: "flex", flexDirection: "column", gap: "6px" },
  greetingH1: { fontSize: "2rem", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", margin: 0 },
  greetingSub: { fontSize: "14px", color: "rgba(255,255,255,0.35)", margin: 0 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" },
  statCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.25rem 1.5rem" },
  statLabel: { fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "8px" },
  statValue: { fontSize: "1.75rem", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px" },
  statSub: { fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "4px" },
  ctaBanner: { background: "rgba(76,110,245,0.12)", border: "1px solid rgba(76,110,245,0.25)", borderRadius: "20px", padding: "2rem 2.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "2rem" },
  ctaLeft: { display: "flex", alignItems: "center", gap: "1.25rem" },
  ctaMicCircle: { width: "52px", height: "52px", borderRadius: "50%", background: "rgba(76,110,245,0.2)", border: "1px solid rgba(76,110,245,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  ctaTitle: { fontSize: "17px", fontWeight: "700", color: "#fff", margin: "0 0 4px" },
  ctaDesc: { fontSize: "13px", color: "rgba(255,255,255,0.4)", margin: 0 },
  ctaBtn: { background: "#4c6ef5", color: "#fff", border: "none", borderRadius: "50px", padding: "12px 28px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif", whiteSpace: "nowrap", flexShrink: 0 },
  sectionLabel: { fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "1rem" },
  reportCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px", padding: "1.75rem 2rem" },
  reportGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem", marginBottom: "1.5rem" },
  reportMetricLabel: { fontSize: "11px", fontWeight: "600", letterSpacing: "0.08em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: "10px" },
  reportMetricValue: { fontSize: "1.4rem", fontWeight: "700", color: "#fff", letterSpacing: "-0.3px" },
  progressTrack: { height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "99px", overflow: "hidden", marginTop: "8px" },
  fillerTag: { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "99px" },
  sessionRow: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "14px", padding: "1rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" },
  sessionTitle: { fontSize: "14px", fontWeight: "600", color: "#fff", margin: "0 0 3px" },
  sessionSub: { fontSize: "12px", color: "rgba(255,255,255,0.3)", margin: 0 },
  sessionViewBtn: { background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", fontSize: "12px", fontWeight: "600", padding: "6px 16px", borderRadius: "99px", cursor: "pointer", fontFamily: "'Nunito', sans-serif", textDecoration: "none" },
  emptyState: { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "20px", padding: "3rem", textAlign: "center" },
};

function MicIcon({ color = "#4c6ef5", size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="19" y="10" width="10" height="18" rx="5" fill={color} />
      <path d="M14 24c0 5.523 4.477 10 10 10s10-4.477 10-10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="34" x2="24" y2="39" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="19" y1="39" x2="29" y2="39" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
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
            transcript
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) console.error("Dashboard load error:", error.message);
      setUser(user);
      setSessions(data || []);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  if (loading) {
    return (
      <div style={{ ...S.root, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", border: "2px solid rgba(76,110,245,0.3)", borderTop: "2px solid #4c6ef5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", margin: 0 }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const sessionsWithData = sessions.filter(s => s.speech_reports?.[0]?.clarity_score !== null && s.speech_reports?.[0]?.clarity_score !== undefined);
  const totalSessions = sessions.length;
  const avgClarity = sessionsWithData.length > 0
    ? (sessionsWithData.reduce((a, s) => a + (s.speech_reports[0].clarity_score || 0), 0) / sessionsWithData.length).toFixed(1)
    : "—";
  const avgPace = sessionsWithData.length > 0
    ? Math.round(sessionsWithData.reduce((a, s) => a + (s.speech_reports[0].pace_wpm || 0), 0) / sessionsWithData.length)
    : "—";

  const latestSession = sessionsWithData[0];
  const latestReport = latestSession?.speech_reports?.[0];
  const clarityColor = !latestReport ? "#4ade80"
    : latestReport.clarity_score >= 8 ? "#4ade80"
    : latestReport.clarity_score >= 5 ? "#fbbf24" : "#f87171";

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .fade-up{animation:fadeUp 0.5s ease both}
        .fade-up-1{animation-delay:0.05s}.fade-up-2{animation-delay:0.12s}
        .fade-up-3{animation-delay:0.2s}.fade-up-4{animation-delay:0.28s}.fade-up-5{animation-delay:0.36s}
        .nav-lnk:hover{color:rgba(255,255,255,0.8)!important;background:rgba(255,255,255,0.05)!important}
        .s-row:hover{background:rgba(255,255,255,0.05)!important}
      `}</style>

      {/* Navbar */}
      <div style={S.navWrap}>
        <div style={S.nav}>
          <div style={S.logoRow}>
            <div style={S.logoIcon}><MicIcon /></div>
            <span style={S.logoText}>CogniTalk</span>
          </div>
          <div style={S.navLinks}>
            <Link to="/history" className="nav-lnk" style={S.navLink}>History</Link>
            <button onClick={handleSignOut} style={S.signOutBtn}>Sign out</button>
          </div>
        </div>
      </div>

      <main style={S.main}>
        {/* Greeting */}
        <div className="fade-up fade-up-1" style={S.greeting}>
          <h1 style={S.greetingH1}>Good day, {user?.email?.split("@")[0]} 👋</h1>
          <p style={S.greetingSub}>Ready to work on your speaking skills?</p>
        </div>

        {/* Stats */}
        <div className="fade-up fade-up-2" style={S.statsRow}>
          <div style={S.statCard}>
            <p style={S.statLabel}>Total Sessions</p>
            <p style={S.statValue}>{totalSessions}</p>
            <p style={S.statSub}>{totalSessions === 0 ? "No sessions yet" : "sessions recorded"}</p>
          </div>
          <div style={S.statCard}>
            <p style={S.statLabel}>Avg Clarity</p>
            <p style={S.statValue}>{avgClarity}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}>{avgClarity !== "—" ? "/10" : ""}</span></p>
            <p style={S.statSub}>across all sessions</p>
          </div>
          <div style={S.statCard}>
            <p style={S.statLabel}>Avg Pace</p>
            <p style={S.statValue}>{avgPace}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}>{avgPace !== "—" ? " wpm" : ""}</span></p>
            <p style={S.statSub}>words per minute</p>
          </div>
        </div>

        {/* CTA */}
        <div className="fade-up fade-up-3" style={S.ctaBanner}>
          <div style={S.ctaLeft}>
            <div style={S.ctaMicCircle}><MicIcon size={22} /></div>
            <div>
              <p style={S.ctaTitle}>Start a new session</p>
              <p style={S.ctaDesc}>Record yourself speaking and get instant AI feedback</p>
            </div>
          </div>
          <button onClick={() => navigate("/recorder")} style={S.ctaBtn}>Start Recording</button>
        </div>

        {/* Latest Result */}
        {latestReport && (
          <div className="fade-up fade-up-4">
            <p style={S.sectionLabel}>Latest Result</p>
            <div style={S.reportCard}>
              <div style={S.reportGrid}>
                <div>
                  <p style={S.reportMetricLabel}>Clarity</p>
                  <p style={S.reportMetricValue}>{latestReport.clarity_score}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}>/10</span></p>
                  <div style={S.progressTrack}>
                    <div style={{ height: "100%", width: `${(latestReport.clarity_score / 10) * 100}%`, background: clarityColor, borderRadius: "99px" }} />
                  </div>
                </div>
                <div>
                  <p style={S.reportMetricLabel}>Speaking Pace</p>
                  <p style={S.reportMetricValue}>{latestReport.pace_wpm}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}> wpm</span></p>
                  <p style={{ fontSize: "12px", fontWeight: "600", marginTop: "6px", color: latestReport.pace_wpm >= 110 && latestReport.pace_wpm <= 160 ? "#4ade80" : "#fbbf24" }}>
                    {latestReport.pace_wpm < 110 ? "Too slow" : latestReport.pace_wpm > 160 ? "Too fast" : "Good pace"}
                  </p>
                </div>
                <div>
                  <p style={S.reportMetricLabel}>Filler Words</p>
                  <p style={S.reportMetricValue}>{latestReport.filler_count}<span style={{ fontSize: "1rem", color: "rgba(255,255,255,0.3)" }}> total</span></p>
                  {latestReport.filler_words && Object.keys(latestReport.filler_words).length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "10px" }}>
                      {Object.entries(latestReport.filler_words).map(([word, count]) => (
                        <span key={word} style={S.fillerTag}>"{word}" ×{count}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
                <Link to="/history" style={{ color: "#4c6ef5", fontSize: "13px", fontWeight: "700", textDecoration: "none" }}>
                  View all results →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="fade-up fade-up-5">
          <p style={S.sectionLabel}>Recent Sessions</p>
          {sessions.length === 0 ? (
            <div style={S.emptyState}>
              <p style={{ fontSize: "2rem", margin: "0 0 12px" }}>🎙</p>
              <p style={{ fontSize: "15px", fontWeight: "600", color: "rgba(255,255,255,0.5)", margin: "0 0 6px" }}>No sessions yet</p>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.25)", margin: 0 }}>Hit "Start Recording" to analyze your first speech</p>
            </div>
          ) : (
            <div>
              {sessions.map((session) => {
                const report = session.speech_reports?.[0];
                const hasData = report?.clarity_score !== null && report?.clarity_score !== undefined;
                return (
                  <div key={session.id} className="s-row" style={{ ...S.sessionRow, transition: "all 0.15s" }}>
                    <div>
                      <p style={S.sessionTitle}>Session — {formatDate(session.created_at)}</p>
                      <p style={S.sessionSub}>
                        {session.duration_seconds > 0 ? `${session.duration_seconds}s` : "Recording"}
                        {hasData ? ` · Clarity ${report.clarity_score}/10 · ${report.pace_wpm} wpm` : " · No report data"}
                      </p>
                    </div>
                    <Link to="/history" style={S.sessionViewBtn}>View →</Link>
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