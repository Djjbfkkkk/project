import React, { useState } from 'react';
import { Settings, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { auth } from '../utils/auth';
import { showNotification } from '../utils/notifications';

interface LoginFormProps {
  onLogin: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Auto-complete email for students
      let email = username;
      if (!email.includes('@') && email !== 'admin') {
        email = `${username}@issacasimov.in`;
      } else if (email === 'admin') {
        email = 'admin@issacasimov.in';
      }

      const user = auth.login(email, password);
      
      if (user) {
        showNotification(`Welcome back, ${user.name}!`, 'success');
        onLogin();
      } else {
        setError('Invalid credentials. Please check your username and password.');
      }
    } catch (err) {
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-teal-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl mb-6 shadow-2xl">
            <Settings className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Isaac Asimov</h1>
          <p className="text-teal-300 text-xl font-medium">Robotics Laboratory</p>
          <p className="text-gray-400 text-sm mt-3 font-medium">Component Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/60 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-gray-700/50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white text-center">Sign In</h2>
            <p className="text-gray-400 text-center mt-2">Access your lab account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-900/50 border border-red-700 rounded-xl p-4 flex items-center space-x-3 animate-pulse">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-300 mb-3">
                Roll No
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={handleUsernameChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 font-medium"
                  placeholder="Enter your Roll No"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 mt-2 ml-1">
                Enter your Roll No (auto-completes to @issacasimov.in)
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-300 mb-3">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-12 py-4 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 font-medium"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-teal-600 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In to Lab Portal'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-4 text-center">Access Credentials</h3>
            <div className="space-y-4 text-xs">
             
              <div className="bg-gradient-to-r from-teal-900/30 to-teal-800/30 rounded-xl p-4 border border-teal-700/30">
                <p className="text-teal-300 font-semibold mb-2">Student Access:</p>
                <div className="space-y-1">
                  <p className="text-gray-300"><span className="text-teal-400">Username:</span> (Your Roll No)</p>
                  <p className="text-gray-300"><span className="text-teal-400">Password:</span> issacasimov</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-400 text-xs">
            © 2025 Isaac Asimov Robotics Laboratory. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};