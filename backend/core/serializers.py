from rest_framework import serializers
from .models import ActivityLog, Notification

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'action_type', 'entity_type', 'entity_id', 'title', 'description', 'created_at']

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'notification_type', 'entity_type', 'entity_id', 'is_read', 'created_at']
