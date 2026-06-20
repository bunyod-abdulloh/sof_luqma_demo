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
            f"🚗 Shahar ichida yetkazish — {int(order.delivery_price):,} so'm\n"
            f"📍 Manzil: {order.address}"
        )
    elif order.is_taxi:
        delivery_line = (
            f"🚕 Taksi — {order.district}, {order.region}\n"
        )
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

    if order.client_address is not None:
        if order.client_address.building is not None:
            building = order.client_address.building
            apartment = order.client_address.apartment
            intercom = order.client_address.intercom

            delivery_line += (f"\n🏠 Uy: {building} / {apartment}\n"
                              f"🔐 Domofon kodi: {intercom}")
    now = timezone.now()
    return (
        f"#ID{now.strftime('%d_%m_%Y')} | {now.strftime('%H:%M')}\n\n"
        f"🛒 <b>Yangi buyurtma</b>\n\n"
        f"📌 Holati: {order.get_status_display()}\n\n"
        f"👤 Ism: {order.client.full_name}\n"
        f"📱 Tel: {order.client.phone_number}\n\n"
        f"{delivery_line}\n\n"
        f"{items_text}\n"
        f"\n━━━━━━━━━━━━━━━━━━━━\n"
        f"🛍 Mahsulotlar: {int(order.total - order.delivery_price):,} so'm\n"
        f"💳 To'lov turi: {order.get_payment_type_display()}\n"
        f"💵 To'lov holati: {order.payment_status}\n"
        f"💰 Jami: {int(order.total):,} so'm\n"
        f"{'💬 Izoh: ' + order.note if order.note else ''}"
    )
