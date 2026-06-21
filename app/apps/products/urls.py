from django.urls import path

from .views import products_api, home, cart_preorder_status

app_name = "products"

urlpatterns = [
    path("", home, name="home"),
    path("api/products/", products_api, name="products_api"),
    path('api/cart-preorder-status/', cart_preorder_status),
]
