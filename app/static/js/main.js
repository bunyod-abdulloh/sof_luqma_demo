import { setupTelegram } from './telegram.js';
import { initBannerCarousel } from './ui/banners.js';
import { addToCart, changeQty, updateBadge, initCart } from './ui/cart.js';
import { openProductDetail, closeProductDetail, changeDetailQty, addDetailToCart } from './ui/modal.js';
import { showPage } from './ui/navigation.js';
import { loadInitialProducts, setupInfiniteScroll, filterItems } from './ui/products.js';
import { initCartLocationHandlers } from './ui/map.js';
import { checkout } from './ui/checkout.js';

document.addEventListener('DOMContentLoaded', () => {
    Telegram.WebApp.ready();
    initCartLocationHandlers();
});

function bindEvents() {
    document.addEventListener('click', async (e) => {
        // --- Mavjud handlerlar ---
        const addBtn = e.target.closest('[data-add-to-cart]');
        if (addBtn) {
            e.stopPropagation();
            addToCart(addBtn.dataset.addToCart);
            return;
        }

        const card = e.target.closest('[data-product-id]');
        if (card) {
            openProductDetail(card.dataset.productId);
            return;
        }

        const minus = e.target.closest('[data-cart-minus]');
        if (minus) { changeQty(minus.dataset.cartMinus, -1); return; }

        const plus = e.target.closest('[data-cart-plus]');
        if (plus) { changeQty(plus.dataset.cartPlus, 1); return; }

        const cat = e.target.closest('[data-category-slug]');
        if (cat) { await filterItems(cat.dataset.categorySlug, cat); return; }

        const closeBtn = e.target.closest('[data-detail-close]');
        if (closeBtn) { closeProductDetail(); return; }

        const detailMinus = e.target.closest('[data-detail-minus]');
        if (detailMinus) { changeDetailQty(-1); return; }

        const detailPlus = e.target.closest('[data-detail-plus]');
        if (detailPlus) { changeDetailQty(1); return; }

        const detailAdd = e.target.closest('[data-detail-add]');
        if (detailAdd) { addDetailToCart(); return; }

        const navBtn = e.target.closest('[data-page]');
        if (navBtn) { showPage(navBtn.dataset.page, navBtn); return; }

        // --- Delivery modal handlerlar ---
        if (e.target.closest('[data-open-delivery-modal]')) {
            openDeliveryModal();
            return;
        }

        if (e.target.closest('[data-close-delivery-modal]')) {
            closeDeliveryModal();
            return;
        }

        if (e.target.closest('[data-confirm-delivery]')) {
            confirmDelivery();
            return;
        }
    });

    // Ko'p qavatli uy checkbox — change eventi
    document.addEventListener('change', (e) => {
        if (e.target.id === 'd-is-apartment') {
            toggleApartment(e.target.checked);
        }
    });
}

function init() {
    setupTelegram();
    loadInitialProducts();
    updateBadge();
    initBannerCarousel();
    setupInfiniteScroll();
    bindEvents();
    initCartLocationHandlers();
    initCart,
    document.querySelector('[data-checkout]')?.addEventListener('click', checkout);
}

document.addEventListener('DOMContentLoaded', init);