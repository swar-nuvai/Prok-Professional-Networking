import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5001/api';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ usernameOrEmail?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ usernameOrEmail?: boolean; password?: boolean }>({});

  // Check for success message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const validate = (): boolean => {
    const newErrors: { usernameOrEmail?: string; password?: string } = {};
    if (!usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: usernameOrEmail.trim(),
          password: password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }
      
      // Store token in localStorage
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        // Store user data if provided
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }

        // Show success message before redirect
        setSuccessMessage('Login successful!');

        // Redirect to home page or dashboard after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        throw new Error('No access token received');
      }
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (field: 'usernameOrEmail' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'usernameOrEmail' && !usernameOrEmail.trim()) setErrors((e) => ({ ...e, usernameOrEmail: 'Username or email is required' }));
    if (field === 'password' && !password) setErrors((e) => ({ ...e, password: 'Password is required' }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden prok-auth-bg flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      {/* Animated background blobs */}
      <div
        aria-hidden="true"
        className="prok-blob absolute -top-24 -left-24 h-72 w-72 rounded-full bg-cyan-500"
      />
      <div
        aria-hidden="true"
        className="prok-blob absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-violet-500"
        style={{ opacity: 0.3, animationDelay: '1.2s' }}
      />
      <div
        aria-hidden="true"
        className="prok-blob absolute top-1/3 -right-16 h-56 w-56 rounded-full bg-blue-500"
        style={{ opacity: 0.24, animationDelay: '0.6s' }}
      />
      {/* Abstract halo / 3D rings */}
      <div
        aria-hidden="true"
        className="prok-orbit -z-10 -top-16 left-1/4 rotate-6 opacity-80"
      />
      <div
        aria-hidden="true"
        className="prok-orbit -z-10 bottom-[-5rem] right-1/5 -rotate-6 opacity-60"
      />
      <div
        aria-hidden="true"
        className="prok-orbit -z-10 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 rotate-12 opacity-40"
      />

      <div className="prok-card max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 rounded-2xl shadow-2xl bg-slate-900/70 ring-1 ring-slate-700/60 backdrop-blur-xl">
        <div>
          <div className="mx-auto h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-500 shadow-lg shadow-cyan-500/40" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-center text-gray-900">
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Welcome back
            </span>
          </h2>
          <p className="mt-1 text-center text-sm text-slate-300/80">
            Sign in to continue building your network
          </p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} noValidate>
          {successMessage && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3">
              <p className="text-sm text-green-400" role="alert">
                {successMessage}
              </p>
            </div>
          )}
          
          {submitError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400" role="alert">
                {submitError}
              </p>
            </div>
          )}

          <div>
            <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-slate-200">
              Username or Email
            </label>
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              autoComplete="username"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              onBlur={() => handleBlur('usernameOrEmail')}
              className="mt-1 block w-full px-4 py-2.5 border border-slate-700/70 rounded-xl shadow-sm bg-slate-900/80 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 sm:text-sm transition"
              placeholder="Enter username or email"
            />
            {touched.usernameOrEmail && errors.usernameOrEmail && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.usernameOrEmail}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              className="mt-1 block w-full px-4 py-2.5 border border-slate-700/70 rounded-xl shadow-sm bg-slate-900/80 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 sm:text-sm transition"
              placeholder="Enter password"
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-500/30 text-sm font-semibold text-white bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-slate-950 transition will-change-transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-300/90">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
