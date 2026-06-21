// cart/stepper.js
import { state } from '../state.js';
import { $, show, hide, showAlert } from './helpers.js';
import { checkout } from '../ui/checkout.js';

const STEP_COUNT = 3;

// Tashqi bog'liqliklar (fillOrderSummary keyinroq ajratiladi)
let deps = {
  fillOrderSummary: null,
};

export function initStepper(dependencies) {
  deps = { ...deps, ...dependencies };
}

// ─── Validatorlar ────────────────────────────────────────
function validateStep1() {
  const ids = Object.keys(state.cart);
  if (!ids.length) { showAlert("Savat bo'sh"); return false; }

  for (const id of ids) {
    const item = state.productsMap[id];
    if (!item?.preorder) continue;

    const qty = state.cart[id];
    const po = item.preorder;

    if (po.state === 'deadline_passed') {
      showAlert(
        `"${item.name}" uchun buyurtmalar qabuli tugagan. ` +
        `Keyingi qabulni sotuv guruhimizda e'lon qilamiz.`
      );
      return false;
    }
    if (po.state === 'full') {
      showAlert(`"${item.name}" uchun buyurtma to'lgan`);
      return false;
    }
    if (po.state === 'open' && qty > po.remaining) {
      showAlert(
        `"${item.name}" uchun faqat ${po.remaining} ${item.unit} qoldi. ` +
        `Savatdagi miqdorni kamaytiring.`
      );
      return false;
    }
  }

  return true;
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

// ─── UI yangilash ────────────────────────────────────────
export function updateStepperUI() {
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

  if (s === 3) deps.fillOrderSummary?.();
}

// ─── CartStepper ─────────────────────────────────────────
export const CartStepper = {
  next() {
    const s = state.currentStep;
    if (s === 1 && !validateStep1()) return;
    if (s === 2 && !validateStep2()) return;
    if (s === 3) {
      if (!validateStep3()) return;
      checkout();
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
      detail: { step },
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