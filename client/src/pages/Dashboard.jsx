import { useState, useEffect } from "react";
import supabase from '../services/supabase.js';
import { useNavigate } from "react-router-dom";
import { Button }  from '../components/ui/Button';


function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  async function loadDashboard() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: sessions } = await supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);  

    setUser(user);
    setSessions(sessions);
    setLoading(false);
    
  }
  loadDashboard();
}, []);

   if (loading) return <p>Loading...</p>;

   async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/login');
   }


  return (
    <div className="dashboard">
      <h1 className="text-2xl font-bold">CogniTalk</h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={handleSignOut}
      >
        Sign Out
      </button>
      <button 
      className="bg-blue-500 text-white px-4 py-2 rounded"
      onClick={() => navigate("/recorder")}
      >Start Recording</button>
      <h2 
      className="text-xl font-semibold"
      >Recent Sessions</h2>
      {sessions.length === 0? (
        <p>No sessions yet</p>) : 
        sessions.map((session) => (
          <div key={session.id} className="session-card">
            <p>{session.created_at}</p>
          </div>
        ))}
    </div>

  )




}


export default Dashboard;