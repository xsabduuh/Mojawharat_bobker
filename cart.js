// ================================
// L'ÉCLAT - cart.js
// ================================

// ===== السلة =====
var cartItems = JSON.parse(localStorage.getItem('leclat_cart')) || [];

function saveCart() {
  localStorage.setItem('leclat_cart', JSON.stringify(cartItems));
}

function updateCartCount() {
  var count = cartItems.reduce(function(a, i) { return a + i.quantity; }, 0);
  var el = document.getElementById('cartCount');
  if (el) el.textContent = count;
}

function updateCartTotal() {
  var total = cartItems.reduce(function(a, i) { return a + i.price * i.quantity; }, 0);
  var el = document.getElementById('cartTotal');
  if (el) el.textContent = '$' + total.toLocaleString();
}

function renderCartItems() {
  var container = document.getElementById('cartItems');
  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-secondary)"><i class="fas fa-shopping-bag" style="font-size:3rem;display:block;margin-bottom:15px;opacity:0.3"></i>السلة فارغة</div>';
    return;
  }

  var html = '';
  cartItems.forEach(function(item) {
    html += '<div class="cart-item">';
    html += '<img src="' + item.image + '" alt="' + item.name + '" class="cart-item-img">';
    html += '<div class="cart-item-details">';
    html += '<div class="cart-item-title">' + item.name + '</div>';
    html += '<div class="cart-item-price">$' + item.price.toLocaleString() + '</div>';
    html += '<div class="cart-item-quantity">';
    html += '<button class="quantity-btn" data-action="minus" data-id="' + item.id + '">-</button>';
    html += '<span>' + item.quantity + '</span>';
    html += '<button class="quantity-btn" data-action="plus" data-id="' + item.id + '">+</button>';
    html += '</div>';
    html += '<div class="remove-item" data-id="' + item.id + '">إزالة</div>';
    html += '</div></div>';
  });
  container.innerHTML = html;

  // أحداث الكميات
  container.querySelectorAll('.quantity-btn').forEach(function(btn) {
    btn.onclick = function() {
      var id = this.getAttribute('data-id');
      var action = this.getAttribute('data-action');
      var item = cartItems.find(function(i) { return i.id === id; });
      if (!item) return;
      if (action === 'plus') {
        item.quantity += 1;
      } else {
        item.quantity -= 1;
        if (item.quantity < 1) {
          cartItems = cartItems.filter(function(i) { return i.id !== id; });
        }
      }
      saveCart();
      updateCartCount();
      renderCartItems();
      updateCartTotal();
    };
  });

  // أحداث الإزالة
  container.querySelectorAll('.remove-item').forEach(function(btn) {
    btn.onclick = function() {
      var id = this.getAttribute('data-id');
      cartItems = cartItems.filter(function(i) { return i.id !== id; });
      saveCart();
      updateCartCount();
      renderCartItems();
      updateCartTotal();
    };
  });
}

function addToCart(id, name, price, image) {
  var existing = cartItems.find(function(i) { return i.id === id; });
  if (existing) {
    existing.quantity += 1;
  } else {
    cartItems.push({ id: id, name: name, price: price, image: image, quantity: 1 });
  }
  saveCart();
  updateCartCount();
  renderCartItems();
  updateCartTotal();
  openCart();
  showNotification('تمت إضافة المنتج إلى السلة ✓');
}

function openCart() {
  var sidebar = document.getElementById('cartSidebar');
  var overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.add('open');
  if (overlay) overlay.classList.add('show');
}

function closeCart() {
  var sidebar = document.getElementById('cartSidebar');
  var overlay = document.getElementById('overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
}

function showNotification(message) {
  var old = document.getElementById('leclat-notif');
  if (old) old.remove();
  var n = document.createElement('div');
  n.id = 'leclat-notif';
  n.textContent = message;
  n.style.cssText = 'position:fixed;top:90px;left:50%;transform:translateX(-50%);background:var(--accent);color:#000;padding:12px 28px;border-radius:50px;font-weight:600;z-index:9999;font-size:0.95rem;box-shadow:0 10px 30px rgba(0,0,0,0.3);';
  document.body.appendChild(n);
  setTimeout(function() { if (n.parentNode) n.remove(); }, 3000);
}

// ===== البحث =====
function initSearch() {
  var searchBtn = document.getElementById('searchBtn');
  var modal = document.getElementById('searchModal');
  var closeBtn = document.getElementById('closeSearch');
  var input = document.getElementById('searchInput');
  var suggestions = document.getElementById('searchSuggestions');

  if (!searchBtn || !modal) return;

  searchBtn.onclick = function() {
    modal.classList.add('show');
    if (input) input.focus();
  };

  if (closeBtn) {
    closeBtn.onclick = function() {
      modal.classList.remove('show');
    };
  }

  if (modal) {
    modal.onclick = function(e) {
      if (e.target === modal) modal.classList.remove('show');
    };
  }

  if (input && suggestions) {
    input.oninput = function() {
      var query = this.value.toLowerCase().trim();
      if (!query) { suggestions.innerHTML = ''; return; }

      var products = [];
      document.querySelectorAll('.product-card').forEach(function(card) {
        var nameEl = card.querySelector('.product-name');
        var catEl = card.querySelector('.product-category');
        var priceEl = card.querySelector('.product-price');
        if (nameEl) {
          products.push({
            name: nameEl.textContent,
            category: catEl ? catEl.textContent : '',
            price: priceEl ? priceEl.textContent : ''
          });
        }
      });

      var filtered = products.filter(function(p) {
        return p.name.toLowerCase().includes(query) || p.category.toLowerCase().includes(query);
      }).slice(0, 5);

      if (filtered.length === 0) {
        suggestions.innerHTML = '<li style="color:var(--text-secondary);padding:12px 20px;">لا توجد نتائج</li>';
        return;
      }

      var html = '';
      filtered.forEach(function(p) {
        html += '<li>' + p.name + ' - ' + p.price + '</li>';
      });
      suggestions.innerHTML = html;
    };
  }
}

// ===== الثيم =====
function initTheme() {
  var btn = document.getElementById('themeToggle');
  if (!btn) return;

  var saved = localStorage.getItem('leclat_theme') || 'dark-mode';
  document.body.className = document.body.className.replace(/dark-mode|light-mode/g, '').trim();
  document.body.classList.add(saved);
  btn.innerHTML = saved === 'dark-mode' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

  btn.onclick = function() {
    if (document.body.classList.contains('dark-mode')) {
      document.body.classList.replace('dark-mode', 'light-mode');
      localStorage.setItem('leclat_theme', 'light-mode');
      btn.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
      document.body.classList.replace('light-mode', 'dark-mode');
      localStorage.setItem('leclat_theme', 'dark-mode');
      btn.innerHTML = '<i class="fas fa-sun"></i>';
    }
  };
}

// ===== اللغة =====
function initLanguage() {
  var btn = document.getElementById('languageBtn');
  var dropdown = document.getElementById('languageDropdown');
  if (!btn || !dropdown) return;

  btn.onclick = function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  };

  document.onclick = function() {
    dropdown.classList.remove('show');
  };

  dropdown.querySelectorAll('a').forEach(function(a) {
    a.onclick = function(e) {
      e.preventDefault();
      var lang = this.getAttribute('data-lang');
      var langEl = document.getElementById('current-lang');
      if (langEl) langEl.textContent = lang.toUpperCase();
      if (lang === 'en') {
        document.body.classList.add('ltr');
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
      } else {
        document.body.classList.remove('ltr');
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', lang);
      }
      dropdown.classList.remove('show');
    };
  });
}

// ===== زر العودة للأعلى =====
function initBackToTop() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;

  window.onscroll = function() {
    if (window.scrollY > 300) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  };

  btn.onclick = function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
}

// ===== أزرار إضافة للسلة =====
function initAddToCart() {
  document.querySelectorAll('.add-to-cart').forEach(function(btn) {
    btn.onclick = function(e) {
      e.preventDefault();
      var card = btn.closest('.product-card');
      if (!card) return;
      var id = card.getAttribute('data-id') || ('p' + Date.now());
      var name = card.getAttribute('data-name') || (card.querySelector('.product-name') ? card.querySelector('.product-name').textContent : 'منتج');
      var price = parseFloat(card.getAttribute('data-price')) || 0;
      var imgEl = card.querySelector('.product-image img');
      var image = imgEl ? imgEl.src : '';
      addToCart(id, name, price, image);
    };
  });
}

// ===== أحداث السلة =====
function initCartEvents() {
  var cartBtn = document.getElementById('cartBtn');
  if (cartBtn) {
    cartBtn.onclick = function(e) {
      e.preventDefault();
      openCart();
    };
  }

  var closeCartBtn = document.getElementById('closeCart');
  if (closeCartBtn) {
    closeCartBtn.onclick = function() { closeCart(); };
  }

  var overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.onclick = function() {
      closeCart();
      var modal = document.getElementById('searchModal');
      if (modal) modal.classList.remove('show');
    };
  }
}

// ===== تشغيل كل شيء =====
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  renderCartItems();
  updateCartTotal();
  initCartEvents();
  initAddToCart();
  initSearch();
  initTheme();
  initLanguage();
  initBackToTop();
});