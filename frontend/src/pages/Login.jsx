import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import docImg from '../assets/HD1.png';
import { useAppContext } from '../context/AppContext';
import { useGoogleLogin } from '@react-oauth/google';
import SEOHead from '../components/SEOHead';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAppContext();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: identifier, password })
      });
      const data = await res.json();
      
      if (data.success) {
        login(data.token, data.data);
      } else {
        setError(data.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Error signing in", err);
      setError("Something went wrong. Please try again.");
    }
  };

  const handleGoogleSignIn = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('/api/auth/google-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token: tokenResponse.access_token })
        });
        const data = await res.json();
        
        if (data.success) {
          login(data.token, data.data);
        } else {
          setError(data.message || "Google Sign-In failed.");
        }
      } catch (err) {
        console.error("Error signing in with Google", err);
        setError("Something went wrong. Please try again.");
      }
    },
    onError: (error) => {
      console.error("Google login failed", error);
      setError("Google Login failed. Please try again.");
    }
  });

  const portalToken = localStorage.getItem('portalToken');
  const portalRole = localStorage.getItem('portalRole');

  return (
    <div className="min-h-screen bg-primary-50 flex justify-center p-4 pt-8 pb-12">
      <SEOHead
        title="Patient Login — MEDICORE Healthcare Portal"
        description="Log in to your MEDICORE patient account to manage appointments, view medical records, prescriptions, and access AI-powered health services."
        keywords="medicore login, patient portal, manage appointments, medical records"
        canonical="https://medicore.care/login"
      />
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full h-fit">
        {portalToken ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Already Logged In</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              You are currently logged in as a portal staff member (<span className="font-bold text-primary-600 uppercase">{portalRole}</span>). Please log out from the portal to sign in as a patient.
            </p>
            <div className="space-y-3">
              <Link
                to={portalRole === 'admin' ? '/admin/dashboard' : portalRole === 'doctor' ? '/doctor/dashboard' : '/laboratory/dashboard'}
                className="block w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm text-center"
              >
                Go back to Dashboard
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('portalToken');
                  localStorage.removeItem('portalRole');
                  window.location.reload();
                }}
                className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 rounded-xl border border-rose-200 transition-all text-sm cursor-pointer"
              >
                Logout from Portal
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-primary-800">Patient Login</h2>
              <p className="text-gray-500 mt-2">Login to manage your medical records</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/80 border border-red-500 text-white p-3 rounded-xl text-sm text-center font-medium shadow-inner">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address or Username</label>
                <input 
                  type="text" 
                  required
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all outline-none text-primary-800 font-medium placeholder:text-gray-400 placeholder:font-normal" 
                  placeholder="Enter email or username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all outline-none text-primary-800 font-medium placeholder:text-gray-400" 
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center justify-center"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-primary-500 text-white font-bold py-3.5 rounded-xl hover:bg-primary-600 shadow-md hover:shadow-lg transition-all mt-6 cursor-pointer text-sm"
              >
                Login
              </button>

              <div className="flex items-center justify-between py-2">
                <div className="h-px bg-gray-200 flex-1"></div>
                <span className="text-gray-400 text-xs font-semibold px-3">OR</span>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                type="button"
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold shadow-xs transition-all duration-300 border border-gray-200 cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </button>

              <div className="pt-2 text-center">
                <Link to="/signup" className="text-primary-600 hover:text-primary-800 text-sm font-bold transition-colors">
                  Create your account &rarr;
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
