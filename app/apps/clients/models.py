from django.db import models

from apps.delivery.models import Region, District


class Client(models.Model):
    telegram_id = models.IntegerField(null=True, blank=True)
    full_name = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.full_name


class ClientAddress(models.Model):
    client = models.ForeignKey(
        Client,
        on_delete=models.CASCADE,
        related_name='addresses',
    )
    label = models.CharField(
        max_length=50,
        blank=True,
        default='',
        verbose_name="Nomi",
        help_text="Uy, Ish, Onam uyiga va h.k."
    )

    region = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True)
    district = models.ForeignKey(District, on_delete=models.SET_NULL, null=True)
    address = models.CharField(max_length=500, verbose_name="Manzil")

    building = models.CharField(max_length=50, blank=True, default='')
    apartment = models.CharField(max_length=50, blank=True, default='')
    intercom = models.CharField(max_length=50, blank=True, default='')

    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)

    is_default = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-is_default', '-created_at']
        verbose_name = "Mijoz manzili"
        verbose_name_plural = "Mijoz manzillari"

    def __str__(self):
        return f"{self.label or self.address} ({self.client})"