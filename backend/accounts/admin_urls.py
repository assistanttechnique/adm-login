from rest_framework.routers import DefaultRouter

from .admin_views import ManagedUserViewSet

router = DefaultRouter()
router.register("users", ManagedUserViewSet, basename="managed-user")

urlpatterns = router.urls
