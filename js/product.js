/* ============================================================
   MERCHNDICE — product.js
   Product detail page: gallery, size/color picker, add to cart
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  // Wait for PRODUCTS from shop.js
  const checkProducts = () => {
    if (!window.PRODUCTS) {
      setTimeout(checkProducts, 50);
      return;
    }
    const product = window.PRODUCTS.find(p => p.id === productId);
    if (!product) {
      document.querySelector('.product-page .container').innerHTML = `
        <div style="text-align:center;padding:120px 0;">
          <p class="display-sm">Product not found</p>
          <a href="shop.html" class="btn btn-primary" style="margin-top:24px;">Back to Shop</a>
        </div>`;
      return;
    }
    renderProductPage(product);
    updateCurrencySelector();
  };
  checkProducts();
});

function renderProductPage(p) {
  // Breadcrumb
  const breadcrumb = document.getElementById('pdpBreadcrumb');
  if (breadcrumb) breadcrumb.innerHTML = `<a href="index.html">Home</a> <span>/</span> <a href="shop.html">Shop</a> <span>/</span> <a href="shop.html">${p.category}</a> <span>/</span> <span>${p.name}</span>`;

  // Title
  const titleEl = document.getElementById('pdpTitle');
  if (titleEl) titleEl.textContent = p.name;

  // Price
  updateProductPrices(p);

  // Gallery main image
  const mainImg = document.getElementById('pdpMainImg');
  const pdpThumbs = document.getElementById('pdpThumbs');
  if (mainImg) {
    if (p.img) {
      mainImg.innerHTML = `<div style="width:100%;height:100%;overflow:hidden;border-radius:var(--radius-xl);"><img src="${p.img}" alt="${p.name}" id="pdpMainImgEl" style="width:100%;height:100%;object-fit:cover;transition:all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94); transform-origin: center;"></div>`;
      
      // Render mock thumbnails
      if (pdpThumbs) {
        const positions = [
          { label: 'Front', style: 'object-position: center; transform: scale(1);' },
          { label: 'Close Up', style: 'object-position: center 20%; transform: scale(1.25);' },
          { label: 'Detail', style: 'object-position: center 80%; transform: scale(1.45);' }
        ];
        pdpThumbs.innerHTML = positions.map((pos, idx) => `
          <div class="gallery-thumb ${idx === 0 ? 'active' : ''}" data-idx="${idx}" onclick="switchGallery(${idx})">
            <img src="${p.img}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover; ${pos.style}">
          </div>
        `).join('');
        
        window.switchGallery = (idx) => {
          document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
          document.querySelector(`.gallery-thumb[data-idx="${idx}"]`)?.classList.add('active');
          const mainImgEl = document.getElementById('pdpMainImgEl');
          if (mainImgEl) {
            mainImgEl.style.objectPosition = positions[idx].style.includes('object-position') 
              ? positions[idx].style.split('object-position:')[1].split(';')[0].trim() 
              : 'center';
            mainImgEl.style.transform = positions[idx].style.includes('transform') 
              ? positions[idx].style.split('transform:')[1].split(';')[0].trim() 
              : 'scale(1)';
          }
        };
      }
    } else {
      mainImg.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1a1a,#252525);font-family:var(--font-display);font-size:2rem;letter-spacing:6px;color:rgba(255,255,255,0.08);">MRCH</div>`;
      if (pdpThumbs) pdpThumbs.innerHTML = '';
    }
  }

  // Sizes
  const sizePicker = document.getElementById('pdpSizes');
  if (sizePicker) {
    sizePicker.innerHTML = p.sizes.map((s, i) =>
      `<button class="size-btn ${i === 1 ? 'selected' : ''}" data-size="${s}" onclick="selectSize(this)">${s}</button>`
    ).join('');
  }

  // Related products
  renderRelated(p);

  // Add to cart handler
  const addBtn = document.getElementById('pdpAddToCart');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const selectedSize = document.querySelector('.size-btn.selected')?.dataset.size || p.sizes[0];
      const selectedColor = document.querySelector('.color-btn.selected')?.dataset.color || p.color;
      addToCart({
        id: p.id,
        name: p.name,
        price: p.price,
        size: selectedSize,
        color: selectedColor,
        img: p.img || ''
      });
    });
  }

  // Accordion
  initAccordions();

  // Listen for currency changes
  window.addEventListener('currencychange', () => updateProductPrices(p));
}

function updateProductPrices(p) {
  const priceEl = document.getElementById('pdpPrice');
  if (priceEl) {
    let html = `<span class="product-info__price">${formatPrice(p.price)}</span>`;
    if (p.originalPrice) {
      html += `<span class="product-info__price-orig">${formatPrice(p.originalPrice)}</span>`;
      html += `<span class="product-info__discount-badge">-${Math.round((1 - p.price / p.originalPrice) * 100)}% OFF</span>`;
    }
    priceEl.innerHTML = html;
  }
}

function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function selectColor(btn) {
  document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
}

function renderRelated(current) {
  const grid = document.getElementById('relatedGrid');
  if (!grid || !window.PRODUCTS) return;
  const related = window.PRODUCTS.filter(p => p.id !== current.id && p.category === current.category).slice(0, 4);
  if (related.length === 0) return;
  grid.innerHTML = related.map(p => productCardHTML(p)).join('');
}

function initAccordions() {
  document.querySelectorAll('.accordion-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
}
