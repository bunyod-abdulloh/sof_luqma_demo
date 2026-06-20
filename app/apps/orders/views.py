import json
import logging

import httpx
from django.conf import settings  # ORDERS_GROUP_ID, BOT_TOKEN shu yerdan keladi
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_POST

from apps.clients.models import Client, ClientAddress
from apps.core.utils import verify_tg_token
from apps.delivery.models import ServiceBranch, DeliveryService, Region, District, DeliveryConfig
from apps.orders.models import Order, OrderItem
from apps.products.models import Product

logger = logging.getLogger(__name__)

from django.db import transaction


# apps/orders/views.py

@require_POST
def checkout_view(request):
    try:
        data = json.loads(request.body)

        # --- Auth ---
        telegram_id = verify_tg_token(data.get('tg_token', ''))
        print(f"BU TELEGRAM_ID: {telegram_id}")
        print(f"BU CHECKOUT DATA: {data}")
        if not telegram_id:
            return JsonResponse({'error': 'Invalid token'}, status=401)

        items = data.get('items', [])
        if not items:
            return JsonResponse({'error': "Items bo'sh"}, status=400)

        # --- Delivery ma'lumotlarini validate qilish ---
        delivery = data.get('delivery', {})
        region_id = delivery.get('regionId')
        district_id = delivery.get('districtId')
        is_tashkent = delivery.get('isTashkentCity', False)

        if not region_id or not district_id:
            return JsonResponse({'error': 'Hudud tanlanmagan'}, status=400)

        # Region va District ni DBdan tekshiramiz — frontend ga ishonmaymiz
        try:
            region = Region.objects.get(id=region_id)
            district = District.objects.get(id=district_id, region=region)
        except (Region.DoesNotExist, District.DoesNotExist):
            return JsonResponse({'error': 'Noto\'g\'ri hudud'}, status=400)

        # --- Service / Branch validate ---
        service = branch = None
        is_taxi = False
        uzpost_address = ''

        if not is_tashkent:
            service_id = delivery.get('serviceId')
            if not service_id:
                return JsonResponse({'error': 'Xizmat tanlanmagan'}, status=400)

            try:
                service = DeliveryService.objects.get(id=service_id)
            except DeliveryService.DoesNotExist:
                return JsonResponse({'error': 'Noto\'g\'ri xizmat'}, status=400)

            is_taxi = service.is_taxi

            if service.slug == 'uzpost':
                uzpost_address = delivery.get('uzpostAddress', '').strip()
                if not uzpost_address:
                    return JsonResponse({'error': 'UzPost manzili kiritilmagan'}, status=400)

            elif not is_taxi:
                branch_id = delivery.get('branchId')
                if not branch_id:
                    return JsonResponse({'error': 'Filial tanlanmagan'}, status=400)
                try:
                    # Branch ni service + region + district bilan tekshiramiz
                    branch = ServiceBranch.objects.get(
                        id=branch_id,
                        service=service,
                        region=region,
                        district=district,
                    )
                except ServiceBranch.DoesNotExist:
                    return JsonResponse({'error': 'Noto\'g\'ri filial'}, status=400)

        # --- Mahsulot narxlarini DBdan olamiz (frontendga ISHONMAYMIZ) ---
        product_ids = [item['product_id'] for item in items]
        products = Product.objects.filter(id__in=product_ids).in_bulk()

        items_total = sum(
            products[item['product_id']].price * item['qty']
            for item in items
            if item['product_id'] in products
        )

        # Delivery narxini serverda hisoblaymiz
        delivery_price = 0
        if is_tashkent:
            try:
                delivery_price = int(DeliveryConfig.objects.get(
                    key='tashkent_delivery_price'
                ).value)
            except DeliveryConfig.DoesNotExist:
                delivery_price = 40000

        total = items_total + delivery_price

        client, created = Client.objects.get_or_create(
            telegram_id=int(telegram_id),
            defaults={
                'phone_number': delivery.get('phone', ''),
                'full_name': delivery.get('fullname', ''),
            }
        )
        if not created:
            client.phone_number = delivery.get('phone', '')
            client.full_name = delivery.get('fullname', '')
            client.save(update_fields=['phone_number', 'full_name'])

        # --- DB ga yozamiz ---
        with transaction.atomic():

            client_address, created = ClientAddress.objects.get_or_create(
                client=client,
                region=region,
                district=district,
                address=delivery.get('address', ''),
                defaults={
                    'label': delivery.get('label', ''),
                    'building': delivery.get('building', ''),
                    'apartment': delivery.get('apartment', ''),
                    'latitude': delivery['location']['lat'] if delivery.get('location') else None,
                    'longitude': delivery['location']['lon'] if delivery.get('location') else None,
                }
            )
            if not created:
                # Mavjud manzilni yangilaymiz
                client_address.label = delivery.get('label', '') or client_address.label
                client_address.building = delivery.get('building', '')
                client_address.apartment = delivery.get('apartment', '')
                loc = delivery.get('location')
                if loc:
                    client_address.latitude = loc['lat']
                    client_address.longitude = loc['lon']
                client_address.save()

            order = Order.objects.create(
                client=client,
                client_address=client_address,
                address=delivery.get('address', ''),
                note=delivery.get('note', ''),
                region=region,
                district=district,
                is_tashkent_city=is_tashkent,
                delivery_price=delivery_price,
                service=service,
                branch=branch,
                is_taxi=is_taxi,
                uzpost_address=uzpost_address,
                total=total,
                payment_type=delivery['paymentType']
            )

            OrderItem.objects.bulk_create([
                OrderItem(
                    order=order,
                    product=products[item['product_id']],
                    qty=item['qty'],
                    price=products[item['product_id']].price,
                )
                for item in items
                if item['product_id'] in products
            ])

        send_order_to_telegram(
            order=order,
            products=products,
            items=items,
            delivery_data=delivery,
        )
        return JsonResponse({'success': True, 'order_id': order.id})

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        logger.error(f"Checkout error: {e}", exc_info=True)
        return JsonResponse({'error': 'Server error'}, status=500)


def send_order_to_telegram(order, products, items, delivery_data):
    now = timezone.now()

    order_items_text = "\n".join([
        f"🔹 <b>{products[item['product_id']].name}</b>\n"
        f"    └ {item['qty']} x {int(products[item['product_id']].price):,} = "
        f"{int(products[item['product_id']].price * item['qty']):,} so'm"
        for item in items if item['product_id'] in products
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

    if delivery_data['building'] is not None:
        building = delivery_data.get('building', "Kiritilmagan")
        apartment = delivery_data.get('apartment', "Kiritilmagan")
        intercom = delivery_data.get('intercom', "Kiritilmagan")

        delivery_line += (f"\n🏠 Uy: {building} / {apartment}\n"
                          f"🔐 Domofon kodi: {intercom}")

    message = (
            f"#sana{now.strftime('%d_%m_%Y')} | {now.strftime('%H:%M')}\n\n"
            f"🛒 <b>Yangi buyurtma #{order.id}</b>\n\n"
            f"👤 Ism: {delivery_data['fullname']}\n"
            f"📱 Tel: {delivery_data['phone']}\n"
            f"{delivery_line}\n\n"
            f"{order_items_text}\n"
            f"\n━━━━━━━━━━━━━━━━━━━━\n"
            f"🛍 Mahsulotlar: {int(order.total - order.delivery_price):,} so'm\n"
            f"💳 To'lov turi: {order.get_payment_type_display()}\n"
            f"💵 To'lov holati: {order.payment_status}\n"
            f"💰 Jami: {int(order.total):,} so'm\n"
            + (f"💬 Izoh: {order.note}" if order.note else "")
    )

    message_url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendMessage"

    location_url = f"https://api.telegram.org/bot{settings.BOT_TOKEN}/sendLocation"

    payload = {
        "chat_id": settings.ORDERS_GROUP_ID,
        "text": message,
        "parse_mode": "HTML",
        "reply_markup": {"inline_keyboard": [[
            {"text": "✏️ O'zgartirish", "web_app": {
                "url": f"{settings.WEB_APP_URL}/admin/orders/order/{order.id}/change/"
            }}
        ]]}
    }

    with httpx.Client() as client:

        response = client.post(
            message_url,
            json=payload,
            timeout=10
        )

        response.raise_for_status()

        result = response.json()

        if result.get("ok"):
            order.telegram_message_id = result["result"]["message_id"]
            order.save(update_fields=["telegram_message_id"])

        if (
                delivery_data.get('location')
                and result.get('ok')
        ):
            message_id = result['result']['message_id']

            client.post(
                location_url,
                json={
                    "chat_id": settings.ORDERS_GROUP_ID,
                    "latitude": delivery_data['location']['lat'],
                    "longitude": delivery_data['location']['lon'],
                    "reply_to_message_id": message_id,
                },
                timeout=10
            )
