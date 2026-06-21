// cart/delivery-form.js
import { state } from '../state.js';
import { $, show, hide, fmt, apiFetch } from './helpers.js';

const API = {
  regions:       '/delivery/api/regions/',
  districts:     '/delivery/api/districts/',
  services:      '/delivery/api/services/',
  branches:      '/delivery/api/branches/',
  tashkentPrice: '/delivery/api/tashkent-price/',
};

// ─── Reset logikasi ──────────────────────────────────────
export function resetFrom(step) {
  const idx = ['region', 'district', 'service', 'branch'].indexOf(step);

  if (idx <= 0) {
    Object.assign(state, {
      regionId: null, regionName: null, isTashkentCity: false,
      districtId: null, districtName: null,
    });
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
  if (idx === 2) {
    Object.assign(state, {
      serviceId: null, serviceName: null, serviceSlug: null, isTaxi: false,
    });
    $('d-service-options').innerHTML = '';
    hide($('d-branch-block'));
    hide($('d-taxi-block'));
    hide($('d-uzpost-block'));
    hide($('d-no-branch-msg'));
  }
  if (idx === 3) {
    Object.assign(state, { branchId: null, branchName: null, branchAddress: null });
    $('d-branch').innerHTML = '<option value="">— Filialni tanlang —</option>';
    hide($('d-branch-address-block'));
  }
}

// ─── Regions ─────────────────────────────────────────────
export async function loadRegions() {
  const select = $('d-region');
  if (!select) {
    console.warn('d-region topilmadi');
    return;
  }

  try {
    const { regions } = await apiFetch(API.regions);
    select.innerHTML = '<option value="">— Viloyatni tanlang —</option>';
    regions.forEach(r => {
      const opt = new Option(r.name, r.id);
      opt.dataset.isTashkent = r.is_tashkent_city;
      select.appendChild(opt);
    });
  } catch (e) {
    console.error('Viloyatlarni yuklashda xato:', e);
  }
}

export async function onRegionChange(selectEl) {
  resetFrom('region');
  const opt = selectEl.selectedOptions[0];
  if (!opt.value) return;

  state.regionId       = opt.value;
  state.regionName     = opt.text;
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

// ─── District ────────────────────────────────────────────
export async function onDistrictChange(selectEl) {
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

// ─── Services ────────────────────────────────────────────
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
  Object.assign(state, {
    serviceId: null, serviceName: null, serviceSlug: null,
    isTaxi: false, branchId: null, branchName: null, branchAddress: null,
  });
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

// ─── Branches ────────────────────────────────────────────
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

export function onBranchChange(selectEl) {
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