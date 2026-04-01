import { useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../services/supabase.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      setSent(true);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-11 h-11 bg-black rounded-xl mb-3">
            <span className="text-white text-lg">🎙</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">CogniTalk</h1>
          <p className="text-gray-400 text-sm mt-1">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">
          {sent ? (
            <div className="text-center py-2">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-900 mb-1">Check your email</p>
              <p className="text-xs text-gray-400">
                We sent a reset link to <span className="text-gray-600">{email}</span>
              </p>
              <Link
                to="/login"
                className="inline-block mt-5 text-xs text-gray-500 hover:text-black transition-colors"
              >
                ← Back to log in
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-5">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-500 text-xs rounded-xl px-3.5 py-2.5">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-800 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
                      </svg>
                      Sending...
                    </>
                  ) : "Send reset link"}
                </button>
              </form>
            </>
          )}
        </div>

        {!sent && (
          <p className="text-center text-xs text-gray-400 mt-5">
            Remember it?{" "}
            <Link to="/login" className="text-gray-700 font-medium hover:text-black transition-colors">
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
