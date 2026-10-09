// --- Global State ---
let cart = [];
let currentTable = "1";

// --- Food Menu Items Database ---
const menuData = {
    Breakfast: [
        { id: "b1", title: "Full English Breakfast", price: 650, icon: "🍳", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=600&q=80", description: "Eggs, sausage, bacon, baked beans, toast, and grilled tomato." },
        { id: "b2", title: "Avocado Toast", price: 450, icon: "🥑", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80", description: "Smashed avocado on sourdough with a poached egg and chili flakes." },
        { id: "b3", title: "Stack of Pancakes", price: 500, icon: "🥞", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80", description: "Three fluffy pancakes with maple syrup and mixed berries." },
        { id: "b4", title: "Continental Breakfast", price: 550, icon: "☕", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80", description: "Assortment of pastries, fruit, and yogurt." }
    ],
    "Main Meals": [
        { id: "m1", title: "Ugali Beef", price: 400, icon: "🍛", image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80", description: "Traditional cornmeal staple served with rich beef stew and greens." },
        { id: "m2", title: "Chicken", price: 450, icon: "🍗", image: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?auto=format&fit=crop&w=600&q=80", description: "Tender, well-seasoned stewed chicken served with delicious gravy." },
        { id: "m3", title: "Pilau", price: 350, icon: "🍚", image: "https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=600&q=80", description: "Fragrant spiced rice cooked with beef broth and Swahili spices." }
    ],
    Grills: [
        { id: "g1", title: "Nyama Choma", price: 800, icon: "🔥", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", description: "Flame-grilled roasted meat seasoned simply to perfection." },
        { id: "g2", title: "Grilled Chicken", price: 700, icon: "🍗", image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80", description: "Char-grilled chicken marinated in flavorful herbs and spices." }
    ],
    Snacks: [
        { id: "s1", title: "Chips", price: 150, icon: "🍟", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80", description: "Golden, crispy french fries lightly salted and cooked fresh." },
        { id: "s2", title: "Samosa", price: 100, icon: "🥟", image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", description: "Crispy triangular pastry stuffed with spicy minced meat." }
    ],
    Sides: [
        { id: "sd1", title: "Sukuma", price: 80, icon: "🥬", image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80", description: "Freshly sauteed collard greens cooked with onions." },
        { id: "sd2", title: "Cabbage", price: 80, icon: "🥗", image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80", description: "Lightly spiced and pan-fried shredded cabbage." },
        { id: "sd3", title: "Kachumbari", price: 100, icon: "🍅", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80", description: "Fresh salad of diced tomatoes, onions, cilantro, and chili." }
    ],
    Drinks: [
        { id: "d1", title: "Tea", price: 100, icon: "☕", image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80", description: "Hot brewed tea served plain or with steamed milk." },
        { id: "d2", title: "Coffee", price: 150, icon: "☕", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80", description: "Richly roasted hot coffee served to energize your day." },
        { id: "d3", title: "Mango Juice", price: 150, icon: "🥭", image: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80", description: "Freshly blended sweet mango juice served chilled." },
        { id: "d4", title: "Passion Juice", price: 150, icon: "🥤", image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80", description: "Tangy and refreshing fresh passion fruit juice." }
    ],
    Desserts: [
        { id: "ds1", title: "Chocolate Cake", price: 300, icon: "🍰", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80", description: "Rich chocolate sponge cake layered with dark chocolate ganache." },
        { id: "ds2", title: "Vanilla Cake", price: 250, icon: "🎂", image: "https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=600&q=80", description: "Vanilla sponge cake topped with vanilla buttercream." },
        { id: "ds3", title: "Ice Cream", price: 200, icon: "🍨", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80", description: "Scoops of rich ice cream in your choice of flavors." }
    ]
};

// --- Utility Functions ---
function handleImageFallback(imgEl) {
    if (!imgEl || imgEl.dataset.fallbackApplied) return;
    imgEl.dataset.fallbackApplied = "true";
    const title = imgEl.getAttribute('data-title') || imgEl.getAttribute('alt') || 'Food item';
    const icon = imgEl.getAttribute('data-icon') || '🍽️';
    const placeholder = document.createElement('div');
    placeholder.className = 'food-image-placeholder';
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', `${title} (image placeholder)`);
    placeholder.innerHTML = `<span class="placeholder-icon" aria-hidden="true">${icon}</span><span class="placeholder-text">Photo coming soon</span>`;
    if (imgEl.parentNode) imgEl.parentNode.replaceChild(placeholder, imgEl);
}

function escapeHtmlAttr(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 1. Read Table Number from URL
function initTableNumber() {
    const urlParams = new URLSearchParams(window.location.search);
    const tableParam = urlParams.get('table');
    if (tableParam) currentTable = tableParam;
    const tableEl = document.getElementById('table-number');
    if (tableEl) tableEl.innerText = currentTable;
    const footerTableEl = document.getElementById('footer-table-num');
    if (footerTableEl) footerTableEl.innerText = currentTable;
}

// 2. Category Switcher
function showCategory(category) {
    const titleEl = document.getElementById('category-title');
    if (titleEl) titleEl.innerText = category === 'All' ? 'Our Menu' : 'Our ' + category;
    const tabs = document.querySelectorAll('.nav-menu .nav-link');
    tabs.forEach(tab => {
        const matches = tab.innerText.trim().toLowerCase() === category.toLowerCase();
        tab.classList.toggle('active', matches);
        tab.setAttribute('aria-selected', matches ? 'true' : 'false');
        tab.setAttribute('tabindex', matches ? '0' : '-1');
    });
    renderFoodGrid(category);
}

function setupCategoryKeyboardNav() {
    const navMenu = document.querySelector('.nav-menu');
    if (!navMenu) return;
    navMenu.addEventListener('keydown', (e) => {
        const tabs = Array.from(navMenu.querySelectorAll('.nav-link'));
        const activeIndex = tabs.indexOf(document.activeElement);
        if (activeIndex === -1) return;
        let nextIndex = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIndex = (activeIndex + 1) % tabs.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIndex = (activeIndex - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') nextIndex = 0;
        else if (e.key === 'End') nextIndex = tabs.length - 1;
        if (nextIndex !== null) {
            e.preventDefault();
            tabs[nextIndex].focus();
            tabs[nextIndex].click();
        }
    });
}

// 3. Render Food Cards Grid
function renderFoodGrid(category) {
    const container = document.getElementById('food-container');
    if (!container) return;
    container.innerHTML = '';
    const categoriesToRender = category === 'All' ? Object.keys(menuData) : [category];
    let hasAnyItems = false;
    categoriesToRender.forEach(catName => {
        const items = menuData[catName] || [];
        if (!items.length) return;
        hasAnyItems = true;
        if (category === 'All') {
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'category-section-header';
            sectionHeader.innerHTML = `<h3 class="category-block-title">${escapeHtmlAttr(catName)}</h3>`;
            container.appendChild(sectionHeader);
        }
        const gridEl = document.createElement('div');
        gridEl.className = 'food-grid';
        items.forEach(item => {
            const cartItem = cart.find(i => i.id === item.id);
            const qty = cartItem ? cartItem.quantity : 0;
            const titleSafe = escapeHtmlAttr(item.title);
            const iconSafe = escapeHtmlAttr(item.icon);
            const card = document.createElement('article');
            card.className = 'food-card';
            card.setAttribute('data-item-id', item.id);
            const imageHtml = item.image
                ? `<img src="${escapeHtmlAttr(item.image)}" alt="${titleSafe}" class="food-image" loading="lazy" data-icon="${iconSafe}" data-title="${titleSafe}" onerror="handleImageFallback(this)">`
                : `<div class="food-image-placeholder" role="img" aria-label="${titleSafe} (image placeholder)"><span class="placeholder-icon" aria-hidden="true">${iconSafe}</span><span class="placeholder-text">Photo coming soon</span></div>`;
            card.innerHTML = `
                <div class="card-content">
                    <div class="card-header"><h3 class="card-title">${titleSafe}</h3><div class="icon-circle" aria-hidden="true">${iconSafe}</div></div>
                    ${imageHtml}
                    <p class="food-description">${escapeHtmlAttr(item.description)}</p>
                </div>
                <div class="card-bottom">
                    <span class="item-price">KSh ${item.price}</span>
                    <div class="quantity-controls" role="group" aria-label="${titleSafe} quantity">
                        <button type="button" class="qty-btn minus-btn" onclick="updateItemQty('${item.id}', -1)" aria-label="Decrease quantity of ${titleSafe}">−</button>
                        <span class="qty-count" aria-live="polite" aria-atomic="true" aria-label="${qty} in order">${qty}</span>
                        <button type="button" class="qty-btn plus-btn" onclick="updateItemQty('${item.id}', 1)" aria-label="Increase quantity of ${titleSafe}">+</button>
                    </div>
                </div>`;
            gridEl.appendChild(card);
        });
        container.appendChild(gridEl);
    });
    if (!hasAnyItems) container.innerHTML = "<p class='empty-cart-text'>No items available in this category.</p>";
}

// 4. Quantity Adjuster
function updateItemQty(itemId, change) {
    let itemData = null;
    for (const cat in menuData) {
        const found = menuData[cat].find(i => i.id === itemId);
        if (found) { itemData = found; break; }
    }
    if (!itemData) return;
    const existingIndex = cart.findIndex(i => i.id === itemId);
    let newQty = 0;
    if (existingIndex > -1) {
        cart[existingIndex].quantity += change;
        newQty = cart[existingIndex].quantity;
        if (newQty <= 0) { cart.splice(existingIndex, 1); newQty = 0; }
    } else if (change > 0) {
        cart.push({ ...itemData, quantity: 1 });
        newQty = 1;
    }
    document.querySelectorAll(`[data-item-id="${itemId}"] .qty-count`).forEach(el => {
        el.innerText = newQty;
        el.setAttribute('aria-label', `${newQty} in order`);
    });
    renderCart();
}

function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    document.querySelectorAll(`[data-item-id="${itemId}"] .qty-count`).forEach(el => {
        el.innerText = 0;
        el.setAttribute('aria-label', '0 in order');
    });
    renderCart();
}

function getActiveCategory() {
    const activeTab = document.querySelector('.nav-menu .nav-link.active');
    return activeTab ? activeTab.innerText.trim() : 'All';
}

// 5. Render Cart Sidebar & Totals
function renderCart() {
    const cartContainer = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('cart-subtotal');
    const totalEl = document.getElementById('cart-total');
    const submitBtn = document.getElementById('submit-btn');
    const mobileBar = document.getElementById('mobile-cart-bar');
    const mobileCount = document.getElementById('mobile-cart-count');
    const mobileTotal = document.getElementById('mobile-cart-total');
    if (!cartContainer || !subtotalEl || !totalEl || !submitBtn) return;
    if (!cart.length) {
        cartContainer.innerHTML = `<p class="empty-cart-text">Your cart is currently empty.</p>`;
        subtotalEl.innerText = totalEl.innerText = 'KSh 0';
        submitBtn.disabled = true;
        if (mobileBar) { mobileBar.classList.add('hidden'); mobileBar.setAttribute('aria-hidden', 'true'); mobileBar.setAttribute('tabindex', '-1'); }
        return;
    }
    cartContainer.innerHTML = '';
    let total = 0, totalItems = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        totalItems += item.quantity;
        const titleSafe = escapeHtmlAttr(item.title);
        cartContainer.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-info"><h4>${titleSafe}</h4><span>KSh ${item.price} &times; ${item.quantity}</span></div>
                <div class="cart-item-right"><strong>KSh ${itemTotal}</strong><button type="button" class="remove-btn" onclick="removeFromCart('${item.id}')" aria-label="Remove ${titleSafe} from cart">&times;</button></div>
            </div>`;
    });
    subtotalEl.innerText = totalEl.innerText = `KSh ${total}`;
    submitBtn.disabled = false;
    if (mobileBar) {
        mobileBar.classList.remove('hidden');
        mobileBar.setAttribute('aria-hidden', 'false');
        mobileBar.setAttribute('tabindex', '0');
        mobileBar.setAttribute('aria-label', `View order: ${totalItems} item${totalItems > 1 ? 's' : ''}, subtotal KSh ${total}. Click to proceed to checkout.`);
        if (mobileCount) mobileCount.innerText = `${totalItems} item${totalItems > 1 ? 's' : ''}`;
        if (mobileTotal) mobileTotal.innerText = `KSh ${total} →`;
    }
}

function showOrderStatus(state, headline, message) {
    const banner = document.getElementById('order-status-banner');
    const headlineEl = document.getElementById('status-headline');
    const messageEl = document.getElementById('status-subtext');
    const iconEl = document.getElementById('status-icon');
    if (!banner) return;
    banner.classList.remove('hidden', 'status-pending', 'status-success', 'status-error');
    banner.classList.add(`status-${state}`);
    headlineEl.innerText = headline;
    messageEl.innerText = message;
    iconEl.innerText = state === 'success' ? '✅' : state === 'error' ? '⚠️' : '📲';
}

function normalizeKenyanPhone(phone) {
    const digits = phone.replace(/[\s+()-]/g, '');
    if (/^0[71]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
    if (/^254[71]\d{8}$/.test(digits)) return digits;
    throw new Error('Enter a valid Kenyan mobile number, e.g. 0712345678 or 254712345678.');
}

function scrollToOrder(event) {
    if (event) event.preventDefault();
    const checkoutEl = document.getElementById('checkout-form');
    if (checkoutEl) {
        checkoutEl.scrollIntoView({ behavior: 'smooth' });
        const nameInput = document.getElementById('customer-name');
        if (nameInput) setTimeout(() => nameInput.focus(), 350);
    }
}

// 6. Submit order and request a real Safaricom Daraja STK Push from the backend
async function handleCheckout(event) {
    event.preventDefault();
    const name = document.getElementById('customer-name').value.trim();
    const phoneInput = document.getElementById('customer-phone');
    const phone = phoneInput.value.trim();
    const notes = document.getElementById('order-notes').value.trim();
    const submitBtn = document.getElementById('submit-btn');

    if (!name || !phone) {
        showOrderStatus('error', 'Missing details', 'Enter your name and M-Pesa phone number.');
        return;
    }
    if (!cart.length) {
        showOrderStatus('error', 'Your cart is empty', 'Add at least one menu item before checkout.');
        return;
    }
    let formattedPhone;
    try {
        formattedPhone = normalizeKenyanPhone(phone);
    } catch (err) {
        phoneInput.setCustomValidity(err.message);
        phoneInput.reportValidity();
        return;
    }
    phoneInput.setCustomValidity('');

    submitBtn.disabled = true;
    submitBtn.innerText = 'Sending M-Pesa Prompt...';
    showOrderStatus('pending', 'Sending M-Pesa prompt...', 'Keep your phone nearby and enter your M-Pesa PIN when prompted.');

    const orderData = {
        tableNumber: currentTable,
        customerName: name,
        phoneNumber: formattedPhone,
        notes,
        items: cart.map(item => ({ id: item.id, title: item.title, price: item.price, quantity: item.quantity })),
        totalAmount: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
    };

    try {
        const response = await fetch('/api/orders/stkpush', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.message || 'Could not start M-Pesa payment.');

        showOrderStatus('pending', 'Payment request sent', `Check ${formattedPhone} and enter your M-Pesa PIN. Order ${result.orderId}.`);
        pollOrderStatus(result.orderId);
    } catch (err) {
        showOrderStatus('error', 'Payment request failed', err.message || 'Check your connection and try again.');
        submitBtn.disabled = false;
        submitBtn.innerText = 'Pay with M-Pesa & Place Order';
    }
}

async function pollOrderStatus(orderId) {
    const submitBtn = document.getElementById('submit-btn');
    const deadline = Date.now() + 120000;
    const interval = setInterval(async () => {
        try {
            const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
            const result = await response.json();
            if (!response.ok || !result.order) return;
            const order = result.order;
            if (order.status === 'Paid') {
                clearInterval(interval);
                showOrderStatus('success', 'Payment confirmed!', `Order ${order.id} is sent to the kitchen. Thank you!`);
                cart = [];
                document.getElementById('checkout-form').reset();
                renderFoodGrid(getActiveCategory());
                renderCart();
                submitBtn.disabled = true;
                submitBtn.innerText = 'Pay with M-Pesa & Place Order';
            } else if (order.status === 'Payment Failed' || order.status === 'Cancelled') {
                clearInterval(interval);
                showOrderStatus('error', 'Payment not completed', order.paymentMessage || 'No payment was received. Check your phone and try again.');
                submitBtn.disabled = false;
                submitBtn.innerText = 'Pay with M-Pesa & Place Order';
            }
        } catch (err) {
            console.error('Could not check payment status:', err);
        }
        if (Date.now() > deadline) {
            clearInterval(interval);
            showOrderStatus('pending', 'Still waiting for payment', 'If you entered your PIN, please allow a moment for confirmation.');
            submitBtn.disabled = false;
            submitBtn.innerText = 'Check Payment / Try Again';
        }
    }, 3000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initTableNumber();
    setupCategoryKeyboardNav();
    showCategory('All');
    const mobileBar = document.getElementById('mobile-cart-bar');
    if (mobileBar) {
        mobileBar.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                scrollToOrder();
            }
        });
    }
});
