from django.db import models
from django.db.models import Sum
from django.templatetags.static import static
from django.utils import timezone
from django.utils.text import slugify


class Category(models.Model):
    """Mahsulot kategoriyalari."""

    ICON_CHOICES = [
        ("apple", "🍎 Olma (mevalar)"),
        ("nuts", "🥜 Yong'oqlar (quruq mevalar)"),
        ("melon", "🍉 Tarvuz (poliz)"),
        ("grain", "🌾 Don (dukkaklilar)"),
        ("bread", "🍞 Non (un mahsulotlari)"),
        ("meat", "🥩 Go'sht"),
        ("milk", "🥛 Sut"),
        ("olive", "🫒 Zaytun (yog'lar)"),
        ("vinegar", "🍶 Sirka"),
        ("herb", "🌿 Giyoh"),
        ("organic", "🌱 Organik"),
        ("tea", "☕ Choy/qahva"),
        ("honey", "🍯 Asal/murabbo"),
        ("ready-meal", "🍲 Tayyor taom"),
        ("candy", "🍬 Shirinlik"),
    ]

    name = models.CharField(max_length=100, unique=True, verbose_name="Kategoriya nomi")
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    icon_slug = models.CharField(
        max_length=30,
        choices=ICON_CHOICES,
        default="organic",
    )
    order = models.PositiveSmallIntegerField(
        default=0,
        verbose_name="Tartib joylashuvi",
        help_text="Tartib (kichikroq = oldinroq)")

    is_active = models.BooleanField(
        default=True,
        verbose_name="Faollik holati",
    )

    class Meta:
        ordering = ["order", "name"]
        verbose_name = "Kategoriya"
        verbose_name_plural = "Kategoriyalar"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=False)
        super().save(*args, **kwargs)

    @property
    def icon_url(self) -> str:
        """Template'da `{{ cat.icon_url }}` orqali ishlatish uchun."""
        return static(f"img/icons/{self.icon_slug}.png")

    def __str__(self):
        return self.name


class Product(models.Model):
    """Mahsulotlar."""

    UNIT_CHOICES = [
        ("kg", "kg"),
        ("g", "gramm"),
        ("l", "litr"),
        ("piece", "dona"),
        ("pack", "paket"),
    ]

    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="products",
        verbose_name="Kategoriya nomi",
    )
    name = models.CharField(
        max_length=200,
        verbose_name="Mahsulot nomi",
    )
    slug = models.SlugField(
        max_length=220,
        unique=True,
        blank=True
    )
    description = models.TextField(
        blank=True,
        verbose_name="Izoh",
    )
    image = models.ImageField(
        upload_to="products/%Y/%m/",
        verbose_name="Mahsulot surati"
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Narx",
    )
    unit = models.CharField(
        max_length=10,
        choices=UNIT_CHOICES,
        default="kg",
        verbose_name="O'lchov birligi",
    )

    is_organic = models.BooleanField(
        default=True,
        help_text="Organik yorliqli mahsulot"
    )
    is_available = models.BooleanField(
        default=True,
        verbose_name="Sotuvda mavjudlik holati",
    )
    stock = models.PositiveIntegerField(
        default=0,
        verbose_name="Miqdori",
    )

    is_preorder = models.BooleanField(
        default=False,
        verbose_name="Oldindan buyurtma olinadimi?",
    )

    preorder_threshold = models.PositiveIntegerField(
        default=0,
        verbose_name="Buyurtmani tasdiqlash uchun maksimal miqdor",
    )

    preorder_deadline = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Buyurtma yig'ish tugash vaqti"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    preorder_period_started_at = models.DateTimeField(
        null=True, blank=True,
        verbose_name="Joriy qabul boshlangan vaqt",
        help_text="Faqat shu vaqtdan keyingi buyurtmalar hisobga olinadi"
    )

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Mahsulot"
        verbose_name_plural = "Mahsulotlar"
        # Tez-tez ishlatiladigan filter'lar uchun index — performance uchun muhim
        indexes = [
            models.Index(fields=["category", "is_available"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=False)

        # Preorder yoqilgan bo'lsa, davr boshlanmagan bo'lsa — boshlang
        if self.is_preorder and not self.preorder_period_started_at:
            self.preorder_period_started_at = timezone.now()

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.category.name})"

    def preorder_status(self):
        if not self.is_preorder:
            return {"state": "not_preorder", "reserved": 0, "remaining": None}

        if self.preorder_deadline and self.preorder_deadline < timezone.now():
            return {"state": "deadline_passed", "reserved": 0, "remaining": 0}

        active_statuses = ["new", "confirmed", "in_delivery", "delivered"]
        qs = self.order_items.filter(order__status__in=active_statuses)

        # Faqat joriy davrdagi buyurtmalarni hisoblash
        if self.preorder_period_started_at:
            qs = qs.filter(order__created_at__gte=self.preorder_period_started_at)

        reserved = qs.aggregate(total=Sum("qty"))["total"] or 0
        remaining = max(self.preorder_threshold - reserved, 0)

        if remaining == 0:
            return {"state": "full", "reserved": reserved, "remaining": 0}

        return {"state": "open", "reserved": reserved, "remaining": remaining}

    def start_new_preorder_period(self, new_deadline=None, new_threshold=None):
        """Yangi preorder davrini ochadi. Eski buyurtmalar yangi davrga ta'sir qilmaydi."""
        self.preorder_period_started_at = timezone.now()
        if new_deadline is not None:
            self.preorder_deadline = new_deadline
        if new_threshold is not None:
            self.preorder_threshold = new_threshold
        self.save(update_fields=[
            "preorder_period_started_at", "preorder_deadline", "preorder_threshold"
        ])


class Banner(models.Model):
    """Bosh sahifadagi karusel rasmlari."""

    title = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to="banners/")
    link = models.URLField(blank=True, help_text="Bosilganda ochiluvchi link (ixtiyoriy)")
    order = models.PositiveSmallIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order", "-id"]
        verbose_name = "Banner"
        verbose_name_plural = "Bannerlar"

    def __str__(self):
        return self.title or f"Banner #{self.id}"
