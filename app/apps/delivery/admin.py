from django.contrib import admin
from unfold.admin import ModelAdmin

from .models import Region, District, DeliveryService, DeliveryConfig, ServiceBranch


@admin.register(Region)
class RegionAdmin(ModelAdmin):
    list_display = ['name', 'is_tashkent_city', 'district_count']
    list_filter = ['is_tashkent_city']
    search_fields = ['name']

    @admin.display(description="Tumanlar")
    def district_count(self, obj):
        return obj.districts.count()


@admin.register(District)
class DistrictAdmin(ModelAdmin):
    list_display = ['name', 'region']
    list_filter = ['region']
    search_fields = ['name']
    list_fullwidth = True


@admin.register(DeliveryService)
class DeliveryServiceAdmin(ModelAdmin):
    list_display = ['name', 'slug', 'is_taxi']
    list_filter = ['is_taxi']


@admin.register(DeliveryConfig)
class DeliveryConfigAdmin(ModelAdmin):
    list_display = ['key', 'value']


@admin.register(ServiceBranch)
class ServiceBranchAdmin(ModelAdmin):
    list_display = ['branch_name', 'service', 'region', 'district', 'address']
    list_filter = ['service', 'region']
    search_fields = ['branch_name', 'address']
    list_fullwidth = True
