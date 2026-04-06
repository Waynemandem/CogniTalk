import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const FILLER_WORDS = [
  "um", "uh", "like", "you know", "so", "basically", "actually",
  "literally", "right", "okay", "er", "hmm", "well", "kind of", "sort of",
];

function countFillers(transcript) {
  const lower = transcript.toLowerCase();
  const fillerWords = {};
  let total = 0;

  for (const filler of FILLER_WORDS) {
    // Match whole word(s) only
    const regex = new RegExp(`\\b${filler}\\b`, "gi");
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      fillerWords[filler] = matches.length;
      total += matches.length;
    }
  }

  return { fillerWords, total };
}

function calculatePace(transcript, durationSeconds) {
  if (!durationSeconds || durationSeconds === 0) return 0;
  const wordCount = transcript.trim().split(/\s+/).length;
  const minutes = durationSeconds / 60;
  return Math.round(wordCount / minutes);
}

export async function analyzeSpeech(transcript, durationSeconds) {
  // Local calculations (fast, no API call needed)
  const wordCount = transcript.trim().split(/\s+/).length;
  const paceWpm = calculatePace(transcript, durationSeconds);
  const { fillerWords, total: fillerCount } = countFillers(transcript);

  // GPT-4o for clarity score + suggestions
  const prompt = `You are a professional speech coach. Analyze the following speech transcript and respond ONLY with valid JSON — no markdown, no explanation, no code fences.

Transcript:
"${transcript}"

Duration: ${durationSeconds} seconds
Word count: ${wordCount}
Speaking pace: ${paceWpm} words per minute
Filler words found: ${JSON.stringify(fillerWords)}

Return this exact JSON shape:
{
  "clarity_score": <number from 1-10, judge pronunciation clarity, sentence structure, coherence>,
  "suggestions": [<3 to 5 specific, actionable coaching tips as strings>]
}`;

  let clarityScore = 5;
  let suggestions = [];

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 500,
    });

    const raw = response.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);
    clarityScore = parsed.clarity_score ?? 5;
    suggestions = parsed.suggestions ?? [];
  } catch (err) {
    console.error("GPT-4o analysis error:", err.message);
    // Fallback suggestions if GPT fails
    suggestions = [
      "Try to speak at a steady pace between 110–160 words per minute.",
      "Reduce filler words like 'um' and 'uh' by pausing silently instead.",
      "Record yourself regularly to track improvement over time.",
    ];
  }

  return {
    transcript,
    word_count: wordCount,
    duration_seconds: durationSeconds,
    pace_wpm: paceWpm,
    clarity_score: clarityScore,
    filler_count: fillerCount,
    filler_words: fillerWords,
    suggestions,
  };
}