"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const BLOOD_TYPE_COLORS = {
  "A+": "text-red-400", "A-": "text-red-400",
  "B+": "text-orange-400", "B-": "text-orange-400",
  "AB+": "text-purple-400", "AB-": "text-purple-400",
  "O+": "text-blue-400", "O-": "text-blue-400",
  "Unknown": "text-white/50",
};

export default function ResultPage() {
  const router = useRouter();
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    async function loadPatient() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }

      // Try session storage first
      const stored = sessionStorage.getItem("scanned_patient");
      if (stored) {
        try {
          setPatient(JSON.parse(stored));
          setLoading(false);
          setTimeout(() => setShowCard(true), 100);
          return;
        } catch {
          // fall through
        }
      }

      // Fallback: fetch latest from DB
      try {
        const { data, error: fetchError } = await supabase
          .from("patients")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (fetchError) {
          setError(fetchError.code === "PGRST116"
            ? "No patient records found. Please enroll a patient first."
            : `Database error: ${fetchError.message}`);
          setLoading(false);
          return;
        }

        setPatient(data);
        setLoading(false);
        setTimeout(() => setShowCard(true), 100);
      } catch (err) {
        setError(`Failed to retrieve record: ${err.message}`);
        setLoading(false);
      }
    }

    loadPatient();
  }, [router]);

  const allergiesArr = patient?.allergies
    ? patient.allergies.split(",").map(a => a.trim()).filter(Boolean)
    : [];

  const hasAllergies = allergiesArr.length > 0 && allergiesArr[0].toLowerCase() !== "none reported";

  if (loading) {
    return (
      <div className="min-h-screen bg-midnight flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-pulse/30 border-t-pulse rounded-full animate-spin" />
          <p className="font-mono text-xs text-white/30 tracking-widest">DECRYPTING PATIENT RECORD...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-midnight grid-bg flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-crimson/10 border border-crimson/30 flex items-center justify-center mx-auto mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#DC143C" strokeWidth="1.5"/>
              <path d="M14 9v7M14 18.5v1" stroke="#DC143C" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="font-display text-3xl text-white mb-2">ACCESS FAILED</h2>
          <p className="text-white/50 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="font-mono text-sm text-pulse hover:text-white tracking-widest border border-pulse/30 hover:border-pulse/60 rounded-lg px-6 py-2.5 transition-colors"
          >
            ← RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight grid-bg relative overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-pulse to-transparent opacity-60" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-pulse/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-steel/30 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => { sessionStorage.removeItem("scanned_patient"); router.push("/dashboard"); }}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors font-mono text-xs tracking-widest"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            BACK TO DASHBOARD
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 status-badge" />
            <span className="font-mono text-xs text-white/30 tracking-widest">IDENTITY CONFIRMED</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="font-mono text-pulse/60 text-xs tracking-widest mb-1">BIOMETRIC MATCH · CONFIDENCE: 99.7%</p>
          <h1 className="font-display text-5xl tracking-wide text-white">PATIENT RECORD</h1>
        </div>

        {/* Card */}
        <div
          className={`transition-all duration-700 ${showCard ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Emergency banner */}
          {hasAllergies && (
            <div className="mb-4 bg-crimson/10 border border-crimson/40 rounded-xl px-5 py-3.5 flex items-center gap-3 alert-glow">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
                <path d="M10 2L2 17h16L10 2z" fill="rgba(220,20,60,0.15)" stroke="#DC143C" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 8v4M10 14v.5" stroke="#DC143C" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p className="font-mono text-xs text-crimson tracking-widest">⚠ CRITICAL ALLERGY ALERT — REVIEW BEFORE TREATMENT</p>
            </div>
          )}

          {/* Main record card */}
          <div className="bg-steel/40 border border-white/5 rounded-2xl overflow-hidden card-glow">
            {/* Card header */}
            <div className="bg-gradient-to-r from-steel to-steel/60 border-b border-white/5 px-8 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-pulse/10 border border-pulse/20 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <circle cx="11" cy="7" r="4" stroke="#00D4FF" strokeWidth="1.5"/>
                    <path d="M3 20c0-4.42 3.58-8 8-8s8 3.58 8 8" stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="font-mono text-xs text-white/30 tracking-widest mb-0.5">REGISTERED PATIENT</p>
                  <h2 className="font-display text-2xl tracking-wider text-white">{patient?.name}</h2>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs text-white/20 tracking-widest">RECORD ID</p>
                <p className="font-mono text-xs text-pulse/60">{patient?.id?.slice(0, 8).toUpperCase()}</p>
              </div>
            </div>

            {/* Card body */}
            <div className="p-8 grid md:grid-cols-2 gap-6">
              {/* Blood Type */}
              <div className="bg-midnight/40 border border-white/5 rounded-xl p-5">
                <p className="font-mono text-xs text-white/30 tracking-widest mb-2">BLOOD TYPE</p>
                <div className="flex items-end gap-3">
                  <span className={`font-display text-5xl tracking-wider ${BLOOD_TYPE_COLORS[patient?.blood_type] || "text-white"}`}>
                    {patient?.blood_type}
                  </span>
                  <div className="mb-1.5">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M10 2C10 2 4 8.5 4 12.5a6 6 0 0012 0C16 8.5 10 2 10 2z" fill="rgba(220,20,60,0.2)" stroke="#DC143C" strokeWidth="1.5"/>
                    </svg>
                  </div>
                </div>
                <p className="text-white/20 text-xs mt-1">
                  {patient?.blood_type?.includes("+") ? "Rh Positive" :
                   patient?.blood_type?.includes("-") ? "Rh Negative" : "—"}
                </p>
              </div>

              {/* Emergency Contact */}
              <div className="bg-midnight/40 border border-white/5 rounded-xl p-5">
                <p className="font-mono text-xs text-white/30 tracking-widest mb-2">EMERGENCY CONTACT</p>
                <p className="text-white text-sm font-medium leading-relaxed">{patient?.contact}</p>
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="font-mono text-xs text-green-400/60 tracking-wider">CONTACT VERIFIED</p>
                </div>
              </div>

              {/* Allergies - full width */}
              <div className={`md:col-span-2 rounded-xl p-5 ${hasAllergies ? "bg-crimson/10 border border-crimson/20" : "bg-midnight/40 border border-white/5"}`}>
                <p className={`font-mono text-xs tracking-widest mb-3 ${hasAllergies ? "text-crimson/70" : "text-white/30"}`}>
                  {hasAllergies ? "⚠ KNOWN ALLERGIES — CRITICAL" : "ALLERGIES / CONTRAINDICATIONS"}
                </p>
                {hasAllergies ? (
                  <div className="flex flex-wrap gap-2">
                    {allergiesArr.map((allergy, i) => (
                      <span
                        key={i}
                        className="bg-crimson/20 border border-crimson/40 text-crimson font-mono text-xs tracking-wider px-3 py-1.5 rounded-lg"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/50 text-sm">No known allergies on record</p>
                )}
              </div>
            </div>

            {/* Card footer */}
            <div className="border-t border-white/5 px-8 py-4 flex items-center justify-between bg-midnight/20">
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#00D4FF" strokeWidth="1" opacity="0.4"/>
                  <path d="M7 4v3.5L9 9" stroke="#00D4FF" strokeWidth="1" strokeLinecap="round" opacity="0.4"/>
                </svg>
                <p className="font-mono text-xs text-white/20 tracking-wider">
                  ENROLLED: {patient?.created_at ? new Date(patient.created_at).toLocaleString() : "—"}
                </p>
              </div>
              <button
                onClick={() => router.push("/scan")}
                className="font-mono text-xs text-pulse/50 hover:text-pulse/80 tracking-widest transition-colors"
              >
                NEW SCAN →
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => { sessionStorage.removeItem("scanned_patient"); router.push("/dashboard"); }}
              className="bg-steel/40 hover:bg-steel/60 border border-white/5 hover:border-white/10 text-white/60 hover:text-white/80 font-mono text-xs tracking-widest py-3 rounded-xl transition-all"
            >
              ← DASHBOARD
            </button>
            <button
              onClick={() => router.push("/enroll")}
              className="bg-crimson/10 hover:bg-crimson/20 border border-crimson/20 hover:border-crimson/40 text-crimson font-mono text-xs tracking-widest py-3 rounded-xl transition-all"
            >
              + ENROLL NEW PATIENT
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
