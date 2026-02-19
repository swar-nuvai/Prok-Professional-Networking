import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ usernameOrEmail?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ usernameOrEmail?: boolean; password?: boolean }>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    // Day 1: UI only. Backend integration in Day 2.
    console.log('Login submitted', { usernameOrEmail: usernameOrEmail.trim(), password });
  };

  const handleBlur = (field: 'usernameOrEmail' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'usernameOrEmail' && !usernameOrEmail.trim()) setErrors((e) => ({ ...e, usernameOrEmail: 'Username or email is required' }));
    if (field === 'password' && !password) setErrors((e) => ({ ...e, password: 'Password is required' }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 p-6 sm:p-8 bg-white rounded-xl shadow-md">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900">Login</h2>
          <p className="mt-1 text-center text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form className="space-y-4 sm:space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter username or email"
            />
            {touched.usernameOrEmail && errors.usernameOrEmail && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.usernameOrEmail}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
              className="mt-1 block w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Login
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
