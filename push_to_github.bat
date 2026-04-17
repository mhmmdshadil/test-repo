@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% add -A
%GIT% commit -m "fix: use service role key in API routes to bypass Supabase RLS"
%GIT% push origin main
