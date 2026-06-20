from django.urls import path

from apps.clients.views import client_addresses, delete_client_address

app_name = "clients"

urlpatterns = [
    path("api/addresses/", client_addresses, name="addresses"),
    path('api/addresses/<int:address_id>/delete/', delete_client_address, name='delete-address'),
]
