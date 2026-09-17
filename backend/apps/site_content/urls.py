from django.urls import path

from .views import SiteImageListView


urlpatterns = [
    path(
        "",
        SiteImageListView.as_view(),
        name="site-image-list",
    ),
]