# apps/orders/utils.py
from django.utils import timezone


def build_order_message(order):
    items_text = "\n".join([
        f"🔹 <b>{item.product.name}</b>\n"
        f"    └ {item.qty} x {int(item.price):,} = {int(item.qty * item.price):,} so'm"
        for item in order.items.all()
    ])

    # Delivery qatorini dinamik quramiz
    if order.is_tashkent_city:
        delivery_line = (
            f"🚗 Shahar ichida yetkazish — {int(order.delivery_price or 0):,} so'm\n"
            f"📍 Manzil: {order.address}"
        )
    elif order.is_taxi:
        delivery_line = f"🚕 Taksi — {order.district}"
    elif order.service and order.service.slug == 'uzpost':
        delivery_line = (
            f"✉️ UzPost — {order.district}\n"
            f"📍 Bo'lim: {order.uzpost_address}"
        )
    else:
        delivery_line = (
            f"📦 {order.service} — {order.branch}\n"
            f"📍 {order.branch.address if order.branch else ''}"
        )

    # Bino / kvartira
    if order.client_address and order.client_address.building:
        building = order.client_address.building or "—"
        apartment = order.client_address.apartment or "—"
        intercom = order.client_address.intercom or "—"
        delivery_line += (
            f"\n🏠 Uy: {building} / {apartment}\n"
            f"🔐 Domofon kodi: {intercom}"
        )

    now = timezone.now()
    delivery_price = order.delivery_price or 0
    items_total = int(order.total - delivery_price)

    payment_type = order.get_payment_type_display() if order.payment_type else "—"

    return (
        f"#sana{now.strftime('%d_%m_%Y')} | {now.strftime('%H:%M')}\n\n"
        f"🛒 <b>Buyurtma</b>\n\n"
        f"📌 Holati: {order.get_status_display()}\n\n"
        f"👤 Ism: {order.client.full_name if order.client else '—'}\n"
        f"📱 Tel: {order.client.phone_number if order.client else '—'}\n\n"
        f"{delivery_line}\n\n"
        f"{items_text}\n"
        f"\n━━━━━━━━━━━━━━━━━━━━\n"
        f"🛍 Mahsulotlar: {items_total:,} so'm\n"
        f"💳 To'lov turi: {payment_type}\n"
        f"💵 To'lov holati: {order.payment_status}\n"
        f"💰 Jami: {int(order.total):,} so'm\n"
        f"{'💬 Izoh: ' + order.note if order.note else ''}"
    )