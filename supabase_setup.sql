-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Assuming existing patient columns here
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  blood_type TEXT NOT NULL,
  allergies TEXT,
  contact TEXT
);

CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  sign_count BIGINT DEFAULT 0,
  transports TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: Depending on your existing 'patients' table, the primary key 'id' might be a BIGINT. 
-- Make sure the patient_id type in 'webauthn_credentials' matches yours.
