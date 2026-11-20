"""
URL configuration for BizOperance project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/', include('business_settings.urls')),
    path('api/', include('customers.urls')),
    path('api/', include('products.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('tasks.urls')),
    path('api/analytics/', include('analytics.urls')),
]
