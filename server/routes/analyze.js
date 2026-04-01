import { Router } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { transcribeAudio } from "../services/transcribe.js";
import { analyzeSpeech } from "../services/analyzeSpeech.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

router.post("/", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided." });
    }

    const duration = parseInt(req.body.duration, 10) || 0;

    // Resolve user from Bearer token
    let userId = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    // Transcribe → Analyze
    const transcript = await transcribeAudio(req.file.buffer);
    const result = await analyzeSpeech(transcript, duration);

    // Persist to Supabase when authenticated
    if (userId) {
      const { data: session, error: sessionErr } = await supabase
        .from("sessions")
        .insert({ user_id: userId, duration_seconds: duration })
        .select()
        .single();

      if (sessionErr) {
        console.error("Session insert error:", sessionErr.message);
      } else {
        const { error: reportErr } = await supabase
          .from("speech_reports")
          .insert({
            session_id: session.id,
            transcript: result.transcript,
            word_count: result.word_count,
            pace_wpm: result.pace_wpm,
            clarity_score: result.clarity_score,
            filler_words: result.filler_words,
            filler_count: result.filler_count,
            suggestions: result.suggestions,
          });

        if (reportErr) console.error("Report insert error:", reportErr.message);
      }
    }

    res.json(result);
  } catch (err) {
    console.error("Analyze error:", err);
    res.status(500).json({ error: err.message || "Internal server error." });
  }
});

export default router;
