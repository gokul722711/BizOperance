from rest_framework import serializers
from .models import BusinessSettings

class BusinessSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessSettings
        fields = [
            'id',
            'business_name',
            'business_email',
            'phone',
            'address',
            'currency_symbol',
            'currency_code',
            'tax_rate',
            'low_stock_threshold_default',
            'notifications_enabled',
            'updated_at',
        ]
