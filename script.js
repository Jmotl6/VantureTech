// Minimal modal helpers (focus trap, open/close)
document.addEventListener('DOMContentLoaded', () => {
  function trapFocus(modal){
    if(!modal) return;
    const focusable = modal.querySelectorAll('a[href],button,textarea,input,select,[tabindex]:not([tabindex="-1"])');
    if(!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length-1];
    modal._trapHandler = function(e){ if(e.key === 'Tab'){ if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); } }};
    modal.addEventListener('keydown', modal._trapHandler);
    setTimeout(()=>{ try{ first.focus(); }catch(e){} },10);
  }
  function releaseTrap(modal){ if(modal && modal._trapHandler){ modal.removeEventListener('keydown', modal._trapHandler); delete modal._trapHandler; }}

  window.openModal = function(modal){ if(!modal) return; modal._previousFocus = document.activeElement; if(modal.parentNode !== document.body) document.body.appendChild(modal); document.body.classList.add('modal-open'); modal.setAttribute('aria-hidden','false'); trapFocus(modal); };
  window.closeModal = function(modal){ if(!modal) return; releaseTrap(modal); modal.setAttribute('aria-hidden','true'); document.body.classList.remove('modal-open'); if(modal._previousFocus && modal._previousFocus.focus) modal._previousFocus.focus(); };

  // V2 Menu & Cart (self-contained)
  (function(){
    const MENU_V2_ITEMS = [
      { id: 'm1', name: 'Classic Burger', desc: 'Beef patty, cheddar, lettuce, tomato', price: 9.5 },
      { id: 'm2', name: 'Veggie Bowl', desc: 'Seasonal veg, grains, tahini', price: 8.25 },
      { id: 'm3', name: 'Street Tacos (2)', desc: 'Choice of protein, cilantro, onion', price: 7.0 },
      { id: 'm4', name: 'Iced Latte', desc: 'Double shot, milk of choice', price: 4.25 }
    ];
    const TAX = 0.08;
    const CART = { items: [], nextId:1 };

    const menuV2 = document.getElementById('menuV2');
    const menuV2Items = document.getElementById('menuV2Items');
    const menuV2Close = document.getElementById('menuV2Close');
    const openMenuBtn = document.getElementById('openMenuBtn');

    const itemModalV2 = document.getElementById('itemModalV2');
    const itemV2Form = document.getElementById('itemV2Form');
    const itemV2Title = document.getElementById('itemV2Title');
    const itemV2Options = document.getElementById('itemV2Options');

    const cartV2Items = document.getElementById('cartV2Items');
    const cartV2Subtotal = document.getElementById('cartV2Subtotal');
    const cartV2Tax = document.getElementById('cartV2Tax');
    const cartV2Total = document.getElementById('cartV2Total');
    const cartV2OpenPanel = document.getElementById('cartV2OpenPanel');

    const cartPanelV2 = document.getElementById('cartPanelV2');
    const cartPanelV2Close = document.getElementById('cartPanelV2Close');
    const cartPanelV2Items = document.getElementById('cartPanelV2Items');
    const cartPanelV2Subtotal = document.getElementById('cartPanelV2Subtotal');
    const cartPanelV2Tax = document.getElementById('cartPanelV2Tax');
    const cartPanelV2Total = document.getElementById('cartPanelV2Total');
    const cartPanelV2Checkout = document.getElementById('cartPanelV2Checkout');
    const cartPanelV2Clear = document.getElementById('cartPanelV2Clear');

    function fmt(n){ return '$' + Number(n||0).toFixed(2); }

    function renderMenu(){ if(!menuV2Items) return; menuV2Items.innerHTML=''; MENU_V2_ITEMS.forEach(it=>{ const c = document.createElement('div'); c.className='menu-card'; c.innerHTML = `<div class="title">${it.name}</div><div class="desc">${it.desc}</div><div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center"><div class="price">${fmt(it.price)}</div><button class="btn add-v2" data-id="${it.id}">Customize</button></div>`; menuV2Items.appendChild(c); }); menuV2Items.querySelectorAll('.add-v2').forEach(b=>b.addEventListener('click', ()=> openItem(b.getAttribute('data-id')))); }

    let _editing=null;
    function openItem(id){ _editing = MENU_V2_ITEMS.find(x=>x.id===id); if(!_editing) return; itemV2Title.textContent = _editing.name; itemV2Options.innerHTML = `<div style="margin-bottom:.6rem">${_editing.desc}</div><label>Qty <input id="itemV2Qty" type="number" min="1" value="1" style="width:64px;margin-left:.5rem" /></label>`; openModal(itemModalV2); }

    function addToCartFromEditor(){ const q = Number(document.getElementById('itemV2Qty').value)||1; const it = _editing; if(!it) return; CART.items.push({ id:CART.nextId++, name:it.name, unit:it.price, qty:q, total:it.price*q }); renderCart(); renderCartPanel(); }

    function renderCart(){ if(!cartV2Items) return; if(!CART.items.length){ cartV2Items.textContent='Cart is empty.'; cartV2Subtotal.textContent = fmt(0); cartV2Tax.textContent = fmt(0); cartV2Total.textContent = fmt(0); return; } cartV2Items.innerHTML=''; let s=0; CART.items.forEach(ci=>{ s+=ci.total; const el = document.createElement('div'); el.className='menu-cart-row'; el.innerHTML = `<div>${ci.name} <small style="color:var(--muted)">×${ci.qty}</small></div><div style="font-weight:700">${fmt(ci.total)}</div>`; cartV2Items.appendChild(el); }); const tax = s * TAX; cartV2Subtotal.textContent = fmt(s); cartV2Tax.textContent = fmt(tax); cartV2Total.textContent = fmt(s+tax); }

    function renderCartPanel(){ if(!cartPanelV2Items) return; if(!CART.items.length){ cartPanelV2Items.innerHTML = '<div class="menu-cart-empty">Your cart is empty.</div>'; cartPanelV2Subtotal.textContent = fmt(0); cartPanelV2Tax.textContent = fmt(0); cartPanelV2Total.textContent = fmt(0); return; } cartPanelV2Items.innerHTML=''; let s=0; CART.items.forEach(ci=>{ s+=ci.total; const row = document.createElement('div'); row.className='menu-cart-row'; row.innerHTML = `<div style="flex:1">${ci.name}<div style="font-size:.9rem;color:var(--muted)">Qty: ${ci.qty}</div></div><div style="font-weight:700">${fmt(ci.total)}</div>`; cartPanelV2Items.appendChild(row); }); const tax = s*TAX; cartPanelV2Subtotal.textContent = fmt(s); cartPanelV2Tax.textContent = fmt(tax); cartPanelV2Total.textContent = fmt(s+tax); }

    function openMenu(){ renderMenu(); openModal(menuV2); }
    function closeMenu(){ closeModal(menuV2); }

    function openCartPanel(){ if(cartPanelV2.parentNode !== document.body) document.body.appendChild(cartPanelV2); openModal(cartPanelV2); cartPanelV2.classList.add('open'); renderCartPanel(); }
    function closeCartPanel(){ closeModal(cartPanelV2); cartPanelV2.classList.remove('open'); }

    // wiring
    if(openMenuBtn) openMenuBtn.addEventListener('click', openMenu);
    if(menuV2Close) menuV2Close.addEventListener('click', closeMenu);
    if(itemV2Form) itemV2Form.addEventListener('submit', (e)=>{ e.preventDefault(); addToCartFromEditor(); closeModal(itemModalV2); });
    if(cartV2OpenPanel) cartV2OpenPanel.addEventListener('click', openCartPanel);
    if(cartPanelV2Close) cartPanelV2Close.addEventListener('click', closeCartPanel);
    if(cartPanelV2Checkout) cartPanelV2Checkout.addEventListener('click', ()=>{ if(!CART.items.length){ alert('Cart empty'); return; } alert('Demo checkout — total: ' + cartPanelV2Total.textContent); CART.items=[]; renderCart(); renderCartPanel(); closeCartPanel(); });
    if(cartPanelV2Clear) cartPanelV2Clear.addEventListener('click', ()=>{ CART.items=[]; renderCart(); renderCartPanel(); closeCartPanel(); });

    // header cart button opens panel
    const openCartBtn = document.getElementById('openCartBtn'); if(openCartBtn) openCartBtn.addEventListener('click', (e)=>{ e.preventDefault(); openCartPanel(); });

    // initial render
    renderMenu(); renderCart();
  })();
});
// Mobile menu toggle and smooth scrolling
document.addEventListener('DOMContentLoaded', function(){
  // DOMContentLoaded
  // Global error capture to help surface silent failures during debug
  window.addEventListener('error', function(ev){ console.error('[window error]', ev.message, ev.filename + ':' + ev.lineno + ':' + ev.colno, ev.error); });
  // Diagnostics removed for production - keep DOM ready state minimal

  // Overlay detection removed - resolved and noisy in production
  const nav = document.getElementById('site-nav');
  const hamburger = document.getElementById('hamburger');
  const modeSwitch = document.getElementById('modeSwitch');
  const header = document.querySelector('.site-header');

  // Toggle header visibility on hamburger click
  hamburger && hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    header && header.classList.toggle('show');
    nav.classList.toggle('open');
  });

  // Close mobile menu on nav link click
  document.querySelectorAll('.site-nav .nav-link').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger && hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Smooth scrolling for same-page anchors. Also open contact modal when Contact link is clicked.
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e){
      const href = this.getAttribute('href') || '';
      const targetId = href.slice(1);
      if(!targetId) return;

      // If the nav link targets the removed #contact section, open the contact modal instead
      if(targetId === 'contact'){
        const contactModal = document.getElementById('contactModal');
        if(contactModal){
          e.preventDefault();
          // openModal is hoisted below in this scope
          try{ openModal(contactModal); }catch(err){ console.warn('openModal not available yet'); }
          return;
        }
      }

      const target = document.getElementById(targetId);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // Mode switch (persistent)
  function applyModeFromStorage(){
    const saved = localStorage.getItem('siteMode');
    const isLight = saved === 'light';
    if(isLight){
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
    }
    if(modeSwitch) modeSwitch.checked = isLight;
  }

  modeSwitch && modeSwitch.addEventListener('change', () => {
    const isOn = !!modeSwitch.checked;
    document.body.classList.toggle('light-mode', isOn);
    localStorage.setItem('siteMode', isOn ? 'light' : 'dark');
  });
  applyModeFromStorage();

  // Logo upload/loading removed for now; `#companyLogo` element remains in HTML for future use

  // Demo dropdowns: attach to any .dropdown-toggle on the page (works across index/consumer/business)
  document.querySelectorAll('.dropdown-toggle').forEach(toggle => {
    const parent = toggle.closest('.nav-dropdown') || toggle.parentElement;
    const menu = parent && parent.querySelector('.dropdown-menu');
    toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') || 'false');
    if(menu) menu.setAttribute('aria-hidden', menu.getAttribute('aria-hidden') || 'true');

    // toggle by click
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      // close other open menus first
      document.querySelectorAll('.dropdown-menu.open').forEach(m => {
        if(m !== menu){ m.classList.remove('open'); m.setAttribute('aria-hidden','true'); }
      });

      if(menu){
        const willOpen = !expanded;
        menu.classList.toggle('open', willOpen);
        menu.setAttribute('aria-hidden', String(!willOpen));
        toggle.setAttribute('aria-expanded', String(willOpen));
      }
    });

    // keyboard support: Enter or Space toggles the menu
    toggle.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault();
        toggle.click();
      }
      // close with Escape when focused inside toggle
      if(e.key === 'Escape'){
        if(menu){ menu.classList.remove('open'); menu.setAttribute('aria-hidden','true'); }
        toggle.setAttribute('aria-expanded','false');
        toggle.blur();
      }
    });
  });

  // close dropdowns when clicking outside of any .nav-dropdown
  document.addEventListener('click', (e) => {
    if(e.target.closest && e.target.closest('.nav-dropdown')) return; // clicked inside a dropdown - ignore
    document.querySelectorAll('.dropdown-menu.open').forEach(m => { m.classList.remove('open'); m.setAttribute('aria-hidden','true'); });
    document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded','false'));
  });

  // Close open modal when clicking on the backdrop (modal root) — allow clicking outside the panel to dismiss
  document.addEventListener('click', (e) => {
    const openModals = Array.from(document.querySelectorAll('.modal[aria-hidden="false"]'));
    if(!openModals.length) return;
    openModals.forEach(modal => {
      // If the click target is the modal itself (the overlay root), close it
      if(e.target === modal){ try{ closeModal(modal); }catch(err){} }
    });
  });

  // close on Escape
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      document.querySelectorAll('.dropdown-menu.open').forEach(m => { m.classList.remove('open'); m.setAttribute('aria-hidden','true'); });
      document.querySelectorAll('.dropdown-toggle[aria-expanded="true"]').forEach(t => t.setAttribute('aria-expanded','false'));
    }
  });

  // header scroll state: add .scrolled when page is scrolled to give subtle elevation
  function applyHeaderScroll(){
    if(!header) return;
    if(window.scrollY > 8) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  }
  applyHeaderScroll();
  window.addEventListener('scroll', applyHeaderScroll, {passive:true});

  // Background blobs + scroll-parallax and reveal-on-scroll
  (function backgroundAnimations(){
    const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Always ensure reveal elements are visible when reduced-motion is preferred
    const revealEls = document.querySelectorAll('.reveal-on-scroll, .reveal-stagger');
    if(prefersReduce){
      revealEls.forEach(el => el.classList.add('in-view'));
      return; // skip decorative animations
    }

    // create container and blobs
    const bg = document.createElement('div');
    bg.className = 'bg-animations';
    bg.innerHTML = '<div class="bg-blob bg-blob--a"></div><div class="bg-blob bg-blob--b"></div><div class="bg-blob bg-blob--c"></div>';
    document.body.appendChild(bg);

    const blobs = Array.from(bg.querySelectorAll('.bg-blob'));

    // parallax update using requestAnimationFrame
    let lastY = window.scrollY;
    function onScroll(){ lastY = window.scrollY; }
    window.addEventListener('scroll', onScroll, {passive:true});

    function rafLoop(){
      const y = lastY;
      // move blobs at varying rates
      blobs.forEach((b,i)=>{
        const rate = 0.04 + i*0.02;
        const tx = Math.sin((y*rate)/100)*18;
        const ty = Math.cos((y*rate)/120)*8;
        b.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${1 + i*0.02})`;
      });
      requestAnimationFrame(rafLoop);
    }
    requestAnimationFrame(rafLoop);

    // Reveal on scroll (IntersectionObserver)
    if(revealEls.length){
      if('IntersectionObserver' in window){
        const io = new IntersectionObserver((entries)=>{
          entries.forEach(entry => {
            if(entry.isIntersecting){
              entry.target.classList.add('in-view');
            }
          });
        },{threshold:0.12});
        revealEls.forEach(el=>io.observe(el));
      } else {
        // Fallback: immediately reveal all if IntersectionObserver isn't available
        revealEls.forEach(el => el.classList.add('in-view'));
      }
    }
  })();

  // Initialize a Leaflet demo map (works without MapKit tokens)
  // This will replace the static fallback with an interactive demo map and markers.
  let leafletMap = null;
  const leafletMarkers = {};

  function computeDistanceKm(lat1, lon1, lat2, lon2){
    const toRad = v => v * Math.PI / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  function initLeafletMap(){
    const mapRoot = document.getElementById('map');
    if(!mapRoot || typeof L === 'undefined') return;

    // Collect vendor points from DOM
    const vendorEls = Array.from(document.querySelectorAll('.vendor-card[data-lat][data-lon]'));
    const points = vendorEls.map(el => ({
      id: el.getAttribute('data-id'),
      lat: parseFloat(el.getAttribute('data-lat')),
      lon: parseFloat(el.getAttribute('data-lon')),
      el
    }));

    const center = points.length ? [points[0].lat, points[0].lon] : [37.7749, -122.4194];

    try{
      // Dark-themed basemap (CartoDB Dark Matter) for a blue-black-grey feel
      leafletMap = L.map('map', {zoomControl:true}).setView(center, 13);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(leafletMap);

      // Add markers
      points.forEach(p => {
        try{
          // Use a styled circle marker to match dark theme (blue highlights on near-black base)
          const m = L.circleMarker([p.lat, p.lon], {
            radius: 7,
            color: '#7fb3ff',
            weight: 2,
            fillColor: '#071426',
            fillOpacity: 0.95
          }).addTo(leafletMap).bindPopup(`<strong style="color:#e6f2ff">${p.el.querySelector('.card-title').textContent}</strong>`);
          leafletMarkers[p.id] = m;
          m.on('click', () => {
            // highlight and focus list item
            document.querySelectorAll('.vendor-card').forEach(c => c.classList.remove('highlight'));
            try{ p.el.classList.add('highlight'); p.el.scrollIntoView({behavior:'smooth', block:'center'}); p.el.focus(); }catch(e){}
          });
        }catch(e){ console.warn('marker error', e); }
      });

      // hide fallback
      const fb = document.getElementById('mapFallback'); if(fb) fb.style.display = 'none';
      mapRoot.classList.add('map-ready');
    }catch(e){ console.warn('Leaflet init failed', e); }
  }

  // Try to initialize Leaflet map now (if assets loaded)
  try{ initLeafletMap(); }catch(e){ console.warn('initLeafletMap failed', e); }

  // Expose a helper to (re)initialize or refresh the map preview UI.
  // In production replace this with real map re-init logic (MapKit/Leaflet/Mapbox).
  window.reloadMapPreview = function(){
    const mapRoot = document.getElementById('map');
    const fb = document.getElementById('mapFallback');
    if(mapRoot){
      if(fb) fb.style.display = 'none';
      mapRoot.classList.add('map-ready');
      console.info('Map preview refreshed (stub)');
    }
  };

  // Touch / keyboard support for flip-cards: make them focusable and tappable
  (function enableFlipCards(){
    const flipCards = Array.from(document.querySelectorAll('.flip-card'));
    if(!flipCards.length) return;

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || (window.matchMedia && window.matchMedia('(pointer:coarse)').matches);

    flipCards.forEach(card => {
      // make keyboard-focusable
      if(!card.hasAttribute('tabindex')) card.setAttribute('tabindex','0');

      // Keyboard: Enter / Space toggles flip
      card.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
          e.preventDefault();
          card.classList.toggle('flipped');
        }
      });

      // Touch / click: only enable tap-to-flip on coarse pointers (to avoid conflicting with desktop hover)
      if(isTouch){
        card.addEventListener('click', (e) => {
          // Ignore clicks on interactive children (links, buttons, inputs)
          if(e.target.closest && e.target.closest('a,button,input,textarea,select,label')) return;
          card.classList.toggle('flipped');
        });
      }
    });
  })();

  // Keyboard support: pressing Enter or Space on a focused vendor card activates its primary action (View Menu)
  (function vendorCardKeyboardSupport(){
    const cards = Array.from(document.querySelectorAll('.vendor-card'));
    if(!cards.length) return;
    cards.forEach(card => {
      card.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
          // Ignore if focus is on an interactive child
          const active = document.activeElement;
          if(active && active !== card && active.closest && active.closest('a,button,input,textarea,select')) return;
          e.preventDefault();
          const vid = card.getAttribute('data-id');
          if(vid) openMenu(vid);
        }
      });
    });
  })();

  // Consumer page behaviors: search simulation, view menu modal, map pin highlight
  const searchBtn = document.getElementById('demoSearchBtn');
  const searchInput = document.getElementById('demoSearchInput');
  const searchResult = document.getElementById('searchResult');
  const vendorsGrid = document.getElementById('vendorsGrid');
  // --- Menu system: modern ordering interface ---
  const menuModal = document.getElementById('menuModal');
  const openMenuBtn = document.getElementById('openMenuBtn');
  const menuCloseBtn = document.getElementById('menuCloseBtn');

  // Sample menu data (demo). Prices are numbers (USD).
  const MENU_DATA = {
    specials: [
      {id:'s1', name:'Truck Special Nachos', desc:'Crispy chips, cheese, spicy salsa, crema', price:8.5, options:{sizes:[{id:'reg',name:'Regular',price:0},{id:'lg',name:'Large',price:2}] , extras:[{id:'cheese',name:'Extra cheese',price:1.25},{id:'avocado',name:'Avocado',price:1.75}] }},
      {id:'s2', name:'Weekend Quesadilla', desc:'Grilled tortilla, cheddar, sour cream', price:7.0, options:{sizes:[{id:'one',name:'Single',price:0}], extras:[]}}
    ],
    mains: [
      {id:'m1', name:'Cheese Taco', desc:'Classic tortilla with cheese and salsa', price:3.5, options:{sizes:[{id:'std',name:'Single',price:0},{id:'dbl',name:'Double',price:2.5}], extras:[{id:'salsa',name:'Extra salsa',price:0.5}] }},
      {id:'m2', name:'Al Pastor', desc:'Marinated pork with pineapple', price:4.5, options:{sizes:[{id:'std',name:'Single',price:0}], extras:[{id:'extra_pine',name:'Extra pineapple',price:0.6}] }},
      {id:'m3', name:'Veggie Bowl', desc:'Seasonal veg & grains', price:5.25, options:{sizes:[{id:'reg',name:'Regular',price:0}], extras:[{id:'hummus',name:'Hummus',price:0.9},{id:'tofu',name:'Tofu',price:1.2}] }}
    ],
    sides: [
      {id:'sd1', name:'Fries', desc:'Crispy fries', price:2.5, options:{sizes:[{id:'reg',name:'Regular',price:0},{id:'lg',name:'Large',price:1.25}], extras:[]}},
      {id:'sd2', name:'Onion Rings', desc:'Battered rings', price:3.0, options:{sizes:[{id:'reg',name:'Regular',price:0}], extras:[]}}
    ],
    drinks: [
      {id:'d1', name:'House Coffee', desc:'Roasted daily', price:2.5, options:{sizes:[{id:'s',name:'Small',price:0},{id:'m',name:'Medium',price:0.6},{id:'l',name:'Large',price:1.1}], extras:[]}},
      {id:'d2', name:'Soda Can', desc:'Assorted flavors', price:1.75, options:{sizes:[{id:'one',name:'Standard',price:0}], extras:[]}}
    ]
  };

  const CART = { items: [], nextId: 1, vendorId: null };
  // currently-open vendor id for the menu (null = generic)
  let currentVendorId = null;
  function formatPrice(p){ return '$' + (Number(p) || 0).toFixed(2); }

  // Simple utility to find an item object by id across sections
  function findMenuItem(itemId){
    for(const sec of Object.keys(MENU_DATA)){
      const found = MENU_DATA[sec].find(i => i.id === itemId);
      if(found) return found;
    }
    return null;
  }

  // Render the menu into the modal columns
  function populateMenu(){
    const container = document.getElementById('menuItemsList');
    if(!container) return;
    // show loading state briefly
    const cols = container.querySelectorAll('.section-items');
    cols.forEach(c => { c.innerHTML = '<div class="menu-loading">Loading menu…</div>'; });
    // simulate async load
    setTimeout(() => {
      // if there's no data, show fallback
      const hasAny = Object.values(MENU_DATA).some(arr => arr && arr.length);
      if(!hasAny){ cols.forEach(c=> c.innerHTML = '<div class="menu-empty">No items available.</div>'); return; }
      // fill each section
      const sectionEls = document.querySelectorAll('.section-items');
      sectionEls.forEach(secEl => {
        const section = secEl.getAttribute('data-section');
        const list = MENU_DATA[section] || [];
        secEl.innerHTML = '';
        list.forEach(item => {
          const card = document.createElement('div'); card.className = 'menu-card';
          card.setAttribute('data-item-id', item.id);
          card.innerHTML = `
            <div class="image_container"><svg class="image" viewBox="0 0 24 24"><path d="M4 4h16v16H4z"/></svg></div>
            <div class="title">${escapeHtml(item.name)}</div>
            <div class="desc">${escapeHtml(item.desc)}</div>
            <div class="meta-row"><div class="price">${formatPrice(item.price)}</div><div class="action"><button class="cart-button add-to-cart" data-item-id="${item.id}">Add</button></div></div>
          `;
          secEl.appendChild(card);
        });
      });
      // rebind add-to-cart buttons
      document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.disabled = false;
        btn.addEventListener('click', (e)=>{
          const id = btn.getAttribute('data-item-id');
          openItemEditor(id);
        });
      });
    }, 260);
  }

  // Open menu modal; optionally pass a vendorId to show that vendor's menu/title
  // `manual` indicates the user explicitly opened the menu (clears any suppression)
  function openMenu(vendorId, manual = false){
    if(typeof vendorId !== 'undefined') currentVendorId = vendorId || null;
    if(manual) menuSuppressedUntilManualOpen = false;
    // Update menu title to reflect vendor if available
    try{
      const titleEl = document.querySelector('.menu-title');
      if(currentVendorId){
        const card = document.querySelector(`.vendor-card[data-id="${currentVendorId}"]`);
        if(card && titleEl){ titleEl.textContent = (card.querySelector('.card-title') && card.querySelector('.card-title').textContent) || 'Food Truck Menu'; }
        // populate vendor info (thumb, name, meta)
        try{
          const vendorInfo = document.getElementById('vendorInfo');
          const vThumb = document.getElementById('vendorThumb');
          const vName = document.getElementById('vendorNameSmall');
          const vMeta = document.getElementById('vendorMetaSmall');
          if(vendorInfo && card){
            const thumb = card.querySelector('.thumbnail');
            if(thumb && thumb.src){ vThumb.src = thumb.src; vThumb.style.display = ''; vThumb.alt = card.getAttribute('aria-label') || '';} else { vThumb.style.display = 'none'; }
            if(vName) vName.textContent = card.querySelector('.card-title') ? card.querySelector('.card-title').textContent : '';
            if(vMeta){ const stars = card.querySelector('.stars') ? card.querySelector('.stars').textContent : ''; const dist = card.querySelector('.distance') ? card.querySelector('.distance').textContent : ''; vMeta.textContent = `${stars} ${dist}`; }
            vendorInfo.setAttribute('aria-hidden','false');
          }
        }catch(e){}
      } else {
        if(titleEl) titleEl.textContent = 'Food Truck Menu';
      }
    }catch(e){ /* ignore title update errors */ }
    if(!menuModal) return;
    try{ openModal(menuModal); }catch(e){}
    populateMenu();
  }
  function closeMenu(){ if(!menuModal) return; try{ closeModal(menuModal); }catch(e){} }

  // --- Menu hide/restore helpers ---
  // When opening other overlays (item editor, cart), we'll temporarily hide the menu
  // and restore it afterward unless the user checked out (in which case menu stays hidden).
  let menuWasOpenForAction = false;
  let menuSuppressedUntilManualOpen = false;

  function hideMenuTemporarily(suppressUntilManual = false){
    try{
      if(!menuModal) return;
      const isOpen = menuModal.getAttribute('aria-hidden') === 'false';
      if(isOpen){ menuWasOpenForAction = true; closeMenu(); }
      if(suppressUntilManual){ menuSuppressedUntilManualOpen = true; menuWasOpenForAction = false; }
    }catch(e){}
  }

  function restoreMenuIfNeeded(){
    try{
      if(menuSuppressedUntilManualOpen) return; // user opted to keep menu closed
      if(menuWasOpenForAction){ menuWasOpenForAction = false; openMenu(currentVendorId); }
    }catch(e){}
  }

  // Wire open/close triggers
  if(openMenuBtn) openMenuBtn.addEventListener('click', (e)=>{ e.preventDefault(); openMenu(undefined, true); });
  if(menuCloseBtn) menuCloseBtn.addEventListener('click', ()=> closeMenu());

  // Make vendor cards clickable to open their menu. Ignore clicks on interactive children.
  document.querySelectorAll('.vendor-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if(e.target && e.target.closest && e.target.closest('a,button,input,textarea,select,label')) return;
      const vid = card.getAttribute('data-id');
      if(vid) openMenu(vid, true);
    });
  });

  // --- Item editor (separate modal) ---
  const itemEditor = document.getElementById('itemModal');
  const editorForm = document.getElementById('editorForm');
  const editorOptions = document.getElementById('editorOptions');
  const editorQty = document.getElementById('editorQty');
  const editorItemTotal = document.getElementById('editorItemTotal');
  let _editing = { itemId: null, cartItemId: null };

  function openItemEditor(itemId, cartItemId){
    const item = findMenuItem(itemId);
    if(!item || !itemEditor) return;
    // temporarily hide the menu so the editor can occupy the screen cleanly
    hideMenuTemporarily();
    _editing.itemId = itemId; _editing.cartItemId = cartItemId || null;
    document.getElementById('editorTitle').textContent = item.name;
    editorOptions.innerHTML = '';
    // sizes
    if(item.options && item.options.sizes && item.options.sizes.length){
      const wrap = document.createElement('div'); wrap.className='editor-block'; wrap.innerHTML = '<strong>Size</strong>';
      item.options.sizes.forEach((s,idx)=>{
        const id = `size_${item.id}_${s.id}`;
        const r = document.createElement('label'); r.style.display='block';
        r.innerHTML = `<input type="radio" name="size" value="${escapeHtml(s.id)}" ${idx===0? 'checked': ''}/> ${escapeHtml(s.name)} ${s.price? '('+formatPrice(s.price)+')':''}`;
        wrap.appendChild(r);
      });
      editorOptions.appendChild(wrap);
    }
    // extras
    if(item.options && item.options.extras && item.options.extras.length){
      const wrap = document.createElement('div'); wrap.className='editor-block'; wrap.innerHTML = '<strong>Add-ons</strong>';
      item.options.extras.forEach(ex =>{
        const id = `extra_${item.id}_${ex.id}`;
        const r = document.createElement('label'); r.style.display='block';
        r.innerHTML = `<input type="checkbox" name="extra" value="${escapeHtml(ex.id)}" data-price="${Number(ex.price)}"/> ${escapeHtml(ex.name)} (${formatPrice(ex.price)})`;
        wrap.appendChild(r);
      });
      editorOptions.appendChild(wrap);
    }
    // notes
    const notesWrap = document.createElement('div'); notesWrap.className='editor-block'; notesWrap.innerHTML = '<label style="display:block"><strong>Notes (optional)</strong><textarea name="notes" rows="2" style="width:100%;margin-top:6px;border-radius:8px;padding:.5rem"></textarea></label>';
    editorOptions.appendChild(notesWrap);
    // set qty
    editorQty.value = '1';
    // ensure the item editor is attached to document.body so it can stack above other modals
    try{
      if(itemEditor.parentNode !== document.body){
        itemEditor._originalParent = itemEditor.parentNode;
        document.body.appendChild(itemEditor);
      }
      // give it a high z-index to appear above the menu modal
      itemEditor.style.zIndex = '9999';
      itemEditor.style.position = 'fixed';
      itemEditor.style.display = '';
      itemEditor.setAttribute('aria-hidden','false');
      openModal(itemEditor);
    }catch(e){}
    updateEditorTotal();
  }

  function closeItemEditor(){
    if(!itemEditor) return;
    try{
      // close via the central modal helper
      itemEditor.setAttribute('aria-hidden','true');
      closeModal(itemEditor);
      // cleanup inline styles we applied
      try{ itemEditor.style.zIndex = ''; }catch(e){}
      try{ itemEditor.style.position = ''; }catch(e){}
      try{ itemEditor.style.display = 'none'; }catch(e){}
      // if we moved the editor into body, restore it to its original location
      if(itemEditor._originalParent){
        try{ itemEditor._originalParent.appendChild(itemEditor); }catch(e){}
        delete itemEditor._originalParent;
      }
    }catch(e){}
    _editing = {itemId:null, cartItemId:null};
    // restore menu if appropriate
    restoreMenuIfNeeded();
  }

  function updateEditorTotal(){
    const item = findMenuItem(_editing.itemId);
    if(!item) return;
    let total = Number(item.price) || 0;
    // size extra
    const sizeEl = editorOptions.querySelector('input[name="size"]:checked');
    if(sizeEl){ const sId = sizeEl.value; const s = (item.options.sizes||[]).find(x=>x.id===sId); if(s) total += Number(s.price||0); }
    // extras
    const extras = Array.from(editorOptions.querySelectorAll('input[name="extra"]:checked'));
    extras.forEach(ch => { total += Number(ch.getAttribute('data-price')||0); });
    const qty = Number(editorQty.value) || 1; total = total * qty;
    editorItemTotal.textContent = formatPrice(total);
  }

  // Friendly promise-based modal confirm using the vendor switch modal
  function modalConfirm(message){
    return new Promise((resolve)=>{
      const modal = document.getElementById('vendorSwitchModal');
      const msg = document.getElementById('vendorSwitchMessage');
      const btnConfirm = document.getElementById('vendorSwitchConfirm');
      const btnCancel = document.getElementById('vendorSwitchCancel');
      if(!modal || !btnConfirm || !btnCancel){
        // fallback to native confirm if modal not present
        resolve(window.confirm(message));
        return;
      }
      // ensure we don't attach duplicate handlers
      if(modal._confirmPending){
        // resolve previous as false to avoid leaks
        try{ modal._confirmPending(false); }catch(e){}
      }
      if(msg) msg.textContent = message;

      // resolver used by backdrop/Escape handlers too
      modal._confirmPending = function(result){ cleanup(); resolve(result); };

      function cleanup(){
        try{ btnConfirm.removeEventListener('click', onConfirm); }catch(e){}
        try{ btnCancel.removeEventListener('click', onCancel); }catch(e){}
        try{ delete modal._confirmPending; }catch(e){}
        try{ closeModal(modal); }catch(e){}
      }
      function onConfirm(e){ e && e.preventDefault && e.preventDefault(); modal._confirmPending(true); }
      function onCancel(e){ e && e.preventDefault && e.preventDefault(); modal._confirmPending(false); }
      btnConfirm.addEventListener('click', onConfirm);
      btnCancel.addEventListener('click', onCancel);
      openModal(modal);
    });
  }

  if(editorForm){
    editorForm.addEventListener('input', (e)=>{ updateEditorTotal(); });
    editorForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const item = findMenuItem(_editing.itemId);
      if(!item) return closeItemEditor();
      const form = new FormData(editorForm);
      const size = form.get('size') || null;
      const notes = form.get('notes') || '';
      const extras = (form.getAll('extra') || []);
      const qty = Number(form.get('editorQty') || editorQty.value || 1) || 1;
      // compute unit price
      let unit = Number(item.price) || 0;
      if(size){ const s = (item.options.sizes||[]).find(x=>x.id===size); if(s) unit += Number(s.price||0); }
      extras.forEach(exId => { const ex = (item.options.extras||[]).find(x=>x.id===exId); if(ex) unit += Number(ex.price||0); });
      // update cart
      if(_editing.cartItemId){ // update existing
        const cartItem = CART.items.find(ci=>ci.id===_editing.cartItemId);
        if(cartItem){ cartItem.qty = qty; cartItem.unit = unit; cartItem.options = { size, extras, notes }; cartItem.total = cartItem.unit * cartItem.qty; }
      } else {
        // enforce single-vendor cart: if cart has items from another vendor, ask to clear first
        const vendorForThisAdd = currentVendorId || null;
        if(CART.items.length && CART.vendorId && CART.vendorId !== vendorForThisAdd){
          const existingVendorName = (document.querySelector(`.vendor-card[data-id="${CART.vendorId}"] .card-title`) && document.querySelector(`.vendor-card[data-id="${CART.vendorId}"] .card-title`).textContent) || 'another vendor';
          const newVendorName = (vendorForThisAdd && document.querySelector(`.vendor-card[data-id="${vendorForThisAdd}"] .card-title`) && document.querySelector(`.vendor-card[data-id="${vendorForThisAdd}"] .card-title`).textContent) || 'this vendor';
          console.debug('[add-to-cart] detected different vendor', {CART_vendor:CART.vendorId, vendorForThisAdd});
          const ok = await modalConfirm(`Your cart already contains items from ${existingVendorName}. Clear the cart and start an order at ${newVendorName}?`);
          if(!ok){ return closeItemEditor(); }
          CART.items = [];
          CART.vendorId = null;
        }

        // set cart vendor if empty
        if(!CART.items.length){ CART.vendorId = vendorForThisAdd || null; }

        const cartItem = {
          id: CART.nextId++, itemId: item.id, name: item.name, unit: unit, qty: qty, total: unit * qty, vendorId: CART.vendorId, options: { size, extras, notes }
        };
        CART.items.push(cartItem);
        // visual highlight: briefly add class to item card
        const card = document.querySelector(`.menu-card[data-item-id="${item.id}"]`);
        if(card){ card.classList.add('just-added'); setTimeout(()=>card.classList.remove('just-added'), 700); }
      }
      renderCart();
      closeItemEditor();
    });
  }

  const editorCancel = document.getElementById('editorCancel'); if(editorCancel) editorCancel.addEventListener('click', (e)=>{ e.preventDefault(); closeItemEditor(); });
  const itemModalClose = document.getElementById('itemModalClose'); if(itemModalClose) itemModalClose.addEventListener('click', (e)=>{ e.preventDefault(); closeItemEditor(); });

  // --- Cart rendering and controls ---
  function renderCart(){
    const wrap = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('cartSubtotal');
    const badge = document.getElementById('cartCountBadge');
    const badgeBottom = document.getElementById('cartCountBottom');
    if(!wrap) return;
    if(!CART.items.length){ wrap.innerHTML = '<div class="menu-cart-empty">Your cart is empty.</div>'; subtotalEl.textContent = formatPrice(0); if(badge) badge.textContent = '0'; if(badgeBottom) badgeBottom.textContent='0'; CART.vendorId = null; return; }
    wrap.innerHTML = '';
    let subtotal = 0;
    CART.items.forEach(ci => {
      subtotal += Number(ci.total || (ci.unit * ci.qty)) || 0;
      const row = document.createElement('div'); row.className = 'menu-cart-row'; row.setAttribute('data-cart-id', ci.id);
      row.innerHTML = `
        <div style="flex:1">
          <div style="font-weight:700">${escapeHtml(ci.name)}</div>
          <div style="font-size:.9rem;color:var(--muted)">${escapeHtml((ci.options.size || '') + (ci.options.extras && ci.options.extras.length ? ' • ' + ci.options.extras.join(', ') : '') )}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div style="font-weight:700">${formatPrice(ci.total)}</div>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn qty-decrease" data-cart-id="${ci.id}">−</button>
            <div class="qty" style="padding:.2rem .6rem;border-radius:6px;background:rgba(255,255,255,0.02)">${ci.qty}</div>
            <button class="btn qty-increase" data-cart-id="${ci.id}">+</button>
            <button class="btn" style="margin-left:6px" data-remove-id="${ci.id}">Remove</button>
          </div>
        </div>
      `;
      wrap.appendChild(row);
    });
    subtotalEl.textContent = formatPrice(subtotal);
    if(badge) badge.textContent = String(CART.items.length);
    if(badgeBottom) badgeBottom.textContent = String(CART.items.length);

    // wire qty controls and remove
    wrap.querySelectorAll('.qty-decrease').forEach(b => b.addEventListener('click', (e)=>{
      const id = Number(b.getAttribute('data-cart-id'));
      const it = CART.items.find(x=>x.id===id); if(!it) return;
      if(it.qty > 1){ it.qty--; it.total = it.unit * it.qty; renderCart(); highlightCartRow(id); }
    }));
    wrap.querySelectorAll('.qty-increase').forEach(b => b.addEventListener('click', (e)=>{
      const id = Number(b.getAttribute('data-cart-id'));
      const it = CART.items.find(x=>x.id===id); if(!it) return;
      it.qty++; it.total = it.unit * it.qty; renderCart(); highlightCartRow(id);
    }));
    wrap.querySelectorAll('[data-remove-id]').forEach(b => b.addEventListener('click',(e)=>{
      const id = Number(b.getAttribute('data-remove-id'));
      CART.items = CART.items.filter(x=>x.id!==id); renderCart();
    }));
    // keep cart modal in sync if it's open
    try{ renderCartModal(); }catch(e){}
  }

  function highlightCartRow(cartId){
    const r = document.querySelector(`.menu-cart-row[data-cart-id="${cartId}"]`);
    if(r){ r.classList.add('item-changed'); setTimeout(()=> r.classList.remove('item-changed'), 700); }
  }

  // scroll-to-cart helper (review buttons removed)
  function scrollToCart(){ try{ const el = document.getElementById('menuCartSummary'); if(el) el.scrollIntoView({behavior:'smooth', block:'center'}); }catch(e){} }

  // wire nav buttons to scroll to their sections
  document.querySelectorAll('.menu-nav-btn').forEach(btn => btn.addEventListener('click', (e)=>{
    const t = btn.getAttribute('data-target'); const sec = document.querySelector(`[data-section="${t}"]`);
    if(sec) sec.scrollIntoView({behavior:'smooth', block:'start'});
  }));

  // Checkout button (pre-checkout only) — show alert for demo
  const checkoutBtn = document.getElementById('checkoutBtn');
  if(checkoutBtn) checkoutBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    // Open the full cart modal so the user can review/take action
    if(!CART.items.length){ alert('Your cart is empty.'); return; }
    try{ openCart(); }catch(err){
      // Fallback: show subtotal if cart modal isn't available
      alert('Checkout is a demo — order subtotal: ' + document.getElementById('cartSubtotal').textContent);
    }
  });

  // --- Cart modal / checkout panel ---
  const cartModal = document.getElementById('cartModal');
  const openCartBtn = document.getElementById('openCartBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartModalItems = document.getElementById('cartModalItems');
  const cartModalSubtotal = document.getElementById('cartModalSubtotal');
  const cartModalTax = document.getElementById('cartModalTax');
  const cartModalTotal = document.getElementById('cartModalTotal');
  const cartTaxRateEl = document.getElementById('cartTaxRate');
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
  const cartClearBtn = document.getElementById('cartClearBtn');

  const DEFAULT_TAX_RATE = 0.08; // 8% demo tax

  function renderCartModal(){
    if(!cartModalItems) return;
    if(!CART.items.length){ cartModalItems.innerHTML = '<div class="menu-cart-empty">Your cart is empty.</div>'; if(cartModalSubtotal) cartModalSubtotal.textContent = formatPrice(0); if(cartModalTax) cartModalTax.textContent = formatPrice(0); if(cartModalTotal) cartModalTotal.textContent = formatPrice(0); return; }
    cartModalItems.innerHTML = '';
    let subtotal = 0;
    CART.items.forEach(ci => {
      subtotal += Number(ci.total || (ci.unit * ci.qty)) || 0;
      const row = document.createElement('div'); row.className = 'menu-cart-row'; row.setAttribute('data-cart-id', ci.id);
      row.innerHTML = `
        <div style="flex:1">
          <div style="font-weight:700">${escapeHtml(ci.name)}</div>
          <div style="font-size:.9rem;color:var(--muted)">${escapeHtml((ci.options.size || '') + (ci.options.extras && ci.options.extras.length ? ' • ' + ci.options.extras.join(', ') : '') )}</div>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
          <div style="font-weight:700">${formatPrice(ci.total)}</div>
          <div style="display:flex;gap:6px;align-items:center">
            <button class="btn qty-decrease" data-cart-id="${ci.id}">−</button>
            <div class="qty" style="padding:.2rem .6rem;border-radius:6px;background:rgba(255,255,255,0.02)">${ci.qty}</div>
            <button class="btn qty-increase" data-cart-id="${ci.id}">+</button>
            <button class="btn" style="margin-left:6px" data-remove-id="${ci.id}">Remove</button>
          </div>
        </div>
      `;
      cartModalItems.appendChild(row);
    });
    const taxRate = DEFAULT_TAX_RATE;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    if(cartModalSubtotal) cartModalSubtotal.textContent = formatPrice(subtotal);
    if(cartModalTax) cartModalTax.textContent = formatPrice(tax);
    if(cartModalTotal) cartModalTotal.textContent = formatPrice(total);
    if(cartTaxRateEl) cartTaxRateEl.textContent = Math.round(taxRate * 100) + '%';

    // Also update the summary subtotal inside the menu panel so it's always in sync
    try{ const menuSubtotalEl = document.getElementById('cartSubtotal'); if(menuSubtotalEl) menuSubtotalEl.textContent = formatPrice(subtotal); }catch(e){}

    // wire qty controls and remove inside modal
    cartModalItems.querySelectorAll('.qty-decrease').forEach(b => b.addEventListener('click', (e)=>{
      const id = Number(b.getAttribute('data-cart-id'));
      const it = CART.items.find(x=>x.id===id); if(!it) return;
      if(it.qty > 1){ it.qty--; it.total = it.unit * it.qty; renderCart(); renderCartModal(); highlightCartRow(id); }
    }));
    cartModalItems.querySelectorAll('.qty-increase').forEach(b => b.addEventListener('click', (e)=>{
      const id = Number(b.getAttribute('data-cart-id'));
      const it = CART.items.find(x=>x.id===id); if(!it) return;
      it.qty++; it.total = it.unit * it.qty; renderCart(); renderCartModal(); highlightCartRow(id);
    }));
    cartModalItems.querySelectorAll('[data-remove-id]').forEach(b => b.addEventListener('click',(e)=>{
      const id = Number(b.getAttribute('data-remove-id'));
      CART.items = CART.items.filter(x=>x.id!==id); renderCart(); renderCartModal();
    }));
  }

  function openCart(){ if(!cartModal) return; try{ hideMenuTemporarily(); openModal(cartModal); }catch(e){} renderCartModal(); }
  function closeCart(){ if(!cartModal) return; try{ closeModal(cartModal); }catch(e){} // restore menu unless we suppressed it via checkout
    restoreMenuIfNeeded(); }

  if(openCartBtn) openCartBtn.addEventListener('click', (e)=>{ e.preventDefault(); openCart(); });
  if(cartCloseBtn) cartCloseBtn.addEventListener('click', (e)=>{ e.preventDefault(); closeCart(); });
  if(cartClearBtn) cartClearBtn.addEventListener('click', (e)=>{ e.preventDefault(); CART.items = []; CART.vendorId = null; renderCart(); closeCart(); });
  if(cartCheckoutBtn) cartCheckoutBtn.addEventListener('click', (e)=>{
    e.preventDefault();
    if(!CART.items.length){ alert('Your cart is empty.'); return; }
    // simulate checkout: show totals then clear cart
    const subtotalText = cartModalSubtotal ? cartModalSubtotal.textContent : formatPrice(0);
    const totalText = cartModalTotal ? cartModalTotal.textContent : subtotalText;
    alert('Checkout (demo) — Subtotal: ' + subtotalText + '\nTotal: ' + totalText + '\nThank you!');
    CART.items = [];
    CART.vendorId = null;
    // after checkout, keep the menu suppressed until user manually reopens it
    menuSuppressedUntilManualOpen = true;
    renderCart(); closeCart();
  });

  // Menu modal now uses `.cart-button` for adding items — no separate order-btn handler needed.

  // Cart-button behavior is handled below by the centralized CART/addToCart flow.

  // Very small XSS-safe helper
  function escapeHtml(str){ return String(str).replace(/[&<>"']/g, function(s){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]; }); }

  // External cart removed; checkout behavior is handled via the menu modal checkout button.

  if(searchBtn && searchInput && searchResult){
    // Simple geocode stub for demo — extend with real service later
    const geocodeStub = (q) => {
      const s = (q || '').trim().toLowerCase();
      const map = {
        'san francisco':[37.7749,-122.4194],
        'sf':[37.7749,-122.4194],
        '94103':[37.7722,-122.4106],
        '94107':[37.7675,-122.3928],
        'downtown':[37.7749,-122.4194]
      };
      return map[s] || null;
    };

    // debounce helper
    function debounce(fn, wait){ let t; return (...args)=>{ clearTimeout(t); t = setTimeout(()=>fn(...args), wait); }; }

    function runSearch(){
      const qRaw = (searchInput.value || '').trim();
      const q = qRaw.toLowerCase();
      // if empty — reset
      if(!q){
        searchResult.textContent = 'Showing vendors near you.';
        document.querySelectorAll('.vendor-card').forEach(el => { el.style.display = ''; el.classList.remove('highlight'); });
        if(vendorsGrid) vendorsGrid.style.opacity = '1';
        // reset ordering
        return;
      }

      searchResult.textContent = `Showing vendors near "${qRaw}".`;

      // If query maps to coords, pan map to that location
      const coords = geocodeStub(qRaw);
      if(coords && leafletMap){
        try{ leafletMap.setView(coords, 14, {animate:true}); }catch(e){}
      }

      // Filter vendor cards by title or description text and compute distance if map center available
      const cards = Array.from(document.querySelectorAll('.vendor-card'));
      const center = coords || (leafletMap ? [leafletMap.getCenter().lat, leafletMap.getCenter().lng] : null);
      const results = cards.map(card => {
        const title = (card.querySelector('.card-title') && card.querySelector('.card-title').textContent || '').toLowerCase();
        const desc = (card.querySelector('.card-description') && card.querySelector('.card-description').textContent || '').toLowerCase();
        const match = title.includes(q) || desc.includes(q) || (card.getAttribute('data-id') || '').toLowerCase() === q;
        let dist = Infinity;
        if(center){
          const lat = parseFloat(card.getAttribute('data-lat'));
          const lon = parseFloat(card.getAttribute('data-lon'));
          if(!isNaN(lat) && !isNaN(lon)) dist = computeDistanceKm(center[0], center[1], lat, lon);
        }
        return {card, match, dist};
      });

      // Show/hide and highlight matches; then sort by distance with matches first
      results.forEach(r => { r.card.style.display = r.match ? '' : 'none'; r.card.classList.toggle('highlight', r.match); });
      const matched = results.filter(r => r.match).sort((a,b)=> a.dist - b.dist);
      if(matched.length === 0) searchResult.textContent = `No vendors found for "${qRaw}".`;
      else {
        // Reorder DOM to show nearest matches first
        matched.forEach(r => vendorsGrid.appendChild(r.card));
        // Pan to closest matched vendor marker if present
        const closest = matched[0];
        if(closest && leafletMap){
          const id = closest.card.getAttribute('data-id');
          const marker = leafletMarkers[id];
          if(marker){ try{ leafletMap.panTo(marker.getLatLng(), {animate:true}); marker.openPopup(); }catch(e){} }
        }
      }

      if(vendorsGrid) vendorsGrid.style.opacity = '1';
    }

    const debouncedRun = debounce(runSearch, 280);
    searchBtn.addEventListener('click', runSearch);
    searchInput.addEventListener('keydown', (e) => { if(e.key === 'Enter') runSearch(); });
    searchInput.addEventListener('input', debouncedRun);

    // Clear button support
    const clearBtn = document.getElementById('demoSearchClear');
    if(clearBtn){
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchResult.textContent = 'Cleared. Showing vendors near you.';
        document.querySelectorAll('.vendor-card').forEach(el => { el.style.display = ''; el.classList.remove('highlight'); });
      });
    }
  }

  // (Previously had defensive handlers for removed .view-menu buttons.)

  // Map pin click highlighting (keyboard-focus friendly)
  document.addEventListener('click', (e) => {
    const pin = e.target.closest && e.target.closest('.map-pin');
    if(pin){
      const targetId = pin.getAttribute('data-target');
      if(targetId){
        document.querySelectorAll('.vendor-card').forEach(c => c.classList.remove('highlight'));
        const card = document.querySelector(`.vendor-card[data-id="${targetId}"]`);
        if(card){
          card.classList.add('highlight');
          try{ card.scrollIntoView({behavior:'smooth', block:'center'}); card.focus(); }catch(err){}
          // If a Leaflet marker exists for this vendor, pan to it and open its popup for better spatial context
          try{
            if(typeof leafletMap !== 'undefined' && leafletMap && typeof leafletMarkers !== 'undefined'){
              const m = leafletMarkers[targetId];
              if(m && typeof m.getLatLng === 'function'){
                leafletMap.panTo(m.getLatLng(), {animate:true});
                if(typeof m.openPopup === 'function') m.openPopup();
              }
            }
          }catch(e){ /* ignore mapping errors */ }
        }
      }
    }
  });

  // Initialize MapKit (consumer page) with graceful fallback
  (function initMapKit(){
    const mapRoot = document.getElementById('map');
    if(!mapRoot) return;

    // Try to initialize mapkit; if it fails (no JWT endpoint), leave fallback image visible
    try{
      if(typeof mapkit === 'undefined'){
        console.warn('mapkit not loaded; using static fallback');
        return;
      }

      mapkit.init({
        authorizationCallback: function(done){
          // Note: This expects a server endpoint returning a valid token at /services/jwt
          var xhr = new XMLHttpRequest();
          xhr.open('GET', '/services/jwt');
          xhr.addEventListener('load', function(){
            if(this.status >= 200 && this.responseText){
              done(this.responseText);
            } else {
              console.warn('No JWT available; MapKit init aborted');
            }
          });
          xhr.addEventListener('error', function(){ console.warn('JWT request failed'); });
          xhr.send();
        }
      });

      // If init didn't throw, create a simple map and add markers for demo vendors
      var annotations = [];
      try{
        var coords = [
          new mapkit.Coordinate(37.7749, -122.4194),
          new mapkit.Coordinate(37.7849, -122.4094),
          new mapkit.Coordinate(37.7649, -122.4294)
        ];
        annotations = coords.map(function(c,i){
          var ann = new mapkit.MarkerAnnotation(c, {color: '#0b022d'});
          ann.title = 'Vendor ' + (i+1);
          return ann;
        });

        var map = new mapkit.Map('map');
        map.showItems(annotations);
        // hide fallback image if present
        var fb = document.getElementById('mapFallback'); if(fb) fb.style.display = 'none';
      }catch(e){
        console.warn('MapKit annotation error', e);
      }

    }catch(e){
      console.warn('MapKit init error, using fallback', e);
    }
  })();

  // Business page: details modal
  const detailsModal = document.getElementById('detailsModal');
  const closeDetailsModal = document.getElementById('closeDetailsModal');
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('.view-details');
    if(btn){
      const id = btn.getAttribute('data-id');
      const title = document.getElementById('detailsTitle');
      const body = document.getElementById('detailsBody');
      if(title) title.textContent = `Spot Details — ${id}`;
      // Populate details from the matching parking card DOM node if present
      const card = document.querySelector(`.parking-card[data-id="${id}"]`) || document.querySelector(`.demo-listing[data-id="${id}"]`);
      if(body){
        if(card){
          const img = card.querySelector('img') ? card.querySelector('img').src : 'https://via.placeholder.com/720x360?text=Spot+Detail';
          const hdr = card.querySelector('h3') ? card.querySelector('h3').textContent : 'Spot';
          const desc = card.querySelector('p') ? card.querySelector('p').textContent : '';
          const price = card.querySelector('.price') ? card.querySelector('.price').textContent : '';
          const perDay = getPerDayFromCard(id) || 0;
          // monthly estimate (no discount applied in demo)
          const rawMonthly = perDay * RES_MONTH_DAYS;
          const monthlyDisplay = formatMoney(rawMonthly);
          body.innerHTML = `
            <div style="display:grid;grid-template-columns:1fr;gap:1rem">
              <img src="${img}" alt="${hdr}" style="width:100%;height:auto;border-radius:8px;object-fit:cover" />
              <div>
                <h4 style="margin:0 0 .5rem">${hdr}</h4>
                <p style="margin:0 0 .6rem;color:var(--muted)">${desc}</p>
                <p style="margin:0">Price per day: <strong>${formatMoney(perDay)}</strong></p>
                <p style="margin:0">Estimated monthly (discounted): <strong>${monthlyDisplay}</strong></p>
                <p style="margin-top:.6rem;color:var(--muted)"><strong>Hours:</strong> 6:00 — 22:00</p>
              </div>
              <div>
                <button class="btn btn-primary" id="openReserveBtn" data-spot="${id}">Reserve Spot</button>
              </div>
            </div>`;
        } else {
          body.innerHTML = `<p>Details for ${id} not found.</p><button class="btn btn-primary" id="openReserveBtn" data-spot="${id}">Reserve Spot</button>`;
        }
      }
      // Use openModal to trap focus and provide consistent modal handling
      if(detailsModal) openModal(detailsModal);
    }
  });
  closeDetailsModal && closeDetailsModal.addEventListener('click', () => { if(detailsModal) closeModal(detailsModal); });

  // Reserve modal behavior
  const reserveModal = document.getElementById('reserveModal');
  const closeReserveModal = document.getElementById('closeReserveModal');
  const reserveCancel = document.getElementById('reserveCancel');
  const reserveForm = document.getElementById('reserveForm');

  // Delegate click to open reserve modal from details modal's Reserve button
  document.addEventListener('click', (e) => {
    const rbtn = e.target.closest && e.target.closest('#openReserveBtn');
    if(rbtn){
      const spot = rbtn.getAttribute('data-spot') || 'p1';
      // prefer to use the centralized openReserveForSpot helper (defined below)
      try{ if(typeof openReserveForSpot === 'function'){ openReserveForSpot(spot); } else {
        const title = document.getElementById('reserveTitle'); if(title) title.textContent = `Reserve — ${spot}`; if(reserveModal) openModal(reserveModal);
      }}catch(e){ console.warn('openReserveForSpot not available', e); }
    }
  });

  closeReserveModal && closeReserveModal.addEventListener('click', () => { if(reserveModal) closeModal(reserveModal); });
  reserveCancel && reserveCancel.addEventListener('click', () => { if(reserveModal) closeModal(reserveModal); });

  if(reserveForm){
    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(reserveForm);
      const payload = Object.fromEntries(data.entries());
      console.log('Reserve request', payload);
      closeModal(reserveModal);
      closeModal(detailsModal);
      try{ alert('Reservation request submitted — we will contact you.'); }catch(e){}
    });
  }

  // --- Enhanced reserve controls: slider, unit toggle, quantity and total calculation
  const reserveSpotInput = document.getElementById('reserveSpot');
  const reservePerDayEl = document.getElementById('reservePerDay');
  const reserveTotalEl = document.getElementById('reserveTotal');
  const reserveSpotImage = document.getElementById('reserveSpotImage');
  const reserveRangeText = document.getElementById('reserveRangeText');
  const RES_MONTH_DAYS = 30;

  function parsePriceText(priceText){
    if(!priceText) return 0;
    const m = priceText.match(/\$\s*([0-9]+(?:\.[0-9]+)?)/);
    return m ? parseFloat(m[1]) : 0;
  }

  function getPerDayFromCard(spotId){
    try{
      const card = document.querySelector(`.parking-card[data-id="${spotId}"]`);
      if(!card) return 0;
      const priceEl = card.querySelector('.price');
      const txt = priceEl ? priceEl.textContent : '';
      const n = parsePriceText(txt);
      return n || 0;
    }catch(e){ return 0; }
  }

  function formatMoney(n){ return '$' + (Number(n) || 0).toFixed(2); }

  function recalcReserve(){
    if(!reservePerDayEl || !reserveTotalEl) return;
    const perDay = Number(reservePerDayEl.dataset.perDay) || 0;
    let total = 0;
    // If a date range is selected, compute number of days
    const startVal = document.getElementById('reserveDateStart') ? document.getElementById('reserveDateStart').value : '';
    const endVal = document.getElementById('reserveDateEnd') ? document.getElementById('reserveDateEnd').value : '';
    let daysCount = 0;
    if(startVal && endVal){
      // Count only available (not-closed) days between start and end
      const cal = document.getElementById('reserveCalendar');
      const days = cal ? Array.from(cal.querySelectorAll('.rc-day')) : [];
      const sDate = new Date(startVal + 'T00:00:00');
      const eDate = new Date(endVal + 'T00:00:00');
      const blocked = [];
      daysCount = 0;
      days.forEach(d => {
        const iso = d.dataset.iso;
        if(!iso) return;
        const dt = new Date(iso + 'T00:00:00');
        if(dt >= sDate && dt <= eDate){
          if(d.classList.contains('closed')){ blocked.push(iso); }
          else { daysCount += 1; }
        }
      });
      // Show blocked dates in the note and as chips if any
      const capNoteEl = document.getElementById('reserveCapNote');
      const chipsWrap = document.getElementById('blockedChips');
      if(chipsWrap){ chipsWrap.innerHTML = ''; chipsWrap.setAttribute('aria-hidden', blocked.length ? 'false' : 'true'); }
      if(capNoteEl){
        if(blocked.length){
          capNoteEl.textContent = `Some dates unavailable — they were excluded.`;
          if(chipsWrap){ blocked.forEach(d=>{ const c = document.createElement('div'); c.className='chip'; c.textContent = d; chipsWrap.appendChild(c); }); }
        } else { capNoteEl.textContent = `${daysCount} days selected.`; }
      }
      total = perDay * daysCount;
    } else if(startVal){
      daysCount = 1;
      total = perDay;
      const capNoteEl = document.getElementById('reserveCapNote'); if(capNoteEl) capNoteEl.textContent = '';
    }

    reserveTotalEl.textContent = formatMoney(total);
    reservePerDayEl.textContent = formatMoney(perDay);
    // show days selected note and update visible range text
    const capNoteEl = document.getElementById('reserveCapNote');
    if(reserveRangeText){
      if(daysCount > 1){ reserveRangeText.textContent = `${startVal} → ${endVal} (${daysCount} days)`; }
      else if(daysCount === 1){ reserveRangeText.textContent = `${startVal}`; }
      else { reserveRangeText.textContent = '—'; }
    }
    // capNote handled above for range case; ensure it's cleared otherwise
    // (no-op here)
  }

  // --- Availability calendar data & rendering
  // Demo availability per spot: closed dates (ISO Y-M-D). Replace with API-driven data later.
  const AVAILABILITY = {
    p1: { closed: ['2025-11-25','2025-12-24','2025-12-25'] },
    p2: { closed: ['2025-11-28','2025-12-01'] },
    p3: { closed: ['2025-11-26','2025-12-05'] },
    p4: { closed: ['2025-11-22','2025-11-23'] },
    p5: { closed: ['2025-12-31'] },
    p6: { closed: ['2025-11-29'] },
    p7: { closed: ['2025-11-30','2025-12-15'] }
  };

  // Spots that close on weekends (Saturday/Sunday) — some spots only
  const WEEKEND_CLOSED_SPOTS = new Set(['p2','p5','p7']);
  // Per-spot max day limits: 'week' = 7 days max, 'month' = 31 days max (null = no extra limit)
  const SPOT_MAX_LIMIT = {
    p2: 'week',
    p5: 'month',
    p7: 'week'
  };

  function getAvailabilityForSpot(spotId){
    // Prefer per-card data attribute: data-closed="2025-11-25,2025-12-24"
    try{
      const card = document.querySelector(`.parking-card[data-id="${spotId}"]`);
      if(card){
        const closedAttr = card.getAttribute('data-closed') || card.dataset.closed;
        if(closedAttr){
          const arr = String(closedAttr).split(',').map(s=>s.trim()).filter(Boolean);
          return { closed: arr };
        }
      }
    }catch(e){}
    return AVAILABILITY[spotId] || { closed: [] };
  }

  function formatYMD(d){
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  // Calendar state per spot to remember selected range / displayed month
  const calendarState = {};

  function renderReserveCalendar(spotId, year, month, dir){
    const container = document.getElementById('reserveCalendar');
    const hiddenStart = document.getElementById('reserveDateStart');
    const hiddenEnd = document.getElementById('reserveDateEnd');
    if(!container) return;

    const avail = getAvailabilityForSpot(spotId);
    const closedSet = new Set((avail.closed||[]));

    const today = new Date();
    year = year || (calendarState[spotId] && calendarState[spotId].year) || today.getFullYear();
    month = (typeof month === 'number') ? month : (calendarState[spotId] && calendarState[spotId].month) || today.getMonth();

    calendarState[spotId] = calendarState[spotId] || {};
    calendarState[spotId].year = year; calendarState[spotId].month = month;

    // build header with prev/next, month label, and month/year picker
    // preserve container but replace content for animation
    const prevCal = container.querySelector('.reserve-calendar-head, .reserve-calendar, .reserve-calendar-announce');
    container.innerHTML = '';
    const head = document.createElement('div'); head.className = 'reserve-calendar-head';
    const controlsWrap = document.createElement('div'); controlsWrap.style.display = 'flex'; controlsWrap.style.alignItems = 'center'; controlsWrap.style.gap = '8px';
    const prevBtn = document.createElement('button'); prevBtn.type='button'; prevBtn.textContent = '◀'; prevBtn.setAttribute('aria-label','Previous month');
    const nextBtn = document.createElement('button'); nextBtn.type='button'; nextBtn.textContent = '▶'; nextBtn.setAttribute('aria-label','Next month');
    const monthLabel = document.createElement('div'); monthLabel.textContent = new Date(year, month, 1).toLocaleString(undefined, {month:'long', year:'numeric'});

    // month/year picker for quick jump
    const picker = document.createElement('div'); picker.className = 'month-picker';
    const monthSelect = document.createElement('select'); monthSelect.setAttribute('aria-label','Select month');
    const monthNames = Array.from({length:12},(_,i)=> new Date(2000, i, 1).toLocaleString(undefined,{month:'long'}));
    monthNames.forEach((m,i)=>{ const o = document.createElement('option'); o.value = i; o.textContent = m; if(i===month) o.selected = true; monthSelect.appendChild(o); });
    const yearSelect = document.createElement('select'); yearSelect.setAttribute('aria-label','Select year');
    const nowY = (new Date()).getFullYear();
    for(let y = nowY-1; y <= nowY+2; y++){ const o = document.createElement('option'); o.value = y; o.textContent = String(y); if(y===year) o.selected=true; yearSelect.appendChild(o); }
    picker.appendChild(monthSelect); picker.appendChild(yearSelect);

    // aria-live announcer for month changes
    const announce = document.createElement('div'); announce.className = 'month-announce'; announce.setAttribute('role','status'); announce.setAttribute('aria-live','polite'); announce.textContent = '';

    controlsWrap.appendChild(prevBtn);
    controlsWrap.appendChild(picker);
    controlsWrap.appendChild(nextBtn);
    head.appendChild(monthLabel);
    head.appendChild(controlsWrap);
    container.appendChild(head);
    container.appendChild(announce);

    const cal = document.createElement('div'); cal.className = 'reserve-calendar reserve-calendar-enter';
    if(dir === 'left') cal.classList.add('slide-left');
    else if(dir === 'right') cal.classList.add('slide-right');
    container.appendChild(cal);

    const weekNames = ['Su','Mo','Tu','We','Th','Fr','Sa'];
    weekNames.forEach(w => { const el = document.createElement('div'); el.className='rc-weekday'; el.textContent = w; cal.appendChild(el); });

    const firstOfMonth = new Date(year, month, 1);
    const startDay = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month+1, 0).getDate();

    for(let i=0;i<startDay;i++){ const blank = document.createElement('div'); blank.className='rc-day'; blank.style.visibility='hidden'; cal.appendChild(blank); }

    // Build day buttons array for keyboard nav
    const dayButtons = [];
    for(let d=1; d<=daysInMonth; d++){
      const dt = new Date(year, month, d);
      const iso = formatYMD(dt);
      const cell = document.createElement('button'); cell.type='button'; cell.className='rc-day'; cell.textContent = d; cell.dataset.iso = iso;
      const isPast = dt.setHours(0,0,0,0) < (new Date()).setHours(0,0,0,0);
      const isWeekend = (dt.getDay() === 0 || dt.getDay() === 6);
      const isClosed = closedSet.has(iso) || (WEEKEND_CLOSED_SPOTS.has(spotId) && isWeekend);
      if(isPast){ cell.classList.add('past'); cell.disabled = true; }
      if(isClosed){
        cell.classList.add('closed'); cell.disabled = true;
        const reason = (WEEKEND_CLOSED_SPOTS.has(spotId) && isWeekend) ? 'Closed (weekend)' : 'Closed';
        const label = `${reason} on ${iso}`;
        cell.setAttribute('aria-label', label);
        // provide a native tooltip on hover/focus for quick info
        cell.title = label;
      } else { cell.classList.add('available'); cell.setAttribute('aria-label', `Available ${iso}`); cell.title = `Available ${iso}`; }

      cell.addEventListener('click', () => {
        if(cell.disabled) return;
        const st = calendarState[spotId] || {};
        const capNoteEl = document.getElementById('reserveCapNote');
        if(!st.start || (st.start && st.end)){
          // start new selection (clear any previous cap note)
          st.start = iso; st.end = null;
          if(capNoteEl) capNoteEl.textContent = '';
        } else if(st.start && !st.end){
          // attempt to set end (swap if necessary)
          let proposedStart = st.start;
          let proposedEnd = iso;
          if(new Date(iso) < new Date(st.start)){
            proposedStart = iso; proposedEnd = st.start;
          }
          const rawSpan = Math.round((new Date(proposedEnd + 'T00:00:00') - new Date(proposedStart + 'T00:00:00')) / (1000*60*60*24)) + 1;
          const spotLimit = SPOT_MAX_LIMIT[spotId] || null;
          let maxAllowed = null;
          if(spotLimit === 'week') maxAllowed = 7;
          if(spotLimit === 'month') maxAllowed = 31;
          if(maxAllowed && rawSpan > maxAllowed){
            // Auto-cap behavior: find the latest available date <= capDate (proposedStart + maxAllowed - 1 days)
            const capDate = new Date(proposedStart + 'T00:00:00'); capDate.setDate(capDate.getDate() + (maxAllowed - 1));
            const capIso = formatYMD(capDate);
            // gather candidate days within calendar between proposedStart and capIso
            const dayEls = Array.from(cal.querySelectorAll('.rc-day'));
            let chosen = null;
            for(let i = dayEls.length - 1; i >= 0; i--){
              const el = dayEls[i];
              const iso2 = el.dataset.iso;
              if(!iso2) continue;
              if(iso2 > capIso) continue;
              if(iso2 < proposedStart) break;
              if(!el.classList.contains('closed') && !el.classList.contains('past')){ chosen = iso2; break; }
            }
            if(!chosen){
              // fallback: pick the proposedStart (single-day) if nothing available in capped window
              chosen = proposedStart;
            }
            st.start = proposedStart;
            st.end = chosen;
            if(capNoteEl){ capNoteEl.textContent = `Selection capped to ${maxAllowed} days; end adjusted to ${st.end}.`; }
            // show transient toast to draw attention to the auto-cap
            showReserveToast(`Selection capped to ${maxAllowed} days; end adjusted to ${st.end}.`, 'warn');
          } else {
            st.start = proposedStart; st.end = proposedEnd;
          }
        }
        calendarState[spotId] = st;
        // update hidden inputs and display
        if(hiddenStart) hiddenStart.value = st.start || '';
        if(hiddenEnd) hiddenEnd.value = st.end || '';
        if(reserveRangeText) reserveRangeText.textContent = st.start ? (st.end ? `${st.start} → ${st.end}` : st.start) : '—';
        // highlight selected range
        highlightCalendarRange(cal, st.start, st.end);
        recalcReserve();
      });

      dayButtons.push(cell);
      cal.appendChild(cell);
    }

    // If we have previous selection, re-apply it
    const st = calendarState[spotId] || {};
    if(st.start){ hiddenStart && (hiddenStart.value = st.start); }
    if(st.end){ hiddenEnd && (hiddenEnd.value = st.end); }
    if(reserveRangeText && st.start) reserveRangeText.textContent = st.start + (st.end ? ` → ${st.end}` : '');
    highlightCalendarRange(cal, st.start, st.end);

    // keyboard navigation on calendar
    cal.addEventListener('keydown', (ev) => {
      const active = document.activeElement;
      if(!active || !active.classList.contains('rc-day')) return;
      const idx = dayButtons.indexOf(active);
      if(idx === -1) return;
      let targetIdx = null;
      if(ev.key === 'ArrowRight') targetIdx = idx + 1;
      if(ev.key === 'ArrowLeft') targetIdx = idx - 1;
      if(ev.key === 'ArrowUp') targetIdx = idx - 7;
      if(ev.key === 'ArrowDown') targetIdx = idx + 7;
      if(typeof targetIdx === 'number'){
        ev.preventDefault();
        // clamp and skip disabled
        while(targetIdx >=0 && targetIdx < dayButtons.length){
          const cand = dayButtons[targetIdx];
          if(!cand.disabled){ cand.focus(); break; }
          if(ev.key === 'ArrowRight' || ev.key === 'ArrowDown') targetIdx++; else targetIdx--;
        }
      }
      if(ev.key === 'Enter' || ev.key === ' '){ ev.preventDefault(); active.click(); }
    });

    // wire picker changes
    monthSelect.addEventListener('change', () => {
      const ny = Number(yearSelect.value || year); const nm = Number(monthSelect.value);
      announce.textContent = `Showing ${new Date(ny, nm, 1).toLocaleString(undefined,{month:'long', year:'numeric'})}`;
      renderReserveCalendar(spotId, ny, nm, 'left');
    });
    yearSelect.addEventListener('change', () => {
      const ny = Number(yearSelect.value); const nm = Number(monthSelect.value || month);
      announce.textContent = `Showing ${new Date(ny, nm, 1).toLocaleString(undefined,{month:'long', year:'numeric'})}`;
      renderReserveCalendar(spotId, ny, nm, 'left');
    });

    // simple enter animation (fade/slide) for the calendar grid
    requestAnimationFrame(()=>{ cal.classList.add('reserve-calendar-enter-active'); setTimeout(()=>{ cal.classList.remove('reserve-calendar-enter reserve-calendar-enter-active'); }, 420); });

    // prev/next handlers
    prevBtn.addEventListener('click', () => {
      let ny = year; let nm = month - 1; if(nm < 0){ nm = 11; ny -= 1; }
      // moving to previous month — slide right
      renderReserveCalendar(spotId, ny, nm, 'right');
    });
    nextBtn.addEventListener('click', () => {
      let ny = year; let nm = month + 1; if(nm > 11){ nm = 0; ny += 1; }
      // moving to next month — slide left
      renderReserveCalendar(spotId, ny, nm, 'left');
    });

    // focus first available day for keyboard users
    setTimeout(()=>{ const f = cal.querySelector('.rc-day.available:not(.past)'); if(f) f.focus(); }, 50);
  }

  function highlightCalendarRange(calEl, startIso, endIso){
    if(!calEl) return;
    const days = Array.from(calEl.querySelectorAll('.rc-day'));
    days.forEach(d => d.classList.remove('selected','in-range','in-range-blocked'));
    if(!startIso) return;
    const sDate = new Date(startIso + 'T00:00:00');
    if(endIso){
      const eDate = new Date(endIso + 'T00:00:00');
      days.forEach(d => {
        const iso = d.dataset.iso;
        if(!iso) return;
        const dt = new Date(iso + 'T00:00:00');
        if(dt >= sDate && dt <= eDate){
          if(d.classList.contains('closed')){
            d.classList.add('in-range-blocked');
          } else {
            if(iso === startIso || iso === endIso) d.classList.add('selected'); else d.classList.add('in-range');
          }
        }
      });
    } else {
      // single day selected
      days.forEach(d => { if(d.dataset.iso === startIso) d.classList.add('selected'); });
    }
  }

  // (quantity/slider/month controls removed — date-range selection drives pricing)

  function openReserveForSpot(spotId){
    const perDay = getPerDayFromCard(spotId) || 0;
    if(reserveSpotInput) reserveSpotInput.value = spotId;
    const title = document.getElementById('reserveTitle'); if(title) title.textContent = `Reserve — ${spotId}`;
    if(reservePerDayEl){ reservePerDayEl.dataset.perDay = perDay; reservePerDayEl.textContent = formatMoney(perDay); }
    // set spot image in the modal
    try{
      const card = document.querySelector(`.parking-card[data-id="${spotId}"]`);
      const imgSrc = card && card.querySelector('img') ? card.querySelector('img').src : 'https://via.placeholder.com/440x260?text=Spot';
      if(reserveSpotImage) reserveSpotImage.src = imgSrc;
    }catch(e){}
    // show per-spot booking notice if there's a max limit configured
    try{
      const notice = document.getElementById('reserveNotice');
      const limit = SPOT_MAX_LIMIT[spotId] || null;
      if(notice){
        if(limit === 'week'){
          notice.textContent = 'Note: This spot can be reserved up to 7 days at a time.';
          notice.classList.remove('important'); notice.style.display = 'block';
        } else if(limit === 'month'){
          notice.textContent = 'Important: This spot can be reserved up to 1 month (31 days) at a time.';
          notice.classList.add('important'); notice.style.display = 'block';
        } else { notice.textContent = ''; notice.style.display = 'none'; notice.classList.remove('important'); }
      }
    }catch(e){}
    // clear previous date selection for a fresh booking
    try{ if(document.getElementById('reserveDateStart')) document.getElementById('reserveDateStart').value = ''; if(document.getElementById('reserveDateEnd')) document.getElementById('reserveDateEnd').value = ''; if(reserveRangeText) reserveRangeText.textContent = '—'; }catch(e){}
    // render calendar for this spot and open modal
    try{ renderReserveCalendar(spotId); }catch(e){ console.warn('calendar render failed', e); }
    recalcReserve();
    if(reserveModal) openModal(reserveModal);
  }

  // Reserve button on cards (delegated)
  document.addEventListener('click', (e) => {
    const rb = e.target.closest && e.target.closest('.reserve-btn');
    if(rb){
      const spot = rb.getAttribute('data-id') || rb.getAttribute('data-spot') || 'p1';
      openReserveForSpot(spot);
    }
  });

  // (quantity/slider/unit controls removed — calendar selection updates pricing)

  // Update submit to include calculated total and selected unit
  if(reserveForm){
    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Validate a date (start) was selected via the calendar
      const startVal = document.getElementById('reserveDateStart') ? document.getElementById('reserveDateStart').value : '';
      if(!startVal){
        try{ alert('Please select a reservation date from the calendar.'); }catch(e){}
        return;
      }
      const data = new FormData(reserveForm);
      const payload = Object.fromEntries(data.entries());
      payload.total = reserveTotalEl ? reserveTotalEl.textContent : '';
      payload.unit = 'day';
      console.log('Reserve request', payload);
      closeModal(reserveModal);
      closeModal(detailsModal);
      try{ alert('Reservation request submitted — we will contact you.'); }catch(e){}
    });
  }

  // Update year placeholder
  const y = new Date().getFullYear();
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = y;

  // Request Access / Contact modal behavior (home page)
  const mainRequestBtn = document.getElementById('mainRequestBtn');
  const requestModal = document.getElementById('requestModal');
  const closeRequestModal = document.getElementById('closeRequestModal');
  const confirmRequest = document.getElementById('confirmRequest');
  const openContactFromRequest = document.getElementById('openContactFromRequest');
  const contactModal = document.getElementById('contactModal');
  const closeContactModal = document.getElementById('closeContactModal');

  function trapFocus(modal){
    if(!modal) return;
    const selectors = 'a[href], area[href], input:not([disabled]):not([type=hidden]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(modal.querySelectorAll(selectors)).filter(el => el.offsetParent !== null || el === document.activeElement);
    if(!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length-1];
    function keyHandler(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey){
        if(document.activeElement === first){ e.preventDefault(); last.focus(); }
      } else {
        if(document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    }
    modal._trapHandler = keyHandler;
    modal.addEventListener('keydown', keyHandler);
    // focus first focusable element
    setTimeout(()=>{ try{ first.focus(); }catch(e){} }, 10);
  }

  function releaseTrap(modal){ if(modal && modal._trapHandler){ modal.removeEventListener('keydown', modal._trapHandler); delete modal._trapHandler; } }

  function openModal(modal){
    if(!modal) return;
    // remember previous focus so we can restore later
    modal._previousFocus = document.activeElement;
    // move modal to document.body to avoid stacking-context clipping if needed
    try{
      if(modal.parentNode !== document.body){
        modal._originalParent = modal.parentNode;
        document.body.appendChild(modal);
        modal._movedToBody = true;
      }
    }catch(e){}
    // prevent body from scrolling while a modal is open
    try{
      modal._prevBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      try{ document.body.classList.add('modal-open'); }catch(e){}
    }catch(e){}
    // set visible state and bring above other content
    modal.setAttribute('aria-hidden','false');
    try{ modal.classList.add('open'); }catch(e){}
    try{ modal.style.zIndex = 10050; }catch(e){}
    // trap focus and add keyboard/backdrop helpers
    trapFocus(modal);
    // backdrop click closes modal
    if(!modal._backdropHandler){
      modal._backdropHandler = function(ev){ if(ev.target === modal){ try{ if(modal._confirmPending){ modal._confirmPending(false); } }catch(e){} closeModal(modal); } };
      modal.addEventListener('click', modal._backdropHandler);
    }
    // escape key handling to close + resolve any pending confirm as false
    if(!modal._escHandler){
      modal._escHandler = function(ev){ if(ev.key === 'Escape'){ try{ if(modal._confirmPending){ modal._confirmPending(false); } }catch(e){} closeModal(modal); } };
      modal.addEventListener('keydown', modal._escHandler);
    }
  }
  function closeModal(modal){
    if(!modal) return;
    // remove focus trap
    releaseTrap(modal);
    // remove open class so CSS can transition out
    try{ modal.classList.remove('open'); }catch(e){}
    modal.setAttribute('aria-hidden','true');
    // restore body scroll
    try{
      if(modal._prevBodyOverflow !== undefined) document.body.style.overflow = modal._prevBodyOverflow; else document.body.style.overflow = '';
      try{ document.body.classList.remove('modal-open'); }catch(e){}
    }catch(e){}
    // remove backdrop/escape handlers if we attached them
    try{
      if(modal._backdropHandler){ modal.removeEventListener('click', modal._backdropHandler); delete modal._backdropHandler; }
      if(modal._escHandler){ modal.removeEventListener('keydown', modal._escHandler); delete modal._escHandler; }
    }catch(e){}
    // restore z-index/style
    try{ modal.style.zIndex = ''; }catch(e){}
    // if modal was moved to body, put it back to its original parent
    try{
      if(modal._movedToBody && modal._originalParent){ modal._originalParent.appendChild(modal); delete modal._originalParent; delete modal._movedToBody; }
    }catch(e){}
    // restore focus
    try{ if(modal._previousFocus && modal._previousFocus.focus) modal._previousFocus.focus(); }catch(e){}
  }

  // (debug helper removed) modal debug outline toggler intentionally purged

  // Toast helper for the reserve modal (transient notices)
  let _reserveToastTimer = null;
  function showReserveToast(message, type){
    try{
      let el = document.getElementById('reserveToast');
      if(!el){ el = document.createElement('div'); el.id = 'reserveToast'; el.className = 'reserve-toast'; document.body.appendChild(el); }
      el.textContent = message;
      el.classList.remove('hint','warn');
      if(type === 'warn') el.classList.add('warn'); else if(type === 'hint') el.classList.add('hint');
      el.style.display = 'block';
      // position inside modal-inner if available
      const modalInner = document.querySelector('#reserveModal .modal-inner');
      if(modalInner && modalInner.contains(el) === false){ modalInner.appendChild(el); }
      // trigger animation
      requestAnimationFrame(()=>{ el.classList.add('show'); el.style.pointerEvents = 'auto'; });
      if(_reserveToastTimer) clearTimeout(_reserveToastTimer);
      _reserveToastTimer = setTimeout(()=>{ try{ el.classList.remove('show'); el.style.pointerEvents='none'; setTimeout(()=>{ el.style.display='none'; }, 420); }catch(e){} }, 3600);
    }catch(e){ console.warn('toast failed', e); }
  }

  // Legacy menu/cart stubs removed — using new modal menu implementation above.

  if(mainRequestBtn && requestModal){
    mainRequestBtn.addEventListener('click', (e) => {
      openModal(requestModal);
    });
  }

  // restore CTA state if previously set
  try{
    if(localStorage.getItem('ctaStarted') === 'true' && mainRequestBtn){ mainRequestBtn.textContent = 'Get Started'; }
  }catch(e){}

  closeRequestModal && closeRequestModal.addEventListener('click', () => closeModal(requestModal));

  if(confirmRequest && mainRequestBtn){
    confirmRequest.addEventListener('click', () => {
      // Open role selection modal instead of immediately toggling CTA
      closeModal(requestModal);
      const roleModal = document.getElementById('roleModal');
      if(roleModal) openModal(roleModal);
    });
  }

  openContactFromRequest && openContactFromRequest.addEventListener('click', () => {
    closeModal(requestModal);
    openModal(contactModal);
  });

  closeContactModal && closeContactModal.addEventListener('click', () => closeModal(contactModal));

  // Role selection -> open form modals
  const roleModal = document.getElementById('roleModal');
  const closeRoleModal = document.getElementById('closeRoleModal');
  const roleVendor = document.getElementById('roleVendor');
  const roleLot = document.getElementById('roleLot');
  const roleCustomer = document.getElementById('roleCustomer');
  const vendorFormModal = document.getElementById('vendorFormModal');
  const lotFormModal = document.getElementById('lotFormModal');
  const customerFormModal = document.getElementById('customerFormModal');

  closeRoleModal && closeRoleModal.addEventListener('click', () => closeModal(roleModal));
  roleVendor && roleVendor.addEventListener('click', () => { closeModal(roleModal); openModal(vendorFormModal); });
  roleLot && roleLot.addEventListener('click', () => { closeModal(roleModal); openModal(lotFormModal); });
  roleCustomer && roleCustomer.addEventListener('click', () => { closeModal(roleModal); openModal(customerFormModal); });

  // Vendor form handlers
  const vendorForm = document.getElementById('vendorForm');
  const closeVendorModal = document.getElementById('closeVendorModal');
  const vendorCancel = document.getElementById('vendorCancel');
  closeVendorModal && closeVendorModal.addEventListener('click', () => closeModal(vendorFormModal));
  vendorCancel && vendorCancel.addEventListener('click', () => closeModal(vendorFormModal));
  vendorForm && vendorForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(vendorForm);
    const payload = Object.fromEntries(data.entries());
    console.log('Vendor request submitted', payload);
    // Compose mailto to open user's email client with prefilled message
    try{
      const to = 'joshua.motley@vanturetech.com';
      const subject = `Vendor Request - ${payload.business || payload.fullName || 'New Vendor'}`;
      const today = new Date().toLocaleDateString();
      let body = '';
      body += `**Letter of Intent (LOI)**\n\n`;
      body += `This non-binding letter of intent ("LOI") expresses our mutual excitement and intention to work together as detailed below. Final details, terms, and conditions will be as mutually agreed in a separate, binding agreement ("Definitive Agreement"). This LOI is meant to assist our negotiation of the Definitive Agreement. As such, this LOI is non-binding and no liability nor obligation is intended to be created between either of us, except for the portion called Confidentiality. This LOI does not require either of us to enter into a Definitive Agreement nor does it preclude the Definitive Agreement from including additional provisions.\n\n`;
      body += `Information:\n`;
      body += `Full Name: ${payload.fullName || ''}\n`;
      body += `Business Email: ${payload.email || ''}\n`;
      body += `Phone: ${payload.phone || ''}\n`;
      body += `Business Name: ${payload.business || ''}\n`;
      body += `Interested in using Vanture: ${payload.consent ? 'Yes' : 'No'}\n`;
      body += `Date: ${today}\n\n`;
      body += `---\nSubmitted from: ${window.location.href}\nUser Agent: ${navigator.userAgent}`;
      const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      // Close the modal and open the mail client
      closeModal(vendorFormModal);
      if(mainRequestBtn){ mainRequestBtn.textContent = 'Get Started'; try{ localStorage.setItem('ctaStarted','true'); }catch(e){} }
      window.location.href = mailto;
    }catch(err){
      console.warn('Failed to compose mailto link', err);
      closeModal(vendorFormModal);
      alert('Thanks — your vendor request has been submitted.');
    }
  });

  // Lot owner form handlers
  const lotForm = document.getElementById('lotForm');
  const closeLotModal = document.getElementById('closeLotModal');
  const lotCancelEl = document.getElementById('lotCancel');
  closeLotModal && closeLotModal.addEventListener('click', () => closeModal(lotFormModal));
  lotCancelEl && lotCancelEl.addEventListener('click', () => closeModal(lotFormModal));
  lotForm && lotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(lotForm);
    const payload = Object.fromEntries(data.entries());
    console.log('Lot owner request submitted', payload);
    // Compose mailto for lot owner requests
    try{
      const to = 'joshua.motley@vanturetech.com';
      const subject = `Lot Owner Request - ${payload.business || payload.fullName || 'New Lot Owner'}`;
      const today = new Date().toLocaleDateString();
      let body = '';
      body += `**Letter of Intent (LOI)**\n\n`;
      body += `This non-binding letter of intent ("LOI") expresses our mutual excitement and intention to work together as detailed below. Final details, terms, and conditions will be as mutually agreed in a separate, binding agreement ("Definitive Agreement"). This LOI is meant to assist our negotiation of the Definitive Agreement. As such, this LOI is non-binding and no liability nor obligation is intended to be created between either of us, except for the portion called Confidentiality. This LOI does not require either of us to enter into a Definitive Agreement nor does it preclude the Definitive Agreement from including additional provisions.\n\n`;
      body += `Information:\n`;
      body += `Full Name: ${payload.fullName || ''}\n`;
      body += `Business Email: ${payload.email || ''}\n`;
      body += `Phone: ${payload.phone || ''}\n`;
      body += `Business Name: ${payload.business || ''}\n`;
      body += `Location / Address: ${payload.location || ''}\n`;
      body += `Interested in using Vanture: ${payload.consent ? 'Yes' : 'No'}\n`;
      body += `Date: ${today}\n\n`;
      body += `---\nSubmitted from: ${window.location.href}\nUser Agent: ${navigator.userAgent}`;
      const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      closeModal(lotFormModal);
      if(mainRequestBtn){ mainRequestBtn.textContent = 'Get Started'; try{ localStorage.setItem('ctaStarted','true'); }catch(e){} }
      window.location.href = mailto;
    }catch(err){
      console.warn('Failed to compose mailto link', err);
      closeModal(lotFormModal);
      alert('Thanks — your lot owner request has been submitted.');
    }
  });

  // Customer form handlers
  const customerForm = document.getElementById('customerForm');
  const closeCustomerModal = document.getElementById('closeCustomerModal');
  const customerCancel = document.getElementById('customerCancel');
  closeCustomerModal && closeCustomerModal.addEventListener('click', () => closeModal(customerFormModal));
  customerCancel && customerCancel.addEventListener('click', () => closeModal(customerFormModal));
  customerForm && customerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(customerForm);
    const payload = Object.fromEntries(data.entries());
    console.log('Customer request submitted', payload);
    closeModal(customerFormModal);
    if(mainRequestBtn){ mainRequestBtn.textContent = 'Get Started'; try{ localStorage.setItem('ctaStarted','true'); }catch(e){} }
    alert('Thanks — we will keep you updated.');
  });

  // Thumbnail fallback helper — attempt to use files in `images/` then fall back to placeholder
  (function wireThumbnailFallbacks(){
    try{
      document.querySelectorAll('.thumbnail').forEach(img => {
        const fallback = img.getAttribute('data-fallback');
        // set onerror to swap to fallback placeholder if local image missing
        if(fallback) img.onerror = function(){ this.onerror = null; this.src = fallback; };

        // If the thumbnail currently points to a placeholder, try replacing with a logical images/ filename
        try{
          const src = img.getAttribute('src') || '';
          if(src.includes('via.placeholder.com') || src.includes('/assets/images/')){
            const alt = (img.getAttribute('alt') || '').toLowerCase();
            const slug = alt.replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').replace(/-thumbnail$/,'');
            img.src = `images/${slug}.jpg`;
          }
        }catch(e){}
      });
    }catch(e){ console.warn('thumbnail fallback wiring failed', e); }
  })();

});
