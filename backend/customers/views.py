from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from .models import Customer
from .serializers import CustomerSerializer, CustomerDetailSerializer
from core.utils import log_activity, create_notification

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'email', 'phone', 'address']
    ordering_fields = ['name', 'created_at', 'customer_type']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CustomerDetailSerializer
        return CustomerSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        customer_type = self.request.query_params.get('customer_type')
        if customer_type:
            queryset = queryset.filter(customer_type=customer_type)
        return queryset

    def perform_create(self, serializer):
        customer = serializer.save()
        log_activity(
            action_type="customer_added",
            entity_type="customer",
            entity_id=customer.id,
            title=f"New Customer Registered",
            description=f"Added {customer.name} ({customer.get_customer_type_display()}) to directory."
        )
        create_notification(
            title="Customer Added",
            message=f"{customer.name} has been created.",
            notification_type="info",
            entity_type="customer",
            entity_id=customer.id
        )

    def perform_update(self, serializer):
        customer = serializer.save()
        log_activity(
            action_type="customer_updated",
            entity_type="customer",
            entity_id=customer.id,
            title=f"Customer Updated",
            description=f"Updated profile details for {customer.name}."
        )

    def perform_destroy(self, instance):
        name = instance.name
        c_id = instance.id
        instance.delete()
        log_activity(
            action_type="customer_deleted",
            entity_type="customer",
            entity_id=c_id,
            title=f"Customer Removed",
            description=f"Removed customer {name} from directory."
        )
