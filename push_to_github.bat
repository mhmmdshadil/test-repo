@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% add -A
%GIT% commit -m "chore: push all latest changes"
%GIT% push origin main
