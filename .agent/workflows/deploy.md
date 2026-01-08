---
description: Deploy current changes to the DigitalOcean VPS
---

# Deployment Workflow

Follow these steps to push your local changes to the live production server at marlizintel.com.

// turbo-all
1. **Commit and Push local changes**
   ```bash
   git add .
   git commit -m "Deployment: Update production with latest fixes"
   git push origin main
   ```

2. **SSH into the server and rebuild**
   ```bash
   ssh devops@146.190.146.121 "cd ~/marliz-sec && git pull origin main && docker compose up -d --build"
   ```

3. **Verify running containers**
   ```bash
   ssh devops@146.190.146.121 "docker ps"
   ```
