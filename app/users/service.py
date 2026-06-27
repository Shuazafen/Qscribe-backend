import sib_api_v3_sdk
from sib_api_v3_sdk import ApiException
from django.conf import settings
import logging

class EmailService:
    def __init__(self):
        self.configuration = sib_api_v3_sdk.Configuration()
        self.configuration.api_key['api-key'] = settings.BREVO_API_KEY

    def send_individual_email(self, to_email, subject):
        # send individual email using Brevo
        try:
            api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(self.configuration))

            sender = sib_api_v3_sdk.SendSmtpEmailSender(
                email=settings.EMAIL_HOST_USER,
                name=settings.EMAIL_HOST
            )
            recipient = sib_api_v3_sdk.SendSmtpEmailTo(
                email=to_email,
                name=to_email.split("@")[0]
            )

            send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                sender=sender,
                to=[recipient],
                subject=subject,
                html_content="<p>This is a test email.</p>"
            )

            api_response = api_instance.send_transacemail(send_smtp_email)
            return api_response
        except ApiException as e:
            return f"Error sending email: {e}"

    def send_mass_email(self, to_emails, subject, html_content):
        # send mass email using Brevo
        try:
            api_instance = sib_api_v3_sdk.TransactionalEmailsApi(sib_api_v3_sdk.ApiClient(self.configuration))

            sender = sib_api_v3_sdk.SendSmtpEmailSender(
                email=settings.EMAIL_HOST_USER,
                name=settings.EMAIL_HOST
            )
            recipient = sib_api_v3_sdk.SendSmtpEmailTo(
                email=to_emails,
                name=to_emails.split("@")[0]
            )

            # Send in batches to avoid rate limits
            success_count = 0
            batch_size = 50
            
            for i in range(0, len(to_emails), batch_size):
                batch = to_emails[i:i + batch_size]
                recipient = [sib_api_v3_sdk.SendSmtpEmailTo(email=email) for email in batch]
                
                send_smtp_email = sib_api_v3_sdk.SendSmtpEmail(
                    sender=sender,
                    to=[recipient],
                    subject=subject,
                    html_content=html_content
                )

            api_response = api_instance.send_transacemail(send_smtp_email)
            return api_response
        except ApiException as e:
            return f"Error sending email: {e}"