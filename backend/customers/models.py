from django.db import models
from django.db.models import Sum

class Customer(models.Model):
    TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('business', 'Business'),
    ]

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=50, blank=True)
    customer_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='individual')
    address = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.get_customer_type_display()})"

    @property
    def total_orders(self):
        return self.orders.count()

    @property
    def total_spent(self):
        completed_orders = self.orders.filter(status='completed')
        total = completed_orders.aggregate(total=Sum('total_amount'))['total']
        return total if total is not None else 0.00

    @property
    def last_activity_date(self):
        last_order = self.orders.order_by('-order_date').first()
        if last_order:
            return last_order.order_date
        return self.updated_at
