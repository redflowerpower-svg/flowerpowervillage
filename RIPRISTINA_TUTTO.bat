@echo off
chcp 65001 >nul
title Flower Power - Ripristino Postazione da Google Drive 5TB
cd /d "%~dp0"

echo ===========================================================
echo   FLOWER POWER SYSTEM - RIPRISTINO POSTAZIONE CLOUD
echo   (Ranong ^<--^> Koh Phayam via Google Drive 5TB)
echo ===========================================================
echo.
echo Connessione a Google Drive e download del pacchetto in corso...
echo.

node scripts/gdrive-handoff-pull.mjs

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===========================================================
    echo   ERRORE durante il ripristino da Google Drive.
    echo   Controlla la connessione internet e riprova.
    echo ===========================================================
    echo.
    pause
    exit /b 1
)

echo.
echo Premi un tasto per chiudere questa finestra...
pause >nul
