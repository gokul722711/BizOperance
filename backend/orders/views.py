from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, OrderItem
from .serializers import (
    OrderListSerializer,
    OrderDetailSerializer,
    OrderCreateUpdateSerializer,
)
from core.utils import log_activity, create_notification

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().select_related('customer').prefetch_related('items')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_number', 'customer__name', 'customer__email', 'notes']
    ordering_fields = ['order_date', 'total_amount', 'status', 'created_at']
    ordering = ['-order_date']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return OrderDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return OrderCreateUpdateSerializer
        return OrderListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        payment_status = self.request.query_params.get('payment_status')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        customer_id = self.request.query_params.get('customer')
        if customer_id:
            queryset = queryset.filter(customer_id=customer_id)

        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(order_date__date__gte=start_date)
        if end_date:
            queryset = queryset.filter(order_date__date__lte=end_date)

        return queryset

    def perform_create(self, serializer):
        order = serializer.save()
        log_activity(
            action_type="order_created",
            entity_type="order",
            entity_id=order.id,
            title=f"New Order Created: {order.order_number}",
            description=f"Order {order.order_number} created for {order.customer.name} totaling ${order.total_amount}."
        )
        create_notification(
            title="New Order Received",
            message=f"{order.order_number} placed by {order.customer.name} for ${order.total_amount}.",
            notification_type="success",
            entity_type="order",
            entity_id=order.id
        )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        valid_statuses = dict(Order.STATUS_CHOICES).keys()

        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Allowed values: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = order.status
        order.status = new_status
        order.save()

        log_activity(
            action_type="order_status_updated",
            entity_type="order",
            entity_id=order.id,
            title=f"Order Status Changed: {order.order_number}",
            description=f"Status transitioned from '{old_status}' to '{new_status}'."
        )

        create_notification(
            title=f"Order {order.order_number} Updated",
            message=f"Status updated to '{new_status}'.",
            notification_type="info",
            entity_type="order",
            entity_id=order.id
        )

        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'])
    def update_payment_status(self, request, pk=None):
        order = self.get_object()
        new_payment = request.data.get('payment_status')
        valid_statuses = dict(Order.PAYMENT_STATUS_CHOICES).keys()

        if new_payment not in valid_statuses:
            return Response(
                {'error': f'Invalid payment status. Allowed values: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_payment = order.payment_status
        order.payment_status = new_payment
        order.save()

        log_activity(
            action_type="order_payment_updated",
            entity_type="order",
            entity_id=order.id,
            title=f"Payment Updated: {order.order_number}",
            description=f"Payment changed from '{old_payment}' to '{new_payment}'."
        )

        return Response(OrderDetailSerializer(order).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status == 'cancelled':
            return Response({'message': 'Order is already cancelled.'})

        order.status = 'cancelled'
        order.save()

        # Restore product stock
        for item in order.items.all():
            if item.product:
                item.product.stock_quantity += item.quantity
                item.product.save()

        log_activity(
            action_type="order_cancelled",
            entity_type="order",
            entity_id=order.id,
            title=f"Order Cancelled: {order.order_number}",
            description=f"Order {order.order_number} was cancelled and inventory stock was restored."
        )

        create_notification(
            title=f"Order Cancelled",
            message=f"{order.order_number} has been cancelled.",
            notification_type="warning",
            entity_type="order",
            entity_id=order.id
        )

        return Response(OrderDetailSerializer(order).data)
