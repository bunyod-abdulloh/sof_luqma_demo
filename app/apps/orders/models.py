from django.db import models

from apps.clients.models import Client
from apps.delivery.models import ServiceBranch, DeliveryService, District, Region
from apps.products.models import Product


class Order(models.Model):
    STATUS_CHOICES = [
        ('new', 'Yangi'),
        ('confirmed', 'Tasdiqlangan'),
        ('delivered', 'Yetkazildi'),
        ('cancelled', 'Bekor qilindi'),
    ]

    PAYMENT_TYPE_CHOICES = [
        ("card", "Plastik"),
        ("cash", "Naqd"),
    ]

    client = models.ForeignKey(
        Client,
        on_delete=models.SET_NULL,
        verbose_name="Mijoz",
        null=True,
        blank=True,
        related_name="orders"
    )

    total = models.PositiveIntegerField(default=0, verbose_name="Jami")

    telegram_message_id = models.BigIntegerField(
        null=True,
        blank=True
    )

    payment_type = models.CharField(
        choices=PAYMENT_TYPE_CHOICES,
        null=True,
        blank=True,
        verbose_name="To'lov turi",
    )

    payment_status = models.CharField(
        max_length=20,
        default='Kiritilmagan',
        verbose_name="To'lov holati"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='new',
        db_index=True,
        verbose_name="Buyurtma holati"
    )

    client_address = models.ForeignKey(
        'clients.ClientAddress',
        null=True, blank=True,
        on_delete=models.SET_NULL,
        verbose_name="Saqlangan manzil"
    )

    # Delivery ma'lumotlari
    region = models.ForeignKey(
        Region,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        verbose_name="Viloyat"
    )

    district = models.ForeignKey(
        District, null=True, blank=True,
        on_delete=models.SET_NULL, verbose_name="Tuman"
    )

    # Toshkent shahri uchun
    is_tashkent_city = models.BooleanField(default=False)
    delivery_price = models.PositiveIntegerField(default=0, verbose_name="Yetkazib berish narxi")

    address = models.TextField(verbose_name="Manzil")
    note = models.TextField(blank=True, default='', verbose_name="Izoh")

    # Viloyatlararo yetkazish uchun
    service = models.ForeignKey(
        DeliveryService, null=True, blank=True,
        on_delete=models.SET_NULL, verbose_name="Yetkazib berish xizmati"
    )
    branch = models.ForeignKey(
        ServiceBranch, null=True, blank=True,
        on_delete=models.SET_NULL, verbose_name="Filial"
    )
    is_taxi = models.BooleanField(default=False)

    # UzPost uchun foydalanuvchi kiritgan manzil
    uzpost_address = models.CharField(
        max_length=255, blank=True, default='', verbose_name="UzPost manzili"
    )

    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Buyurtma yaratilgan vaqt")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Buyurtma yangilangan vaqt")

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Buyurtma"
        verbose_name_plural = "Buyurtmalar"

    def __str__(self):
        return f"Order #{self.id} — ({self.get_status_display()})"

    def recalculate_total(self):
        """OrderItem'lar yig'indisi + delivery narxi."""
        items_total = sum(
            (item.price * item.qty for item in self.items.all()),
            0
        )
        self.total = items_total + (self.delivery_price or 0)
        self.save(update_fields=["total"])


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name="Buyurtma"
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,  # mahsulot o'chsa ham order saqlansin
        related_name='order_items',
        verbose_name="Mahsulot"
    )
    qty = models.PositiveIntegerField(verbose_name="Miqdor")
    price = models.PositiveIntegerField(verbose_name="Narx")

    class Meta:
        verbose_name = "Buyurtma mahsuloti"
        verbose_name_plural = "Buyurtma mahsulotlari"

    def get_subtotal(self):
        if self.price is None or self.qty is None:
            return 0
        return self.price * self.qty

    def __str__(self):
        return f"{self.product.name} x{self.qty}"
