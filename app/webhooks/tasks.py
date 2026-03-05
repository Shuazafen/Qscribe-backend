import requests
import json
import hmac
import hashlib
from celery import shared_task
from django.conf import settings

@shared_task
def send_webhook_task(webhook_id, payload):
    from .models import Webhook
    try:
        webhook = Webhook.objects.get(id=webhook_id)
        if not webhook.is_active:
            return

        headers = {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': generate_signature(payload, webhook.secret_key)
        }
        
        response = requests.post(
            webhook.target_url, 
            data=json.dumps(payload), 
            headers=headers, 
            timeout=10
        )
        response.raise_for_status()
    except Exception as e:
        # In a real app, you might want to retry or log this
        print(f"Webhook failed: {e}")

def generate_signature(payload, secret):
    message = json.dumps(payload, sort_keys=True)
    return hmac.new(
        secret.encode(), 
        message.encode(), 
        hashlib.sha256
    ).hexdigest()
