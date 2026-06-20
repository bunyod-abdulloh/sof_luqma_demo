import { state } from './state.js';

export function setupTelegram() {
  const tg = state.tg;
  if (!tg) return;

  tg.ready();
  tg.expand();
}

export function setupTelegramUser() {
  const tg = state.tg;
  const user = tg?.initDataUnsafe?.user;

  if (user?.id) {
    localStorage.setItem('telegram_id', user.id);
    const userEl = document.getElementById('user-name');
    if (userEl) userEl.innerText = user.first_name || "";
  } else if (!localStorage.getItem('telegram_id')) {
    alert("Iltimos botga /start buyrug'ini kiritib qayta ishga tushiring!");
    tg?.close?.();
  }
}