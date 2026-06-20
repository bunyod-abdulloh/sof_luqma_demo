import { state } from '../state.js';

const tg = window.Telegram?.WebApp;

const DEFAULT_LAT = 41.31108;
const DEFAULT_LON = 69.24056;

let leafletMap = null;
let leafletMarker = null;
let mapSelectedLat = null;
let mapSelectedLon = null;
let leafletLoaded = false;

export function initCartLocationHandlers() {
  document.querySelector('[data-request-location]')?.addEventListener('click', requestLocation);
  document.querySelector('[data-open-map-sheet]')?.addEventListener('click', openMapSheet);
  document.querySelector('[data-auto-locate-map]')?.addEventListener('click', autoLocateOnMap);
  document.querySelector('[data-confirm-map-location]')?.addEventListener('click', confirmMapLocation);
  document.querySelector('[data-clear-location]')?.addEventListener('click', clearLocation);

  document.querySelectorAll('[data-close-map-sheet]').forEach((el) => {
    el.addEventListener('click', closeMapSheet);
  });
}

function requestLocation() {
  const btn = document.querySelector('[data-request-location]');
  const btnText = document.getElementById('location-btn-text');

  if (!btn || !btnText) return;

  if (tg?.LocationManager) {
    btn.classList.add('loading');
    btnText.innerText = "So'ralmoqda...";

    tg.LocationManager.init(() => {
      tg.LocationManager.getLocation((data) => {
        btn.classList.remove('loading');

        if (data) {
          state.location = {
          lat: data.latitude,
          lon: data.longitude,
        };

          btn.classList.add('success');
          btnText.innerText = "Aniqlandi ✓";
          document.getElementById('location-status')?.classList.remove('hidden');
          tg.HapticFeedback?.notificationOccurred('success');
        } else {
          btnText.innerText = "GPS";
          tg.showAlert?.("Lokatsiya olinmadi. Xaritadan tanlang");
        }
      });
    });

    return;
  }

  if (!navigator.geolocation) {
    tg?.showAlert?.("GPS qo'llab-quvvatlanmaydi");
    return;
  }

  btn.classList.add('loading');
  btnText.innerText = "Aniqlanmoqda...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      state.location = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        };

      btn.classList.remove('loading');
      btn.classList.add('success');
      btnText.innerText = "Aniqlandi ✓";
      document.getElementById('location-status')?.classList.remove('hidden');
      tg?.HapticFeedback?.notificationOccurred?.('success');
    },
    () => {
      btn.classList.remove('loading');
      btnText.innerText = "GPS";
      tg?.showAlert?.("Lokatsiya olinmadi. Xaritadan tanlang");
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

async function loadLeaflet() {
  if (leafletLoaded) return true;

  try {
    await Promise.all([
      new Promise((resolve, reject) => {
        if (document.querySelector('link[href*="leaflet.css"]')) return resolve();

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.onload = resolve;
        link.onerror = reject;
        document.head.appendChild(link);
      }),
      new Promise((resolve, reject) => {
        if (window.L) return resolve();

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      }),
    ]);

    leafletLoaded = true;
    return true;
  } catch (error) {
    console.error('Leaflet yuklanmadi:', error);
    tg?.showAlert?.("Xarita yuklanmadi. Internetingizni tekshiring");
    return false;
  }
}

async function openMapSheet() {
  const modal = document.getElementById('map-sheet');
  if (!modal) return;

  modal.classList.add('active');
  document.body.classList.add('modal-open');

  const success = await loadLeaflet();
  if (!success) {
    closeMapSheet();
    return;
  }

  if (tg?.BackButton) {
    tg.BackButton.show();
    tg.BackButton.onClick(closeMapSheet);
  }

  setTimeout(() => {
    initLeafletMap();
  }, 300);
}

function initLeafletMap() {
  const mapEl = document.getElementById('leaflet-map');
  if (!mapEl) return;

  if (leafletMap) {
    setTimeout(() => leafletMap.invalidateSize(), 300);
    return;
  }

  const startLat = mapSelectedLat || state.userLocation?.latitude || DEFAULT_LAT;
  const startLon = mapSelectedLon || state.userLocation?.longitude || DEFAULT_LON;

  leafletMap = L.map('leaflet-map', {
    zoomControl: true,
    attributionControl: true,
  }).setView([startLat, startLon], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 19,
  }).addTo(leafletMap);

  leafletMarker = L.marker([startLat, startLon], { draggable: true }).addTo(leafletMap);

  leafletMarker.on('dragend', () => {
    const pos = leafletMarker.getLatLng();
    updateMapCoords(pos.lat, pos.lng);
  });

  leafletMap.on('click', (e) => {
    leafletMarker.setLatLng(e.latlng);
    updateMapCoords(e.latlng.lat, e.latlng.lng);
  });

  updateMapCoords(startLat, startLon);

  setTimeout(() => {
    leafletMap.invalidateSize();
  }, 300);
}

function updateMapCoords(lat, lon) {
  mapSelectedLat = lat;
  mapSelectedLon = lon;

  const coordsEl = document.getElementById('map-coords-text');
  if (coordsEl) {
    coordsEl.innerText = `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    coordsEl.classList.add('map-coords-text-active');
  }

  tg?.HapticFeedback?.selectionChanged?.();
}

function autoLocateOnMap() {
  tg?.HapticFeedback?.impactOccurred?.('medium');

  if (!navigator.geolocation || !leafletMap || !leafletMarker) {
    tg?.showAlert?.("Joylashuvni aniqlab bo'lmadi");
    return;
  }

  const coordsEl = document.getElementById('map-coords-text');
  if (coordsEl) coordsEl.innerText = "GPS aniqlanmoqda...";

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;

      leafletMap.setView([lat, lon], 17);
      leafletMarker.setLatLng([lat, lon]);
      updateMapCoords(lat, lon);
    },
    (err) => {
      if (coordsEl) coordsEl.innerText = "Markerni qo'ying";
      tg?.showAlert?.("Joylashuvni aniqlashda xatolik. Xaritadan qo'lda tanlang");
      console.error('GPS error:', err);
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function confirmMapLocation() {
  if (!mapSelectedLat || !mapSelectedLon) {
    tg?.showAlert?.("Avval xaritadan joy tanlang");
    return;
  }

  state.location = {
    lat: mapSelectedLat,
    lon: mapSelectedLon,
  };

  document.getElementById('location-status')?.classList.remove('hidden');
  tg?.HapticFeedback?.notificationOccurred?.('success');
  closeMapSheet();
}

function closeMapSheet() {
  document.getElementById('map-sheet')?.classList.remove('active');
  document.body.classList.remove('modal-open');

  if (tg?.BackButton) {
    tg.BackButton.offClick(closeMapSheet);
    tg.BackButton.hide();
  }
}

function clearLocation() {
  state.location = null;
  mapSelectedLat = null;
  mapSelectedLon = null;

  document.getElementById('location-status')?.classList.add('hidden');

  document.querySelectorAll('.location-btn').forEach((btn) => {
    btn.classList.remove('success', 'loading');
  });

  const gpsText = document.getElementById('location-btn-text');
  if (gpsText) gpsText.innerText = 'GPS';
}