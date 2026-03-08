from rest_framework.routers import DefaultRouter
from .views import McrReviewViewSet

router = DefaultRouter()
router.register(r"mcr/reviews", McrReviewViewSet, basename="mcr-reviews")
urlpatterns = router.urls
