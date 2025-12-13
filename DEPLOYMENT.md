# Deploying to DigitalOcean Droplet (Ubuntu)

## 1. Prerequisites
- **SSH Access:** You must be able to log in to your Droplet: `ssh root@<DROPLET_IP>`
- **Docker Installed:** Run `docker -v` to check. If not, run `snap install docker`.

## 2. Server Setup (First Time Only)
On your local machine, tell the Droplet to pull your code:

```bash
# SSH into your server
ssh root@146.190.146.121

# Clone the repository (if not already there)
git clone https://github.com/Markjohns1/marliz-sec.git
cd marliz-sec
```

## 3. Configure Environment
Create the `.env` file on the server:
```bash
nano .env
```
Paste your secrets (get them from your local `.env` or App Platform settings):
```ini
NEWSDATA_IO_KEY=pub_...
GROQ_API_KEY=gsk_...
ADMIN_SECRET=...
FETCH_INTERVAL_HOURS=4
```
Save with `Ctrl+O`, `Enter`, then `Ctrl+X`.

## 4. Run the App
Start the application with Docker Compose:

```bash
# Pull latest changes
git pull origin main

# Start the container (detached mode)
docker compose up -d --build
```

## 5. Check Status
- **View Logs:** `docker compose logs -f`
- **Check Container:** `docker ps`
- **Visit Site:** `http://146.190.146.121:3000`

## 6. DNS Update
Go to your DNS provider (DigitalOcean Networking) and update the **A Record**:
- **Hostname:** `marlizintel`
- **Will Direct To:** `146.190.146.121` (Select your Droplet)
