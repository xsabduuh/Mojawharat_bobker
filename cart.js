// cart.js

// ========================
// نظام السلة المتطور
// ========================

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.total = 0;
        this.updateCartCount();
        this.renderCartItems();
        this.updateCartTotal();
        this.initEventListeners();
    }

    // إضافة منتج
    addItem(id, name, price, image) {
        const existingItem = this.items.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: id,
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
        }
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        this.updateCartTotal();
        this.showNotification('تمت إضافة المنتج إلى السلة');
    }

    // إزالة منتج
    removeItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveCart();
        this.updateCartCount();
        this.renderCartItems();
        this.updateCartTotal();
    }

    // تحديث الكمية
    updateQuantity(id, newQuantity) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.quantity = Math.max(1, newQuantity);
            this.saveCart();
            this.renderCartItems();
            this.updateCartTotal();
        }
    }

    // حفظ في localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // تحديث عداد السلة
    updateCartCount() {
        const count = this.items.reduce((acc, item) => acc + item.quantity, 0);
        document.getElementById('cartCount').textContent = count;
    }

    // حساب المجموع
    calculateTotal() {
        return this.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    }

    // تحديث إجمالي السعر
    updateCartTotal() {
        this.total = this.calculateTotal();
        const totalElement = document.getElementById('cartTotal');
        if (totalElement) {
            totalElement.textContent = `$${this.total.toLocaleString()}`;
        }
    }

    // عرض عناصر السلة في الواجهة
    renderCartItems() {
        const container = document.getElementById('cartItems');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-secondary);">السلة فارغة</div>';
            return;
        }

        let html = '';
        this.items.forEach(item => {
            html += `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.name}</div>
                        <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <div class="remove-item" data-id="${item.id}">إزالة</div>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
        this.attachQuantityEvents();
        this.attachRemoveEvents();
    }

    // إضافة أحداث الكميات
    attachQuantityEvents() {
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const item = this.items.find(i => i.id === id);
                if (item && item.quantity > 1) {
                    this.updateQuantity(id, item.quantity - 1);
                } else {
                    // إذا كانت الكمية 1 وإزالة؟ يمكن تركها أو إزالة حسب الرغبة
                    // هنا سنزيل المنتج
                    this.removeItem(id);
                }
            });
        });

        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                const item = this.items.find(i => i.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity + 1);
                }
            });
        });
    }

    attachRemoveEvents() {
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.id;
                this.removeItem(id);
            });
        });
    }

    // إشعار مؤقت
    showNotification(message) {
        // إنشاء عنصر إشعار بسيط
        const notification = document.createElement('div');
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.left = '50%';
        notification.style.transform = 'translateX(-50%)';
        notification.style.backgroundColor = 'var(--accent)';
        notification.style.color = '#000';
        notification.style.padding = '12px 24px';
        notification.style.borderRadius = '50px';
        notification.style.fontWeight = '600';
        notification.style.zIndex = '1000';
        notification.style.boxShadow = 'var(--shadow)';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }

    // فتح/غلق السلة
    toggleCart() {
        const sidebar = document.getElementById('cartSidebar');
        sidebar.classList.toggle('open');
    }

    // تهيئة الأحداث العامة
    initEventListeners() {
        // زر فتح السلة
        document.getElementById('cartBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleCart();
        });

        // زر غلق السلة
        document.getElementById('closeCart').addEventListener('click', () => {
            document.getElementById('cartSidebar').classList.remove('open');
        });

        // إضافة منتج عبر الأزرار
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const card = btn.closest('.product-card');
                const id = card.dataset.id;
                const name = card.dataset.name || card.querySelector('.product-name').textContent;
                const price = parseFloat(card.dataset.price || card.querySelector('.product-price').textContent.replace(/[$,]/g, ''));
                const image = card.querySelector('.product-image img').src;
                this.addItem(id, name, price, image);
            });
        });
    }
}

// ========================
// نظام البحث الذكي
// ========================

class SearchSystem {
    constructor() {
        this.products = [];
        this.collectProducts();
        this.initSearchModal();
    }

    // جمع بيانات المنتجات من الصفحة
    collectProducts() {
        document.querySelectorAll('.product-card').forEach(card => {
            this.products.push({
                id: card.dataset.id,
                name: card.querySelector('.product-name').textContent,
                category: card.querySelector('.product-category').textContent,
                price: card.querySelector('.product-price').textContent,
                image: card.querySelector('.product-image img').src,
                link: '#' // يمكن ربط بصفحة المنتج
            });
        });
    }

    initSearchModal() {
        const searchBtn = document.getElementById('searchBtn');
        const modal = document.getElementById('searchModal');
        const closeBtn = document.getElementById('closeSearch');
        const input = document.getElementById('searchInput');
        const suggestions = document.getElementById('searchSuggestions');

        searchBtn.addEventListener('click', () => {
            modal.classList.add('show');
            input.focus();
        });

        closeBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });

        input.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.showSuggestions(query);
        });

        // غلق المودال عند الضغط خارج المحتوى
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    }

    showSuggestions(query) {
        const suggestions = document.getElementById('searchSuggestions');
        if (!query) {
            suggestions.innerHTML = '';
            return;
        }

        const filtered = this.products.filter(p => 
            p.name.toLowerCase().includes(query) || 
            p.category.toLowerCase().includes(query)
        ).slice(0, 5); // أقصى 5 اقتراحات

        let html = '';
        filtered.forEach(p => {
            html += `<li onclick="window.location.href='${p.link}'">${p.name} - ${p.price}</li>`;
        });

        if (filtered.length === 0) {
            html = '<li style="color: var(--text-secondary);">لا توجد نتائج</li>';
        }
        suggestions.innerHTML = html;
    }
}

// ========================
// تشغيل كل الأنظمة
// ========================
document.addEventListener('DOMContentLoaded', () => {
    window.cart = new ShoppingCart();
    window.search = new SearchSystem();
});