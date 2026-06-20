from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Client, ClientAddress


@admin.register(Client)
class ClientAdmin(ModelAdmin):
    list_display = ['full_name', 'phone_number', 'telegram_id', 'order_count']
    search_fields = ['full_name', 'phone_number', 'telegram_id']
    list_fullwidth = True

    @admin.display(description="Buyurtmalar")
    def order_count(self, obj):
        return obj.orders.count()


@admin.register(ClientAddress)
class ClientAddressAdmin(ModelAdmin):
    list_display = ['client', 'label', 'region', 'district', 'address', 'is_default']
    list_filter = ['is_default', 'region']
    search_fields = ['client__full_name', 'address']
    list_fullwidth = True
