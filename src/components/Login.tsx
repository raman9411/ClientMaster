import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign in");
      }

      login(data.user);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Light Abstract Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-2/3 h-2/3 max-w-[800px] max-h-[800px] bg-indigo-200/50 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-2/3 h-2/3 max-w-[800px] max-h-[800px] bg-blue-200/50 rounded-full blur-[100px] mix-blend-multiply pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:py-12 sm:px-12 border border-slate-100 ring-1 ring-slate-900/5 mx-4 sm:mx-0">

          <div className="flex justify-center mb-8">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="text-white text-3xl font-black tracking-tighter">C</span>
            </div>
          </div>

          <h2 className="text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            ClientMaster
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500 mb-10 font-medium tracking-wide">
            Enter your credentials to access your workspace.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all shadow-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wide"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  "Sign In"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">Don't have an account? </span>
            <a href="/signup" className="font-bold text-indigo-600 hover:text-indigo-500 transition-colors">
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
