import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MIN_PASSWORD_LENGTH = 8;
const API_BASE_URL = 'http://localhost:5001/api';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touched, setTouched] = useState<{
    username?: boolean;
    email?: boolean;
    password?: boolean;
    confirmPassword?: boolean;
  }>({});

  const validate = (): boolean => {
    const newErrors: typeof errors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < MIN_PASSWORD_LENGTH)
      newErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Signup failed. Please try again.');
      }
      
      // Store token if provided
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
      }
      
      // Redirect to login page on success
      navigate('/login', { state: { message: 'Account created successfully! Please login.' } });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (
    field: keyof typeof touched,
    validateField: () => string | undefined
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const message = validateField();
    if (message) setErrors((e) => ({ ...e, [field]: message }));
  };

  return (
    <div className="min-h-screen relative overflow-hidden prok-auth-bg flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      {/* Animated background blobs */}
      <div
        aria-hidden="true"
        className="prok-blob absolute -top-24 -right-28 h-72 w-72 rounded-full bg-violet-500"
      />
      <div
        aria-hidden="true"
        className="prok-blob absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-cyan-500"
        style={{ opacity: 0.4, animationDelay: '1.1s' }}
      />
      <div
        aria-hidden="true"
        className="prok-blob absolute top-1/3 -left-14 h-56 w-56 rounded-full bg-blue-500"
        style={{ opacity: 0.28, animationDelay: '0.5s' }}
      />
      {/* Abstract halo / 3D rings */}
      <div
        aria-hidden="true"
        className="prok-orbit -z-10 -top-14 right-1/4 -rotate-6 opacity-80"
      />
      <div
        aria-hidden="true"
        className="prok-orbit -z-10 bottom-[-5rem] left-1/5 rotate-6 opacity-60"
      />
      <div
        aria-hidden="true"
        className="prok-orbit -z-10 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 -rotate-12 opacity-40"
      />

      <div className="prok-card max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 rounded-2xl shadow-2xl bg-slate-900/70 ring-1 ring-slate-700/60 backdrop-blur-xl">
        <div>
          <div className="mx-auto h-11 w-11 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-violet-500 shadow-lg shadow-cyan-500/40" />
          <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-center text-gray-900">
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
              Create your account
            </span>
          </h2>
          <p className="mt-1 text-center text-sm text-slate-300/80">
            Join and start connecting professionally
          </p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-200">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() =>
                handleBlur('username', () =>
                  !username.trim() ? 'Username is required' : undefined
                )
              }
              className="mt-1 block w-full px-4 py-2.5 border border-slate-700/70 rounded-xl shadow-sm bg-slate-900/80 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 sm:text-sm transition"
              placeholder="Choose a username"
            />
            {touched.username && errors.username && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.username}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() =>
                handleBlur('email', () => {
                  if (!email.trim()) return 'Email is required';
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
                  return undefined;
                })
              }
              className="mt-1 block w-full px-4 py-2.5 border border-slate-700/70 rounded-xl shadow-sm bg-slate-900/80 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 sm:text-sm transition"
              placeholder="you@example.com"
            />
            {touched.email && errors.email && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.email}
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
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() =>
                handleBlur('password', () => {
                  if (!password) return 'Password is required';
                  if (password.length < MIN_PASSWORD_LENGTH)
                    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
                  return undefined;
                })
              }
              className="mt-1 block w-full px-4 py-2.5 border border-slate-700/70 rounded-xl shadow-sm bg-slate-900/80 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 sm:text-sm transition"
              placeholder="At least 8 characters"
            />
            {touched.password && errors.password && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.password}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() =>
                handleBlur('confirmPassword', () => {
                  if (!confirmPassword) return 'Please confirm your password';
                  if (password !== confirmPassword) return 'Passwords do not match';
                  return undefined;
                })
              }
              className="mt-1 block w-full px-4 py-2.5 border border-slate-700/70 rounded-xl shadow-sm bg-slate-900/80 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 sm:text-sm transition"
              placeholder="Confirm your password"
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {submitError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
              <p className="text-sm text-red-400" role="alert">
                {submitError}
              </p>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2.5 px-4 rounded-xl shadow-lg shadow-cyan-500/30 text-sm font-semibold text-white bg-gradient-to-r from-cyan-400 via-sky-500 to-violet-500 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 focus:ring-offset-slate-950 transition will-change-transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-300/90">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-cyan-300 hover:text-cyan-200">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
