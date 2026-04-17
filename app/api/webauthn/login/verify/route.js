import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { cookies } from "next/headers";
import { supabase } from "../../../../../lib/supabaseClient";

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
    const { response } = body;
    
    if (!response) return NextResponse.json({ error: "Missing info" }, { status: 400 });

    const expectedChallenge = cookies().get("webauthn_login_challenge")?.value;

    if (!expectedChallenge) {
      return NextResponse.json({ error: "Challenge expired or missing" }, { status: 400 });
    }

    // Attempt to looking up the user's credential by the ID provided in the response
    const credentialIdStr = response.id; // It's base64url encoded

    const { data: credData, error: credError } = await supabase
      .from("webauthn_credentials")
      .select("*, patients(*)")
      .eq("credential_id", credentialIdStr)
      .single();

    if (credError || !credData) {
      return NextResponse.json({ error: "Credential not found in database" }, { status: 404 });
    }

    const { public_key, sign_count, patients: patient } = credData;

    // Convert string base64url back to Uint8Array required by simplewebauthn
    // Convert string base64url back to Uint8Array required by simplewebauthn
    const publicKeyBuffer = new Uint8Array(Buffer.from(public_key, 'base64url'));

    const rpID = getRpID();
    const expectedOrigin = getExpectedOrigin();

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: new Uint8Array(Buffer.from(credentialIdStr, 'base64url')),
        credentialPublicKey: publicKeyBuffer,
        counter: Number(sign_count),
        transports: credData.transports || [],
      },
      requireUserVerification: true,
    });

    const { verified, authenticationInfo } = verification;

    if (verified && authenticationInfo) {
      const { newCounter } = authenticationInfo;

      // Update the sign count
      await supabase
        .from("webauthn_credentials")
        .update({ sign_count: newCounter })
        .eq("id", credData.id);

      // Clear challenge cookie
      cookies().delete("webauthn_login_challenge");

      return NextResponse.json({ verified: true, patient });
    }

    return NextResponse.json({ verified: false }, { status: 400 });

  } catch (error) {
    console.error("VerifyAuth Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
