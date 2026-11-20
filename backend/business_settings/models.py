from django.db import models

class BusinessSettings(models.Model):
    business_name = models.CharField(max_length=255, default="Apex Operations & Services")
    business_email = models.EmailField(default="contact@apexoperations.demo")
    phone = models.CharField(max_length=50, default="+1 (555) 345-6789")
    address = models.TextField(default="742 Evergreen Terrace, Suite 100, Springfield")
    currency_symbol = models.CharField(max_length=10, default="$")
    currency_code = models.CharField(max_length=10, default="USD")
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=8.50)
    low_stock_threshold_default = models.IntegerField(default=10)
    notifications_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Business Settings"
        verbose_name_plural = "Business Settings"

    def __str__(self):
        return self.business_name

    @classmethod
    def get_settings(cls):
        settings, _ = cls.objects.get_or_create(id=1)
        return settings
