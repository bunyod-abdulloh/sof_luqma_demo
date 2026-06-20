from apps.orders.models import Order


def get_new_orders_badge(request):
    count = Order.objects.filter(status='new').count()
    return count if count else None