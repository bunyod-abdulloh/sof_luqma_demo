/**
 * Demo data — DRF API javobi formatida
 * Kelajakda fetch('/api/...') bilan almashtiriladi, frontend kod o'zgarmaydi
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
    name: "Qrim olmasi",
    category: 'fruits',
    price: 25000, old_price: 30000,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: 'Chegirma',
    icon_id: 'apple',  // icons.js dan reference
    description: "Tabiiy yetishtirilgan, pestitsidlarsiz Qrim olmasi",
  },
  {
    id: 2,
    name: "Ekologik pomidor",
    category: 'vegetables',
    price: 18000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: 'Yangi',
    icon_id: 'tomato',
    description: "Issiqxonada o'stirilgan, kimyoviy o'g'itsiz",
  },
  {
    id: 3,
    name: "Qishloq suti",
    category: 'dairy',
    price: 22000, old_price: null,
    unit: 'litr',
    in_stock: true, is_featured: true,
    badge: 'Bestseller',
    icon_id: 'milk',
    description: "Har kuni yangi sog'iladigan tabiiy sut",
  },
  {
    id: 4,
    name: "Mol go'shti",
    category: 'meat',
    price: 95000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    icon_id: 'meat',
    description: "Tabiiy ozuqa bilan boqilgan mol go'shti",
  },
  {
    id: 5,
    name: "Tog' asali",
    category: 'honey',
    price: 120000, old_price: 140000,
    unit: '0.5 kg',
    in_stock: true, is_featured: true,
    badge: 'Chegirma',
    icon_id: 'honey',
    description: "Chimyon tog'laridagi asalarilardan",
  },
  {
    id: 6,
    name: "Yangi tutilgan sazan",
    category: 'fish',
    price: 65000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: 'Yangi',
    icon_id: 'fish',
    description: "Chorvoq suv ombori sazani",
  },
  {
    id: 7,
    name: "Tarvuz",
    category: 'fruits',
    price: 8000, old_price: null,
    unit: 'kg',
    in_stock: true, is_featured: true,
    badge: null,
    icon_id: 'watermelon',
    description: "Shirin va sersuv mavsumiy tarvuz",
  },
  {
    id: 8,
    name: "Bodring",
    category: 'vegetables',
    price: 15000, old_price: null,
    unit: 'kg',
    in_stock: false, is_featured: true,
    badge: null,
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
