# 🛡️ Incident Report: Path Traversal Attack Defense
**Date:** February 1, 2026
**Severity:** Critical (P0)
**Status:** Resolved / Hardened
**Actors:** Antigravity (AI Response) & User (System Administrator)

---

## 1. Executive Summary
On February 1, 2026, at approximately 17:38 (Local Time), the Marliz Sec News platform was targeted by a sophisticated **Path Traversal (CWE-22)** attack. The attacker attempted to exfiltrate sensitive system configuration files including SSH keys, environment variables, and password hashes. 

The incident was identified in real-time. A collaborative "SOC Office" response between the System Admin and AI Assistant successfully contained the breach within 60 minutes, eradicated the vulnerability, and rotated all compromised credentials.

---

## 2. Incident Classification
*   **Attack Type:** Path Traversal / Local File Inclusion (LFI)
*   **Vulnerability:** Weak input validation in the SPA (Single Page Application) catch-all route.
*   **Threat Actor IP:** `45.88.186.70`
*   **Impact:** Confirmed Read-Access to `/proc/self/environ` (Leaked API Keys) and system files.

---

## 3. Detailed Timeline

### **Phase 1: Detection (17:38 - 17:40)**
*   **Observational Data:** Live logs identified suspicious `GET` requests using `../../../../../../` sequences.
*   **Confirmed Leaks:** Attacker received `200 OK` for:
    *   `/etc/passwd`
    *   `/proc/self/environ` (Process environment variables)
    *   `~/.ssh/id_rsa` (Potential SSH private keys)
    *   `.aws/credentials` (Cloud credentials)

### **Phase 2: Analysis & Hotfix Development (17:41 - 17:45)**
*   **Root Cause:** The `serve_react_app` function in `backend/app/main.py` used `os.path.join(FRONTEND_DIST, full_path)` without checking if the resolved path escaped the `frontend/dist` directory.
*   **Hotfix Developed:** 
    *   Implemented strict ".." sequence detection.
    *   Added `os.path.abspath` normalization to ensure resolved paths stay within the web root.
    *   Added a secondary blacklist for system folders (`/etc/`, `/proc/`, `.ssh`).

### **Phase 3: Containment & Eradication (17:46 - 18:45)**
*   **Deployment:** The security patch was pushed to Git and pulled onto the production server.
*   **Docker Rebuild:** System Admin executed `docker compose up -d --build`. This killed the old container and deployed the hardened backend.
*   **Credential Revocation:** Since the attacker read the environment variables, all secrets were assumed compromised.
    *   **Groq API Key:** Rotated (Revoked old, created new).
    *   **Resend API Key:** Rotated (Revoked old, created new).
    *   **Admin Dashboard Secret:** Rotated to `Intel2004!`.

### **Phase 4: Recovery & Hardening (18:46 - 19:00)**
*   **DB Audit:** A manual SQL check confirmed no new `APIKey` records were added by the attacker. Record ID 1 (`admin`) remained unchanged since December 2025.
*   **Verification:** Admin successfully logged in with the new credentials. Logs confirmed the attacker's IP now receives `403 Forbidden` and `401 Unauthorized` responses.

---

## 4. Technical analysis of the Fix

The vulnerability was patched by adding a "Guard Layer" before any file system calls:

```python
# The Ironclad Shield
if ".." in full_path or full_path.startswith("/"):
    raise HTTPException(status_code=403, detail="Forbidden")

# Absolute Path Validation
abs_dist = os.path.abspath(FRONTEND_DIST)
requested_path = os.path.abspath(os.path.join(FRONTEND_DIST, full_path))
if not requested_path.startswith(abs_dist):
    raise HTTPException(status_code=403, detail="Forbidden")
```

---

## 5. Post-Mortem & Case Study Lessons
1.  **Observability is Key:** Without live log monitoring, this breach might have gone unnoticed for days, allowing total server takeover.
2.  **Docker as a Sandbox:** The containerized nature allowed for a "Clean Slate" eradication—destroying the compromised runtime and replacing it with a fresh image.
3.  **The "SOC" Partnership:** Real-time collaboration allowed for rapid code analysis, fix generation, and server-side execution.
4.  **Rotation is Non-Negotiable:** Even with a patch, a breach is only "solved" once the stolen secrets are rotated.

---
**Verified by:** Marliz Sec SOC Office
**Case Status:** CLOSED (February 1, 2026)
