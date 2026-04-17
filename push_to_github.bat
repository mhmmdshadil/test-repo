@echo off
set GIT="C:\Program Files\Git\cmd\git.exe"
%GIT% config --global user.email "mhmmdshadil@github.com"
%GIT% config --global user.name "mhmmdshadil"
%GIT% add .
%GIT% commit -m "Initial commit: Red Pulse Emergency ID system"
%GIT% branch -M main
%GIT% remote remove origin
%GIT% remote add origin https://github.com/mhmmdshadil/test-repo.git
%GIT% push -u origin main --force
