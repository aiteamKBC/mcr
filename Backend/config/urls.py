from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path("", SpectacularSwaggerView.as_view(url_name="openapi-schema"), name="swagger-ui-root"),
    path("admin/", admin.site.urls),
    path("openapi/schema/", SpectacularAPIView.as_view(), name="openapi-schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="openapi-schema"), name="swagger-ui"),
    path("api/", include("mcr.urls")),
]
