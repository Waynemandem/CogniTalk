import { useState, useEffect } from "react";
import supabase from "../services/supabase.js";

const FREE_DAILY_LIMIT = 3;

export function useSubscription() {
  const [plan, setPlan] = useState("free");
  const [sessionsToday, setSessionsToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canRecord, setCanRecord] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get subscription
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("plan, expires_at")
        .eq("user_id", user.id)
        .single();

      // Check if pro plan is still valid
      let currentPlan = "free";
      if (sub?.plan === "pro") {
        const expired = sub.expires_at && new Date(sub.expires_at) < new Date();
        currentPlan = expired ? "free" : "pro";
        // Downgrade expired pro in DB
        if (expired) {
          await supabase
            .from("subscriptions")
            .update({ plan: "free", updated_at: new Date().toISOString() })
            .eq("user_id", user.id);
        }
      }
      setPlan(currentPlan);

      // Count today's sessions
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("sessions")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", todayStart.toISOString());

      const todayCount = count || 0;
      setSessionsToday(todayCount);

      // Can record if pro OR under free limit
      setCanRecord(currentPlan === "pro" || todayCount < FREE_DAILY_LIMIT);
      setLoading(false);
    }
    load();
  }, []);

  return {
    plan,
    sessionsToday,
    canRecord,
    loading,
    isProPlan: plan === "pro",
    sessionsRemaining: plan === "pro" ? Infinity : Math.max(0, FREE_DAILY_LIMIT - sessionsToday),
  };
}