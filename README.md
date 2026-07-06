# Qscribe Backend
> **Fintech Savings & Habit-Building for University Students & First-Time Earners**

Qscribe is a backend service providing secure personal finance tools, goal-oriented savings, and habit-tracking features tailored for university students and early-career earners. 

The architecture is built with **Django REST Framework (DRF)**, **PostgreSQL** (production data store) / **SQLite** (development local store), **Redis** (caching and asynchronous message broker), and **Celery** (asynchronous background jobs & cron scheduling).

---

## 🔑 Verification Tiers & Permissions

To maintain compliance and manage financial risk, users progress through verification tiers. Each tier unlocks additional platform features:

| Verification Tier | Requirements | Features Unlocked |
|:---|:---|:---|
| **Tier 1** *(Registered)* | Phone number, University verification, Student ID Card Image upload | Access basic profiles, list & create saving goals. |
| **Tier 2** *(Verified ID)* | Tier 1 criteria + National Identification Number (NIN) + Facial Recognition Image | Standard deposit limits, auto-save recommendations (based on monthly income). |
| **Tier 3** *(Premium)* | Tier 2 criteria + Bank Verification Number (BVN) + Address verification | **Limitless deposits**, access to rare pets, **3.0% monthly interest rate** applied automatically to active savings goals. |

---

## 📧 Email & Marketing Integrations (Brevo)

Qscribe integrates with **Brevo (formerly Sendinblue)** for handling messaging workflows asynchronously:

1. **Transactional Email Flow:**
   - On registration, a welcome email template (`BREVO_WELCOME_TEMPLATE_ID`) is queued using Celery to send via Brevo.
   - Password reset links use template `BREVO_PASSWORD_RESET_TEMPLATE_ID`.
2. **Contact Marketing Integration:**
   - Registration triggers a call to Brevo's **Contacts API** adding/updating the user in **Contact List 1** (our primary mailing cohort). This list ID can be customized using `BREVO_DEFAULT_LIST_ID` in settings.
   - Contact list updates are non-blocking; issues contacting the marketing API will log warnings but won't interrupt critical user registration or welcome email delivery.

---

## 🕒 Background Jobs & Automated Tasks

We use **Celery** to manage long-running or periodic background processing:
- **`send_welcome_email`**: Contacts Brevo API asynchronously on sign-up to update lists and deliver templates.
- **`send_password_reset_email`**: Dispatches secure links when requested.
- **`apply_tier3_interest`** *(Periodic)*: Runs automatically on the 1st of every month at midnight. Calculates and applies the 3.0% interest rate to active, incomplete saving goals for all Tier 3 verified users.

---

## 📝 Structured Logging Config

To simplify debugging, Qscribe uses standard Python logging routed to both standard output and a rotating file handler at `logs/qscribe.log`:
- **File Rotation:** Rotates automatically at 5MB, maintaining up to 5 historical log backups.
- **Format:** `{timestamp} [{levelname}] {logger_name} — {message}`
- **Loggers Configured:** 
  - `app.savings.serializers` (validation & creation tracing)
  - `app.savings.services` (auto-save calculation logic)
  - `app.savings.tasks` (monthly interest calculations)
  - `app.users.views` (registration & tier upgrade traces)

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.12+
- Redis (installed and running locally on `redis://localhost:6379/0`)

### 2. Installation & Setup
Clone the repository, set up the virtual environment, and install dependencies:
```bash
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the root directory:
```env
BREVO_API_KEY=your_brevo_api_key
BREVO_SMTP_LOGIN=your_smtp_username
BREVO_SMTP=your_smtp_password
```

### 3. Running Database Migrations
```bash
python manage.py migrate
```

### 4. Running the Development Server
```bash
python manage.py runserver
```

### 5. Running the Celery Worker
Ensure Redis is running, then start the worker:
```bash
celery -A core.core worker --loglevel=info
```

For periodic interest tasks, start the scheduler in another terminal:
```bash
celery -A core.core beat --loglevel=info
```

---

## 🧪 Testing

We use Django's test framework. Tests mock external Brevo API calls to run reliably offline.

Run all tests:
```bash
python manage.py test
```

Or run modules individually:
```bash
python manage.py test app.users.tests
python manage.py test app.savings.tests
```