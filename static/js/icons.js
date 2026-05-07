/**
 * SOF LUQMA — Icons Library
 *
 * Markazlashtirilgan SVG icons store. Har bir icon — multi-color illustration.
 *
 * Foydalanish:
 *   getIcon('fruits')   -> SVG string qaytaradi
 *   getIcon('delivery') -> SVG string qaytaradi
 *
 * Pattern: React'dagi <Icon name="fruits" /> komponentiga teng,
 * lekin vanilla JS uchun moslashtirilgan.
 */


/* ===========================================================
   CATEGORY ICONS — har bir kategoriya uchun custom illustration
   =========================================================== */
const CATEGORY_ICONS = {

  // 🍎 Mevalar — olma + barg, qizil gradient
  fruits: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="apple-body" cx="0.35" cy="0.35" r="0.8">
          <stop offset="0%"  stop-color="#FF8787"/>
          <stop offset="60%" stop-color="#E63946"/>
          <stop offset="100%" stop-color="#A61E1E"/>
        </radialGradient>
        <linearGradient id="apple-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stop-color="#52B788"/>
          <stop offset="100%" stop-color="#2D6A4F"/>
        </linearGradient>
      </defs>

      <!-- soft shadow -->
      <ellipse cx="32" cy="55" rx="18" ry="2.5" fill="#000" opacity="0.1"/>

      <!-- apple body -->
      <path d="M32 18 C 20 18, 12 26, 12 38 C 12 49, 20 56, 28 56 C 30 56, 31 55, 32 55 C 33 55, 34 56, 36 56 C 44 56, 52 49, 52 38 C 52 26, 44 18, 32 18 Z"
            fill="url(#apple-body)"/>

      <!-- highlight (light reflection) -->
      <ellipse cx="22" cy="30" rx="4" ry="6" fill="#FFF" opacity="0.35" transform="rotate(-25 22 30)"/>

      <!-- stem -->
      <path d="M32 18 L 32 12" stroke="#6F4E37" stroke-width="2.5" stroke-linecap="round"/>

      <!-- leaf -->
      <path d="M32 13 Q 40 6, 48 10 Q 44 16, 36 17 Q 33 16, 32 13 Z"
            fill="url(#apple-leaf)"/>
      <path d="M34 13 Q 40 12, 46 11" stroke="#2D6A4F" stroke-width="0.6" fill="none" opacity="0.5"/>
    </svg>
  `,

  // 🥬 Sabzavotlar — sabzi (carrot)
  vegetables: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="carrot-body" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%"  stop-color="#FFA94D"/>
          <stop offset="100%" stop-color="#D9480F"/>
        </linearGradient>
        <linearGradient id="carrot-leaves" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#74C69D"/>
          <stop offset="100%" stop-color="#2D6A4F"/>
        </linearGradient>
      </defs>

      <ellipse cx="32" cy="56" rx="14" ry="2" fill="#000" opacity="0.1"/>

      <!-- carrot body -->
      <path d="M26 20 L 38 20 L 36 56 Q 32 60, 28 56 Z" fill="url(#carrot-body)"/>

      <!-- carrot ridges (texture) -->
      <line x1="29" y1="28" x2="35" y2="28" stroke="#A63E04" stroke-width="0.6" opacity="0.5"/>
      <line x1="29" y1="36" x2="35" y2="36" stroke="#A63E04" stroke-width="0.6" opacity="0.5"/>
      <line x1="30" y1="44" x2="34" y2="44" stroke="#A63E04" stroke-width="0.6" opacity="0.5"/>

      <!-- highlight -->
      <path d="M28 24 L 27 50" stroke="#FFD8A8" stroke-width="2" opacity="0.5" stroke-linecap="round"/>

      <!-- leaves -->
      <path d="M32 22 Q 22 16, 18 6 Q 26 10, 32 18 Z" fill="url(#carrot-leaves)"/>
      <path d="M32 22 Q 32 12, 32 4 Q 36 12, 34 20 Z" fill="url(#carrot-leaves)"/>
      <path d="M32 22 Q 42 16, 46 6 Q 38 10, 32 18 Z" fill="url(#carrot-leaves)"/>
    </svg>
  `,

  // 🥛 Sut mahsulotlari — sut shishasi
  dairy: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="milk-bottle" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stop-color="#F8F9FA"/>
          <stop offset="50%" stop-color="#FFFFFF"/>
          <stop offset="100%" stop-color="#DEE2E6"/>
        </linearGradient>
        <linearGradient id="milk-cap" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#4FB860"/>
          <stop offset="100%" stop-color="#2D6A4F"/>
        </linearGradient>
      </defs>

      <ellipse cx="32" cy="58" rx="14" ry="2" fill="#000" opacity="0.1"/>

      <!-- bottle body -->
      <path d="M24 22 L 24 28 Q 20 30, 20 38 L 20 54 Q 20 58, 24 58 L 40 58 Q 44 58, 44 54 L 44 38 Q 44 30, 40 28 L 40 22 Z"
            fill="url(#milk-bottle)" stroke="#CED4DA" stroke-width="0.5"/>

      <!-- milk inside (visible through bottle) -->
      <path d="M22 36 Q 20 36, 22 38 L 22 54 Q 22 56, 24 56 L 40 56 Q 42 56, 42 54 L 42 38 Q 44 36, 42 36 Z"
            fill="#FFF8E7" opacity="0.9"/>

      <!-- bottle highlight -->
      <rect x="27" y="32" width="2" height="22" rx="1" fill="#FFF" opacity="0.7"/>

      <!-- cap -->
      <rect x="24" y="14" width="16" height="10" rx="2" fill="url(#milk-cap)"/>
      <rect x="22" y="20" width="20" height="4" rx="1" fill="#2D6A4F"/>

      <!-- "MILK" label area -->
      <rect x="24" y="42" width="16" height="8" rx="1" fill="#FFF" opacity="0.8"/>
      <line x1="27" y1="46" x2="37" y2="46" stroke="#2D6A4F" stroke-width="1" stroke-linecap="round"/>
    </svg>
  `,

  // 🥩 Go'sht — steak
  meat: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="steak-body" cx="0.4" cy="0.4" r="0.7">
          <stop offset="0%"  stop-color="#E07A5F"/>
          <stop offset="60%" stop-color="#9B2226"/>
          <stop offset="100%" stop-color="#660708"/>
        </radialGradient>
        <linearGradient id="steak-fat" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#FFF8E7"/>
          <stop offset="100%" stop-color="#F1E5C7"/>
        </linearGradient>
      </defs>

      <ellipse cx="32" cy="54" rx="22" ry="3" fill="#000" opacity="0.1"/>

      <!-- bone (T-bone style) -->
      <path d="M28 18 Q 24 14, 28 12 Q 32 10, 36 12 Q 40 14, 36 18 L 36 28 L 28 28 Z"
            fill="url(#steak-fat)" stroke="#D4B996" stroke-width="0.5"/>

      <!-- meat -->
      <path d="M12 30 Q 8 38, 14 46 Q 22 54, 32 54 Q 42 54, 50 46 Q 56 38, 52 30 Q 48 22, 32 24 Q 16 22, 12 30 Z"
            fill="url(#steak-body)"/>

      <!-- meat marbling (texture) -->
      <path d="M20 38 Q 24 36, 28 38" stroke="#660708" stroke-width="1" fill="none" opacity="0.6"/>
      <path d="M36 40 Q 42 38, 46 42" stroke="#660708" stroke-width="1" fill="none" opacity="0.6"/>
      <path d="M22 46 Q 28 44, 32 46" stroke="#660708" stroke-width="1" fill="none" opacity="0.6"/>

      <!-- fat trim around -->
      <path d="M12 30 Q 8 38, 14 46 Q 22 54, 32 54 Q 42 54, 50 46 Q 56 38, 52 30"
            fill="none" stroke="url(#steak-fat)" stroke-width="2.5"/>

      <!-- highlight -->
      <ellipse cx="22" cy="32" rx="4" ry="2" fill="#FFF" opacity="0.2"/>
    </svg>
  `,

  // 🐟 Baliq
  fish: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="fish-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#90E0EF"/>
          <stop offset="50%" stop-color="#0096C7"/>
          <stop offset="100%" stop-color="#023E8A"/>
        </linearGradient>
        <linearGradient id="fish-belly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#CAF0F8"/>
          <stop offset="100%" stop-color="#90E0EF"/>
        </linearGradient>
      </defs>

      <ellipse cx="32" cy="54" rx="20" ry="2" fill="#000" opacity="0.1"/>

      <!-- tail -->
      <path d="M52 32 L 60 22 L 58 32 L 60 42 Z" fill="url(#fish-body)"/>

      <!-- body -->
      <path d="M8 32 Q 12 18, 30 18 Q 50 18, 54 32 Q 50 46, 30 46 Q 12 46, 8 32 Z"
            fill="url(#fish-body)"/>

      <!-- belly -->
      <path d="M14 36 Q 22 44, 36 44 Q 48 42, 50 36 Q 42 38, 30 38 Q 18 38, 14 36 Z"
            fill="url(#fish-belly)" opacity="0.8"/>

      <!-- top fin -->
      <path d="M28 18 L 30 10 L 38 16 Z" fill="#0096C7"/>

      <!-- bottom fin -->
      <path d="M28 46 L 32 50 L 36 46 Z" fill="#0096C7"/>

      <!-- side fin -->
      <path d="M22 32 Q 18 36, 16 40 Q 22 38, 26 36 Z" fill="#023E8A" opacity="0.7"/>

      <!-- scales (decorative dots) -->
      <circle cx="34" cy="28" r="1" fill="#023E8A" opacity="0.4"/>
      <circle cx="40" cy="30" r="1" fill="#023E8A" opacity="0.4"/>
      <circle cx="38" cy="34" r="1" fill="#023E8A" opacity="0.4"/>
      <circle cx="44" cy="32" r="1" fill="#023E8A" opacity="0.4"/>

      <!-- eye -->
      <circle cx="16" cy="30" r="2.5" fill="#FFF"/>
      <circle cx="16" cy="30" r="1.4" fill="#1A2E1A"/>
      <circle cx="16.5" cy="29.5" r="0.5" fill="#FFF"/>

      <!-- gill -->
      <path d="M22 26 Q 20 32, 22 38" stroke="#023E8A" stroke-width="1" fill="none" opacity="0.6"/>
    </svg>
  `,

  // 🍯 Asal
  honey: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="honey-jar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#FFE066"/>
          <stop offset="50%" stop-color="#F4C430"/>
          <stop offset="100%" stop-color="#C99700"/>
        </linearGradient>
        <linearGradient id="honey-lid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#9B2226"/>
          <stop offset="100%" stop-color="#660708"/>
        </linearGradient>
      </defs>

      <ellipse cx="32" cy="58" rx="16" ry="2" fill="#000" opacity="0.1"/>

      <!-- jar body -->
      <path d="M18 24 L 18 54 Q 18 58, 22 58 L 42 58 Q 46 58, 46 54 L 46 24 Z"
            fill="url(#honey-jar)"/>

      <!-- jar highlight -->
      <rect x="22" y="28" width="3" height="26" rx="1.5" fill="#FFF" opacity="0.5"/>

      <!-- honey inside reflection (top wavy line) -->
      <path d="M18 30 Q 22 28, 26 30 Q 30 32, 34 30 Q 38 28, 42 30 Q 44 30, 46 30 L 46 28 L 18 28 Z"
            fill="#FFD43B" opacity="0.7"/>

      <!-- label -->
      <rect x="22" y="38" width="20" height="12" rx="1" fill="#FFF8E7"/>
      <text x="32" y="46" font-family="Georgia, serif" font-size="6" font-style="italic"
            fill="#9B2226" text-anchor="middle" font-weight="700">Bee</text>

      <!-- lid -->
      <rect x="16" y="18" width="32" height="8" rx="2" fill="url(#honey-lid)"/>
      <rect x="14" y="22" width="36" height="3" rx="1" fill="#660708"/>

      <!-- honeycomb decoration on top -->
      <polygon points="30,12 33,12 34.5,15 33,18 30,18 28.5,15"
               fill="#F4C430" stroke="#9B2226" stroke-width="0.5"/>
    </svg>
  `,
};


/* ===========================================================
   FEATURE ICONS — "Nega aynan biz?" bo'limi
   =========================================================== */
const FEATURE_ICONS = {

  // 🌿 Organik
  organic: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="leaf-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stop-color="#74C69D"/>
          <stop offset="100%" stop-color="#1B4332"/>
        </linearGradient>
      </defs>

      <!-- background circle -->
      <circle cx="32" cy="32" r="28" fill="#E8F5EA"/>

      <!-- main leaf -->
      <path d="M16 48 Q 16 24, 40 14 Q 50 12, 50 22 Q 50 44, 26 50 Q 18 52, 16 48 Z"
            fill="url(#leaf-grad)"/>

      <!-- leaf vein -->
      <path d="M18 48 Q 30 36, 48 18" stroke="#FFF" stroke-width="1.5" fill="none" opacity="0.6"/>
      <path d="M24 42 Q 30 38, 36 36" stroke="#FFF" stroke-width="0.8" fill="none" opacity="0.5"/>
      <path d="M28 34 Q 34 30, 42 26" stroke="#FFF" stroke-width="0.8" fill="none" opacity="0.5"/>

      <!-- check badge -->
      <circle cx="46" cy="46" r="10" fill="#FFF"/>
      <circle cx="46" cy="46" r="8" fill="#2D9A3E"/>
      <path d="M42 46 L 45 49 L 50 43" stroke="#FFF" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,

  // 🚚 Yetkazib berish
  delivery: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="truck-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#52B788"/>
          <stop offset="100%" stop-color="#2D6A4F"/>
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="28" fill="#E8F5EA"/>

      <!-- speed lines -->
      <path d="M8 24 L 14 24" stroke="#74C69D" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
      <path d="M6 32 L 12 32" stroke="#74C69D" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
      <path d="M8 40 L 14 40" stroke="#74C69D" stroke-width="2" stroke-linecap="round" opacity="0.6"/>

      <!-- truck body (cargo) -->
      <rect x="16" y="22" width="22" height="20" rx="2" fill="url(#truck-grad)"/>

      <!-- truck cab -->
      <path d="M38 28 L 48 28 Q 50 28, 50 30 L 50 42 L 38 42 Z" fill="url(#truck-grad)"/>
      <rect x="40" y="30" width="8" height="6" rx="1" fill="#FFF" opacity="0.8"/>

      <!-- door line -->
      <line x1="27" y1="22" x2="27" y2="42" stroke="#1B4332" stroke-width="0.5" opacity="0.5"/>

      <!-- wheels -->
      <circle cx="22" cy="44" r="4" fill="#1A2E1A"/>
      <circle cx="22" cy="44" r="2" fill="#5C6B5C"/>
      <circle cx="44" cy="44" r="4" fill="#1A2E1A"/>
      <circle cx="44" cy="44" r="2" fill="#5C6B5C"/>

      <!-- package on top (organic) -->
      <rect x="20" y="28" width="14" height="10" rx="1" fill="#FFF8E7"/>
      <path d="M27 28 L 27 38" stroke="#F4C430" stroke-width="1.5"/>
      <path d="M20 33 L 34 33" stroke="#F4C430" stroke-width="1.5"/>
    </svg>
  `,

  // 👨‍🌾 Fermerdan to'g'ridan-to'g'ri
  farmer: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="sun-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#FFE066"/>
          <stop offset="100%" stop-color="#F4C430"/>
        </linearGradient>
        <linearGradient id="field-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#52B788"/>
          <stop offset="100%" stop-color="#2D6A4F"/>
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="28" fill="#FFF4D1"/>

      <!-- sun -->
      <circle cx="32" cy="22" r="8" fill="url(#sun-grad)"/>
      <!-- sun rays -->
      <g stroke="#F4C430" stroke-width="2" stroke-linecap="round">
        <line x1="32" y1="8"  x2="32" y2="11"/>
        <line x1="32" y1="33" x2="32" y2="36"/>
        <line x1="18" y1="22" x2="21" y2="22"/>
        <line x1="43" y1="22" x2="46" y2="22"/>
        <line x1="22" y1="12" x2="24" y2="14"/>
        <line x1="40" y1="14" x2="42" y2="12"/>
        <line x1="22" y1="32" x2="24" y2="30"/>
        <line x1="40" y1="30" x2="42" y2="32"/>
      </g>

      <!-- hills / field rows (logoga o'xshash) -->
      <path d="M8 44 Q 20 36, 32 40 Q 44 36, 56 44 L 56 48 L 8 48 Z"
            fill="url(#field-grad)"/>
      <path d="M8 50 Q 20 44, 32 46 Q 44 44, 56 50 L 56 56 L 8 56 Z"
            fill="#1B4332"/>

      <!-- crop rows (lines on field) -->
      <path d="M12 46 Q 24 42, 32 44" stroke="#1B4332" stroke-width="0.6" fill="none" opacity="0.5"/>
      <path d="M32 44 Q 44 42, 52 46" stroke="#1B4332" stroke-width="0.6" fill="none" opacity="0.5"/>

      <!-- small wheat/plant icons -->
      <g fill="#F4C430">
        <ellipse cx="20" cy="42" rx="0.8" ry="2"/>
        <ellipse cx="44" cy="42" rx="0.8" ry="2"/>
      </g>
    </svg>
  `,

  // ✓ Sifat kafolati
  quality: `
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stop-color="#52B788"/>
          <stop offset="100%" stop-color="#1B4332"/>
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="28" fill="#E8F5EA"/>

      <!-- shield -->
      <path d="M32 12 L 48 18 L 48 34 Q 48 46, 32 54 Q 16 46, 16 34 L 16 18 Z"
            fill="url(#shield-grad)"/>

      <!-- shield highlight -->
      <path d="M32 14 L 46 19 L 46 24 Q 46 28, 40 32 Q 32 30, 32 24 Z"
            fill="#FFF" opacity="0.15"/>

      <!-- check mark -->
      <path d="M22 32 L 29 39 L 42 26"
            stroke="#FFF" stroke-width="3.5" fill="none"
            stroke-linecap="round" stroke-linejoin="round"/>

      <!-- decorative stars around -->
      <g fill="#F4C430">
        <circle cx="14" cy="20" r="1.5"/>
        <circle cx="50" cy="22" r="1.5"/>
        <circle cx="12" cy="40" r="1"/>
        <circle cx="52" cy="42" r="1"/>
      </g>
    </svg>
  `,
};


/* ===========================================================
   PRODUCT ICONS — mahsulot kartochkalari uchun
   Hozircha kategoriya iconlarini qayta ishlatamiz
   =========================================================== */
const PRODUCT_ICONS = {
  apple:    CATEGORY_ICONS.fruits,
  tomato:   CATEGORY_ICONS.vegetables,
  milk:     CATEGORY_ICONS.dairy,
  meat:     CATEGORY_ICONS.meat,
  honey:    CATEGORY_ICONS.honey,
  fish:     CATEGORY_ICONS.fish,
  watermelon: CATEGORY_ICONS.fruits,
  cucumber:   CATEGORY_ICONS.vegetables,
};


/* ===========================================================
   PUBLIC API
   =========================================================== */
function getCategoryIcon(slug) {
  return CATEGORY_ICONS[slug] || '';
}

function getFeatureIcon(name) {
  return FEATURE_ICONS[name] || '';
}

function getProductIcon(name) {
  return PRODUCT_ICONS[name] || CATEGORY_ICONS.fruits; // fallback
}
