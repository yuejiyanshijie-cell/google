@echo off
REM Deployment script for PURE app (Windows)
REM This script builds and deploys the application using Docker

echo Starting deployment process...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)

REM Check if docker-compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo Docker Compose is not installed.
    exit /b 1
)

REM Build the application
echo Building the application...
call npm run build
if errorlevel 1 (
    echo Build failed!
    exit /b 1
)

REM Build Docker image
echo Building Docker image...
docker-compose build --no-cache

REM Stop existing containers
echo Stopping existing containers...
docker-compose down

REM Start new containers
echo Starting new containers...
docker-compose up -d

REM Wait for health check
echo Waiting for application to start...
timeout /t 10 /nobreak >nul

REM Check container status
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo Deployment may have failed. Check logs with: docker-compose logs
    exit /b 1
) else (
    echo Deployment successful!
    echo Application is running at: http://localhost
)
