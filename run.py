import subprocess
import time

print(" Starting servers...")

# Backend
subprocess.Popen(["uvicorn", "app.main:app", "--reload"], cwd="backend")

time.sleep(2)

# Frontend - FIXED for Windows
subprocess.Popen("npm run dev", cwd="frontend", shell=True)


print(" Frontend: http://localhost:3000") 
print(" Backend: http://localhost:8000")
