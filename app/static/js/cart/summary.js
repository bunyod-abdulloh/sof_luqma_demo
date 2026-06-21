// cart/summary.js
import { state } from '../state.js';
import { $, fmt } from './helpers.js';

export function fillOrderSummary() {
  const container = $('order-summary-items');
  let subtotal = 0;
  container.innerHTML = Object.keys(state.cart).map(id => {
    const item = state.productsMap[id];
    if (!item) return '';
    const qty  = state.cart[id];
    const line = item.price * qty;
    subtotal  += line;
    return `
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">${item.name} × ${qty}</span>
        <span class="font-semibold text-gray-800">${Number(line).toLocaleString()}</span>
      </div>`;
  }).join('');

  const deliveryPrice = state.isTashkentCity ? (state.deliveryPrice || 0) : null;
  $('summary-subtotal').textContent = fmt(subtotal);
  $('summary-delivery').textContent = deliveryPrice ? fmt(deliveryPrice) : "Alohida to'lanadi";
  $('summary-total').textContent    = fmt(subtotal + (deliveryPrice || 0));

  $('recap-name').textContent  = $('d-fullname')?.value.trim() || '';
  $('recap-phone').textContent = $('d-phone')?.value.trim() || '';

  let deliveryLine = '';
  if (state.isTashkentCity) {
    deliveryLine = `Shahar ichida — ${$('d-address')?.value.trim()}`;
  } else if (state.isTaxi) {
    deliveryLine = `Taksi — ${state.regionName}, ${state.districtName}`;
  } else if (state.serviceSlug === 'uzpost') {
    deliveryLine = `UzPost — ${$('d-uzpost-address')?.value.trim()}`;
  } else {
    deliveryLine = `${state.serviceName} — ${state.branchName}`;
  }
  $('recap-delivery').textContent = deliveryLine;
}