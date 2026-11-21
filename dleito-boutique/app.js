/* =====================================================================
   D’LEITO BOUTIQUE — APLICACIÓN (demo, sin dependencias)
   Secciones: utilidades · estado · router · vistas · carrito · checkout
              · buscador · asistente · arranque
   Los datos editables están en data.js.
   ===================================================================== */
(() => {
  "use strict";

  /* ------------------------------------------------------------------
     UTILIDADES
     ------------------------------------------------------------------ */
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = (n) => "$" + Number(n).toFixed(2).replace(".", ",");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,;:]/g, " ").replace(/\s+/g, " ").trim();
  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || id;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const storage = {
    get(key, fallback) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
    },
    set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* modo privado */ } },
  };

  const I = (p, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${p}</svg>`;
  const ICON = {
    search: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    heart: I('<path d="M12 20s-7-4.4-9.2-8.6C1.2 8.2 3 4.5 6.6 4.5c2.1 0 3.4 1.2 4.1 2.3h.6c.7-1.1 2-2.3 4.1-2.3 3.6 0 5.4 3.7 3.8 6.9C19 15.6 12 20 12 20Z"/>'),
    bag: I('<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>'),
    x: I('<path d="M6 6l12 12M18 6 6 18"/>'),
    arrow: I('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    back: I('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
    whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3Z"/></svg>',
    instagram: I('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>'),
    pin: I('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    truck: I('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
    store: I('<path d="M4 9h16l-1-4H5L4 9Z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>'),
    box: I('<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/>'),
    globe: I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.7 5.6 3.7 9s-1.2 6.4-3.7 9c-2.5-2.6-3.7-5.6-3.7-9S9.5 5.6 12 3Z"/>'),
    card: I('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>'),
    bank: I('<path d="M3 9 12 4l9 5M4 9h16M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"/>'),
    cash: I('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/>'),
    send: I('<path d="M4 12 20 4l-6 16-3-7-7-1Z"/>'),
    check: I('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="2.2"'),
    info: I('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),
    filter: I('<path d="M4 6h16M7 12h10M10 18h4"/>'),
    zoom: I('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>'),
    sparkle: I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>'),
  };
  const fillIcons = (root = document) => $$("[data-icon]", root).forEach((el) => { if (!el.dataset.filled) { el.insertAdjacentHTML("afterbegin", ICON[el.dataset.icon] || ""); el.dataset.filled = 1; } });

  /* ------------------------------------------------------------------
     ESTADO (carrito y favoritos en localStorage)
     ------------------------------------------------------------------ */
  const state = {
    cart: storage.get("dl_cart", []).filter((l) => byId(l.id)),
    favs: storage.get("dl_favs", []).filter((id) => byId(id)),
  };
  const saveCart = () => { storage.set("dl_cart", state.cart); renderCartUI(); };
  const saveFavs = () => { storage.set("dl_favs", state.favs); renderFavUI(); };
  const cartQty = () => state.cart.reduce((a, l) => a + l.qty, 0);
  const cartSubtotal = () => state.cart.reduce((a, l) => a + byId(l.id).price * l.qty, 0);

  function addToCart(id, { size, color, qty = 1 } = {}) {
    const p = byId(id);
    size = size || p.sizes[Math.floor((p.sizes.length - 1) / 2)];
    color = color || p.colors[0].name;
    const key = `${id}|${size}|${color}`;
    const line = state.cart.find((l) => l.key === key);
    if (line) line.qty = Math.min(line.qty + qty, 20);
    else state.cart.push({ key, id, size, color, qty });
    saveCart();
    bumpCount("cartCount");
    return { size, color };
  }

  function toggleFav(id, btn) {
    const i = state.favs.indexOf(id);
    if (i > -1) state.favs.splice(i, 1); else state.favs.push(id);
    saveFavs();
    const on = state.favs.includes(id);
    $$(`[data-fav="${id}"]`).forEach((b) => { b.setAttribute("aria-pressed", on); b.setAttribute("aria-label", on ? "Quitar de favoritos" : "Añadir a favoritos"); });
    if (btn && on) { btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop"); }
    if (on) bumpCount("favCount");
    toast(on ? "Añadido a favoritos" : "Quitado de favoritos", byId(id).img);
    if (route().parts[0] === "favoritos") render(false);
  }

  function bumpCount(idEl) {
    const el = document.getElementById(idEl);
    const host = el.parentElement;
    host.classList.remove("bump"); void host.offsetWidth; host.classList.add("bump");
  }

  function renderFavUI() {
    const c = $("#favCount"); c.textContent = state.favs.length; c.classList.toggle("has", state.favs.length > 0);
  }

  /* ------------------------------------------------------------------
     ROUTER (hash): #/  #/tienda/:cat  #/producto/:id  #/favoritos  #/checkout
     ------------------------------------------------------------------ */
  function route() {
    const h = location.hash.replace(/^#/, "") || "/";
    const [path, qs] = h.split("?");
    return { parts: path.split("/").filter(Boolean), params: new URLSearchParams(qs || "") };
  }

  const NAV = [
    { href: "#/", label: "Inicio", key: "" },
    ...CATEGORIES.map((c) => ({ href: `#/tienda/${c.id}`, label: c.name, key: c.id, hot: c.id === "jorgito" })),
    { href: "#/tienda/ofertas", label: "Ofertas", key: "ofertas" },
  ];

  function buildNav() {
    $("#nav").innerHTML = NAV.map((n) => `<a href="${n.href}" data-key="${n.key}" class="${n.hot ? "hot" : ""}">${n.label}</a>`).join("");
    $("#mnav").innerHTML =
      NAV.map((n, i) => `<a href="${n.href}" style="--i:${i}">${n.label}<small>${n.key === "jorgito" ? "EXCLUSIVO" : ""}</small></a>`).join("") +
      `<a href="#/favoritos" style="--i:${NAV.length}">Favoritos<small>${state.favs.length || ""}</small></a>
       <div class="mnav-foot"><a class="btn btn-gold" style="opacity:1;transform:none;border:0;font-family:var(--sans);font-size:12px" href="${STORE.whatsappLink}" target="_blank" rel="noopener">${ICON.whatsapp} WhatsApp</a>
       <a class="btn btn-ghost" style="opacity:1;transform:none;font-family:var(--sans);font-size:12px" href="${STORE.instagram}" target="_blank" rel="noopener">${ICON.instagram} Instagram</a></div>`;
    $("#footNav").innerHTML = NAV.map((n) => `<a href="${n.href}">${n.label}</a>`).join("") + `<a href="${STORE.instagram}" target="_blank" rel="noopener">Instagram</a><a href="${STORE.maps}" target="_blank" rel="noopener">Ubicación</a>`;
  }

  function markNav() {
    const r = route();
    const key = r.parts[0] === "tienda" ? r.parts[1] || "todos" : r.parts.length ? "_" : "";
    $$("#nav a").forEach((a) => a.classList.toggle("on", a.dataset.key === key));
  }

  /* ------------------------------------------------------------------
     RENDER DE VISTAS con transición suave
     ------------------------------------------------------------------ */
  const view = $("#view");
  let first = true;

  async function render(animate = true) {
    closeAll();
    const r = route();
    const go = () => {
      const [a, b] = r.parts;
      let html;
      if (!a) html = viewHome();
      else if (a === "tienda") html = viewShop(b || "todos", r.params);
      else if (a === "producto") html = viewProduct(b);
      else if (a === "favoritos") html = viewFavs();
      else if (a === "checkout") html = viewCheckout();
      else html = viewNotFound();
      if (!a && !first) document.body.classList.remove("play");
      view.innerHTML = html;
      if (!a && !first) requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.add("play")));
      fillIcons(view);
      document.body.classList.toggle("is-home", !a);
      markNav();
      onHeaderScroll();
      if (a === "tienda") bindShop(b || "todos", r.params);
      if (a === "producto") bindProduct(b);
      if (a === "checkout") bindCheckout();
      observeReveals();
    };
    if (first || !animate || reduced) { go(); first = false; return; }
    view.classList.add("leaving");
    await wait(220);
    window.scrollTo({ top: 0, behavior: "instant" });
    go();
    requestAnimationFrame(() => view.classList.remove("leaving"));
  }

  /* Scroll reveal */
  let io;
  function observeReveals() {
    if (reduced || !("IntersectionObserver" in window)) { $$(".rv").forEach((e) => e.classList.add("in")); return; }
    io && io.disconnect();
    io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".rv:not(.in)").forEach((e) => io.observe(e));
  }

  /* ------------------------------------------------------------------
     COMPONENTES
     ------------------------------------------------------------------ */
  function productCard(p, i = 0) {
    const fav = state.favs.includes(p.id);
    const badges = [p.isNew ? `<span class="badge">Nuevo</span>` : "", p.oldPrice ? `<span class="badge g">Oferta</span>` : "", p.categories.includes("jorgito") ? `<span class="badge g">Jorgito</span>` : ""].join("");
    return `<article class="card rv" style="--i:${i % 4}">
      <a class="card-media" href="#/producto/${p.id}" aria-label="Ver ${esc(p.name)}">
        <img src="${p.img}" alt="${esc(p.name)} — fotografía real del producto" loading="lazy" width="600" height="600" />
        <span class="badges">${badges}</span>
      </a>
      <button class="fav" data-fav="${p.id}" aria-pressed="${fav}" aria-label="${fav ? "Quitar de favoritos" : "Añadir a favoritos"}">${ICON.heart}</button>
      <div class="quick"><button class="btn" data-quickadd="${p.id}"><span class="lbl">Añadir al carrito</span></button></div>
      <div class="card-body">
        <span class="card-cat">${p.categories.map(catName).slice(0, 2).join(" · ")}</span>
        <h3><a href="#/producto/${p.id}">${esc(p.name)}</a></h3>
        <div class="price">${money(p.price)} ${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""}<small>PRECIO ILUSTRATIVO</small></div>
        <div class="card-foot">
          <a class="btn btn-line" href="#/producto/${p.id}"><span class="lbl">Ver producto</span></a>
          <button class="cart-mini" data-quickadd="${p.id}" aria-label="Añadir ${esc(p.name)} al carrito">${ICON.bag}</button>
        </div>
      </div>
    </article>`;
  }

  const emptyState = (icon, title, text, cta = "") =>
    `<div class="empty rv"><div class="ic">${ICON[icon]}</div><h3>${title}</h3><p>${text}</p>${cta}</div>`;

  /* ------------------------------------------------------------------
     VISTA: INICIO
     ------------------------------------------------------------------ */
  function viewHome() {
    const featured = PRODUCTS.filter((p) => p.featured);
    const jorgito = PRODUCTS.filter((p) => p.categories.includes("jorgito"));
    const cats = CATEGORIES.map((c, i) => {
      const cls = c.featured ? "cat featured" : "cat";
      return `<a class="${cls} rv" style="--i:${i}" href="#/tienda/${c.id}">
        <img src="${c.img}" alt="" loading="lazy" style="object-position:${c.pos};--z:${c.zoom};transform-origin:${c.pos}" />
        <div class="cat-body"><div><span class="cat-n">0${i + 1}</span><h3>${c.name}</h3><p>${c.note}</p></div><span class="arrow">${ICON.arrow}</span></div>
      </a>`;
    }).join("");
    const marq = Array(2).fill(`<span>Tu estilo<i>✦</i></span><span>Tu identidad<i>✦</i></span><span>Colección Jorgito<i>✦</i></span><span>Hecho en Guayaquil<i>✦</i></span><span>Streetwear premium<i>✦</i></span><span>Auténtico estilo guayaco<i>✦</i></span>`).join("");

    return `
    <section class="hero" aria-label="Portada">
      <div class="hero-media"><img src="${ASSETS.hero}" alt="Jorgito el Guayaco con chaqueta negra y camiseta Guayaco" fetchpriority="high" /></div>
      <div class="hero-glow"></div>
      <div class="hero-copy">
        <span class="eyebrow fade f1">Guayaquil · Ecuador</span>
        <h1 class="h-display"><span class="ln"><span>D’LEITO</span></span><span class="ln"><span>Boutique</span></span></h1>
        <p class="hero-tag fade f2">TU ESTILO<i>.</i> TU IDENTIDAD<i>.</i></p>
        <p class="hero-desc fade f3">Descubre prendas que destacan tu personalidad.</p>
        <div class="hero-cta fade f4">
          <a class="btn btn-gold" href="#/tienda/todos"><span class="lbl">Explorar colección</span>${ICON.arrow}</a>
          <a class="btn btn-ghost" href="#/tienda/novedades"><span class="lbl">Ver novedades</span></a>
        </div>
      </div>
      <div class="hero-scroll" aria-hidden="true">DESLIZA<i></i></div>
      <div class="hero-side" aria-hidden="true">COLECCIÓN 2026 — D’LEITO</div>
    </section>

    <div class="marquee" aria-hidden="true"><div class="marquee-track">${marq}</div></div>

    <section class="sec" id="categorias">
      <div class="wrap">
        <div class="sec-head">
          <div><span class="eyebrow rv">Categorías</span><h2 class="h-sec rv" style="--i:1">Encuentra <em>tu</em> estilo</h2></div>
          <p class="lead rv" style="--i:2">Moda urbana y piezas con identidad para toda la familia. Elige una categoría y descubre la colección.</p>
        </div>
        <div class="cats">${cats}</div>
      </div>
    </section>

    <section class="sec white" id="destacados">
      <div class="wrap">
        <div class="sec-head">
          <div><span class="eyebrow rv">Destacados</span><h2 class="h-sec rv" style="--i:1">Lo más <em>buscado</em></h2></div>
          <a class="link-u rv" style="--i:2" href="#/tienda/todos">Ver todo el catálogo ${ICON.arrow}</a>
        </div>
        <div class="grid">${featured.map(productCard).join("")}</div>
      </div>
    </section>

    <section class="sec jorgito" id="coleccion-jorgito">
      <div class="bgword" aria-hidden="true">Guayaco</div>
      <div class="wrap">
        <div class="jg">
          <div class="jg-photo rv"><img src="${ASSETS.hero}" alt="Jorgito el Guayaco" loading="lazy" /><span class="jg-frame"></span>
            <span class="stamp"><span>EDICIÓN EXCLUSIVA</span><b>Jorgito el Guayaco</b></span></div>
          <div>
            <span class="eyebrow rv">Colección exclusiva</span>
            <h2 class="h-display rv" style="--i:1"><span>COLECCIÓN</span><span>Jorgito</span></h2>
            <p class="jg-sub rv" style="--i:2">AUTÉNTICO ESTILO GUAYACO</p>
            <p class="lead rv" style="--i:3">Camisetas y accesorios con la personalidad de Jorgito el Guayaco. Piezas de colección para quienes llevan Guayaquil en la sangre.</p>
            <div class="jg-cta rv" style="--i:4"><a class="btn btn-gold" href="#/tienda/jorgito"><span class="lbl">Descubrir colección</span>${ICON.arrow}</a></div>
          </div>
        </div>
        <div class="jg-products grid">${jorgito.map(productCard).join("")}</div>
      </div>
    </section>

    <section class="sec" id="envios">
      <div class="wrap">
        <div class="sec-head">
          <div><span class="eyebrow rv">Entregas</span><h2 class="h-sec rv" style="--i:1">¿Cómo quieres <em>recibir</em> tu pedido?</h2></div>
          <p class="lead rv" style="--i:2">Opciones de la demo. Las tarifas son ilustrativas y la cobertura está pendiente de confirmación comercial.</p>
        </div>
        <div class="ship-grid">
          ${shipInfo("truck", SHIPPING.delivery.label, "Indica tu sector, dirección y una referencia.", SHIPPING.delivery, 0)}
          ${shipInfo("store", SHIPPING.pickup.label, `Recoge en la boutique. <a class="link-u" style="font-size:10.5px;margin-top:6px" href="${STORE.maps}" target="_blank" rel="noopener">Ver ubicación en Google Maps</a>`, SHIPPING.pickup, 1)}
          ${shipInfo("box", SHIPPING.national.label, "A cualquier provincia y ciudad del Ecuador.", SHIPPING.national, 2)}
          ${shipInfo("globe", SHIPPING.international.label, "Indica país, región, ciudad y dirección.", SHIPPING.international, 3)}
        </div>
      </div>
    </section>

    ${contactSection()}`;
  }

  function shipInfo(icon, title, text, s, i) {
    const cost = s.cost === null ? "Por cotizar" : money(s.cost);
    return `<div class="ship rv" style="--i:${i}"><div class="ic">${ICON[icon]}</div><h3>${title}</h3><p>${text}</p><div class="cost">${cost}<small>${s.note}</small></div></div>`;
  }

  function contactSection() {
    return `<section class="sec dark" id="contacto">
      <div class="wrap contact">
        <div>
          <span class="eyebrow rv">Contacto</span>
          <h2 class="h-display rv" style="--i:1;margin:18px 0 28px">D’LEITO<br><em style="color:var(--gold)">Boutique</em></h2>
          <div class="contact-list">
            <a class="c-item rv" style="--i:2" href="${STORE.whatsappLink}" target="_blank" rel="noopener"><span class="ic">${ICON.whatsapp}</span><span><small>WHATSAPP</small><b>${STORE.whatsappDisplay}</b></span><span class="go">${ICON.arrow}</span></a>
            <a class="c-item rv" style="--i:3" href="${STORE.instagram}" target="_blank" rel="noopener"><span class="ic">${ICON.instagram}</span><span><small>INSTAGRAM</small><b>${STORE.instagramHandle}</b></span><span class="go">${ICON.arrow}</span></a>
            <a class="c-item rv" style="--i:4" href="${STORE.maps}" target="_blank" rel="noopener"><span class="ic">${ICON.pin}</span><span><small>UBICACIÓN</small><b>${STORE.city}</b></span><span class="go">${ICON.arrow}</span></a>
          </div>
        </div>
        <div class="mapcard rv" style="--i:2">
          <svg class="map" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs><pattern id="g" width="26" height="26" patternUnits="userSpaceOnUse"><path d="M26 0H0V26" fill="none" stroke="rgba(200,164,77,.08)"/></pattern></defs>
            <rect width="400" height="400" fill="url(#g)"/>
            <path d="M-10 250 C 80 220, 120 300, 210 260 S 330 190, 420 230" stroke="rgba(200,164,77,.35)" stroke-width="18" fill="none"/>
            <path d="M40 -10 L 120 410 M 300 -10 L 230 410 M -10 120 L 410 160 M -10 330 L 410 300" stroke="rgba(255,255,255,.08)" stroke-width="3"/>
          </svg>
          <span class="pin"></span>
          <div class="mc-body">
            <span class="eyebrow">Guayaquil · Ecuador</span>
            <h3>Visítanos en la boutique</h3>
            <a class="btn btn-gold" href="${STORE.maps}" target="_blank" rel="noopener"><span class="lbl">Ver ubicación en Google Maps</span>${ICON.pin}</a>
          </div>
        </div>
      </div>
    </section>`;
  }

  /* ------------------------------------------------------------------
     VISTA: CATÁLOGO + FILTROS
     ------------------------------------------------------------------ */
  const SPECIAL = { todos: "Toda la colección", ofertas: "Ofertas", novedades: "Novedades" };
  const allSizes = [...new Set(PRODUCTS.flatMap((p) => p.sizes))];
  const allColors = [...new Map(PRODUCTS.flatMap((p) => p.colors).map((c) => [c.name, c])).values()];
  const allBrands = [...new Set(PRODUCTS.map((p) => p.brand))];
  const maxPrice = Math.ceil(Math.max(...PRODUCTS.map((p) => p.price)) / 5) * 5;
  let filt = null;

  function inCat(p, cat) {
    if (cat === "todos") return true;
    if (cat === "ofertas") return !!p.oldPrice;
    if (cat === "novedades") return !!p.isNew;
    return p.categories.includes(cat);
  }

  function viewShop(cat, params) {
    const title = SPECIAL[cat] || catName(cat);
    const c = CATEGORIES.find((x) => x.id === cat);
    filt = { cat, q: params.get("q") || "", sizes: new Set(), colors: new Set(), brands: new Set(), max: maxPrice, sort: "featured" };
    const catChips = [["todos", "Todo"], ...CATEGORIES.map((x) => [x.id, x.name]), ["ofertas", "Ofertas"], ["novedades", "Novedades"]];
    return `
    <section class="shop-head">
      <div class="wrap" style="position:relative;z-index:2">
        <nav class="crumbs rv"><a href="#/">Inicio</a><span>/</span><span>Tienda</span><span>/</span><span style="color:var(--gold)">${title}</span></nav>
        <h1 class="h-display rv" style="--i:1">${cat === "jorgito" ? 'Colección <em style="color:var(--gold)">Jorgito</em>' : title}</h1>
        <p class="rv" style="--i:2">${c ? c.note : "Fotografías reales de productos D’Leito Boutique."} · Precios ilustrativos</p>
      </div>
    </section>
    <div class="wrap shop">
      <aside class="filters" id="filters" aria-label="Filtros">
        <div class="filters-sheet-head"><h3>Filtros</h3><button class="icon-btn" data-action="close-filters" aria-label="Cerrar filtros">${ICON.x}</button></div>
        <div class="f-group"><h4>Buscar</h4><div class="search-in">${ICON.search}<input class="input" id="fq" type="search" placeholder="Nombre del producto" value="${esc(filt.q)}" /></div></div>
        <div class="f-group"><h4>Categoría</h4><div class="chips" id="fcat">${catChips.map(([id, n]) => `<button class="chip ${id === cat ? "on" : ""}" data-cat="${id}">${n}</button>`).join("")}</div></div>
        <div class="f-group"><h4>Talla</h4><div class="chips" id="fsize">${allSizes.map((s) => `<button class="chip sq" data-size="${esc(s)}" aria-pressed="false">${esc(s)}</button>`).join("")}</div></div>
        <div class="f-group"><h4>Precio máximo</h4><input class="range" id="fmax" type="range" min="5" max="${maxPrice}" step="1" value="${maxPrice}" aria-label="Precio máximo" /><div class="range-out"><span>$5</span><b id="fmaxOut">${money(maxPrice)}</b></div></div>
        <div class="f-group"><h4>Color</h4><div class="swatches" id="fcolor">${allColors.map((c) => `<button class="sw" data-color="${esc(c.name)}" aria-pressed="false"><i style="background:${c.hex}"></i>${esc(c.name)}</button>`).join("")}</div></div>
        <div class="f-group"><h4>Marca</h4><div class="checks" id="fbrand">${allBrands.map((b) => `<label class="check"><input type="checkbox" value="${esc(b)}" />${esc(b)}</label>`).join("")}</div></div>
        <button class="btn btn-line btn-block" data-action="reset-filters"><span class="lbl">Limpiar filtros</span></button>
        <button class="btn btn-dark btn-block filter-toggle" data-action="close-filters"><span class="lbl">Ver resultados</span></button>
      </aside>
      <div>
        <div class="shop-bar">
          <button class="btn btn-line filter-toggle" data-action="open-filters" style="height:42px;padding:0 18px">${ICON.filter}<span class="lbl">Filtros</span></button>
          <span class="count-txt" id="resCount"></span>
          <label class="sr" for="fsort">Ordenar</label>
          <select class="input" id="fsort"><option value="featured">Destacados</option><option value="price-asc">Precio: menor a mayor</option><option value="price-desc">Precio: mayor a menor</option><option value="name">Nombre A–Z</option></select>
        </div>
        <div class="notice rv" style="margin-bottom:22px">${ICON.info}<span>Catálogo demostrativo con <b>fotografías reales</b> de D’Leito Boutique. Los precios son <b>ficticios</b> hasta disponer de los valores oficiales.</span></div>
        <div class="grid" id="shopGrid"></div>
      </div>
    </div>`;
  }

  function applyFilters() {
    const q = norm(filt.q);
    let list = PRODUCTS.filter((p) =>
      inCat(p, filt.cat) &&
      (!q || norm(p.name + " " + p.categories.map(catName).join(" ") + " " + p.brand).includes(q)) &&
      (!filt.sizes.size || p.sizes.some((s) => filt.sizes.has(s))) &&
      (!filt.colors.size || p.colors.some((c) => filt.colors.has(c.name))) &&
      (!filt.brands.size || filt.brands.has(p.brand)) &&
      p.price <= filt.max
    );
    if (filt.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (filt.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (filt.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "es"));
    const grid = $("#shopGrid");
    if (!grid) return;
    grid.classList.remove("swap"); void grid.offsetWidth; grid.classList.add("swap");
    grid.innerHTML = list.length
      ? list.map(productCard).join("")
      : emptyState("search", "Sin resultados", "No hay productos que coincidan con estos filtros. Prueba otra combinación o escríbenos: podemos ayudarte a encontrar tu prenda.", `<button class="btn btn-dark" data-action="reset-filters"><span class="lbl">Limpiar filtros</span></button>`);
    $("#resCount").textContent = `${list.length} ${list.length === 1 ? "producto" : "productos"}`;
    grid.style.gridColumn = list.length ? "" : "1 / -1";
    $$(".rv", grid).forEach((e) => e.classList.add("in"));
  }

  function bindShop() {
    const toggleSet = (set, val, btn) => { set.has(val) ? set.delete(val) : set.add(val); btn.classList.toggle("on", set.has(val)); btn.setAttribute("aria-pressed", set.has(val)); applyFilters(); };
    $("#fq").addEventListener("input", (e) => { filt.q = e.target.value; applyFilters(); });
    $("#fcat").addEventListener("click", (e) => {
      const b = e.target.closest("[data-cat]"); if (!b) return;
      filt.cat = b.dataset.cat; $$("#fcat .chip").forEach((c) => c.classList.toggle("on", c === b));
      history.replaceState(null, "", `#/tienda/${filt.cat}`); markNav(); applyFilters();
    });
    $("#fsize").addEventListener("click", (e) => { const b = e.target.closest("[data-size]"); if (b) toggleSet(filt.sizes, b.dataset.size, b); });
    $("#fcolor").addEventListener("click", (e) => { const b = e.target.closest("[data-color]"); if (b) toggleSet(filt.colors, b.dataset.color, b); });
    $("#fbrand").addEventListener("change", (e) => { e.target.checked ? filt.brands.add(e.target.value) : filt.brands.delete(e.target.value); applyFilters(); });
    $("#fmax").addEventListener("input", (e) => { filt.max = +e.target.value; $("#fmaxOut").textContent = money(filt.max); applyFilters(); });
    $("#fsort").addEventListener("change", (e) => { filt.sort = e.target.value; applyFilters(); });
    applyFilters();
  }

  function resetFilters() {
    Object.assign(filt, { q: "", sizes: new Set(), colors: new Set(), brands: new Set(), max: maxPrice, sort: "featured" });
    $("#fq").value = ""; $("#fmax").value = maxPrice; $("#fmaxOut").textContent = money(maxPrice); $("#fsort").value = "featured";
    $$("#fsize .chip, #fcolor .sw").forEach((b) => { b.classList.remove("on"); b.setAttribute("aria-pressed", false); });
    $$("#fbrand input").forEach((i) => (i.checked = false));
    applyFilters();
  }

  /* ------------------------------------------------------------------
     VISTA: PRODUCTO
     ------------------------------------------------------------------ */
  let pdp = null;
  function viewProduct(id) {
    const p = byId(id);
    if (!p) return viewNotFound();
    pdp = { id, size: p.sizes.length === 1 ? p.sizes[0] : null, color: p.colors[0].name, qty: 1, view: 0 };
    // Vistas de galería: la misma fotografía original con distintos encuadres (no se edita el archivo).
    const views = [
      { label: "Vista completa", pos: "50% 50%", z: 1 },
      { label: "Detalle superior", pos: "50% 28%", z: 1.9 },
      { label: "Detalle inferior", pos: "50% 78%", z: 1.9 },
    ];
    pdp.views = views;
    const related = PRODUCTS.filter((x) => x.id !== id).sort((a, b) => b.categories.filter((c) => p.categories.includes(c)).length - a.categories.filter((c) => p.categories.includes(c)).length);
    const fav = state.favs.includes(id);
    const waText = encodeURIComponent(`Hola D’Leito Boutique 👋 Quiero consultar por: ${p.name}. (Vi el producto en la demo de la tienda online)`);
    return `<div class="page"><div class="wrap">
      <div class="pdp">
        <div class="gallery rv">
          <div class="thumbs">${views.map((v, i) => `<button class="thumb ${i === 0 ? "on" : ""}" data-view="${i}" aria-label="${v.label}"><img src="${p.img}" alt="" style="object-position:${v.pos};transform:scale(${v.z});transform-origin:${v.pos}" /></button>`).join("")}</div>
          <div class="main-img" id="mainImg" role="button" tabindex="0" aria-label="Ampliar imagen">
            <img src="${p.img}" alt="${esc(p.name)} — fotografía real" id="mainPic" />
            <span class="hint">${ICON.zoom} AMPLIAR</span>
          </div>
        </div>
        <div class="info">
          <nav class="crumbs rv"><a href="#/">Inicio</a><span>/</span><a href="#/tienda/${p.categories[0]}">${catName(p.categories[0])}</a></nav>
          <div class="rv" style="--i:1"><span class="card-cat">${p.categories.map(catName).join(" · ")} · ${esc(p.brand)}</span>
            <h1 class="h-display" style="margin-top:10px">${esc(p.name)}</h1></div>
          <div class="price rv" style="--i:2">${money(p.price)} ${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ""} <span class="demo-tag" style="color:var(--gold-3)">Precio ilustrativo</span></div>
          <p class="desc rv" style="--i:3">${esc(p.desc)}</p>
          <div class="rv" style="--i:3"><div class="opt-head"><span class="lbl-sm">Color</span><span id="colorName">${esc(pdp.color)}</span></div>
            <div class="swatches" id="pColors">${p.colors.map((c, i) => `<button class="sw ${i === 0 ? "on" : ""}" data-pcolor="${esc(c.name)}"><i style="background:${c.hex}"></i>${esc(c.name)}</button>`).join("")}</div></div>
          <div class="rv" style="--i:4" id="sizeBox"><div class="opt-head"><span class="lbl-sm">Talla</span><span>Guía de tallas: pendiente</span></div>
            <div class="chips" id="pSizes">${p.sizes.map((s) => `<button class="chip sq ${pdp.size === s ? "on" : ""}" data-psize="${esc(s)}">${esc(s)}</button>`).join("")}</div>
            <p class="err-txt" id="sizeErr" hidden>Selecciona una talla para continuar.</p></div>
          <div class="buy rv" style="--i:5">
            <div class="qty" aria-label="Cantidad"><button data-pqty="-1" aria-label="Restar">−</button><output id="pQty">1</output><button data-pqty="1" aria-label="Sumar">+</button></div>
            <button class="btn btn-dark" id="addBtn"><span class="lbl">Agregar al carrito</span><span class="spin"></span></button>
          </div>
          <div class="buy-2 rv" style="--i:6">
            <button class="btn btn-gold" id="buyNow"><span class="lbl">Comprar ahora</span></button>
            <a class="btn btn-wa" href="${STORE.whatsappLink}?text=${waText}" target="_blank" rel="noopener">${ICON.whatsapp}<span class="lbl">Consultar</span></a>
          </div>
          <button class="link-u rv" style="--i:6;justify-self:start" data-fav="${id}" aria-pressed="${fav}">${ICON.heart}<span>Favoritos</span></button>
          <div class="acc rv" style="--i:7">
            <details open><summary>Detalles</summary><ul>${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul></details>
            <details><summary>Entrega</summary><ul><li>Delivery en Guayaquil: ${money(SHIPPING.delivery.cost)} (ilustrativo)</li><li>Retiro en tienda: pendiente de confirmación</li><li>Envíos nacionales e internacionales: por cotizar</li></ul></details>
            <details><summary>Aviso de demostración</summary><ul><li>Fotografía real del producto, sin modificaciones.</li><li>Precio, tallas y materiales: datos demostrativos.</li><li>No se procesan pagos ni pedidos reales.</li></ul></details>
          </div>
        </div>
      </div>
      <section style="padding:40px 0 110px">
        <div class="sec-head"><div><span class="eyebrow rv">También te puede gustar</span><h2 class="h-sec rv" style="--i:1">Productos <em>relacionados</em></h2></div></div>
        <div class="grid">${related.map(productCard).join("")}</div>
      </section>
    </div></div>`;
  }

  function bindProduct(id) {
    const p = byId(id);
    if (!p) return;
    const main = $("#mainImg"), pic = $("#mainPic");
    const setView = (i) => {
      pdp.view = i; const v = pdp.views[i];
      $$(".thumb").forEach((t) => t.classList.toggle("on", +t.dataset.view === i));
      pic.style.opacity = 0;
      setTimeout(() => { pic.style.objectPosition = v.pos; pic.style.transformOrigin = v.pos; pic.style.transform = `scale(${v.z})`; pic.style.opacity = 1; }, reduced ? 0 : 200);
    };
    $(".thumbs").addEventListener("click", (e) => { const t = e.target.closest("[data-view]"); if (t) setView(+t.dataset.view); });
    // Zoom con el cursor (solo dispositivos con hover)
    if (window.matchMedia("(hover:hover)").matches && !reduced) {
      main.addEventListener("mousemove", (e) => {
        const r = main.getBoundingClientRect();
        main.classList.add("zooming");
        pic.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`;
        pic.style.transform = `scale(${Math.max(pdp.views[pdp.view].z, 1) * 1.7})`;
      });
      main.addEventListener("mouseleave", () => { main.classList.remove("zooming"); const v = pdp.views[pdp.view]; pic.style.transformOrigin = v.pos; pic.style.transform = `scale(${v.z})`; });
    }
    const openLb = () => openLightbox(p.img, p.name);
    main.addEventListener("click", openLb);
    main.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(); } });

    $("#pColors").addEventListener("click", (e) => {
      const b = e.target.closest("[data-pcolor]"); if (!b) return;
      pdp.color = b.dataset.pcolor; $$("#pColors .sw").forEach((s) => s.classList.toggle("on", s === b)); $("#colorName").textContent = pdp.color;
    });
    $("#pSizes").addEventListener("click", (e) => {
      const b = e.target.closest("[data-psize]"); if (!b) return;
      pdp.size = b.dataset.psize; $$("#pSizes .chip").forEach((s) => s.classList.toggle("on", s === b)); $("#sizeErr").hidden = true;
    });
    $$("[data-pqty]").forEach((b) => b.addEventListener("click", () => { pdp.qty = Math.min(20, Math.max(1, pdp.qty + +b.dataset.pqty)); $("#pQty").textContent = pdp.qty; }));

    const needSize = () => {
      if (pdp.size) return false;
      $("#sizeErr").hidden = false; const box = $("#sizeBox"); box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
      return true;
    };
    $("#addBtn").addEventListener("click", async (e) => {
      if (needSize()) return;
      const btn = e.currentTarget; btn.classList.add("loading");
      await wait(reduced ? 0 : 450);
      addToCart(id, { size: pdp.size, color: pdp.color, qty: pdp.qty });
      flyToCart(pic);
      btn.classList.remove("loading"); btn.classList.add("done"); $(".lbl", btn).textContent = "Agregado ✓";
      toast(`<b>${esc(p.name)}</b><br><small>Talla ${esc(pdp.size)} · ${esc(pdp.color)} · x${pdp.qty}</small>`, p.img, true);
      setTimeout(() => { btn.classList.remove("done"); $(".lbl", btn).textContent = "Agregar al carrito"; }, 1800);
    });
    $("#buyNow").addEventListener("click", () => { if (needSize()) return; addToCart(id, { size: pdp.size, color: pdp.color, qty: pdp.qty }); location.hash = "#/checkout"; });
  }

  /* ------------------------------------------------------------------
     VISTA: FAVORITOS / 404
     ------------------------------------------------------------------ */
  function viewFavs() {
    const list = state.favs.map(byId).filter(Boolean);
    return `<div class="page"><div class="wrap" style="padding-bottom:110px">
      <div class="sec-head" style="margin-top:20px"><div><span class="eyebrow rv">Tu selección</span><h1 class="h-sec rv" style="--i:1">Mis <em>favoritos</em></h1></div></div>
      ${list.length ? `<div class="grid">${list.map(productCard).join("")}</div>` : emptyState("heart", "Aún no tienes favoritos", "Toca el corazón de cualquier prenda para guardarla aquí. Se conservan en este dispositivo.", `<a class="btn btn-dark" href="#/tienda/todos"><span class="lbl">Explorar colección</span></a>`)}
    </div></div>`;
  }
  const viewNotFound = () => `<div class="page"><div class="wrap" style="padding:40px 0 120px">${emptyState("search", "Página no encontrada", "El enlace no existe o el producto ya no está disponible.", `<a class="btn btn-dark" href="#/"><span class="lbl">Volver al inicio</span></a>`)}</div></div>`;

  /* ------------------------------------------------------------------
     CARRITO (drawer)
     ------------------------------------------------------------------ */
  function renderCartUI() {
    const n = cartQty();
    const c = $("#cartCount"); c.textContent = n; c.classList.toggle("has", n > 0);
    $("#drawerCount").textContent = n ? `(${n})` : "";
    const body = $("#drawerBody"), foot = $("#drawerFoot");
    if (!state.cart.length) {
      body.innerHTML = `<div class="empty" style="margin-top:24px;border:0"><div class="ic">${ICON.bag}</div><h3>Tu carrito está vacío</h3><p>Descubre la colección y agrega tus prendas favoritas.</p><a class="btn btn-dark" href="#/tienda/todos" data-action="close-cart"><span class="lbl">Explorar colección</span></a></div>`;
      foot.innerHTML = "";
      foot.style.display = "none";
      return;
    }
    foot.style.display = "";
    body.innerHTML = state.cart.map((l) => {
      const p = byId(l.id);
      return `<div class="line" data-line="${esc(l.key)}">
        <img src="${p.img}" alt="${esc(p.name)}" />
        <div><h4>${esc(p.name)}</h4><div class="meta">Talla ${esc(l.size)} · ${esc(l.color)}</div>
          <div class="row"><div class="qty sm"><button data-lqty="-1" aria-label="Restar">−</button><output>${l.qty}</output><button data-lqty="1" aria-label="Sumar">+</button></div><b>${money(p.price * l.qty)}</b></div>
          <div class="row" style="margin-top:6px"><button class="rm" data-lrm>Eliminar</button></div></div>
      </div>`;
    }).join("");
    foot.innerHTML = `
      <div class="sum-row"><span>Subtotal</span><b>${money(cartSubtotal())}</b></div>
      <div class="sum-row"><small>Envío calculado en el checkout · precios ilustrativos</small></div>
      <a class="btn btn-dark btn-block" href="#/checkout"><span class="lbl">Finalizar compra</span>${ICON.arrow}</a>
      <button class="btn btn-line btn-block" data-action="close-cart"><span class="lbl">Seguir comprando</span></button>
      <button class="text-btn" id="emptyCart">Vaciar carrito</button>`;
  }

  $("#drawerBody").addEventListener("click", async (e) => {
    const lineEl = e.target.closest("[data-line]"); if (!lineEl) return;
    const line = state.cart.find((l) => l.key === lineEl.dataset.line); if (!line) return;
    const q = e.target.closest("[data-lqty]");
    if (q) { line.qty = Math.min(20, Math.max(1, line.qty + +q.dataset.lqty)); saveCart(); }
    if (e.target.closest("[data-lrm]")) {
      lineEl.classList.add("out"); await wait(reduced ? 0 : 380);
      state.cart = state.cart.filter((l) => l !== line); saveCart();
    }
  });
  $("#drawerFoot").addEventListener("click", (e) => {
    if (e.target.id !== "emptyCart") return;
    const b = e.target;
    if (b.dataset.confirm) { state.cart = []; saveCart(); toast("Carrito vaciado"); return; }
    b.dataset.confirm = 1; b.textContent = "¿Seguro? Toca de nuevo para vaciar";
    setTimeout(() => { if (b.isConnected) { delete b.dataset.confirm; b.textContent = "Vaciar carrito"; } }, 3000);
  });

  function flyToCart(imgEl) {
    if (reduced || !imgEl) return;
    const from = imgEl.getBoundingClientRect(), to = $("#cartBtn").getBoundingClientRect();
    const size = Math.min(from.width, 140);
    const f = document.createElement("img");
    f.src = imgEl.src; f.className = "fly";
    Object.assign(f.style, { width: size + "px", height: size + "px", left: from.left + from.width / 2 - size / 2 + "px", top: from.top + from.height / 2 - size / 2 + "px" });
    document.body.appendChild(f);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2), dy = to.top + to.height / 2 - (from.top + from.height / 2);
    f.animate(
      [{ transform: "translate(0,0) scale(1)", opacity: 1 }, { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 60}px) scale(.5)`, opacity: 0.9, offset: 0.6 }, { transform: `translate(${dx}px, ${dy}px) scale(.12)`, opacity: 0.2 }],
      { duration: 850, easing: "cubic-bezier(.5,0,.3,1)" }
    ).onfinish = () => { f.remove(); bumpCount("cartCount"); };
  }

  /* ------------------------------------------------------------------
     CHECKOUT (4 pasos, todo demostrativo)
     ------------------------------------------------------------------ */
  const co = { step: 1, customer: { name: "", phone: "", email: "" }, delivery: { type: "", data: {} }, payment: { type: "", simulated: false }, order: null };
  const STEPS = ["Datos", "Entrega", "Pago", "Confirmación"];
  const shipCost = () => (co.delivery.type ? SHIPPING[co.delivery.type].cost : null);

  function viewCheckout() {
    if (co.order && state.cart.length) Object.assign(co, { step: 1, delivery: { type: "", data: {} }, payment: { type: "", simulated: false }, order: null });
    if (!state.cart.length && !co.order) {
      return `<div class="page"><div class="wrap" style="padding:40px 0 120px">${emptyState("bag", "Tu carrito está vacío", "Agrega productos para simular una compra completa.", `<a class="btn btn-dark" href="#/tienda/todos"><span class="lbl">Explorar colección</span></a>`)}</div></div>`;
    }
    return `<div class="page"><div class="wrap">
      <span class="eyebrow" style="margin-top:20px">Compra segura · Demostración</span>
      <h1 class="h-display">Finalizar <em style="color:var(--gold)">compra</em></h1>
      <div class="co"><div><div id="steps"></div><div id="coPanel"></div></div><aside class="summary" id="coSummary"></aside></div>
    </div></div>`;
  }

  function bindCheckout() { if ($("#coPanel")) drawCheckout(); }

  function drawSteps() {
    const p = (co.step - 1) / (STEPS.length - 1);
    $("#steps").innerHTML = `<div class="steps" style="--p:0"><div class="track"><i></i></div>${STEPS.map((s, i) => `<div class="step ${i + 1 === co.step ? "on" : ""} ${i + 1 < co.step ? "done" : ""}"><b>${i + 1 < co.step ? ICON.check.replace("<svg", '<svg style="width:16px"') : i + 1}</b><span>${s}</span></div>`).join("")}</div>`;
    requestAnimationFrame(() => requestAnimationFrame(() => $(".steps").style.setProperty("--p", p)));
  }

  function drawSummary() {
    const items = co.order ? co.order.items : state.cart;
    const sub = items.reduce((a, l) => a + byId(l.id).price * l.qty, 0);
    const sc = co.order ? co.order.ship : shipCost();
    const shipTxt = !co.delivery.type ? "Elige en el paso 2" : sc === null ? "Por cotizar" : money(sc);
    const total = sub + (sc || 0);
    $("#coSummary").innerHTML = `
      <button class="co-sum-toggle" data-action="toggle-summary"><span>Resumen (${items.reduce((a, l) => a + l.qty, 0)})</span><b>${money(total)}</b></button>
      <h3>Resumen del pedido</h3>
      <div class="sum-lines">${items.map((l) => { const p = byId(l.id); return `<div class="line" style="animation:none"><img src="${p.img}" alt="" /><div><h4>${esc(p.name)}</h4><div class="meta">Talla ${esc(l.size)} · ${esc(l.color)} · x${l.qty}</div><div style="margin-top:6px;font-weight:700">${money(p.price * l.qty)}</div></div></div>`; }).join("")}</div>
      <div class="sum-row"><span>Subtotal</span><span>${money(sub)}</span></div>
      <div class="sum-row"><span>Entrega</span><span>${shipTxt}</span></div>
      <div class="sum-row total"><span>Total</span><span>${money(total)}${sc === null && co.delivery.type ? " + envío" : ""}</span></div>
      <div class="notice">${ICON.info}<span>Precios y tarifas ilustrativos. No se procesan pagos reales.</span></div>`;
  }

  function field(id, label, value = "", attrs = "", full = false) {
    return `<div class="field ${full ? "full" : ""}" data-f="${id}"><label for="${id}">${label}</label><input class="input" id="${id}" value="${esc(value)}" ${attrs} /><span class="msg"></span></div>`;
  }
  function setErr(id, msg) { const f = $(`[data-f="${id}"]`); if (!f) return; f.classList.toggle("err", !!msg); $(".msg", f).textContent = msg || ""; }

  function drawCheckout() {
    drawSteps(); drawSummary();
    const panel = $("#coPanel");
    const nav = (backLbl, nextLbl, nextId = "coNext") => `<div class="co-nav">${backLbl ? `<button class="btn btn-line" id="coBack"><span class="lbl">${backLbl}</span></button>` : `<a class="btn btn-line" href="#/tienda/todos"><span class="lbl">Seguir comprando</span></a>`}<button class="btn btn-dark" id="${nextId}"><span class="lbl">${nextLbl}</span><span class="spin"></span></button></div>`;

    if (co.step === 1) {
      const c = co.customer;
      panel.innerHTML = `<div class="panel"><h2>Datos del cliente</h2><p class="lead">Solo para la demostración: no se guardan ni se envían a ningún servidor.</p>
        <div class="form-grid">
          ${field("cName", "Nombre y apellido", c.name, 'autocomplete="name" placeholder="Ej. María Pérez"', true)}
          ${field("cPhone", "Celular / WhatsApp", c.phone, 'type="tel" inputmode="tel" autocomplete="tel" placeholder="09XXXXXXXX"')}
          ${field("cEmail", "Correo (opcional)", c.email, 'type="email" autocomplete="email" placeholder="correo@ejemplo.com"')}
        </div>${nav("", "Continuar a entrega")}</div>`;
      $("#coNext").onclick = () => {
        c.name = $("#cName").value.trim(); c.phone = $("#cPhone").value.trim(); c.email = $("#cEmail").value.trim();
        let ok = true;
        setErr("cName", c.name.length < 3 ? (ok = false, "Escribe tu nombre completo.") : "");
        setErr("cPhone", !/^\+?[\d\s-]{7,15}$/.test(c.phone) ? (ok = false, "Escribe un número válido.") : "");
        setErr("cEmail", c.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) ? (ok = false, "Correo no válido.") : "");
        if (ok) goStep(2); else $(".field.err .input").focus();
      };
    }

    if (co.step === 2) {
      const d = co.delivery;
      const opt = (key, icon, desc) => { const s = SHIPPING[key]; return `<label class="opt ${d.type === key ? "on" : ""}"><input type="radio" name="ship" value="${key}" ${d.type === key ? "checked" : ""} /><span class="ic">${ICON[icon]}</span><span><b>${s.label}</b><small>${desc}</small></span><span class="cost">${s.cost === null ? "Por cotizar" : money(s.cost)}<small>${s.note}</small></span></label>`; };
      panel.innerHTML = `<div class="panel"><h2>¿Cómo quieres recibir tu pedido?</h2><p class="lead">Selecciona una opción. Ningún costo de transporte está confirmado.</p>
        <div class="opts" id="shipOpts">
          ${opt("delivery", "truck", "Entrega a domicilio en la ciudad")}
          ${opt("pickup", "store", "Recoge en D’Leito Boutique")}
          ${opt("national", "box", "A otras provincias y ciudades del Ecuador")}
          ${opt("international", "globe", "Fuera del Ecuador")}
        </div>
        <div id="shipExtra"></div>${nav("Volver", "Continuar al pago")}</div>`;
      const drawExtra = () => {
        const x = d.data, box = $("#shipExtra");
        if (d.type === "delivery") box.innerHTML = `<div class="opt-extra form-grid" style="margin-top:18px">${field("sSector", "Sector / barrio", x.sector, 'placeholder="Ej. Urdesa, Samborondón, Centro"')}${field("sRef", "Referencia", x.ref, 'placeholder="Frente a…, casa color…"')}${field("sAddr", "Dirección", x.addr, 'placeholder="Calle, número, manzana, villa"', true)}</div>`;
        else if (d.type === "pickup") box.innerHTML = `<div class="opt-extra" style="margin-top:18px"><div class="notice">${ICON.info}<span>El retiro en tienda está <b>pendiente de confirmación comercial</b>. Costo de entrega: ${money(0)}.</span></div><a class="btn btn-line" style="justify-self:start" href="${STORE.maps}" target="_blank" rel="noopener">${ICON.pin}<span class="lbl">Ver ubicación en Google Maps</span></a></div>`;
        else if (d.type === "national") box.innerHTML = `<div class="opt-extra form-grid" style="margin-top:18px"><div class="field" data-f="sProv"><label for="sProv">Provincia</label><select class="input" id="sProv"><option value="">Selecciona…</option>${EC_PROVINCES.map((p) => `<option ${x.prov === p ? "selected" : ""}>${p}</option>`).join("")}</select><span class="msg"></span></div>${field("sCity", "Ciudad", x.city, 'placeholder="Ej. Quito"')}${field("sAddr", "Dirección", x.addr, 'placeholder="Dirección completa"', true)}<div class="notice full">${ICON.info}<span>El costo del envío nacional es <b>por cotizar</b>. La boutique lo confirmaría por WhatsApp.</span></div></div>`;
        else if (d.type === "international") box.innerHTML = `<div class="opt-extra form-grid" style="margin-top:18px">${field("sCountry", "País", x.country, 'list="countries" placeholder="Ej. Estados Unidos"')}<datalist id="countries">${["Estados Unidos", "España", "Italia", "Colombia", "Perú", "Chile", "México", "Canadá", "Alemania", "Reino Unido"].map((c) => `<option value="${c}">`).join("")}</datalist>${field("sRegion", "Región / estado", x.region)}${field("sCity", "Ciudad", x.city)}${field("sAddr", "Dirección", x.addr, "", false)}<div class="notice full">${ICON.info}<span>Costo y cobertura internacional <b>por cotizar</b>; no están confirmados.</span></div></div>`;
        else box.innerHTML = "";
      };
      drawExtra();
      $("#shipOpts").addEventListener("change", (e) => { d.type = e.target.value; $$("#shipOpts .opt").forEach((o) => o.classList.toggle("on", $("input", o).checked)); drawExtra(); drawSummary(); });
      $("#coBack").onclick = () => goStep(1);
      $("#coNext").onclick = () => {
        if (!d.type) { toast("Elige un método de entrega"); const o = $("#shipOpts"); o.classList.remove("shake"); void o.offsetWidth; o.classList.add("shake"); return; }
        const val = (id) => ($("#" + id) ? $("#" + id).value.trim() : "");
        const req = { delivery: ["sSector", "sAddr", "sRef"], pickup: [], national: ["sProv", "sCity", "sAddr"], international: ["sCountry", "sCity", "sAddr"] }[d.type];
        let ok = true;
        req.forEach((id) => { const v = val(id); setErr(id, v.length < 2 ? (ok = false, "Campo requerido.") : ""); });
        d.data = { sector: val("sSector"), ref: val("sRef"), addr: val("sAddr"), prov: val("sProv"), city: val("sCity"), country: val("sCountry"), region: val("sRegion") };
        if (ok) goStep(3); else $(".field.err .input").focus();
      };
    }

    if (co.step === 3) {
      const pay = co.payment;
      const opt = (key, icon, title, desc, tag) => `<label class="opt ${pay.type === key ? "on" : ""}"><input type="radio" name="pay" value="${key}" ${pay.type === key ? "checked" : ""} /><span class="ic">${ICON[icon]}</span><span><b>${title}</b><small>${desc}</small></span><span class="cost"><span class="demo-tag" style="color:var(--gold-3)">${tag}</span></span></label>`;
      panel.innerHTML = `<div class="panel"><h2>Método de pago</h2><p class="lead">Todos los métodos son <b>demostrativos</b>. No se solicitan ni procesan datos financieros.</p>
        <div class="opts" id="payOpts">
          ${opt("card", "card", "Tarjeta de crédito o débito", "Visa · Mastercard (ilustrativo)", "Simulado")}
          ${opt("transfer", "bank", "Transferencia bancaria", "Datos bancarios oficiales por confirmar", "Simulado")}
          ${opt("cod", "cash", "Pago contra entrega", "Funcionalidad propuesta", "Por confirmar")}
          ${opt("whatsapp", "whatsapp", "Pedido por WhatsApp", "Envía tu resumen a la boutique", "Manual")}
        </div><div id="payExtra" style="margin-top:18px"></div>${nav("Volver", "Confirmar pedido demo")}</div>`;
      const drawExtra = () => {
        const box = $("#payExtra");
        if (pay.type === "card") {
          box.innerHTML = `<div class="opt-extra"><div class="paycards"><span class="paycard-logo v">VISA</span><span class="paycard-logo m"><i></i><i></i></span><span class="demo-tag" style="align-self:center;color:var(--muted)">Iconos ilustrativos</span></div>
            <div class="democard"><span class="chipc"></span><span class="num">•••• •••• •••• DEMO</span><div class="row"><span>D’LEITO BOUTIQUE<br>TARJETA DE DEMOSTRACIÓN</span><span>12/99</span></div></div>
            <p style="font-size:13.5px;color:var(--muted)">No ingreses datos reales. Este botón solo simula una aprobación.</p>
            ${pay.simulated ? `<div class="ok-box">${ICON.check}Pago simulado aprobado · no se realizó ningún cobro</div>` : `<button class="btn btn-gold" id="simPay" style="justify-self:start"><span class="lbl">Simular pago</span><span class="spin"></span></button>`}</div>`;
          const sp = $("#simPay");
          if (sp) sp.onclick = async () => { sp.classList.add("loading"); await wait(reduced ? 0 : 1500); pay.simulated = true; drawExtra(); };
        } else if (pay.type === "transfer") {
          box.innerHTML = `<div class="opt-extra"><div class="notice">${ICON.info}<span>Transferencia <b>simulada</b>. Los datos bancarios oficiales serían proporcionados por la boutique; en esta demo no se muestran números de cuenta.</span></div></div>`;
        } else if (pay.type === "cod") {
          box.innerHTML = `<div class="opt-extra"><div class="notice">${ICON.info}<span>Pago contra entrega: <b>funcionalidad propuesta pendiente de confirmación</b> por D’Leito Boutique.</span></div></div>`;
        } else if (pay.type === "whatsapp") {
          const txt = orderText();
          box.innerHTML = `<div class="opt-extra"><label class="lbl-sm" for="waTxt">Resumen de tu pedido</label><textarea class="input" id="waTxt" readonly>${esc(txt)}</textarea>
            <div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-line" id="copyWa"><span class="lbl">Copiar resumen</span></button><a class="btn btn-wa" href="${STORE.whatsappLink}?text=${encodeURIComponent(txt)}" target="_blank" rel="noopener">${ICON.whatsapp}<span class="lbl">Abrir WhatsApp</span></a></div>
            <p style="font-size:12.5px;color:var(--muted)">Nada se envía automáticamente: tú decides si abrir WhatsApp y enviar el mensaje.</p></div>`;
          $("#copyWa").onclick = async () => {
            try { await navigator.clipboard.writeText(txt); toast("Resumen copiado"); }
            catch { $("#waTxt").select(); document.execCommand && document.execCommand("copy"); toast("Resumen seleccionado: cópialo con Ctrl/Cmd + C"); }
          };
        } else box.innerHTML = "";
      };
      drawExtra();
      $("#payOpts").addEventListener("change", (e) => { pay.type = e.target.value; $$("#payOpts .opt").forEach((o) => o.classList.toggle("on", $("input", o).checked)); drawExtra(); });
      $("#coBack").onclick = () => goStep(2);
      $("#coNext").onclick = async (e) => {
        if (!pay.type) { toast("Elige un método de pago"); return; }
        if (pay.type === "card" && !pay.simulated) { toast("Primero toca “Simular pago”"); const s = $("#simPay"); s && (s.classList.remove("shake"), void s.offsetWidth, s.classList.add("shake")); return; }
        const b = e.currentTarget; b.classList.add("loading"); await wait(reduced ? 0 : 900);
        co.order = { id: "DEMO-" + Math.random().toString(36).slice(2, 7).toUpperCase(), items: state.cart.map((l) => ({ ...l })), ship: shipCost() };
        state.cart = []; saveCart();
        goStep(4);
      };
    }

    if (co.step === 4) {
      const payLbl = { card: "Tarjeta (pago simulado)", transfer: "Transferencia (simulada)", cod: "Contra entrega (propuesta)", whatsapp: "Pedido por WhatsApp" }[co.payment.type];
      panel.innerHTML = `<div class="panel success">
        <svg class="check" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="#C8A44D" stroke-width="3"/><path d="M30 52 L45 66 L71 37" fill="none" stroke="#0B0B0D" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="eyebrow">Simulación completada</span>
        <h2 class="h-display">¡Gracias, ${esc(co.customer.name.split(" ")[0] || "")}!</h2>
        <span class="order-id">${co.order.id}</span>
        <p class="lead" style="margin:0 auto">Entrega: <b>${SHIPPING[co.delivery.type].label}</b> · Pago: <b>${payLbl}</b>.</p>
        <div class="notice" style="text-align:left;max-width:520px">${ICON.info}<span>Esto es una <b>demostración</b>: no se procesó ningún pago ni se generó un pedido real.</span></div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin-top:8px">
          <button class="btn btn-dark" data-action="new-order"><span class="lbl">Volver al inicio</span></button>
          <a class="btn btn-line" href="${STORE.maps}" target="_blank" rel="noopener">${ICON.pin}<span class="lbl">Ver ubicación</span></a>
        </div></div>`;
    }
    fillIcons(panel);
  }

  function goStep(n) {
    co.step = n; drawCheckout();
    const top = $("#steps").getBoundingClientRect().top + scrollY - 100;
    if (scrollY > top) window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  }

  function orderText() {
    const lines = state.cart.map((l) => { const p = byId(l.id); return `• ${l.qty}x ${p.name} (Talla ${l.size}, ${l.color}) — ${money(p.price * l.qty)}`; });
    const d = co.delivery, x = d.data;
    const where = d.type === "delivery" ? `${x.sector}, ${x.addr} (Ref: ${x.ref})` : d.type === "national" ? `${x.city}, ${x.prov} — ${x.addr}` : d.type === "international" ? `${x.city}, ${x.region} ${x.country} — ${x.addr}` : "Retiro en tienda";
    const sc = shipCost();
    return [
      "Hola D’Leito Boutique 👋 Quiero hacer este pedido (desde la demo de la tienda online):", "", ...lines, "",
      `Subtotal: ${money(cartSubtotal())}`, `Entrega: ${SHIPPING[d.type].label} — ${sc === null ? "por cotizar" : money(sc)}`, `Dirección: ${where}`, "",
      `Nombre: ${co.customer.name}`, `Celular: ${co.customer.phone}`, "", "(Precios ilustrativos de la demo)",
    ].join("\n");
  }

  /* ------------------------------------------------------------------
     BUSCADOR
     ------------------------------------------------------------------ */
  function drawSearch(q) {
    const nq = norm(q);
    const res = $("#searchRes");
    if (!nq) {
      res.innerHTML = `<p class="s-hint">Sugerencias: ${["Camiseta", "Taza", "Niños", "Jorgito"].map((s) => `<button class="chip" data-suggest="${s}" style="margin:4px">${s}</button>`).join("")}</p>`;
      return;
    }
    const list = PRODUCTS.filter((p) => norm(`${p.name} ${p.categories.map(catName).join(" ")} ${p.brand} ${p.desc}`).includes(nq));
    res.innerHTML = list.length
      ? list.map((p, i) => `<a class="s-item" style="animation-delay:${i * 50}ms" href="#/producto/${p.id}"><img src="${p.img}" alt="" /><div><b>${esc(p.name)}</b><span>${p.categories.map(catName).join(" · ")} · ${money(p.price)} (ilustrativo)</span></div></a>`).join("") +
        `<a class="link-u" style="margin-top:10px;justify-self:start" href="#/tienda/todos?q=${encodeURIComponent(q)}">Ver todos los resultados ${ICON.arrow}</a>`
      : `<p class="s-hint">Sin resultados para “${esc(q)}”. Prueba con “camiseta”, “taza” o “niños”.</p>`;
  }
  $("#searchInput").addEventListener("input", (e) => drawSearch(e.target.value));
  $("#searchForm").addEventListener("submit", (e) => { e.preventDefault(); const q = $("#searchInput").value.trim(); location.hash = `#/tienda/todos${q ? "?q=" + encodeURIComponent(q) : ""}`; });
  $("#searchRes").addEventListener("click", (e) => { const s = e.target.closest("[data-suggest]"); if (s) { $("#searchInput").value = s.dataset.suggest; drawSearch(s.dataset.suggest); } });

  /* ------------------------------------------------------------------
     ASISTENTE "PREGÚNTALE A JORGITO"
     ------------------------------------------------------------------ */
  const chat = { started: false, busy: false };
  const linkify = (s) =>
    s.replace("{wa}", `<a href="${STORE.whatsappLink}" target="_blank" rel="noopener">WhatsApp ${STORE.whatsappDisplay}</a>`)
      .replace("{maps}", `<a href="${STORE.maps}" target="_blank" rel="noopener">Ver en Google Maps</a>`)
      .replace("{ig}", `<a href="${STORE.instagram}" target="_blank" rel="noopener">${STORE.instagramHandle}</a>`)
      .replace("{shop}", `<a href="#/tienda/todos">Ver catálogo</a>`)
      .replace("{shopJorgito}", `<a href="#/tienda/jorgito">Ver Colección Jorgito</a>`);

  function localReply(text) {
    const t = " " + norm(text) + " ";
    let best = null, score = 0;
    CHAT_INTENTS.forEach((it) => {
      // Palabra exacta puntúa doble; coincidencia parcial (p. ej. "envio" en "envios") puntúa por longitud.
      const s = it.keys.reduce((a, k) => a + (t.includes(" " + k + " ") ? k.length * 2 : k.length > 4 && t.includes(k) ? k.length : 0), 0);
      if (s > score) { score = s; best = it; }
    });
    return best
      ? linkify(best.reply)
      : linkify("Mmm, esa información todavía no la tengo confirmada 🤔. Para ayudarte mejor, escribe a la boutique por {wa}. También puedes preguntarme por ubicación, tallas, delivery, envíos o pagos.");
  }

  /* Punto de integración futura con IA:
     si CHAT_CONFIG.endpoint apunta a TU backend (que guarda la clave de API),
     se le envía la pregunta y se espera { reply: "texto" }. Si falla, se usan las reglas locales. */
  async function getBotReply(text) {
    if (CHAT_CONFIG.endpoint) {
      try {
        const r = await fetch(CHAT_CONFIG.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
        if (r.ok) { const j = await r.json(); if (j.reply) return esc(j.reply); }
      } catch { /* sin conexión: respuestas locales */ }
    }
    return localReply(text);
  }

  function addMsg(html, who = "bot") {
    const body = $("#chatBody");
    const el = document.createElement("div");
    el.className = `msg ${who}`;
    el.innerHTML = who === "bot" ? `<span class="avatar xs" data-avatar></span><div class="b">${html}</div>` : `<div class="b">${html}</div>`;
    body.appendChild(el);
    paintAvatars(el);
    body.scrollTo({ top: body.scrollHeight, behavior: reduced ? "auto" : "smooth" });
    return el;
  }

  async function botSay(promise) {
    const typing = addMsg("<i></i><i></i><i></i>"); typing.classList.add("typing");
    const [reply] = await Promise.all([promise, wait(reduced ? 0 : 650 + Math.random() * 400)]);
    typing.remove(); addMsg(reply);
  }

  async function ask(text) {
    text = text.trim(); if (!text || chat.busy) return;
    chat.busy = true;
    addMsg(esc(text), "me");
    await botSay(getBotReply(text));
    chat.busy = false;
  }

  function openChat() {
    $("#chat").classList.add("open"); $("#chatFab").classList.remove("hint");
    if (window.matchMedia("(max-width:760px)").matches) document.body.classList.add("lock");
    if (!chat.started) {
      chat.started = true;
      $("#chatQuick").innerHTML = CHAT_CONFIG.quick.map((q) => `<button type="button">${esc(q)}</button>`).join("");
      setTimeout(() => botSay(Promise.resolve(esc(CHAT_CONFIG.welcome))), reduced ? 0 : 300);
    }
    setTimeout(() => window.matchMedia("(hover:hover)").matches && $("#chatInput").focus(), 400);
  }
  function closeChat() { $("#chat").classList.remove("open"); document.body.classList.remove("lock"); }
  $("#chatFab").addEventListener("click", openChat);
  $("#chatForm").addEventListener("submit", (e) => { e.preventDefault(); const i = $("#chatInput"); ask(i.value); i.value = ""; });
  $("#chatQuick").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ask(b.textContent); });
  $("#chatBody").addEventListener("click", (e) => { const a = e.target.closest('a[href^="#/"]'); if (a && window.matchMedia("(max-width:760px)").matches) closeChat(); });

  function paintAvatars(root = document) {
    $$("[data-avatar]", root).forEach((a) => (a.style.backgroundImage = `url("${ASSETS.hero}")`));
  }

  /* ------------------------------------------------------------------
     OVERLAYS: carrito, buscador, menú, filtros, lightbox, toast
     ------------------------------------------------------------------ */
  const scrim = $("#scrim");
  function openLayer(el) { el.classList.add("open"); scrim.classList.add("open"); document.body.classList.add("lock"); }
  function closeAll() {
    ["#drawer", "#search", "#filters", "#lightbox"].forEach((s) => $(s) && $(s).classList.remove("open"));
    scrim.classList.remove("open");
    setMenu(false);
    if (!$("#chat").classList.contains("open")) document.body.classList.remove("lock");
  }
  function setMenu(open) {
    $("#mnav").classList.toggle("open", open);
    const b = $("#burger"); b.classList.toggle("x", open); b.setAttribute("aria-expanded", open); b.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("lock", open);
    document.body.classList.toggle("menu-open", open);
    onHeaderScroll();
  }
  function openLightbox(src, alt) { $("#lightImg").src = src; $("#lightImg").alt = alt; $("#lightbox").classList.add("open"); document.body.classList.add("lock"); }
  $("#lightbox").addEventListener("click", () => { $("#lightbox").classList.remove("open"); document.body.classList.remove("lock"); });
  $("#burger").addEventListener("click", () => setMenu(!$("#mnav").classList.contains("open")));
  $("#mnav").addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  scrim.addEventListener("click", closeAll);

  let toastT;
  function toast(html, img, cartLink = false) {
    const t = $("#toast");
    t.innerHTML = `${img ? `<img src="${img}" alt="" />` : ""}<span class="t-ok">${ICON.check}</span><p>${html}</p>${cartLink ? `<button data-action="cart">Ver carrito</button>` : ""}`;
    t.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 3200);
  }

  /* Delegación global de acciones */
  document.addEventListener("click", async (e) => {
    const fav = e.target.closest("[data-fav]");
    if (fav) { e.preventDefault(); toggleFav(fav.dataset.fav, fav); return; }
    const qa = e.target.closest("[data-quickadd]");
    if (qa) {
      e.preventDefault();
      const p = byId(qa.dataset.quickadd);
      const { size, color } = addToCart(p.id);
      const card = qa.closest(".card"); flyToCart(card && $(".card-media img", card));
      if (qa.classList.contains("cart-mini")) { qa.classList.add("ok"); qa.innerHTML = ICON.check; setTimeout(() => { qa.classList.remove("ok"); qa.innerHTML = ICON.bag; }, 1600); }
      else { const l = $(".lbl", qa); l.textContent = "Agregado ✓"; setTimeout(() => (l.textContent = "Añadir al carrito"), 1600); }
      toast(`<b>${esc(p.name)}</b><br><small>Talla ${esc(size)} · ${esc(color)} — cámbiala en el detalle</small>`, p.img, true);
      return;
    }
    const act = e.target.closest("[data-action]");
    if (!act) return;
    const a = act.dataset.action;
    if (a === "cart") { e.preventDefault(); closeAll(); $("#toast").classList.remove("show"); openLayer($("#drawer")); }
    if (a === "close-cart") { closeAll(); }
    if (a === "search") { closeAll(); openLayer($("#search")); drawSearch($("#searchInput").value); setTimeout(() => $("#searchInput").focus(), 350); }
    if (a === "close-search") closeAll();
    if (a === "open-filters") openLayer($("#filters"));
    if (a === "close-filters") closeAll();
    if (a === "reset-filters") resetFilters();
    if (a === "close-chat") closeChat();
    if (a === "toggle-summary") $("#coSummary").classList.toggle("collapsed");
    if (a === "new-order") { Object.assign(co, { step: 1, delivery: { type: "", data: {} }, payment: { type: "", simulated: false }, order: null }); location.hash = "#/"; }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if ($("#chat").classList.contains("open") && !$(".open:not(#chat)")) closeChat();
    closeAll();
  });

  /* Header: se compacta al hacer scroll */
  const hdr = $("#hdr");
  function onHeaderScroll() {
    const solid = !document.body.classList.contains("is-home") || scrollY > 40 || $("#mnav").classList.contains("open");
    hdr.classList.toggle("solid", solid);
    document.body.classList.toggle("scrolled", scrollY > 320);
  }
  addEventListener("scroll", onHeaderScroll, { passive: true });

  /* ------------------------------------------------------------------
     ARRANQUE: intro breve → hero cinematográfico
     ------------------------------------------------------------------ */
  function boot() {
    fillIcons();
    paintAvatars();
    buildNav();
    $("#fabWa").href = STORE.whatsappLink;
    $("#year").textContent = new Date().getFullYear();
    renderCartUI(); renderFavUI();
    render(false);
    addEventListener("hashchange", () => render(true));

    const intro = $("#intro");
    const isHome = !route().parts.length;
    const finish = () => {
      document.body.classList.add("play", "ready");
      setTimeout(() => !chat.started && $("#chatFab").classList.add("hint"), 2600);
      setTimeout(() => $("#chatFab").classList.remove("hint"), 9000);
    };
    if (reduced || !isHome) { intro.classList.add("gone"); finish(); return; }
    requestAnimationFrame(() => intro.classList.add("on"));
    let done = false;
    const leave = () => {
      if (done) return; done = true;
      intro.classList.add("out");
      setTimeout(finish, 250);
      setTimeout(() => intro.classList.add("gone"), 1100);
    };
    intro.addEventListener("click", leave);
    setTimeout(leave, 1300);
  }
  boot();
})();
