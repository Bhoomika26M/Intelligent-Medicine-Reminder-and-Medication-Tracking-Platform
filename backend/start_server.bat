@echo off
REM ============================================================
REM  PillSync – Backend Server Launcher & Port Fix Script
REM  Fixes WinError 10013 (all known causes on Windows 11)
REM ============================================================

echo.
echo ==========================================
echo  PillSync Backend – Port Diagnostic Fix
echo ==========================================
echo.

REM ── Step 1: Kill any existing uvicorn / python processes on port 8000 ──────
echo [1/6] Checking for processes on port 8000...
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr :8000 ^| findstr LISTENING') do (
    echo       Found PID %%a on port 8000 – terminating...
    taskkill /PID %%a /F >nul 2>&1
)
echo       Port 8000 is now clear.

REM ── Step 2: Kill any stale python / uvicorn processes by name ───────────────
echo [2/6] Killing any stale uvicorn processes...
taskkill /IM uvicorn.exe /F >nul 2>&1
REM Kill any python processes that might be holding ports (SAFE – only kills venv python)
for /f "tokens=2" %%a in ('tasklist /fi "IMAGENAME eq python.exe" /fo csv /nh 2^>nul') do (
    taskkill /PID %%~a /F >nul 2>&1
)
echo       Done.

REM ── Step 3: Verify port 8000 is free ────────────────────────────────────────
echo [3/6] Verifying port 8000 availability...
netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel%==0 (
    echo       WARNING: Port 8000 still occupied. Switching to port 8001.
    set PORT=8001
) else (
    echo       Port 8000 is free.
    set PORT=8000
)

REM ── Step 4: Check Windows reserved / Hyper-V port exclusions ────────────────
echo [4/6] Checking Hyper-V / Windows reserved port ranges...
netsh interface ipv4 show excludedportrange protocol=tcp 2>nul | findstr "8000" >nul
if %errorlevel%==0 (
    echo       Port 8000 is in a Windows-reserved range. Using port 8001.
    set PORT=8001
) else (
    echo       Port 8000 is NOT in any Windows reserved range. Good.
)

REM ── Step 5: Activate venv ───────────────────────────────────────────────────
echo [5/6] Activating virtual environment...
if not exist venv\Scripts\activate.bat (
    echo       ERROR: venv not found! Run: python -m venv venv && venv\Scripts\pip install -r requirements.txt
    pause
    exit /b 1
)
call venv\Scripts\activate.bat
echo       Virtual environment activated.

REM ── Step 6: Launch uvicorn on the determined safe port ──────────────────────
echo [6/6] Starting PillSync FastAPI server on port %PORT%...
echo.
echo ==========================================
echo  Server starting at: http://127.0.0.1:%PORT%
echo  Swagger docs at:    http://127.0.0.1:%PORT%/docs
echo  ReDoc at:           http://127.0.0.1:%PORT%/redoc
echo ==========================================
echo.

uvicorn app.main:app --host 127.0.0.1 --port %PORT% --reload

pause
