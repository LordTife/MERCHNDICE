/* ============================================================
   MERCHNDICE — main.js
   Cart system, navbar scroll, mobile menu, search modal,
   scroll-reveal animations, toast notifications
   ============================================================ */

// ── Cart State ─────────────────────────────────────────────
const CART_KEY = 'merchndice_cart';

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function addToCart(product) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === product.id && i.size === product.size && i.color === product.color);
  if (idx > -1) {
    cart[idx].qty += product.qty || 1;
  } else {
    cart.push({ ...product, qty: product.qty || 1 });
  }
  saveCart(cart);
  showToast(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg> Added to bag — ${product.name}`);
}

function removeFromCart(id, size, color) {
  const cart = getCart().filter(i => !(i.id === id && i.size === size && i.color === color));
  saveCart(cart);
}

function updateQty(id, size, color, delta) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.id === id && i.size === size && i.color === color);
  if (idx > -1) {
    cart[idx].qty = Math.max(1, cart[idx].qty + delta);
    saveCart(cart);
  }
}

function getCartTotal() {
  return getCart().reduce((sum, i) => sum + i.price * i.qty, 0);
}

function getCartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function updateCartBadge() {
  const count = getCartCount();
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = count;
    el.style.display = count > 0 ? 'flex' : 'none';
  });
}

// ── Cart Drawer ─────────────────────────────────────────────
function renderCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (!drawer) return;
  const body = drawer.querySelector('.cart-drawer__body');
  const footer = drawer.querySelector('.cart-drawer__footer');
  const cart = getCart();

  if (cart.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p class="body-sm text-muted">Your bag is empty</p>
        <a href="shop.html" class="btn btn-ghost btn-sm" onclick="closeCart()">Shop Now</a>
      </div>`;
    footer.innerHTML = '';
    return;
  }

  body.innerHTML = cart.map(item => `
    <div class="cart-item">
      ${item.img ? `<img class="cart-item__img" src="${item.img}" alt="${item.name}">` : `<div class="cart-item__img-placeholder">MRCH</div>`}
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__meta">${item.color || ''} ${item.size ? '· ' + item.size : ''}</div>
        <div class="cart-qty">
          <button class="qty-btn" onclick="updateQty('${item.id}','${item.size}','${item.color}',-1)">−</button>
          <span class="qty-num">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}','${item.size}','${item.color}',1)">+</button>
        </div>
      </div>
      <div class="cart-item__actions">
        <button class="cart-remove-btn" onclick="removeFromCart('${item.id}','${item.size}','${item.color}')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
        <div class="cart-item__price">£${(item.price * item.qty).toFixed(2)}</div>
      </div>
    </div>`).join('');

  const total = getCartTotal();
  footer.innerHTML = `
    <div class="cart-subtotal">
      <span class="cart-subtotal-label">Subtotal</span>
      <span class="cart-subtotal-amount">£${total.toFixed(2)}</span>
    </div>
    <p class="body-sm text-muted" style="text-align:center;margin-top:-8px;">Shipping calculated at checkout</p>
    <a href="cart.html" class="btn btn-primary btn-full" onclick="closeCart()">View Bag & Checkout</a>
    <a href="shop.html" class="btn btn-outline btn-full" onclick="closeCart()">Continue Shopping</a>`;
}

function openCart() {
  document.getElementById('cartDrawer')?.classList.add('open');
  document.getElementById('cartOverlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartDrawer')?.classList.remove('open');
  document.getElementById('cartOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Toast ───────────────────────────────────────────────────
function showToast(html, duration = 3000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = html;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('fade-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

// ── Navbar ──────────────────────────────────────────────────
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const announceBar = document.querySelector('.announce-bar');
  if (!navbar) return;

  let lastScroll = 0;
  const announceH = announceBar ? announceBar.offsetHeight : 0;
  navbar.style.top = announceH + 'px';

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) {
      navbar.classList.add('scrolled');
      navbar.style.top = '0';
    } else {
      navbar.classList.remove('scrolled');
      navbar.style.top = announceH + 'px';
    }
    lastScroll = y;
  }, { passive: true });

  // Mark active nav link
  const currentPage = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__nav a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active');
  });
}

// ── Mobile Nav ──────────────────────────────────────────────
function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  mobileNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      hamburger.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Search Modal ────────────────────────────────────────────
function initSearch() {
  const overlay = document.getElementById('searchOverlay');
  const input = document.getElementById('searchInput');
  if (!overlay) return;

  document.querySelectorAll('[data-open-search]').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input?.focus(), 300);
    });
  });

  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeSearch();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
      setTimeout(() => input?.focus(), 300);
    }
  });

  document.querySelectorAll('.search-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      if (input) input.value = tag.textContent;
      input?.focus();
    });
  });
}

function closeSearch() {
  document.getElementById('searchOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Scroll Reveal ───────────────────────────────────────────
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ── Newsletter ──────────────────────────────────────────────
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (!input?.value) return;
    showToast(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg> You're subscribed! Check your inbox.`);
    input.value = '';
  });
}

// ── Wishlist ────────────────────────────────────────────────
function toggleWishlist(btn, productName) {
  btn.classList.toggle('active');
  const isActive = btn.classList.contains('active');
  showToast(isActive
    ? `♥ ${productName} added to wishlist`
    : `♡ ${productName} removed from wishlist`
  );
}

// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileNav();
  initSearch();
  initScrollReveal();
  initNewsletter();
  updateCartBadge();
  renderCartDrawer();

  // Cart drawer toggle
  document.querySelectorAll('[data-open-cart]').forEach(btn => btn.addEventListener('click', openCart));
  document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
  document.getElementById('cartCloseBtn')?.addEventListener('click', closeCart);
});
