"""Reports app uchun umumiy filtr utilitalari."""
from datetime import datetime, time, timedelta

from django.contrib import admin
from django.utils import timezone
from django.utils.safestring import mark_safe

from apps.orders.models import Order

QUICK_RANGES = [
    ("today", "Bugun"),
    ("week", "Shu hafta"),
    ("month", "Shu oy"),
    ("all", "Hammasi"),
]


def parse_date_range(request):
    """GET parametrlardan sana oralig'ini ajratib oladi.

    Tushuniladigan parametrlar:
        ?quick=today|week|month|all
        ?start=YYYY-MM-DD&end=YYYY-MM-DD
    """
    quick = (request.GET.get("quick") or "").strip()
    start_str = (request.GET.get("start") or "").strip()
    end_str = (request.GET.get("end") or "").strip()

    today = timezone.localdate()
    start_dt, end_dt, label = None, None, "Hamma vaqt"

    # Custom range ustun — agar ikkala maydondan birortasi to'ldirilgan bo'lsa
    if start_str or end_str:
        try:
            if start_str:
                d = datetime.strptime(start_str, "%Y-%m-%d").date()
                start_dt = timezone.make_aware(datetime.combine(d, time.min))
            if end_str:
                d = datetime.strptime(end_str, "%Y-%m-%d").date()
                end_dt = timezone.make_aware(datetime.combine(d, time.max))
            label = f"{start_str or '…'} — {end_str or '…'}"
            quick = ""
        except ValueError:
            pass
    elif quick == "today":
        start_dt = timezone.make_aware(datetime.combine(today, time.min))
        end_dt = timezone.make_aware(datetime.combine(today, time.max))
        label = "Bugun"
    elif quick == "week":
        week_start = today - timedelta(days=today.weekday())
        start_dt = timezone.make_aware(datetime.combine(week_start, time.min))
        end_dt = timezone.make_aware(datetime.combine(today, time.max))
        label = "Shu hafta"
    elif quick == "month":
        month_start = today.replace(day=1)
        start_dt = timezone.make_aware(datetime.combine(month_start, time.min))
        end_dt = timezone.make_aware(datetime.combine(today, time.max))
        label = "Shu oy"
    # quick == "all" yoki bo'sh — start_dt va end_dt = None

    return {
        "start": start_dt,
        "end": end_dt,
        "label": label,
        "quick": quick or "all",
        "start_str": start_str,
        "end_str": end_str,
    }


def apply_date_filter(qs, date_range, field="created_at"):
    if date_range["start"]:
        qs = qs.filter(**{f"{field}__gte": date_range["start"]})
    if date_range["end"]:
        qs = qs.filter(**{f"{field}__lte": date_range["end"]})
    return qs


def parse_status_filter(request):
    """Bir nechta status qiymatlari `?status=new&status=delivered` ko'rinishida keladi."""
    return request.GET.getlist("status")


def apply_status_filter(qs, statuses, field="status"):
    if statuses:
        qs = qs.filter(**{f"{field}__in": statuses})
    return qs


# ──────────────────────────────────────────────────────────────────
#  HEADER BREADCRUMB SARLAVHASI
# ──────────────────────────────────────────────────────────────────
def _build_breadcrumb_title(*parts):
    """
    Unfold header'idagi sarlavhani "Hisobotlar > Preorder hisoboti"
    ko'rinishida tayyorlaydi.

    parts:
        - tuple (label, url)  →  havola bo'lib chiqadi
        - str  label          →  oddiy matn (joriy sahifa)
    """
    sep = (
        ' <span class="text-font-subtle-light dark:text-font-subtle-dark mx-2">'
        '&rsaquo;</span> '
    )
    html_parts = []
    for p in parts:
        if isinstance(p, tuple):
            label, url = p
            html_parts.append(
                f'<a href="{url}" class="hover:text-primary-600 '
                f'dark:hover:text-primary-500">{label}</a>'
            )
        else:
            html_parts.append(f'<span>{p}</span>')
    return mark_safe(sep.join(html_parts))


def _common_context(request):
    date_range = parse_date_range(request)
    statuses = parse_status_filter(request)

    # Chip bosilganda saqlanadigan parametrlar — faqat status va boshqalar.
    # Sana (start/end) saqlanmaydi, chunki chip ularni override qilish uchun.
    qs_no_quick = request.GET.copy()
    qs_no_quick.pop("quick", None)
    qs_no_quick.pop("start", None)
    qs_no_quick.pop("end", None)
    qs_no_quick.pop("page", None)

    ctx = dict(admin.site.each_context(request))
    ctx.update({
        "date_range": date_range,
        "statuses": statuses,
        "quick_ranges": QUICK_RANGES,
        "all_statuses": Order.STATUS_CHOICES,
        "qs_no_quick": qs_no_quick.urlencode(),
    })
    return ctx
