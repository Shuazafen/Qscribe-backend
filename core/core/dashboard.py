from django.utils.translation import gettext_lazy as _
from app.users.models import User
from app.webhooks.models import Webhook
from app.notifications.models import Notification
from django.utils.timezone import now, timedelta

def dashboard_callback(request, context):
    """
    Callback for customising the Unfold dashboard with real data.
    """
    # Calculate some stats
    total_users = User.objects.count()
    active_webhooks = Webhook.objects.filter(is_active=True).count()
    
    # Simple "Recent Notifications" or pending count
    pending_notifications = Notification.objects.filter(is_read=False).count()
    
    # Users in last 30 days
    thirty_days_ago = now() - timedelta(days=30)
    recent_users = User.objects.filter(date_joined__gte=thirty_days_ago).count()

    context.update({
        "stats": [
            {
                "title": _("Total Users"),
                "metric": str(total_users),
                "icon": "people",
                "footer": _(f"{recent_users} new in last 30 days"),
            },
            {
                "title": _("Active Webhooks"),
                "metric": str(active_webhooks),
                "icon": "webhook",
            },
            {
                "title": _("Unread Notifications"),
                "metric": str(pending_notifications),
                "icon": "notifications",
            },
        ],
        "navigation": [
            {
                "title": _("Quick Actions"),
                "items": [
                    {
                        "title": _("Add Transaction"),
                        "link": "/admin/transactions/transaction/add/",
                        "icon": "add_circle",
                    },
                    {
                        "title": _("New Habit"),
                        "link": "/admin/habits/habit/add/",
                        "icon": "add_task",
                    },
                ],
            },
        ],
    })
    return context
