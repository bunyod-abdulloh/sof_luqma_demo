from django.http import JsonResponse
from django.views.decorators.http import require_GET

from config import settings
from .models import Region, District, DeliveryService, ServiceBranch, DeliveryConfig


@require_GET
def get_regions(request):
    regions = Region.objects.values("id", "name", "is_tashkent_city").order_by("name")
    return JsonResponse({"regions": list(regions)})


@require_GET
def get_districts(request):
    region_id = request.GET.get("region_id")
    if not region_id:
        return JsonResponse({"error": "region_id required"}, status=400)

    districts = District.objects.filter(region_id=region_id).values("id", "name")
    return JsonResponse({"districts": list(districts)})


@require_GET
def get_delivery_services(request):
    services = DeliveryService.objects.values("id", "name", "slug", "is_taxi", "icon")

    # icon — relative path, to'liq URL kerak
    result = []
    for s in services:
        result.append({
            **s,
            "icon_url": request.build_absolute_uri(settings.MEDIA_URL + s["icon"]) if s["icon"] else None,
        })

    return JsonResponse({"services": result})


@require_GET
def get_branches(request):
    service_id = request.GET.get("service_id")
    region_id = request.GET.get("region_id")
    district_id = request.GET.get("district_id")

    if not all([service_id, region_id, district_id]):
        return JsonResponse({"error": "service_id, region_id, district_id required"}, status=400)

    branches = ServiceBranch.objects.filter(
        service_id=service_id,
        region_id=region_id,
        district_id=district_id,
    ).values("id", "branch_name", "address")

    branch_list = list(branches)

    # Frontend available field orqali tekshiradi
    return JsonResponse({
        "branches": branch_list,
        "available": len(branch_list) > 0,
    })


@require_GET
def get_tashkent_delivery_price(request):
    try:
        price = DeliveryConfig.objects.get(key="tashkent_delivery_price").value
    except DeliveryConfig.DoesNotExist:
        price = "40000"  # fallback

    return JsonResponse({"price": int(price)})
