from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    stock_status = serializers.ReadOnlyField()

    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'sku',
            'description',
            'category',
            'unit_price',
            'stock_quantity',
            'low_stock_threshold',
            'is_available',
            'stock_status',
            'created_at',
            'updated_at',
        ]
