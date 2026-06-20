export async function fetchProducts({ category = 'all', page = 1 } = {}) {
  const res = await fetch(`/api/products/?category=${encodeURIComponent(category)}&page=${page}`, {
    headers: { 'X-Requested-With': 'XMLHttpRequest' },
  });

  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status}`);
  }

  return res.json();
}