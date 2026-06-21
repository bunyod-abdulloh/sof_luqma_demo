// cart/cart-items.js
import { state } from '../state.js';
import { $, show, hide, showAlert } from './helpers.js';
import { getMaxQty } from './preorder.js';

const ICON = {
  clock: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>`,
  ban: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>`,
  alert: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.7 18-8-14a2 2 0 0 0-3.4 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.7-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
};

function pill(tone, icon, text) {
  // tone: 'red' | 'amber'
  const tones = {
    red:   'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };
  return `<span class="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${tones[tone]}">${icon}${text}</span>`;
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

export function updateBadge() {
  const count = Object.keys(state.cart).length;
  const badge = $('cart-badge');
  if (!badge) return;
  badge.innerText = count;
  count > 0 ? show(badge) : hide(badge);
}

export function addToCart(id) {
  id = String(id);
  const item = state.productsMap[id];

  if (item?.preorder?.state === 'deadline_passed') {
    showAlert(`"${item.name}" uchun qabul tugagan`);
    return;
  }
  if (item?.preorder?.state === 'full') {
    showAlert(`"${item.name}" uchun buyurtma to'lgan`);
    return;
  }

  const current = state.cart[id] || 0;
  const max = getMaxQty(id);
  if (current + 1 > max) {
    showAlert(`"${item.name}" uchun faqat ${max} ${item.unit} qoldi`);
    return;
  }

  state.cart[id] = current + 1;
  saveCart();
  updateBadge();
  state.tg?.HapticFeedback?.notificationOccurred('success');
}

export function changeQty(id, delta) {
  id = String(id);
  if (!state.cart[id]) return;

  const next = state.cart[id] + delta;
  const max = getMaxQty(id);

  if (delta > 0 && next > max) {
    const item = state.productsMap[id];
    showAlert(`"${item.name}" uchun faqat ${max} ${item.unit} qoldi`);
    return;
  }

  state.cart[id] = next;
  if (state.cart[id] <= 0) delete state.cart[id];
  saveCart();
  updateBadge();
  renderCart();
}

export function setQty(id, value) {
  id = String(id);
  const item = state.productsMap[id];
  if (!item) return;

  let qty = parseInt(value, 10);
  if (isNaN(qty) || qty < 1) qty = 1;

  const max = getMaxQty(id);
  if (qty > max) {
    qty = max;
    showAlert(`"${item.name}" uchun faqat ${max} ${item.unit} qoldi`);
  }

  state.cart[id] = qty;
  saveCart();
  updateBadge();
  renderCart();
}

export function renderCart() {
  const container  = $('cart-items');
  const emptyMsg   = $('cart-empty');
  const summaryBox = $('cart-summary-box');
  const bottomBar  = $('cart-bottom-bar');
  if (!container) return;

  const ids = Object.keys(state.cart);

  if (!ids.length) {
    container.innerHTML = '';
    show(emptyMsg);
    hide(summaryBox);
    if (bottomBar) bottomBar.style.display = 'none';
    return;
  }

  hide(emptyMsg);
  show(summaryBox);
  if (bottomBar) bottomBar.style.display = 'block';

  let subtotal = 0;
  container.innerHTML = ids.map(id => {
    const item = state.productsMap[id];
    if (!item) return '';
    const qty       = state.cart[id];
    const lineTotal = item.price * qty;
    subtotal += lineTotal;

    const po = item.preorder;
    let preorderInfo = '';
    if (po) {
      if (po.state === 'deadline_passed') {
        preorderInfo = pill('red', ICON.clock, 'Qabul tugagan');
      } else if (po.state === 'full') {
        preorderInfo = pill('red', ICON.ban, "Buyurtma to'lgan");
      } else if (po.state === 'open') {
        const left = po.remaining - qty;
        if (left <= 0) {
          preorderInfo = pill('amber', ICON.alert, 'Maksimal miqdor tanlangan');
        } else if (left <= 5) {
          preorderInfo = pill('amber', ICON.alert, `Yana ${left} ${item.unit} qoldi`);
        }
      }
    }

    return `
      <div class="flex items-center bg-white p-3 rounded-2xl shadow-sm border border-green-50">
        <img src="${item.img}" class="w-16 h-16 rounded-xl object-cover" alt="">
        <div class="flex-1 ml-3">
          <h4 class="font-bold text-xs text-gray-800">${item.name}</h4>
          <p class="text-[var(--brand-green-dark)] font-black text-xs mt-1">
            ${Number(lineTotal).toLocaleString()} so'm
          </p>
          <p class="text-[10px] text-gray-400">
            ${Number(item.price).toLocaleString()} × ${qty} ${item.unit || ''}
          </p>
          ${preorderInfo}
        </div>
        <div class="flex items-center gap-1.5">
          <button class="count-btn" data-cart-minus="${id}">−</button>
          <input
            type="number"
            inputmode="numeric"
            min="1"
            value="${qty}"
            data-cart-input="${id}"
            class="qty-input"
          >
          <button class="count-btn" data-cart-plus="${id}">+</button>
        </div>
      </div>`;
  }).join('');

  $('subtotal-val').innerText = subtotal.toLocaleString() + " so'm";
  $('total-val').innerText    = subtotal.toLocaleString() + " so'm";
}

let cartListenersBound = false;

export function bindCartListeners() {
  const container = $('cart-items');
  if (!container) return;
  if (container.dataset.cartBound === '1') return;   // bir marta bog'langan bo'lsa — chiqamiz
  container.dataset.cartBound = '1';

  container.addEventListener('click', (e) => {
    const minus = e.target.closest('[data-cart-minus]');
    if (minus) { changeQty(minus.dataset.cartMinus, -1); return; }

    const plus = e.target.closest('[data-cart-plus]');
    if (plus) { changeQty(plus.dataset.cartPlus, +1); return; }
  });

  container.addEventListener('change', (e) => {
    const input = e.target.closest('[data-cart-input]');
    if (input) setQty(input.dataset.cartInput, input.value);
  });

  container.addEventListener('focusin', (e) => {
    const input = e.target.closest('[data-cart-input]');
    if (input) input.select();
  });
}