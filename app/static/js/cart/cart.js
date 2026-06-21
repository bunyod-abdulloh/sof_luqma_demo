// cart.js
import { $, show, hide } from './helpers.js';
import {
  renderCart,
  bindCartListeners,
  addToCart,
  changeQty,
  setQty,
  updateBadge,
} from './cart-items.js';
import { refreshPreorderStatus } from './preorder.js';
import {
  CartStepper,
  updateStepperUI,
  initStepper,
} from './stepper.js';
import {
  initSavedAddresses,
  prefillClientData,
} from './saved-addresses.js';
import {
  loadRegions,
  onRegionChange,
  onDistrictChange,
  onBranchChange,
} from './delivery-form.js';
import { requestLocation, clearLocation } from './location.js';
import { fillOrderSummary } from './summary.js';
import { getDeliveryPayload } from './payload.js';
import { bindKeyboardReposition } from './keyboard.js';

// Tashqi kod uchun re-export
export {
  addToCart,
  changeQty,
  setQty,
  updateBadge,
  renderCart,
  getDeliveryPayload,
  CartStepper,
};

let listenersbound = false;

export async function initCart() {
  await refreshPreorderStatus();
  renderCart();
  bindCartListeners();

  initStepper({ fillOrderSummary });
  updateStepperUI();

  initSavedAddresses({
    onRegionChange,
    onDistrictChange,
    toggleApartment: (checked) => CartStepper.toggleApartment(checked),
  });

  if ($('d-region') && $('d-region').options.length === 1) {
    await loadRegions();
  }

  prefillClientData();

  if (listenersbound) return;
  listenersbound = true;

  $('d-region')?.addEventListener('change', e => onRegionChange(e.target));
  $('d-district')?.addEventListener('change', e => onDistrictChange(e.target));
  $('d-branch')?.addEventListener('change', e => onBranchChange(e.target));

  $('d-tashkent-block')?.addEventListener('click', e => {
    if (e.target.closest('[data-request-location]')) requestLocation();
    if (e.target.closest('[data-clear-location]')) clearLocation();
  });

  bindKeyboardReposition();
}

window.CartStepper = CartStepper;