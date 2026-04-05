# CogniTalk — Claude Context

## What This Is
AI-powered speech coaching app. Users speak, get pronunciation feedback, hear correct playback. Goal: help non-native speakers (starting with Nigerians) speak better English and other languages.

## Core Loop
User speaks → Whisper transcribes → Azure scores pronunciation → GPT-4o gives feedback → ElevenLabs plays correct version → User tries again

## Stack
- **Frontend:** React + Vite, Tailwind CSS, React Router
- **Backend:** Node.js + Express (`server/` dir)
- **Auth + DB:** Supabase
- **Payments:** Paystack (with webhook/HMAC verification)
- **APIs:** Whisper (transcription), GPT-4o (analysis), Azure Speech (pronunciation scoring), ElevenLabs (voice playback)
- **Deploy:** Netlify (frontend), Vercel (backend)

## Project Structure
```
cognitalk/
├── client/          # React + Vite frontend
│   └── src/
│       ├── services/supabase.js
│       ├── hooks/useAudioRecorder.js
│       └── pages/
├── server/          # Node.js backend
│   └── routes/analyze.js   # POST /api/analyze
```

## Path Alias
`@/` → `src/` (configured in vite.config.js)

## What's Done
- Auth flow (Signup, Login, Dashboard, Protected Routes) via Supabase
- `useAudioRecorder` custom hook (MediaRecorder API — start/stop/reset working)
- All core pages styled with clean minimal UI

## What's In Progress
- `POST /api/analyze` route (Whisper + GPT-4o pipeline)
- Whisper transcription service
- GPT-4o analysis service

## Key Patterns
- Supabase client lives at `src/services/supabase.js`
- `client/` and `server/` run concurrently in dev
- Paystack webhooks use HMAC signature verification
- Test API routes with Postman before wiring to frontend

## Dev Notes
- Always add hooks inside components, never outside
- Use named exports for services, default exports for pages/components
- Supabase calls go in `src/services/` not directly in components
-