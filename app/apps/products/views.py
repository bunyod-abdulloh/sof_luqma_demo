from django.core.paginator import Paginator
from django.db.models import Count, Q
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie

from .models import Banner, Category, Product


PAGE_SIZE = 24


def serialize_product(p):
    return {
        "id": p.id,
        "name": p.name,
        "price": float(p.price),
        "img": p.image.url if p.image else "",
        "cat": p.category.slug,
        "cat_name": p.category.name,
        "unit": p.unit,
        "is_organic": p.is_organic,
        "description": p.description or "",
    }

@ensure_csrf_cookie
def home(request):
    categories = (
        Category.objects
        .filter(is_active=True)
        .annotate(
            available_count=Count(
                "products",
                filter=Q(products__is_available=True),
            )
        )
        .order_by("order", "name")
    )

    banners = Banner.objects.filter(is_active=True).order_by("order")

    products_qs = (
        Product.objects
        .filter(is_available=True)
        .select_related("category")
        .order_by("-created_at")
    )

    first_products = products_qs[:PAGE_SIZE]

    context = {
        "categories": categories,
        "banners": banners,
        "products_data": [serialize_product(p) for p in first_products],
    }
    return render(request, "pages/home.html", context)


def products_api(request):
    category_slug = request.GET.get("category", "all")
    page = request.GET.get("page", 1)

    qs = (
        Product.objects
        .filter(is_available=True)
        .select_related("category")
        .order_by("-created_at")
    )

    if category_slug != "all":
        qs = qs.filter(category__slug=category_slug)

    paginator = Paginator(qs, PAGE_SIZE)
    page_obj = paginator.get_page(page)

    return JsonResponse({
        "results": [serialize_product(p) for p in page_obj.object_list],
        "has_next": page_obj.has_next(),
        "next_page": page_obj.next_page_number() if page_obj.has_next() else None,
    })