from django.urls import path
from .views import BusinessSettingsView

urlpatterns = [
    path('settings/', BusinessSettingsView.as_view(), name='business-settings'),
]
