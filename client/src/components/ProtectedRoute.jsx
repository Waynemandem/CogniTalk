import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import supabase from '../services/supabase';

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

export default ProtectedRoute;