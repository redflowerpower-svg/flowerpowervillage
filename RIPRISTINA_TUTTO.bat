@echo off
chcp 65001 >nul
title Flower Power - Ripristino Postazione da Google Drive 5TB

:: 1. Posizionati sempre nella cartella ufficiale del progetto
if exist "D:\WEB SITE Antigravity\flowerpowervillage" (
    cd /d "D:\WEB SITE Antigravity\flowerpowervillage"
) else if exist "%~dp0scripts\gdrive-handoff-pull.mjs" (
    cd /d "%~dp0"
) else (
    echo ===========================================================
    echo   ERRORE: Cartella di progetto non trovata in D:\WEB SITE Antigravity\flowerpowervillage
    echo ===========================================================
    echo.
    pause
    exit /b 1
)

echo ===========================================================
echo   FLOWER POWER SYSTEM - RIPRISTINO POSTAZIONE CLOUD
echo   (Ranong ^<--^> Koh Phayam via Google Drive 5TB)
echo ===========================================================
echo Cartella di lavoro: %CD%
echo.
echo Connessione a Google Drive e download del pacchetto in corso...
echo.

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
echo   RIPRISTINO COMPLETATO CON SUCCESSO!
echo ===========================================================
echo.
echo Premi un tasto per chiudere questa finestra...
pause >nul
