"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(
        title="Qscribe API",
        default_version='v1',
        description="API documentation for Qscribe",
    ),
    public=True,
)


urlpatterns = [
    # Swagger & ReDoc
    re_path(r"^$", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    re_path(r"redoc/$", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),

    # Admin
    path('admin/', admin.site.urls),

    # API routes
    path('api/user/', include('app.users.urls')),
    path('api/savings/', include('app.savings.urls')),
    path('api/habits/', include('app.habits.urls')),
    path('api/transactions/', include('app.transactions.urls')),
    path('api/pets/', include('app.pets.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

