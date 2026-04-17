"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";


const SCAN_PHASES = [
  { text: "INITIALIZING SCANNER...", duration: 800 },
  { text: "PLACE FINGER ON SENSOR", duration: 1000 },
  { text: "SCANNING BIOMETRICS...", duration: 1200 },
  { text: "ANALYZING RIDGEPOINTS...", duration: 900 },
  { text: "VERIFYING IDENTITY...", duration: 800 },
  { text: "CROSS-REFERENCING DATABASE...", duration: 700 },
  { text: "MATCH FOUND — RETRIEVING RECORD", duration: 600 },
];

export default function ScanPage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      runScanSequence();
    }
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runScanSequence() {
    try {
      // 1. Run the visual scan sequence
      await startProgressSequence();

      // 2. Fetch the most recently enrolled patient to simulate a "match"
      const { data: patients, error: fetchError } = await supabase
        .from("patients")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1);

      if (fetchError || !patients || patients.length === 0) {
        throw new Error("No enrollment records found. Please enroll a patient first.");
      }

      const latestPatient = patients[0];
      setDone(true);
      setPhase(SCAN_PHASES.length - 1); 

      // 3. Store in sessionStorage and navigate
      sessionStorage.setItem("scanned_patient", JSON.stringify(latestPatient));
      setTimeout(() => router.push("/result"), 1000);

    } catch (err) {
      setError(err.message);
      setDone(true);
    }
  }

  async function startProgressSequence() {
    for (let i = 0; i < SCAN_PHASES.length - 1; i++) {
      if (done) break; 
      setPhase(i);
      await delay(SCAN_PHASES[i].duration);
    }
  }

  function delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  const currentPhase = SCAN_PHASES[phase];
  const progressPct = ((phase + 1) / SCAN_PHASES.length) * 100;

  return (
    <div className="fixed inset-0 bg-midnight flex flex-col items-center justify-center overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-pulse/5 via-transparent to-transparent" style={{background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.08) 0%, transparent 70%)'}} />
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-crimson/10 border border-crimson/30 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 32 32" fill="none">
              <path d="M16 2L4 8v8c0 7.18 5.16 13.89 12 15.93C22.84 29.89 28 23.18 28 16V8L16 2z" fill="rgba(220,20,60,0.2)" stroke="#DC143C" strokeWidth="2"/>
              <path d="M13 16h6M16 13v6" stroke="#DC143C" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-mono text-xs text-white/30 tracking-widest">EMERGENCY ID · BIOMETRIC VERIFICATION</span>
        </div>
        {!done && (
          <button
            onClick={() => router.push("/dashboard")}
            className="font-mono text-xs text-white/20 hover:text-white/50 tracking-widest transition-colors"
          >
            CANCEL
          </button>
        )}
      </div>

      {/* Main scan area */}
      <div className="relative flex flex-col items-center">
        {/* Outer rings */}
        <div className="relative flex items-center justify-center" style={{width: 280, height: 280}}>
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full border border-pulse/10" />
          <div className="absolute inset-4 rounded-full border border-pulse/10" style={{animation: 'pulseRing 2s ease-out infinite', animationDelay: '0s'}} />
          <div className="absolute inset-8 rounded-full border border-pulse/15" style={{animation: 'pulseRing 2s ease-out infinite', animationDelay: '0.4s'}} />
          <div className="absolute inset-12 rounded-full border border-pulse/20" style={{animation: 'pulseRing 2s ease-out infinite', animationDelay: '0.8s'}} />

          {/* Scanner box */}
          <div className="relative w-44 h-44 border border-pulse/30 rounded-2xl overflow-hidden bg-steel/30 backdrop-blur-sm">
            {/* Corner markers */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-pulse rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-pulse rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-pulse rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-pulse rounded-br-lg" />

            {/* Fingerprint SVG */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{opacity: 0.6}}>
                <path d="M40 10C23.43 10 10 23.43 10 40" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M40 17C27.3 17 17 27.3 17 40" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M40 24C31.16 24 24 31.16 24 40c0 5 0 10 0 10" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M55 40c0-8.28-6.72-15-15-15" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M62 40c0-12.15-9.85-22-22-22" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M70 34c0-16.57-13.43-30-30-30" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M33 40c0 6 0 12 6 16" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M40 40c0 5 0 10 5 13" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
                <path d="M47 40c0 4 0 7-3 9" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Scanning line */}
            {!error && <div className="scan-line" />}

            {/* Error state overlay */}
            {error && (
              <div className="absolute inset-0 bg-crimson/10 flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="14" stroke="#DC143C" strokeWidth="1.5"/>
                  <path d="M16 10v8M16 21v2" stroke="#DC143C" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Status text */}
        <div className="mt-10 text-center">
          {error ? (
            <div className="max-w-sm">
              <p className="font-mono text-crimson text-sm tracking-wider mb-1">SCAN FAILED</p>
              <p className="text-white/50 text-xs leading-relaxed">{error}</p>
              <button
                onClick={() => router.push("/dashboard")}
                className="mt-6 font-mono text-xs text-pulse hover:text-white tracking-widest border border-pulse/30 hover:border-pulse/60 rounded-lg px-6 py-2.5 transition-colors"
              >
                ← RETURN TO DASHBOARD
              </button>
            </div>
          ) : (
            <>
              <p className="font-mono text-pulse text-sm tracking-widest animate-pulse">{currentPhase?.text}</p>
              <div className="mt-4 w-64 h-px bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pulse/60 to-pulse rounded-full transition-all duration-500"
                  style={{width: `${progressPct}%`}}
                />
              </div>
              <p className="mt-2 font-mono text-xs text-white/20">{Math.round(progressPct)}% COMPLETE</p>
            </>
          )}
        </div>
      </div>

      {/* Bottom label */}
      {!error && (
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="font-mono text-xs text-white/15 tracking-widest">
            DO NOT REMOVE FINGER UNTIL SCAN IS COMPLETE
          </p>
        </div>
      )}
    </div>
  );
}
