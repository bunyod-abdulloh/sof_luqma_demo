// cart/helpers.js
import { state } from '../state.js';

export const $ = id => document.getElementById(id);
export const show = el => el?.classList.remove('hidden');
export const hide = el => el?.classList.add('hidden');
export const fmt = n => new Intl.NumberFormat('uz-UZ').format(n) + " so'm";

export async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function showAlert(msg) {
  state.tg?.showAlert ? state.tg.showAlert(msg) : alert(msg);
}