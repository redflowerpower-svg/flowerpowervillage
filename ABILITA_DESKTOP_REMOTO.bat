@echo off
chcp 65001 >nul
title Abilitazione Desktop Remoto (RDP) - Flower Power

:: Verifica e richiede elevazione come Amministratore
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Richiesta permessi di Amministratore (UAC)...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo ===========================================================
echo   ABILITAZIONE DESKTOP REMOTO (RDP) PER TAILSCALE & WI-FI
echo ===========================================================
echo.

echo 1. Abilitazione Desktop Remoto nel Registro di sistema...
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Terminal Server" /v fDenyTSConnections /t REG_DWORD /d 0 /f

echo 2. Avvio automatico del servizio TermService...
sc config TermService start= auto
net start TermService

echo 3. Apertura porte 3389 nel Firewall di Windows...
netsh advfirewall firewall set rule group="Desktop remoto" new enable=Yes >nul 2>&1
netsh advfirewall firewall set rule group="Remote Desktop" new enable=Yes >nul 2>&1
powershell -NoProfile -Command "Enable-NetFirewallRule -DisplayGroup 'Desktop remoto' -ErrorAction SilentlyContinue; Enable-NetFirewallRule -Name 'RemoteDesktop-UserMode-In-TCP' -ErrorAction SilentlyContinue; Enable-NetFirewallRule -Name 'RemoteDesktop-UserMode-In-UDP' -ErrorAction SilentlyContinue" >nul 2>&1

echo.
echo ===========================================================
echo   🎉 DESKTOP REMOTO ABILITATO CON SUCCESSO!
echo ===========================================================
echo.
echo   Configurazione per l'app Android 'Windows App':
echo   -------------------------------------------------
echo   🏠 PROFILO LOCALE (Wi-Fi):
echo      - Nome PC:    192.168.1.87
echo      - Utente:     Red
echo.
echo   🌐 PROFILO REMOTO (Tailscale):
echo      - Nome PC:    100.102.50.39   (oppure: red-bmax)
echo      - Utente:     Red
echo   -------------------------------------------------
echo.
echo Premi un tasto per chiudere...
pause >nul

