from django.urls import path

from . import views

app_name = "delivery"
urlpatterns = [
    path("api/regions/", views.get_regions, name="delivery-regions"),
    path("api/districts/", views.get_districts, name="delivery-districts"),
    path("api/services/", views.get_delivery_services, name="delivery-services"),
    path("api/branches/", views.get_branches, name="delivery-branches"),
    path("api/tashkent-price/", views.get_tashkent_delivery_price, name="tashkent-price"),
]
