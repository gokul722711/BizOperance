from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import BusinessSettings
from .serializers import BusinessSettingsSerializer
from core.utils import log_activity, create_notification

class BusinessSettingsView(APIView):
    def get(self, request):
        settings = BusinessSettings.get_settings()
        serializer = BusinessSettingsSerializer(settings)
        return Response(serializer.data)

    def put(self, request):
        settings = BusinessSettings.get_settings()
        serializer = BusinessSettingsSerializer(settings, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            log_activity(
                action_type="settings_updated",
                entity_type="settings",
                entity_id="1",
                title="Business Settings Updated",
                description=f"Profile details and business preferences were updated."
            )
            create_notification(
                title="Settings Updated",
                message=f"Settings updated successfully for {settings.business_name}.",
                notification_type="success",
                entity_type="settings",
                entity_id="1"
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
