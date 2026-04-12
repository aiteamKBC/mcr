# MCR file header: Backend\mcr\urls.py
# This file is part of the MCR application source.
# Purpose: Source file for the MCR application.


from rest_framework.routers import DefaultRouter
from .views import McrReviewViewSet

router = DefaultRouter()
router.register(r"mcr/reviews", McrReviewViewSet, basename="mcr-reviews")
urlpatterns = router.urls
