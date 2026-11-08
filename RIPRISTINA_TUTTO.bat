@echo off
chcp 65001 >nul
title Flower Power - Ripristino Postazione da Google Drive 5TB

echo ===========================================================
echo   FLOWER POWER SYSTEM - RIPRISTINO POSTAZIONE CLOUD
echo   (Ranong ^<--^> Koh Phayam via Google Drive 5TB)
echo ===========================================================
echo.

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
git pull origin staging

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
echo   Ora puoi aprire Antigravity: troverai tutto allineato.
echo ===========================================================
echo.
echo Premi un tasto per chiudere questa finestra...
pause >nul
