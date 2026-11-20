from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.decorators import action
from django.db.models import Sum, Count, Q
from django.utils import timezone
from datetime import timedelta, date
from decimal import Decimal

from .models import ActivityLog, Notification
from .serializers import ActivityLogSerializer, NotificationSerializer
from orders.models import Order, OrderItem
from customers.models import Customer
from products.models import Product
from tasks.models import Task
from business_settings.models import BusinessSettings
from .utils import log_activity, create_notification
from core.seed_data import seed_demonstration_data

class DashboardView(APIView):
    def get(self, request):
        now = timezone.now()
        range_param = request.query_params.get('range', '30d')
        days = 30
        if range_param == '7d':
            days = 7
        elif range_param == '90d':
            days = 90

        start_date = now - timedelta(days=days)

        # 1. KPI Cards
        # Total Revenue (completed orders)
        completed_orders = Order.objects.filter(status='completed')
        total_revenue = completed_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')

        # Total Orders
        total_orders_count = Order.objects.count()

        # Active Customers (customers with >= 1 order)
        active_customers_count = Customer.objects.annotate(order_count=Count('orders')).filter(order_count__gt=0).count()

        # Pending Orders
        pending_orders_count = Order.objects.filter(status__in=['pending', 'processing']).count()

        # 2. Revenue chart data for selected range
        chart_data = []
        for i in range(days - 1, -1, -1):
            day_start = (now - timedelta(days=i)).date()
            orders_day = Order.objects.filter(order_date__date=day_start)
            completed_day = orders_day.filter(status='completed')

            rev_day = completed_day.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            count_day = orders_day.count()

            chart_data.append({
                'date': day_start.strftime('%b %d'),
                'full_date': str(day_start),
                'revenue': float(rev_day),
                'orders': count_day,
            })

        # 3. Order status overview
        status_counts = Order.objects.values('status').annotate(count=Count('id'))
        status_map = {item['status']: item['count'] for item in status_counts}
        status_overview = [
            {'status': 'completed', 'label': 'Completed', 'count': status_map.get('completed', 0), 'color': '#10B981'},
            {'status': 'processing', 'label': 'Processing', 'count': status_map.get('processing', 0), 'color': '#3B82F6'},
            {'status': 'pending', 'label': 'Pending', 'count': status_map.get('pending', 0), 'color': '#F59E0B'},
            {'status': 'cancelled', 'label': 'Cancelled', 'count': status_map.get('cancelled', 0), 'color': '#EF4444'},
        ]

        # 4. Recent Orders (5 latest)
        recent_orders_qs = Order.objects.all().select_related('customer').order_by('-order_date')[:5]
        recent_orders = [
            {
                'id': ord.id,
                'order_number': ord.order_number,
                'customer_name': ord.customer.name,
                'customer_email': ord.customer.email,
                'order_date': ord.order_date.strftime('%Y-%m-%d %H:%M'),
                'amount': float(ord.total_amount),
                'status': ord.status,
                'payment_status': ord.payment_status,
            }
            for ord in recent_orders_qs
        ]

        # 5. Top Products / Services (by total sold quantity)
        top_items = OrderItem.objects.values('product_name').annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('total_price')
        ).order_by('-total_sold')[:5]

        top_products = [
            {
                'name': item['product_name'],
                'units_sold': item['total_sold'],
                'revenue': float(item['total_revenue'] or 0),
            }
            for item in top_items
        ]

        # 6. Recent Activity (last 6)
        activity_qs = ActivityLog.objects.all()[:6]
        recent_activity = ActivityLogSerializer(activity_qs, many=True).data

        # 7. Low stock alert count
        settings = BusinessSettings.get_settings()
        low_stock_products = Product.objects.filter(
            stock_quantity__lte=settings.low_stock_threshold_default
        ).count()

        return Response({
            'kpis': {
                'total_revenue': float(total_revenue),
                'total_orders': total_orders_count,
                'active_customers': active_customers_count,
                'pending_orders': pending_orders_count,
                'low_stock_alert_count': low_stock_products,
            },
            'revenue_chart': chart_data,
            'order_status_overview': status_overview,
            'recent_orders': recent_orders,
            'top_products': top_products,
            'recent_activity': recent_activity,
            'currency': {
                'symbol': settings.currency_symbol,
                'code': settings.currency_code,
            }
        })

class GlobalSearchView(APIView):
    def get(self, request):
        query = request.query_params.get('q', '').strip()
        if not query or len(query) < 2:
            return Response({
                'orders': [],
                'customers': [],
                'products': [],
                'tasks': [],
            })

        orders = Order.objects.filter(
            Q(order_number__icontains=query) |
            Q(customer__name__icontains=query) |
            Q(notes__icontains=query)
        )[:5]

        customers = Customer.objects.filter(
            Q(name__icontains=query) |
            Q(email__icontains=query) |
            Q(phone__icontains=query)
        )[:5]

        products = Product.objects.filter(
            Q(name__icontains=query) |
            Q(sku__icontains=query) |
            Q(category__icontains=query)
        )[:5]

        tasks = Task.objects.filter(
            Q(title__icontains=query) |
            Q(description__icontains=query) |
            Q(assigned_to__icontains=query)
        )[:5]

        return Response({
            'orders': [
                {
                    'id': o.id,
                    'title': o.order_number,
                    'subtitle': f"{o.customer.name} • ${o.total_amount}",
                    'status': o.status,
                    'type': 'order'
                }
                for o in orders
            ],
            'customers': [
                {
                    'id': c.id,
                    'title': c.name,
                    'subtitle': f"{c.email} • {c.get_customer_type_display()}",
                    'type': 'customer'
                }
                for c in customers
            ],
            'products': [
                {
                    'id': p.id,
                    'title': p.name,
                    'subtitle': f"{p.sku} • {p.category} • ${p.unit_price}",
                    'status': p.stock_status,
                    'type': 'product'
                }
                for p in products
            ],
            'tasks': [
                {
                    'id': t.id,
                    'title': t.title,
                    'subtitle': f"Assigned: {t.assigned_to} • Priority: {t.priority.capitalize()}",
                    'status': t.status,
                    'type': 'task'
                }
                for t in tasks
            ],
        })

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.all()[:30]

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'all marked as read'})

class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer

    def get_queryset(self):
        return ActivityLog.objects.all()[:50]

class DemoResetView(APIView):
    def post(self, request):
        seed_demonstration_data(clear_existing=True)
        return Response({
            'status': 'success',
            'message': 'Demo data has been reset to pristine baseline state.'
        })
