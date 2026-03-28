import { Button } from  "../components/ui/Button";
import { useState } from "react";
import supabase from '../services/supabase';
import { useNavigate, Link } from "react-router-dom";


function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] =useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
  e.preventDefault();
   setLoading(true);
   const {error} = await supabase.auth.signInWithPassword({ email, password});
   if (error) {
    setError(error.message);
    setLoading(false);
   } else {
    setLoading(false);
    navigate("/dashboard");
   }
  }

    return(
        <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      
      {/* Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900">
          CogniTalk
        </h1>
        <h2 className="mt-6 text-lg font-semibold text-gray-700">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500">
          Sign in to continue
        </p>
      </div>

      {/* Form Container */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-xl shadow-lg space-y-6">
        
        {/* Social Buttons */}
        <div className="space-y-3 mb-6">
          <Button 
          onClick={() => {}} 
          lassName="w-full bg-red-500 hover:bg-red-600">Login with Google</Button>
          <Button 
          onClick={() => {}} 
          lassName="w-full bg-blue-500 hover:bg-blue-600">Login with Twitter</Button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-300"></div>
          <p className="text-sm text-gray-500">or</p>
          <div className="h-px flex-1 bg-gray-300"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your password"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </p>

      </div>
    </div>
    )
}


export default Login;