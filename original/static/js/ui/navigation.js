import { state } from '../state.js';
import { renderCart } from './cart.js';

export function showPage(pageId, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId + '-page')?.classList.add('active');

  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  if (pageId === 'cart') renderCart();
  state.tg?.HapticFeedback?.impactOccurred('medium');
}