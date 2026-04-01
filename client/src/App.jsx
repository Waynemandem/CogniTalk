
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import Recorder from "./pages/Recorder";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
            </ProtectedRoute>
            } 
            />
              
        <Route 
        path="/recorder" 
        element={
          <ProtectedRoute>
            <Recorder />
          </ProtectedRoute>  
        }  
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;