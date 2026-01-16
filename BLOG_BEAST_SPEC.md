# 🤖 Blog Beast Module: Phase 2 Blueprint

## Overview
The "Blog Beast" is a high-authority content module designed to transform **Marliz Intel** from a news aggregator into a **Thought Leadership Platform**. It uses a "Pillar-Cluster" SEO model to dominate broad cybersecurity keywords while passing link authority to individual news articles.

---

## 🛠️ 1. Admin Dashboard Enhancements
- **New Tab: `Blogs`**: A dedicated section alongside `Health` and `Articles`.
- **Manual Publishing**: Reuse the existing `ArticleForm.jsx` logic but add a `content_type: 'blog'` flag.
- **Drafting & Lifecycle**:
  - `STATUS: DRAFT` (Not indexed, admin only)
  - `STATUS: READY` (Published, added to sitemap)
  - `STATUS: ARCHIVED` (Preserved but removed from main feed)

## 🧠 2. The AI Weekly Generator (The Core)
- **Trigger**: Every 7 days (Automated via APScheduler) or via `[ 🤖 Generate Weekly Pillar ]` button.
- **Knowledge Retrieval**: AI scans the database for articles published in the last 7 days.
- **Topic Clustering**: AI identifies the dominant theme of the week (e.g., "Ransomware in Healthcare", "Identity Theft Waves").
- **Automatic Internal Linking**:
  - The AI **must** reference local slugs. 
  - *Logic:* If the AI mentions "the breach at 700Credit," it automatically wraps it in `<a href="/article/700credit-data-breach-impacts-5-8-million-individuals">`.

## 📈 3. SEO & Ranking Strategy
- **The Pillar-Cluster Model**:
  - **Pillar (Blog):** High-volume keywords (e.g., "How to prevent phishing in 2026").
  - **Clusters (News):** Specific instances (e.g., "New PayPal Phishing Wave detected").
- **Sitemap Integration**:
  - Blogs added to `sitemap.xml` with `priority: 0.9`.
  - Structured Data (Schema.org): `Article` and `BlogPosting` markup.

## 🎨 4. Frontend Intelligence
- **Premium Layout**: Long-form focus, better typography, and "Related Intelligence" sidebar.
- **Breadcrumbs**: Explicit navigation for Google to understand the hierarchy (Home > Blog > Topic).
- **Navigation**: Persistent "Blog" tab in the main header.

---

## 🚀 Execution Note for AI Assistant
When this session resumes:
1. Initialize the `Blog` model in `models.py` (inheriting from Article or as a distinct table).
2. Create the `GET /api/blogs` and `POST /api/blogs` routes.
3. Build the `BlogPillarGenerator` service using the Groq `Llama-3.3-70b` model.
4. Update the Frontend `Header.jsx` to include the Blog link.
