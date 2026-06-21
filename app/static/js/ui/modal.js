import { state } from '../state.js';
import { updateBadge } from '../cart/cart.js';

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

export function openProductDetail(productId) {
  const p = state.productsMap[String(productId)];
  if (!p) return;

  state.currentDetailId = String(productId);
  state.detailQty = 1;

  const modal = document.getElementById('product-detail-modal');
  const sheet = document.getElementById('detail-sheet');

  document.getElementById('detail-img').src = p.img || '';
  document.getElementById('detail-img').alt = p.name;
  document.getElementById('detail-name').textContent = p.name;
  document.getElementById('detail-cat').textContent = p.cat_name || '';
  document.getElementById('detail-price').textContent = Number(p.price).toLocaleString() + " so'm";
  document.getElementById('detail-unit').textContent = `/ ${p.unit || 'kg'}`;
  document.getElementById('detail-qty').textContent = state.detailQty;

  const descBlock = document.getElementById('detail-description-block');
  const descText = document.getElementById('detail-description');
  if (p.description?.trim()) {
    descText.textContent = p.description;
    descBlock.classList.remove('hidden');
  } else {
    descBlock.classList.add('hidden');
  }

  const badge = document.getElementById('detail-organic-badge');
  if (p.is_organic) badge.classList.remove('hidden');
  else badge.classList.add('hidden');

  updateDetailTotal();

  if (sheet) sheet.scrollTop = 0;

  modal?.classList.add('active');
  document.body.classList.add('modal-open');

  if (state.tg?.BackButton) {
    state.tg.BackButton.show();
    state.tg.BackButton.onClick(closeProductDetail);
  }

  state.tg?.HapticFeedback?.impactOccurred?.('light');
}


export function closeProductDetail() {
  const modal = document.getElementById('product-detail-modal');
  modal?.classList.remove('active');
  document.body.classList.remove('modal-open');

  if (state.tg?.BackButton) {
    state.tg.BackButton.offClick(closeProductDetail);
    state.tg.BackButton.hide();
  }

  state.currentDetailId = null;
}

export function updateDetailTotal() {
  if (!state.currentDetailId) return;
  const p = state.productsMap[state.currentDetailId];
  if (!p) return;

  const total = (p.price * state.detailQty).toLocaleString();
  document.getElementById('detail-total').textContent = `${total} so'm`;
}

export function changeDetailQty(delta) {
  state.detailQty = Math.max(1, state.detailQty + delta);
  document.getElementById('detail-qty').textContent = state.detailQty;
  updateDetailTotal();
  state.tg?.HapticFeedback?.selectionChanged?.();
}

export function addDetailToCart() {
  if (!state.currentDetailId) return;

  const id = state.currentDetailId;
  state.cart[id] = (state.cart[id] || 0) + state.detailQty;
  saveCart();
  updateBadge();
  closeProductDetail();

  state.tg?.HapticFeedback?.notificationOccurred?.('success');
}