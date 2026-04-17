import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";

function getRpID() {
  if (process.env.NODE_ENV === "development") return "localhost";
  if (process.env.NEXT_PUBLIC_APP_URL) return new URL(process.env.NEXT_PUBLIC_APP_URL).hostname;
  if (process.env.VERCEL_URL) return process.env.VERCEL_URL.replace(/^https?:\/\//, "");
  return "localhost";
}

export async function POST() {
  try {
    const rpID = getRpID();
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "required",
      // Omit allowCredentials here! This forces Discoverable Credentials (Passkey) UI where the 
      // user's device lets them select WHICH patient they are scanning the fingerprint for.
    });

    // Store the challenge temporarily in an HTTP-only cookie to verify later
    cookies().set("webauthn_login_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 300, // 5 minutes
      path: "/",
      sameSite: "strict",
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("GenerateAuthOptions Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
