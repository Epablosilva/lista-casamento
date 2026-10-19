@echo off
chcp 65001 > nul
title Lista de Casamento & Checklist de Presentes

echo ========================================================
echo   💍 INICIANDO SISTEMA DE LISTA DE CASAMENTO...
echo ========================================================
echo.

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  echo Iniciando com Node.js...
  node server.js
) else (
  if exist "C:\Program Files\nodejs\node.exe" (
    echo Iniciando com "C:\Program Files\nodejs\node.exe"...
    "C:\Program Files\nodejs\node.exe" server.js
  ) else (
    echo [AVISO] Node.js não encontrado no PATH padrão.
    pause
  )
)

pause
