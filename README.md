# 🏥 Universal One-Tap Emergency ID

A hospital-side emergency patient identification system using biometric scan simulation, built with Next.js 14, Supabase, and Tailwind CSS.

---

## ✅ Features

- 🔐 **Secure Login** — Supabase Auth (email + password)
- 🏠 **Dashboard** — Two-action hub: Identify Patient & Enroll Patient
- 🫁 **Biometric Scan Simulation** — Animated fingerprint scanner UI (no real biometrics)
- 📋 **Patient Enrollment** — Form with validation, saves to Supabase
- 🪪 **Emergency Medical Card** — Blood type, allergies (highlighted in red), emergency contact
- 🔄 **Full error handling** — No "Failed to fetch" errors, meaningful messages throughout

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | Framework |
| React 18 | UI components |
| Tailwind CSS | Styling |
| Supabase | Auth + PostgreSQL database |
| Vercel | Deployment |

---

## 📁 File Structure

```
/app
  /login        → Login page (Supabase auth)
  /dashboard    → Main hub with two action cards
  /enroll       → Patient registration form
  /scan         → Biometric scan animation (3-5 sec)
  /result       → Patient medical record display
  layout.js     → Root layout with fonts
  globals.css   → Tailwind + custom animations
/lib
  supabaseClient.js  → Supabase client (uses env vars)
```

---

## 🚀 Setup Instructions

### Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **"New Project"**
3. Fill in project name (e.g. `emergency-id`), set a strong database password, choose a region close to you
4. Wait ~1 minute for it to initialize

---

### Step 2 — Create the `patients` Table

In your Supabase Dashboard, go to **SQL Editor** and run:

```sql
-- Create the patients table
CREATE TABLE patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  blood_type TEXT NOT NULL,
  allergies TEXT DEFAULT 'None reported',
  contact TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all patients
CREATE POLICY "Authenticated users can read patients"
  ON patients FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert patients
CREATE POLICY "Authenticated users can insert patients"
  ON patients FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

---

### Step 3 — Create a Staff User (Auth)

In Supabase Dashboard → **Authentication** → **Users** → click **"Invite User"**

Enter a staff email (e.g. `staff@hospital.org`) and a password. This is what you'll use to log into the app.

Alternatively, go to **Authentication** → **Settings** → ensure **Email Auth** is enabled.

---

### Step 4 — Get Your API Keys

In Supabase Dashboard → **Project Settings** → **API**:

- Copy **Project URL** → this is your `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon / public key** → this is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

### Step 5 — Set Up Environment Variables (Local)

```bash
# In the project root
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

### Step 6 — Run Locally

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You'll be redirected to `/login`. Use the staff credentials you created in Step 3.

---

## 🌐 Deploy on Vercel

### Option A — GitHub + Vercel (Recommended)

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **"New Project"** → import your repo
3. In **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
4. Click **Deploy**

### Option B — Vercel CLI

```bash
npm install -g vercel
vercel

# Follow prompts, then add env vars:
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Redeploy
vercel --prod
```

---

## 🔄 App Flow

```
/login
  ↓ (email + password)
/dashboard
  ↓                      ↓
/scan              /enroll
  ↓ (3-4 sec anim)       ↓ (fill form)
/result            (shows success message)
  ↓
(patient card: name, blood type, allergies, contact)
```

---

## ⚠️ Troubleshooting

| Error | Solution |
|---|---|
| `Missing Supabase environment variables` | Check `.env.local` has both keys |
| `Table 'patients' not found` | Run the SQL setup in Step 2 |
| `Permission denied (42501)` | Check RLS policies were created |
| `No patients found` | Enroll a patient first before scanning |
| `Invalid login credentials` | Create a user via Supabase Auth > Users |
| Network errors | Ensure you're running via `npm run dev`, not opening HTML directly |

---

## 🔒 Security Notes

- Never commit `.env.local` (it's in `.gitignore`)
- RLS (Row Level Security) ensures only authenticated users access data
- All Supabase traffic is HTTPS encrypted
- Session tokens are managed by Supabase Auth client automatically

---

## 📸 Pages Overview

| Page | Path | Description |
|---|---|---|
| Login | `/login` | Supabase email/password auth |
| Dashboard | `/dashboard` | Main hub, protected route |
| Enroll | `/enroll` | Register new patient |
| Scan | `/scan` | Fingerprint animation → fetch latest patient |
| Result | `/result` | Emergency medical card |
