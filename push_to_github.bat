@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% add -A
%GIT% commit -m "fix: dynamic origin detection and improved biometric error visibility"
%GIT% push origin main
