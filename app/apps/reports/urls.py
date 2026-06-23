from django.urls import path

from . import views

app_name = "reports"

urlpatterns = [
    path("", views.reports_dashboard, name="dashboard"),
    path("preorder/", views.preorder_report, name="preorder"),
    path("products/", views.products_report, name="products"),
    path("categories/", views.categories_report, name="categories"),
]