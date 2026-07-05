"""
Test script for Celery + Brevo integration.
Run from the Qscribe-backend root:
  python test_celery_brevo.py
"""
import os
import sys
import django

# ── Setup Django ──────────────────────────────────────────────────────────────
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'core'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.core.settings')

# Load .env manually (no python-dotenv needed)
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, _, value = line.partition('=')
                os.environ.setdefault(key.strip(), value.strip())

django.setup()

from django.conf import settings

SEP = "─" * 60

# ── 1. Check settings loaded correctly ────────────────────────────────────────
print(f"\n{SEP}")
print("1. SETTINGS CHECK")
print(SEP)
api_key = settings.BREVO_API_KEY
smtp_login = settings.EMAIL_HOST_USER
smtp_pass = settings.EMAIL_HOST_PASSWORD

print(f"  BREVO_API_KEY  : {'✓ loaded (' + api_key[:10] + '...)' if api_key else '✗ MISSING'}")
print(f"  SMTP LOGIN     : {'✓ ' + smtp_login if smtp_login else '✗ MISSING'}")
print(f"  SMTP PASSWORD  : {'✓ loaded' if smtp_pass else '✗ MISSING'}")
print(f"  Welcome TplID  : {settings.BREVO_WELCOME_TEMPLATE_ID}")
print(f"  PwdReset TplID : {settings.BREVO_PASSWORD_RESET_TEMPLATE_ID}")
print(f"  Celery Broker  : {settings.CELERY_BROKER_URL}")
print(f"  Celery Backend : {settings.CELERY_RESULT_BACKEND}")

# ── 2. Brevo API – send a test email ─────────────────────────────────────────
print(f"\n{SEP}")
print("2. BREVO API TEST  (direct send)")
print(SEP)

TEST_EMAIL = input("  Enter an email address to receive the test email: ").strip()
if not TEST_EMAIL:
    print("  ⚠  Skipped (no email entered)")
else:
    try:
        import sib_api_v3_sdk
        from sib_api_v3_sdk import ApiException

        configuration = sib_api_v3_sdk.Configuration()
        configuration.api_key['api-key'] = api_key
        api_client = sib_api_v3_sdk.ApiClient(configuration)
        api_instance = sib_api_v3_sdk.TransactionalEmailsApi(api_client)

        send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
            sender={"name": "Qscribe Test", "email": smtp_login},
            to=[{"email": TEST_EMAIL}],
            subject="Qscribe – Brevo API Test",
            html_content="<h2>Brevo is working! 🎉</h2><p>This is a direct API test from Qscribe.</p>"
        )
        response = api_instance.send_transac_email(send_smtp_email)
        print(f"  ✓ Email sent! Message ID: {response.message_id}")
    except ApiException as e:
        print(f"  ✗ Brevo API error: {e}")
    except Exception as e:
        print(f"  ✗ Unexpected error: {e}")

# ── 3. Redis / Celery connectivity ────────────────────────────────────────────
print(f"\n{SEP}")
print("3. REDIS / CELERY CONNECTIVITY")
print(SEP)
try:
    import redis
    url = settings.CELERY_BROKER_URL
    r = redis.from_url(url)
    r.ping()
    print(f"  ✓ Redis is reachable at {url}")
except ImportError:
    print("  ⚠  redis-py not installed – skipping Redis ping")
except Exception as e:
    print(f"  ✗ Redis connection failed: {e}")
    print("     Make sure Redis is running: docker run -p 6379:6379 redis")

# ── 4. Dispatch a Celery task ─────────────────────────────────────────────────
print(f"\n{SEP}")
print("4. CELERY TASK DISPATCH")
print(SEP)
if TEST_EMAIL:
    try:
        from core.core.tasks import send_welcome_email
        result = send_welcome_email.delay(
            user_email=TEST_EMAIL,
            username="testuser",
            first_name="Test"
        )
        print(f"  ✓ Task queued! Task ID: {result.id}")
        print(f"     Check Django admin → Celery Results for status.")
        print(f"     (Worker must be running: celery -A core.core.celery worker -l info)")
    except Exception as e:
        print(f"  ✗ Task dispatch failed: {e}")
else:
    print("  ⚠  Skipped (no email provided)")

print(f"\n{SEP}")
print("Done.")
print(SEP)
