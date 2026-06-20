from django.contrib import admin, messages
from django.shortcuts import redirect
from django.urls import reverse_lazy
from django.utils.translation import gettext_lazy as _
from unfold.admin import ModelAdmin, TabularInline
from unfold.decorators import action, display
from unfold.enums import ActionVariant

from .models import Order, OrderItem


class OrderItemInline(TabularInline):
    model = OrderItem
    extra = 0
    fields = ("product", "qty", "price", "get_subtotal")
    readonly_fields = ("get_subtotal",)


@admin.register(Order)
class OrderAdmin(ModelAdmin):
    list_fullwidth = True  # ekran kengligini to'liq ishlatadi
    compressed_fields = True  # detalda maydonlar zich joylashadi
    list_per_page = 20

    # Mobil uchun qisqa karta — faqat eng kerakli 4 ta
    list_display = ("order_number", "client_info", "total_display", "payment_status", "status_badge")
    list_display_links = ("order_number", "client_info",)
    list_filter = ("status", "created_at")
    search_fields = ("order_number", "client__full_name", "client__phone_number")
    date_hierarchy = "created_at"
    ordering = ("-created_at",)

    inlines = [OrderItemInline]

    # Bir bosishli amallar — telefon uchun asosiy ish jarayoni
    actions_row = ["row_confirm", "row_deliver", "row_cancel"]
    actions = ["bulk_confirmed", "bulk_delivered"]

    # Detalda guruhlab, ikkilamchilarni yig'ib qo'yamiz — kam skroll
    fieldsets = (
        (None, {"fields": ("status", "client", "total", "payment_type", "payment_status")}),
        (_("Yetkazish"), {
            "classes": ("collapse",),
            "fields": ("region", "district", "is_tashkent_city", "address",
                       "delivery_price", "service", "branch", "is_taxi", "uzpost_address"),
        }),
        (_("Qo'shimcha"), {
            "classes": ("collapse",),
            "fields": ("note", "client_address", "telegram_message_id",
                       "created_at", "updated_at"),
        }),
    )
    readonly_fields = ("created_at", "updated_at")

    @display(description=_("Buyurtma raqami"), ordering="id")
    def order_number(self, obj):
        return f"#{obj.id}"

    @display(description=_("Holati"), ordering="status", label={
        "Yangi": "warning", "Tasdiqlangan": "info", "Yetkazilmoqda": "info",
        "Yetkazildi": "success", "Bekor qilindi": "danger",
    })
    def status_badge(self, obj):
        return obj.get_status_display()

    @display(description=_("Mijoz"), header=True)
    def client_info(self, obj):
        if not obj.client:
            return ["—", ""]
        return [obj.client.full_name or "—", obj.client.phone_number or ""]

    @display(description=_("Jami"), ordering="total")
    def total_display(self, obj):
        return f"{obj.total:,}".replace(",", " ") + " so'm"

    # ── Bir bosishli qator amallari ──
    @action(description=_("Tasdiqlash"), icon="check", variant=ActionVariant.SUCCESS)
    def row_confirm(self, request, object_id):
        Order.objects.filter(pk=object_id).update(status="confirmed")
        messages.success(request, _("Tasdiqlandi"))
        return redirect(request.META.get("HTTP_REFERER", reverse_lazy("admin:orders_order_changelist")))

    @action(description=_("Yetkazildi"), icon="local_shipping", variant=ActionVariant.SUCCESS)
    def row_deliver(self, request, object_id):
        Order.objects.filter(pk=object_id).update(status="delivered")
        messages.success(request, _("Yetkazildi"))
        return redirect(request.META.get("HTTP_REFERER", reverse_lazy("admin:orders_order_changelist")))

    @action(description=_("Bekor qilish"), icon="close", variant=ActionVariant.DANGER)
    def row_cancel(self, request, object_id):
        Order.objects.filter(pk=object_id).update(status="cancelled")
        messages.warning(request, _("Bekor qilindi"))
        return redirect(request.META.get("HTTP_REFERER", reverse_lazy("admin:orders_order_changelist")))

    @action(description=_("Tasdiqlangan deb belgilash"))
    def bulk_confirmed(self, request, queryset):
        n = queryset.update(status="confirmed")
        messages.success(request, _(f"{n} ta tasdiqlandi"))

    @action(description=_("Yetkazildi deb belgilash"))
    def bulk_delivered(self, request, queryset):
        n = queryset.update(status="delivered")
        messages.success(request, _(f"{n} ta yetkazildi"))
