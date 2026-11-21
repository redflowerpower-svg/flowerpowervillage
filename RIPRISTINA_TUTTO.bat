@echo off
chcp 65001 >nul
title Flower Power - Ripristino Postazione da Google Drive 5TB

echo ===========================================================
echo   FLOWER POWER SYSTEM - RIPRISTINO POSTAZIONE CLOUD
echo   (Ranong ^<--^> Koh Phayam via Google Drive 5TB)
echo ===========================================================
echo.

:: 0. Verifica preventiva che Antigravity IDE sia completamente chiuso
tasklist /FI "IMAGENAME eq Antigravity IDE.exe" /FO CSV /NH 2>NUL | find /I "Antigravity IDE.exe">NUL
if "%ERRORLEVEL%"=="0" goto :ANTIGRAVITY_OPEN
tasklist /FI "IMAGENAME eq Antigravity.exe" /FO CSV /NH 2>NUL | find /I "Antigravity.exe">NUL
if "%ERRORLEVEL%"=="0" goto :ANTIGRAVITY_OPEN

:: 1. Rileva automaticamente dove si trova la cartella del progetto su questo PC
set "PROJ_DIR="

if exist "D:\01 ANTIGRAVITY\flower-power-village-com\flowerpowervillage" (
    set "PROJ_DIR=D:\01 ANTIGRAVITY\flower-power-village-com\flowerpowervillage"
) else if exist "D:\WEB SITE Antigravity\flowerpowervillage" (
    set "PROJ_DIR=D:\WEB SITE Antigravity\flowerpowervillage"
) else if exist "%~dp0scripts\gdrive-handoff-pull.mjs" (
    set "PROJ_DIR=%~dp0"
)

if "%PROJ_DIR%"=="" (
    echo ===========================================================
    echo   ERRORE: Cartella del progetto non trovata!
    echo   Controlla i percorsi su disco D:.
    echo ===========================================================
    echo.
    pause
    exit /b 1
)

echo [1/3] Cartella progetto rilevata: "%PROJ_DIR%"
cd /d "%PROJ_DIR%"

:: 2. Sincronizzazione automatica del codice da GitHub prima del restore
echo.
echo [2/3] Allineamento codice da GitHub (git pull origin staging)...
git checkout staging >nul 2>&1

:: Auto-bonifica preventiva: scarta eventuali modifiche sporche sui file di sincronizzazione lasciate da precedenti handoff
git checkout -- scripts/gdrive-handoff-pull.mjs scripts/gdrive-handoff.mjs scripts/project-transfer.mjs scripts/project-sync.mjs scripts/history-clean.mjs scripts/update-agy-binaries.mjs RIPRISTINA_TUTTO.bat .agents/AGENTS.md >nul 2>&1

git pull origin staging
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [RETRY] Primo tentativo git pull non riuscito, riprovo tra 2 secondi...
    timeout /t 2 /nobreak >nul
    git pull origin staging
)
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===========================================================
    echo   ERRORE durante git pull origin staging!
    echo   Possibili modifiche locali non salvate o problema di rete.
    echo   Controlla i messaggi sopra prima di riprovare.
    echo ===========================================================
    echo.
    pause
    exit /b 1
)

:: 3. Download pacchetto, ripristino chat, PIN e credenziali da Google Drive 5TB
echo.
echo [3/3] Connessione a Google Drive 5TB e ripristino chat/PIN...
node scripts/gdrive-handoff-pull.mjs

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===========================================================
    echo   ERRORE durante il ripristino da Google Drive.
    echo   Controlla i messaggi sopra riportati.
    echo ===========================================================
    echo.
    pause
    exit /b 1
)

echo.
echo ===========================================================
echo   🎉 RIPRISTINO COMPLETATO CON SUCCESSO AL 100%!
echo   Ora puoi aprire Antigravity IDE: troverai tutto allineato.
echo ===========================================================
echo.
echo Premi un tasto per chiudere questa finestra...
pause >nul
exit /b 0

:ANTIGRAVITY_OPEN
echo ===========================================================
echo   ATTENZIONE: ANTIGRAVITY IDE E' ANCORA APERTO!
echo ===========================================================
echo   Chiudi completamente Antigravity IDE prima di continuare,
echo   altrimenti i database delle chat resteranno bloccati e
echo   alla chiusura l'IDE sovrascrivera' i PIN appena importati.
echo.
echo   Chiudi Antigravity IDE e poi rilancia RIPRISTINA_TUTTO.bat.
echo ===========================================================
echo.
pause
exit /b 1
