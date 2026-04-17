import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";

import { getWebAuthnConfig } from "../../../../../lib/webauthnConfig";

export async function POST(req) {
  try {
    const { rpID } = getWebAuthnConfig(req);
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
