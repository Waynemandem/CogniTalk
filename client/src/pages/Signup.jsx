import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import supabase from "../services/supabase.js";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleOAuth(provider) {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) setError(error.message);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      navigate("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "linear-gradient(160deg, #0d1117 0%, #161b27 60%, #0d1117 100%)", fontFamily: "'Nunito', sans-serif" }}>

      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="w-full max-w-sm">

        {/* Card */}
        <div
          className="w-full rounded-3xl flex flex-col items-center px-8 py-10"
          style={{ background: "#161b27", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Mic Icon */}
          <div
            className="flex items-center justify-center w-12 h-12 rounded-full mb-4"
            style={{ background: "rgba(76,110,245,0.15)" }}
          >
            <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
              <rect x="19" y="10" width="10" height="18" rx="5" fill="#4c6ef5" />
              <path d="M14 24c0 5.523 4.477 10 10 10s10-4.477 10-10" stroke="#4c6ef5" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="24" y1="34" x2="24" y2="39" stroke="#4c6ef5" strokeWidth="2.2" strokeLinecap="round" />
              <line x1="19" y1="39" x2="29" y2="39" stroke="#4c6ef5" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1" style={{ letterSpacing: "-0.3px" }}>Create Account</h1>
          <p className="text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>Start your speech coaching journey</p>

          {/* Email Field */}
          <div className="w-full mb-3">
            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.85)",
                fontFamily: "inherit",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(76,110,245,0.5)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />
          </div>

          {/* Password Field */}
          <div className="w-full mb-6">
            <label className="block mb-1.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="w-full rounded-2xl px-4 py-3.5 pr-11 text-sm outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.85)",
                  fontFamily: "inherit",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(76,110,245,0.5)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="w-full rounded-2xl px-4 py-3 text-xs mb-4" style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", color: "#f87171" }}>
              {error}
            </div>
          )}

          {/* Create Account Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-full py-4 text-sm font-bold text-white flex items-center justify-center gap-2 mb-3 transition-all"
            style={{ background: "#4c6ef5", opacity: loading ? 0.6 : 1 }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = "#3b5bdb")}
            onMouseLeave={e => (e.currentTarget.style.background = "#4c6ef5")}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                </svg>
                Creating account...
              </>
            ) : "Create Account"}
          </button>

          {/* Divider */}
          <div className="w-full flex items-center gap-3 my-2">
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Google Button */}
          <button
            onClick={() => handleOAuth("google")}
            className="w-full rounded-full py-3.5 text-sm font-bold flex items-center justify-center gap-2.5 mt-3 mb-3 transition-all"
            style={{ background: "#ffffff", color: "#1a1a2e" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#f0f0f0")}
            onMouseLeave={e => (e.currentTarget.style.background = "#ffffff")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign Up With Google
          </button>

          {/* X (Twitter) Button */}
          <button
            onClick={() => handleOAuth("twitter")}
            className="w-full rounded-full py-3.5 text-sm font-bold flex items-center justify-center gap-2.5 transition-all"
            style={{ background: "#000000", color: "#ffffff", border: "1px solid rgba(255,255,255,0.15)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#111111")}
            onMouseLeave={e => (e.currentTarget.style.background = "#000000")}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Sign Up With X
          </button>

          {/* Footer */}
          <p className="text-sm mt-6" style={{ color: "rgba(255,255,255,0.35)" }}>
            Already Have An Account?{" "}
            <Link to="/login" className="font-bold" style={{ color: "#4c6ef5" }}>
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}