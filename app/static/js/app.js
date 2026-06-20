const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || {};
let retryCount = 0;

let userLocation = null;

// Modal state — qaysi mahsulot ochilgan va quantity nechta
let currentDetailId = null;
let detailQty = 1;

// ========================
// Telegram User Setup
// ========================
function setupTelegramUser() {
    const user = tg?.initDataUnsafe?.user;
    if (user?.id) {
        localStorage.setItem('telegram_id', user.id);
        const userEl = document.getElementById('user-name');
        if (userEl) userEl.innerText = user.first_name || "";
    } else if (!localStorage.getItem('telegram_id')) {
        alert("Iltimos botga /start buyrug'ini kiritib qayta ishga tushiring!");
        tg.close();
    }
}

// ========================
// Initialize
// ========================
function initBannerCarousel() {
    const slides = document.querySelectorAll("#banner-carousel img");
    if (slides.length <= 1) return;   // 0 yoki 1 ta bo'lsa, kerak emas

    let current = 0;
    setInterval(() => {
        slides[current].classList.replace("opacity-100", "opacity-0");
        current = (current + 1) % slides.length;
        slides[current].classList.replace("opacity-0", "opacity-100");
    }, 4000);
}


function initializeApp() {
    setupTelegramUser();

    const dataElement = document.getElementById('products-data');
    if (!dataElement) {
        if (retryCount < 10) {
            retryCount++;
            setTimeout(initializeApp, 100);
        } else {
            console.error("products-data topilmadi");
        }
        return;
    }

    try {
        products = JSON.parse(dataElement.textContent) || [];
        console.log(`📦 ${products.length} ta mahsulot yuklandi`);
        renderHome(products);
        updateBadge();
        initSwipeToClose();
    } catch (e) {
        console.error("JSON parse xatosi:", e);
    }
}


// ========================
// Filter
// ========================
function filterItems(categorySlug, btn) {
    const filtered = categorySlug === 'all'
        ? products
        : products.filter(p => p.cat === categorySlug);

    renderHome(filtered);

    document.querySelectorAll('.cat-card').forEach(b => b.classList.remove('active-cat'));
    btn.classList.add('active-cat');

    tg.HapticFeedback?.impactOccurred('light');
}

// ========================
// Render Grid
// ========================
function renderHome(items) {
    const grid = document.getElementById('food-grid');
    if (!grid) return;

    if (!items.length) {
        grid.innerHTML = `
            <div class="col-span-2 text-center py-16 text-gray-400 font-medium">
                <div class="text-5xl mb-3">🌱</div>
                <p>Hozircha mahsulotlar yo'q</p>
            </div>`;
        return;
    }

    /*
       MUHIM: butun card'ga onclick — detail ochadi.
       "+" tugmasi onclick'da event.stopPropagation() chaqiradi —
       aks holda card click ham ishlab ketadi (event bubbling).
    */
    grid.innerHTML = items.map(p => `
        <div class="product-card flex flex-col p-3" onclick="openProductDetail(${p.id})">
            <div class="relative overflow-hidden rounded-2xl mb-3 h-32 bg-gray-50">
                <img src="${p.img}" class="w-full h-full object-cover" alt="${escapeHtml(p.name)}"
                     onerror="this.src='https://via.placeholder.com/150?text=Sof+Luqma'">
                ${p.is_organic ? `
                    <div class="organic-badge"><span>🌿</span><span>ORGANIC</span></div>
                ` : ''}
            </div>
            <h4 class="font-bold text-[13px] text-gray-800 px-1 leading-tight h-8 overflow-hidden">
                ${escapeHtml(p.name)}
            </h4>
            <div class="flex justify-between items-center mt-3 px-1 pb-1">
                <div class="flex flex-col">
                    <span class="text-[var(--brand-green-dark)] font-black text-xs">
                        ${Number(p.price).toLocaleString()} so'm
                    </span>
                    <span class="text-[10px] text-gray-400">/ ${p.unit || 'dona'}</span>
                </div>
                <button onclick="event.stopPropagation(); addToCart(${p.id})"
                        class="bg-[var(--brand-green)] text-white p-2.5 rounded-xl active:scale-90 transition-transform shadow-md"
                        aria-label="Savatga qo'shish">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
                        <path d="M12 4v16m8-8H4"/>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// ========================
// Product Detail Modal
// ========================
function openProductDetail(productId) {
    const p = products.find(item => item.id === productId);
    if (!p) return;

    currentDetailId = productId;
    detailQty = 1;

    // Modal'ni mahsulot data bilan to'ldiramiz
    document.getElementById('detail-img').src = p.img || '';
    document.getElementById('detail-img').alt = p.name;
    document.getElementById('detail-name').textContent = p.name;
    document.getElementById('detail-cat').textContent = p.cat_name || '';
    document.getElementById('detail-price').textContent =
        Number(p.price).toLocaleString() + " so'm";
    document.getElementById('detail-unit').textContent = `/ ${p.unit || 'dona'}`;
    document.getElementById('detail-qty').textContent = detailQty;

    // Description — agar bo'sh bo'lsa, butun blokni yashiramiz
    const descBlock = document.getElementById('detail-description-block');
    const descText = document.getElementById('detail-description');
    if (p.description?.trim()) {
        descText.textContent = p.description;
        descBlock.classList.remove('hidden');
    } else {
        descBlock.classList.add('hidden');
    }

    // Organic badge
    const badge = document.getElementById('detail-organic-badge');
    p.is_organic ? badge.classList.remove('hidden') : badge.classList.add('hidden');

    updateDetailTotal();

    // Modal'ni ochish
    document.getElementById('product-detail-modal').classList.add('active');
    document.body.classList.add('modal-open');

    // Telegram BackButton — ortga qaytish tabiiy bo'lsin
    if (tg.BackButton) {
        tg.BackButton.show();
        tg.BackButton.onClick(closeProductDetail);
    }

    tg.HapticFeedback?.impactOccurred('light');
}

function closeProductDetail() {
    const sheet = document.getElementById('detail-sheet');
    const modal = document.getElementById('product-detail-modal');
    const backdrop = modal?.querySelector('.detail-backdrop');

    // Swipe paytida qo'shilgan inline style'larni tozalash
    if (sheet) sheet.style.transform = '';
    if (backdrop) backdrop.style.opacity = '';

    modal?.classList.remove('active');
    document.body.classList.remove('modal-open');

    if (tg.BackButton) {
        tg.BackButton.offClick(closeProductDetail);
        tg.BackButton.hide();
    }

    currentDetailId = null;
}

function changeDetailQty(delta) {
    detailQty = Math.max(1, detailQty + delta);
    document.getElementById('detail-qty').textContent = detailQty;
    updateDetailTotal();
    tg.HapticFeedback?.selectionChanged?.();
}

function updateDetailTotal() {
    if (!currentDetailId) return;
    const p = products.find(item => item.id === currentDetailId);
    if (!p) return;
    const total = (p.price * detailQty).toLocaleString();
    document.getElementById('detail-total').textContent = `${total} so'm`;
}

function addDetailToCart() {
    if (!currentDetailId) return;
    cart[currentDetailId] = (cart[currentDetailId] || 0) + detailQty;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateBadge();
    tg.HapticFeedback?.notificationOccurred('success');

    // Badge animatsiyasi
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.classList.add('bump');
        setTimeout(() => badge.classList.remove('bump'), 400);
    }

    closeProductDetail();
}

function initSwipeToClose() {
    const sheet = document.getElementById('detail-sheet');
    const handle = document.getElementById('detail-handle');

    if (!sheet || !handle) {
        console.warn("Swipe elements topilmadi, swipe ishlamaydi");
        return;
    }

    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    let startTime = 0;

    // Sanoat standartlari (Material Design, iOS HIG):
    const CLOSE_THRESHOLD = 100;       // px — bu masofadan ortiq sudralsa, yopadi
    const VELOCITY_THRESHOLD = 0.5;    // px/ms — tez "flick" bo'lsa, masofadan qat'i nazar yopadi

    function onTouchStart(e) {
        startY = e.touches[0].clientY;
        currentY = startY;
        startTime = Date.now();
        isDragging = true;
        sheet.classList.add('dragging');
    }

    function onTouchMove(e) {
        if (!isDragging) return;

        currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        // Faqat pastga sudrashga ruxsat (yuqoriga sudrash mantiqsiz)
        if (diff < 0) return;

        // Sheet'ni real-time pastga sudraymiz
        sheet.style.transform = `translateY(${diff}px)`;

        // Backdrop opacity ham progressively kamayadi (vizual feedback)
        const backdrop = sheet.parentElement.querySelector('.detail-backdrop');
        if (backdrop) {
            backdrop.style.opacity = Math.max(0, 1 - diff / 400);
        }
    }

    function onTouchEnd() {
        if (!isDragging) return;
        isDragging = false;
        sheet.classList.remove('dragging');

        const diff = currentY - startY;
        const elapsed = Date.now() - startTime;
        const velocity = diff / elapsed;

        // Yopish qarori: yetarli masofa YOKI yetarli tezlik
        if (diff > CLOSE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
            closeProductDetail();
        } else {
            // Asl pozitsiyaga qaytarish
            sheet.style.transform = '';
            const backdrop = sheet.parentElement.querySelector('.detail-backdrop');
            if (backdrop) backdrop.style.opacity = '';
        }
    }

    // MUHIM: listener'lar HANDLE'ga bog'lanadi, butun sheet'ga emas
    // Sabab: agar sheet'ga bog'lansa, description scroll qilinsa
    // ham swipe deb bilinadi va modal yopilib qoladi
    handle.addEventListener('touchstart', onTouchStart, { passive: true });
    handle.addEventListener('touchmove', onTouchMove, { passive: true });
    handle.addEventListener('touchend', onTouchEnd);
    handle.addEventListener('touchcancel', onTouchEnd);
}

// ========================
// Cart
// ========================
function addToCart(id) {
    cart[id] = (cart[id] || 0) + 1;
    localStorage.setItem('cart', JSON.stringify(cart));
    updateBadge();
    tg.HapticFeedback?.notificationOccurred('success');

    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.classList.add('bump');
        setTimeout(() => badge.classList.remove('bump'), 400);
    }
}

function updateBadge() {
    const count = Object.values(cart).reduce((a, b) => a + b, 0);
    const badge = document.getElementById('cart-badge');
    if (!badge) return;

    if (count > 0) {
        badge.innerText = count;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    if (!container) return;

    const ids = Object.keys(cart);
    if (!ids.length) {
        container.innerHTML = `
            <div class="text-center py-20 text-gray-400 font-medium">
                <div class="text-5xl mb-3">🛒</div>
                <p>Savat hozircha bo'sh</p>
            </div>`;
        summary?.classList.add('hidden');
        return;
    }

    summary?.classList.remove('hidden');

    // Alohida o'zgaruvchilar — kelajakda yetkazib berish narxi qo'shilsa, oson kengaytiriladi
    let subtotal = 0;
    const deliveryFee = 0;   // hozir bepul, lekin alohida o'zgaruvchi sifatida saqlaymiz

    container.innerHTML = ids.map(id => {
        const item = products.find(p => p.id == id);
        if (!item) return '';

        const lineTotal = item.price * cart[id];
        subtotal += lineTotal;

        return `
            <div class="flex items-center bg-white p-3 rounded-2xl shadow-sm border border-green-50 mb-3">
                <img src="${item.img}" class="w-16 h-16 rounded-xl object-cover" alt="">
                <div class="flex-1 ml-3">
                    <h4 class="font-bold text-xs text-gray-800">${escapeHtml(item.name)}</h4>
                    <p class="text-[var(--brand-green-dark)] font-black text-xs mt-1">
                        ${Number(lineTotal).toLocaleString()} so'm
                    </p>
                    <p class="text-[10px] text-gray-400">
                        ${Number(item.price).toLocaleString()} × ${cart[id]} ${item.unit || ''}
                    </p>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="changeQty(${id}, -1)" class="count-btn">−</button>
                    <span class="font-bold text-base w-6 text-center text-gray-800">${cart[id]}</span>
                    <button onclick="changeQty(${id}, 1)" class="count-btn">+</button>
                </div>
            </div>`;
    }).join('');

    const total = subtotal + deliveryFee;

    // UI'ni yangilash — alohida elementlar
    const subtotalEl = document.getElementById('subtotal-val');
    const totalEl = document.getElementById('total-val');

    if (subtotalEl) subtotalEl.innerText = subtotal.toLocaleString() + " so'm";
    if (totalEl) totalEl.innerText = total.toLocaleString() + " so'm";
}

function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
    updateBadge();
}

// ========================
// Pages
// ========================
function showPage(pageId, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId + '-page')?.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    if (pageId === 'cart') renderCart();
    tg.HapticFeedback?.impactOccurred('medium');
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}



document.addEventListener('DOMContentLoaded', initBannerCarousel(), initializeApp());
