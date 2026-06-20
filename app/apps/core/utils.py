# django/utils/tg_token.py
import hashlib
import hmac
import time

from django.conf import settings


def verify_tg_token(token: str, max_age: int = 3600) -> int | None:
    try:
        user_id, timestamp, sig = token.split(":", 2)
    except ValueError:
        print(f"[tg_token] Format xato: {token!r}")
        return None

    message = f"{user_id}:{timestamp}"
    expected = hmac.new(
        settings.BOT_TOKEN.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(sig, expected):
        print(f"[tg_token] HMAC mos kelmadi:\n  received: {sig}\n  expected: {expected}")
        return None

    age = time.time() - int(timestamp)
    if age > max_age:
        print(f"[tg_token] Token eskirgan: age={age}s, max_age={max_age}s")
        return None

    return int(user_id)
