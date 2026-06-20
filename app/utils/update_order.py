# apps/orders/utils.py

import httpx
from django.conf import settings

from utils.build_order import build_order_message


def update_order_message(order):
    if not order.telegram_message_id:
        return

    text = build_order_message(order)

    payload = {
        "chat_id": settings.ORDERS_GROUP_ID,
        "message_id": order.telegram_message_id,
        "text": text,
        "parse_mode": "HTML",
        "reply_markup": {
            "inline_keyboard": [[
                {
                    "text": "✏️ O'zgartirish",
                    "web_app": {
                        "url": (
                            f"{settings.WEB_APP_URL}"
                            f"/admin/orders/order/{order.id}/change/"
                        )
                    }
                }
            ]]
        }
    }

    with httpx.Client() as client:
        client.post(
            f"https://api.telegram.org/bot{settings.BOT_TOKEN}/editMessageText",
            json=payload,
            timeout=10
        )
