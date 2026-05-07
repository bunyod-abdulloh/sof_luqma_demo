/**
 * Sof Luqma — Asosiy JavaScript
 *
 * Render funksiyalar data + icons.js ni birlashtiradi va DOM ga joylashtiradi.
 * Pattern: React komponentlariga o'xshash, lekin vanilla JS uchun.
 */


/* ========== 1. STATE ========== */
const state = {
  cart: [],
};


/* ========== 2. RENDER FUNKSIYALARI ========== */

/**
 * Kategoriya kartochkasi
 * --cat-color CSS o'zgaruvchisi orqali har bir kategoriyaga unique rang
 */
function renderCategoryCard(category) {
  const count = PRODUCTS.filter(p => p.category === category.slug).length;

  return `
    <a href="#products"
       class="category-card"
       style="--cat-color: ${category.color};">
      <div class="category-card__icon-wrap">
        ${getCategoryIcon(category.slug)}
      </div>
      <h3 class="category-card__name">${category.name}</h3>
      <span class="category-card__count">${count} ta mahsulot</span>
    </a>
  `;
}

/**
 * Mahsulot kartochkasi — premium ko'rinishda
 * SVG icon + gradient mesh background
 */
function renderProductCard(product) {
  const isOutOfStock = !product.in_stock;
  const hasDiscount = product.old_price !== null;

  return `
    <article class="product ${isOutOfStock ? 'product--out-of-stock' : ''}"
             data-id="${product.id}">
      <div class="product__image">
        <div class="product__icon">
          ${getProductIcon(product.icon_id)}
        </div>

        ${product.badge
          ? `<span class="product__badge product__badge--${product.badge}">${product.badge}</span>`
          : ''}

        <button class="product__fav" aria-label="Sevimlilarga qo'shish">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
        </button>
      </div>

      <div class="product__body">
        <h3 class="product__name">${product.name}</h3>
        <p class="product__desc">${product.description}</p>

        <div class="product__bottom">
          <div class="product__prices">
            ${hasDiscount
              ? `<span class="product__old-price">${formatPrice(product.old_price)}</span>`
              : ''}
            <span class="product__price">${formatPrice(product.price)}</span>
            <span class="product__unit">/ ${product.unit}</span>
          </div>

          <button class="product__add"
                  data-action="add-to-cart"
                  data-id="${product.id}"
                  ${isOutOfStock ? 'disabled' : ''}
                  aria-label="${product.name}ni savatga qo'shish">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"/>
              <path d="M12 5v14"/>
            </svg>
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Render container'larga
 * .map().join('') — klassik render pattern
 */
function renderCategories() {
  const container = document.getElementById('categoriesGrid');
  if (!container) return;
  container.innerHTML = CATEGORIES.map(renderCategoryCard).join('');
}

function renderProducts() {
  const container = document.getElementById('productsGrid');
  if (!container) return;
  const featured = PRODUCTS.filter(p => p.is_featured);
  container.innerHTML = featured.map(renderProductCard).join('');
}

/**
 * Features bo'limi — SVG iconlarni inject qilish
 * HTML'da placeholder bor, JS to'ldiradi
 */
function renderFeatureIcons() {
  const features = [
    { id: 'organic',  selector: '[data-feature="organic"]'  },
    { id: 'delivery', selector: '[data-feature="delivery"]' },
    { id: 'farmer',   selector: '[data-feature="farmer"]'   },
    { id: 'quality',  selector: '[data-feature="quality"]'  },
  ];

  features.forEach(f => {
    const el = document.querySelector(f.selector);
    if (el) el.innerHTML = getFeatureIcon(f.id);
  });
}


/* ========== 3. CART LOGIC ========== */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product || !product.in_stock) return;

  state.cart.push(productId);
  updateCartBadge();

  // Visual feedback — tugma qisqa "yutuq" animatsiyasi
  const btn = document.querySelector(`[data-action="add-to-cart"][data-id="${productId}"]`);
  if (btn) {
    btn.classList.add('product__add--success');
    setTimeout(() => btn.classList.remove('product__add--success'), 600);
  }
}

function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) {
    badge.textContent = state.cart.length;
    // Badge "pop" animation
    badge.classList.remove('cart-btn__badge--pop');
    void badge.offsetWidth; // reflow trigger — animatsiyani qayta ishga tushirish uchun
    badge.classList.add('cart-btn__badge--pop');
  }
}


/* ========== 4. EVENT HANDLING ========== */
/**
 * Event delegation — bitta listener barcha tugmalarga
 */
function setupEventListeners() {
  document.addEventListener('click', (e) => {
    const addBtn = e.target.closest('[data-action="add-to-cart"]');
    if (addBtn) {
      const id = parseInt(addBtn.dataset.id, 10);
      addToCart(id);
      return;
    }

    const favBtn = e.target.closest('.product__fav');
    if (favBtn) {
      favBtn.classList.toggle('product__fav--active');
    }
  });
}


/* ========== 5. TELEGRAM WEB APP ========== */
function setupTelegramWebApp() {
  if (!window.Telegram?.WebApp) return;

  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  tg.enableClosingConfirmation();
  tg.setHeaderColor('#2D9A3E');
}


/* ========== 6. INIT ========== */
document.addEventListener('DOMContentLoaded', () => {
  renderCategories();
  renderProducts();
  renderFeatureIcons();
  setupEventListeners();
  setupTelegramWebApp();
});
