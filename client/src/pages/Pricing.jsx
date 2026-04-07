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
  main: { maxWidth: "900px", margin: "0 auto", padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "3rem" },
  heading: { textAlign: "center" },
  h1: { fontSize: "2.2rem", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px", margin: "0 0 10px" },
  sub: { fontSize: "15px", color: "rgba(255,255,255,0.4)", margin: 0 },
  cardsRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", width: "100%", maxWidth: "700px" },
  card: { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem" },
  cardPro: { background: "rgba(76,110,245,0.08)", border: "2px solid rgba(76,110,245,0.4)", borderRadius: "24px", padding: "2rem", display: "flex", flexDirection: "column", gap: "1.5rem", position: "relative", overflow: "hidden" },
  badge: { position: "absolute", top: "16px", right: "16px", background: "#4c6ef5", color: "#fff", fontSize: "11px", fontWeight: "700", padding: "4px 12px", borderRadius: "99px", letterSpacing: "0.05em" },
  planName: { fontSize: "13px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", margin: 0 },
  price: { display: "flex", alignItems: "baseline", gap: "4px" },
  priceAmount: { fontSize: "2.5rem", fontWeight: "700", color: "#fff", letterSpacing: "-1px" },
  pricePeriod: { fontSize: "14px", color: "rgba(255,255,255,0.3)" },
  featuresList: { display: "flex", flexDirection: "column", gap: "10px", flex: 1 },
  feature: { display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.65)" },
  featureCheck: { width: "18px", height: "18px", borderRadius: "50%", background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  featureCheckPro: { width: "18px", height: "18px", borderRadius: "50%", background: "rgba(76,110,245,0.2)", border: "1px solid rgba(76,110,245,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  btnFree: { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "50px", padding: "13px", fontSize: "14px", fontWeight: "700", cursor: "default", fontFamily: "'Nunito', sans-serif", textAlign: "center" },
  btnPro: { background: "#4c6ef5", color: "#fff", border: "none", borderRadius: "50px", padding: "13px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'Nunito', sans-serif" },
  btnProDisabled: { background: "#4c6ef5", color: "#fff", border: "none", borderRadius: "50px", padding: "13px", fontSize: "14px", fontWeight: "700", fontFamily: "'Nunito', sans-serif", opacity: 0.5, cursor: "not-allowed" },
  btnCurrent: { background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)", borderRadius: "50px", padding: "13px", fontSize: "14px", fontWeight: "700", fontFamily: "'Nunito', sans-serif", cursor: "default", textAlign: "center" },
  faqSection: { width: "100%", maxWidth: "600px" },
  faqTitle: { fontSize: "11px", fontWeight: "700", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: "1rem", textAlign: "center" },
  faqItem: { borderTop: "1px solid rgba(255,255,255,0.06)", padding: "1rem 0" },
  faqQ: { fontSize: "14px", fontWeight: "600", color: "rgba(255,255,255,0.7)", margin: "0 0 6px" },
  faqA: { fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0, lineHeight: "1.6" },
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

function CheckIcon({ color = "#4ade80" }) {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const FREE_FEATURES = [
  "3 sessions per day",
  "Whisper transcription",
  "Clarity score",
  "Filler word detection",
  "Basic suggestions",
];

const PRO_FEATURES = [
  "Unlimited sessions",
  "Whisper transcription",
  "GPT-4o deep analysis",
  "Advanced coaching tips",
  "Full session history",
  "Priority support",
];

export default function Pricing() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("subscriptions")
          .select("plan")
          .eq("user_id", user.id)
          .single();
        if (data) setPlan(data.plan);
      }
      setLoading(false);
    }
    load();
  }, []);

  function handlePaystack() {
    if (!user || paying) return;
    setPaying(true);
    setError("");

    const handler = window.PaystackPop.setup({
      key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
      email: user.email,
      amount: 500000, // ₦5,000 in kobo
      currency: "NGN",
      ref: `cognitalk_${user.id}_${Date.now()}`,
      metadata: { user_id: user.id },
      onSuccess: async (transaction) => {
        try {
          // Verify payment with our backend
          const { data: { session } } = await supabase.auth.getSession();
          const res = await fetch("https://cognitalk-server.onrender.com", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ reference: transaction.reference }),
          });

          if (!res.ok) throw new Error("Verification failed");
          setPlan("pro");
          navigate("/dashboard");
        } catch (err) {
          setError("Payment received but verification failed. Contact support.");
        } finally {
          setPaying(false);
        }
      },
      onCancel: () => {
        setPaying(false);
      },
    });

    handler.openIframe();
  }

  return (
    <div style={S.root}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" rel="stylesheet" />
      {/* Paystack script */}
      <script src="https://js.paystack.co/v1/inline.js" />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        .fu{animation:fadeUp 0.45s ease both}
        .fu1{animation-delay:0.05s}.fu2{animation-delay:0.15s}.fu3{animation-delay:0.25s}
        .pro-btn:hover{background:#3b5bdb!important}
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
        {/* Heading */}
        <div className="fu fu1" style={S.heading}>
          <h1 style={S.h1}>Simple, honest pricing</h1>
          <p style={S.sub}>Start free. Upgrade when you're ready to go deeper.</p>
        </div>

        {/* Cards */}
        <div className="fu fu2" style={S.cardsRow}>
          {/* Free */}
          <div style={S.card}>
            <div>
              <p style={S.planName}>Free</p>
              <div style={S.price}>
                <span style={S.priceAmount}>₦0</span>
                <span style={S.pricePeriod}>/month</span>
              </div>
            </div>
            <div style={S.featuresList}>
              {FREE_FEATURES.map((f) => (
                <div key={f} style={S.feature}>
                  <div style={S.featureCheck}><CheckIcon color="#4ade80" /></div>
                  {f}
                </div>
              ))}
            </div>
            <div style={plan === "free" ? S.btnCurrent : S.btnFree}>
              {plan === "free" ? "✓ Current plan" : "Free plan"}
            </div>
          </div>

          {/* Pro */}
          <div style={S.cardPro}>
            <span style={S.badge}>POPULAR</span>
            <div>
              <p style={S.planName}>Pro</p>
              <div style={S.price}>
                <span style={S.priceAmount}>₦5k</span>
                <span style={S.pricePeriod}>/month</span>
              </div>
            </div>
            <div style={S.featuresList}>
              {PRO_FEATURES.map((f) => (
                <div key={f} style={S.feature}>
                  <div style={S.featureCheckPro}><CheckIcon color="#4c6ef5" /></div>
                  {f}
                </div>
              ))}
            </div>

            {error && (
              <p style={{ fontSize: "12px", color: "#f87171", margin: 0 }}>{error}</p>
            )}

            {plan === "pro" ? (
              <div style={S.btnCurrent}>✓ Current plan</div>
            ) : (
              <button
                className="pro-btn"
                onClick={handlePaystack}
                disabled={paying || loading}
                style={paying || loading ? S.btnProDisabled : S.btnPro}
              >
                {paying ? "Processing..." : "Upgrade to Pro →"}
              </button>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div className="fu fu3" style={S.faqSection}>
          <p style={S.faqTitle}>FAQ</p>
          {[
            { q: "When does my day reset?", a: "Your 3 free sessions reset every day at midnight." },
            { q: "Can I cancel anytime?", a: "Yes — contact support and we'll cancel your subscription immediately. No questions asked." },
            { q: "What payment methods are accepted?", a: "All Nigerian debit cards, bank transfers, and USSD via Paystack." },
            { q: "Is my payment secure?", a: "Yes. All payments are processed by Paystack — we never store your card details." },
          ].map(({ q, a }) => (
            <div key={q} style={S.faqItem}>
              <p style={S.faqQ}>{q}</p>
              <p style={S.faqA}>{a}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}