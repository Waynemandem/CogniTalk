3# 🎙 AI CogniTalk — Learning Guide

> **How to use this guide:**
> This is NOT a copy-paste tutorial. It's a coaching guide. Each step explains a concept, then asks YOU to write the code. That's how real learning happens. When you get stuck, re-read the explanation. Only look at hints when you're truly stuck.
>
> The goal isn't just a working app — it's *understanding* why every line of code exists.

---

## Table of Contents

1. [What We're Building](#what-were-building)
2. [How the App Works (Big Picture)](#how-the-app-works-big-picture)
3. [Database Design](#database-design)
4. [Folder Structure](#folder-structure)
5. [React Concept Deep Dives](#react-concept-deep-dives)
6. [Step 1 — Create the React Project](#step-1--create-the-react-project)
7. [Step 2 — Learn Tailwind CSS](#step-2--learn-tailwind-css)
8. [Step 3 — Authentication System](#step-3--authentication-system)
9. [Step 4 — Build the Dashboard](#step-4--build-the-dashboard)
10. [Step 5 — Build the Audio Recorder](#step-5--build-the-audio-recorder)
11. [Step 6 — Convert Speech to Text](#step-6--convert-speech-to-text)
12. [Step 7 — Analyze Speech with AI](#step-7--analyze-speech-with-ai)
13. [Step 8 — Save Session Data](#step-8--save-session-data)
14. [Step 9 — Session History Page](#step-9--session-history-page)
15. [Tailwind Tips](#tailwind-tips)
16. [When Things Break](#when-things-break)

---

## What We're Building

An ** CogniTalk Ai Coach ** web app. Here's what a user can do in the app:

1. Create an account and log in
2. Record themselves speaking (using their microphone)
3. See their speech turned into text automatically
4. Get AI feedback: filler words, speaking pace, clarity, suggestions
5. Save every session and look back at their progress

Think of it like a personal trainer, but for speaking.

---

## How the App Works (Big Picture)

Before writing a single line of code, understand the flow. Print this out, draw it, or copy it into a notebook.

```
[User opens app]
       ↓
[Login / Sign Up]  ←→  Supabase handles identity
       ↓
[Personal Dashboard]
       ↓
[User presses Record]
       ↓
[Browser captures mic audio]  ←  MediaRecorder API
       ↓
[Audio sent to our backend server]  ←  Node.js
       ↓
[Backend sends audio to Whisper API]  →  Returns transcript text
       ↓
[Backend sends transcript to LLM]  →  Returns feedback JSON
       ↓
[Result saved to Supabase database]
       ↓
[Result shown on screen]
       ↓
[User can view past sessions on History page]
```

Every step in this guide builds one piece of that flow.

---

## Database Design

### What is a database?

Think of a database like a set of spreadsheets. Each spreadsheet is called a **table**. Each row is a **record**. Each column is a **field**.

We're using **Supabase**, which gives us a real Postgres database plus an easy API to talk to it from JavaScript.

### Our Tables

#### `users` table
Supabase creates this automatically when authentication is turned on. You don't need to create it yourself.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique ID for each user (auto-generated) |
| `email` | text | The user's email address |
| `created_at` | timestamp | When they signed up |

#### `sessions` table
Each time a user records and analyzes their speech, one row is added here.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique ID for this session |
| `user_id` | UUID | Links to the user who owns this session |
| `transcript` | text | The words Whisper detected |
| `duration_seconds` | integer | How long the recording was |
| `created_at` | timestamp | When the session happened |

#### `speech_reports` table
Stores the AI analysis for each session. One report per session.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Unique ID for this report |
| `session_id` | UUID | Links to the session this came from |
| `filler_words` | jsonb | e.g. `{"um": 3, "like": 5}` |
| `filler_count` | integer | Total number of filler words |
| `pace_wpm` | integer | Words per minute |
| `clarity_score` | integer | AI score out of 10 |
| `suggestions` | text[] | Array of improvement tips |

### How Tables Relate

Think of it like this:

- A **user** can have many **sessions** (one person records many times)
- A **session** has exactly one **speech_report** (each recording gets one analysis)

This is called a **one-to-many** relationship (user → sessions) and a **one-to-one** relationship (session → report).

The `user_id` in `sessions` is called a **foreign key** — it's a pointer that says "this session belongs to *that* user."

### SQL to Create the Tables

Run this in your Supabase dashboard under **SQL Editor**:

```sql
-- Sessions table
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  transcript text,
  duration_seconds integer,
  created_at timestamptz default now()
);

-- Speech reports table
create table speech_reports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  filler_words jsonb,
  filler_count integer,
  pace_wpm integer,
  clarity_score integer,
  suggestions text[],
  created_at timestamptz default now()
);

-- Row Level Security: users can only see their OWN sessions
alter table sessions enable row level security;
create policy "Users see own sessions"
  on sessions for all
  using (auth.uid() = user_id);

alter table speech_reports enable row level security;
create policy "Users see own reports"
  on speech_reports for all
  using (
    session_id in (
      select id from sessions where user_id = auth.uid()
    )
  );
```

> **What's Row Level Security?** It's a rule in the database that says: even if someone gets your API key, they can ONLY see rows that belong to them. It's a safety net. Always enable it.

---

## Folder Structure

Here's where everything lives and **why**:

```
CogniTalk-Ai-Coach/
│
├── client/                        ← Everything the user sees (React)
│   ├── src/
│   │   ├── components/            ← Reusable building blocks (Button, Card, etc.)
│   │   ├── pages/                 ← Full screens (Login, Dashboard, etc.)
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Recorder.jsx
│   │   │   └── SessionHistory.jsx
│   │   ├── hooks/                 ← Custom React logic you can reuse
│   │   │   └── useAudioRecorder.js
│   │   ├── services/              ← Code that talks to outside services
│   │   │   ├── supabase.js        ← Supabase client setup
│   │   │   └── api.js             ← Calls to your backend
│   │   ├── utils/                 ← Small helper functions
│   │   │   └── formatDate.js
│   │   ├── App.jsx                ← Root component, sets up routing
│   │   └── main.jsx               ← Entry point, renders App into the DOM
│   ├── index.html
│   └── vite.config.js
│
├── server/                        ← The backend (Node.js)
│   ├── routes/
│   │   └── analyze.js             ← POST /api/analyze endpoint
│   ├── services/
│   │   ├── transcribe.js          ← Calls Whisper API
│   │   └── analyzeSpeech.js       ← Calls LLM for feedback
│   ├── app.js
│   └── server.js
│
└── .env                           ← Secret keys (NEVER commit this to Git)
```

### Why this structure?

**`pages/`** — Each file is one full screen. When you navigate to `/dashboard`, React renders `Dashboard.jsx`.

**`components/`** — Pieces that appear in multiple pages. A `Button` component you build once and use everywhere.

**`hooks/`** — Custom React logic. If you find yourself writing the same `useState`/`useEffect` pattern in multiple components, it belongs in a hook.

**`services/`** — Any code that makes network requests. Keeps your components clean — they call `api.analyzeAudio(blob)` without knowing how that works internally.

**`utils/`** — Tiny pure functions. `formatDate("2024-01-01")` → `"January 1, 2024"`. No React, no side effects.

---

## React Concept Deep Dives

Read this section before starting. Come back to it whenever something doesn't make sense.

### Components: The LEGO Blocks

A React component is just a JavaScript function that returns some HTML-looking code (called JSX).

```jsx
// This is a component
function Greeting() {
  return <h1>Hello, world!</h1>;
}
```

Think of your app as a LEGO set. Each component is one LEGO piece. You snap them together to build the full picture.

Your `Dashboard` page is made of smaller components:
- A `WelcomeMessage` component
- A `RecordButton` component
- A `SessionList` component

### Props: Passing Information In

Props are how you pass data INTO a component. Think of them like function arguments.

```jsx
// The component RECEIVES props
function WelcomeMessage({ name }) {
  return <h2>Welcome back, {name}!</h2>;
}

// The parent PASSES props
<WelcomeMessage name="Sarah" />
```

**The rule:** Data flows DOWN. Parents pass to children. Children never directly change what a parent gave them.

### State: Memory Inside a Component

A component's **state** is information it remembers. When state changes, React re-renders the component automatically.

```jsx
import { useState } from "react";

function Counter() {
  // count = current value
  // setCount = function to change it
  const [count, setCount] = useState(0);  // 0 is the starting value

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

**Analogy:** State is like a whiteboard inside the component. `useState` gives you the whiteboard and an eraser. Every time you erase and rewrite, the component re-draws itself.

### useEffect: Do Something When Things Change

`useEffect` runs code *after* the component renders. It's how you:
- Load data from an API when the page opens
- Set up event listeners
- React to a value changing

```jsx
import { useState, useEffect } from "react";

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  // This runs once when the component first appears
  useEffect(() => {
    fetchUser(userId).then(data => setUser(data));
  }, [userId]); // The [] means "run this when userId changes"

  if (!user) return <p>Loading...</p>;
  return <p>Hello, {user.name}</p>;
}
```

**Analogy:** `useEffect` is like setting an alarm. You say: "When THIS happens, do THAT."

### Async Functions: Waiting for Things

When you call an API, it takes time. JavaScript doesn't wait — it keeps running. `async/await` is how you pause and wait for a result:

```javascript
// Without async/await (confusing)
fetch('/api/data')
  .then(res => res.json())
  .then(data => console.log(data));

// With async/await (reads like normal code)
async function loadData() {
  const res = await fetch('/api/data');
  const data = await res.json();
  console.log(data);
}
```

**Analogy:** You order food at a restaurant. Without `await`, you'd sit down and immediately check if the food is ready (it's not). With `await`, you wait until the waiter brings it.

---

## Step 1 — Create the React Project

### What is Vite?

Vite is a tool that sets up a React project for you and runs a development server so you can see changes instantly in the browser. Think of it as a "starter kit" that handles all the boring setup.

Before starting: make sure you have **Node.js** installed. Check by running `node --version` in your terminal. You should see something like `v20.x.x`.

### Commands and What They Do

```bash
# Create a new React + Vite project called "speech-coach"
npm create vite@latest speech-coach -- --template react

# Go into the new folder
cd speech-coach

# Install all the starter dependencies
npm install

# Start the development server
npm run dev
```

Open your browser to `http://localhost:5173`. You should see the Vite + React starter page.

### Install Tailwind CSS

```bash
# Install Tailwind and its required tools
npm install -D tailwindcss postcss autoprefixer

# Create the Tailwind config files
npx tailwindcss init -p
```

Now open `tailwind.config.js` and tell Tailwind which files to watch:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",  // Watch all React files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Open `src/index.css` and replace everything with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```j

### Install React Router (for navigation between pages)

```bash
npm install react-router-dom
```

### Set Up the Backend

```bash
# Go back to the project root, create a server folder
mkdir server
cd server
npm init -y
npm install express cors dotenv multer openai @supabase/supabase-js
```
1
Add `"type": "module"` to `server/package.json` so you can use `import` syntax.

### 🧠 Check Your Understanding

Before moving on, answer these questions (look back at the explanation if needed):

1. What does `npm run dev` do?
2. What does Tailwind CSS do? Why is it useful?
3. Why do we need a separate `server/` folder instead of just using React?

---

## Step 2 — Learn Tailwind CSS

### The Core Idea

Tailwind works differently from regular CSS. Instead of writing:

```css
/* Regular CSS — you write this in a separate file */
.my-button {
  background-color: blue;
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
}
```

You apply classes directly to your HTML/JSX:

```jsx
{/* Tailwind — everything is in the class name */}
<button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
  Click me
</button>
```

### The Classes You'll Use Most

**Colors:**
```
bg-blue-500       ← background color (blue, medium shade)
text-white        ← text color
border-gray-200   ← border color
```

**Spacing (padding and margin):**
```
p-4    ← padding on all sides (4 = 1rem = 16px)
px-4   ← padding left and right
py-2   ← padding top and bottom
m-4    ← margin on all sides
mt-8   ← margin-top
```

**Sizing:**
```
w-full      ← width: 100%
w-64        ← width: 16rem (256px)
h-screen    ← height: 100vh
max-w-md    ← max-width: 28rem
```

**Flexbox:**
```
flex             ← display: flex
items-center     ← align items vertically in center
justify-between  ← space between items horizontally
gap-4            ← space between flex children
flex-col         ← stack children vertically
```

**Text:**
```
text-xl       ← font size larger
font-bold     ← bold
text-center   ← centered
```

**Borders and Shapes:**
```
rounded-lg        ← border radius (rounded corners)
rounded-full      ← circle/pill shape
border            ← adds a border
shadow-sm         ← small drop shadow
```

**Responsive Prefixes:**
```
sm:text-lg    ← applies at small screens and up
md:flex-row   ← applies at medium screens and up
lg:w-1/2      ← applies at large screens and up
```

### 🏋 Exercise 2A: Build a Profile Card

Without looking at any examples, try to build a card component that looks like this using only Tailwind classes:

```
┌─────────────────────────┐
│  👤 Sarah Johnson       │
│  sarah@email.com        │
│  Member since 2024      │
│                         │
│  [View Profile Button]  │
└─────────────────────────┘
```

Requirements:
- White background, rounded corners, shadow
- Name in bold, large text
- Email in gray, smaller text
- A blue button at the bottom

**Write the JSX yourself.** Come back and check when done.

<details>
<summary>💡 Hint (only open if stuck for 10+ minutes)</summary>

Start with the outer container:
```jsx
<div className="bg-white rounded-xl shadow-md p-6 max-w-sm">
  {/* content goes here */}
</div>
```
Then add each piece inside it one at a time.
</details>

### 🏋 Exercise 2B: Build a Responsive Nav Bar

Build a navigation bar that:
- Has the app name on the left
- Has "Dashboard" and "History" links on the right
- Stacks vertically on mobile, horizontal on desktop (`flex-col` on mobile, `sm:flex-row` on larger)

---

## Step 3 — Authentication System

### What is Authentication?

Authentication (often called "auth") is how the app knows *who you are*. When you sign up, you give an email and password. When you log in, the app checks: "Is this really them?"

Supabase handles all the hard parts (storing passwords securely, sending confirmation emails, managing sessions). We just need to connect our UI to it.

### Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a free project
2. Go to **Project Settings → API**
3. Copy your **Project URL** and **anon/public key**
4. Create a `.env` file in your `client/` folder:

```env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

> **Why `VITE_` prefix?** Vite only exposes environment variables to your frontend code if they start with `VITE_`. This protects your other secrets.

Now create `src/services/supabase.js`:

```javascript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default supabase;
```

This creates one Supabase client that you import wherever you need it.

### React Concept: Controlled Forms

A "controlled form" means React is in charge of what's in the input. Every keystroke updates state, and the input's value always reflects that state.

```jsx
function LoginForm() {
  const [email, setEmail] = useState("");

  return (
    <input
      value={email}                          // Input shows what's in state
      onChange={(e) => setEmail(e.target.value)}  // State updates on every keystroke
      type="email"
      placeholder="your@email.com"
    />
  );
}
```

**Why does this matter?** When the user clicks "Submit", you already have `email` in state — you don't need to dig through the DOM to find it.

### How Supabase Auth Works

```javascript
// Sign up a new user
const { data, error } = await supabase.auth.signUp({
  email: "sarah@example.com",
  password: "securepassword",
});

// Log in
const { data, error } = await supabase.auth.signInWithPassword({
  email: "sarah@example.com",
  password: "securepassword",
});

// Log out
await supabase.auth.signOut();

// Get the currently logged-in user
const { data: { user } } = await supabase.auth.getUser();
```

When login succeeds, Supabase stores a **session token** in localStorage automatically. On page refresh, it's still there.

### Protected Routes

A protected route is a page that only logged-in users can see. If you're not logged in and you try to go to `/dashboard`, it should send you back to `/login`.

Here's how to build one:

```jsx
// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from "../services/supabase";

function ProtectedRoute({ children }) {
  const [user, setUser] = useState(undefined); // undefined = still loading

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user); // null if logged out, object if logged in
    });
  }, []);

  if (user === undefined) return <p>Loading...</p>;
  if (user === null) return <Navigate to="/login" />;

  return children; // User is logged in — show the page
}
```

### 🏋 Challenge 3A: Build the Signup Page

Build `src/pages/Signup.jsx`. It should have:

- Email input (controlled)
- Password input (controlled)
- A submit button
- An error message if signup fails
- A link to the Login page

**Write it yourself step by step:**

1. First, create the component with just the JSX (no logic)
2. Add `useState` for email and password
3. Add `onChange` handlers to connect inputs to state
4. Add the `handleSubmit` async function that calls `supabase.auth.signUp`
5. Add error state and display it if there's an error
6. Redirect to `/dashboard` on success using `useNavigate` from react-router-dom

<details>
<summary>💡 Hint: The form structure</summary>

```jsx
async function handleSubmit(e) {
  e.preventDefault(); // Prevent page refresh (default form behavior)
  
  const { error } = await supabase.auth.signUp({ email, password });
  
  if (error) {
    setError(error.message);
  } else {
    navigate("/dashboard");
  }
}
```
</details>

### 🏋 Challenge 3B: Build the Login Page

Same structure as Signup, but using `supabase.auth.signInWithPassword`.


### 🏋 Challenge 3C: Set Up Routing in App.jsx

In `src/App.jsx`, set up your routes using React Router:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Write the routes yourself */}
        {/* Hint: /dashboard should be wrapped in <ProtectedRoute> */}
      </Routes>
    </BrowserRouter>
  );
}
```

---

## Step 4 — Build the Dashboard

### What is the Dashboard?

The Dashboard is the home base after login. It should show:

1. A welcome message with the user's name/email
2. A button to start a new recording
3. A list of recent sessions

### React Concept: Props

The Dashboard will be made of several components. They communicate through props.

```jsx
// Parent (Dashboard page) passes data down
function Dashboard() {
  const user = { email: "sarah@example.com" };

  return (
    <div>
      <WelcomeMessage email={user.email} />
    </div>
  );
}

// Child (WelcomeMessage component) receives it
function WelcomeMessage({ email }) {
  return <h1>Welcome, {email}!</h1>;
}
```

### Getting the Logged-In User

When the Dashboard loads, you need to fetch the current user from Supabase:

```jsx
function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Ask Supabase: who is currently logged in?
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []); // Empty [] = run once when page loads

  // ...rest of component
}
```

### 🏋 Challenge 4A: Create a WelcomeMessage Component

Create `src/components/WelcomeMessage.jsx`.

It should:
- Accept an `email` prop
- Show "Welcome back!" and display the email
- Be styled nicely with Tailwind

### 🏋 Challenge 4B: Build the Dashboard Layout

Build `src/pages/Dashboard.jsx`. Requirements:

1. Fetch the current user in a `useEffect`
2. Show a loading state while fetching
3. Render `<WelcomeMessage email={user.email} />`
4. Add a "Start Recording" button that navigates to `/recorder`
5. Add a "View History" link to `/history`
6. Add a "Sign Out" button that calls `supabase.auth.signOut()` then redirects to `/login`

<details>
<summary>💡 Hint: Sign out</summary>

```javascript
async function handleSignOut() {
  await supabase.auth.signOut();
  navigate("/login");
}
```
</details>

---

## Step 5 — Build the Audio Recorder

### How Browser Recording Works

The browser has a built-in API called `MediaRecorder`. Here's the sequence:

1. Ask the user for microphone permission
2. Get a **stream** — a live feed of audio data
3. Create a `MediaRecorder` attached to that stream
4. It fires an event every time it has a **chunk** of audio data
5. When you stop, combine all the chunks into one **Blob** (a file-like object)

### Key Browser APIs

```javascript
// Step 1: Request microphone access
// This shows the "Allow microphone" popup
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

// Step 2: Create a recorder attached to the stream
const recorder = new MediaRecorder(stream);

// Step 3: Collect audio chunks as they come in
const chunks = [];
recorder.ondataavailable = (event) => {
  chunks.push(event.data); // Save each chunk
};

// Step 4: When recording stops, combine chunks into one file
recorder.onstop = () => {
  const audioBlob = new Blob(chunks, { type: "audio/webm" });
  // audioBlob is now a complete audio file you can upload
};

// Step 5: Start and stop
recorder.start();             // Start recording
recorder.stop();              // Stop recording (triggers onstop)
```

### The Three States of the Recorder

Your recorder component needs to handle three states:

- **idle** — mic not active, showing a "Record" button
- **recording** — mic is active, showing a "Stop" button with a timer
- **done** — recording finished, showing the audio and an "Analyze" button

### 🧠 Think First

Before looking at any hints, answer these:

1. What `useState` variables will you need? (think about: what changes in each state?)
2. What does `useEffect` do if the user navigates away while still recording? (Should you clean up?)
3. Why do we collect chunks in an array instead of just saving one big piece?

### 🏋 Challenge 5A: Build the `useAudioRecorder` Hook

Create `src/hooks/useAudioRecorder.js`.

The hook should return:
- `isRecording` (boolean)
- `audioBlob` (the final audio file, or null)
- `duration` (seconds elapsed while recording)
- `startRecording` (function)
- `stopRecording` (function)
- `resetRecording` (function — clears audioBlob so you can record again)
- `error` (any error message, e.g., if mic is denied)

**Write it step by step:**

1. Define all the state variables with `useState`
2. Write `startRecording` — request mic, set up recorder, start it
3. Write `stopRecording` — stop the recorder
4. Add the duration timer using `setInterval` inside `startRecording`
5. Handle errors (permission denied, no microphone found)
6. Add cleanup: stop mic tracks when done

<details>
<summary>💡 Hint: The cleanup problem</summary>

Refs don't cause re-renders but persist across renders. Use `useRef` to store the recorder and interval:

```javascript
const mediaRecorderRef = useRef(null);
const chunksRef = useRef([]);
const timerRef = useRef(null);
```

For cleanup, stop the stream tracks in `recorder.onstop`:
```javascript
stream.getTracks().forEach(track => track.stop());
```
</details>

### 🏋 Challenge 5B: Build the Recorder UI

Create `src/pages/Recorder.jsx`.

It should:
1. Import and use your `useAudioRecorder` hook
2. Show different UI based on state (idle / recording / done)
3. Show a pulsing animation while recording
4. Show elapsed time while recording
5. Show an "Analyze" button when done

---

## Step 6 — Convert Speech to Text

### How the Backend Pipeline Works

Your React app can't call the Whisper API directly (for security — you don't want your OpenAI key exposed in the browser). Instead:

```
React → (POST audio file) → Your Node.js Server → (forward to Whisper) → Returns transcript → Back to React
```

### What is FormData?

`FormData` is how you send files over HTTP. Think of it like packing a box:

```javascript
const formData = new FormData();
formData.append("audio", audioBlob, "recording.webm");  // Put the file in the box
formData.append("duration", String(recordingDuration)); // Add extra info

// Ship the box to your backend
const response = await fetch("http://localhost:3001/api/analyze", {
  method: "POST",
  body: formData,  // The browser sets Content-Type automatically — don't set it manually
});
```

### Async JavaScript Pattern

Here's the pattern you'll use every time you call an API:

```javascript
async function analyzeAudio(formData) {
  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Server error: " + response.status);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Failed to analyze audio:", error);
    throw error; // Re-throw so the calling component can handle it
  }
}
```

### 🧠 Think First

1. Where should you add a "loading" state in the Recorder component? (Between clicking Analyze and getting results)
2. What happens if the upload takes 10 seconds? What should the user see?
3. What if the server is down? How do you show an error message?

### 🏋 Challenge 6A: Add the API Call to the Recorder

In `src/services/api.js`, write an `analyzeAudio(formData)` function.

In `src/pages/Recorder.jsx`, update the "Analyze" button to:
1. Set an `isUploading` state to `true`
2. Call `analyzeAudio(formData)`
3. When results come back, store them in state and show them
4. Set `isUploading` to `false` when done (whether success or error)
5. Show an error message if it fails

### 🏋 Challenge 6B: Build the Backend Endpoint

In `server/routes/analyze.js`, build `POST /api/analyze`:

1. Use `multer` to receive the audio file (it parses multipart/form-data)
2. Call your `transcribe` service with the audio buffer
3. Return the transcript as JSON

For the transcription service in `server/services/transcribe.js`:

```javascript
import OpenAI from "openai";

const openai = new OpenAI(); // Reads OPENAI_API_KEY from environment

export async function transcribeAudio(audioBuffer, filename) {
  const audioFile = new File([audioBuffer], filename, { type: "audio/webm" });

  const transcript = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    language: "en",
    response_format: "text",
  });

  return transcript.trim();
}
```

---

## Step 7 — Analyze Speech with AI

### Prompt Engineering: Getting Structured Responses

When you ask the LLM for speech feedback, you need it to respond in a format you can parse and display. The trick is being very explicit in your prompt.

```
You are a speech coach. Analyze the transcript below and return ONLY a valid 
JSON object with no additional text, markdown formatting, or explanation.

The JSON must have exactly this structure:
{
  "clarity_score": <integer 1-10>,
  "clarity_feedback": "<one sentence>",
  "suggestions": ["<tip 1>", "<tip 2>", "<tip 3>"]
}
```

The phrase "return ONLY a valid JSON object" is crucial. Without it, the model often wraps the JSON in markdown code fences or adds explanation text, which breaks `JSON.parse()`.

### Parsing the Response

```javascript
const rawText = response.choices[0].message.content;

let analysis;
try {
  analysis = JSON.parse(rawText);
} catch (error) {
  // If parsing fails, fall back to safe defaults
  console.error("LLM returned non-JSON:", rawText);
  analysis = {
    clarity_score: 5,
    clarity_feedback: "Analysis unavailable.",
    suggestions: ["Try recording again."],
  };
}
```

### 🧠 Think First

1. Why do we compute filler word counts in code rather than asking the LLM to count them?
2. What's the benefit of having `suggestions` be an array rather than one long string?
3. What should happen if the user speaks for only 2 seconds and there's barely any transcript?

### 🏋 Challenge 7A: Write the LLM Analysis Service

Create `server/services/analyzeSpeech.js`.

It should:
1. Accept a `transcript` string and `durationSeconds` number
2. Count filler words yourself using regex (don't rely on the LLM for this)
3. Calculate words per minute: `(wordCount / durationSeconds) * 60`
4. Call GPT-4o with a well-crafted system prompt asking for clarity score and suggestions
5. Parse the JSON response safely (with a try/catch fallback)
6. Return one combined object with all metrics

<details>
<summary>💡 Hint: Counting filler words with regex</summary>

```javascript
function countFiller(transcript, word) {
  const regex = new RegExp(`\\b${word}\\b`, "gi");
  return (transcript.match(regex) || []).length;
}

const fillerList = ["um", "uh", "like", "you know", "basically", "literally"];
const fillerCounts = {};

for (const word of fillerList) {
  const count = countFiller(transcript, word);
  if (count > 0) fillerCounts[word] = count;
}
```
</details>

---

## Step 8 — Save Session Data

### Connecting React to Supabase

Saving data to Supabase from React is straightforward. Import your Supabase client and use it:

```javascript
import supabase from "../services/supabase";

async function saveSession(transcript, analysis) {
  // First, get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();

  // Insert a new row in the sessions table
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .insert({
      user_id: user.id,
      transcript: transcript,
      duration_seconds: analysis.duration_seconds,
    })
    .select()   // Return the newly created row
    .single();  // We're inserting one row, so return one object (not array)

  if (sessionError) throw sessionError;

  // Then insert the report linked to this session
  const { error: reportError } = await supabase
    .from("speech_reports")
    .insert({
      session_id: session.id,
      filler_words: analysis.filler_words,
      filler_count: analysis.filler_count,
      pace_wpm: analysis.pace_wpm,
      clarity_score: analysis.clarity_score,
      suggestions: analysis.suggestions,
    });

  if (reportError) throw reportError;

  return session;
}
```

### 🏋 Challenge 8A: Save After Analysis

Update your backend's `POST /api/analyze` route so that after analysis is complete, it saves to Supabase.

> **Important:** The backend needs its own Supabase client with the **service role key** (not the anon key), because the backend acts on behalf of users. Add `SUPABASE_SERVICE_ROLE_KEY` to your server's `.env` file.

### 🏋 Challenge 8B: Display Results in the UI

After analysis succeeds in the Recorder page, display the results. Create a `AnalysisResult` component that shows:

- Clarity score (out of 10) with a color: green ≥ 8, yellow ≥ 5, red < 5
- Words per minute with a label: "Too slow" < 110, "Good" 110–160, "Too fast" > 160
- A list of filler words with counts
- The list of suggestions
- The transcript text with filler words highlighted

---

## Step 9 — Session History Page

### Fetching Data from Supabase

To load the user's past sessions:

```javascript
const { data, error } = await supabase
  .from("sessions")
  .select(`
    id,
    created_at,
    duration_seconds,
    transcript,
    speech_reports (
      clarity_score,
      pace_wpm,
      filler_count
    )
  `)
  .order("created_at", { ascending: false })  // Newest first
  .limit(20);
```

This is a **joined query** — it fetches sessions AND their related reports in one call. Supabase handles the join for you because of the foreign key relationship you set up.

### 🧠 Think First

1. What happens if a user has no sessions yet? What should the page show?
2. How do you show a "loading" state while sessions are being fetched?
3. How do you handle the case where `speech_reports` is null for a session?

### 🏋 Challenge 9A: Build the Session History Page

Create `src/pages/SessionHistory.jsx`. It should:

1. On mount (`useEffect`), fetch all sessions for the logged-in user
2. Show a loading spinner while fetching
3. Show "No sessions yet — go record your first one!" if the array is empty
4. For each session, show a card with:
   - The date (format it nicely — write a `formatDate` util function)
   - Duration in seconds
   - Clarity score
   - Filler word count

### 🏋 Challenge 9B: Add a Progress Chart (Stretch Goal)

Install `recharts`:
```bash
npm install recharts
```

Build a line chart showing the user's clarity score over their last 10 sessions. This gives them visual proof they're improving.

```jsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

// Shape of data the chart needs:
// [{ date: "Jan 1", score: 6 }, { date: "Jan 5", score: 7 }, ...]
```

---

## Tailwind Tips

### Keep Components Clean

Instead of writing the same long class strings over and over, extract them:

```jsx
// Messy — these classes repeat everywhere
<button className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600">
  Save
</button>
<button className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600">
  Submit
</button>

// Better — make a reusable component
function PrimaryButton({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white font-medium py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
    >
      {children}
    </button>
  );
}
```

### Organize Complex Class Strings

When a component has many Tailwind classes, put them in a variable:

```jsx
const cardClasses = [
  "bg-white",
  "rounded-xl",
  "shadow-md",
  "p-6",
  "border border-gray-100",
  "hover:shadow-lg",
  "transition-shadow",
].join(" ");

return <div className={cardClasses}>...</div>;
```

### Conditional Classes

```jsx
// Use template literals for conditional styling
<div className={`p-4 rounded-lg ${isError ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
  {message}
</div>
```

---

## When Things Break

This is not an "if" — it's a "when." Every developer hits these. Knowing what to look for saves hours.

### CORS Errors

**Symptom:** Browser console says: `Access to fetch at 'http://localhost:3001' from origin 'http://localhost:5173' has been blocked by CORS policy`

**What it means:** The browser blocks requests from one domain (your React app) to another (your backend) unless the backend explicitly allows it.

**Fix:** Make sure your Express server has `cors` set up correctly:

```javascript
import cors from "cors";
app.use(cors({ origin: "http://localhost:5173" }));
```

**Checklist:**
- Is `cors` imported?
- Is `app.use(cors(...))` before your routes?
- Is the allowed origin exactly right (including port number)?

### API Key Not Working

**Symptom:** 401 Unauthorized or `invalid_api_key` error

**Checklist:**
- Does `.env` exist in the right folder?
- Does the variable name match exactly (case-sensitive)?
- Did you restart the server after adding `.env`? (Node doesn't auto-reload env vars)
- Are you accidentally logging the key somewhere, then copy-pasting from a log with extra spaces?

### React State Not Updating

**Symptom:** You called `setState(newValue)` but the old value is still being used.

**The problem:** State updates are asynchronous. The new value isn't available until the next render.

```javascript
// WRONG — count is still the old value on the next line
setCount(count + 1);
console.log(count); // Still shows old value!

// CORRECT — use the result from state, not the immediate return
setCount(prev => prev + 1);
// Or use useEffect to react to count changing
```

### Supabase "Not Authenticated" Error

**Symptom:** Supabase returns `{ error: { message: "JWT expired" } }` or similar

**What it means:** The user's session token has expired, or they're not logged in.

**Fix:** Check for the user before making Supabase calls. If there's no user, redirect to login:

```javascript
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  navigate("/login");
  return;
}
```

### Microphone Permission Denied

**Symptom:** `getUserMedia()` throws a `NotAllowedError`

**Checklist:**
- Are you testing on `localhost`? (HTTPS or localhost is required for mic access)
- Has the user accidentally clicked "Block" on the permission prompt?
- In Chrome: check the lock icon in the address bar → Site settings → Microphone → Allow

### Audio Blob is Empty

**Symptom:** The blob is created but it's 0 bytes, or Whisper returns no transcript

**Common causes:**
- `recorder.start()` was called without specifying a timeslice: use `recorder.start(250)` to get chunks every 250ms
- The `onstop` event handler wasn't set up before calling `start()`
- The chosen MIME type isn't supported by the browser — check with `MediaRecorder.isTypeSupported("audio/webm")`

### "Cannot read properties of null"

**Symptom:** `TypeError: Cannot read properties of null (reading 'email')`

**What it means:** You tried to access a property on a variable that's `null` — meaning the data hasn't loaded yet.

**Fix:** Always guard against null/undefined with early returns:

```jsx
if (!user) return <p>Loading...</p>;

// Now you can safely use user.email
```

### General Debugging Strategy

1. **Read the error message** — it usually tells you exactly what's wrong and which line
2. **Add `console.log()`** at each step to see what values actually are
3. **Check the Network tab** in browser DevTools — see exactly what was sent and what came back
4. **Check the terminal** where your server is running — backend errors show there
5. **Isolate the problem** — comment out half the code, see if it breaks, then narrow down where the bug is

---

## 🎯 Progress Tracking

Use this checklist as you complete each step:

- [ ] Step 1: Project created, Tailwind installed, dev server running
- [ ] Step 2: Profile card exercise done, Nav bar exercise done
- [ ] Step 3: Signup page, Login page, Protected routes working
- [ ] Step 4: Dashboard shows user email, sign-out works
- [ ] Step 5: `useAudioRecorder` hook works, can record and stop
- [ ] Step 6: Audio uploads to backend, transcript returned
- [ ] Step 7: Analysis works, results shown on screen
- [ ] Step 8: Sessions saved to Supabase
- [ ] Step 9: History page shows past sessions
- [ ] Stretch: Progress chart showing improvement over time

---

## Final Note

You will get stuck. That's not a sign you're failing — it's the whole point. Every time you push through a confusing bug, you understand the system one level deeper.

When stuck, in order:
1. Re-read this guide section for the step you're on
2. Read the official docs for the tool you're using
3. Search the exact error message
4. Ask for help — but describe: what you tried, what you expected, what actually happened

Good luck. 🎙