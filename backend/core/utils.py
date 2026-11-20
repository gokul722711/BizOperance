from .models import ActivityLog, Notification

def log_activity(action_type, entity_type, entity_id="", title="", description=""):
    try:
        return ActivityLog.objects.create(
            action_type=action_type,
            entity_type=entity_type,
            entity_id=str(entity_id),
            title=title,
            description=description,
        )
    except Exception as e:
        print(f"Error logging activity: {e}")
        return None

def create_notification(title, message, notification_type="info", entity_type="", entity_id=""):
    try:
        return Notification.objects.create(
            title=title,
            message=message,
            notification_type=notification_type,
            entity_type=entity_type,
            entity_id=str(entity_id),
        )
    except Exception as e:
        print(f"Error creating notification: {e}")
        return None
