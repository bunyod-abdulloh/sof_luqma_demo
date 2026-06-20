from django.contrib import admin
from django.utils.html import format_html
from unfold.admin import ModelAdmin

from .models import Category, Product, Banner


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    list_display = ['name', 'order', 'is_active', 'product_count']
    list_display_links = ['name']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}

    @admin.display(description="Mahsulotlar")
    def product_count(self, obj):
        return obj.products.count()


@admin.register(Product)
class ProductAdmin(ModelAdmin):
    list_display = [
        'name', 'category', 'formatted_price', 'unit',
        'is_available', 'is_organic', 'stock',
    ]
    list_display_links = ['name']
    list_editable = ['is_available', 'stock']
    list_filter = ['category', 'is_available', 'is_organic', 'unit']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_select_related = ['category']
    readonly_fields = ['created_at', 'updated_at']
    list_fullwidth = True
    warn_unsaved_form = True

    @admin.display(description="Narx", ordering="price")
    def formatted_price(self, obj):
        return f"{obj.price:,} so'm"


@admin.register(Banner)
class BannerAdmin(ModelAdmin):
    list_display = ['title', 'image_preview', 'order', 'is_active']
    list_editable = ['order', 'is_active']
    list_filter = ['is_active']

    @admin.display(description="Rasm")
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width:80px;height:32px;object-fit:cover;border-radius:6px;">',
                obj.image.url,
            )
        return "—"
