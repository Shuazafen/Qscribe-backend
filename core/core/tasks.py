from celery import shared_task
from django.conf import settings
import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException
import logging

logger = logging.getLogger(__name__)

class BrevoEmailService:
    def __init__(self):
        self.configuration = sib_api_v3_sdk.Configuration()
        self.configuration.api_key['api-key'] = settings.BREVO_API_KEY
        self.api_client = sib_api_v3_sdk.ApiClient(self.configuration)
        self.api_instance = sib_api_v3_sdk.TransactionalEmailsApi(self.api_client)

    def send_template_email(self, to_email, template_id, params=None, subject=None):
        """
        Send email using Brevo template
        """
        try:
            # Prepare the email with template
            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": to_email}],
                template_id=template_id,
                params=params or {}
            )
            
            # Optionally override subject if needed
            if subject:
                send_smtp_email.subject = subject

            # Send the email
            api_response = self.api_instance.send_transac_email(send_smtp_email)
            logger.info(f"Email sent successfully to {to_email} using template {template_id}")
            return api_response
            
        except ApiException as e:
            logger.error(f"Error sending email to {to_email}: {e}")
            return None

    def send_template_email_batch(self, to_emails, template_id, params=None):
        """
        Send batch emails using Brevo template
        """
        try:
            batch_size = 50
            success_count = 0
            
            for i in range(0, len(to_emails), batch_size):
                batch = to_emails[i:i + batch_size]
                
                # Create recipients list for batch
                recipients = [{"email": email} for email in batch]
                
                send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                    to=recipients,
                    template_id=template_id,
                    params=params or {}
                )
                
                api_response = self.api_instance.send_transac_email(send_smtp_email)
                success_count += len(batch)
                logger.info(f"Batch {i//batch_size + 1}: Sent {len(batch)} emails")
            
            return success_count
            
        except ApiException as e:
            logger.error(f"Error sending batch email: {e}")
            return None


# Celery Tasks
@shared_task(bind=True, max_retries=3)
def send_welcome_email(self, user_email, username, first_name=None):
    """
    Send welcome email using Brevo template and add the user to contact list 1.
    """
    logger.info(f"[Task:send_welcome_email] Starting for user_email={user_email} username={username}")
    try:
        service = BrevoEmailService()
        
        # 1. Add user to Brevo contact list
        try:
            # We configure ContactsApi using same config
            contacts_api = sib_api_v3_sdk.ContactsApi(service.api_client)
            
            # Create or update contact and add to list 1 (default)
            list_id = getattr(settings, 'BREVO_DEFAULT_LIST_ID', 1)
            create_contact = sib_api_v3_sdk.CreateContact(
                email=user_email,
                attributes={
                    "FNAME": first_name or username,
                },
                list_ids=[list_id],
                update_enabled=True
            )
            
            logger.info(f"[Task:send_welcome_email] Adding/updating contact {user_email} in list {list_id}")
            contacts_api.create_contact(create_contact)
            logger.info(f"[Task:send_welcome_email] Successfully added contact {user_email} to list {list_id}")
            
        except ApiException as ce:
            logger.warning(f"[Task:send_welcome_email] Brevo Contact API warning/error: {ce}")
            # Do not block the welcome email task if adding to list fails, but we note it.
        except Exception as e:
            logger.warning(f"[Task:send_welcome_email] General contact creation exception: {e}")

        # 2. Get template ID from settings
        template_id = settings.BREVO_WELCOME_TEMPLATE_ID
        
        # Prepare template parameters
        params = {
            "username": username,
            "first_name": first_name or username,
            "user_email": user_email,
            "login_url": settings.LOGIN_URL or "/login/",
            "support_email": settings.SUPPORT_EMAIL or "support@example.com",
            "year": "2026"
        }
        
        result = service.send_template_email(
            to_email=user_email,
            template_id=template_id,
            params=params
        )
        
        if result:
            logger.info(f"[Task:send_welcome_email] Success for user_email={user_email}")
            return {"status": "success", "email": user_email}
        else:
            # Retry if failed
            logger.warning(f"[Task:send_welcome_email] Send email failed. Retrying in 5 minutes...")
            self.retry(countdown=60 * 5)  # Retry after 5 minutes
            
    except Exception as e:
        logger.error(f"Error in send_welcome_email task: {e}")
        # Retry with exponential backoff
        self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=3)
def send_password_reset_email(self, user_email, reset_link, username):
    """
    Send password reset email using Brevo template
    """
    try:
        service = BrevoEmailService()
        
        template_id = settings.BREVO_PASSWORD_RESET_TEMPLATE_ID
        
        params = {
            "username": username,
            "reset_link": reset_link,
            "support_email": settings.SUPPORT_EMAIL or "support@example.com"
        }
        
        result = service.send_template_email(
            to_email=user_email,
            template_id=template_id,
            params=params
        )
        
        if result:
            return {"status": "success", "email": user_email}
        else:
            self.retry(countdown=60 * 5)
            
    except Exception as e:
        logger.error(f"Error in send_password_reset_email task: {e}")
        self.retry(exc=e, countdown=60 * (2 ** self.request.retries))


@shared_task
def send_bulk_notification_email(user_emails, template_id, params=None):
    """
    Send bulk notification email to multiple users
    """
    try:
        service = BrevoEmailService()
        
        result = service.send_template_email_batch(
            to_emails=user_emails,
            template_id=template_id,
            params=params
        )
        
        if result:
            return {"status": "success", "count": result}
        else:
            return {"status": "failed", "count": 0}
            
    except Exception as e:
        logger.error(f"Error in send_bulk_notification_email task: {e}")
        return {"status": "error", "error": str(e)}