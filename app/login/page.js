"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        if (authError.message.includes("Invalid login credentials")) {
          setError("Invalid email or password. Please try again.");
        } else if (authError.message.includes("Email not confirmed")) {
          setError("Please confirm your email before logging in.");
        } else {
          setError(authError.message);
        }
        return;
      }

      if (data.session) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Unable to connect. Please check your internet connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-midnight grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-pulse/40 to-transparent" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-pulse/20 to-transparent" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full bg-pulse/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 rounded-full bg-crimson/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-steel border border-pulse/20 mb-4 relative">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L4 8v8c0 7.18 5.16 13.89 12 15.93C22.84 29.89 28 23.18 28 16V8L16 2z" fill="rgba(220,20,60,0.15)" stroke="#DC143C" strokeWidth="1.5"/>
              <path d="M13 16h6M16 13v6" stroke="#DC143C" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <div className="absolute inset-0 rounded-full border border-pulse/30 animate-ping" style={{animationDuration: '3s'}} />
          </div>
          <h1 className="font-display text-4xl tracking-widest text-white text-glitch">EMERGENCY ID</h1>
          <p className="text-pulse/60 font-mono text-xs tracking-widest mt-1">UNIVERSAL BIOMETRIC ACCESS SYSTEM v2.1</p>
        </div>

        {/* Card */}
        <div className="bg-steel/50 backdrop-blur-sm border border-white/5 rounded-2xl p-8 card-glow">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2 h-2 rounded-full bg-green-400 status-badge" />
            <span className="font-mono text-xs text-white/40 tracking-widest">SECURE CHANNEL ACTIVE</span>
          </div>

          <h2 className="font-body text-xl font-medium text-white mb-1">Staff Authentication</h2>
          <p className="text-white/40 text-sm mb-6">Authorized personnel only. All access is logged.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-xs text-pulse/70 tracking-widest mb-2">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="staff@hospital.org"
                className="w-full bg-midnight/60 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:border-pulse/50 focus:ring-1 focus:ring-pulse/20 transition-colors"
              />
            </div>

            <div>
              <label className="block font-mono text-xs text-pulse/70 tracking-widest mb-2">PASSWORD</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-midnight/60 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:border-pulse/50 focus:ring-1 focus:ring-pulse/20 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-crimson/10 border border-crimson/30 rounded-lg px-4 py-3 flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#DC143C" strokeWidth="1.5"/>
                  <path d="M8 5v4M8 11v.5" stroke="#DC143C" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-crimson text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full bg-crimson hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-sm tracking-widest py-3.5 rounded-lg transition-colors mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  AUTHENTICATING...
                </span>
              ) : (
                "AUTHENTICATE →"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-white/20 font-mono text-xs mt-6 tracking-wider">
          HOSPITAL EMERGENCY NETWORK · ENCRYPTED · ISO 27001
        </p>
      </div>
    </div>
  );
}
