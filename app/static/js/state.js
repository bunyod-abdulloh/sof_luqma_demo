// static/js/state.js
const urlParams = new URLSearchParams(window.location.search);

export const state = {
  tg: window.Telegram?.WebApp,
  tgToken: urlParams.get('tg_token') || '',
  products: [],
  productsMap: {},
  cart: JSON.parse(localStorage.getItem('cart')) || {},
//  userLocation: null,
  currentCategory: 'all',
  currentPage: 1,
  hasNext: true,
  isLoadingProducts: false,
  observer: null,
  currentDetailId: null,
  detailQty: 1,

  // Stepper
  currentStep: 1,

  // Delivery (delivery-modal.js dan ko'chdi)
  regionId: null,
  regionName: null,
  isTashkentCity: false,
  districtId: null,
  districtName: null,
  serviceId: null,
  serviceName: null,
  serviceSlug: null,
  isTaxi: false,
  branchId: null,
  branchName: null,
  branchAddress: null,
  deliveryPrice: null,
  location: null,

  // To'lov
  paymentType: null,
};