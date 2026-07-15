@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\open-management-concept.ps1"
if errorlevel 1 pause
