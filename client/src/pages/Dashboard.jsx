
function Dashboard() {

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



  return (
    <div className="dashboard">
      <h1 className="text-2xl font-bold">CogniTalk</h1>
      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={() => supabase.auth.signOut()}
      >
        Sign Out
      </button>
      <button 
      className="bg-blue-500 text-white px-4 py-2 rounded"
      onClick={() => window.location.href = "/recorder"}
      >Start Recording</button>
      <h2 
      className="text-xl font-semibold"
               
      >Recent Sessions</h2>
    </div>

  )




}