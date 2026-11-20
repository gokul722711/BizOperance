from rest_framework import serializers
from decimal import Decimal
from .models import Order, OrderItem
from customers.models import Customer
from products.models import Product
from business_settings.models import BusinessSettings

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            'id',
            'product',
            'product_name',
            'unit_price',
            'quantity',
            'total_price',
        ]

class OrderListSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'customer',
            'customer_name',
            'customer_email',
            'order_date',
            'status',
            'payment_status',
            'items_count',
            'subtotal',
            'tax_rate',
            'tax_amount',
            'total_amount',
            'notes',
            'created_at',
            'updated_at',
        ]

    def get_items_count(self, obj):
        return obj.items.count()

class OrderDetailSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'customer',
            'customer_name',
            'customer_email',
            'customer_phone',
            'order_date',
            'status',
            'payment_status',
            'subtotal',
            'tax_rate',
            'tax_amount',
            'total_amount',
            'notes',
            'items',
            'created_at',
            'updated_at',
        ]

class OrderItemCreateInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(required=False, allow_null=True)
    product_name = serializers.CharField(max_length=255)
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    quantity = serializers.IntegerField(min_value=1)

class OrderCreateUpdateSerializer(serializers.ModelSerializer):
    items = OrderItemCreateInputSerializer(many=True, required=True)
    customer_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'order_number',
            'customer_id',
            'order_date',
            'status',
            'payment_status',
            'subtotal',
            'tax_rate',
            'tax_amount',
            'total_amount',
            'notes',
            'items',
        ]
        read_only_fields = ['order_number', 'subtotal', 'tax_rate', 'tax_amount', 'total_amount']

    def validate_customer_id(self, value):
        if not Customer.objects.filter(id=value).exists():
            raise serializers.ValidationError("Customer does not exist.")
        return value

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("An order must contain at least one item.")
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        customer_id = validated_data.pop('customer_id')
        customer = Customer.objects.get(id=customer_id)

        # Get default tax rate from settings if not set
        settings = BusinessSettings.get_settings()
        tax_rate = Decimal(str(settings.tax_rate))

        order_number = Order.generate_order_number()

        order = Order.objects.create(
            order_number=order_number,
            customer=customer,
            tax_rate=tax_rate,
            **validated_data
        )

        subtotal = Decimal('0.00')

        for item_data in items_data:
            product_id = item_data.get('product_id')
            product = None
            if product_id:
                try:
                    product = Product.objects.get(id=product_id)
                    # Deduct stock if product exists
                    product.stock_quantity = max(0, product.stock_quantity - item_data['quantity'])
                    product.save()
                except Product.DoesNotExist:
                    product = None

            unit_price = Decimal(str(item_data['unit_price']))
            qty = int(item_data['quantity'])
            total_price = unit_price * qty
            subtotal += total_price

            OrderItem.objects.create(
                order=order,
                product=product,
                product_name=item_data['product_name'],
                unit_price=unit_price,
                quantity=qty,
                total_price=total_price,
            )

        tax_amount = round(subtotal * (tax_rate / Decimal('100.00')), 2)
        total_amount = subtotal + tax_amount

        order.subtotal = subtotal
        order.tax_amount = tax_amount
        order.total_amount = total_amount
        order.save()

        return order
