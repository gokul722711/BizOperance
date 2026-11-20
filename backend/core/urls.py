from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DashboardView,
    GlobalSearchView,
    NotificationViewSet,
    ActivityLogViewSet,
    DemoResetView,
)

router = DefaultRouter()
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'activity', ActivityLogViewSet, basename='activity')

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('search/', GlobalSearchView.as_view(), name='global-search'),
    path('demo/reset/', DemoResetView.as_view(), name='demo-reset'),
    path('', include(router.urls)),
]
