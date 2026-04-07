import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import supabase from "../services/supabase.js";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

const S = {
  root: { minHeight: "100vh", background: "linear-gradient(160deg, #0d1117 0%, #161b27 60%, #0d1117 100%)", fontFamily: "'Nunito', sans-serif", color: "#fff" },
  navWrap: { borderBottom: "1px solid rgba(255,255,255,0.06)" },
  nav: { maxWidth: "900px", margin: "0 auto", padding: "0 2rem", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  logoRow: { display: "flex", alignItems: "center", gap: "10px" },
  logoIcon: { width: "34px", height: "34px", borderRadius: "10px", background: "rgba(76,110,245,0.18)", display: "flex", alignItems: "center", justifyContent: "center" },
  logoText: { fontWeight: "700", fontSize: "15px", letterSpacing: "-0.2px", color: "#fff" },
  backBtn: { fontSize: "13px", color: "rgba(255,255,255,0.4)", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  main: { maxWidth: "560px", margin: "0 auto", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "2.5rem" },
  heading: { textAlign: "center" },
  h1: { fontSize: "1.75rem", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", margin: "0 0 6px" },
  sub: { fontSize: "14px", color: "rgba(255,255,255,0.35)", margin: 0 },
  // Mic circle
  circleWrap: { position: "relative", display: "flex", alignItems: "center", justifyContent: "center", width: "200px", height: "200px" },
  ring1: { position: "absolute", width: "200px", height: "200px", borderRadius: "50%", border: "1px solid rgba(239,68,68,0.2)", animation: "ping 1.5s ease-out infinite" },
  ring2: { position: "absolute", width: "170px", height: "170px", borderRadius: "50%", border: "1px solid rgba(239,68,68,0.15)", animation: "ping 1.5s ease-out infinite 0.4s" },
  circleIdle: { width: "140px", height: "140px", borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", position: "relative", zIndex: 1 },
  circleRecording: { width: "140px", height: "140px", borderRadius: "50%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", position: "relative", zIndex: 1 },
  circleDone: { width: "140px", height: "140px", borderRadius: "50%", background: "rgba(76,110,245,0.08)", border: "1px solid rgba(76,110,245,0.3)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", position: "relative", zIndex: 1 },
  timer: { fontSize: "1.5rem", fontWeight: "700", color: "#ef4444", letterSpacing: "0.05em", fontVariantNumeric: "tabular-nums" },
  timerDone: { fontSize: "1rem", fontWeight: "600", color: "#4c6ef5" },
  statusText: { fontSize: "14px", color: "rgba(255,255,255,0.35)", fontWeight: "500" },
  // Waveform bars (decorative)
  waveRow: { display: "flex", alignItems: "center", gap: "4px", height: "32px" },
  // Buttons
  btnRow: { display: "flex", gap: "12px", width: "100%", maxWidth: "340px" },
  btnPrimary: { flex: 1, background: "#4c6ef5", color: "#fff", border: "none", borderRadius: "50px", padding: "14px 0", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  btnDanger: { flex: 1, background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "50px", padding: "14px 0", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  btnGhost: { flex: 1, background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50px", padding: "14px 0", fontSize: "14px", fontWeight: "600", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  btnDisabled: { opacity: 0.4, pointerEvents: "none" },
  errorBox: { width: "100%", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171", fontSize: "13px", borderRadius: "14px", padding: "12px 16px", textAlign: "center" },
  // Results
  resultMain: { maxWidth: "700px", margin: "0 auto", padding: "3rem 2rem", display: "flex", flexDirection: "column", gap: "2rem" },
  resultHeader: { display: "flex", flexDirection: "column", gap: "6px" },
  resultH1: { fontSize: "1.75rem", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", margin: 0 },
  resultSub: { fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0 },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" },
  metricCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.25rem 1.5rem" },
  metricLabel: { fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 8px" },
  metricValue: { fontSize: "1.75rem", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", margin: "0 0 4px" },
  metricUnit: { fontSize: "0.9rem", color: "rgba(255,255,255,0.3)", fontWeight: "400" },
  metricBadge: (color) => ({ fontSize: "11px", fontWeight: "700", color, margin: 0 }),
  progressTrack: { height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "99px", overflow: "hidden", marginTop: "8px" },
  sectionCard: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "16px", padding: "1.5rem" },
  sectionTitle: { fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: "0 0 14px" },
  fillerTag: { background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24", fontSize: "12px", fontWeight: "600", padding: "5px 12px", borderRadius: "99px" },
  suggestionItem: { display: "flex", gap: "12px", alignItems: "flex-start" },
  suggestionNum: { width: "22px", height: "22px", borderRadius: "50%", background: "rgba(76,110,245,0.2)", border: "1px solid rgba(76,110,245,0.3)", color: "#4c6ef5", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" },
  suggestionText: { fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: "1.6", margin: 0 },
  transcript: { fontSize: "14px", color: "rgba(255,255,255,0.55)", lineHeight: "1.8", margin: 0 },
  actionRow: { display: "flex", gap: "12px" },
};

function MicIcon({ color = "#4c6ef5", size = 24 }) {
  const s = size * (48 / 24);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect x="19" y="10" width="10" height="18" rx="5" fill={color} />
      <path d="M14 24c0 5.523 4.477 10 10 10s10-4.477 10-10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="34" x2="24" y2="39" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="19" y1="39" x2="29" y2="39" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function WaveBars({ active }) {
  const heights = [10, 18, 28, 22, 32, 18, 26, 14, 24, 16, 30, 20];
  return (
    <div style={S.waveRow}>
      {heights.map((h, i) => (
        <div key={i} style={{
          width: "3px",
          height: active ? `${h}px` : "4px",
          borderRadius: "99px",
          background: active ? "#ef4444" : "rgba(255,255,255,0.1)",
          transition: "height 0.3s ease",
          animation: active ? `wave ${0.5 + (i % 4) * 0.15}s ease-in-out infinite alternate` : "none",
        }} />
      ))}
      <style>{`@keyframes wave { from { transform: scaleY(0.4); } to { transform: scaleY(1); } }`}</style>
    </div>
  );
}

function Navbar({ onBack }) {
  return (
    <div style={S.navWrap}>
      <div style={S.nav}>
        <div style={S.logoRow}>
          <div style={S.logoIcon}><MicIcon size={18} /></div>
          <span style={S.logoText}>CogniTalk</span>
        </div>
        <button onClick={onBack} style={S.backBtn}>← Dashboard</button>
      </div>
    </div>
  );
}

export default function Recorder() {
  const navigate = useNavigate();
  const { isRecording, audioBlob, duration, error, startRecording, stopRecording, resetRecording } = useAudioRecorder();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [result, setResult] = useState(null);

  function formatDuration(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function handleAnalyze() {
    if (!audioBlob) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("duration", String(duration));
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: "POST",
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error("Server error: " + res.status);
      setResult(await res.json());
    } catch {
      setUploadError("Analysis failed. Make sure your server is running.");
    } finally {
      setIsUploading(false);
    }
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  if (result) {
    const clarityColor = result.clarity_score >= 8 ? "#4ade80" : result.clarity_score >= 5 ? "#fbbf24" : "#f87171";
    const paceOk = result.pace_wpm >= 110 && result.pace_wpm <= 160;
    const paceColor = paceOk ? "#4ade80" : "#fbbf24";
    const fillerColor = result.filler_count <= 3 ? "#4ade80" : result.filler_count <= 8 ? "#fbbf24" : "#f87171";

    return (
      <div style={S.root}>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
          .fu { animation: fadeUp 0.45s ease both; }
          .fu1 { animation-delay: 0.05s; } .fu2 { animation-delay: 0.12s; }
          .fu3 { animation-delay: 0.2s; } .fu4 { animation-delay: 0.28s; }
          .fu5 { animation-delay: 0.36s; } .fu6 { animation-delay: 0.44s; }
        `}</style>
        <Navbar onBack={() => navigate("/dashboard")} />
        <main style={{ ...S.root, background: "transparent", minHeight: "unset" }}>
          <div style={S.resultMain}>
            <div className="fu fu1" style={S.resultHeader}>
              <h1 style={S.resultH1}>Your Results</h1>
              <p style={S.resultSub}>{result.duration_seconds}s recording · {result.word_count} words spoken</p>
            </div>

            {/* Metrics */}
            <div className="fu fu2" style={S.metricsGrid}>
              <div style={S.metricCard}>
                <p style={S.metricLabel}>Clarity</p>
                <p style={S.metricValue}>{result.clarity_score}<span style={S.metricUnit}>/10</span></p>
                <div style={S.progressTrack}>
                  <div style={{ height: "100%", width: `${(result.clarity_score / 10) * 100}%`, background: clarityColor, borderRadius: "99px" }} />
                </div>
                <p style={{ ...S.metricBadge(clarityColor), marginTop: "8px" }}>
                  {result.clarity_score >= 8 ? "Excellent" : result.clarity_score >= 5 ? "Fair" : "Needs work"}
                </p>
              </div>
              <div style={S.metricCard}>
                <p style={S.metricLabel}>Pace</p>
                <p style={S.metricValue}>{result.pace_wpm}<span style={S.metricUnit}> wpm</span></p>
                <p style={{ ...S.metricBadge(paceColor), marginTop: "12px" }}>
                  {result.pace_wpm < 110 ? "Too slow" : result.pace_wpm > 160 ? "Too fast" : "Good pace"}
                </p>
              </div>
              <div style={S.metricCard}>
                <p style={S.metricLabel}>Fillers</p>
                <p style={S.metricValue}>{result.filler_count}<span style={S.metricUnit}> words</span></p>
                <p style={{ ...S.metricBadge(fillerColor), marginTop: "12px" }}>
                  {result.filler_count <= 3 ? "Great" : result.filler_count <= 8 ? "Moderate" : "High usage"}
                </p>
              </div>
            </div>

            {/* Filler words */}
            {result.filler_words && Object.keys(result.filler_words).length > 0 && (
              <div className="fu fu3" style={S.sectionCard}>
                <p style={S.sectionTitle}>Filler Words Detected</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {Object.entries(result.filler_words).map(([word, count]) => (
                    <span key={word} style={S.fillerTag}>"{word}" ×{count}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div className="fu fu4" style={S.sectionCard}>
                <p style={S.sectionTitle}>Suggestions</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {result.suggestions.map((s, i) => (
                    <div key={i} style={S.suggestionItem}>
                      <div style={S.suggestionNum}>{i + 1}</div>
                      <p style={S.suggestionText}>{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transcript */}
            <div className="fu fu5" style={S.sectionCard}>
              <p style={S.sectionTitle}>Transcript</p>
              <p style={S.transcript}>{result.transcript}</p>
            </div>

            {/* Actions */}
            <div className="fu fu6" style={S.actionRow}>
              <button onClick={() => { resetRecording(); setResult(null); }} style={S.btnGhost}>
                Record Again
              </button>
              <button onClick={() => navigate("/dashboard")} style={S.btnPrimary}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Recorder screen ─────────────────────────────────────────────────────────
  const circleStyle = isRecording ? S.circleRecording : audioBlob ? S.circleDone : S.circleIdle;

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ping { 0% { transform:scale(0.85); opacity:0.6; } 100% { transform:scale(1.3); opacity:0; } }
        @keyframes pulse { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        .fu { animation: fadeUp 0.45s ease both; }
        .fu1{animation-delay:0.05s}.fu2{animation-delay:0.15s}.fu3{animation-delay:0.25s}.fu4{animation-delay:0.35s}
      `}</style>

      <Navbar onBack={() => navigate("/dashboard")} />

      <main style={S.main}>

        {/* Heading */}
        <div className="fu fu1" style={S.heading}>
          <h1 style={S.h1}>New Session</h1>
          <p style={S.sub}>Speak naturally for at least 30 seconds for best results</p>
        </div>

        {/* Circle */}
        <div className="fu fu2" style={S.circleWrap}>
          {isRecording && (
            <>
              <div style={S.ring1} />
              <div style={S.ring2} />
            </>
          )}
          <div style={circleStyle}>
            {!audioBlob && (
              <MicIcon
                color={isRecording ? "#ef4444" : "rgba(255,255,255,0.3)"}
                size={32}
              />
            )}
            {audioBlob && !isRecording && (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#4c6ef5" strokeWidth="1.5" />
                <path d="M8 12l3 3 5-5" stroke="#4c6ef5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {isRecording && (
              <span style={S.timer}>{formatDuration(duration)}</span>
            )}
            {audioBlob && !isRecording && (
              <span style={S.timerDone}>{formatDuration(duration)}</span>
            )}
          </div>
        </div>

        {/* Waveform */}
        <div className="fu fu3">
          <WaveBars active={isRecording} />
        </div>

        {/* Status */}
        <p className="fu fu3" style={S.statusText}>
          {isRecording ? "Recording — speak clearly and naturally"
            : audioBlob ? "Recording complete — ready to analyze"
            : "Press Start to begin your session"}
        </p>

        {/* Error */}
        {(error || uploadError) && (
          <div style={S.errorBox}>{error || uploadError}</div>
        )}

        {/* Buttons */}
        <div className="fu fu4" style={S.btnRow}>
          {!isRecording && !audioBlob && (
            <button onClick={startRecording} style={S.btnPrimary}>
              Start Recording
            </button>
          )}
          {isRecording && (
            <button onClick={stopRecording} style={S.btnDanger}>
              Stop Recording
            </button>
          )}
          {audioBlob && !isRecording && (
            <>
              <button onClick={resetRecording} disabled={isUploading} style={{ ...S.btnGhost, ...(isUploading ? S.btnDisabled : {}) }}>
                Re-record
              </button>
              <button onClick={handleAnalyze} disabled={isUploading} style={{ ...S.btnPrimary, ...(isUploading ? S.btnDisabled : {}) }}>
                {isUploading ? "Analyzing..." : "Analyze"}
              </button>
            </>
          )}
        </div>

      </main>
    </div>
  );
}