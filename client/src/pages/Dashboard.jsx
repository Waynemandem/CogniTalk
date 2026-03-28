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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  // Format date nicely
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

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🎙</span>
            </div>
            <span className="font-bold text-gray-900 tracking-tight">CogniTalk</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/history" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              History
            </Link>
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Good day, {user?.email?.split("@")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Ready to work on your speaking skills?
          </p>
        </div>

        {/* Record CTA */}
        <div className="bg-black rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-white font-bold text-lg">Start a new session</h2>
            <p className="text-gray-400 text-sm mt-1">
              Record yourself speaking and get instant AI feedback
            </p>
          </div>
          <button
            onClick={() => navigate("/recorder")}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            <span>🎤</span>
            Start Recording
          </button>
        </div>

        {/* Latest Result */}
        {latestReport && (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Latest Result
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">

                {/* Clarity */}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2">Clarity</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: `${(latestReport.clarity_score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {latestReport.clarity_score}/10
                    </span>
                  </div>
                </div>

                {/* Pace */}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2">Speaking Pace</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {latestReport.pace_wpm} WPM
                    <span className={`ml-2 text-xs font-medium ${
                      latestReport.pace_wpm >= 110 && latestReport.pace_wpm <= 160
                        ? "text-green-600" : "text-amber-600"
                    }`}>
                      {latestReport.pace_wpm < 110 ? "Too slow" :
                       latestReport.pace_wpm > 160 ? "Too fast" : "Good"}
                    </span>
                  </p>
                </div>

                {/* Filler words */}
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-2">Filler Words</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {latestReport.filler_count} total
                  </p>
                </div>
              </div>

              {/* Filler word tags */}
              {latestReport.filler_words && Object.keys(latestReport.filler_words).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {Object.entries(latestReport.filler_words).map(([word, count]) => (
                    <span
                      key={word}
                      className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full"
                    >
                      "{word}" ×{count}
                    </span>
                  ))}
                </div>
              )}

              <button className="text-sm font-medium text-black hover:underline">
                View full report →
              </button>
            </div>
          </div>
        )}

        {/* Past Sessions */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Past Sessions
          </h2>

          {sessions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
              <p className="text-3xl mb-3">🎙</p>
              <p className="text-gray-700 font-medium">No sessions yet</p>
              <p className="text-gray-400 text-sm mt-1">
                Hit "Start Recording" to analyze your first speech
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.map((session) => {
                const report = session.speech_reports?.[0];
                return (
                  <div
                    key={session.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex items-center justify-between hover:border-gray-200 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Session — {formatDate(session.created_at)}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {session.duration_seconds}s recording
                        {report ? ` · Clarity: ${report.clarity_score}/10` : ""}
                      </p>
                    </div>
                    <button className="text-xs text-gray-400 hover:text-gray-900 transition-colors">
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