import React, { useState } from "react";
import axios from "axios";
import { Mail, Lock, LogIn } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { BACKEND_API } from "../api/config";

const Login = () => {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const navigate = useNavigate();

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");

    const prevUuid =
      localStorage.getItem("uuid");

    try {
      const res = await axios.post(
        `${BACKEND_API}/auth/login`,
        {
          email,
          password,
          uuid: prevUuid,
        }
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "uuid",
        res.data.user.uuid
      );

      if (
        res.data.user.role ===
        "STUDENT"
      ) {
        navigate("/student");
      } else if (
        res.data.user.role ===
        "TEACHER"
      ) {
        navigate("/teacher");
      } else if (
        res.data.user.role ===
        "ADMIN"
      ) {
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);

      setError(
        "Invalid email or password OR login with original device"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>

          <p className="text-gray-600">
            Sign in to continue to
            your account
          </p>
        </div>

        {/* Login Card */}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form
            onSubmit={
              handleSubmit
            }
            className={`space-y-6 transition-opacity duration-200 ${
              isLoading
                ? "opacity-80"
                : "opacity-100"
            }`}
          >
            {/* Error */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email */}

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
                  disabled={
                    isLoading
                  }
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  placeholder="you@example.com"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password */}

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
                  disabled={
                    isLoading
                  }
                  onChange={(e) =>
                    setPassword(
                      e.target.value
                    )
                  }
                  placeholder="Enter your password"
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Forgot Password */}

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}

            <button
              type="submit"
              disabled={
                isLoading
              }
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Signup */}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an
              account?{" "}
              <Link
                to="/signup"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}

        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            © 2025 Attendance
            System. All rights
            reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;