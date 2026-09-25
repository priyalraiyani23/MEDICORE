import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();

      if (data.success) {
        alert('Registration successful! Please login.');
        navigate('/login');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (err) {
      console.error('Error signing up', err);
      setError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex justify-center p-4 pt-24 pb-12">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full h-fit">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary-800">Create Account</h2>
          <p className="text-gray-500 mt-2">Sign up to book appointments and manage your health records</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/80 border border-red-500 text-white p-3 rounded-xl text-sm text-center font-medium shadow-inner">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all outline-none text-primary-800 font-medium placeholder:text-gray-400 placeholder:font-normal"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all outline-none text-primary-800 font-medium placeholder:text-gray-400 placeholder:font-normal"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-300 focus:border-transparent transition-all outline-none text-primary-800 font-medium placeholder:text-gray-400 placeholder:font-normal"
                placeholder="Create a password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer flex items-center justify-center"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary-500 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            Create Account
          </button>

          <div className="pt-2 text-center">
            <Link to="/login" className="text-primary-600 hover:text-primary-800 text-sm font-bold transition-colors">
              Already have an account? Login &rarr;
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
