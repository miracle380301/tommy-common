@echo off
chcp 65001 >nul
title YouTube Automaker

echo ====================================
echo     YouTube Automaker 시작
echo ====================================
echo.

:: Node.js 설치 확인
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다.
    echo Node.js를 설치해주세요: https://nodejs.org/
    pause
    exit /b 1
)

:: Python 설치 확인
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo Python을 설치해주세요: https://python.org/
    pause
    exit /b 1
)

echo [확인] Node.js와 Python이 설치되어 있습니다.
echo.

:: 의존성이 설치되어 있는지 확인
if not exist "node_modules" (
    echo [설치] 의존성을 설치합니다...
    call npm install
    if %errorLevel% neq 0 (
        echo [오류] npm install 실패
        pause
        exit /b 1
    )
)

if not exist "Frontend\node_modules" (
    echo [설치] Frontend 의존성을 설치합니다...
    cd Frontend
    call npm install
    if %errorLevel% neq 0 (
        echo [오류] Frontend npm install 실패
        pause
        exit /b 1
    )
    cd ..
)

if not exist "Backend\venv" (
    echo [설치] Backend 가상환경을 생성합니다...
    cd Backend
    python -m venv venv
    call venv\Scripts\activate.bat
    pip install -r requirements.txt
    if %errorLevel% neq 0 (
        echo [오류] Backend 의존성 설치 실패
        pause
        exit /b 1
    )
    call venv\Scripts\deactivate.bat
    cd ..
)

echo.
echo [시작] YouTube Automaker를 시작합니다...
echo.
echo 브라우저에서 http://localhost:3000 이 열립니다.
echo 종료하려면 이 창에서 Ctrl+C를 누르세요.
echo.

:: 개발 서버 시작
call npm run dev

pause