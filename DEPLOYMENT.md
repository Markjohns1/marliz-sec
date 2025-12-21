# Deploying to DigitalOcean Droplet (Ubuntu)

## 1. Prerequisites
- **SSH Access:** You must be able to log in to your Droplet: `ssh root@<DROPLET_IP>`
- **Docker Installed:** Run `docker -v` to check. If not, run `snap install docker`.

## 2. Server Setup
**User:** `devops`
**Server IP:** `146.190.146.121`

## 3. How to Update (Deploy New Changes)
Whenever you push code to GitHub, run these commands on the server:

```bash
# 1. Login
ssh devops@146.190.146.121

# 2. Go to project folder
cd ~/cybersecurity-news   # (Adjust path if different)

# 3. Pull latest code
git pull origin main

# 4. Rebuild and restart services
# (Required when Python/React code changes)
docker compose up -d --build

# 5. Check logs to confirm it started
docker compose logs -f web
```

### C. Enable Clean URL (Nginx Proxy)
Run this once to configure the server to forward traffic to your app:

```bash
sudo bash -c 'cat > /etc/nginx/sites-available/marlizintel <<EOF
server {
    server_name marlizintel.com www.marlizintel.com;
    location / {
        proxy_pass http://localhost:3005;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF'

sudo ln -s /etc/nginx/sites-available/marlizintel /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d marlizintel.com -d www.marlizintel.com
```

## 5. Check Status
- **Visit Site (Production):** `https://marlizintel.com`
- **Check Logs:** `sudo docker compose logs -f web`

## 6. DNS Update (CRITICAL)
Since you bought the domain at **Host Africa**, you have two options:

### Option A: Manage DNS at Host Africa (Simple)
1. Log in to Host Africa.
2. Go to DNS Management for `marlizintel.com`.
3. Add an **A Record**:
   - **Name:** `@` (or leave blank)
   - **Value:** `146.190.146.121`
4. Add another **A Record**:
   - **Name:** `www`
   - **Value:** `146.190.146.121`

### Option B: Manage DNS via DigitalOcean (Recommended)
1. Log in to Host Africa.
2. Change **Nameservers** to:
   - `ns1.digitalocean.com`
   - `ns2.digitalocean.com`
   - `ns3.digitalocean.com`
3. Go to DigitalOcean -> Networking -> Domains.
4. Add `marlizintel.com` and point it to your Droplet.
