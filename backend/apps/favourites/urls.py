from django.urls import path

from .views import (
    FavouritesView,
    FavouritesAddView,
    FavouritesRemoveView,
)


urlpatterns = [
    path("", FavouritesView.as_view()),
    path("add/", FavouritesAddView.as_view()),
    path("remove/<int:variant_id>/", FavouritesRemoveView.as_view()),
]
