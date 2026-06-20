from django.urls import path

from . import views
from .views import products_api, home

app_name = "products"

urlpatterns = [
    path("", home, name="home"),
    path("api/products/", products_api, name="products_api"),
]
