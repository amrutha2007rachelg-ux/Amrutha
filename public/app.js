// ═══════════════════════════════════════════════
// Amrutha Saree Collection – Frontend Logic
// ═══════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  // ─── Elements ────────────────────────────────
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelector('.nav-links');
  const productGrid = document.getElementById('productGrid');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const filterBtns = document.querySelectorAll('.filter-btn');

  const cartBtn = document.getElementById('cartBtn');
  const cartBadge = document.getElementById('cartBadge');
  const cartOverlay = document.getElementById('cartOverlay');
  const cartSidebar = document.getElementById('cartSidebar');
  const closeCartBtn = document.getElementById('closeCart');
  const cartItemsContainer = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotalEl = document.getElementById('cartTotal');
  const clearCartBtn = document.getElementById('clearCartBtn');
  const shopNowBtn = document.getElementById('shopNowBtn');
  const checkoutBtn = document.getElementById('checkoutBtn');

  const productModal = document.getElementById('productModal');
  const closeModal = document.getElementById('closeModal');
  const modalImg = document.getElementById('modalImg');
  const modalCategory = document.getElementById('modalCategory');
  const modalName = document.getElementById('modalName');
  const modalDesc = document.getElementById('modalDesc');
  const modalPrice = document.getElementById('modalPrice');
  const modalAddCart = document.getElementById('modalAddCart');

  const toast = document.getElementById('toast');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  // ─── State ───────────────────────────────────
  let allSarees = [];
  let cart = [];
  let currentModalSaree = null;

  // ─── Initialization ──────────────────────────
  init();

  async function init() {
    await fetchSarees();
    await fetchCart();
    setupEventListeners();
  }

  // ─── Data Fetching (Hardcoded for 100% Reliability) ──────────
  async function fetchSarees() {
    allSarees = [
      {
        id: 1, name: 'Royal Kanjivaram Silk', category: 'Silk', price: 12999,
        description: 'Exquisite pure Kanjivaram silk with rich gold zari. A timeless wedding piece.',
        image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80'
      },
      {
        id: 2, name: 'Banarasi Brocade', category: 'Banarasi', price: 9499,
        description: 'Opulent Banarasi brocade woven with intricate floral patterns in gold threads.',
        image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80'
      },
      {
        id: 3, name: 'Chanderi Cotton Silk', category: 'Cotton', price: 3499,
        description: 'Lightweight Chanderi cotton-silk with delicate zari checks, perfect for festivals.',
        image_url: 'https://images.unsplash.com/photo-1617627143233-4df547e5e1c9?w=600&q=80'
      },
      {
        id: 4, name: 'Mysore Crepe Silk', category: 'Silk', price: 7299,
        description: 'Elegant Mysore crepe silk in peacock blue with hand-painted floral motifs.',
        image_url: 'https://images.unsplash.com/photo-1585944285353-5e3f03c1f97b?w=600&q=80'
      },
      {
        id: 5, name: 'Ikkat Pochampally', category: 'Ikkat', price: 4799,
        description: 'Handwoven Pochampally Ikkat with geometric tie-dye patterns from Telangana.',
        image_url: 'https://images.unsplash.com/photo-1614701655600-9c544fdca5a0?w=600&q=80'
      },
      {
        id: 6, name: 'Embroidered Georgette', category: 'Georgette', price: 5999,
        description: 'Stunning georgette with heavy sequin and thread embroidery for evening events.',
        image_url: 'https://images.unsplash.com/photo-1592762696942-8a0d0c4e34c4?w=600&q=80'
      },
      {
        id: 7, name: 'Linen Handloom Saree', category: 'Linen', price: 2799,
        description: 'Breathable linen handloom saree with natural texture and minimalist block-print design.',
        image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80'
      },
      {
        id: 8, name: 'Patola Pure Silk Saree', category: 'Silk', price: 18499,
        description: 'Rare double Patola silk saree from Patan, Gujarat. Features vivid double ikat weave.',
        image_url: 'https://images.unsplash.com/photo-1606218810523-8b531b69aef0?w=600&q=80'
      }
    ];
    
    loadingSpinner.style.display = 'none';
    renderProducts(allSarees);
  }

  async function fetchCart() {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.success) {
        cart = data.data;
        updateCartUI();
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    }
  }

  // ─── Rendering ───────────────────────────────
  function renderProducts(sarees) {
    productGrid.innerHTML = '';
    
    if (sarees.length === 0) {
      productGrid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 40px;">No sarees found in this category.</p>';
      return;
    }

    sarees.forEach((saree, index) => {
      const delay = index * 0.1;
      const card = document.createElement('div');
      card.className = 'product-card';
      card.style.animationDelay = `${delay}s`;
      card.innerHTML = `
        <div class="product-img-wrap">
          <span class="product-badge">${saree.category}</span>
          <img src="${saree.image_url}" alt="${saree.name}" loading="lazy" />
        </div>
        <div class="product-info">
          <h3>${saree.name}</h3>
          <p>${saree.description}</p>
          <div class="product-footer">
            <span class="product-price">${Number(saree.price).toLocaleString('en-IN')}</span>
            <button class="add-cart-btn" data-id="${saree.id}">Add 🛍️</button>
          </div>
        </div>
      `;

      // Open Modal on card click
      card.querySelector('.product-img-wrap').addEventListener('click', () => openModal(saree));
      card.querySelector('h3').addEventListener('click', () => openModal(saree));
      
      // Quick add to cart
      card.querySelector('.add-cart-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(saree.id);
      });

      productGrid.appendChild(card);
    });
  }

  function updateCartUI() {
    // Total Items Badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalItems;
    
    // Animate Badge
    cartBadge.classList.add('bump');
    setTimeout(() => cartBadge.classList.remove('bump'), 300);

    // Cart Sidebar Content
    if (cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="empty-cart">
          <p>🛒</p>
          <p>Your cart is empty</p>
          <button class="btn btn-outline" id="shopNowBtnInside">Shop Now</button>
        </div>
      `;
      cartFooter.style.display = 'none';
      
      document.getElementById('shopNowBtnInside')?.addEventListener('click', () => {
        closeCart();
        window.location.href = '#shop';
      });
      return;
    }

    cartFooter.style.display = 'block';
    let totalValue = 0;
    cartItemsContainer.innerHTML = '';

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      totalValue += itemTotal;
      
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <img src="${item.image_url}" alt="${item.name}" />
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p>Qty: ${item.quantity} × ₹${Number(item.price).toLocaleString('en-IN')}</p>
          <div class="cart-item-price">₹${itemTotal.toLocaleString('en-IN')}</div>
        </div>
        <button class="remove-btn" data-id="${item.cart_id}" title="Remove item">🗑️</button>
      `;
      
      el.querySelector('.remove-btn').addEventListener('click', () => removeFromCart(item.cart_id));
      cartItemsContainer.appendChild(el);
    });

    cartTotalEl.textContent = `₹${totalValue.toLocaleString('en-IN')}`;
  }

  // ─── Actions (Cart) ──────────────────────────
  async function addToCart(sareeId) {
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saree_id: sareeId, quantity: 1 })
      });
      const data = await res.json();
      if (data.success) {
        showToast('✅ Added to cart!');
        await fetchCart(); // Refresh cart data
      }
    } catch (err) {
      console.error('Failed to add to cart:', err);
      showToast('❌ Failed to add item', true);
    }
  }

  async function removeFromCart(cartId) {
    try {
      const res = await fetch(`/api/cart/${cartId}`, { method: 'DELETE' });
      await res.json();
      await fetchCart();
      showToast('🗑️ Item removed');
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  }

  async function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    try {
      await fetch('/api/cart', { method: 'DELETE' });
      await fetchCart();
      showToast('🧹 Cart cleared');
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  }

  // ─── Modal ───────────────────────────────────
  function openModal(saree) {
    currentModalSaree = saree;
    modalImg.src = saree.image_url;
    modalImg.alt = saree.name;
    modalCategory.textContent = saree.category;
    modalName.textContent = saree.name;
    modalDesc.textContent = saree.description;
    modalPrice.textContent = Number(saree.price).toLocaleString('en-IN');
    productModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Stop background scroll
  }

  function closeProductModal() {
    productModal.style.display = 'none';
    currentModalSaree = null;
    document.body.style.overflow = '';
  }

  // ─── Sidebar ─────────────────────────────────
  function openCart() {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ─── Toast ───────────────────────────────────
  let toastTimeout;
  function showToast(msg, isError = false) {
    clearTimeout(toastTimeout);
    toast.textContent = msg;
    toast.style.background = isError ? '#e53e3e' : '#4a0f1c';
    toast.style.color = isError ? '#fff' : '#e8cb80';
    toast.classList.add('show');
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // ─── Event Listeners Setup ───────────────────
  function setupEventListeners() {
    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });

    // Mobile Menu Toggle
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });

    // Filters
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        const filter = e.target.getAttribute('data-filter');
        
        if (filter === 'all') {
          renderProducts(allSarees);
        } else {
          const filtered = allSarees.filter(s => s.category.toLowerCase() === filter.toLowerCase());
          renderProducts(filtered);
        }
      });
    });

    // Cart Overlay & Sidebar
    cartBtn.addEventListener('click', openCart);
    closeCartBtn.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);
    clearCartBtn?.addEventListener('click', clearCart);
    
    shopNowBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      closeCart();
      window.location.href = '#shop';
    });

    checkoutBtn?.addEventListener('click', () => {
      alert('Thank you for shopping! Checkout integration coming soon.');
    });

    // Modal
    closeModal.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) closeProductModal();
    });
    
    modalAddCart.addEventListener('click', () => {
      if (currentModalSaree) {
        addToCart(currentModalSaree.id);
        closeProductModal();
      }
    });

    // Contact Form
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button');
      btn.textContent = 'Sending... ⏳';
      btn.disabled = true;
      
      // Simulate API call
      setTimeout(() => {
        formSuccess.style.display = 'block';
        contactForm.reset();
        btn.textContent = 'Send Message 📩';
        btn.disabled = false;
        
        setTimeout(() => {
          formSuccess.style.display = 'none';
        }, 5000);
      }, 1500);
    });
  }
});
