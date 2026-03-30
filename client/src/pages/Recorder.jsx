import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudioRecorder } from "../hooks/useAudioRecorder";

export default function Recorder() {
  const navigate = useNavigate();
  const {
    isRecording,
    audioBlob,
    duration,
    error,
    startRecording,
    stopRecording,
    resetRecording,
  } = useAudioRecorder();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [result, setResult] = useState(null);

  // Format seconds as 0:00
  function formatDuration(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  async function handleAnalyze() {
    if (!audioBlob) return;
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      formData.append("duration", String(duration));

      const res = await fetch("http://localhost:3001/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Server error: " + res.status);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setUploadError("Analysis failed. Make sure your server is running.");
    } finally {
      setIsUploading(false);
    }
  }

  // If we have results, show the results screen
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-100 px-6 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎙</span>
              </div>
              <span className="font-bold text-gray-900">CogniTalk</span>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              ← Dashboard
            </button>
          </div>
        </nav>

        <main className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Results</h1>
            <p className="text-gray-500 text-sm mt-1">
              {result.duration_seconds}s recording · {result.word_count} words
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 font-medium mb-1">Clarity</p>
              <p className="text-2xl font-bold text-gray-900">{result.clarity_score}<span className="text-sm text-gray-400">/10</span></p>
              <p className={`text-xs font-medium mt-1 ${result.clarity_score >= 8 ? "text-green-600" : result.clarity_score >= 5 ? "text-amber-600" : "text-red-600"}`}>
                {result.clarity_score >= 8 ? "Excellent" : result.clarity_score >= 5 ? "Fair" : "Needs work"}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 font-medium mb-1">Pace</p>
              <p className="text-2xl font-bold text-gray-900">{result.pace_wpm}<span className="text-sm text-gray-400"> wpm</span></p>
              <p className={`text-xs font-medium mt-1 ${result.pace_wpm >= 110 && result.pace_wpm <= 160 ? "text-green-600" : "text-amber-600"}`}>
                {result.pace_wpm < 110 ? "Too slow" : result.pace_wpm > 160 ? "Too fast" : "Good pace"}
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-400 font-medium mb-1">Fillers</p>
              <p className="text-2xl font-bold text-gray-900">{result.filler_count}</p>
              <p className={`text-xs font-medium mt-1 ${result.filler_count <= 3 ? "text-green-600" : result.filler_count <= 8 ? "text-amber-600" : "text-red-600"}`}>
                {result.filler_count <= 3 ? "Great" : result.filler_count <= 8 ? "Moderate" : "High"}
              </p>
            </div>
          </div>

          {/* Filler words */}
          {result.filler_words && Object.keys(result.filler_words).length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Filler Words Detected</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.filler_words).map(([word, count]) => (
                  <span key={word} className="bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full">
                    "{word}" ×{count}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Suggestions</h3>
              <ul className="flex flex-col gap-3">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                    <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Transcript */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Transcript</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{result.transcript}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { resetRecording(); setResult(null); }}
              className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Record Again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-black text-white rounded-xl py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Main recorder screen
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🎙</span>
            </div>
            <span className="font-bold text-gray-900">CogniTalk</span>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-16 flex flex-col items-center gap-8">

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">New Session</h1>
          <p className="text-gray-500 text-sm mt-1">
            Speak naturally for at least 30 seconds for best results
          </p>
        </div>

        {/* Recording Circle */}
        <div className="relative flex items-center justify-center">
          {isRecording && (
            <>
              <div className="absolute w-48 h-48 rounded-full bg-red-100 animate-ping opacity-20" />
              <div className="absolute w-40 h-40 rounded-full bg-red-100 animate-pulse opacity-40" />
            </>
          )}
          <div className={`relative w-36 h-36 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 ${
            isRecording ? "border-red-400 bg-red-50" :
            audioBlob ? "border-green-400 bg-green-50" :
            "border-gray-200 bg-white"
          }`}>
            {!audioBlob && (
              <span className={`text-3xl ${isRecording ? "animate-pulse" : ""}`}>🎙</span>
            )}
            {audioBlob && <span className="text-3xl">✅</span>}
            {isRecording && (
              <span className="text-red-500 font-mono text-sm font-semibold mt-1">
                {formatDuration(duration)}
              </span>
            )}
            {audioBlob && !isRecording && (
              <span className="text-green-600 font-mono text-xs font-semibold mt-1">
                Ready
              </span>
            )}
          </div>
        </div>

        {/* Status text */}
        <p className="text-sm text-gray-500">
          {isRecording ? "Recording... speak clearly" :
           audioBlob ? "Recording complete!" :
           "Press Start to begin"}
        </p>

        {/* Error */}
        {(error || uploadError) && (
          <div className="w-full bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 text-center">
            {error || uploadError}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 w-full max-w-xs">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className="flex-1 bg-black text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Start Recording
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex-1 bg-red-500 text-white rounded-xl py-3 text-sm font-semibold hover:bg-red-600 transition-colors"
            >
              Stop Recording
            </button>
          )}

          {audioBlob && !isRecording && (
            <>
              <button
                onClick={() => { resetRecording(); }}
                disabled={isUploading}
                className="flex-1 border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-40"
              >
                Re-record
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isUploading}
                className="flex-1 bg-black text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {isUploading ? "Analyzing..." : "Analyze"}
              </button>
            </>
          )}
        </div>

      </main>
    </div>
  );
}