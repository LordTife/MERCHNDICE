/* ============================================================
   MERCHNDICE — shop.js
   Product data, filtering, sorting, pagination, grid render
   ============================================================ */

// ── Product Data ────────────────────────────────────────────
const PRODUCTS = [
  { id:'p1',  name:'Oversized Essential Hoodie',   category:'Hoodies',     color:'Black',   price:45,  originalPrice:null,  badge:'new',  sizes:['S','M','L','XL'],   img:'assets/images/prod_hoodie_black.png' },
  { id:'p2',  name:'Essentials Tracksuit Set',     category:'Tracksuits',  color:'Grey',    price:65,  originalPrice:89,    badge:'sale', sizes:['S','M','L','XL'],   img:'assets/images/prod_tracksuit_grey.png' },
  { id:'p3',  name:'Utility Cargo Joggers',        category:'Bottoms',     color:'Black',   price:38,  originalPrice:null,  badge:null,   sizes:['S','M','L','XL','XXL'], img:null },
  { id:'p4',  name:'Vintage Washed Graphic Tee',   category:'T-Shirts',    color:'Charcoal',price:28,  originalPrice:null,  badge:'new',  sizes:['S','M','L','XL'],   img:null },
  { id:'p5',  name:'Premium Logo Cap',             category:'Accessories', color:'Black',   price:18,  originalPrice:null,  badge:'hot',  sizes:['One Size'],         img:null },
  { id:'p6',  name:'Tech Fleece Zip Hoodie',       category:'Hoodies',     color:'Navy',    price:55,  originalPrice:null,  badge:null,   sizes:['S','M','L','XL'],   img:null },
  { id:'p7',  name:'Relaxed Fit Sweatpants',       category:'Bottoms',     color:'Grey',    price:35,  originalPrice:42,    badge:'sale', sizes:['S','M','L','XL'],   img:null },
  { id:'p8',  name:'Drop Shoulder Crewneck',       category:'Sweatshirts', color:'Cream',   price:40,  originalPrice:null,  badge:null,   sizes:['S','M','L','XL'],   img:null },
  { id:'p9',  name:'Streetwear Bucket Hat',        category:'Accessories', color:'Black',   price:15,  originalPrice:null,  badge:null,   sizes:['One Size'],         img:null },
  { id:'p10', name:'Embroidered Logo Polo',        category:'T-Shirts',    color:'White',   price:32,  originalPrice:null,  badge:'new',  sizes:['S','M','L','XL'],   img:null },
  { id:'p11', name:'Oversized Boxy Tee',           category:'T-Shirts',    color:'Black',   price:25,  originalPrice:null,  badge:null,   sizes:['S','M','L','XL','XXL'], img:null },
  { id:'p12', name:'Heavyweight Zip Hoodie',       category:'Hoodies',     color:'Olive',   price:58,  originalPrice:null,  badge:null,   sizes:['M','L','XL'],       img:null },
  { id:'p13', name:'Slim Fit Joggers',             category:'Bottoms',     color:'Black',   price:34,  originalPrice:null,  badge:null,   sizes:['S','M','L','XL'],   img:null },
  { id:'p14', name:'Crossbody Messenger Bag',      category:'Accessories', color:'Black',   price:22,  originalPrice:28,    badge:'sale', sizes:['One Size'],         img:null },
  { id:'p15', name:'Acid Wash Hoodie',             category:'Hoodies',     color:'Grey',    price:52,  originalPrice:null,  badge:'hot',  sizes:['S','M','L','XL'],   img:null },
  { id:'p16', name:'Cotton Shorts',                category:'Bottoms',     color:'Navy',    price:26,  originalPrice:null,  badge:null,   sizes:['S','M','L','XL'],   img:null },
  { id:'p17', name:'Retro Track Jacket',           category:'Tracksuits',  color:'Black',   price:48,  originalPrice:null,  badge:'new',  sizes:['S','M','L','XL'],   img:null },
  { id:'p18', name:'Socks 3-Pack',                 category:'Accessories', color:'Multi',   price:12,  originalPrice:null,  badge:null,   sizes:['One Size'],         img:null },
  { id:'p19', name:'Heavyweight Graphic Hoodie',   category:'Hoodies',     color:'Black',   price:60,  originalPrice:null,  badge:null,   sizes:['S','M','L','XL'],   img:null },
  { id:'p20', name:'Ribbed Beanie',                category:'Accessories', color:'Black',   price:14,  originalPrice:null,  badge:null,   sizes:['One Size'],         img:null },
  { id:'p21', name:'Velour Tracksuit Set',         category:'Tracksuits',  color:'Burgundy',price:72,  originalPrice:95,    badge:'sale', sizes:['S','M','L','XL'],   img:null },
  { id:'p22', name:'Longline Curved Hem Tee',      category:'T-Shirts',    color:'White',   price:22,  originalPrice:null,  badge:null,   sizes:['S','M','L','XL'],   img:null },
  { id:'p23', name:'Performance Shorts',           category:'Bottoms',     color:'Grey',    price:30,  originalPrice:null,  badge:null,   sizes:['S','M','L','XL'],   img:null },
  { id:'p24', name:'Puffer Gilet',                 category:'Outerwear',   color:'Black',   price:65,  originalPrice:null,  badge:'new',  sizes:['S','M','L','XL'],   img:null },
];

// Expose products to product.html
window.PRODUCTS = PRODUCTS;

// ── Currency ────────────────────────────────────────────────
const CURRENCIES = {
  GBP: { symbol: '£', rate: 1,     code: 'GBP' },
  USD: { symbol: '$', rate: 1.27,   code: 'USD' },
  NGN: { symbol: '₦', rate: 1950,  code: 'NGN' },
};

function getCurrentCurrency() {
  const code = localStorage.getItem('merchndice_currency') || 'GBP';
  return CURRENCIES[code] || CURRENCIES.GBP;
}

function setCurrency(code) {
  localStorage.setItem('merchndice_currency', code);
  if (typeof renderProducts === 'function') renderProducts();
  if (typeof renderCartPage === 'function') renderCartPage();
  if (typeof renderCartDrawer === 'function') renderCartDrawer();
  updateCurrencySelector();
  // Dispatch custom event for other pages
  window.dispatchEvent(new CustomEvent('currencychange'));
}

function formatPrice(gbpPrice) {
  const cur = getCurrentCurrency();
  const converted = gbpPrice * cur.rate;
  if (cur.code === 'NGN') {
    return cur.symbol + converted.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }
  return cur.symbol + converted.toFixed(2);
}

function updateCurrencySelector() {
  const cur = getCurrentCurrency();
  document.querySelectorAll('.currency-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.currency === cur.code);
  });
  document.querySelectorAll('.currency-display').forEach(el => {
    el.textContent = cur.symbol + ' ' + cur.code;
  });
}

// expose globally
window.formatPrice = formatPrice;
window.getCurrentCurrency = getCurrentCurrency;
window.setCurrency = setCurrency;
window.updateCurrencySelector = updateCurrencySelector;

// ── Filtering state ─────────────────────────────────────────
let filters = {
  categories: [],
  colors: [],
  sizes: [],
  maxPrice: 100,
};
let sortBy = 'newest';
let currentPage = 1;
const perPage = 12;

// ── Filter Logic ────────────────────────────────────────────
function applyFilters() {
  let result = [...PRODUCTS];

  if (filters.categories.length) {
    result = result.filter(p => filters.categories.includes(p.category));
  }
  if (filters.colors.length) {
    result = result.filter(p => filters.colors.includes(p.color));
  }
  if (filters.sizes.length) {
    result = result.filter(p => p.sizes.some(s => filters.sizes.includes(s)));
  }
  result = result.filter(p => p.price <= filters.maxPrice);

  // Sort
  switch (sortBy) {
    case 'price-low':  result.sort((a, b) => a.price - b.price); break;
    case 'price-high': result.sort((a, b) => b.price - a.price); break;
    case 'name':       result.sort((a, b) => a.name.localeCompare(b.name)); break;
    default: break; // 'newest' = default order
  }

  return result;
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  const countEl = document.getElementById('productCount');
  if (!grid) return;

  const filtered = applyFilters();
  const totalPages = Math.ceil(filtered.length / perPage);
  currentPage = Math.min(currentPage, totalPages || 1);
  const start = (currentPage - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  if (countEl) countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''}`;

  grid.innerHTML = pageItems.map(p => productCardHTML(p)).join('');
  renderPagination(totalPages);
  renderActiveFilters();
}

function productCardHTML(p) {
  const badgeHTML = p.badge
    ? `<span class="product-card__badge badge-${p.badge}">${p.badge === 'sale' ? 'Sale' : p.badge === 'hot' ? 'Hot' : 'New'}</span>`
    : '';

  const imgHTML = p.img
    ? `<img class="product-card__img" src="${p.img}" alt="${p.name}" loading="lazy">`
    : `<div class="product-card__img-placeholder" style="background:linear-gradient(135deg,#1a1a1a 0%,#252525 100%)">MRCH</div>`;

  const priceHTML = p.originalPrice
    ? `<span class="price-current">${formatPrice(p.price)}</span><span class="price-original">${formatPrice(p.originalPrice)}</span><span class="price-save">-${Math.round((1 - p.price / p.originalPrice) * 100)}%</span>`
    : `<span class="price-current">${formatPrice(p.price)}</span>`;

  return `
  <a href="product.html?id=${p.id}" class="product-card" id="product-${p.id}">
    <div class="product-card__img-wrap">
      ${imgHTML}
      ${badgeHTML}
      <div class="product-card__actions" onclick="event.preventDefault();event.stopPropagation();">
        <button class="product-action-btn" title="Quick add" onclick="event.preventDefault();addToCart({id:'${p.id}',name:'${p.name.replace(/'/g,"\\'")}',price:${p.price},size:'M',color:'${p.color}',img:'${p.img||''}'})">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </button>
        <button class="product-action-btn" title="Wishlist" onclick="event.preventDefault();toggleWishlist(this,'${p.name.replace(/'/g,"\\'")}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
        </button>
      </div>
    </div>
    <div class="product-card__info">
      <span class="product-card__cat">${p.category}</span>
      <span class="product-card__name">${p.name}</span>
      <div class="product-card__price-row">${priceHTML}</div>
    </div>
  </a>`;
}

// ── Pagination ──────────────────────────────────────────────
function renderPagination(totalPages) {
  const el = document.getElementById('pagination');
  if (!el || totalPages <= 1) { if (el) el.innerHTML = ''; return; }

  let html = '';
  html += `<button class="page-btn" ${currentPage <= 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn" ${currentPage >= totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">›</button>`;
  el.innerHTML = html;
}

function goToPage(page) {
  currentPage = page;
  renderProducts();
  window.scrollTo({ top: document.getElementById('productGrid').offsetTop - 120, behavior: 'smooth' });
}

// ── Active filters chips ────────────────────────────────────
function renderActiveFilters() {
  const el = document.getElementById('activeFilters');
  if (!el) return;

  const chips = [];
  filters.categories.forEach(c => chips.push({ type: 'categories', value: c, label: c }));
  filters.colors.forEach(c => chips.push({ type: 'colors', value: c, label: c }));
  filters.sizes.forEach(s => chips.push({ type: 'sizes', value: s, label: s }));
  if (filters.maxPrice < 100) chips.push({ type: 'price', value: filters.maxPrice, label: `Under ${formatPrice(filters.maxPrice)}` });

  el.innerHTML = chips.map(c => `
    <span class="active-filter-chip">
      ${c.label}
      <button onclick="removeFilter('${c.type}','${c.value}')">&times;</button>
    </span>`).join('');
}

function removeFilter(type, value) {
  if (type === 'price') {
    filters.maxPrice = 100;
    const priceInput = document.getElementById('priceRange');
    if (priceInput) priceInput.value = 100;
    updatePriceLabel(100);
  } else {
    filters[type] = filters[type].filter(v => v !== value);
    // Uncheck checkbox
    document.querySelectorAll(`.filter-option input[value="${value}"]`).forEach(cb => cb.checked = false);
    document.querySelectorAll(`.size-pill[data-size="${value}"]`).forEach(p => p.classList.remove('selected'));
    document.querySelectorAll(`.color-swatch[data-color="${value}"]`).forEach(s => s.classList.remove('selected'));
  }
  currentPage = 1;
  renderProducts();
}

function clearAllFilters() {
  filters = { categories: [], colors: [], sizes: [], maxPrice: 100 };
  document.querySelectorAll('.filter-option input').forEach(cb => cb.checked = false);
  document.querySelectorAll('.size-pill').forEach(p => p.classList.remove('selected'));
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
  const priceInput = document.getElementById('priceRange');
  if (priceInput) priceInput.value = 100;
  updatePriceLabel(100);
  currentPage = 1;
  renderProducts();
}

function updatePriceLabel(val) {
  const el = document.getElementById('priceMax');
  if (el) el.textContent = formatPrice(val);
}

// ── Init shop filters ───────────────────────────────────────
function initShopFilters() {
  // Category checkboxes
  document.querySelectorAll('.filter-option input[name="category"]').forEach(cb => {
    cb.addEventListener('change', () => {
      filters.categories = Array.from(document.querySelectorAll('.filter-option input[name="category"]:checked')).map(el => el.value);
      currentPage = 1;
      renderProducts();
    });
  });

  // Size pills
  document.querySelectorAll('.size-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('selected');
      filters.sizes = Array.from(document.querySelectorAll('.size-pill.selected')).map(el => el.dataset.size);
      currentPage = 1;
      renderProducts();
    });
  });

  // Color swatches
  document.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      swatch.classList.toggle('selected');
      filters.colors = Array.from(document.querySelectorAll('.color-swatch.selected')).map(el => el.dataset.color);
      currentPage = 1;
      renderProducts();
    });
  });

  // Price range
  const priceInput = document.getElementById('priceRange');
  if (priceInput) {
    priceInput.addEventListener('input', e => {
      const val = parseInt(e.target.value);
      filters.maxPrice = val;
      updatePriceLabel(val);
      const pct = val;
      priceInput.style.background = `linear-gradient(to right, var(--color-gold) 0%, var(--color-gold) ${pct}%, var(--color-border) ${pct}%)`;
    });
    priceInput.addEventListener('change', () => {
      currentPage = 1;
      renderProducts();
    });
  }

  // Sort
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      sortBy = e.target.value;
      currentPage = 1;
      renderProducts();
    });
  }

  // Currency buttons
  document.querySelectorAll('.currency-btn').forEach(btn => {
    btn.addEventListener('click', () => setCurrency(btn.dataset.currency));
  });
}

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productGrid')) {
    initShopFilters();
    updateCurrencySelector();
    renderProducts();
  }
});

// Listen for currency changes
window.addEventListener('currencychange', () => {
  if (document.getElementById('productGrid')) renderProducts();
});
