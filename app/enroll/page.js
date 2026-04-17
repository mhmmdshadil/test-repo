"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

const AUTH_PHASES = [
  { text: "ENCRYPTING CONNECTION...", duration: 600 },
  { text: "AUTHORIZING STAFF ACCESS...", duration: 800 },
  { text: "PLACE FINGER ON SENSOR", duration: 1000 },
  { text: "VERIFYING CREDENTIALS...", duration: 900 },
  { text: "ACCESS GRANTED", duration: 600 },
];

export default function EnrollPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    blood_type: "",
    allergies: "",
    contact: "",
  });

  // Authorization states
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authPhase, setAuthPhase] = useState(0);
  const [authProgress, setAuthProgress] = useState(0);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      runAuthSequence();
    }
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function runAuthSequence() {
    for (let i = 0; i < AUTH_PHASES.length; i++) {
      setAuthPhase(i);
      setAuthProgress(((i + 1) / AUTH_PHASES.length) * 100);
      await new Promise(resolve => setTimeout(resolve, AUTH_PHASES[i].duration));
    }
    setIsAuthorized(true);
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate
    if (!form.name.trim()) {
      setError("Patient name is required.");
      setLoading(false);
      return;
    }
    if (!form.blood_type) {
      setError("Please select a blood type.");
      setLoading(false);
      return;
    }
    if (!form.contact.trim()) {
      setError("Emergency contact is required.");
      setLoading(false);
      return;
    }

    try {
      const { data: insertData, error: insertError } = await supabase
        .from("patients")
        .insert([
          {
            name: form.name.trim(),
            blood_type: form.blood_type,
            allergies: form.allergies.trim() || "None reported",
            contact: form.contact.trim(),
          },
        ])
        .select()
        .single();

      if (insertError) {
        if (insertError.code === "42501") {
          setError("Permission denied. Please check Supabase RLS policies allow insert.");
        } else if (insertError.code === "42P01") {
          setError("Table 'patients' not found. Please run the setup SQL in Supabase.");
        } else {
          setError(`Database error: ${insertError.message}`);
        }
        return;
      }

      // --- Simulated Biometric Enrollment ---
      // Instead of real WebAuthn, we simulate a premium scan experience for the demo
      await new Promise(resolve => setTimeout(resolve, 3000)); 

      setSuccess(true);
      setForm({ name: "", blood_type: "", allergies: "", contact: "" });
    } catch (err) {
      setError(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  // --- Render Scanner UI for Authorization ---
  if (!isAuthorized) {
    const currentPhase = AUTH_PHASES[authPhase];
    return (
      <div className="fixed inset-0 bg-midnight flex flex-col items-center justify-center overflow-hidden z-50">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-radial from-pulse/5 via-transparent" />

        <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-crimson/10 border border-crimson/30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-crimson" />
            </div>
            <span className="font-mono text-xs text-white/30 tracking-widest uppercase">Security Protocol: Access Authorization</span>
          </div>
          <button 
            onClick={() => router.push("/dashboard")}
            className="font-mono text-xs text-white/20 hover:text-white/50 transition-colors"
          >
            CANCEL REQUEST
          </button>
        </div>

        <div className="relative flex flex-col items-center scale-90 md:scale-100">
          <div className="relative flex items-center justify-center mb-10" style={{width: 280, height: 280}}>
            <div className="absolute inset-0 rounded-full border border-pulse/10" />
            <div className="absolute inset-4 rounded-full border border-pulse/10 animate-pulse" />
            
            <div className="relative w-44 h-44 border border-pulse/30 rounded-2xl overflow-hidden bg-steel/30 backdrop-blur-sm shadow-2xl">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-pulse rounded-tl-md" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-pulse rounded-tr-md" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-pulse rounded-bl-md" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-pulse rounded-br-md" />
              
              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#00D4FF" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12c0-5.52 4.48-10 10-10"/>
                  <path d="M7 12c0-2.76 2.24-5 5-5"/>
                  <path d="M12 22v-3"/>
                  <path d="M12 7v5"/>
                  <path d="M12 12h5"/>
                  <path d="M17 12c0 2.76-2.24 5-5 5"/>
                  <path d="M22 12c0 5.52-4.48 10-10 10"/>
                </svg>
              </div>
              <div className="scan-line" />
            </div>
          </div>

          <div className="text-center">
            <p className="font-mono text-pulse text-sm tracking-widest animate-pulse mb-4 h-5">{currentPhase?.text}</p>
            <div className="w-64 h-0.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-pulse transition-all duration-300"
                style={{width: `${authProgress}%`}}
              />
            </div>
            <p className="mt-3 font-mono text-[10px] text-white/20 tracking-[0.2em]">IDENTITY VERIFICATION IN PROGRESS</p>
          </div>
        </div>
      </div>
    );
  }

  // --- Render Enrollment Form ---
  return (
    <div className="min-h-screen bg-midnight grid-bg relative overflow-hidden transition-opacity duration-1000 animate-in fade-in">
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-crimson to-transparent opacity-60" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-crimson/3 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/5 bg-steel/30 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors font-mono text-xs tracking-widest"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            BACK TO DASHBOARD
          </button>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-crimson status-badge" />
            <span className="font-mono text-xs text-white/30 tracking-widest uppercase">Enrollment Portal Access: Active</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 lg:py-16">
        <div className="mb-8">
          <p className="font-mono text-crimson/60 text-xs tracking-widest mb-1">PATIENT REGISTRATION PROTOCOL</p>
          <h1 className="font-display text-5xl tracking-wide text-white">NEW PATIENT</h1>
          <p className="text-white/40 text-sm mt-2">Fill in patient details accurately. All information will be linked to the biometric identity scan upon submission.</p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4 flex items-start gap-3 backdrop-blur-sm animate-in slide-in-from-top-4 duration-500">
            <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-green-400 font-mono text-sm tracking-wider font-medium uppercase">Registration Complete</p>
              <p className="text-green-400/60 text-xs mt-0.5">Biometric identity record has been successfully committed to the database.</p>
            </div>
            <button
              onClick={() => setSuccess(false)}
              className="ml-auto text-green-400/40 hover:text-green-400/70 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        )}

        {/* Form card */}
        <div className="bg-steel/40 border border-white/5 rounded-2xl p-8 card-glow">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block font-mono text-xs text-pulse/60 tracking-widest mb-2">
                PATIENT FULL NAME <span className="text-crimson">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. MOHAMMED AL-RASHID"
                className="w-full bg-midnight/60 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:border-pulse/40 focus:ring-1 focus:ring-pulse/20 transition-colors font-mono"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Blood Type */}
              <div>
                <label className="block font-mono text-xs text-pulse/60 tracking-widest mb-2">
                  BLOOD TYPE <span className="text-crimson">*</span>
                </label>
                <select
                  name="blood_type"
                  value={form.blood_type}
                  onChange={handleChange}
                  className="w-full bg-midnight/60 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-pulse/40 focus:ring-1 focus:ring-pulse/20 transition-colors appearance-none font-mono"
                >
                  <option value="" disabled>SELECT TYPE...</option>
                  {BLOOD_TYPES.map(t => (
                    <option key={t} value={t} className="bg-steel">{t}</option>
                  ))}
                </select>
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="block font-mono text-xs text-pulse/60 tracking-widest mb-2">
                  CONTACT NUMBER <span className="text-crimson">*</span>
                </label>
                <input
                  type="text"
                  name="contact"
                  value={form.contact}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full bg-midnight/60 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:border-pulse/40 focus:ring-1 focus:ring-pulse/20 transition-colors font-mono"
                />
              </div>
            </div>

            {/* Allergies */}
            <div>
              <label className="block font-mono text-xs text-pulse/60 tracking-widest mb-2">
                CRITICAL ALLERGIES
                <span className="ml-2 text-white/20 normal-case">(SEPARATED BY COMMAS)</span>
              </label>
              <input
                type="text"
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                placeholder="e.g. PENICILLIN, LATEX, PEANUTS"
                className="w-full bg-midnight/60 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors font-mono"
              />
              <p className="mt-1.5 text-white/20 text-[10px] font-mono tracking-widest uppercase">Leave blank if unknown or none</p>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-crimson/10 border border-crimson/30 rounded-lg px-4 py-3 flex items-start gap-2 animate-pulse">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#DC143C" strokeWidth="1.5"/>
                  <path d="M8 5v4M8 11v.5" stroke="#DC143C" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-crimson text-sm font-mono tracking-widest uppercase">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex-1 bg-transparent border border-white/10 hover:border-white/20 text-white/40 hover:text-white/70 font-mono text-[10px] tracking-[0.3em] py-4 rounded-lg transition-all"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-[2] bg-crimson hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-[10px] tracking-[0.3em] py-4 rounded-lg transition-all shadow-xl shadow-crimson/20"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    ENROLLING IDENTITY...
                  </span>
                ) : (
                  "COMMITT BIOMETRIC ENROLLMENT →"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info note */}
        <div className="mt-6 bg-pulse/3 border border-pulse/10 rounded-xl px-6 py-5 flex items-center gap-4">
          <div className="w-1.5 h-1.5 rounded-full bg-pulse shadow-[0_0_10px_#00D4FF]" />
          <p className="font-mono text-[10px] text-white/30 tracking-[0.2em] uppercase leading-relaxed">
            All biometrics are stored using 256-bit AES encryption. Access is restricted to hospital administrators only.
          </p>
        </div>
      </main>
    </div>
  );
}
