/**
 * Demo data — DRF API javobi formatida
 * Kelajakda fetch('/api/...') bilan almashtiriladi, frontend kod o'zgarmaydi
 *
 * IMAGE FIELD logikasi:
 * - image: 'images/products/...'  -> rasm ko'rsatiladi
 * - image: null                   -> SVG icon (fallback) ko'rsatiladi
 *
 * Backend bilan ishlaganda DRF ImageField avtomatik URL qaytaradi:
 *   { image: "/media/products/olma-barno-yigit.jpg" }
 */

const CATEGORIES = [
  { id: 1, slug: 'fruits',     name: "Mevalar",          color: '#E63946' },
  { id: 2, slug: 'vegetables', name: "Sabzavotlar",      color: '#52B788' },
  { id: 3, slug: 'dairy',      name: "Sut mahsulotlari", color: '#0096C7' },
  { id: 4, slug: 'meat',       name: "Go'sht",           color: '#9B2226' },
  { id: 5, slug: 'fish',       name: "Baliq",            color: '#023E8A' },
  { id: 6, slug: 'honey',      name: "Asal va boshqa",   color: '#F4C430' },
];

const PRODUCTS = [
  {
    id: 1,
    name: "Olma — Barno yigit",
    category: 'fruits',
    price: 25000, old_price: 30000,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/olma-barno-yigit.jpg',  // local rasm
    icon_id: 'apple',                                // fallback uchun
    description: "Tabiiy yetishtirilgan, pestitsidlarsiz Barno yigit navli olma",
  },
  {
    id: 2,
    name: "Olma (Semirinko)",
    category: 'fruits',
    price: 18000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/olma-semirinko.jpg',                                     // rasm hali yo'q
    icon_id: 'apple',
    description: "Tabiiy yetishtirilgan, pestitsidlarsiz Semirinko navli olma",
  },
  {
    id: 3,
    name: "Tuya suti (qumron)",
    category: 'dairy',
    price: 60000, old_price: null,
    unit: 'litr',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/qumron.jpg',
    icon_id: 'milk',
    description: "Samarqand viloyatining Nurobod tumanida, Otabek hoji akaning xo'jaligiga qarashli keng yaylovlarda erkin yurib oziqlanadigan, qo'ldan qo'shimcha ozuqa berilmaydigan - 100 foiz tabiiy toza usulda boqilayotgan tuyalar sutidan tayyorlangan. Qo'shimcha ozuqa yemagani bois bitta tuya bir kunda 1-1,5 litr sut beradi.",
  },
  {
    id: 4,
    name: "Qurut (echki)",
    category: 'dairy',
    price: 210000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/qurut.webp',
    icon_id: 'milk',
    description: "Sut mahsuloti",
  },
  {
    id: 5,
    name: "Suzma (echki)",
    category: 'dairy',
    price: 130000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/suzma.webp',
    icon_id: 'milk',
    description: "Sut mahsuloti",
  },
  {
    id: 6,
    name: "Sut (echki)",
    category: 'dairy',
    price: 40000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/sut.webp',
    icon_id: 'milk',
    description: "Sut mahsuloti",
  },
  {
    id: 7,
    name: "Qatiq (echki)",
    category: 'dairy',
    price: 40000, old_price: null,
    unit: 'litr',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/qatiq.webp',
    icon_id: 'milk',
    description: "Sut mahsuloti",
  },
  {
    id: 8,
    name: "Saryog' eritilgan (echki)",
    category: 'dairy',
    price: 180000, old_price: null,
    unit: 'litr',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/saryog.jpg',
    icon_id: 'milk',
    description: "Sut mahsuloti",
  },
  {
    id: 9,
    name: "Kuvi saryog'i (echki)",
    category: 'dairy',
    price: 180000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/saryog.jpg',
    icon_id: 'milk',
    description: "Sut mahsuloti. Oldindan buyurtma asosida keltiriladi",
  },
  {
    id: 10,
    name: "Sut (sigir)",
    category: 'dairy',
    price: 15000, old_price: null,
    unit: 'litr',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/sut.webp',
    icon_id: 'milk',
    description: "Sut mahsuloti. Oldindan buyurtma asosida keltiriladi",
  },
  {
    id: 11,
    name: "Qatiq (sigir)",
    category: 'dairy',
    price: 20000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/qatiq.webp',
    icon_id: 'milk',
    description: "Sut mahsuloti. Oldindan buyurtma asosida keltiriladi",
  },
  {
    id: 12,
    name: "Qaymoq (sigir)",
    category: 'dairy',
    price: 110000, old_price: null,
    unit: 'litr',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/qaymoq.jpg',
    icon_id: 'milk',
    description: "Sut mahsuloti. Oldindan buyurtma asosida keltiriladi",
  },
  {
    id: 13,
    name: "Qo'y go'shti",
    category: 'meat',
    price: 95000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/gosht.jpg',
    icon_id: 'meat',
    description: "Tabiiy ozuqa bilan boqilgan qo'y go'shti",
  },
  {
    id: 14,
    name: "Tog' asali",
    category: 'honey',
    price: 120000, old_price: 140000,
    unit: '0.5 kg',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/asal.webp',
    icon_id: 'honey',
    description: "Chimyon tog'laridagi asalarilardan",
  },
  {
    id: 15,
    name: "Yangi tutilgan sazan",
    category: 'fish',
    price: 65000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    image: 'static/img/sazan.webp',
    icon_id: 'fish',
    description: "Chorvoq suv ombori sazani",
  },
  {
    id: 16,
    name: "Bodring",
    category: 'vegetables',
    price: 15000, old_price: null,
    unit: 'kg',
    in_stock: false, is_featured: true,
    badge: null,
    image: 'static/img/logo.jpg',
    icon_id: 'cucumber',
    description: "Yangi terilgan, organik bodring",
  },
];

/**
 * Yordamchi funksiya: narxni o'zbekcha formatda ko'rsatish
 * 25000 -> "25 000 so'm"
 */
function formatPrice(price) {
  return price.toLocaleString('uz-UZ').replace(/,/g, ' ') + " so'm";
}
