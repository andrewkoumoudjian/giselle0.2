@echo off
ECHO Setting up Giselle AI Interview System...

ECHO Installing root dependencies...
call npm install

ECHO Setting up frontend...
cd frontend
call npm install
cd ..

ECHO Setting up backend...
cd backend

REM Check if Python is available
where python >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO Error: Python is not installed
    EXIT /B 1
)

REM Create virtual environment if it doesn't exist
IF NOT EXIST venv (
    ECHO Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate

REM Install backend dependencies
ECHO Installing backend dependencies...
pip install -r requirements.txt

REM Setup environment variables if not exists
IF NOT EXIST .env (
    ECHO Copying environment variables template...
    copy .env.example .env
    ECHO Please update .env with your API keys and configuration
)

cd ..

ECHO Setup complete! You can now run the project with:
ECHO npm run dev 