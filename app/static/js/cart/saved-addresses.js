// cart/saved-addresses.js
import { state } from '../state.js';
import { $, show, hide, apiFetch, showAlert } from './helpers.js';

let savedAddresses = [];
let savedAddressesBound = false;
const deletingIds = new Set();

// Tashqi bog'liqliklar — initSavedAddresses orqali beriladi
let deps = {
  onRegionChange: null,
  onDistrictChange: null,
  toggleApartment: null,
};

export function initSavedAddresses(dependencies) {
  deps = { ...deps, ...dependencies };
}

export async function prefillClientData() {
  if (!state.tgToken) return;

  try {
    const res = await apiFetch(
      `/clients/api/addresses/?tg_token=${encodeURIComponent(state.tgToken)}`
    );

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

    savedAddresses = res.addresses || [];
    if (savedAddresses.length) renderSavedAddresses();
  } catch (e) {
    console.warn('Prefill xatosi:', e);
  }
}

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
  bindSavedAddressesEvents(container);
}

function bindSavedAddressesEvents(container) {
  if (savedAddressesBound) return;
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
    const addr = savedAddresses.find(a => Number(a.id) === id);
    if (addr) applySavedAddress(addr);

    container.querySelectorAll('.saved-address-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.tg?.HapticFeedback?.selectionChanged?.();
  });
}

async function deleteSavedAddress(id) {
  if (deletingIds.has(id)) return;
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

    if (res.status !== 404 && !res.ok) throw new Error('Xatolik');

    savedAddresses = savedAddresses.filter(a => Number(a.id) !== id);
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
  const regionSelect = $('d-region');
  if (regionSelect && addr.region_id) {
    regionSelect.value = addr.region_id;
    await deps.onRegionChange?.(regionSelect);
  }

  const districtSelect = $('d-district');
  if (districtSelect && addr.district_id) {
    districtSelect.value = addr.district_id;
    await deps.onDistrictChange?.(districtSelect);
  }

  const addressEl = $('d-address');
  if (addressEl && addr.address) addressEl.value = addr.address;

  if (addr.building || addr.apartment) {
    const checkbox = $('d-apartment-toggle');
    if (checkbox && !checkbox.checked) {
      checkbox.checked = true;
      deps.toggleApartment?.(true);
    }
    const buildingEl = $('d-building');
    const apartmentEl = $('d-apartment');
    if (buildingEl) buildingEl.value = addr.building || '';
    if (apartmentEl) apartmentEl.value = addr.apartment || '';
  }

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