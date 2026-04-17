import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { createServerSupabase } from "../../../../../lib/supabaseServer";

function getRpID() {
  if (process.env.NODE_ENV === "development") return "localhost";
  if (process.env.NEXT_PUBLIC_APP_URL) return new URL(process.env.NEXT_PUBLIC_APP_URL).hostname;
  if (process.env.VERCEL_URL) return process.env.VERCEL_URL.replace(/^https?:\/\//, "");
  return "localhost";
}

function getExpectedOrigin() {
  if (process.env.NODE_ENV === "development") return "http://localhost:3000";
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { response, patientId } = body;
    
    if (!response || !patientId) return NextResponse.json({ error: "Missing info" }, { status: 400 });

    const expectedChallenge = cookies().get("webauthn_challenge")?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: "Challenge expired or missing" }, { status: 400 });
    }

    const rpID = getRpID();
    const expectedOrigin = getExpectedOrigin();

    const supabase = createServerSupabase();
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    const { verified, registrationInfo } = verification;

    if (verified && registrationInfo) {
      const { credentialPublicKey, credentialID, counter } = registrationInfo;

      // Ensure base64url encodings
      const base64PublicKey = Buffer.from(credentialPublicKey).toString('base64url');
      const base64CredentialID = Buffer.from(credentialID).toString('base64url');

      // Save credential to Supabase
      const { error: dbError } = await supabase
        .from("webauthn_credentials")
        .insert({
          patient_id: patientId,
          credential_id: base64CredentialID,
          public_key: base64PublicKey,
          sign_count: counter,
          transports: response.response.transports || [],
        });

      if (dbError) throw new Error("Failed to insert credential: " + dbError.message);

      // Clear challenge cookie
      cookies().delete("webauthn_challenge");

      return NextResponse.json({ verified: true });
    }

    return NextResponse.json({ verified: false }, { status: 400 });

  } catch (error) {
    console.error("VerifyRegistration Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
