# Lost & Found — SCSU Campus Portal

A full-stack web application that helps Southern Connecticut State University students post, search for, and recover lost items on campus.

Built for **CSC 330** at SCSU.

---

## Features

- **Post listings** — Upload a photo, add a description, category, and location for any found item
- **Live dashboard** — Auto-refreshes every 30 seconds to show newly posted items without a manual page reload
- **Search & filter** — Filter listings by category (Accessories, Apparel, Books, Electronics, etc.) or search by keyword
- **Claim toggle** — Listing owners can mark their post as Claimed/Active; claimed items get a visual overlay
- **Messaging** — Students can connect with listing owners directly through in-app messaging
- **Report system** — Flag inappropriate or false listings for admin review
- **Admin panel** — Admins can review reports, ban users, and manage listings
- **Password reset** — Email-based forgot-password flow via Gmail SMTP
- **Automatic cleanup** — Claimed listings are automatically removed after 30 days

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3, Flask |
| Database | SQLite (dev) / PostgreSQL (production) |
| ORM | Flask-SQLAlchemy |
| Auth | Flask sessions + Werkzeug password hashing |
| Email | Flask-Mail (Gmail SMTP) |
| Frontend | Vanilla JS, Jinja2 templates, custom CSS |
| Deployment | Render (via `render.yaml`) |

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/<your-username>/LostAndFound.git
cd LostAndFound
