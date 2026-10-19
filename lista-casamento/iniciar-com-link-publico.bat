@echo off
chcp 65001 > nul
title Lista de Casamento - Pablo & Fernanda (Servidor + Link Online)

echo ======================================================================
echo   💍 CASAMENTO PABLO & FERNANDA - SERVIDOR + LINK ONLINE (CLOUDFLARE)
echo ======================================================================
echo.

set "NODE_PATH=C:\Program Files\nodejs\node.exe"
set "CLOUDFLARED_PATH=C:\Program Files (x86)\cloudflared\cloudflared.exe"

if not exist "%NODE_PATH%" (
  echo [ERRO] Node.js não foi encontrado em: %NODE_PATH%
  pause
  exit /b 1
)

if not exist "%CLOUDFLARED_PATH%" (
  echo [ERRO] Cloudflare Tunnel não foi encontrado em: %CLOUDFLARED_PATH%
  pause
  exit /b 1
)

echo [1/2] Iniciando Servidor Local na porta 3000...
start "Servidor Local" /min "%NODE_PATH%" server.js

timeout /t 2 > nul

echo [2/2] Gerando link público global (HTTPS seguro sem senhas)...
echo.
"%CLOUDFLARED_PATH%" tunnel --url http://localhost:3000

pause
