from collections import defaultdict

from django.contrib.admin.views.decorators import staff_member_required
from django.core.paginator import Paginator
from django.db.models import Count, ExpressionWrapper, F, IntegerField, Sum
from django.db.models import Q
from django.shortcuts import render
from django.urls import reverse
from django.utils import timezone

from apps.orders.models import Order
from apps.orders.models import OrderItem
from apps.products.models import Product
from .utils import (
    apply_date_filter,
    apply_status_filter,
    _common_context, _build_breadcrumb_title,
)


@staff_member_required
def reports_dashboard(request):
    ctx = _common_context(request)

    orders = Order.objects.all()
    orders = apply_date_filter(orders, ctx["date_range"], field="created_at")
    orders = apply_status_filter(orders, ctx["statuses"], field="status")

    kpis = orders.aggregate(
        total_orders=Count("id"),
        total_revenue=Sum("total"),
        delivered_count=Count("id", filter=Q(status="delivered")),
        cancelled_count=Count("id", filter=Q(status="cancelled")),
        new_count=Count("id", filter=Q(status="new")),
    )
    kpis = {k: (v or 0) for k, v in kpis.items()}

    open_preorders = Product.objects.filter(
        is_preorder=True,
        is_available=True,
    ).count()

    ctx.update({
        "title": _build_breadcrumb_title("Hisobotlar"),
        "kpis": kpis,
        "open_preorders": open_preorders,
    })

    return render(request, "reports/dashboard.html", ctx)


DEFAULT_PREORDER_STATUSES = ["new", "confirmed", "delivered"]

STATE_META = {
    "open": {"label": "Ochiq"},
    "full": {"label": "To'ldi"},
    "deadline_passed": {"label": "Muddat tugagan"},
}


@staff_member_required
def preorder_report(request):
    ctx = _common_context(request)
    date_range = ctx["date_range"]
    statuses = ctx["statuses"] or DEFAULT_PREORDER_STATUSES

    # ─── QUERY #1 — preorder mahsulotlar ──────────────────────────
    products = list(
        Product.objects
        .filter(is_preorder=True)
        .select_related("category")
        .order_by("-is_available", "category__order", "name")
    )

    # ─── QUERY #2 — zaxira: davr boshidan TO oraliq oxirigacha ─────
    # Boshlanish: HAR DOIM preorder_period_started_at (mahsulot davri)
    # Tugash: foydalanuvchi tanlagan end (yoki "hozir" agar tanlamagan)
    reserved_by_pid = defaultdict(int)
    now = timezone.now()
    cutoff = date_range["end"] or now  # bu oraliqning oxiri

    if products:
        product_ids = [p.id for p in products]
        period_by_pid = {p.id: p.preorder_period_started_at for p in products}

        # cutoff'gacha bo'lgan barcha buyurtmalar
        items_qs = OrderItem.objects.filter(
            product_id__in=product_ids,
            order__status__in=statuses,
            order__created_at__lte=cutoff,
        )

        raw_items = items_qs.values_list("product_id", "qty", "order__created_at")

        for pid, qty, created_at in raw_items:
            # Har mahsulotning o'z davri boshidan keyingisini sanaymiz
            period_start = period_by_pid.get(pid)
            if period_start and created_at < period_start:
                continue
            reserved_by_pid[pid] += qty

    # ─── Natija tayyorlash ────────────────────────────────────────
    results = []

    for p in products:
        reserved = reserved_by_pid.get(p.id, 0)
        threshold = p.preorder_threshold or 0
        remaining = max(threshold - reserved, 0)

        # Holat — oraliq oxiridagi mahsulotning haqiqiy holati
        if p.preorder_deadline and p.preorder_deadline < cutoff:
            state = "deadline_passed"
        elif threshold > 0 and reserved >= threshold:
            state = "full"
        else:
            state = "open"

        pct = min(round(reserved / threshold * 100), 100) if threshold > 0 else 0

        results.append({
            "product": p,
            "reserved": reserved,
            "remaining": remaining,
            "threshold": threshold,
            "deadline": p.preorder_deadline,
            "period_started_at": p.preorder_period_started_at,
            "state": state,
            "state_label": STATE_META[state]["label"],
            "pct": pct,
        })

    summary = {
        "total_products": len(results),
        "open": sum(1 for r in results if r["state"] == "open"),
        "full": sum(1 for r in results if r["state"] == "full"),
        "deadline_passed": sum(1 for r in results if r["state"] == "deadline_passed"),
        "total_reserved": sum(r["reserved"] for r in results),
    }

    ctx.update({
        "title": _build_breadcrumb_title(
            ("Hisobotlar", reverse("reports:dashboard")),
            "Preorder hisoboti",
        ),
        "results": results,
        "summary": summary,
    })
    return render(request, "reports/preorder.html", ctx)


@staff_member_required
def products_report(request):
    ctx = _common_context(request)
    date_range = ctx["date_range"]
    statuses = ctx["statuses"]

    base_qs = OrderItem.objects.all()

    if statuses:
        base_qs = base_qs.filter(order__status__in=statuses)
    if date_range["start"]:
        base_qs = base_qs.filter(order__created_at__gte=date_range["start"])
    if date_range["end"]:
        base_qs = base_qs.filter(order__created_at__lte=date_range["end"])

    revenue_expr = ExpressionWrapper(
        F("qty") * F("price"),
        output_field=IntegerField(),
    )

    overall = base_qs.aggregate(
        total_qty=Sum("qty"),
        total_revenue=Sum(revenue_expr),
        total_orders=Count("order_id", distinct=True),
    )
    total_products = base_qs.values("product_id").distinct().count()

    summary = {
        "total_products": total_products,
        "total_orders": overall["total_orders"] or 0,
        "total_qty": overall["total_qty"] or 0,
        "total_revenue": overall["total_revenue"] or 0,
    }

    products_qs = (
        base_qs
        .values(
            "product_id",
            "product__name",
            "product__unit",
            "product__category__name",
        )
        .annotate(
            total_qty=Sum("qty"),
            total_revenue=Sum(revenue_expr),
            orders_count=Count("order_id", distinct=True),
        )
        .order_by("-total_revenue")
    )

    paginator = Paginator(products_qs, 50)
    page = paginator.get_page(request.GET.get("page", 1))

    unit_labels = dict(Product.UNIT_CHOICES)
    rows = [
        {**r, "unit_label": unit_labels.get(r["product__unit"], r["product__unit"])}
        for r in page.object_list
    ]

    qs = request.GET.copy()
    qs.pop("page", None)

    ctx.update({
        "title": _build_breadcrumb_title(
            ("Hisobotlar", reverse("reports:dashboard")),
            "Mahsulotlar sotuvi",
        ),
        "rows": rows,
        "page": page,
        "summary": summary,
        "querystring": qs.urlencode(),
    })
    return render(request, "reports/products.html", ctx)


@staff_member_required
def categories_report(request):
    ctx = _common_context(request)
    date_range = ctx["date_range"]
    statuses = ctx["statuses"]

    base_qs = OrderItem.objects.all()

    if statuses:
        base_qs = base_qs.filter(order__status__in=statuses)
    if date_range["start"]:
        base_qs = base_qs.filter(order__created_at__gte=date_range["start"])
    if date_range["end"]:
        base_qs = base_qs.filter(order__created_at__lte=date_range["end"])

    revenue_expr = ExpressionWrapper(
        F("qty") * F("price"),
        output_field=IntegerField(),
    )

    overall = base_qs.aggregate(
        total_qty=Sum("qty"),
        total_revenue=Sum(revenue_expr),
        total_orders=Count("order_id", distinct=True),
    )
    total_categories = base_qs.values("product__category_id").distinct().count()

    summary = {
        "total_categories": total_categories,
        "total_orders": overall["total_orders"] or 0,
        "total_qty": overall["total_qty"] or 0,
        "total_revenue": overall["total_revenue"] or 0,
    }

    rows_qs = (
        base_qs
        .values(
            "product__category_id",
            "product__category__name",
        )
        .annotate(
            total_qty=Sum("qty"),
            total_revenue=Sum(revenue_expr),
            orders_count=Count("order_id", distinct=True),
            products_count=Count("product_id", distinct=True),
        )
        .order_by("-total_revenue")
    )
    rows = list(rows_qs)

    max_revenue = max((r["total_revenue"] or 0 for r in rows), default=0)
    grand_total_revenue = summary["total_revenue"] or 1

    for r in rows:
        rev = r["total_revenue"] or 0
        r["share_pct"] = round(rev / grand_total_revenue * 100, 1)
        r["bar_pct"] = round(rev / max_revenue * 100) if max_revenue else 0

    ctx.update({
        "title": _build_breadcrumb_title(
            ("Hisobotlar", reverse("reports:dashboard")),
            "Kategoriyalar sotuvi",
        ),
        "rows": rows,
        "summary": summary,
    })
    return render(request, "reports/categories.html", ctx)
