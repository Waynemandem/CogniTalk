import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "so", "basically",
  "literally", "actually", "right", "okay", "kind of", "sort of",
];

function countFillerWords(transcript) {
  const lower = transcript.toLowerCase();
  const counts = {};
  for (const word of FILLER_WORDS) {
    const regex = new RegExp(`\\b${word.replace(" ", "\\s+")}\\b`, "g");
    const matches = lower.match(regex);
    if (matches?.length) counts[word] = matches.length;
  }
  return counts;
}

export async function analyzeSpeech(transcript, durationSeconds) {
  const words = transcript.trim().split(/\s+/);
  const wordCount = words.length;
  const paceWpm = durationSeconds > 0
    ? Math.round(wordCount / (durationSeconds / 60))
    : 0;
  const fillerWords = countFillerWords(transcript);
  const fillerCount = Object.values(fillerWords).reduce((a, b) => a + b, 0);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a speech coach. Analyze the transcript and return JSON with:
- "clarity_score": integer 1–10 (structure, articulation, coherence)
- "suggestions": array of 2–4 short, actionable improvement tips

Respond ONLY with valid JSON. No markdown.`,
      },
      {
        role: "user",
        content: `Transcript: "${transcript}"
Duration: ${durationSeconds}s | Pace: ${paceWpm} WPM | Filler words: ${fillerCount}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const { clarity_score, suggestions } = JSON.parse(
    response.choices[0].message.content
  );

  return {
    transcript,
    word_count: wordCount,
    duration_seconds: durationSeconds,
    pace_wpm: paceWpm,
    filler_words: fillerWords,
    filler_count: fillerCount,
    clarity_score,
    suggestions,
  };
}
