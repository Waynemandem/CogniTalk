import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";



function Signup() {
const navigate = useNavigate();
    
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);


async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) {
    setError(error.message);
    setLoading(false);
  } else {
    setLoading(false);
    navigate("/dashboard");
  }
}
    return(
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-2xl font-bold text-center">CogniTalk</p>
           <p>Create an account</p>

        <Button onClick={() => {}}>Sign up with Google</Button>
        <Button onClick={() => {}}>Sign up with Twitter</Button>

        <p className="text-sm text-gray-500">or</p>


        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </Button>
        </form>

        <p className="">
            Already have an account? <Link to="/login" className="text-blue-500 hover:underline">
              Log in
            </Link>
        </p>
      </div>
    )
}  



export default Signup;