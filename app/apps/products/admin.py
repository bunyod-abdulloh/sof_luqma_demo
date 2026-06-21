from datetime import timedelta

from django.contrib import admin
from django.contrib import messages
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.utils import timezone
from django.utils.html import format_html
from unfold.admin import ModelAdmin
from unfold.decorators import action, display
from unfold.enums import ActionVariant

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
        'is_available', 'is_organic', 'stock', 'preorder_badge',
    ]
    list_display_links = ['name']
    list_editable = ['is_available', 'stock']
    list_filter = ['category', 'is_available', 'is_organic', 'is_preorder', 'unit']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_select_related = ['category']
    readonly_fields = ['created_at', 'updated_at', 'preorder_detail',
                       'preorder_period_started_at']
    list_fullwidth = True
    warn_unsaved_form = True

    # Detail sahifa yuqorisidagi amallar
    actions_detail = ["start_new_period"]

    fieldsets = (
        (None, {
            "fields": ("category", "name", "slug", "description", "image",
                       "price", "unit", "is_organic", "is_available", "stock"),
        }),
        ("Preorder", {
            "fields": ("is_preorder", "preorder_threshold", "preorder_deadline",
                       "preorder_period_started_at", "preorder_detail"),
        }),
        ("Tizim", {
            "classes": ("collapse",),
            "fields": ("created_at", "updated_at"),
        }),
    )

    @admin.display(description="Narx", ordering="price")
    def formatted_price(self, obj):
        return f"{obj.price:,} so'm"

    @display(description="Preorder", label={
        "Ochiq": "success",
        "To'lgan": "danger",
        "Tugagan": "warning",
    })
    def preorder_badge(self, obj):
        if not obj.is_preorder:
            return None
        status = obj.preorder_status()
        state = status["state"]
        if state == "open":
            return f"Ochiq · {status['reserved']}/{obj.preorder_threshold}"
        if state == "full":
            return "To'lgan"
        if state == "deadline_passed":
            return "Tugagan"
        return None

    @admin.display(description="Preorder holati")
    def preorder_detail(self, obj):
        if not obj.is_preorder:
            return format_html(
                '<div style="color:#6b7280;">Bu mahsulot preorder emas.</div>'
            )

        status = obj.preorder_status()
        state = status["state"]
        reserved = status["reserved"]
        threshold = obj.preorder_threshold or 1
        percent = min(round(reserved / threshold * 100), 100)

        # Deadline qancha qoldi
        if obj.preorder_deadline:
            delta = obj.preorder_deadline - timezone.now()
            if delta.total_seconds() > 0:
                days = delta.days
                hours = delta.seconds // 3600
                if days > 0:
                    deadline_line = f"⏳ Deadline'gacha {days} kun {hours} soat qoldi"
                else:
                    minutes = (delta.seconds % 3600) // 60
                    deadline_line = f"⏳ Deadline'gacha {hours} soat {minutes} daqiqa qoldi"
            else:
                deadline_line = "⏰ Deadline o'tib ketgan"
        else:
            deadline_line = "📅 Deadline belgilanmagan"

        # Default qiymatlar — shartlar bajarilmasa ham xato chiqmaydi
        label = "Holat aniqlanmadi"
        color = "#6b7280"
        hint = ""

        if state == "deadline_passed":
            label = f"⏰ Qabul tugagan ({reserved}/{threshold})"
            color = "#ef4444"
            hint = "Qabulni qayta ochish uchun yuqoridagi tugmani bosing."
        elif state == "full":
            label = f"✋ To'lgan ({reserved}/{threshold})"
            color = "#ef4444"
            hint = ("Bu davr uchun buyurtma to'ldi. Yetkazib bo'lgach, "
                    "yuqoridagi <b>Yana qabulni ochish</b> tugmasini bosing.")
        elif state == "open":
            label = f"✅ Ochiq — {reserved}/{threshold} {obj.unit} ({percent}%)"
            color = "#10b981"

        period_line = ""
        if obj.preorder_period_started_at:
            period_line = (f"<div style='font-size:11px;color:#9ca3af;margin-top:4px;'>"
                           f"Joriy qabul boshlangan: {obj.preorder_period_started_at:%d.%m.%Y %H:%M}"
                           f"</div>")

        return format_html(
            '''
            <div style="font-weight:600;margin-bottom:6px;">{}</div>
            <div style="background:#e5e7eb;border-radius:6px;height:8px;
                        overflow:hidden;max-width:360px;margin-bottom:8px;">
              <div style="background:{};width:{}%;height:100%;"></div>
            </div>
            <div style="font-size:12px;color:#6b7280;">{}</div>
            {}
            {}
            ''',
            label, color, percent, deadline_line,
            format_html(period_line) if period_line else "",
            format_html('<div style="font-size:12px;color:#374151;margin-top:8px;padding:8px;'
                        'background:#fef3c7;border-radius:6px;">{}</div>', format_html(hint))
            if hint else "",
        )

    # ── Yangi davr boshlash tugmasi ──
    @action(
        description="Yana qabulni ochish",
        icon="refresh",
        variant=ActionVariant.PRIMARY,
    )
    def start_new_period(self, request, object_id):
        product = Product.objects.get(pk=object_id)

        new_deadline = timezone.now() + timedelta(days=7)
        product.start_new_preorder_period(new_deadline=new_deadline)

        messages.success(
            request,
            f"\"{product.name}\" uchun qabul qayta ochildi. "
            f"Tugash sanasi: {new_deadline:%d.%m.%Y %H:%M}"
        )
        return redirect(reverse_lazy("admin:products_product_change", args=[object_id]))


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