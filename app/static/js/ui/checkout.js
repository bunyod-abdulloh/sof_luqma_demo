import { state } from '../state.js';
import { getDeliveryPayload, renderCart, updateBadge } from '../cart/cart.js';

function getCookie(name) {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

function showAppAlert(message) {
  if (state.tg?.showAlert) state.tg.showAlert(message);
  else alert(message);
}

function buildCheckoutItems() {
  return Object.keys(state.cart).map(id => {
    const product = state.productsMap[id];
    const qty = state.cart[id];

    if (!product || !qty) return null;

    return {
      product_id: Number(id),
      qty: Number(qty),
    };
  }).filter(Boolean);
}

export async function checkout() {
  const items = buildCheckoutItems();

  if (!items.length) {
    showAppAlert("Savat bo'sh");
    return;
  }

  const payload = {
    tg_token: state.tgToken,
    items,
    delivery: getDeliveryPayload(),
  };

  const btn = document.getElementById('checkout-btn');
  btn?.setAttribute('disabled', 'disabled');
  if (btn) btn.innerText = "Yuborilmoqda...";

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user || null;
  const tgInitData = window.Telegram?.WebApp?.initData || '';

  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;

  try {
    const response = await fetch('/orders/checkout/', {
      method: 'POST',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Buyurtmani yuborishda xatolik");
    }

    state.cart = {};
    localStorage.setItem('cart', JSON.stringify(state.cart));

    const phoneEl = document.getElementById('cart-phone');
    const addressEl = document.getElementById('cart-address');
    const noteEl = document.getElementById('cart-note');

    if (phoneEl) phoneEl.value = '';
    if (addressEl) addressEl.value = '';
    if (noteEl) noteEl.value = '';

    renderCart();
    updateBadge();

    state.tg?.HapticFeedback?.notificationOccurred?.('success');
    showAppAlert(data.message || "Buyurtma qabul qilindi");

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('home-page')?.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-page="home"]')?.classList.add('active');

    document.getElementById('cart-bottom-bar').style.display = 'none';

    state.currentStep = 1;
  } catch (error) {
    console.error(error);
    state.tg?.HapticFeedback?.notificationOccurred?.('error');
    showAppAlert(error.message || "Server bilan bog'lanib bo'lmadi");
  } finally {
    btn?.removeAttribute('disabled');
    if (btn) btn.innerText = "Buyurtma berish";
  }
}