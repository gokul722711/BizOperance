from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import F
from .models import Product
from .serializers import ProductSerializer
from core.utils import log_activity, create_notification

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'sku', 'category', 'description']
    ordering_fields = ['name', 'unit_price', 'stock_quantity', 'category', 'created_at']
    ordering = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        is_available = self.request.query_params.get('is_available')
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() in ['true', '1'])

        stock_status = self.request.query_params.get('stock_status')
        if stock_status == 'out_of_stock':
            queryset = queryset.filter(stock_quantity__lte=0)
        elif stock_status == 'low_stock':
            queryset = queryset.filter(stock_quantity__gt=0, stock_quantity__lte=F('low_stock_threshold'))
        elif stock_status == 'in_stock':
            queryset = queryset.filter(stock_quantity__gt=F('low_stock_threshold'))

        return queryset

    def perform_create(self, serializer):
        product = serializer.save()
        log_activity(
            action_type="product_created",
            entity_type="product",
            entity_id=product.id,
            title=f"Product Added: {product.name}",
            description=f"Created product {product.name} (SKU: {product.sku}) at ${product.unit_price}."
        )

    def perform_update(self, serializer):
        product = serializer.save()
        log_activity(
            action_type="product_updated",
            entity_type="product",
            entity_id=product.id,
            title=f"Product Updated: {product.name}",
            description=f"Updated details for {product.name}."
        )

    def perform_destroy(self, instance):
        name = instance.name
        p_id = instance.id
        instance.delete()
        log_activity(
            action_type="product_deleted",
            entity_type="product",
            entity_id=p_id,
            title=f"Product Removed: {name}",
            description=f"Deleted product {name} from catalog."
        )

    @action(detail=True, methods=['post'])
    def adjust_stock(self, request, pk=None):
        product = self.get_object()
        delta = request.data.get('quantity_delta')
        new_quantity = request.data.get('new_quantity')
        reason = request.data.get('reason', 'Manual Adjustment')

        old_quantity = product.stock_quantity

        if new_quantity is not None:
            try:
                product.stock_quantity = max(0, int(new_quantity))
            except ValueError:
                return Response({'error': 'Invalid new_quantity'}, status=status.HTTP_400_BAD_REQUEST)
        elif delta is not None:
            try:
                product.stock_quantity = max(0, product.stock_quantity + int(delta))
            except ValueError:
                return Response({'error': 'Invalid quantity_delta'}, status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Either quantity_delta or new_quantity is required'}, status=status.HTTP_400_BAD_REQUEST)

        product.save()

        # Check low stock notification
        if product.stock_quantity <= product.low_stock_threshold and product.stock_quantity > 0:
            create_notification(
                title=f"Low Stock Alert: {product.name}",
                message=f"Only {product.stock_quantity} units remaining (Threshold: {product.low_stock_threshold}).",
                notification_type="warning",
                entity_type="product",
                entity_id=product.id
            )
        elif product.stock_quantity == 0:
            create_notification(
                title=f"Out of Stock: {product.name}",
                message=f"{product.name} is now completely out of stock.",
                notification_type="danger",
                entity_type="product",
                entity_id=product.id
            )

        log_activity(
            action_type="stock_adjusted",
            entity_type="product",
            entity_id=product.id,
            title=f"Stock Adjusted: {product.name}",
            description=f"Stock adjusted from {old_quantity} to {product.stock_quantity}. Reason: {reason}."
        )

        return Response(ProductSerializer(product).data)

    @action(detail=False, methods=['get'])
    def categories(self, request):
        categories = Product.objects.values_list('category', flat=True).distinct().order_by('category')
        return Response(list(categories))

    @action(detail=False, methods=['get'])
    def summary(self, request):
        total_products = Product.objects.count()
        total_units = sum(Product.objects.values_list('stock_quantity', flat=True))
        low_stock_count = Product.objects.filter(
            stock_quantity__gt=0, stock_quantity__lte=F('low_stock_threshold')
        ).count()
        out_of_stock_count = Product.objects.filter(stock_quantity__lte=0).count()

        return Response({
            'total_products': total_products,
            'total_units': total_units,
            'low_stock_count': low_stock_count,
            'out_of_stock_count': out_of_stock_count,
        })
