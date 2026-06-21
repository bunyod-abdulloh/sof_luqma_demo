// cart/preorder.js
import { state } from '../state.js';
import { apiFetch } from './helpers.js';

export function getMaxQty(id) {
  const item = state.productsMap[id];
  if (item?.preorder?.state === 'open') return item.preorder.remaining;
  return Infinity;
}

export async function refreshPreorderStatus() {
  const ids = Object.keys(state.cart);
  if (!ids.length) return;

  try {
    const res = await apiFetch(`/products/api/cart-preorder-status/?ids=${ids.join(',')}`);
    for (const [id, status] of Object.entries(res.preorder_status || {})) {
      if (state.productsMap[id]) {
        state.productsMap[id].preorder = status;
      }
    }
  } catch (e) {
    console.warn('Preorder status xatosi:', e);
  }
}