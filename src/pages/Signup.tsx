import { useState } from 'react';
import { Mail, Lock, User, UserCircle } from 'lucide-react';
import { BACKEND_API } from '../api/config';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [university, setUniversity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const universities = [
    'Bennett University',
    'UPES',
    'Thapar Institute of Engineering and Technology',
    'SRM Institute of Science and Technology',
    'Shiv Nadar University',
  ];

  async function handleSubmit(e: any) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    if (role === 'STUDENT' && !university) {
      setError('Please select a university');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_API}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          university:
            role === 'STUDENT'
              ? university
              : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log(data);
        setSuccess(true);

        setName('');
        setEmail('');
        setPassword('');
        setRole('STUDENT');
        setUniversity('');
      } else {
        setError(
          data.message ||
            'Registration failed. Please try again.'
        );
      }
    } catch (e) {
      console.log(e);
      setError(
        'Unable to connect to server. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <UserCircle className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Account
          </h1>
        </div>

        {/* Signup Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                Account created successfully! You can now sign in.
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="John Doe"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="you@example.com"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Create a strong password"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Role
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setRole('STUDENT')
                  }
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                    role === 'STUDENT'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Student
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRole('TEACHER');
                    setUniversity('');
                  }}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition ${
                    role === 'TEACHER'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  Teacher
                </button>
              </div>
            </div>

            {/* University Dropdown */}
            {role === 'STUDENT' && (
              <div>
                <label
                  htmlFor="university"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  University
                </label>

                <select
                  id="university"
                  value={university}
                  onChange={(e) =>
                    setUniversity(
                      e.target.value
                    )
                  }
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">
                    Select University
                  </option>

                  {universities.map(
                    (uni) => (
                      <option
                        key={uni}
                        value={uni}
                      >
                        {uni}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a
                href="/"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            © 2025 Attendance System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;