@echo off
echo Installing Python dependencies...
python -m pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo Starting asset sync...
python scripts/smart_sync.py
if %errorlevel% neq 0 (
    echo Error: Sync failed
    pause
    exit /b 1
)

echo Sync completed successfully!
pause
