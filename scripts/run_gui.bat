@echo off
echo 🏆 Starting JianStory GUI Crawler Tool...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if required modules are installed
echo 📦 Checking dependencies...
python -c "import tkinter, requests, beautifulsoup4" 2>nul
if errorlevel 1 (
    echo ❌ Missing dependencies. Installing...
    pip install requests beautifulsoup4
)

REM Run the GUI
echo 🚀 Launching GUI...
python gui_crawler.py

pause
