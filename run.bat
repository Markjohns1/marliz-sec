@echo off
start "Back" cmd /k "cd backend && uvicorn app.main:app --reload"
start "Front" cmd /k "cd frontend && npm run dev"
timeout /t 3
start http://localhost:3000
