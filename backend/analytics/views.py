import csv
from datetime import timedelta
from decimal import Decimal
from django.http import HttpResponse
from django.utils import timezone
from django.db.models import Sum, Count, Q
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from orders.models import Order, OrderItem
from customers.models import Customer
from products.models import Product

class AnalyticsOverviewView(APIView):
    def get(self, request):
        range_param = request.query_params.get('range', '30d')
        days = 30
        if range_param == '7d':
            days = 7
        elif range_param == '90d':
            days = 90

        now = timezone.now()
        start_date = now - timedelta(days=days)
        previous_start = start_date - timedelta(days=days)

        # Current period orders
        current_orders = Order.objects.filter(order_date__gte=start_date)
        completed_orders = current_orders.filter(status='completed')

        current_revenue = completed_orders.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        current_orders_count = current_orders.count()
        completed_count = completed_orders.count()
        aov = (current_revenue / completed_count) if completed_count > 0 else Decimal('0.00')

        # Previous period comparison
        prev_orders = Order.objects.filter(order_date__gte=previous_start, order_date__lt=start_date)
        prev_completed = prev_orders.filter(status='completed')
        prev_revenue = prev_completed.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
        prev_orders_count = prev_orders.count()

        # Growth percentages
        rev_growth = 0.0
        if prev_revenue > 0:
            rev_growth = round(float((current_revenue - prev_revenue) / prev_revenue * 100), 1)
        elif current_revenue > 0:
            rev_growth = 100.0

        orders_growth = 0.0
        if prev_orders_count > 0:
            orders_growth = round(float((current_orders_count - prev_orders_count) / prev_orders_count * 100), 1)
        elif current_orders_count > 0:
            orders_growth = 100.0

        # Customer growth
        total_customers = Customer.objects.count()
        new_customers_in_period = Customer.objects.filter(created_at__gte=start_date).count()

        # Trend points
        revenue_trend = []
        # Group by daily if <= 30d, or 3-day steps if 90d
        step = 1 if days <= 30 else 3
        for i in range(days - 1, -1, -step):
            interval_end = now - timedelta(days=max(0, i - step + 1))
            interval_start = now - timedelta(days=i)
            day_orders = Order.objects.filter(order_date__gte=interval_start, order_date__lte=interval_end)
            day_completed = day_orders.filter(status='completed')

            day_rev = day_completed.aggregate(total=Sum('total_amount'))['total'] or Decimal('0.00')
            revenue_trend.append({
                'date': interval_start.strftime('%b %d'),
                'revenue': float(day_rev),
                'orders': day_orders.count(),
            })

        # Order status distribution
        status_counts = current_orders.values('status').annotate(count=Count('id'))
        status_map = {item['status']: item['count'] for item in status_counts}
        total_in_period = current_orders_count or 1
        status_distribution = [
            {'status': 'completed', 'label': 'Completed', 'count': status_map.get('completed', 0), 'percentage': round((status_map.get('completed', 0) / total_in_period) * 100, 1)},
            {'status': 'processing', 'label': 'Processing', 'count': status_map.get('processing', 0), 'percentage': round((status_map.get('processing', 0) / total_in_period) * 100, 1)},
            {'status': 'pending', 'label': 'Pending', 'count': status_map.get('pending', 0), 'percentage': round((status_map.get('pending', 0) / total_in_period) * 100, 1)},
            {'status': 'cancelled', 'label': 'Cancelled', 'count': status_map.get('cancelled', 0), 'percentage': round((status_map.get('cancelled', 0) / total_in_period) * 100, 1)},
        ]

        # Product performance
        top_items = OrderItem.objects.filter(order__order_date__gte=start_date).values(
            'product_name'
        ).annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('total_price')
        ).order_by('-total_sold')[:8]

        product_performance = [
            {
                'name': item['product_name'],
                'units_sold': item['total_sold'],
                'revenue': float(item['total_revenue'] or 0),
            }
            for item in top_items
        ]

        return Response({
            'metrics': {
                'total_revenue': float(current_revenue),
                'revenue_growth': rev_growth,
                'total_orders': current_orders_count,
                'orders_growth': orders_growth,
                'average_order_value': float(round(aov, 2)),
                'total_customers': total_customers,
                'new_customers': new_customers_in_period,
            },
            'revenue_trend': revenue_trend,
            'status_distribution': status_distribution,
            'product_performance': product_performance,
            'range': range_param,
        })

class ExportCSVView(APIView):
    def get(self, request):
        export_type = request.query_params.get('type', 'orders').lower()
        timestamp = timezone.now().strftime('%Y%m%d_%H%M%S')

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="bizoperance_{export_type}_{timestamp}.csv"'

        writer = csv.writer(response)

        if export_type == 'orders':
            writer.writerow([
                'Order ID',
                'Customer Name',
                'Customer Email',
                'Order Date',
                'Status',
                'Payment Status',
                'Subtotal',
                'Tax Rate (%)',
                'Tax Amount',
                'Total Amount',
                'Notes',
            ])
            orders = Order.objects.all().select_related('customer').order_by('-order_date')
            for o in orders:
                writer.writerow([
                    o.order_number,
                    o.customer.name,
                    o.customer.email,
                    o.order_date.strftime('%Y-%m-%d %H:%M:%S'),
                    o.get_status_display(),
                    o.get_payment_status_display(),
                    f"{o.subtotal:.2f}",
                    f"{o.tax_rate:.2f}",
                    f"{o.tax_amount:.2f}",
                    f"{o.total_amount:.2f}",
                    o.notes,
                ])

        elif export_type == 'products':
            writer.writerow([
                'Product Name',
                'SKU',
                'Category',
                'Unit Price',
                'Stock Quantity',
                'Low Stock Threshold',
                'Stock Status',
                'Available',
            ])
            products = Product.objects.all().order_by('name')
            for p in products:
                writer.writerow([
                    p.name,
                    p.sku,
                    p.category,
                    f"{p.unit_price:.2f}",
                    p.stock_quantity,
                    p.low_stock_threshold,
                    p.stock_status.replace('_', ' ').title(),
                    'Yes' if p.is_available else 'No',
                ])

        elif export_type == 'customers':
            writer.writerow([
                'Customer Name',
                'Email',
                'Phone',
                'Customer Type',
                'Address',
                'Total Orders',
                'Total Spent',
                'Registered Date',
            ])
            customers = Customer.objects.all().order_by('name')
            for c in customers:
                writer.writerow([
                    c.name,
                    c.email,
                    c.phone,
                    c.get_customer_type_display(),
                    c.address,
                    c.total_orders,
                    f"{c.total_spent:.2f}",
                    c.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                ])
        else:
            return Response({'error': 'Invalid export type. Allowed: orders, products, customers'}, status=status.HTTP_400_BAD_REQUEST)

        return response
