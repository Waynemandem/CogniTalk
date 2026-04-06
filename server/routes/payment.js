import { Router } from "express";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/payment/verify
router.post("/verify", async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ error: "Reference required" });

    // Get user from Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.slice(7);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return res.status(401).json({ error: "Invalid token" });

    // Verify with Paystack
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data?.status !== "success") {
      return res.status(400).json({ error: "Payment not successful" });
    }

    // Confirm amount is correct (₦5,000 = 500,000 kobo)
    if (paystackData.data.amount < 500000) {
      return res.status(400).json({ error: "Incorrect payment amount" });
    }

    // Upsert subscription — set expires_at to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: subError } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: user.id,
          plan: "pro",
          paystack_reference: reference,
          started_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (subError) {
      console.error("Subscription upsert error:", subError.message);
      return res.status(500).json({ error: "Failed to update subscription" });
    }

    console.log(`✅ Pro subscription activated for user ${user.id}`);
    res.json({ success: true, plan: "pro", expires_at: expiresAt });
  } catch (err) {
    console.error("Payment verify error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;