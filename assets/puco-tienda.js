/* Vitrinas, súper ofertas y ayudas de compra de PuCo Tech. */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* Niches measured from the generated empty-room photos (percent of 16:9). */
  const NICHE = {
    tecnologia: {
      cols: [[16.15, 32.25], [33.85, 49.55], [50.75, 66.65], [68.05, 84.25]],
      rows: [[17.80, 33.15], [34.85, 50.55], [52.25, 67.55]]
    },
    hogar: {
      /* 4×3 over the whole cabinet (not the short 4-row boards) so photos stay large. */
      cols: [[18.80, 33.40], [34.20, 48.80], [49.60, 64.20], [65.00, 79.60]],
      rows: [[15.60, 28.90], [29.90, 43.20], [44.20, 57.50]]
    }
  };
  const CAT_ORDER = {
    tecnologia: ["Cables y energía", "Celulares y foto", "Audio", "Iluminación", "Accesorios"],
    hogar: ["Cocina y hogar", "Relojes", "Accesorios"]
  };

  const pages = {};
  let soloSuper = false;
  let qvId = null;
  let lastMobile = null;

  function G() { return window.Galeria || {}; }
  function prodMap() { return (G().PROD) || (typeof PROD !== "undefined" && PROD) || {}; }
  function store() {
    const map = G().tiendaPorId || (typeof tiendaPorId !== "undefined" ? tiendaPorId : null);
    return (map && map.matteo) || null;
  }
  function allProducts() {
    const t = store();
    const P = prodMap();
    return (t && t.productos || []).map((p) => P[p.id] || p);
  }
  function esSuper(p) {
    return !!(p && p.superOferta);
  }
  function sortSuper(arr) {
    return arr.slice().sort((a, b) => (b.superAhorro || 0) - (a.superAhorro || 0));
  }
  function isMobileShelf() {
    const st = $("#stage");
    return !st || st.clientWidth < 840;
  }
  function currentSalaId(explicit) {
    if (explicit) return explicit;
    const t = store();
    if (!t || !t.salas || !t.salas.length) return "tecnologia";
    const hash = (location.hash || "").replace(/^#/, "");
    const sid = hash.split("/")[1];
    if (sid && t.salas.some((s) => s.id === sid)) return sid;
    return t.salas[0].id;
  }
  function sortForShelf(list, sid) {
    return list.slice().sort((a, b) => {
      const ta = a.tendencia || 0, tb = b.tendencia || 0;
      if (tb !== ta) return tb - ta;
      return (b.superAhorro || 0) - (a.superAhorro || 0);
    });
  }
  function tileImg(p) {
    if (typeof window.pucoPicture === "function") return window.pucoPicture(p, "tile");
    return `<img src="${esc(p.img)}" alt="" loading="lazy" decoding="async">`;
  }
  function pageKey(sid) {
    return sid + (soloSuper ? ":super" : "");
  }

  function tileHTML(p) {
    const html = G().precioHTML ? G().precioHTML(p) : (p.precio != null ? "S/ " + p.precio : "");
    const superB = esSuper(p);
    const tmp = document.createElement("div"); tmp.innerHTML = html;
    const lista = tmp.querySelector(".precio-lista");
    const oferta = tmp.querySelector(".precio-oferta");
    const tag = oferta
      ? `<s>${esc(lista ? lista.textContent : "")}</s><b>${esc(oferta.textContent)}</b>`
      : `<b>${esc(tmp.textContent)}</b>`;
    const trend = !!p.tendenciaTop;
    return `<button type="button" class="puco-tile${superB ? " super" : ""}${trend ? " tendencia" : ""}" data-id="${esc(p.id)}" aria-label="${esc(p.nombre)}">
      <span class="puco-frame">${trend ? '<span class="puco-trend" aria-hidden="true">⭐ Tendencia</span>' : ""}${superB ? '<span class="puco-so" aria-hidden="true">🔥</span>' : ""}${tileImg(p)}</span>
      <span class="puco-tag">${tag}</span>
    </button>`;
  }

  function bindTiles(root) {
    root.querySelectorAll(".puco-tile").forEach((btn) => {
      btn.onclick = (e) => { e.stopPropagation(); abrirQV(btn.dataset.id, btn); };
    });
  }

  function goPage(sid, dir, maxPage) {
    const k = pageKey(sid);
    const next = Math.max(0, Math.min(maxPage, (pages[k] || 0) + dir));
    if (next === (pages[k] || 0)) return;
    pages[k] = next;
    if (typeof pintarSpots === "function") pintarSpots();
  }

  window.pintarPucoEstantes = function (spots, tStore, salaId) {
    const t = tStore || store();
    if (!t) return;
    /* The gold shelves are already filled with reference merchandising in the
       room photo. The landing is decorative — no product tiles, prices, fire
       icons or pager. One CTA opens the real catalog. */
    const wrap = document.createElement("div");
    wrap.className = "puco-shelf is-vitrina";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "puco-enter-cat";
    btn.innerHTML = "<span>Entrar al catálogo</span><small>Ver todos los productos</small>";
    btn.onclick = (e) => {
      e.stopPropagation();
      if (typeof window.pucoSetSuper === "function") window.pucoSetSuper(false);
      if (typeof abrirBuscador === "function") abrirBuscador(t);
    };
    wrap.appendChild(btn);
    wrap.addEventListener("pointerdown", (e) => { e.stopPropagation(); });
    spots.appendChild(wrap);
  };

  function abrirQV(id, fromEl) {
    const p = prodMap()[id] || allProducts().find((x) => x.id === id);
    if (!p) return;
    qvId = id;
    const qv = $("#qvImg");
    const stem = (window.pucoStem && window.pucoStem(p)) || null;
    if (stem) {
      qv.src = stem + "-800.webp";
      qv.srcset = stem + "-400.webp 400w, " + stem + "-800.webp 800w";
      qv.sizes = "(max-width: 720px) 92vw, 520px";
    } else {
      qv.removeAttribute("srcset"); qv.removeAttribute("sizes"); qv.src = p.img;
    }
    qv.alt = p.nombre;
    $("#qvName").textContent = p.nombre;
    $("#qvPrice").innerHTML = G().precioHTML ? G().precioHTML(p) : "";
    const semana = !!(p && p.productoSemana);
    const prota = !!(p && p.protagonistaMes);
    const so = esSuper(p) || semana || prota;
    $("#qvSo").hidden = !so;
    $("#qvSo").textContent = semana
      ? "🔥 Producto de la semana · Envío gratis desde S/ 200"
      : (prota ? "Protagonista del mes · Envío gratis desde S/ 200" : "🔥 Súper oferta");
    let tr = $("#qvTrend");
    if (!tr) {
      tr = document.createElement("span"); tr.id = "qvTrend"; tr.className = "qv-trend";
      const soEl = $("#qvSo");
      if (soEl && soEl.parentNode) soEl.parentNode.insertBefore(tr, soEl.nextSibling);
      else ($("#qvName") || document.body).appendChild(tr);
    }
    tr.hidden = !p.tendenciaTop;
    tr.textContent = p.tendenciaTop ? "⭐ Tendencia" : "";
    const nota = $("#qvNota");
    if (p && p.productoSemana) { nota.hidden = false; nota.textContent = "Precio especial de la semana (S/ 154.90 en otras tiendas). El 10% de la tienda no se acumula. Envío gratis desde S/ 200."; }
    else if (p && p.protagonistaMes) { nota.hidden = false; nota.textContent = "Precio especial de protagonista del mes. El 10% de la tienda no se acumula. Envío gratis desde S/ 200."; }
    else if (p && p.precioVenta != null) { nota.hidden = true; }
    else if (store() && store().descuento) { nota.hidden = false; nota.textContent = "10% de descuento en toda la tienda"; }
    else { nota.hidden = true; }
    const add = $("#qvAdd");
    add.textContent = "Agregar a la canasta";
    add.classList.remove("ok");
    add.onclick = () => {
      if (G().agregar) G().agregar(p.id, 1);
      flyToCart(fromEl || add, p.img);
      add.textContent = "✓ Agregado";
      add.classList.add("ok");
      setTimeout(() => {
        const qv = $("#pucoQV");
        if (qv) qv.classList.remove("open");
        const scrim = $("#scrim");
        if (scrim && !document.querySelector(".layer.open")) scrim.classList.remove("on");
        add.textContent = "Agregar a la canasta";
        add.classList.remove("ok");
      }, 900);
    };
    $("#qvDetalle").onclick = () => {
      document.querySelectorAll(".layer.open").forEach((l) => l.classList.remove("open"));
      if (typeof abrirProducto === "function") abrirProducto(p.id);
      else if (G().abrirProducto) G().abrirProducto(p.id);
    };
    document.querySelectorAll(".layer.open").forEach((l) => l.classList.remove("open"));
    $("#pucoQV").classList.add("open");
    $("#scrim").classList.add("on");
  }

  function flyToCart(fromEl, src) {
    const cart = $("#cartBtn");
    if (!fromEl || !cart) return;
    const a = fromEl.getBoundingClientRect();
    const b = cart.getBoundingClientRect();
    const img = document.createElement("img");
    img.className = "puco-fly";
    img.src = src;
    img.alt = "";
    const x0 = a.left + a.width / 2 - 28, y0 = a.top + a.height / 2 - 28;
    const x1 = b.left + b.width / 2 - 28, y1 = b.top + b.height / 2 - 28;
    img.style.left = x0 + "px";
    img.style.top = y0 + "px";
    document.body.appendChild(img);
    requestAnimationFrame(() => {
      img.style.transform = `translate(${x1 - x0}px, ${y1 - y0}px) scale(.35)`;
      img.style.opacity = "0.2";
    });
    setTimeout(() => img.remove(), 750);
  }

  function setSuper(on) {
    soloSuper = !!on;
    const btn = $("#pucoSuperBtn");
    if (btn) {
      btn.setAttribute("aria-pressed", soloSuper ? "true" : "false");
      btn.classList.toggle("on", soloSuper);
    }
    const st = store();
    if (soloSuper && st && typeof abrirBuscador === "function") abrirBuscador(st);
  }


  function pucoSubtotal() {
    const P = prodMap();
    const items = (G().carrito || []).filter((i) => {
      const p = P[i.id];
      return p && p.tienda === "matteo";
    });
    let n = 0;
    items.forEach((i) => {
      const p = P[i.id];
      const v = G().precioNum ? G().precioNum(p, p.precio == null ? null : p.precio * i.qty) : null;
      if (v != null) n += v;
    });
    return Math.round(n * 100) / 100;
  }
  function pucoCount() {
    const P = prodMap();
    return (G().carrito || []).reduce((s, i) => {
      const p = P[i.id];
      return s + (p && p.tienda === "matteo" ? i.qty : 0);
    }, 0);
  }
  function pintarSticky() {
    const bar = $("#pucoSticky");
    if (!bar) return;
    const n = pucoCount();
    const tot = pucoSubtotal();
    const inStore = document.body.classList.contains("tienda-puco");
    const show = n > 0 && (inStore || window.matchMedia("(max-width:720px)").matches);
    bar.hidden = !show;
    bar.classList.toggle("on", show && n > 0);
    if ($("#psCount")) $("#psCount").textContent = n === 1 ? "1 producto" : n + " productos";
    if ($("#psTotal") && G().precioNum) {
      const soles = (n, m) => (m || "S/") + " " + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      /* use page formatter if possible: read cartTotal later */
      let mostrar = tot;
      const vol = G().descVolumenDe ? G().descVolumenDe(tot) : null;
      if (vol && vol.monto) mostrar = Math.round((tot - vol.monto) * 100) / 100;
      $("#psTotal").textContent = "S/ " + mostrar.toFixed(2);
    }
  }

  window.pucoEsSuperOferta = esSuper;
  window.pucoSoloSuper = () => soloSuper;
  window.pucoSetSuper = setSuper;
  window.pucoEnvioDe = function (cli, subtotal) {
    const cfg = typeof PUCO_ENVIO !== "undefined" ? PUCO_ENVIO : null;
    if (!cfg) return { monto: 0, zona: { id: "recojo", nombre: "Recojo" }, gratis: true };
    const envio = (cli && cli.envio) || "delivery";
    if (envio === "recojo") return { monto: 0, zona: cfg.zonas.recojo, gratis: true };
    const d = (cli && cli.distrito) || "";
    let zona = cfg.zonas.provincias;
    if (cfg.zonas.lima.distritos.includes(d)) zona = cfg.zonas.lima;
    else if (cfg.zonas.alejada.distritos.includes(d)) zona = cfg.zonas.alejada;
    const umbral = cfg.gratisDesde || 200;
    const sub = subtotal == null ? pucoSubtotal() : subtotal;
    if ((zona.id === "lima" || zona.id === "alejada") && sub >= umbral) {
      return { monto: 0, zona, gratis: true, umbral, sub, falta: 0 };
    }
    const falta = (zona.id === "lima" || zona.id === "alejada") ? Math.max(0, Math.round((umbral - sub) * 100) / 100) : null;
    return { monto: zona.precio, zona, gratis: false, pagoEnDestino: !!zona.pagoEnDestino, umbral, sub, falta };
  };
  window.pucoPintarSticky = pintarSticky;
  window.pucoAbrirQV = abrirQV;

  function bind() {
    const superBtn = $("#pucoSuperBtn");
    if (superBtn) superBtn.onclick = () => {
      setSuper(!soloSuper);
      /* if turning on, also jump view a bit toward the island */
    };
    const allBtn = $("#pucoAllBtn");
    if (allBtn) allBtn.onclick = () => {
      const t = store();
      if (t && typeof abrirBuscador === "function") abrirBuscador(t);
    };
    const semBtn = $("#pucoSemana");
    if (semBtn) semBtn.onclick = () => {
      if (typeof abrirProducto === "function") abrirProducto("puco-102");
      else if (G().abrirProducto) G().abrirProducto("puco-102");
    };
    document.querySelectorAll(".puco-prota[data-id]").forEach((btn) => {
      btn.onclick = () => {
        const id = btn.getAttribute("data-id");
        if (!id) return;
        if (typeof abrirProducto === "function") abrirProducto(id);
        else if (G().abrirProducto) G().abrirProducto(id);
      };
    });
    const semCue = $("#pucoSemanaCue");
    if (semCue) semCue.onclick = () => {
      if (typeof abrirProducto === "function") abrirProducto("puco-102");
      else if (G().abrirProducto) G().abrirProducto("puco-102");
    };
    const buy = $("#psComprar");
    if (buy) buy.onclick = () => { if (typeof pintarCarrito === "function") pintarCarrito(); $("#cartBtn").click(); };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bind);
  else bind();


  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!document.body.classList.contains("tienda-puco")) return;
      const now = isMobileShelf();
      if (now !== lastMobile && typeof pintarSpots === "function") pintarSpots();
    }, 80);
  });
  if (typeof window.pintarSpots === "function" && document.body.classList.contains("tienda-puco")) {
    window.pintarSpots();
  }
})();
