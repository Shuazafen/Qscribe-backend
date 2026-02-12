"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.urls import include, include, re_path

schema_view = get_schema_view(
    openapi.Info(
        title="Qscribe API",
        default_version='v1',
        description="API documentation for Qscribe",
    ),
    public=True,
)



urlpatterns = [
    re_path(r"^$", schema_view.with_ui("swagger", cache_timeout=0), name="schema-swagger-ui"),
    re_path(r"redoc/$", schema_view.with_ui("redoc", cache_timeout=0), name="schema-redoc"),
    path('admin/', admin.site.urls),
    # path('user/', include('app.users.urls')),
    # path('savings/', include('app.savings.urls')),
    # path('habits/', include('app.habits.urls')),
    # path('notifications/', include('app.notifications.urls')),
    # path('transactions/', include('app.transactions.urls')),
]
