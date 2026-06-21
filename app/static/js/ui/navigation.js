import { state } from '../state.js';
import { renderCart, initCart } from '../cart/cart.js';

export function showPage(pageId, btn) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId + '-page')?.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    const cartBar = document.getElementById('cart-bottom-bar');

    if (pageId === 'cart') {
        cartBar.style.display = 'block';
        initCart();
    } else {
        cartBar.style.display = 'none';
    }

    state.tg?.HapticFeedback?.impactOccurred('medium');
}