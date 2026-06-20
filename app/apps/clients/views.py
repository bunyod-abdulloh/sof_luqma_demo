import json

from django.http import JsonResponse
from django.views.decorators.http import require_POST

from apps.clients.models import ClientAddress, Client
from apps.core.utils import verify_tg_token


def client_addresses(request):
    telegram_id = verify_tg_token(request.GET.get('tg_token', ''))
    if not telegram_id:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    try:
        client = Client.objects.get(telegram_id=int(telegram_id))
    except Client.DoesNotExist:
        return JsonResponse({'data': None, 'addresses': []})

    addresses = ClientAddress.objects.filter(
        client=client
    ).select_related('region', 'district').values(
        'id', 'label', 'address', 'building', 'apartment',
        'region_id', 'region__name',
        'district_id', 'district__name',
        'latitude', 'longitude', 'is_default',
    )

    return JsonResponse({
        'data': {
            'full_name': client.full_name,
            'phone_number': client.phone_number,
        },
        'addresses': list(addresses),
    })


@require_POST
def delete_client_address(request, address_id):
    data = json.loads(request.body)
    telegram_id = verify_tg_token(data.get('tg_token', ''))
    if not telegram_id:
        return JsonResponse({'error': 'Unauthorized'}, status=401)

    deleted, _ = ClientAddress.objects.filter(
        id=address_id,
        client__telegram_id=int(telegram_id),
    ).delete()

    if not deleted:
        return JsonResponse({'error': 'Topilmadi'}, status=404)

    return JsonResponse({'success': True})