import { useState } from "react";
import supabase from '../services/supabase';
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";



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
        <div className="min-h-screen items-center justify-center bg-gray-100 px-4">
            <p className="text-2xl font-bold text-center"
            >
              CogniTalk</p>
           <p className="text-2xl font-bold text-center mb-6"
           >
            Create an account</p>

        <Button 
        onClick={() => {}} 
        className={`w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition`}
        >
          Sign up with Google</Button>
        
        <Button 
        onClick={() => {}} 
        className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-red-600 transition`}
        >
          Sign up with Twitter</Button>

        <p className="text-sm text-gray-500">or</p>


        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-black"
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