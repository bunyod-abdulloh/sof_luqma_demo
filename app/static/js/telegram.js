import { state } from './state.js';

export function setupTelegram() {
  const tg = state.tg;
  if (!tg) return;
  tg.ready();
  tg.expand();
}
