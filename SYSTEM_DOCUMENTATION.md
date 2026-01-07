# Marliz Intel: System Implementation Overview

This document outlines the core architecture and high-value features implemented for the Marliz Intel cybersecurity news platform. The system is designed for high-performance content generation, automated audience engagement, and enterprise-grade security.

## 1. Content Engine & Automation
*   **Bulk Intelligence Processing:** Optimized the `refresh_articles.py` engine to process articles in "Aggressive Mode." The script instantly identifies and skips articles already meeting AdSense word-count requirements (800+ words), significantly reducing processing time.
*   **AI-Simplifier Service:** Implemented deep-intel generation using the Groq API. Articles are transformed from raw news feeds into structured intelligence reports featuring technical breakdowns (CVE/TTPs), business impact assessments, and actionable mitigation steps.
*   **Scheduler Integration:** Automated background tasks via `APScheduler`, including routine news fetching, AI processing, and scheduled newsletter delivery.

## 2. Newsletter Architecture
*   **Resend Service Integration:** Established a professional email pipeline using the Resend API. The system handles secure, high-deliverability email broadcasts to the subscriber base.
*   **Manual Selection Workflow:** Developed a command-and-control interface in the Admin Dashboard. The system allows an administrator to manually select up to two specific articles for immediate newsletter deployment, overriding default automation for time-sensitive alerts.
*   **Subscriber Management:** Implemented paginated subscriber tracking with individual premium status, verification checks, and health scores to monitor audience engagement levels.

## 3. Admin & UI/UX Systems
*   **High-Density Metrics:** Redesigned the Admin Dashboard with a focus on data density. Metrics such as "Active Reach" and "Health Score" are displayed in a compact, high-performance view to facilitate rapid assessment.
*   **Intel Editor:** Transformed the SEO editing tool into a "Full Intel Editor," allowing granular control over AI-generated content, metadata, and publishing status.
*   **Responsive Framework:** Ensured all administrative components are fully responsive, maintaining a professional "command center" aesthetic across mobile, tablet, and desktop devices.

## 4. Security & Scalability
*   **API Security:** All administrative endpoints are protected by robust API key verification. CORS and Content Security Policy (CSP) headers are strictly enforced to prevent unauthorized access and common web vulnerabilities.
*   **Transactional Integrity:** Implemented SQLAlchemy best practices, including session-per-task isolation and eager loading, to ensure database stability during high-volume operations.
*   **Containerized Deployment:** The platform is fully Dockerized, enabling seamless horizontal scaling across cloud providers such as DigitalOcean or AWS.

## 5. Technical Stack
*   **Backend:** FastAPI (Python), SQLAlchemy (Async), Resend API, Groq AI.
*   **Frontend:** React.js, Vite, TailwindCSS (limited), Lucide Icons, TanStack Query.
*   **Deployment:** Docker, Nginx, Linux.
