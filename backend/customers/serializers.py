from rest_framework import serializers
from .models import Customer

class CustomerSerializer(serializers.ModelSerializer):
    total_orders = serializers.ReadOnlyField()
    total_spent = serializers.ReadOnlyField()
    last_activity_date = serializers.ReadOnlyField()

    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'email',
            'phone',
            'customer_type',
            'address',
            'notes',
            'total_orders',
            'total_spent',
            'last_activity_date',
            'created_at',
            'updated_at',
        ]

class CustomerSimpleOrderSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    order_number = serializers.CharField()
    order_date = serializers.DateTimeField()
    status = serializers.CharField()
    payment_status = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)

class CustomerDetailSerializer(CustomerSerializer):
    recent_orders = serializers.SerializerMethodField()

    class Meta(CustomerSerializer.Meta):
        fields = CustomerSerializer.Meta.fields + ['recent_orders']

    def get_recent_orders(self, obj):
        orders = obj.orders.all().order_by('-order_date')[:5]
        return CustomerSimpleOrderSerializer(orders, many=True).data
