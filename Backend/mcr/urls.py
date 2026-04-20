# MCR file header: Backend\mcr\urls.py
# This file is part of the MCR application source.
# Purpose: Source file for the MCR application.


from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import McrReviewViewSet

router = DefaultRouter()
router.register(r"mcr/reviews", McrReviewViewSet, basename="mcr-reviews")

urlpatterns = [
    path(
        "mcr/dashboard/session-stats/",
        McrReviewViewSet.as_view({"get": "dashboard_session_stats", "post": "dashboard_session_stats"}),
        name="mcr-dashboard-session-stats",
    ),
    *router.urls,
]
