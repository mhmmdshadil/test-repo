"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState("");

  useEffect(() => {
    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }
        setUser(session.user);
      } catch (err) {
        console.error("Session check failed:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, [router]);

  useEffect(() => {
    function updateTime() {
      setTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
    }
    updateTime();
    const id = setInterval(updateTime, 1000);
    return () => clearInterval(id);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-pulse/30 border-t-pulse rounded-full animate-spin" />
          <p className="font-mono text-xs text-white/30 tracking-widest">LOADING SYSTEM...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight grid-bg relative overflow-hidden">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-crimson to-transparent opacity-60" />

      {/* Background glows */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-pulse/3 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-crimson/3 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-steel/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-crimson/10 border border-crimson/30 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 32 32" fill="none">
                <path d="M16 2L4 8v8c0 7.18 5.16 13.89 12 15.93C22.84 29.89 28 23.18 28 16V8L16 2z" fill="rgba(220,20,60,0.2)" stroke="#DC143C" strokeWidth="1.5"/>
                <path d="M13 16h6M16 13v6" stroke="#DC143C" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <h1 className="font-display text-lg tracking-widest text-white leading-none">EMERGENCY ID</h1>
              <p className="font-mono text-xs text-white/30 tracking-widest">HOSPITAL DASHBOARD</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 status-badge" />
                <span className="font-mono text-xs text-white/40">{time}</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <span className="font-mono text-xs text-white/40 truncate max-w-40">{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="font-mono text-xs text-white/40 hover:text-white/70 tracking-widest transition-colors border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome section */}
        <div className="mb-12">
          <p className="font-mono text-pulse/50 text-sm tracking-widest mb-1">STAFF PORTAL · AUTHORIZED ACCESS</p>
          <h2 className="font-display text-5xl tracking-wide text-white">COMMAND CENTER</h2>
          <p className="text-white/40 text-sm mt-2 max-w-md">
            Select an operation below. All actions are logged and monitored. Unauthorized access will be reported.
          </p>
        </div>

        {/* Action cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Identify Patient */}
          <button
            onClick={() => router.push("/scan")}
            className="group relative bg-steel/40 hover:bg-steel/60 border border-white/5 hover:border-pulse/20 rounded-2xl p-8 text-left transition-all duration-300 card-glow overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pulse/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pulse/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              {/* Fingerprint icon */}
              <div className="w-16 h-16 mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-pulse/10 border border-pulse/20 flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <path d="M16 4C9.37 4 4 9.37 4 16" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M16 7C11.03 7 7 11.03 7 16" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M16 10C12.69 10 10 12.69 10 16c0 2 0 4 0 4" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M22 16c0-3.31-2.69-6-6-6" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M25 16c0-4.97-4.03-9-9-9" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M28 13c0-6.63-5.37-12-12-12" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M13 16c0 2.5 0 5 2.5 6.5" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M16 16c0 2 0 4 2 5" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M19 16c0 1.5 0 2.5-1 3.5" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-full border border-pulse/20 group-hover:scale-110 transition-transform" />
              </div>

              <div className="mb-4">
                <h3 className="font-display text-3xl tracking-widest text-white group-hover:text-pulse transition-colors">IDENTIFY</h3>
                <h3 className="font-display text-3xl tracking-widest text-white group-hover:text-pulse transition-colors">PATIENT</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Initiate biometric scan to retrieve patient medical records instantly. Supports fingerprint and retinal scan simulation.
              </p>

              <div className="mt-6 flex items-center gap-2 text-pulse/50 group-hover:text-pulse/80 transition-colors">
                <span className="font-mono text-xs tracking-widest">LAUNCH SCANNER</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </button>

          {/* Patient Enrollment */}
          <button
            onClick={() => router.push("/enroll")}
            className="group relative bg-steel/40 hover:bg-steel/60 border border-white/5 hover:border-crimson/20 rounded-2xl p-8 text-left transition-all duration-300 card-glow overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-crimson/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-crimson/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative z-10">
              <div className="w-16 h-16 mb-6 relative">
                <div className="absolute inset-0 rounded-full bg-crimson/10 border border-crimson/20 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="9" r="5" stroke="#DC143C" strokeWidth="1.5"/>
                    <path d="M4 24c0-5.52 4.48-10 10-10s10 4.48 10 10" stroke="#DC143C" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M20 4v8M16 8h8" stroke="#DC143C" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div className="absolute inset-0 rounded-full border border-crimson/20 group-hover:scale-110 transition-transform" />
              </div>

              <div className="mb-4">
                <h3 className="font-display text-3xl tracking-widest text-white group-hover:text-crimson transition-colors">PATIENT</h3>
                <h3 className="font-display text-3xl tracking-widest text-white group-hover:text-crimson transition-colors">ENROLLMENT</h3>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">
                Register a new patient in the emergency database. Enter medical details, allergies, and emergency contact information.
              </p>

              <div className="mt-6 flex items-center gap-2 text-crimson/50 group-hover:text-crimson/80 transition-colors">
                <span className="font-mono text-xs tracking-widest">REGISTER PATIENT</span>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </button>
        </div>

        {/* Status bar */}
        <div className="bg-steel/20 border border-white/5 rounded-xl px-6 py-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 status-badge" />
            <span className="font-mono text-xs text-white/40 tracking-wider">DATABASE CONNECTED</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 status-badge" />
            <span className="font-mono text-xs text-white/40 tracking-wider">BIOMETRIC SCANNER READY</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 status-badge" />
            <span className="font-mono text-xs text-white/40 tracking-wider">ENCRYPTION ACTIVE</span>
          </div>
          <div className="ml-auto font-mono text-xs text-white/20 tracking-wider">
            SESSION: {user?.id?.slice(0, 8).toUpperCase()}
          </div>
        </div>
      </main>
    </div>
  );
}
