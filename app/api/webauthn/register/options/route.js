import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { cookies } from "next/headers";

const rpName = "Emergency ID";
const rpID = process.env.NODE_ENV === "development" ? "localhost" : "red-pulse-web.netlify.app"; 
// Adjust rpID as needed for production. Must match the domain where it's hosted.

export async function POST(req) {
  try {
    const body = await req.json();
    const { patientId, patientName } = body;

    if (!patientId || !patientName) {
      return NextResponse.json({ error: "Missing patient information" }, { status: 400 });
    }

    const user = {
      id: patientId, // SimpleWebAuthn requires id to be string or Uint8Array. Next route handles UUID nicely.
      name: patientName,
      displayName: patientName,
    };

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(user.id), // v10 requires Uint8Array
      userName: user.name,
      userDisplayName: user.displayName,
      attestationType: "none",
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "required", 
      },
      supportedAlgorithmIDs: [-7, -257], // ES256 and RS256
    });

    // Store the challenge temporarily in an HTTP-only cookie to verify later
    cookies().set("webauthn_challenge", options.challenge, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 300, // 5 minutes
      path: "/",
      sameSite: "strict",
    });

    return NextResponse.json(options);
  } catch (error) {
    console.error("GenerateregistrationOptions Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
