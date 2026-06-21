// cart/location.js
import { state } from '../state.js';
import { $, show, hide } from './helpers.js';

export function requestLocation() {
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
      tg.LocationManager.getLocation(d =>
        d ? onSuccess(d.latitude, d.longitude) : onError()
      );
    });
    return;
  }

  if (!navigator.geolocation) {
    onError();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => onSuccess(pos.coords.latitude, pos.coords.longitude),
    onError,
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

export function clearLocation() {
  state.location = null;
  hide($('d-location-status'));
  const btn = document.querySelector('#d-tashkent-block [data-request-location]');
  btn?.classList.remove('success', 'loading');
  const btnText = $('d-location-btn-text');
  if (btnText) btnText.textContent = 'GPS';
}