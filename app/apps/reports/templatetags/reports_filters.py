from django import template

register = template.Library()


@register.filter
def money(value):
    """
    Sonni 100.000 ko'rinishida formatlaydi.

    Misollar:
        54805000 → "54.805.000"
        135000   → "135.000"
        0        → "0"
        None     → "0"
    """
    if value is None or value == "":
        return "0"
    try:
        # Decimal va float'ni butun songa o'tkazamiz
        n = int(value)
    except (ValueError, TypeError):
        return value

    # Python o'rnatilgan format: 1,234,567 → keyin vergulni nuqtaga
    return f"{n:,}".replace(",", " ")
