from django.urls import path

from apps.orders.views import checkout_view

app_name = "orders"

urlpatterns = [
    path("checkout/", checkout_view, name="checkout"),
]
