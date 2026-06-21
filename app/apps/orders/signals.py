# apps/orders/signals.py
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

from .models import Order, OrderItem


@receiver([post_save, post_delete], sender=OrderItem)
def on_order_item_change(sender, instance, **kwargs):
    """OrderItem qo'shilsa/o'zgartirilsa/o'chirilsa — Order total qayta hisoblanadi."""
    order = instance.order
    order.recalculate_total()

    # Telegram xabarini yangilash
    from .views import update_order_message
    update_order_message(order)


@receiver(post_save, sender=Order)
def on_order_change(sender, instance, created, update_fields, **kwargs):
    """Order o'zgartirilsa — Telegram xabarini yangilaymiz."""
    if created:
        return  # yangi buyurtma uchun send_order_to_telegram allaqachon chaqirilgan

    # OrderItem signali allaqachon update_order_message ni chaqirgan bo'lsa, takrorlamaymiz
    if update_fields == {"total"}:
        return

    from .views import update_order_message
    update_order_message(instance)
