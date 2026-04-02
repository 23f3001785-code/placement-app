Instihire is a Placement Portal Application built with Flask and **Vue 3** aimed at Institutes to manage their campus recruitment activities.

## ✨ Key Features
- **Smart Drive Management**: Create and track job drives with **Interview Mode** (In-Person, Remote, Hybrid) and explicit eligibility criteria (Degree, Branch, CGPA).
- **Personalized Eligibility Notifications**: Automated daily digests and direct alerts are tailored—students only see opportunities they are eligible for and haven't yet applied to.
- **Selection Alerts**: Instant "Congratulations" emails sent to students immediately upon being selected by a company.
- **Non-Destructive Workflows**: Administrative rejection of companies and drives is now record-based, allowing for better auditing before final deletion.
- **Role-based Dashboards**: Specialized views for Admins, Companies, and Students with real-time status badges and metrics.

## Pre-requisites
- Python 3.9+
- Redis (running locally on port 6379)
- MailHog (running locally, SMTP on 1025, Web UI on 8025)
- **Vue 3** (loaded via CDN)

## Setup Instructions

1. **Wait! Before you start...**
   This app requires **Redis** and **MailHog** for background jobs (emails, reports, reminders).
   
   **On Mac (Homebrew):**
   ```bash
   # Start Redis
   brew services start redis
   
   # Stop Redis (if it keeps running in the background)
   brew services stop redis
   
   # Alternatively, to kill any running Redis server instance:
   redis-cli shutdown
   
   # MailHog is usually run as a standalone binary or via brew
   mailhog
   ```

2. **Activate Virtual Environment**
   
   **On Mac/Linux:**
   ```bash
   source venv/bin/activate
   ```

   **On Windows:**
   ```bash
   venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start Background Services (Celery)**
   Open two new terminals (ensure `venv` is active in both):
   
   **Terminal A (Worker):**
   - **Mac/Linux:**
     ```bash
     celery -A celery_worker.celery worker --loglevel=info
     ```
   - **Windows:**
     ```bash
     celery -A celery_worker.celery worker --loglevel=info -P solo
     ```

   **Terminal B (Beat/Scheduler):**
   ```bash
   celery -A celery_worker.celery beat --loglevel=info
   ```

5. **Start Flask Server**
   ```bash
   python run.py
   ```
   Access at `http://127.0.0.1:5000`

   *(Default admin: `admin@instihire.com` / `admin123`)*

## 🧪 Demo Credentials
- **Admin**: `admin@instihire.com` / `admin123`
- **Company**: `hr@google.com` / `password123`
- **Student**: `manali@gmail.com` / `password123`

