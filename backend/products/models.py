from django.db import models

class Product(models.Model):
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, default="General")
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    low_stock_threshold = models.IntegerField(default=10)
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.sku})"

    @property
    def stock_status(self):
        if self.stock_quantity <= 0:
            return "out_of_stock"
        if self.stock_quantity <= self.low_stock_threshold:
            return "low_stock"
        return "in_stock"
