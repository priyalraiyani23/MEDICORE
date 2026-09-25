import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalAuth } from '../../hooks/usePortalAuth';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';

const PortalLogin = () => {
  const [role, setRole] = useState('doctor'); // default
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = usePortalAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      let endpoint = '';
      if (role === 'admin') {
        endpoint = '/api/admin/login';
      } else if (role === 'doctor') {
        endpoint = '/api/doctors/login';
      } else {
        endpoint = '/api/auth/staff-login';
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (data.success) {
        login(data.token, role);
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'doctor') {
          navigate('/doctor/dashboard');
        } else if (role === 'laboratory') {
          navigate('/laboratory/dashboard');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Portal Login error', error);
      alert('An error occurred during login');
    }
  };

  const portalToken = localStorage.getItem('portalToken');
  const portalRole = localStorage.getItem('portalRole');

  return (
    <div className="bg-primary-50 flex justify-center p-4 pt-12 pb-16 min-h-[calc(100vh-80px)] items-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full h-fit">
        {portalToken ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Already Logged In</h2>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              You are currently logged in to the portal as (<span className="font-bold text-primary-600 uppercase">{portalRole}</span>). Please log out to sign in to another staff account.
            </p>
            <div className="space-y-3">
              <Link
                to={portalRole === 'admin' ? '/admin/dashboard' : portalRole === 'doctor' ? '/doctor/dashboard' : '/laboratory/dashboard'}
                className="block w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm text-center cursor-pointer"
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
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-black text-primary-850">MediCore Portal Login</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in as medical doctor or hospital staff</p>
            </div>

        <div className="grid grid-cols-2 gap-2 mb-8 bg-gray-50 p-2 rounded-xl border border-gray-150">
          {[
            { id: 'doctor', label: 'Doctor' },
            { id: 'admin', label: 'Admin' },
            { id: 'laboratory', label: 'Laboratory' }
          ].map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`py-2 px-3 text-xs font-semibold rounded-lg transition-all text-center border cursor-pointer ${
                role === r.id 
                  ? 'bg-primary-500 text-white border-primary-600 shadow-sm' 
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all outline-none text-sm text-gray-800" 
              placeholder={`Enter ${role} email`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all outline-none text-sm text-gray-800" 
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
            className="w-full bg-primary-500 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 shadow-md hover:shadow-lg transition-all mt-6 cursor-pointer text-sm"
          >
            Login as {role.charAt(0).toUpperCase() + role.slice(1)}
          </button>
        </form>
          </>
        )}
      </div>
    </div>
  );
};

export default PortalLogin;
