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

function localClarityScore(transcript, fillerCount, paceWpm) {
  let score = 10;
  if (fillerCount > 10) score -= 3;
  else if (fillerCount > 5) score -= 2;
  else if (fillerCount > 2) score -= 1;
  if (paceWpm < 80 || paceWpm > 200) score -= 2;
  else if (paceWpm < 110 || paceWpm > 160) score -= 1;
  const wordCount = transcript.trim().split(/\s+/).length;
  if (wordCount < 20) score -= 2;
  return Math.max(1, Math.min(10, score));
}

function localSuggestions(fillerWords, paceWpm, clarityScore) {
  const tips = [];
  if (paceWpm < 110) tips.push("You're speaking a bit slowly. Aim for 110–160 words per minute to sound more natural and engaging.");
  if (paceWpm > 160) tips.push("You're speaking too fast. Slow down to 110–160 words per minute so listeners can follow along.");
  if (fillerWords["um"] || fillerWords["uh"]) tips.push(`You used "um" or "uh" ${(fillerWords["um"] || 0) + (fillerWords["uh"] || 0)} times. Try pausing silently instead — a pause sounds more confident than a filler.`);
  if (fillerWords["like"]) tips.push(`"Like" appeared ${fillerWords["like"]} times. Record yourself daily and listen back — awareness is the fastest way to reduce this.`);
  if (fillerWords["basically"] || fillerWords["actually"]) tips.push("Words like 'basically' and 'actually' weaken your message. Remove them and your sentences become more direct and powerful.");
  if (clarityScore < 6) tips.push("Focus on sentence structure — complete one idea fully before moving to the next.");
  if (tips.length < 3) tips.push("Great job! Keep recording regularly to track your improvement over time.");
  if (tips.length < 3) tips.push("Try practicing tongue twisters daily to sharpen your articulation and pronunciation.");
  return tips.slice(0, 5);
}

export async function analyzeSpeech(transcript, durationSeconds) {
  const wordCount = transcript.trim().split(/\s+/).length;
  const paceWpm = calculatePace(transcript, durationSeconds);
  const { fillerWords, total: fillerCount } = countFillers(transcript);

  let clarityScore = null;
  let suggestions = null;

  try {
    const prompt = `You are a professional speech coach. Analyze the following speech transcript and respond ONLY with valid JSON — no markdown, no explanation, no code fences.

Transcript:
"${transcript}"

Duration: ${durationSeconds} seconds
Word count: ${wordCount}
Speaking pace: ${paceWpm} words per minute
Filler words found: ${JSON.stringify(fillerWords)}

Return this exact JSON shape:
{
  "clarity_score": <number from 1-10>,
  "suggestions": [<3 to 5 specific actionable coaching tips as strings>]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 500,
    });

    const raw = response.choices[0].message.content.trim();
    const parsed = JSON.parse(raw);
    clarityScore = parsed.clarity_score ?? null;
    suggestions = parsed.suggestions ?? null;
  } catch (err) {
    console.warn("GPT-4o unavailable, using local analysis:", err.message);
  }

  // Fall back to local scoring if GPT-4o failed
  if (clarityScore === null) clarityScore = localClarityScore(transcript, fillerCount, paceWpm);
  if (!suggestions || suggestions.length === 0) suggestions = localSuggestions(fillerWords, paceWpm, clarityScore);

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