# Deploying to DigitalOcean Droplet (Ubuntu)

## 1. Prerequisites
- **SSH Access:** You must be able to log in to your Droplet: `ssh root@<DROPLET_IP>`
- **Docker Installed:** Run `docker -v` to check. If not, run `snap install docker`.

## 2. Server Setup
**User:** `devops`
**Server IP:** `146.190.146.121`

### C. Enable Clean URL (Nginx Proxy)
Run this once to configure the server to forward traffic to your app:

```bash
sudo bash -c 'cat > /etc/nginx/sites-available/marlizintel <<EOF
server {
    server_name marlizintel.tymirahealth.com;
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
sudo certbot --nginx -d marlizintel.tymirahealth.com
```

## 5. Check Status
- **Visit Site (Production):** `https://marlizintel.tymirahealth.com`
- **Check Logs:** `sudo docker compose logs -f web`

## 6. DNS Update
Go to your DNS provider (DigitalOcean Networking) and update the **A Record**:
- **Hostname:** `marlizintel`
- **Will Direct To:** `146.190.146.121` (Select your Droplet)
