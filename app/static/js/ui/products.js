import { state } from '../state.js';
import { escapeHtml } from '../utils.js';
import { fetchProducts } from '../api.js';

function storeProducts(items) {
  items.forEach(item => {
    state.productsMap[String(item.id)] = item;
  });
}

function productCardHtml(p) {
  return `
    <div class="product-card flex flex-col p-3" data-product-id="${p.id}">
      <div class="relative overflow-hidden rounded-2xl mb-3 h-32 bg-gray-50">
        <img src="${p.img}" class="w-full h-full object-cover" alt="${escapeHtml(p.name)}">
        ${p.is_organic ? `<div class="organic-badge"><span>🌿</span><span>ORGANIC</span></div>` : ''}
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
        <button data-add-to-cart="${p.id}"
                class="bg-[var(--brand-green)] text-white p-2.5 rounded-xl active:scale-90 transition-transform shadow-md"
                aria-label="Savatga qo'shish">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3.5">
            <path d="M12 4v16m8-8H4"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

export function loadInitialProducts() {
  const dataElement = document.getElementById('products-data');
  if (!dataElement) return;

  const initial = JSON.parse(dataElement.textContent || '[]');
  state.products = initial;
  storeProducts(initial);
  renderProducts(initial);

  state.currentCategory = 'all';
  state.currentPage = 1;
  state.hasNext = initial.length === 24;
}

export function renderProducts(items) {
  const grid = document.getElementById('food-grid');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `
      <div class="col-span-2 text-center py-16 text-gray-400 font-medium">
        <div class="text-5xl mb-3">🌱</div>
        <p>Hozircha mahsulotlar yo'q</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map(productCardHtml).join('');
}

export function appendProducts(items) {
  const grid = document.getElementById('food-grid');
  if (!grid || !items.length) return;

  grid.insertAdjacentHTML('beforeend', items.map(productCardHtml).join(''));
}

export async function loadProducts({ category = 'all', page = 1, append = false } = {}) {
  if (state.isLoadingProducts) return;
  state.isLoadingProducts = true;

  try {
    const data = await fetchProducts({ category, page });
    const items = data.results || [];

    storeProducts(items);

    if (append) {
      state.products = [...state.products, ...items];
      appendProducts(items);
    } else {
      state.products = items;
      renderProducts(items);
    }

    state.currentCategory = category;
    state.currentPage = page;
    state.hasNext = data.has_next || false;

    const trigger = document.getElementById('load-more-trigger');
    if (trigger) {
      trigger.classList.toggle('hidden', !state.hasNext);
    }
  } catch (err) {
    console.error('Products load error:', err);
  } finally {
    state.isLoadingProducts = false;
  }
}

export async function filterItems(categorySlug, btn) {
  state.currentCategory = categorySlug;
  state.currentPage = 1;
  state.hasNext = true;
  state.products = [];

  await loadProducts({
    category: categorySlug,
    page: 1,
    append: false,
  });

  document.querySelectorAll('.cat-card').forEach(b => b.classList.remove('active-cat'));
  btn?.classList.add('active-cat');
}

export function setupInfiniteScroll() {
  const trigger = document.getElementById('load-more-trigger');
  if (!trigger) return;

  if (state.observer) state.observer.disconnect();

  state.observer = new IntersectionObserver(async (entries) => {
    const entry = entries[0];
    if (!entry.isIntersecting || !state.hasNext || state.isLoadingProducts) return;

    await loadProducts({
      category: state.currentCategory,
      page: state.currentPage + 1,
      append: true,
    });
  }, {
    root: null,
    rootMargin: '200px',
    threshold: 0,
  });

  state.observer.observe(trigger);
}