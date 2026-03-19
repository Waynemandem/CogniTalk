# CogniTalk – Architecture Guide

## Overview

CogniTalk is a full-stack web app that records a user's speech, transcribes it using Whisper, then runs LLM analysis to detect filler words, speaking pace, clarity, and improvement suggestions.

---

## Folder Structure

```
CogniTalk/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AudioRecorder.jsx    # Mic recording UI + MediaRecorder logic
│   │   │   ├── Dashboard.jsx        # Displays analysis results
│   │   │   ├── MetricCard.jsx       # Reusable card for each metric
│   │   │   └── TranscriptView.jsx   # Shows transcript with filler words highlighted
│   │   ├── hooks/
│   │   │   └── useAudioRecorder.js  # Custom hook encapsulating MediaRecorder state
│   │   ├── lib/
│   │   │   └── api.js               # Axios/fetch wrappers for backend calls
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                     # Node.js + Express backend
│   ├── routes/
│   │   └── analyze.js           # POST /api/analyze – main pipeline route
│   ├── services/
│   │   ├── transcribe.js        # Sends audio to Whisper API
│   │   └── analyzespeech.js     # Sends transcript to LLM for analysis
│   ├── middleware/
│   │   └── upload.js            # Multer config for handling audio uploads
│   ├── db/
│   │   └── supabase.js          # Supabase client + helper functions
│   ├── app.js                   # Express app setup
│   └── server.js                # Entry point
│
├── .env                        # API keys (never commit this!)
├── package.json                # Root scripts if using monorepo
└── README.md
```

---

## Data Flow (Request Lifecycle)

```
Browser (React)
  │
  │  1. User clicks Record → MediaRecorder captures mic audio
  │  2. User clicks Stop → audio blob collected
  │  3. Blob wrapped in FormData, POST to /api/analyze
  ▼
Express Server
  │
  │  4. Multer saves the audio blob to memory/disk
  │  5. Audio forwarded to OpenAI Whisper API → returns transcript text
  │  6. Transcript sent to GPT-4o with a structured prompt → returns JSON analysis
  │  7. Analysis saved to Supabase (sessions table)
  │  8. JSON response returned to client
  ▼
React Dashboard
  │
  │  9. Results displayed: filler words, pace score, clarity score, suggestions
```

---

## Environment Variables (.env)

```env
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_ANON_KEY=eyJ...
PORT=3001
```

---

## Supabase Schema

Run this SQL in the Supabase dashboard:

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  transcript text,
  filler_words jsonb,       -- { "um": 3, "uh": 2, "like": 5 }
  filler_count integer,
  pace_wpm integer,         -- words per minute
  clarity_score integer,    -- 1–10
  suggestions text[],       -- array of improvement tips
  duration_seconds integer
);
```