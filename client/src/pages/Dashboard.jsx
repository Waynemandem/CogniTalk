import { useState, useEffect } from "react";
import supabase from "../services/supabase.js";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data: sessions } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      setUser(user);
      setSessions(sessions || []);
      setLoading(false);
    }

    loadDashboard();
  }, []);

  if (loading) return <p className="p-6 text-center">Loading...</p>;

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-2xl p-6">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">CogniTalk</h1>
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            onClick={handleSignOut}
          >
            Sign Out
          </button>
        </div>

        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold">
            Welcome back{user?.email ? `, ${user.email}` : ""}
          </h2>
          <p className="text-gray-500 text-sm">
            Track and review your recent recording sessions.
          </p>
        </div>

        {/* Actions */}
        <div className="mb-8">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => navigate("/recorder")}
          >
            Start Recording
          </button>
        </div>

        {/* Sessions Section */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-semibold">Recent Sessions</h2>
            <span className="text-sm text-gray-500">
              {sessions.length} session{sessions.length !== 1 && "s"}
            </span>
          </div>

          {sessions.length === 0 ? (
            <p className="text-gray-500">No sessions yet</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="p-4 bg-gray-50 rounded-xl border hover:shadow-sm transition"
                >
                  <p className="text-sm text-gray-700">
                    {new Date(session.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;