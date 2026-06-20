from django.db import models


class Region(models.Model):
    name = models.CharField(max_length=100)
    is_tashkent_city = models.BooleanField(default=False)  # Toshkent shahri uchun alohida flag

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Viloyat"
        verbose_name_plural = "Viloyatlar"
        ordering = ["name"]


class District(models.Model):
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name="districts")
    name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.region.name} — {self.name}"

    class Meta:
        verbose_name = "Tuman"
        verbose_name_plural = "Tumanlar"
        ordering = ["name"]


class DeliveryService(models.Model):
    """BTS, EMU, UzPost, Taksi"""
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)  # 'bts', 'emu', 'uzpost', 'taxi'
    is_taxi = models.BooleanField(default=False)  # Taksi uchun filial kerak emas
    icon = models.ImageField(upload_to="delivery/services/", blank=True, null=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Yetkazib berish xizmati"
        verbose_name_plural = "Yetkazib berish xizmatlari"


class ServiceBranch(models.Model):
    """Har bir xizmatning viloyat/tumanlar bo'yicha filiallari"""
    service = models.ForeignKey(DeliveryService, on_delete=models.CASCADE, related_name="branches")
    region = models.ForeignKey(Region, on_delete=models.CASCADE, related_name="branches")
    district = models.ForeignKey(District, on_delete=models.CASCADE, related_name="branches")
    branch_name = models.CharField(max_length=200)
    address = models.TextField()

    def __str__(self):
        return f"{self.service.name} | {self.district.name} — {self.branch_name}"

    class Meta:
        verbose_name = "Filial"
        verbose_name_plural = "Filiallar"
        # Bir xizmatning bir tumanida bir nechta filiali bo'lishi mumkin
        ordering = ["branch_name"]


class DeliveryConfig(models.Model):
    """Global sozlamalar — narxlar va boshqalar"""
    key = models.CharField(max_length=100, unique=True)
    value = models.CharField(max_length=255)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"{self.key}: {self.value}"

    class Meta:
        verbose_name = "Sozlama"
        verbose_name_plural = "Sozlamalar"

    # Usage: DeliveryConfig.objects.get(key='tashkent_delivery_price').value
    # Admin paneldan: key='tashkent_delivery_price', value='40000'