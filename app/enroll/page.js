"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { startRegistration } from "@simplewebauthn/browser";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];

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

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) router.replace("/login");
    }
    checkAuth();
  }, [router]);

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

      const newPatient = insertData;

      // --- Biometric Enrollement via WebAuthn ---
      // 1. Get options from server
      const optionsResp = await fetch("/api/webauthn/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: newPatient.id, patientName: newPatient.name })
      });
      const options = await optionsResp.json();
      if (options.error) throw new Error(options.error);

      // 2. Client-side registration (OS prompts user for face/fingerprint)
      const attResp = await startRegistration(options);

      // 3. Send back to server for verification
      const verifyResp = await fetch("/api/webauthn/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: attResp, patientId: newPatient.id })
      });
      const verification = await verifyResp.json();

      if (!verification.verified) {
        throw new Error(verification.error || "Biometric verification failed.");
      }

      setSuccess(true);
      setForm({ name: "", blood_type: "", allergies: "", contact: "" });
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Fingerprint scan cancelled or timed out. Patient record created — please retry to link their fingerprint.");
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Network error: Cannot reach the database. Please check your internet connection.");
      } else {
        setError(`Unexpected error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-midnight grid-bg relative overflow-hidden">
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
            <span className="font-mono text-xs text-white/30 tracking-widest">ENROLLMENT MODE</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="font-mono text-crimson/60 text-xs tracking-widest mb-1">PATIENT REGISTRATION PROTOCOL</p>
          <h1 className="font-display text-5xl tracking-wide text-white">NEW PATIENT</h1>
          <p className="text-white/40 text-sm mt-2">Fill in patient details. After saving, you will be asked to scan the patient&apos;s fingerprint to link their biometric identity.</p>
        </div>

        {/* Success message */}
        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl px-5 py-4 flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0 mt-0.5">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p className="text-green-400 font-mono text-sm tracking-wider font-medium">PATIENT ENROLLED SUCCESSFULLY</p>
              <p className="text-green-400/60 text-xs mt-0.5">Record has been saved to the emergency database.</p>
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
                placeholder="e.g. Mohammed Al-Rashid"
                className="w-full bg-midnight/60 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:border-pulse/40 focus:ring-1 focus:ring-pulse/20 transition-colors"
              />
            </div>

            {/* Blood Type */}
            <div>
              <label className="block font-mono text-xs text-pulse/60 tracking-widest mb-2">
                BLOOD TYPE <span className="text-crimson">*</span>
              </label>
              <select
                name="blood_type"
                value={form.blood_type}
                onChange={handleChange}
                className="w-full bg-midnight/60 border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-pulse/40 focus:ring-1 focus:ring-pulse/20 transition-colors appearance-none"
              >
                <option value="" disabled>Select blood type...</option>
                {BLOOD_TYPES.map(t => (
                  <option key={t} value={t} className="bg-steel">{t}</option>
                ))}
              </select>
            </div>

            {/* Allergies */}
            <div>
              <label className="block font-mono text-xs text-pulse/60 tracking-widest mb-2">
                KNOWN ALLERGIES
                <span className="ml-2 text-white/20 normal-case">(separate with commas)</span>
              </label>
              <input
                type="text"
                name="allergies"
                value={form.allergies}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Latex, Peanuts"
                className="w-full bg-midnight/60 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:border-crimson/40 focus:ring-1 focus:ring-crimson/20 transition-colors"
              />
              <p className="mt-1.5 text-white/25 text-xs">Leave blank if no known allergies</p>
            </div>

            {/* Emergency Contact */}
            <div>
              <label className="block font-mono text-xs text-pulse/60 tracking-widest mb-2">
                EMERGENCY CONTACT <span className="text-crimson">*</span>
              </label>
              <input
                type="text"
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="e.g. Fatima Al-Rashid · +91 98765 43210 · Mother"
                className="w-full bg-midnight/60 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder-white/20 focus:border-pulse/40 focus:ring-1 focus:ring-pulse/20 transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="bg-crimson/10 border border-crimson/30 rounded-lg px-4 py-3 flex items-start gap-2">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
                  <circle cx="8" cy="8" r="7" stroke="#DC143C" strokeWidth="1.5"/>
                  <path d="M8 5v4M8 11v.5" stroke="#DC143C" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <p className="text-crimson text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="flex-1 bg-transparent border border-white/10 hover:border-white/20 text-white/50 hover:text-white/70 font-mono text-sm tracking-widest py-3.5 rounded-lg transition-colors"
              >
                CANCEL
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-[2] bg-crimson hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-mono text-sm tracking-widest py-3.5 rounded-lg transition-colors"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    SCANNING FINGERPRINT...
                  </span>
                ) : (
                  "ENROLL + SCAN FINGERPRINT →"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info note */}
        <div className="mt-4 bg-pulse/5 border border-pulse/10 rounded-xl px-5 py-4 space-y-2">
          <p className="font-mono text-xs text-pulse/60 tracking-wider">
            👆 AFTER SAVING, PLACE THE PATIENT&apos;S FINGER ON YOUR DEVICE&apos;S FINGERPRINT SENSOR WHEN PROMPTED
          </p>
          <p className="font-mono text-xs text-pulse/30 tracking-wider">
            ⚡ ALL DATA IS ENCRYPTED IN TRANSIT AND AT REST · HIPAA COMPLIANT STORAGE
          </p>
        </div>
      </main>
    </div>
  );
}
