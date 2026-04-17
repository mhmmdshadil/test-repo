@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% add -A
%GIT% commit -m "feat: fingerprint-focused UI + reduce passkey manager prompt"
%GIT% push origin main
