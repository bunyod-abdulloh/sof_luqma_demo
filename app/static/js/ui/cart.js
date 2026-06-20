import { state } from '../state.js';
import { checkout } from './checkout.js';


// ─── Helpers ─────────────────────────────────────────────
const API = {
  regions:       '/delivery/api/regions/',
  districts:     '/delivery/api/districts/',
  services:      '/delivery/api/services/',
  branches:      '/delivery/api/branches/',
  tashkentPrice: '/delivery/api/tashkent-price/',
};

const $ = id => document.getElementById(id);
const show = el => el?.classList.remove('hidden');
const hide = el => el?.classList.add('hidden');
const fmt  = n  => new Intl.NumberFormat('uz-UZ').format(n) + " so'm";

async function apiFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

function showAlert(msg) {
  state.tg?.showAlert ? state.tg.showAlert(msg) : alert(msg);
}

// ─── CART render ─────────────────────────────────────────
function saveCart() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

export function updateBadge() {
  const count = Object.values(state.cart).reduce((a, b) => a + b, 0);
  const badge = $('cart-badge');
  if (!badge) return;
  badge.innerText = count;
  count > 0 ? show(badge) : hide(badge);
}

export function addToCart(id) {
  id = String(id);
  state.cart[id] = (state.cart[id] || 0) + 1;
  saveCart();
  updateBadge();
  state.tg?.HapticFeedback?.notificationOccurred('success');
}

export function changeQty(id, delta) {
  id = String(id);
  if (!state.cart[id]) return;
  state.cart[id] += delta;
  if (state.cart[id] <= 0) delete state.cart[id];
  saveCart();
  updateBadge();
  renderCart();
}

export function renderCart() {
  const container  = $('cart-items');
  const emptyMsg   = $('cart-empty');
  const summaryBox = $('cart-summary-box');
  const bottomBar  = $('cart-bottom-bar');
  if (!container) return;

  const ids = Object.keys(state.cart);

  if (!ids.length) {
    container.innerHTML = '';
    show(emptyMsg);
    hide(summaryBox);
    if (bottomBar) bottomBar.style.display = 'none';
    return;
  }

  hide(emptyMsg);
  show(summaryBox);
  if (bottomBar) bottomBar.style.display = 'block';

  let subtotal = 0;
  container.innerHTML = ids.map(id => {
    const item = state.productsMap[id];
    if (!item) return '';
    const qty       = state.cart[id];
    const lineTotal = item.price * qty;
    subtotal += lineTotal;
    return `
      <div class="flex items-center bg-white p-3 rounded-2xl shadow-sm border border-green-50">
        <img src="${item.img}" class="w-16 h-16 rounded-xl object-cover" alt="">
        <div class="flex-1 ml-3">
          <h4 class="font-bold text-xs text-gray-800">${item.name}</h4>
          <p class="text-[var(--brand-green-dark)] font-black text-xs mt-1">
            ${Number(lineTotal).toLocaleString()} so'm
          </p>
          <p class="text-[10px] text-gray-400">
            ${Number(item.price).toLocaleString()} × ${qty} ${item.unit || ''}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button class="count-btn" data-cart-minus="${id}">−</button>
          <span class="font-bold text-base w-6 text-center text-gray-800">${qty}</span>
          <button class="count-btn" data-cart-plus="${id}">+</button>
        </div>
      </div>`;
  }).join('');

  $('subtotal-val').innerText = subtotal.toLocaleString() + " so'm";
  $('total-val').innerText    = subtotal.toLocaleString() + " so'm";
}

// ─── STEPPER ─────────────────────────────────────────────
const STEP_COUNT = 3;

function updateStepperUI() {
  const s = state.currentStep;

  for (let i = 1; i <= 4; i++) {
    const dot = $(`step-dot-${i}`);
    if (!dot) continue;
    dot.classList.remove('active', 'done');
    if (i < s)        dot.classList.add('done');
    else if (i === s) dot.classList.add('active');
  }
  for (let i = 1; i <= 3; i++) {
    const line = $(`step-line-${i}`);
    if (line) line.classList.toggle('done', i < s);
  }

  for (let i = 1; i <= STEP_COUNT; i++) {
    const panel = $(`cart-step-${i}`);
    if (panel) panel.classList.toggle('hidden', i !== s);
  }

  const nextBtn = $('cart-next-btn');
  const backBtn = $('cart-back-btn');
  const divider = $('cart-bar-divider');

  const show = el => { if (el) el.style.display = 'flex'; };
  const hide = el => { if (el) el.style.display = 'none'; };

  if (s === 1) {
        backBtn.style.display = 'none';
    } else {
        backBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
                 fill="none" stroke="currentColor" stroke-width="2.5"
                 stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
                <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
            </svg>
            Orqaga`;
        backBtn.onclick = () => CartStepper.prev();
        backBtn.style.display = 'flex';
    }

  nextBtn.innerHTML = s === STEP_COUNT
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
            fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
           <path d="M20 6L9 17l-5-5"/>
       </svg> Buyurtma berish`
    : `Davom etish
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
             fill="none" stroke="currentColor" stroke-width="2.5"
             stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>`;

  if (s === 3) fillOrderSummary();
}

function validateStep1() {
  const ids = Object.keys(state.cart);
  if (!ids.length) { showAlert("Savat bo'sh"); return false; }
  return true;
}
// ─── Prefill ─────────────────────────────────────────────
let savedAddresses = [];

async function prefillClientData() {
  if (!state.tgToken) return;

  try {
    const res = await apiFetch(
      `/clients/api/addresses/?tg_token=${encodeURIComponent(state.tgToken)}`
    );

    // Ism va telefon
    if (res.data) {
      const nameEl = $('d-fullname');
      const phoneEl = $('d-phone');
      if (nameEl && !nameEl.value && res.data.full_name) {
        nameEl.value = res.data.full_name;
      }
      if (phoneEl && !phoneEl.value && res.data.phone_number) {
        phoneEl.value = res.data.phone_number;
      }
    }

    // Saqlangan manzillar
    savedAddresses = res.addresses || [];
    if (savedAddresses.length) {
      renderSavedAddresses();
    }
  } catch (e) {
    console.warn('Prefill xatosi:', e);
  }
}

let savedAddressesBound = false;
const deletingIds = new Set();

function renderSavedAddresses() {
  const container = $('saved-addresses');
  if (!container) return;

  if (!savedAddresses.length) {
    container.innerHTML = '';
    hide(container);
    return;
  }

  container.innerHTML = savedAddresses.map(addr => `
    <button type="button" class="saved-address-btn" data-addr-id="${addr.id}">
      <span class="saved-addr-delete" data-delete-addr="${addr.id}" title="O'chirish">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </span>
      <div class="saved-addr-label">${addr.label || addr.region__name || 'Manzil'}</div>
      <div class="saved-addr-detail">${addr.district__name}${addr.address ? ', ' + addr.address : ''}</div>
    </button>
  `).join('');

  show(container);
  bindSavedAddressesEvents(container);   // faqat bir marta bog'lanadi
}

function bindSavedAddressesEvents(container) {
  if (savedAddressesBound) return;       // ⬅️ takror bog'lanmaydi
  savedAddressesBound = true;

  container.addEventListener('click', (e) => {
    const delBtn = e.target.closest('[data-delete-addr]');
    if (delBtn) {
      e.stopPropagation();
      deleteSavedAddress(Number(delBtn.dataset.deleteAddr));
      return;
    }

    const btn = e.target.closest('[data-addr-id]');
    if (!btn) return;
    const id = Number(btn.dataset.addrId);
    const addr = savedAddresses.find(a => Number(a.id) === id);   // type-safe
    if (addr) applySavedAddress(addr);

    container.querySelectorAll('.saved-address-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.tg?.HapticFeedback?.selectionChanged?.();
  });
}

async function deleteSavedAddress(id) {
  if (deletingIds.has(id)) return;       // ⬅️ shu id hozir o'chirilyapti, qaytma
  const tg = state.tg;

  const confirmed = await new Promise(resolve => {
    if (tg?.showConfirm) tg.showConfirm("Manzilni o'chirishni xohlaysizmi?", resolve);
    else resolve(confirm("Manzilni o'chirishni xohlaysizmi?"));
  });
  if (!confirmed) return;

  deletingIds.add(id);
  try {
    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    const res = await fetch(`/clients/api/addresses/${id}/delete/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
      body: JSON.stringify({ tg_token: state.tgToken }),
    });

    // 404 — allaqachon o'chirilgan, ro'yxatdan ham olib tashlaymiz
    if (res.status !== 404 && !res.ok) throw new Error('Xatolik');

    savedAddresses = savedAddresses.filter(a => Number(a.id) !== id);  // type-safe
    renderSavedAddresses();
    tg?.HapticFeedback?.notificationOccurred?.('success');
  } catch (e) {
    console.error(e);
    showAlert("O'chirishda xatolik yuz berdi");
  } finally {
    deletingIds.delete(id);
  }
}


async function applySavedAddress(addr) {
  // Region select
  const regionSelect = $('d-region');
  if (regionSelect && addr.region_id) {
    regionSelect.value = addr.region_id;
    await onRegionChange(regionSelect);  // district'larni yuklaydi
  }

  // District select
  const districtSelect = $('d-district');
  if (districtSelect && addr.district_id) {
    districtSelect.value = addr.district_id;
    await onDistrictChange(districtSelect);  // tashkent/service blokini ochadi
  }

  // Manzil
  const addressEl = $('d-address');
  if (addressEl && addr.address) {
    addressEl.value = addr.address;
  }

  // Bino / kvartira
  if (addr.building || addr.apartment) {
    const checkbox = $('d-apartment-toggle');
    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;
      CartStepper.toggleApartment(true);
    }
    const buildingEl = $('d-building');
    const apartmentEl = $('d-apartment');
    if (buildingEl) buildingEl.value = addr.building || '';
    if (apartmentEl) apartmentEl.value = addr.apartment || '';
  }

  // Lokatsiya
  if (addr.latitude && addr.longitude) {
    state.location = { lat: addr.latitude, lon: addr.longitude };
    show($('d-location-status'));
    const gpsBtn = document.querySelector('#d-tashkent-block [data-request-location]');
    gpsBtn?.classList.add('success');
    const btnText = $('d-location-btn-text');
    if (btnText) btnText.textContent = 'Aniqlandi ✓';
  }

  const labelEl = $('d-label');
  if (labelEl) labelEl.value = addr.label || '';
}

function validateStep2() {
  const fullname = $('d-fullname')?.value.trim();
  const phone    = $('d-phone')?.value.trim();

  if (!fullname) { showAlert("Ism Familiyani kiriting"); return false; }
  if (!phone)    { showAlert("Telefon raqamni kiriting"); return false; }
  if (!state.regionId)   { showAlert("Viloyatni tanlang"); return false; }
  if (!state.districtId) { showAlert("Tumanni tanlang");  return false; }

  if (state.isTashkentCity) {
    const address = $('d-address')?.value.trim();
    if (!address) { showAlert("Manzilni kiriting"); return false; }
  } else {
    if (!state.serviceId) { showAlert("Yetkazib berish turini tanlang"); return false; }
    if (state.serviceSlug === 'uzpost') {
      if (!$('d-uzpost-address')?.value.trim()) {
        showAlert("UzPost bo'limi manzilini kiriting"); return false;
      }
    } else if (!state.isTaxi && !state.branchId) {
      showAlert("Filialni tanlang"); return false;
    }
  }
  return true;
}

function validateStep3() {
  if (!state.paymentType) { showAlert("To'lov turini tanlang"); return false; }
  return true;
}

export const CartStepper = {
  next() {
    const s = state.currentStep;
    if (s === 1 && !validateStep1()) return;
    if (s === 2 && !validateStep2()) return;
    if (s === 3) {
      if (!validateStep3()) return;
      checkout();  // barcha validatsiyalar o'tdi — yuboramiz
      return;
    }
    state.currentStep++;
    updateStepperUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  prev() {
    if (state.currentStep > 1) {
      state.currentStep--;
      updateStepperUI();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  goTo(step) {
    state.currentStep = step;
    updateStepperUI();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    document.dispatchEvent(new CustomEvent('cart:stepChange', {
        detail: { step }
    }));
  },

  toggleApartment(checked) {
    checked ? show($('d-apartment-block')) : hide($('d-apartment-block'));
  },

  selectPayment(btn, type) {
    document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.paymentType = type;
  },
};

// ─── Step 3 — xulosa to'ldirish ──────────────────────────
function fillOrderSummary() {
  // Mahsulotlar
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

  // Yetkazish recap
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

// ─── DELIVERY logika (delivery-modal.js dan ko'chdi) ─────
function resetFrom(step) {
  const idx = ['region', 'district', 'service', 'branch'].indexOf(step);

  if (idx <= 0) {
    Object.assign(state, { regionId: null, regionName: null, isTashkentCity: false,
                           districtId: null, districtName: null });
    hide($('d-district-wrap'));
    hide($('d-tashkent-block'));
    hide($('d-service-block'));
    $('d-district').innerHTML = '<option value="">— Tumanni tanlang —</option>';
  }
  if (idx === 1) {
    Object.assign(state, { districtId: null, districtName: null });
    hide($('d-tashkent-block'));
    hide($('d-service-block'));
  }
  if (idx <= 2 && idx >= 2) {
    Object.assign(state, { serviceId: null, serviceName: null,
                           serviceSlug: null, isTaxi: false });
    $('d-service-options').innerHTML = '';
    hide($('d-branch-block'));
    hide($('d-taxi-block'));
    hide($('d-uzpost-block'));
    hide($('d-no-branch-msg'));
  }
  if (idx <= 3 && idx >= 3) {
    Object.assign(state, { branchId: null, branchName: null, branchAddress: null });
    $('d-branch').innerHTML = '<option value="">— Filialni tanlang —</option>';
    hide($('d-branch-address-block'));
  }
}

async function loadRegions() {
  const select = $('d-region');

  if (!select) {
    console.warn('d-region topilmadi');
    return;
  }

  try {
    const { regions } = await apiFetch(API.regions);

    select.innerHTML =
      '<option value="">— Viloyatni tanlang —</option>';

    regions.forEach(r => {
      const opt = new Option(r.name, r.id);
      opt.dataset.isTashkent = r.is_tashkent_city;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error('Viloyatlarni yuklashda xato:', e);
  }
}

async function onRegionChange(selectEl) {
  resetFrom('region');
  const opt = selectEl.selectedOptions[0];
  if (!opt.value) return;

  state.regionId      = opt.value;
  state.regionName    = opt.text;
  state.isTashkentCity = opt.dataset.isTashkent === 'true';

  try {
    const { districts } = await apiFetch(`${API.districts}?region_id=${state.regionId}`);
    const dSelect = $('d-district');
    dSelect.innerHTML = '<option value="">— Tumanni tanlang —</option>';
    districts.forEach(d => dSelect.appendChild(new Option(d.name, d.id)));
    show($('d-district-wrap'));
  } catch (e) {
    console.error('Tumanlarni yuklashda xato:', e);
  }

  if (state.isTashkentCity) {
    try {
      const { price } = await apiFetch(API.tashkentPrice);
      state.deliveryPrice = price;
      $('d-tashkent-price').textContent = fmt(price);
    } catch {
      state.deliveryPrice = 40000;
      $('d-tashkent-price').textContent = "40 000 so'm";
    }
  }
}

async function onDistrictChange(selectEl) {
  resetFrom('district');
  if (!selectEl.value) return;
  state.districtId   = selectEl.value;
  state.districtName = selectEl.selectedOptions[0].text;

  if (state.isTashkentCity) {
    show($('d-tashkent-block'));
  } else {
    await loadServices();
    show($('d-service-block'));
  }
}

async function loadServices() {
  try {
    const { services } = await apiFetch(API.services);
    const container = $('d-service-options');
    container.innerHTML = '';
    services.forEach(s => {
      const btn = document.createElement('button');
      btn.type      = 'button';
      btn.className = 'service-option-btn';
      btn.innerHTML = s.icon_url
        ? `<img src="${s.icon_url}" class="service-btn-icon-img" alt="${s.name}">`
        : `<span class="service-btn-icon">${{ bts:'🚚', emu:'📦', uzpost:'✉️', taxi:'🚕' }[s.slug] ?? '📬'}</span>`;
      btn.innerHTML += `<span class="service-btn-label">${s.name}</span>`;
      btn.onclick = () => onServiceSelect(btn, s);
      container.appendChild(btn);
    });
  } catch (e) {
    console.error('Xizmatlarni yuklashda xato:', e);
  }
}

async function onServiceSelect(btn, service) {
  Object.assign(state, { serviceId: null, serviceName: null, serviceSlug: null,
                         isTaxi: false, branchId: null, branchName: null, branchAddress: null });
  $('d-branch').innerHTML = '<option value="">— Filialni tanlang —</option>';
  hide($('d-branch-address-block'));
  hide($('d-branch-block'));
  hide($('d-taxi-block'));
  hide($('d-uzpost-block'));
  hide($('d-no-branch-msg'));

  document.querySelectorAll('.service-option-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  state.serviceId   = service.id;
  state.serviceName = service.name;
  state.serviceSlug = service.slug;
  state.isTaxi      = service.is_taxi;

  if (state.isTaxi) {
    const taxiImg = $('d-taxi-icon');
    if (service.icon_url) {
      taxiImg.src = service.icon_url;
      show(taxiImg);
      hide($('d-taxi-icon-fallback'));
      taxiImg.onerror = () => { hide(taxiImg); show($('d-taxi-icon-fallback')); };
    }
    show($('d-taxi-block'));
  } else if (service.slug === 'uzpost') {
    show($('d-uzpost-block'));
  } else {
    await loadBranches();
  }
}

async function loadBranches() {
  if (!state.serviceId || !state.regionId || !state.districtId) return;
  try {
    const { branches } = await apiFetch(
      `${API.branches}?service_id=${state.serviceId}&region_id=${state.regionId}&district_id=${state.districtId}`
    );
    const bSelect = $('d-branch');
    bSelect.innerHTML = '<option value="">— Filialni tanlang —</option>';

    if (!branches.length) {
      const msg = $('d-no-branch-msg');
      msg.querySelector('p').innerHTML =
        `⚠️ <b>${state.serviceName}</b> xizmati tanlangan hududda mavjud emas`;
      show(msg);
      return;
    }

    hide($('d-no-branch-msg'));
    branches.forEach(b => {
      const opt = new Option(b.branch_name, b.id);
      opt.dataset.address = b.address;
      bSelect.appendChild(opt);
    });
    show($('d-branch-block'));
  } catch (e) {
    console.error('Filiallarni yuklashda xato:', e);
  }
}

function onBranchChange(selectEl) {
  const opt = selectEl.selectedOptions[0];
  state.branchId      = opt.value || null;
  state.branchName    = opt.value ? opt.text : null;
  state.branchAddress = opt.dataset.address || null;

  if (state.branchAddress) {
    $('d-branch-address-text').textContent = state.branchAddress;
    show($('d-branch-address-block'));
  } else {
    hide($('d-branch-address-block'));
  }
}

// GPS
function requestLocation() {
  const btn     = document.querySelector('#d-tashkent-block [data-request-location]');
  const btnText = $('d-location-btn-text');
  const tg      = window.Telegram?.WebApp;

  const onSuccess = (lat, lon) => {
    state.location = { lat, lon };
    btn.classList.remove('loading');
    btn.classList.add('success');
    btnText.textContent = 'Aniqlandi ✓';
    show($('d-location-status'));
    tg?.HapticFeedback?.notificationOccurred?.('success');
  };
  const onError = () => {
    btn.classList.remove('loading');
    btnText.textContent = 'GPS';
    tg?.showAlert?.('Lokatsiya olinmadi. Xaritadan tanlang');
  };

  btn.classList.add('loading');
  btnText.textContent = 'Aniqlanmoqda...';

  if (tg?.LocationManager) {
    tg.LocationManager.init(() => {
      tg.LocationManager.getLocation(d => d ? onSuccess(d.latitude, d.longitude) : onError());
    });
    return;
  }
  if (!navigator.geolocation) { onError(); return; }
  navigator.geolocation.getCurrentPosition(
    pos => onSuccess(pos.coords.latitude, pos.coords.longitude),
    onError,
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function clearLocation() {
  state.location = null;
  hide($('d-location-status'));
  const btn = document.querySelector('#d-tashkent-block [data-request-location]');
  btn?.classList.remove('success', 'loading');
  const btnText = $('d-location-btn-text');
  if (btnText) btnText.textContent = 'GPS';
}

// ─── getDeliveryPayload — checkout.js uchun ──────────────
export function getDeliveryPayload() {
  return {
    fullname:      $('d-fullname')?.value.trim()  || '',
    phone:         $('d-phone')?.value.trim()     || '',
    note:          $('d-note')?.value.trim()      || '',
    regionId:      state.regionId,
    regionName:    state.regionName,
    districtId:    state.districtId,
    districtName:  state.districtName,
    isTashkentCity: state.isTashkentCity,
    address:       $('d-address')?.value.trim()   || '',
    location:      state.location,
    label:         $('d-label')?.value.trim()     || '',
    deliveryPrice: state.deliveryPrice,
    serviceId:     state.serviceId,
    serviceName:   state.serviceName,
    serviceSlug:   state.serviceSlug,
    isTaxi:        state.isTaxi,
    branchId:      state.branchId,
    branchName:    state.branchName,
    branchAddress: state.branchAddress,
    uzpostAddress: $('d-uzpost-address')?.value.trim() || '',
    paymentType:   state.paymentType,
    building:      $('d-building')?.value.trim()  || '',
    apartment:     $('d-apartment')?.value.trim() || '',
    intercom:      $('d-intercom')?.value.trim()  || '',
  };
}

// ─── Init ─────────────────────────────────────────────────
let listenersbound = false;

export async function initCart() {
  renderCart();
  updateStepperUI();

  // Regionlarni har safar tekshiramiz
  if ($('d-region') && $('d-region').options.length === 1) {
    await loadRegions();
  }

  // Mijoz ma'lumotlarini avtomatik to'ldirish
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
  // Klaviatura ochilganda panelni uning ustiga ko'taramiz (yashirmaymiz)
    const bar = $('cart-bottom-bar');
    const vv = window.visualViewport;

    if (bar && vv) {
      const repositionBar = () => {
        const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop;
        if (keyboardHeight > 80) {
          bar.style.bottom = (keyboardHeight + 12) + 'px';  // klaviatura ustida
        } else {
          bar.style.bottom = '';                            // CSS dagi 96px ga qaytadi
        }
      };
      vv.addEventListener('resize', repositionBar);
      vv.addEventListener('scroll', repositionBar);
    }
}

// window ga expose — HTML onclick lar uchun
window.CartStepper = CartStepper;