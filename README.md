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
git clone https://github.com/Juxnn02/LostAndFound.git
cd LostAndFound
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your_secret_key_here
MAIL_USERNAME=your_gmail@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

> For `MAIL_PASSWORD`, use a [Gmail App Password](https://support.google.com/accounts/answer/185833), not your regular Gmail password.

### 5. Initialize the database

```bash
python init.py
```

### 6. Run the app

```bash
flask run
```

Open [http://localhost:5000](http://localhost:5000) in your browser.

---

## Project Structure

```
LostAndFound/
├── app.py               # Flask routes and API endpoints
├── models.py            # SQLAlchemy database models
├── init.py              # Database initialization script
├── migrate.py           # Database migration helpers
├── requirements.txt
├── render.yaml          # Render deployment config
├── static/
│   ├── app.css          # Main stylesheet (SCSU-branded)
│   ├── dashboard.js     # Live polling, search, and filter logic
│   ├── listing_info.js  # Claim toggle, connect, and report logic
│   ├── messages.js      # In-app messaging
│   └── ...
└── templates/
    ├── dashboard.html
    ├── listing_info.html
    ├── createlisting.html
    ├── messages.html
    ├── admin.html
    └── ...
```

---

## Database Models

| Model | Description |
|---|---|
| `Account` | Stores name, email, and hashed password |
| `User` | Student profile linked to an Account (username, student ID) |
| `Post` | A found-item listing with category, location, image, and claim status |
| `Message` | Direct message between two users tied to a specific listing |
| `Report` | A report filed against a listing, reviewed by admins |
| `Admin` | Admin account (independent of student accounts) |

---

## Deployment

The app is configured for [Render](https://render.com) via `render.yaml`. Set the following environment variables in your Render service dashboard:

- `SECRET_KEY`
- `DATABASE_URL` (PostgreSQL connection string — Render provides this automatically)
- `MAIL_USERNAME`
- `MAIL_PASSWORD`

---

## License

MIT — see [LICENSE](LICENSE).
