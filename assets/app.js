/* Motor del centro comercial virtual. Normalmente NO necesitas editar este
   archivo: los datos están en assets/catalogo.js */
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const soles = (n, m) => (m || "S/") + " " + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  /* Moneda por producto: { moneda: "US$" } en catalogo.js; por defecto soles (S/) */
  const mon = (p) => p.moneda || "S/";
  const descuentoDe = (p) => {
    if (p && p.descuento != null) return p.descuento;
    if (p && p.descuentoPct != null) return p.descuentoPct / 100;
    const t = p && tiendaPorId[p.tienda];
    return (t && t.descuento) || 0;
  };
  const descuentoPctDe = (p) => {
    if (p && p.descuentoPct != null) return p.descuentoPct;
    const d = descuentoDe(p);
    return d ? Math.round(d * 100) : 0;
  };
  const precioListaNum = (p, n) => (n == null ? (p && p.precio) : n);
  const precioNum = (p, n) => {
    const base = precioListaNum(p, n);
    if (base == null) return null;
    /* precioVenta, si existe, fija el precio final también en el subtotal */
    if (p && p.precioVenta != null && p.precio != null) {
      if (n == null || n === p.precio) return Math.round(p.precioVenta * 100) / 100;
      const qty = n / p.precio;
      if (Number.isFinite(qty)) return Math.round(p.precioVenta * qty * 100) / 100;
    }
    const d = descuentoDe(p);
    return Math.round(base * (1 - d) * 100) / 100;
  };
  const precioDe = (p, n) => {
    const venta = precioNum(p, n);
    if (p && p.precioTexto && (n == null || n === p.precio) && !descuentoPctDe(p)) return p.precioTexto;
    if (venta == null) return "";
    const s = soles(venta, mon(p));
    return p && p.masIgv ? s + " + IGV" : s;
  };
  const precioHTML = (p, n) => {
    if (!p || p.precio == null && n == null) return "Precio a consultar";
    const pct = descuentoPctDe(p);
    const venta = precioDe(p, n);
    if (!pct) return venta;
    const lista = soles(precioListaNum(p, n), mon(p));
    return `<s class="precio-lista">${lista}</s> <b class="precio-oferta">${venta}</b> <span class="dto-badge">-${pct}%</span>`;
  };
  /* Totales por moneda: { "S/": 120, "US$": 150 } -> "S/ 120.00 + US$ 150.00" (nunca se mezclan) */
  const sumar = (a, b) => { Object.keys(b).forEach((m) => (a[m] = (a[m] || 0) + b[m])); return a; };
  const fmtTot = (tot) => { const ms = Object.keys(tot); return ms.length ? ms.map((m) => soles(tot[m], m)).join(" + ") : soles(0); };
  const qs = new URLSearchParams(location.search);

  /* ---------- Campaña activa ---------- */
  function campañaPorFecha(hoy) {
    const md = String(hoy.getMonth() + 1).padStart(2, "0") + "-" + String(hoy.getDate()).padStart(2, "0");
    for (const [k, c] of Object.entries(CAMPAÑAS)) {
      if (!c.fechas) continue;
      const { desde, hasta } = c.fechas;
      const dentro = desde <= hasta ? md >= desde && md <= hasta : md >= desde || md <= hasta;
      if (dentro) return k;
    }
    return null;
  }
  let campKey = qs.get("campana") || (CAMBIO_AUTOMATICO ? campañaPorFecha(new Date()) : null) || CAMPAÑA_ACTIVA;
  if (!CAMPAÑAS[campKey]) campKey = Object.keys(CAMPAÑAS)[0];
  const CAMP = CAMPAÑAS[campKey];

  /* ---------- Tiendas resueltas ---------- */
  const tiendas = TIENDAS.map((t) => {
    if (!t.esTemporada) return t;
    return Object.assign({}, t, {
      nombre: "Tienda de Temporada", campaña: CAMP, rubro: CAMP.nombre + " · " + CAMP.lema, tema: CAMP.tema,
      salas: CAMP.salas, productos: CAMP.productos, letrero: CAMP.letrero,
      enConstruccion: !!CAMP.enConstruccion, banner: CAMP.banner || (CAMP.enConstruccion ? "En construcción" : null),
      aviso: CAMP.aviso || null, sinCompra: !!CAMP.enConstruccion
    });
  });
  const tiendaPorId = Object.fromEntries(tiendas.map((t) => [t.id, t]));
  const PROD = {};
  tiendas.forEach((t) => (t.productos || []).forEach((p) => {
    const img = p.x == null && t.imgCategoria && t.imgCategoria[p.categoria] ? t.imgCategoria[p.categoria] : "assets/img/productos/" + p.id + ".jpg";
    PROD[p.id] = Object.assign({ img, sala: t.salas[0].id }, p, { tienda: t.id });
  }));
  const tieneEjemplo = (t) => (t.productos || []).some((p) => p.ejemplo);
  const nombreTienda = (t) => (t.esTemporada ? CAMP.nombre : t.nombre);

  const MAPA_ESTADO = (typeof TIENDAS_ESTADO !== "undefined") ? TIENDAS_ESTADO : {};
  const FEST = (typeof AESTHETIC_FEST !== "undefined") ? AESTHETIC_FEST : null;
  function estadoDe(t) {
    if (!t) return "construccion";
    const id = typeof t === "string" ? t : t.id;
    if (id && MAPA_ESTADO[id]) return MAPA_ESTADO[id];
    const obj = typeof t === "object" ? t : (typeof tiendaPorId !== "undefined" && tiendaPorId[id]);
    if (obj && (obj.enConstruccion || obj.sinCompra)) return "construccion";
    return "abierta";
  }
  function enObras(t) { return estadoDe(t) === "construccion"; }
  function puedeComprar(t) { return estadoDe(t) === "abierta"; }
  function festWa() {
    if (!FEST) return;
    window.open(wa(String(FEST.whatsapp || "51948042949").replace(/\D/g, ""), FEST.mensaje), "_blank", "noopener");
  }
  function pucoStem(prod) {
    const src = (prod && prod.img) || "";
    const m = src.match(/^(assets\/img\/productos\/puco\/puco-\d+)\.(jpe?g|webp)$/i);
    return m ? m[1] : null;
  }
  function pucoPicture(prod, kind, extraClass) {
    const alt = esc((prod && prod.nombre) || "");
    const cls = extraClass ? ` class="${extraClass}"` : "";
    const stem = pucoStem(prod);
    const sizes = kind === "qv" ? "(max-width: 720px) 92vw, 520px" : kind === "tile" ? "(max-width: 839px) 110px, 180px" : "(max-width: 720px) 42vw, 220px";
    if (!stem) return `<img src="${esc((prod && prod.img) || "")}" alt="${alt}"${cls} loading="lazy" decoding="async">`;
    const w400w = stem + "-400.webp", w800w = stem + "-800.webp";
    const w400j = stem + "-400.jpg", w800j = stem + "-800.jpg";
    const src = kind === "qv" ? w800j : w400j;
    return `<picture${cls}><source type="image/webp" srcset="${w400w} 400w, ${w800w} 800w" sizes="${sizes}"><img src="${esc(src)}" srcset="${w400j} 400w, ${w800j} 800w" sizes="${sizes}" alt="${alt}" loading="lazy" decoding="async"></picture>`;
  }
  function tiposAgenda() {
    return (estadoDe("consultorio") === "parcial")
      ? TIPOS_VIDEOCONSULTA.filter((x) => x.id === "consulta")
      : TIPOS_VIDEOCONSULTA;
  }
  function sedePorId(id) {
    const t = tiendaPorId.laboratorio;
    return ((t && t.sedes) || []).find((s) => s.id === id) || null;
  }
  function abrirSede(pOrId) {
    const t = tiendaPorId.laboratorio;
    const id = typeof pOrId === "string" ? pOrId : (pOrId && (pOrId.sedeId || pOrId.id));
    const sede = sedePorId(id) || (pOrId && typeof pOrId === "object" ? pOrId : {}) || {};
    const num = String(sede.whatsapp || (pOrId && pOrId.whatsapp) || "").replace(/\D/g, "");
    if (!num) { toast("El WhatsApp de " + (sede.nombre || (pOrId && pOrId.nombre) || "esta sede") + " se publicará pronto"); return; }
    window.open(wa(num, `Hola ${nombreTienda(t)}, vengo de ${NOMBRE_CENTRO}. Les escribo a la ${sede.nombre || (pOrId && pOrId.nombre) || "sede"}.`), "_blank", "noopener");
  }
  function pintarProximamente(root, t) {
    const el = document.createElement("div");
    el.className = "proximamente" + (t.id === "convenciones" ? " fest" : "");
    if (t.id === "convenciones" && FEST) {
      el.innerHTML = `<div class="prx-card fest">
        <small>Centro de Convenciones Home Mall</small>
        <b>Próximamente: Aesthetic Fest, 11–23 dic</b>
        <p>${esc(FEST.fechasLargo)} · ${esc(FEST.cinta)}. ${esc(FEST.preop)}.</p>
        <button type="button" class="fest-cta">Avisarme / Quiero participar</button>
      </div>`;
      el.querySelector(".fest-cta").onclick = (ev) => { ev.stopPropagation(); festWa(); };
    } else {
      el.innerHTML = `<div class="prx-card">
        <small>${esc(nombreTienda(t))}</small>
        <b>Próximamente</b>
        <p>Esta tienda está en construcción. Muy pronto podrás entrar y comprar aquí.</p>
      </div>`;
    }
    root.appendChild(el);
  }
  window.pucoStem = pucoStem;
  window.pucoPicture = pucoPicture;
  window.estadoDe = estadoDe;
  window.festWa = festWa;

  tiendas.forEach((t) => {
    const e = estadoDe(t);
    t.estado = e;
    if (e === "construccion") {
      t.enConstruccion = true;
      t.sinCompra = true;
      if (t.id === "convenciones") t.banner = "Próximamente: Aesthetic Fest, 11–23 dic";
      else if (!t.banner) t.banner = "En construcción";
    }
    if (e === "parcial" && t.id === "laboratorio") t.sinCompra = true;
  });

  /* ---------- Carrito (compartido, se agrupa por tienda) ---------- */
  const CART_KEY = "galeria_carrito_v1", CLIENT_KEY = "galeria_cliente_v1";
  let carrito = [];
  try { carrito = JSON.parse(localStorage.getItem(CART_KEY) || "[]").filter((i) => {
    const p = PROD[i.id]; if (!p || i.qty <= 0) return false;
    const t = tiendaPorId[p.tienda];
    return t && !t.soloCita && !t.enConstruccion && !t.sinCompra;
  }); } catch (e) { carrito = []; }
  const guardar = () => { try { localStorage.setItem(CART_KEY, JSON.stringify(carrito)); } catch (e) {} };
  const unidades = () => carrito.reduce((s, i) => s + i.qty, 0);
  function grupos() {
    return tiendas.map((t) => {
      const items = carrito.filter((i) => PROD[i.id].tienda === t.id);
      const totales = {};
      items.forEach((i) => { const p = PROD[i.id]; const n = precioNum(p, p.precio == null ? null : p.precio * i.qty); if (n != null) totales[mon(p)] = (totales[mon(p)] || 0) + n; });
      const cotizar = items.some((i) => PROD[i.id].precio == null);
      return { t, items, totales, cotizar };
    }).filter((g) => g.items.length);
  }
  const clave = (i) => i.id + "|" + (i.talla || "");
  function agregar(id, qty, talla) {
    const p0 = PROD[id], t0 = p0 && tiendaPorId[p0.tienda];
    if (!p0 || (t0 && (t0.enConstruccion || t0.sinCompra))) { toast("Esta tienda está en construcción"); return; }
    const it = carrito.find((i) => i.id === id && (i.talla || "") === (talla || ""));
    if (it) it.qty += qty; else carrito.push(talla ? { id, qty, talla } : { id, qty });
    guardar(); pintarCarrito();
    const b = $("#cartBtn"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
    if (typeof window.pucoPintarSticky === "function") window.pucoPintarSticky();
  }
  function cambiarQty(k, d) {
    const it = carrito.find((i) => clave(i) === k); if (!it) return;
    it.qty += d; if (it.qty <= 0) carrito = carrito.filter((i) => i !== it);
    guardar(); pintarCarrito();
  }
  function quitar(k) { carrito = carrito.filter((i) => clave(i) !== k); guardar(); pintarCarrito(); }

  function pintarCarrito() {
    const n = unidades();
    $("#cartCount").textContent = n; $("#cartCount").hidden = n === 0;
    const box = $("#cartItems"); box.innerHTML = "";
    const gs = grupos();
    if (!gs.length) box.innerHTML = '<p class="empty">Tu canasta está vacía.<br>Entra a PuCo Tech y toca un producto para llevarlo ✨</p>';
    gs.forEach((g) => {
      const sec = document.createElement("section"); sec.className = "cgroup";
      sec.innerHTML = `<h3 style="--ta:${g.t.tema.a}">${esc(nombreTienda(g.t))}</h3>`;
      g.items.forEach((i) => {
        const p = PROD[i.id];
        const row = document.createElement("div"); row.className = "citem"; row.dataset.id = p.id; row.dataset.key = clave(i);
        row.innerHTML = `${pucoPicture(p, "grid", tiendaPorId[p.tienda].fotosVerticales ? "vert" : "")}<div class="cinfo"><strong>${esc(p.nombre)}</strong>${i.talla ? `<span class="talla">Talla ${esc(i.talla)}</span>` : ""}<span>${p.precio == null ? "Precio a consultar" : precioHTML(p) + " c/u"}${p.ejemplo ? " · ejemplo" : ""}</span>
          <div class="qty sm"><button data-a="-" aria-label="Menos">−</button><b>${i.qty}</b><button data-a="+" aria-label="Más">+</button></div></div>
          <div class="cright"><span class="sub">${p.precio == null ? "A cotizar" : precioDe(p, p.precio * i.qty)}</span><button class="rm" data-a="x">Quitar</button></div>`;
        row.querySelector('[data-a="-"]').onclick = () => cambiarQty(clave(i), -1);
        row.querySelector('[data-a="+"]').onclick = () => cambiarQty(clave(i), 1);
        row.querySelector('[data-a="x"]').onclick = () => quitar(clave(i));
        sec.appendChild(row);
      });
      const st = document.createElement("div"); st.className = "gsub";
      st.innerHTML = `<span>Subtotal</span><strong>${fmtTot(g.totales)}${g.cotizar ? " + a cotizar" : ""}</strong>`;
      sec.appendChild(st); box.appendChild(sec);
    });
    const cliTmp = (typeof leerCliente === "function") ? leerCliente() : {};
    const total = gs.reduce((s, g) => {
      const env = cargoEnvio(g, cliTmp);
      return sumar(s, env && !env.pagoEnDestino && cliTmp.envio === "recojo" || (env && !env.pagoEnDestino && (cliTmp.envio === "recojo" || cliTmp.distrito)) ? totalPagar(g, env) : g.totales);
    }, {});
    /* computed more carefully below in pintarEnvioUI */
    $("#checkout").hidden = !gs.length;
    mostrarPasoCheckout(false);
    $("#multiNote").textContent = gs.length > 1 ? `Tu canasta incluye ${gs.length} tiendas: se envía un WhatsApp a cada una.` : "";
    const sends = $("#sendBtns"); sends.innerHTML = "";
    gs.forEach((g) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "wa"; b.dataset.tienda = g.t.id;
      const env = cargoEnvio(g, cliTmp);
      const pagar = (esPuco(g.t) && env && (cliTmp.envio === "recojo" || cliTmp.distrito)) ? totalPagar(g, env) : g.totales;
      const extra = env && env.pagoEnDestino ? " + envío en destino" : "";
      if (esPuco(g.t)) {
        b.innerHTML = `Continuar al pago<small>${fmtTot(pagar)}${extra}${g.cotizar ? " + a cotizar" : ""}</small>`;
        b.onclick = () => irAPago(g);
      } else {
        b.innerHTML = `Enviar pedido a ${esc(nombreTienda(g.t))} por WhatsApp<small>${fmtTot(g.totales)}${g.cotizar ? " + a cotizar" : ""}</small>`;
        b.onclick = () => enviar(g.t.id, b);
      }
      sends.appendChild(b);
    });
    pintarEnvioUI(gs);
    if (typeof window.pucoPintarSticky === "function") window.pucoPintarSticky();
  }

  function subtotalSoles(g) { return (g && g.totales && g.totales["S/"]) || 0; }
  function esDestacado(p) {
    return !!(p && (p.productoSemana || p.protagonistaMes));
  }
  function notaDestacadosDe(vol) {
    if (!vol) return "";
    if (vol.tieneSemana && vol.tieneProta) return "Los productos destacados ya tienen su precio especial";
    if (vol.tieneProta) return (vol.protaCount > 1) ? "Los protagonistas del mes ya tienen su precio especial" : "El protagonista del mes ya tiene su precio especial";
    if (vol.tieneSemana) return "El producto de la semana ya tiene su precio especial";
    return "";
  }
  function descVolumenDe(subOrG) {
    const cfg = typeof PUCO_DESC_VOLUMEN !== "undefined" ? PUCO_DESC_VOLUMEN : { minimo: 200, pct: 10 };
    const min = Number(cfg && cfg.minimo) || 200;
    const pct = Number(cfg && cfg.pct) || 10;
    let g = (subOrG && typeof subOrG === "object" && Array.isArray(subOrG.items)) ? subOrG : null;
    if (!g) {
      try { g = (grupos() || []).find((x) => esPuco(x.t)) || null; } catch (e) { g = null; }
    }
    let sub, destacadoSub = 0, tieneSemana = false, tieneProta = false, protaCount = 0, baseDto;
    if (g) {
      sub = subtotalSoles(g);
      g.items.forEach((i) => {
        const p = PROD[i.id];
        if (!p || !esDestacado(p)) return;
        if (p.productoSemana) tieneSemana = true;
        if (p.protagonistaMes) { tieneProta = true; protaCount += i.qty || 1; }
        const n = precioNum(p, p.precio == null ? null : p.precio * i.qty);
        if (n != null) destacadoSub += n;
      });
      destacadoSub = Math.round(destacadoSub * 100) / 100;
      baseDto = Math.max(0, Math.round((sub - destacadoSub) * 100) / 100);
    } else {
      sub = Number(subOrG) || 0;
      baseDto = sub;
    }
    /* El umbral mira el subtotal completo (incluye destacados).
       El 10% extra se aplica solo a las líneas que no son de la semana ni protagonistas del mes. */
    const desbloquea = sub > min;
    const monto = desbloquea ? Math.round(baseDto * (pct / 100) * 100) / 100 : 0;
    const aplica = monto > 0;
    let falta = 0;
    if (!desbloquea) {
      falta = Math.round((min - sub) * 100) / 100;
      if (falta <= 0) falta = 0.01;
    }
    const tieneDestacado = !!(tieneSemana || tieneProta);
    return { aplica, monto, falta, minimo: min, pct, sub, baseDto, destacadoSub, semanaSub: destacadoSub, tieneSemana, tieneProta, protaCount, tieneDestacado, desbloquea };
  }
  function cargoEnvio(g, cli) {
    if (!g || !esPuco(g.t) || typeof window.pucoEnvioDe !== "function") return null;
    return window.pucoEnvioDe(cli || leerCliente(), subtotalSoles(g));
  }
  function totalPagar(g, env) {
    const tot = Object.assign({}, g.totales);
    const vol = descVolumenDe(g);
    if (vol.monto) tot["S/"] = Math.round(((tot["S/"] || 0) - vol.monto) * 100) / 100;
    if (env && !env.pagoEnDestino) tot["S/"] = Math.round(((tot["S/"] || 0) + (env.monto || 0)) * 100) / 100;
    return tot;
  }
  function pintarVolumenUI(g) {
    const vol = descVolumenDe(g);
    const line = $("#pucoVolLine"), prog = $("#pucoVolProg"), nota = $("#pucoSemanaNota");
    if (line) {
      line.hidden = !vol.aplica;
      if (vol.aplica) {
        if ($("#pucoVolLabel")) $("#pucoVolLabel").textContent = "Descuento compra > S/ " + vol.minimo + " (-" + vol.pct + "%)";
        if ($("#pucoVolMonto")) $("#pucoVolMonto").textContent = "−" + soles(vol.monto);
      }
    }
    if (prog) {
      prog.hidden = !!vol.desbloquea;
      if (!vol.desbloquea) {
        if ($("#pucoVolBar")) $("#pucoVolBar").style.width = Math.min(100, Math.round((vol.sub / vol.minimo) * 100)) + "%";
        if ($("#pucoVolHint")) $("#pucoVolHint").textContent = "Te faltan " + soles(vol.falta) + " para 10% adicional";
      }
    }
    if (nota) {
      const msg = notaDestacadosDe(vol);
      nota.hidden = !msg;
      if (msg) nota.textContent = msg;
    }
    return vol;
  }
  function pintarEnvioUI(gs) {
    const box = $("#pucoShipBox");
    if (!box) return;
    gs = gs || grupos();
    const g = gs.find((x) => esPuco(x.t));
    if (!g) { box.hidden = true; if ($("#cartTotal")) { const total = gs.reduce((s, x) => sumar(s, x.totales), {}); $("#cartTotal").textContent = fmtTot(total) + (gs.some((x) => x.cotizar) ? " + a cotizar" : ""); } return; }
    box.hidden = false;
    const cli = leerCliente();
    const env = cargoEnvio(g, cli);
    const needDist = cli.envio !== "recojo" && !cli.distrito;
    const vol = pintarVolumenUI(g);
    if (needDist) {
      $("#pucoShipLabel").textContent = "Envío";
      $("#pucoShipMonto").textContent = "Elige tu distrito";
      if ($("#pucoShipProg")) $("#pucoShipProg").hidden = true;
      if ($("#pucoShipTotLine")) $("#pucoShipTotLine").hidden = true;
      const base = vol.monto ? { "S/": Math.round((subtotalSoles(g) - vol.monto) * 100) / 100 } : g.totales;
      $("#cartTotal").textContent = fmtTot(base) + (g.cotizar ? " + a cotizar" : "") + " + envío";
      return;
    }
    $("#pucoShipLabel").textContent = "Envío · " + env.zona.nombre;
    $("#pucoShipMonto").textContent = env.gratis ? "Gratis" : (env.pagoEnDestino ? soles(env.monto) + " (en destino)" : soles(env.monto));
    if (cli.envio !== "recojo" && (env.zona.id === "lima" || env.zona.id === "alejada")) {
      $("#pucoShipProg").hidden = false;
      const umbral = env.umbral || 200, sub = subtotalSoles(g);
      $("#pucoShipBar").style.width = Math.min(100, Math.round(sub / umbral * 100)) + "%";
      $("#pucoShipHint").textContent = env.gratis ? "¡Envío gratis en tu pedido!" : "Te faltan " + soles(env.falta) + " para envío gratis desde S/ " + umbral;
    } else if ($("#pucoShipProg")) $("#pucoShipProg").hidden = true;
    const pagar = totalPagar(g, env);
    const destNota = env.pagoEnDestino && !env.gratis;
    $("#pucoShipTotLine").hidden = false;
    $("#pucoShipTot").textContent = fmtTot(pagar) + (destNota ? " + envío en destino" : "");
    $("#cartTotal").textContent = fmtTot(pagar) + (destNota ? " + envío en destino" : "") + (g.cotizar ? " + a cotizar" : "");
    const send = document.querySelector('#sendBtns button[data-tienda="matteo"]');
    if (send) send.innerHTML = "Continuar al pago<small>" + fmtTot(pagar) + (destNota ? " + envío en destino" : "") + (g.cotizar ? " + a cotizar" : "") + "</small>";
  }

  /* ---------- WhatsApp ---------- */
  const numero = (t) => String(t.whatsapp).replace(/\D/g, "");
  const wa = (num, texto) => `https://wa.me/${num}?text=${encodeURIComponent(texto)}`;
  const esPuco = (t) => t && t.id === "matteo";
  const yapePuco = () => (typeof PUCO_YAPE_NUMERO !== "undefined" && String(PUCO_YAPE_NUMERO || "").trim()) || "";
  const celPE = (s) => { const d = String(s || "").replace(/\D/g, ""); return /^9\d{8}$/.test(d) ? d : ""; };
  function nroPedido() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const ymd = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate());
    const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
    return "PT-" + ymd + "-" + rnd;
  }
  let pedidoActual = null;
  function mensaje(g, cli, nro) {
    const puco = esPuco(g.t);
    const l = puco && nro
      ? [`¡Hola ${nombreTienda(g.t)}! Vengo de ${NOMBRE_CENTRO} 🛍️`, "", `*Pedido ${nro}*`, ""]
      : [`¡Hola ${nombreTienda(g.t)}! Vengo de ${NOMBRE_CENTRO} 🛍️ Quiero hacer este pedido:`, ""];
    const notas = [...new Set(g.items.map((i) => PROD[i.id].notaMensaje).filter(Boolean))];
    g.items.forEach((i) => {
      const p = PROD[i.id], n = p.nombre + (i.talla ? ` – talla ${i.talla}` : "");
      if (p.precio == null) { l.push(`• ${i.qty} x ${n} (precio a consultar)`); return; }
      const pct = descuentoPctDe(p);
      const notaDto = pct ? `, con ${pct}% de descuento` : "";
      l.push(`• ${i.qty} x ${n} (${precioDe(p)} c/u${notaDto}) = ${precioDe(p, p.precio * i.qty)}`);
    });
    if (puco) {
      const env = cargoEnvio(g, cli);
      const vol = descVolumenDe(g);
      l.push("", `Subtotal: ${fmtTot(g.totales)}`);
      if (vol.tieneDestacado) l.push(notaDestacadosDe(vol) + " (el 10% adicional no se acumula en esos ítems).");
      if (vol.aplica) l.push(`Descuento compra > S/ ${vol.minimo} (-${vol.pct}%, no incluye productos destacados): −${soles(vol.monto)}`);
      if (env) {
        if (env.gratis) l.push(`Envío (${env.zona.nombre}): Gratis`);
        else if (env.pagoEnDestino) l.push(`Envío (${env.zona.nombre}): ${soles(env.monto)} referencial, se paga en destino o se coordina`);
        else l.push(`Envío (${env.zona.nombre}): ${soles(env.monto)}`);
      }
      const pagar = env ? totalPagar(g, env) : (vol.aplica ? { "S/": Math.round((subtotalSoles(g) - vol.monto) * 100) / 100 } : g.totales);
      l.push(`*Total a pagar${env && env.pagoEnDestino ? " ahora" : ""}: ${fmtTot(pagar)}${g.cotizar ? " + ítems a cotizar" : ""}*`);
      l.push("");
    } else {
      l.push("", `*Total: ${fmtTot(g.totales)}${g.cotizar ? " + ítems a cotizar" : ""}*`, "");
    }
    l.push(`Nombre: ${cli.nombre}`);
    if (cli.celularNorm || cli.celular) l.push(`Celular: ${cli.celularNorm || cli.celular}`);
    l.push(`Entrega: ${cli.envio === "recojo" ? "Recojo en tienda" : "Delivery"}`);
    if (cli.envio !== "recojo") {
      if (cli.distrito) l.push(`Distrito: ${cli.distrito}`);
      if (cli.direccion) l.push(`Dirección: ${cli.direccion}`);
      if (cli.referencia) l.push(`Referencia: ${cli.referencia}`);
    }
    if (cli.nota) l.push(`Notas: ${cli.nota}`);
    if (cli.yapeOp) l.push(`N° de operación Yape/Plin: ${cli.yapeOp}`);
    if (notas.length) l.push("", ...notas);
    if (puco) {
      if (yapePuco()) l.push("", "Adjunto la captura de mi pago Yape/Plin por el total. ¿Me confirman el pedido? Gracias.");
      else l.push("", "Coordinemos el pago por este chat (Yape/Plin de PuCo Tech). Si ya pagué, adjunto la captura. Gracias.");
    } else {
      l.push("", g.t.cierreMensaje || "¿Me confirman disponibilidad y costo de delivery? Gracias.");
    }
    return l.join("\n");
  }
  function leerCliente() {
    const envio = (document.querySelector('input[name="cEnvio"]:checked') || {}).value || "delivery";
    const cli = {
      nombre: $("#cNombre").value.trim(),
      celular: $("#cCelular") ? $("#cCelular").value.trim() : "",
      celularNorm: celPE($("#cCelular") ? $("#cCelular").value : ""),
      envio,
      distrito: $("#cDistrito").value,
      direccion: $("#cDireccion").value.trim(),
      referencia: $("#cReferencia") ? $("#cReferencia").value.trim() : "",
      nota: $("#cNota").value.trim(),
      yapeOp: ($("#cYapeOp") && $("#cYapeOp").value.trim()) || ""
    };
    if (cli.distrito === "Otro") cli.distrito = $("#cDistritoOtro").value.trim() || "Otro";
    return cli;
  }
  function validarCliente(cli) {
    if (!cli.nombre) return "Escribe tu nombre.";
    if (!cli.celularNorm) return "El celular debe tener 9 dígitos y empezar con 9 (Perú).";
    if (cli.envio === "delivery" && !cli.distrito) return "Elige tu distrito para el delivery.";
    if (cli.envio === "delivery" && !cli.direccion) return "Escribe tu dirección para el delivery.";
    return "";
  }
  function linksPedido(cli, nro) { return grupos().map((g) => ({ tienda: g.t.id, numero: numero(g.t), url: wa(numero(g.t), mensaje(g, cli, nro)), texto: mensaje(g, cli, nro) })); }
  function enviar(tid, btn) {
    const cli = leerCliente(), err = $("#formErr");
    const msg = validarCliente(cli);
    if (msg) { err.textContent = msg; ($("#cNombre").value.trim() ? ($("#cCelular") || $("#cNombre")) : $("#cNombre")).focus(); return; }
    err.textContent = "";
    try { localStorage.setItem(CLIENT_KEY, JSON.stringify(cli)); } catch (x) {}
    const l = linksPedido(cli).find((x) => x.tienda === tid); if (!l) return;
    window.open(l.url, "_blank", "noopener");
    btn.classList.add("sent"); btn.querySelector("small").textContent = "Enviado ✓ (toca para reenviar)";
  }
  function mostrarPasoCheckout(pago) {
    if ($("#ckForm")) $("#ckForm").hidden = !!pago;
    if ($("#ckPago")) $("#ckPago").hidden = !pago;
  }
  function irAPago(g) {
    const cli = leerCliente(), err = $("#formErr");
    const msg = validarCliente(cli);
    if (msg) { err.textContent = msg; ($("#cNombre").value.trim() ? ($("#cCelular") || $("#cNombre")) : $("#cNombre")).focus(); return; }
    err.textContent = "";
    try { localStorage.setItem(CLIENT_KEY, JSON.stringify(cli)); } catch (x) {}
    const nro = nroPedido();
    pedidoActual = { tid: g.t.id, nro, cli, g };
    $("#ckPedidoN").textContent = nro;
    const env = cargoEnvio(g, cli);
    const pagar = env ? totalPagar(g, env) : g.totales;
    const extra = env && env.pagoEnDestino ? " + envío en destino" : "";
    $("#ckMonto").textContent = fmtTot(pagar) + extra + (g.cotizar ? " + a cotizar" : "");
    const filas = g.items.map((i) => {
      const p = PROD[i.id];
      const nom = esc(p.nombre) + (i.talla ? " · talla " + esc(i.talla) : "");
      return `<div class="cklinea"><span>${i.qty} × ${nom}</span><strong>${p.precio == null ? "A cotizar" : precioDe(p, p.precio * i.qty)}</strong></div>`;
    }).join("");
    const vol = descVolumenDe(g);
    const nd = notaDestacadosDe(vol);
    const volLine = (nd ? `<div class="cklinea nota">${nd}</div>` : "")
      + (vol.aplica
        ? `<div class="cklinea dto"><span>Descuento compra &gt; S/ ${vol.minimo} (-${vol.pct}%)</span><strong>−${soles(vol.monto)}</strong></div>`
        : "");
    let envLine = "";
    if (env) {
      const ev = env.gratis ? "Gratis" : (env.pagoEnDestino ? soles(env.monto) + " (pago en destino)" : soles(env.monto));
      envLine = `<div class="cklinea"><span>Envío · ${esc(env.zona.nombre)}</span><strong>${ev}</strong></div>`;
    }
    const ent = cli.envio === "recojo" ? "Recojo en tienda" : `Delivery · ${esc(cli.distrito)} · ${esc(cli.direccion)}`;
    $("#ckResumen").innerHTML = filas + volLine + envLine + `<div class="cklinea"><span>Total a pagar${env && env.pagoEnDestino ? " ahora" : ""}</span><strong>${fmtTot(pagar)}${extra}</strong></div>` + `<div class="cklinea cli"><span>${esc(cli.nombre)} · ${esc(cli.celularNorm)} · ${ent}</span></div>`;
    const num = yapePuco();
    const tit = (typeof PUCO_YAPE_TITULAR !== "undefined" && String(PUCO_YAPE_TITULAR || "").trim()) || "";
    const qr = (typeof PUCO_YAPE_QR !== "undefined" && String(PUCO_YAPE_QR || "").trim()) || "";
    if (num) {
      $("#ckYapeTxt").innerHTML = `Yapea o transfiere por Plin <b>${fmtTot(pagar)}</b> al <b>${esc(num)}</b> <button type="button" class="link" id="ckCopiar">Copiar</button>`;
      const copiar = $("#ckCopiar");
      if (copiar) copiar.onclick = () => { const n = num.replace(/\s/g, ""); if (navigator.clipboard) navigator.clipboard.writeText(n); toast("Número copiado"); };
      $("#ckYapeTit").textContent = tit ? "A nombre de " + tit : "";
      $("#ckYapeTit").hidden = !tit;
    } else {
      $("#ckYapeTxt").innerHTML = `Número de Yape / Plin: <b>Próximamente</b>. El total a pagar es <b>${fmtTot(pagar)}${extra}</b>.`;
      $("#ckYapeTit").textContent = "Aún no publicamos el número de Yape/Plin de PuCo Tech. Al enviar el pedido por WhatsApp coordinamos el pago. No uses el Yape de la clínica.";
      $("#ckYapeTit").hidden = false;
    }
    if (qr && num) { $("#ckQR").src = qr; $("#ckQR").hidden = false; } else { $("#ckQR").hidden = true; $("#ckQR").removeAttribute("src"); }
    mostrarPasoCheckout(true);
  }
  function abrirCita(servicio) {
    const t = tiendaPorId.consultorio;
    const txt = servicio && servicio !== "Agenda tu evaluación"
      ? `Hola Dra. Roma Coletti, vengo de ${NOMBRE_CENTRO}. Quisiera agendar una evaluación para: ${servicio}.`
      : `Hola Dra. Roma Coletti, vengo de ${NOMBRE_CENTRO}. Quisiera agendar una evaluación.`;
    window.open(wa(numero(t), txt), "_blank", "noopener");
  }
  function esProductoSemana(p) { return !!(p && (p.productoSemana || p.envioGratis)); }
  window.Galeria = { linksPedido, get carrito() { return carrito; }, campaña: campKey, citaUrl: (s) => wa(numero(tiendaPorId.consultorio), s), precioNum, precioHTML, descuentoPctDe, nroPedido, agregar, abrirProducto, pintarCarrito, soles, fmtTot, PROD, tiendaPorId, descVolumenDe, estadoDe, pucoPicture, pucoStem, festWa, esProductoSemana, esDestacado };
  window.pintarSpots = pintarSpots;
  window.pintarCarrito = pintarCarrito;
  window.abrirProducto = abrirProducto;
  window.abrirBuscador = abrirBuscador;

  /* ---------- Escena / recorrido ---------- */
  const stage = $("#stage"), pano = $("#pano"), img = $("#panoImg"), spots = $("#spots");
  let escena = { tipo: "pasillo", i: 0 };
  let panX = 0, panY = 0, panoW = 0, panoH = 0;

  function medir() {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const puco = (typeof escena !== "undefined" && escena.tipo === "tienda" && escena.t === "matteo") || document.body.classList.contains("tienda-puco");
    if (puco && sw >= 840) {
      /* Desktop: show the whole room (letterbox if needed). */
      panoW = Math.min(sw, sh * 16 / 9); panoH = panoW * 9 / 16;
      pano.classList.remove("puco-mobile-cover");
    } else if (puco) {
      /* Mobile: fit the shelf to the viewport — no sideways pan. */
      panoW = sw; panoH = sh;
      pano.classList.add("puco-mobile-cover");
    } else {
      pano.classList.remove("puco-mobile-cover");
      const nw = img.naturalWidth || 1280, nh = img.naturalHeight || 720;
      const aspect = nw / nh;
      if (escena.tipo === "pasillo") {
        /* Tiendas grandes: ~2 locales a la vista; el resto se recorre arrastrando o deslizando. */
        const targetBays = 2.15;
        panoW = Math.max(sw * (4 / targetBays), sh * aspect * 1.02);
        panoH = panoW / aspect;
        /* No recortes tanto en vertical que desaparezcan letreros y el carrito a la vez. */
        /* En pantalla apaisada (escritorio) se recorta menos en vertical para que entren el letrero colgante y el carrito. */
        const visV = sw > sh ? 0.70 : 0.58;
        if (panoH > sh / visV) { panoH = sh / visV; panoW = panoH * aspect; }
      } else {
        panoW = Math.max(sh * aspect, sw * 1.18);
        panoH = panoW / aspect;
      }
    }
    pano.style.width = panoW + "px"; pano.style.height = panoH + "px"; pano.style.setProperty("--pw", panoW + "px");
    ajustarLetreros();
    const viewer = document.querySelector(".viewer");
    if (viewer && document.body.classList.contains("tienda-puco")) {
      const vr = viewer.getBoundingClientRect(), sr = stage.getBoundingClientRect();
      const top = Math.max(8, (sr.top - vr.top) + sr.height * 0.48);
      viewer.style.setProperty("--puco-arrow-top", top + "px");
    }
  }
  /* Achica la letra de cada placa hasta que el nombre entre en una línea */
  function ajustarLetreros() {
    document.querySelectorAll("#spots .letrero.placa b").forEach((b) => {
      b.style.fontSize = ""; let f = parseFloat(getComputedStyle(b).fontSize), n = 0;
      while (b.scrollWidth > b.clientWidth + 1 && n++ < 40) { f *= 0.94; b.style.fontSize = f + "px"; }
    });
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ajustarLetreros());
  function limitar() {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    if (panoW <= sw && panoH <= sh) {
      /* Letterboxed room (PuCo desktop): center, do not clamp to 0. */
      panX = (sw - panoW) / 2;
      panY = (sh - panoH) / 2;
    } else {
      panX = Math.min(0, Math.max(sw - panoW, panX));
      panY = Math.min(0, Math.max(sh - panoH, panY));
    }
    pano.style.transform = `translate3d(${panX}px, ${panY}px, 0)`;
    encuadrarPronto();
  }
  /* Mantiene las etiquetas de los puntos dentro de la pantalla (sobre todo en celular) */
  let encRaf = 0;
  function encuadrarPronto() { if (!encRaf) encRaf = requestAnimationFrame(() => { encRaf = 0; encuadrar(); }); }
  function encuadrar() {
    const vw = window.innerWidth, m = 6;
    document.querySelectorAll("#spots .hotspot .tag").forEach((tg) => {
      const dot = tg.previousElementSibling; tg.style.translate = "";
      const d = dot ? dot.getBoundingClientRect() : null;
      if (!d || d.right < 0 || d.left > vw) return;
      const r = tg.getBoundingClientRect(); let dx = 0;
      if (r.left < m) dx = m - r.left; else if (r.right > vw - m) dx = vw - m - r.right;
      if (dx) tg.style.translate = `${Math.round(dx)}px 0`;
    });
  }
  window.addEventListener("resize", encuadrarPronto);
  function centrar(fx) {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    panX = sw / 2 - panoW * fx;
    if (escena.tipo === "pasillo" && panoH > sh) {
      /* Arranca un poco más arriba para que se vean los letreros dorados; el piso se recorre en vertical. */
      panY = -panoH * 0.20;
      /* …pero sin esconder el letrero colgante del Centro de Convenciones (con sus cables, ~7.5% de la foto). */
      const P = PASILLOS[escena.i], col = P && P.vitrinas.find((v) => v.colgante);
      if (col) { const topCol = (col.letrero.y - (col.letrero.h || 8) / 2 - 3.5) / 100; panY = Math.max(panY, 8 - panoH * topCol); }
    } else {
      panY = (sh - panoH) / 2;
    }
    limitar();
  }

  function imgDe(e) { return e.tipo === "pasillo" ? PASILLOS[e.i].img : tiendaPorId[e.t].salas[e.s].img; }
  function ir(e, dir) {
    if (e && e.tipo === "tienda" && e.t === "consultorio" && estadoDe("consultorio") === "parcial" && e.s > 0) e.s = 0;
    escena = e;
    const src = imgDe(e);
    stage.classList.remove("enter-fwd", "enter-back"); stage.classList.add("leaving");
    const cargar = () => {
      img.onload = null; medir();
      let fx = 0.5;
      if (e.tipo === "tienda") {
        const ps = productosDeSala();
        const tnow = tiendaPorId[e.t];
        if (tnow && tnow.id === "matteo") fx = 0.5;
        else if (ps.length) fx = ps.reduce((a, p) => a + p.x, 0) / ps.length / 100;
        if (tnow && tnow.evento && stage.clientWidth < 720) {
          const roma = ps.find((p) => p.standRoma);
          const pc = tnow.evento.pantallaCentral;
          const fa = roma && (roma.fachada || roma.neon);
          const xs = [fa && fa.x, roma && roma.x, pc && pc.x].filter((n) => n != null);
          if (xs.length) fx = xs.reduce((a, b) => a + b, 0) / xs.length / 100;
        }
      }
      centrar(dir === "back" ? Math.min(fx + 0.2, 1) : Math.max(fx - 0.2, 0));
      pintarSpots();
      stage.classList.remove("leaving"); void stage.offsetWidth; stage.classList.add(dir === "back" ? "enter-back" : "enter-fwd");
      requestAnimationFrame(() => { pano.classList.add("glide"); centrar(fx); setTimeout(() => pano.classList.remove("glide"), 1300); });
    };
    setTimeout(() => { if (img.getAttribute("src") === src && img.complete) cargar(); else { img.onload = cargar; img.onerror = cargar; img.src = src; } }, stage.dataset.ready ? 260 : 0);
    stage.dataset.ready = "1";
    pintarUI();
    try { history.replaceState(null, "", location.search + "#" + (e.tipo === "pasillo" ? PASILLOS[e.i].id : e.t + (e.s ? "/" + tiendaPorId[e.t].salas[e.s].id : ""))); } catch (x) {}
  }
  const tiendaActual = () => (escena.tipo === "tienda" ? tiendaPorId[escena.t] : null);
  function productosDeSala() {
    const t = tiendaActual(); if (!t) return [];
    const sid = t.salas[escena.s].id;
    let list = t.productos.map((p) => PROD[p.id]).filter((p) => p && p.sala === sid && !p.secreto);
    if (t.id === "consultorio" && estadoDe(t) === "parcial") list = list.filter((p) => p.visibleEnParcial || p.id === "zona-agenda");
    if (t.id === "laboratorio" && estadoDe(t) === "parcial") list = list.filter((p) => p.accion === "sede");
    return list;
  }
  function entrar(tid) { ir({ tipo: "tienda", t: tid, s: 0 }, "fwd"); }
  function pasilloDe(tid) { return Math.max(0, PASILLOS.findIndex((p) => p.vitrinas.some((v) => v.tienda === tid))); }

  /* ---------- Turismo médico: formulario de solicitud ---------- */
  let turT = null;
  function abrirTurismo(t, tratamiento) {
    turT = t; const T = t.turismo || {};
    $("#turTitulo").textContent = T.titulo || "Solicita tu tratamiento";
    $("#turIntro").textContent = T.intro || "";
    const sel = $("#turTrat"); sel.innerHTML = '<option value="">Elige un tratamiento</option>' + (T.tratamientos || []).map((x) => `<option>${esc(x)}</option>`).join("");
    if (tratamiento) sel.value = tratamiento;
    try { const c = JSON.parse(localStorage.getItem(CLIENT_KEY) || "{}"); if (c.nombre && !$("#turNombre").value) $("#turNombre").value = c.nombre; } catch (e) {}
    $("#turErr").textContent = ""; abrir("#turismoForm");
  }
  $("#turEnviar").onclick = () => {
    const t = turT; if (!t) return;
    const v = (id) => $(id).value.trim();
    const d = { nombre: v("#turNombre"), pais: v("#turPais"), trat: v("#turTrat"), fechas: v("#turFechas"), detalle: v("#turDetalle") };
    if (!d.nombre) return ($("#turErr").textContent = "Escribe tu nombre.");
    if (!d.pais) return ($("#turErr").textContent = "¿Desde qué país viajas?");
    if (!d.trat) return ($("#turErr").textContent = "Elige el tratamiento que te interesa.");
    const l = [`¡Hola ${t.nombre}! Vengo de ${NOMBRE_CENTRO} ✈️ Me interesa hacer un tratamiento en Perú.`, "", `Nombre: ${d.nombre}`, `País de residencia: ${d.pais}`, `Tratamiento: ${d.trat}`, `Fechas tentativas de viaje: ${d.fechas || "Por definir"}`];
    if (d.detalle) l.push(`Detalle: ${d.detalle}`);
    l.push("", "¿Me ayudan con el contacto y la coordinación? Gracias.");
    window.open(wa(numero(t), l.join("\n")), "_blank", "noopener");
  };

  /* ---------- Cartelera de especialidades (Turismo médico) ---------- */
  function pintarCartelera(t) {
    const box = $("#cartelera"), row = $("#carteleraRow");
    if (!box) return;
    const on = !!(t && t.turismo);
    box.hidden = !on;
    if (!on) { if (row) row.innerHTML = ""; return; }
    row.innerHTML = "";
    productosDeSala().forEach((p) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "poster";
      b.setAttribute("aria-label", "Ver " + p.nombre);
      b.innerHTML = `<span class="pfoco"><span class="pbulbs" aria-hidden="true"></span><span class="pimg"><img src="${p.img}" alt=""></span><span class="pmeta"><b class="ptitulo">${esc(p.nombre)}</b>${p.nota ? `<i class="pnota">${esc(p.nota)}</i>` : ""}<em class="pcotizar">Cotizar</em></span></span>`;
      b.addEventListener("click", (e) => { e.stopPropagation(); abrirPoster(p); });
      row.appendChild(b);
    });
  }
  function pintarEvento(t) {
    const box = $("#eventoHero");
    if (box) box.hidden = true; /* el anuncio va en el letrero del salón, no tapa los stands */
    pintarBeneficio(t);
  }
  function abrirPoster(p) {
    const t = tiendaPorId[p.tienda];
    $("#pfImg").src = p.img || "";
    $("#pfNombre").textContent = p.nombre;
    $("#pfNota").hidden = !p.nota;
    $("#pfNota").textContent = p.nota || "";
    $("#pfDesc").textContent = p.desc || "";
    $("#pfContacto").onclick = () => window.open(wa(numero(t), `Hola ${t.nombre}, vengo de ${NOMBRE_CENTRO}. Quisiera solicitar contacto para: ${p.nombre}.`), "_blank", "noopener");
    abrir("#posterFicha");
  }
  function abrirStand(p) {
    if (p.standRoma) return abrirStandRoma(p);
    const t = tiendaPorId[p.tienda], E = t.evento || {};
    $("#stNombre").textContent = p.nombre || "Stand disponible";
    $("#stDesc").textContent = p.desc || "Este stand está disponible para exponer en Aesthetic Fest — Feria de Estética.";
    $("#stFecha").textContent = E.fecha || "Fecha por anunciar";
    const msg = E.mensajeStand || `Hola, vengo de ${NOMBRE_CENTRO}. Quiero un stand en Aesthetic Fest — Feria de Estética.`;
    $("#stWa").onclick = () => window.open(wa(numero(t), msg), "_blank", "noopener");
    abrir("#standFicha");
  }
  function parseVideo(item) {
    if (!item) return null;
    const url = String(item.url || item.src || "");
    const id = item.youtube || (url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/) || [])[1];
    if (id) return { tipo: "youtube", id, titulo: item.titulo || item.title || "" };
    if (/instagram\.com/i.test(url)) return { tipo: "instagram", url, titulo: item.titulo || "" };
    if (/\.mp4(\?|$)/i.test(url) || item.tipo === "mp4") return { tipo: "mp4", url, titulo: item.titulo || "" };
    if (url) return { tipo: "link", url, titulo: item.titulo || "" };
    return null;
  }
  function ytSrc(id, extra) {
    const q = Object.assign({ rel: "0", modestbranding: "1", playsinline: "1" }, extra || {});
    return "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?" + Object.keys(q).map((k) => k + "=" + encodeURIComponent(q[k])).join("&");
  }
  function pararVideos() {
    document.querySelectorAll("#pantallaCentral iframe, #standRomaPlayer iframe, #standRomaPlayer video, #ledScreenInner iframe").forEach((el) => {
      if (el.tagName === "VIDEO") { try { el.pause(); } catch (e) {} el.removeAttribute("src"); try { el.load(); } catch (e2) {} }
      else el.removeAttribute("src");
    });
  }
  function videosRoma() { return (typeof VIDEOS_STAND_ROMA !== "undefined" ? VIDEOS_STAND_ROMA : []).map(parseVideo).filter(Boolean); }
  function videosPantalla() { return (typeof PANTALLA_CENTRAL_VIDEOS !== "undefined" ? PANTALLA_CENTRAL_VIDEOS : []).map(parseVideo).filter((v) => v && v.tipo === "youtube"); }
  function pintarPlayer(box, v, autoplay) {
    box.innerHTML = "";
    if (!v) {
      box.classList.add("placeholder");
      box.innerHTML = `<div class="pronto"><b>Pronto: videos de la Dra. Roma Coletti</b><span>Cuando ella los envíe, se verán aquí.</span></div>`;
      return;
    }
    box.classList.remove("placeholder");
    if (v.tipo === "youtube") {
      const ifr = document.createElement("iframe");
      ifr.title = v.titulo || "Video";
      ifr.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen";
      ifr.setAttribute("allowfullscreen", "");
      ifr.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
      ifr.src = ytSrc(v.id, autoplay ? { autoplay: "1", mute: "1" } : {});
      box.appendChild(ifr);
    } else if (v.tipo === "mp4") {
      const vid = document.createElement("video");
      vid.controls = true; vid.playsInline = true; vid.src = v.url;
      if (autoplay) { vid.muted = true; vid.autoplay = true; }
      box.appendChild(vid);
    } else {
      box.classList.add("placeholder");
      const a = document.createElement("a"); a.href = v.url; a.target = "_blank"; a.rel = "noopener";
      a.textContent = (v.tipo === "instagram" ? "Ver en Instagram" : "Ver video") + (v.titulo ? " · " + v.titulo : "");
      box.appendChild(a);
    }
  }
  function abrirStandRoma(p) {
    const t = tiendaPorId[p.tienda], num = String(p.whatsapp || "51915124360").replace(/\D/g, "");
    const lista = videosRoma(), box = $("#standRomaPlayer"), ul = $("#standRomaLista");
    $("#stRomaServicios").onclick = () => { cerrarTodo(); entrar("consultorio"); setTimeout(() => { if (typeof abrirServicios === "function") abrirServicios(); }, 900); };
    $("#stRomaWa").onclick = () => window.open(wa(num, p.mensaje || `Hola Dra. Roma Coletti, vengo de ${NOMBRE_CENTRO}, del stand en Aesthetic Fest.`), "_blank", "noopener");
    abrir("#standRoma");
    if (!lista.length) pintarPlayer(box, null);
    else {
      pintarPlayer(box, lista[0], false);
      ul.hidden = lista.length < 2;
      ul.innerHTML = lista.map((v, i) => `<button type="button" class="rvid${i === 0 ? " on" : ""}" data-i="${i}">${esc(v.titulo || "Video " + (i + 1))}</button>`).join("");
      ul.querySelectorAll(".rvid").forEach((b) => b.onclick = () => {
        ul.querySelectorAll(".rvid").forEach((x) => x.classList.toggle("on", x === b));
        pararVideos(); pintarPlayer(box, lista[+b.dataset.i], false);
      });
    }
  }
  let ledIdx = 0;
  function abrirPantallaCentral() {
    const lista = videosPantalla();
    if (!lista.length) return;
    const mostrar = (i) => {
      ledIdx = (i + lista.length) % lista.length;
      const v = lista[ledIdx];
      $("#ledTitulo").textContent = v.titulo || "Video oficial";
      $("#ledIframe").src = ytSrc(v.id, { autoplay: "1", mute: "1" });
      const pl = $("#ledPlaylist");
      pl.innerHTML = lista.map((x, j) => `<button type="button" class="rvid${j === ledIdx ? " on" : ""}" data-i="${j}">${esc(x.titulo || "Video " + (j + 1))}</button>`).join("");
      pl.querySelectorAll(".rvid").forEach((b) => b.onclick = () => mostrar(+b.dataset.i));
    };
    abrir("#pantallaCentral");
    mostrar(ledIdx || 0);
  }
  function pintarBeneficio(t) {
    const box = $("#beneficioFest"), B = t && t.evento && t.evento.beneficio;
    if (!box) return;
    const on = !!B;
    box.hidden = !on;
    if (!on) return;
    $("#benTitulo").textContent = B.titulo || "";
    $("#benTexto").textContent = B.texto || "";
    const bt = $("#benWa"); bt.textContent = B.boton || "Reservar";
    bt.onclick = () => window.open(wa(String(B.whatsapp || "51948042949").replace(/\D/g, ""), B.mensaje || ""), "_blank", "noopener");
  }

  /* ---------- Puerta secreta (Turismo médico → visa) ---------- */
  function abrirSecreto(t) {
    const S = t.puertaSecreta; $("#secTitulo").textContent = S.titulo;
    $("#secAviso").textContent = S.aviso ? "ⓘ " + S.aviso : "";
    const box = $("#secLista"); box.innerHTML = "";
    S.productos.map((id) => PROD[id]).filter(Boolean).forEach((p) => {
      const c = document.createElement("div"); c.className = "seccard";
      c.innerHTML = `<img src="${p.img}" alt=""><div><strong>${esc(p.nombre)}</strong><b class="secprecio">${p.precio == null ? "Consultar" : precioDe(p)}</b><p>${esc(p.desc)}</p>
        <button type="button" class="primary gold secadd">Agregar a la canasta</button><button type="button" class="link secask">Consultar por WhatsApp</button></div>`;
      if (enObras(t) || t.sinCompra) {
        c.querySelector(".secadd").textContent = "Próximamente";
        c.querySelector(".secadd").disabled = true;
      } else {
        c.querySelector(".secadd").onclick = () => { agregar(p.id, 1); toast(`✓ ${p.nombre} agregado a tu canasta`); cerrarTodo(); };
      }
      c.querySelector(".secask").onclick = () => window.open(wa(numero(t), `Hola ${t.nombre}, vengo de ${NOMBRE_CENTRO}. Quisiera información sobre: ${p.nombre}. ${p.notaMensaje || ""}`.trim()), "_blank", "noopener");
      box.appendChild(c);
    });
    abrir("#secreto");
  }

  /* ---------- Local en alquiler ---------- */
  function abrirAlquiler() {
    const A = typeof LOCAL_EN_ALQUILER !== "undefined" ? LOCAL_EN_ALQUILER : {};
    if (estadoDe("alquiler") === "construccion") {
      $("#alqSign").textContent = "En construcción";
      $("#alqTitulo").textContent = "Próximamente";
      $("#alqTexto").textContent = "Este local está en construcción. Muy pronto podrás consultar los planes de alquiler.";
      $("#alqWa").hidden = true;
      $("#alqPlanes").innerHTML = "";
      $("#alqCinta").hidden = true;
      $("#alqInst").hidden = true;
      $("#alquiler").classList.remove("conplanes");
      abrir("#alquiler"); $("#alquiler").scrollTop = 0;
      return;
    }
    $("#alqWa").hidden = false;
    $("#alqSign").textContent = A.letrero || "En alquiler";
    $("#alqTitulo").textContent = A.titulo || "¿Quieres tu tienda en " + NOMBRE_CENTRO + "?";
    $("#alqTexto").textContent = A.texto || "Este local está disponible.";
    const b = $("#alqWa"); b.textContent = A.boton || "Consultar por WhatsApp";
    b.onclick = () => window.open(wa(String(A.whatsapp || "51948042949").replace(/\D/g, ""), A.mensaje || `Hola, me interesa alquilar un local en ${NOMBRE_CENTRO}.`), "_blank", "noopener");
    const num = String(A.whatsapp || "51948042949").replace(/\D/g, ""), planes = A.planes || [];
    $("#alqPlanes").innerHTML = planes.map((p, i) => `<div class="plan${p.destacado ? " dest" : ""}${p.carrito ? " carr" : ""}">
      ${p.destacado ? `<em class="pdest">Más completo</em>` : ""}<h3>${esc(p.nombre)}</h3>
      <div class="pprecio"><b>${esc(p.precio)}</b><span>${esc(p.periodo || "")}</span></div>
      <ul>${(p.incluye || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      ${p.planPago ? `<details class="ppago"><summary>Ver plan de pago</summary><dl>${p.planPago.map((r) => `<div><dt>${esc(r.t)}</dt><dd><b>${esc(r.v)}</b>${r.d ? `<small>${esc(r.d)}</small>` : ""}</dd></div>`).join("")}</dl></details>` : ""}
      <button type="button" class="pbtn" data-i="${i}">${esc(A.boton_plan || "Lo quiero")}</button></div>`).join("");
    $("#alqPlanes").querySelectorAll(".pbtn").forEach((bt) => bt.onclick = () => window.open(wa(num, planes[bt.dataset.i].mensaje), "_blank", "noopener"));
    $("#alqCinta").hidden = !A.cinta; $("#alqCinta").textContent = A.cinta || "";
    $("#alqInst").hidden = !A.instalacion; $("#alqInst").textContent = A.instalacion || "";
    $("#alquiler").classList.toggle("conplanes", planes.length > 0);
    abrir("#alquiler"); $("#alquiler").scrollTop = 0;
  }

  /* ---------- Buscador (Laboratorio) ---------- */
  const norm = (x) => String(x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  let busT = null, busCat = "";
  const busEtiqueta = (t, n) => {
    const one = t.buscadorItem || "examen", many = t.buscadorItems || "exámenes";
    return n === 1 ? one : many;
  };
  function abrirBuscador(t) {
    busT = t; busCat = "";
    const ch = $("#bCats"); ch.innerHTML = "";
    const cats = ["Todos"].concat(t.categorias || []);
    if (t.id === "matteo") cats.splice(1, 0, "🔥 Súper ofertas");
    cats.forEach((c) => {
      const b = document.createElement("button"); b.type = "button"; b.textContent = c;
      b.dataset.cat = c === "Todos" ? "" : (c.indexOf("Súper ofertas") >= 0 ? "__super__" : c);
      b.onclick = () => { busCat = b.dataset.cat; pintarBusqueda(); }; ch.appendChild(b);
    });
    const titulo = t.buscadorTitulo || "Buscar examen";
    const ph = t.buscadorPlaceholder || "Buscar examen… (ej. azúcar, colesterol, TSH)";
    const h2 = document.querySelector("#buscador h2"); if (h2) h2.textContent = titulo;
    $("#buscador").classList.toggle("vista-grid", t.buscadorVista === "grid");
    $("#buscador").setAttribute("aria-label", titulo);
    $("#bQ").placeholder = ph; $("#bQ").setAttribute("aria-label", ph);
    $("#bQ").value = "";
    if (t.id === "matteo" && typeof window.pucoSoloSuper === "function" && window.pucoSoloSuper()) busCat = "__super__";
    abrir("#buscador"); pintarBusqueda();
    setTimeout(() => { if (window.matchMedia("(min-width: 721px)").matches) $("#bQ").focus(); }, 350);
  }
  function pintarBusqueda() {
    const t = busT; if (!t) return;
    document.querySelectorAll("#bCats button").forEach((b) => b.classList.toggle("on", b.dataset.cat === busCat));
    const palabras = norm($("#bQ").value).split(/\s+/).filter(Boolean);
    const res = t.productos.map((p) => PROD[p.id]).filter((p) => {
      if (busCat === "__super__") return typeof window.pucoEsSuperOferta === "function" && window.pucoEsSuperOferta(p);
      if (busCat && p.categoria !== busCat) return false;
      const texto = norm([p.nombre, p.claves, p.categoria, p.desc].join(" "));
      return palabras.every((w) => texto.includes(w));
    }).sort((a, b) => {
      if (busCat === "__super__") return (b.superAhorro || 0) - (a.superAhorro || 0);
      if (!palabras.length) {
        const order = t.categorias || [];
        const ia = order.indexOf(a.categoria), ib = order.indexOf(b.categoria);
        const ca = ia < 0 ? 999 : ia, cb = ib < 0 ? 999 : ib;
        return (ca - cb) || (b.tendencia || 0) - (a.tendencia || 0) || String(a.nombre).localeCompare(String(b.nombre), "es");
      }
      const q = palabras.join(" "), an = norm(a.nombre), bn = norm(b.nombre);
      return (bn.includes(q) - an.includes(q)) || (norm(b.claves).includes(q) - norm(a.claves).includes(q));
    });
    $("#bCount").textContent = res.length ? `${res.length} ${busEtiqueta(t, res.length)}${t.productos.some((p) => p.ejemplo) ? " · precios de ejemplo" : ""}${t.descuento ? " · " + Math.round(t.descuento * 100) + "% de descuento" : ""}` : "";
    const ul = $("#bRes"); ul.innerHTML = "";
    const vacioNom = t.buscadorItem || "examen";
    if (!res.length) { ul.innerHTML = `<li class="vacio">No encontramos ese ${vacioNom}. <button type="button" class="link" id="bPreg">Consúltanos por WhatsApp</button></li>`;
      $("#bPreg").onclick = () => window.open(wa(numero(t), `Hola ${nombreTienda(t)}, vengo de ${NOMBRE_CENTRO}. ¿Tienen este ${vacioNom}?: ${$("#bQ").value}`), "_blank", "noopener"); return; }
    res.forEach((p) => {
      const li = document.createElement("li"); li.className = "bres";
      const sinCompra = !!(t.enConstruccion || t.sinCompra);
      const so = typeof window.pucoEsSuperOferta === "function" && window.pucoEsSuperOferta(p);
      const badges = [
        p.categoria ? esc(p.categoria) : "",
        p.productoSemana ? '<span class="so-mini semana-mini">🔥 Producto de la semana</span>' : "",
        p.protagonistaMes ? '<span class="so-mini prota-mini">Protagonista del mes</span>' : "",
        p.tendenciaTop ? '<span class="trend-mini">⭐ Tendencia</span>' : "",
        so && !p.productoSemana && !p.protagonistaMes ? '<span class="so-mini">🔥 Súper oferta</span>' : ""
      ].filter(Boolean).join(" ");
      li.innerHTML = `<button type="button" class="binfo">${pucoPicture(p, "grid")}<span><strong>${esc(p.nombre)}</strong><small>${badges}</small></span></button>
        <div class="bact"><b>${p.precio == null ? "Consultar" : precioHTML(p)}</b>${sinCompra ? `<span class="bnota">En construcción</span>` : `<button type="button" class="badd">Agregar a la canasta</button>`}</div>`;
      li.querySelector(".binfo").onclick = () => abrirProducto(p.id);
      const add = li.querySelector(".badd");
      if (add) add.onclick = (e) => { agregar(p.id, 1); const bt = e.currentTarget; bt.textContent = "✓ Agregado"; bt.classList.add("ok"); toast(`${p.nombre} agregado a tu canasta`); setTimeout(() => { bt.textContent = "Agregar a la canasta"; bt.classList.remove("ok"); }, 1600); };
      ul.appendChild(li);
    });
  }
  $("#bQ").addEventListener("input", pintarBusqueda);
  function salir() { const t = tiendaActual(); ir({ tipo: "pasillo", i: t ? pasilloDe(t.id) : 0 }, "back"); }

  function pintarSpots() {
    spots.innerHTML = "";
    if (escena.tipo === "pasillo") {
      const P = PASILLOS[escena.i];
      P.vitrinas.forEach((v) => {
        if (v.proximamente) {
          const s = document.createElement("div"); s.className = "letrero prox";
          Object.assign(s.style, { left: v.letrero.x + "%", top: v.letrero.y + "%", width: v.letrero.w + "%" });
          s.innerHTML = `<small>Nueva tienda</small><b>Próximamente</b>`; spots.appendChild(s); return;
        }
        if (v.alquiler) {
          const A = typeof LOCAL_EN_ALQUILER !== "undefined" ? LOCAL_EN_ALQUILER : {};
          const s = document.createElement("button"); s.type = "button"; s.className = "letrero alquiler" + (v.letrero.h ? " placa" : ""); s.id = "letreroAlquiler";
          Object.assign(s.style, { left: v.letrero.x + "%", top: v.letrero.y + "%", width: v.letrero.w + "%" });
          if (v.letrero.h) s.style.height = v.letrero.h + "%";
          const alqCerrado = estadoDe("alquiler") === "construccion";
          s.innerHTML = alqCerrado
            ? `<b>En construcción</b><small><img class="psimb" src="assets/img/marca/home-mall-simbolo.svg" alt="">Próximamente</small>`
            : `<b>${esc(A.letrero || "En alquiler")}</b><small><img class="psimb" src="assets/img/marca/home-mall-simbolo.svg" alt="">${esc(A.sublema || "Local disponible")}</small>`;
          s.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); abrirAlquiler(); });
          spots.appendChild(s);
          if (!alqCerrado && v.cartel) {
            const c = document.createElement("button"); c.type = "button";
            c.className = "cartel-se-alquila"; c.id = "cartelSeAlquila";
            Object.assign(c.style, { left: v.cartel.x + "%", top: v.cartel.y + "%", width: v.cartel.w + "%" });
            if (v.cartel.h) c.style.height = v.cartel.h + "%";
            c.innerHTML = `<img class="psimb" src="assets/img/marca/home-mall-simbolo.svg" alt=""><b>Se alquila</b><small>Local disponible</small><em>Home Mall</em>`;
            c.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); abrirAlquiler(); });
            spots.appendChild(c);
          }
          if (v.x != null) {
            const b = document.createElement("button"); b.className = "hotspot alq"; b.dataset.alquiler = "1";
            b.style.left = v.x + "%"; b.style.top = v.y + "%";
            b.innerHTML = `<span class="dot"></span><span class="tag">${alqCerrado ? "En construcción" : esc(A.letrero || "Se alquila")}<em>${alqCerrado ? "Próximamente →" : "Ver planes →"}</em></span>`;
            b.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); abrirAlquiler(); });
            spots.appendChild(b);
          }
          return;
        }
        const t = tiendaPorId[v.tienda]; if (!t) return;
        if (t.esTemporada && CAMP.vitrina && v.vitrina) {
          const w = document.createElement("div"); w.className = "vitrina";
          Object.assign(w.style, { left: v.vitrina.x + "%", top: v.vitrina.y + "%", width: v.vitrina.w + "%", height: v.vitrina.h + "%", backgroundImage: `url("${CAMP.vitrina}")` });
          spots.appendChild(w);
        }
        const s = document.createElement(v.colgante ? "button" : "div");
        if (v.colgante) s.type = "button";
        s.className = "letrero" + (t.soloCita ? " lux" : "") + (t.esTemporada ? " temp" : "") + (v.kiosko ? " kiosko" : "") + (v.colgante ? " colgante" : "") + (v.letrero.h && !v.colgante ? " placa" : "");
        Object.assign(s.style, { left: v.letrero.x + "%", top: v.letrero.y + "%", width: v.letrero.w + "%", "--ta": t.tema.a, "--tb": t.tema.b });
        if (v.letrero.h) s.style.height = v.letrero.h + "%";
        s.innerHTML = t.esTemporada ? `<small>Tienda de Temporada</small><b>${esc(CAMP.letrero)}</b>`
          : t.soloCita ? `<b>${esc(t.letreroCorto || t.nombre)}</b><small>Cirugía Plástica</small>`
          : v.kiosko ? `<b>${esc(t.letreroCorto || t.nombre)}</b><small>Hechos a mano</small>`
          : v.colgante ? `<small>Próximamente: Aesthetic Fest, 11–23 dic</small><b>${esc(t.letreroCorto || t.nombre)}</b>`
          : `<b>${esc(t.letreroCorto || t.nombre)}</b>`;
        if (v.colgante) s.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); entrar(t.id); });
        spots.appendChild(s);
        if (t.enConstruccion && !v.colgante) {
          const ribbon = document.createElement("div");
          ribbon.className = "vitrina-cinta" + (t.id === "convenciones" ? " fest" : "");
          ribbon.innerHTML = t.id === "convenciones"
            ? "<b>Próximamente: Aesthetic Fest, 11–23 dic</b>"
            : "<b>En construcción</b>";
          if (v.vitrina) {
            Object.assign(ribbon.style, { left: (v.vitrina.x + v.vitrina.w / 2) + "%", top: (v.vitrina.y + 8) + "%", width: Math.min(v.vitrina.w, 22) + "%" });
          } else {
            Object.assign(ribbon.style, { left: v.letrero.x + "%", top: (v.letrero.y + (v.letrero.h || 8) / 2 + 5) + "%", width: (v.letrero.w || 16) + "%" });
          }
          spots.appendChild(ribbon);
        }
        /* El colgante ya es clicable; un hotspot extra a media altura tapaba los letreros. */
        if (v.colgante) return;
        const b = document.createElement("button"); b.className = "hotspot shop"; b.dataset.tienda = t.id;
        b.style.left = v.x + "%"; b.style.top = v.y + "%";
        const tagEm = t.enConstruccion ? "En construcción · Entrar →"
          : v.kiosko ? "Ver el carrito →" : "Entrar →";
        b.innerHTML = `<span class="dot"></span><span class="tag">${esc(t.esTemporada ? CAMP.nombre : (t.letreroCorto || t.nombre))}<em>${tagEm}</em></span>`;
        if (v.kiosko) b.classList.add("kiosk");
        b.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); entrar(t.id); });
        spots.appendChild(b);
      });
      ajustarLetreros();
      /* Sin botón "Seguir al Pasillo…" en el piso: ya está "Seguir caminando" abajo a la derecha (y el aviso de deslizar lo tapaba). */
      return;
    }
    const t = tiendaActual();
    if (enObras(t)) {
      if (t.puertaSecreta && escena.s === 0) {
        const k = document.createElement("button"); k.type = "button"; k.className = "secreto"; k.id = "puertaSecreta";
        k.setAttribute("aria-label", "Puerta secreta"); k.title = "Próximamente";
        k.style.left = t.puertaSecreta.x + "%"; k.style.top = t.puertaSecreta.y + "%";
        k.innerHTML = `<span class="ojo"></span>`;
        k.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); abrirSecreto(t); });
        spots.appendChild(k);
      }
      pintarProximamente(spots, t);
      puerta(50, 92, "← Salir al pasillo", salir, "out");
      return;
    }
    const salaObj = t.salas[escena.s];
    if (salaObj.pantalla) {
      const pa = document.createElement("div"); pa.className = "pantalla"; pa.id = "pantalla";
      Object.assign(pa.style, { left: salaObj.pantalla.x + "%", top: salaObj.pantalla.y + "%", width: salaObj.pantalla.w + "%", height: salaObj.pantalla.h + "%" });
      pa.innerHTML = `<small>${esc(t.nombre)}</small><b>Sala de espera virtual</b><span class="reloj" id="reloj"></span><i>${esc(t.lema || "")}</i>`;
      spots.appendChild(pa); tickReloj();
    }
    if (t.puertaSecreta && escena.s === 0) {
      const k = document.createElement("button"); k.type = "button"; k.className = "secreto"; k.id = "puertaSecreta";
      k.setAttribute("aria-label", "Puerta secreta"); k.title = "¿Qué habrá detrás de esta puerta?";
      k.style.left = t.puertaSecreta.x + "%"; k.style.top = t.puertaSecreta.y + "%";
      k.innerHTML = `<span class="ojo"></span>`;
      k.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); abrirSecreto(t); });
      spots.appendChild(k);
    }
    if (t.id === "matteo" && typeof window.pintarPucoEstantes === "function") {
      const salaObj = t.salas[escena.s];
      window.pintarPucoEstantes(spots, t, salaObj && salaObj.id);
      if (escena.s > 0) {
        puerta(14, 88, "← " + t.salas[escena.s - 1].nombre, () => ir({ tipo: "tienda", t: t.id, s: escena.s - 1 }, "back"));
      } else {
        puerta(14, 88, "← Salir al pasillo", salir, "out");
      }
      if (escena.s < t.salas.length - 1) {
        puerta(86, 88, "Pasar a " + t.salas[escena.s + 1].nombre + " →", () => ir({ tipo: "tienda", t: t.id, s: escena.s + 1 }, "fwd"));
      } else {
        puerta(86, 88, "← Salir al pasillo", salir, "out");
      }
      return;
    }
    productosDeSala().filter((p) => p.x != null && !p.stand).forEach((p) => {
      const b = document.createElement("button"); b.className = "hotspot" + (p.zona ? " zona" : "") + (p.stand ? " stand" : ""); b.dataset.id = p.id;
      b.style.left = p.x + "%"; b.style.top = p.y + "%";
      const precio = p.stand ? "Libre · ver →" : p.zona ? esc(p.sub || "") : t.soloCita && p.precio == null ? esc(p.sinGrupo ? "" : p.grupo || "") : p.precio == null ? "Consultar" : precioHTML(p);
      b.innerHTML = `<span class="dot"></span><span class="tag">${esc(p.nombre)}${precio ? `<em>${precio}</em>` : ""}</span>`;
      b.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); accionar(p); });
      spots.appendChild(b);
    });
    if (t.id === "consultorio" && estadoDe(t) === "parcial" && t.remodelacion && escena.s === 0) {
      const R = t.remodelacion;
      const pl = document.createElement("div");
      pl.className = "remodelacion-placa";
      pl.setAttribute("aria-hidden", "true");
      Object.assign(pl.style, { left: R.x + "%", top: R.y + "%" });
      pl.innerHTML = `<b>${esc(R.texto || "En remodelación")}</b>${R.sub ? `<small>${esc(R.sub)}</small>` : ""}`;
      spots.appendChild(pl);
    }
    if (t.evento && t.evento.banner) {
      const E = t.evento, bn = E.banner;
      const el = document.createElement("div");
      el.className = "feria-banner"; el.id = "feriaBanner";
      Object.assign(el.style, { left: bn.x + "%", top: bn.y + "%", width: bn.w + "%", height: (bn.h || 10) + "%" });
      el.innerHTML = `<b>${esc(E.titulo || "")}</b><i>${esc(E.subtitulo || "")}</i>${E.cinta ? `<em>${esc(E.cinta)}</em>` : ""}<span>${esc(E.fecha || "Fecha por anunciar")}</span>`;
      spots.appendChild(el);
    }
    if (t.evento && t.evento.pantallaCentral) {
      const pc = t.evento.pantallaCentral;
      const scr = document.createElement("button");
      scr.type = "button"; scr.className = "led-central"; scr.id = "ledCentral";
      scr.setAttribute("aria-label", "Pantalla central: videos musicales");
      Object.assign(scr.style, { left: pc.x + "%", top: pc.y + "%", width: pc.w + "%", height: (pc.h || 22) + "%" });
      scr.innerHTML = `<span class="led-glow" aria-hidden="true"></span><span class="led-bezel"><span class="led-screen" id="ledScreenInner"><span class="led-play" aria-hidden="true"></span></span></span><span class="led-tag">Pantalla central · tocar para ver</span>`;
      scr.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); abrirPantallaCentral(); });
      spots.appendChild(scr);
    }
    productosDeSala().filter((p) => p.stand && !p.standRoma).forEach((p) => {
      const box = p.booth || { x: p.x, y: p.y, w: 7.6, h: 20 };
      const el = document.createElement("button");
      el.type = "button"; el.className = "stand-booth"; el.dataset.id = p.id;
      el.setAttribute("aria-label", "Stand disponible");
      Object.assign(el.style, { left: box.x + "%", top: box.y + "%", width: box.w + "%", height: (box.h || 20) + "%" });
      el.innerHTML = `<span class="sb-light" aria-hidden="true"></span><span class="sb-panel"><b>Stand disponible</b><i>Aesthetic Fest</i><em>Ver stand</em></span>`;
      el.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); abrirStand(p); });
      spots.appendChild(el);
    });
    const roma = t.evento && productosDeSala().find((p) => p.standRoma);
    if (roma) {
      const fa = roma.fachada || roma.neon || { x: roma.x, y: roma.y, w: 12, h: 30 };
      const el = document.createElement("button");
      el.type = "button"; el.className = "stand-fachada"; el.id = "standFachadaRoma";
      el.setAttribute("aria-label", "Entrar al stand de la Dra. Roma Coletti");
      Object.assign(el.style, { left: fa.x + "%", top: fa.y + "%", width: fa.w + "%", height: (fa.h || 30) + "%" });
      el.innerHTML = `<span class="sf-light" aria-hidden="true"></span><span class="sf-panel"><span class="sf-sign"><b>Dra. Roma Coletti</b><i>Cirugía Plástica</i></span><span class="sf-cta">Entrar a mi stand</span></span>`;
      el.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); abrirStandRoma(roma); });
      spots.appendChild(el);
    }
    const salasSpot = (t.id === "consultorio" && estadoDe(t) === "parcial") ? t.salas.filter((s) => s.id === "consultorio") : t.salas;
    const iSpot = salasSpot.indexOf(t.salas[escena.s]);
    if (iSpot >= 0 && iSpot < salasSpot.length - 1) puerta(50, 90, `Pasar a ${salasSpot[iSpot + 1].nombre} →`, () => ir({ tipo: "tienda", t: t.id, s: t.salas.indexOf(salasSpot[iSpot + 1]) }, "fwd"));
    else puerta(50, 92, t.salas[0].id === "carrito" ? "← Volver al pasillo" : "← Salir al pasillo", salir, "out");
  }
  function puerta(x, y, txt, fn, cls) {
    const d = document.createElement("button"); d.className = "door" + (cls ? " " + cls : "");
    d.style.left = x + "%"; d.style.top = y + "%"; d.innerHTML = `<span>${txt}</span>`;
    d.addEventListener("click", (e) => { if (movido) return; e.stopPropagation(); fn(); });
    spots.appendChild(d);
  }

  function pintarUI() {
    const t = tiendaActual(), nav = $("#roomNav");
    document.body.classList.toggle("en-tienda", !!t);
    document.body.classList.toggle("tienda-puco", !!(t && t.id === "matteo"));
    document.body.classList.toggle("lux", !!(t && t.soloCita));
    document.body.classList.toggle("en-cartelera", !!(t && t.turismo));
    document.body.classList.toggle("en-evento", !!(t && t.evento));
    const hud = document.getElementById("pucoHud");
    if (hud) hud.hidden = !(t && t.id === "matteo");
    const dest = document.getElementById("pucoDestacados");
    if (dest) dest.hidden = !(t && t.id === "matteo");
    const sem = document.getElementById("pucoSemana");
    if (sem) sem.hidden = !(t && t.id === "matteo");
    if (typeof window.pucoPintarSticky === "function") window.pucoPintarSticky();
    document.body.style.setProperty("--ta", t ? t.tema.a : "#2b211b");
    document.body.style.setProperty("--tb", t ? t.tema.b : "#c9a24a");
    nav.innerHTML = "";
    const pill = (html, on, fn, cls) => { const b = document.createElement("button"); b.innerHTML = html; if (on) b.classList.add("active"); if (cls) b.className += " " + cls; b.onclick = fn; nav.appendChild(b); return b; };
    if (!t) {
      PASILLOS.forEach((P, i) => pill(P.nombre, escena.i === i, () => ir({ tipo: "pasillo", i }, i < escena.i ? "back" : "fwd"), "corr"));
      tiendas.forEach((x) => pill(esc(nombreTienda(x)), false, () => entrar(x.id)));
    } else {
      pill("← Pasillo", false, salir, "back");
      const salasNav = (t.id === "consultorio" && estadoDe(t) === "parcial") ? t.salas.filter((s) => s.id === "consultorio") : t.salas;
      salasNav.forEach((s) => {
        const i = t.salas.indexOf(s);
        const corto = t.id === "matteo" ? (s.id === "tecnologia" ? "Tecnología" : s.id === "hogar" ? "Hogar" : s.nombre) : s.nombre;
        pill(`${salasNav.length > 1 ? `<small>${i + 1}</small>` : ""}${esc(corto)}`, i === escena.s, () => ir({ tipo: "tienda", t: t.id, s: i }, i < escena.s ? "back" : "fwd"));
      });
    }
    const act = nav.querySelector(".active"); if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest", inline: "center" });
    // info
    const info = $("#roomInfo");
    if (!t) {
      const P = PASILLOS[escena.i];
      info.classList.add("corr");
      info.innerHTML = `<img class="isimb" src="assets/img/marca/home-mall-simbolo-claro.svg" alt=""><span>${esc(NOMBRE_CENTRO)}</span><h2>${esc(P.nombre)}</h2>`;
    } else {
      info.classList.remove("corr");
      const sala = t.salas[escena.s];
      let h = `<span>${esc(t.rubro)}</span><h2>${esc(t.esTemporada ? CAMP.nombre : t.nombre)}${t.salas.length > 1 ? ` · <i>${esc(sala.nombre)}</i>` : ""}</h2><p>${esc(sala.sub)}</p>`;
      if (t.soloCita) h += `<p class="lema">${esc(t.lema)}</p><p class="reg">${esc(t.registro)} · <a href="${t.web}" target="_blank" rel="noopener">draromacoletti.com</a></p>`;
      if (t.aviso) h += `<p class="aviso">ⓘ ${esc(t.aviso)}</p>`;
      if (tieneEjemplo(t) && !(t.id === "laboratorio" && estadoDe(t) === "parcial")) h += `<em class="ejemplo">Catálogo de ejemplo</em>`;
      const mostrarBusca = t.buscador && !(t.id === "laboratorio" && estadoDe(t) === "parcial");
      if (mostrarBusca) {
        const ph = t.buscadorPlaceholder ? t.buscadorPlaceholder.split("…")[0] + "…" : "Buscar examen…";
        const n = t.productos.length;
        h += `<button class="buscabtn" id="buscaBtn" type="button">🔎 <span>${esc(ph)}</span><small>${n} ${busEtiqueta(t, n)}</small></button>`;
      }
      info.innerHTML = h;
      if (mostrarBusca) $("#buscaBtn").onclick = () => abrirBuscador(t);
    }
    // flechas
    const prev = $("#prevBtn"), next = $("#nextBtn");
    if (!t) {
      prev.hidden = escena.i === 0; next.hidden = escena.i === PASILLOS.length - 1;
      $("#nextLabel").textContent = !next.hidden ? PASILLOS[escena.i + 1].nombre : "";
      $("#nextTop").textContent = "Seguir caminando";
    } else {
      const salasUI = (t.id === "consultorio" && estadoDe(t) === "parcial") ? t.salas.filter((s) => s.id === "consultorio") : t.salas;
      const idxUI = salasUI.indexOf(t.salas[escena.s]);
      prev.hidden = false; next.hidden = idxUI < 0 || idxUI >= salasUI.length - 1;
      $("#nextLabel").textContent = !next.hidden ? salasUI[idxUI + 1].nombre : "";
      $("#nextTop").textContent = "Siguiente sala";
    }
    // barra inferior
    const chips = $("#chips"); chips.innerHTML = "";
    const lista = (t && (t.turismo || t.evento || t.id === "matteo")) ? [] : t ? productosDeSala().filter((p) => !t.buscador || p.x != null) : PASILLOS[escena.i].vitrinas.map((v) => tiendaPorId[v.tienda]).filter(Boolean);
    lista.forEach((x) => {
      const b = document.createElement("button"); b.className = "chip";
      if (t) {
        const pr = x.zona ? esc(x.sub || "") : t.soloCita ? esc(x.grupo || "") : x.precio == null ? "Consultar" : precioHTML(x);
        if (x.zona) b.classList.add("zona");
        b.innerHTML = `<img src="${x.img}" alt=""><span>${esc(x.nombre)}<em>${pr}</em></span>`;
        b.onclick = () => accionar(x);
      } else {
        const im = x.salas[0].img;
        b.innerHTML = `<img src="${im}" alt=""><span>${esc(nombreTienda(x))}<em>${x.salas[0].id === "carrito" ? "Ver el carrito →" : "Entrar →"}</em></span>`;
        b.onclick = () => entrar(x.id);
      }
      chips.appendChild(b);
    });
    const cta = $("#ctaBtn");
    const ctaSedes = $("#ctaSedes");
    if (ctaSedes) ctaSedes.hidden = true;
    if (cta) cta.hidden = false;
    if (!t) { cta.textContent = "🗺️ Directorio"; cta.onclick = () => abrir("#directorio"); cta.className = "cta"; }
    else if (t.evento) { cta.textContent = "✦ Avisarme / Quiero participar"; cta.onclick = festWa; cta.className = "cta"; }
    else if (enObras(t)) { cta.textContent = "Próximamente"; cta.onclick = () => toast("Esta tienda está en construcción"); cta.className = "cta"; }
    else if (t.turismo) { cta.textContent = "✈ Solicitar tratamiento"; cta.onclick = () => abrirTurismo(t); cta.className = "cta"; }
    else if (t.id === "laboratorio" && estadoDe(t) === "parcial") {
      cta.hidden = true;
      let box = $("#ctaSedes");
      if (!box) {
        box = document.createElement("div");
        box.id = "ctaSedes";
        box.className = "cta-sedes";
        cta.insertAdjacentElement("beforebegin", box);
      }
      box.hidden = false;
      const sedes = t.sedes || [];
      box.innerHTML = sedes.map((s) => `<button type="button" class="cta" data-sede="${esc(s.id)}">💬 ${esc(s.nombre)}</button>`).join("");
      box.querySelectorAll("[data-sede]").forEach((b) => { b.onclick = () => abrirSede(b.dataset.sede); });
    }
    else if (t.buscador) { cta.textContent = t.buscadorTitulo ? "🔎 " + t.buscadorTitulo : "🔎 Buscar examen"; cta.onclick = () => abrirBuscador(t); cta.className = "cta"; }
    else if (t.soloCita) { cta.textContent = "✦ Agenda tu videoconsulta"; cta.onclick = () => abrirAgenda(); cta.className = "cta lux"; }
    else { cta.textContent = "💬 Escribir a la tienda"; cta.onclick = () => window.open(wa(numero(t), `Hola ${nombreTienda(t)}, vengo de ${NOMBRE_CENTRO}. Tengo una consulta.`), "_blank", "noopener"); cta.className = "cta"; }
    const hint = $("#hint");
    if (!t) hint.textContent = "👆 Desliza o arrastra para recorrer el pasillo · toca una tienda para entrar";
    else if (t.turismo) hint.textContent = "Toca un cartel iluminado para entrar";
    else if (t.evento) hint.textContent = "Toca Entrar a mi stand o la pantalla central";
    else if (t.enConstruccion) hint.textContent = "Esta tienda está en construcción";
    else if (t.id === "matteo") hint.textContent = "Toca Entrar al catálogo para ver los productos";
    else hint.textContent = "👆 Arrastra para mirar alrededor · toca los puntos dorados";
    if (t && enObras(t)) { const cart = document.getElementById("cartelera"); if (cart) cart.hidden = true; document.body.classList.remove("en-cartelera"); }
    else pintarCartelera(t);
    pintarEvento(t);
    let sb = $("#sceneBanner");
    if (!sb) { sb = document.createElement("div"); sb.id = "sceneBanner"; sb.className = "scene-banner"; stage.appendChild(sb); }
    if (t && t.banner) {
      sb.hidden = false;
      sb.className = "scene-banner" + (t.enConstruccion ? " construccion" : t.descuento ? " descuento" : "");
      sb.innerHTML = `<b>${esc(t.banner)}</b>`;
    } else { sb.hidden = true; sb.innerHTML = ""; }
    let fb = $("#festPasilloBar");
    if (!fb) { fb = document.createElement("button"); fb.id = "festPasilloBar"; fb.className = "fest-pasillo-bar"; fb.type = "button"; stage.appendChild(fb); }
    if (!t && FEST) {
      fb.hidden = false;
      fb.innerHTML = `<b>Aesthetic Fest</b><span>${esc(FEST.fechasLargo)}</span><i>Avisarme / Quiero participar</i>`;
      fb.onclick = festWa;
    } else { fb.hidden = true; }
  }

  /* arrastrar para mirar */
  let arrastrando = false, movido = false, sx = 0, sy = 0, ox = 0, oy = 0;
  stage.addEventListener("pointerdown", (e) => {
    if (e.button) return;
    arrastrando = true; movido = false; sx = e.clientX; sy = e.clientY; ox = panX; oy = panY;
    pano.classList.remove("glide");
    /* La captura se pide recién al arrastrar: si se pide al tocar, Chrome manda el clic al pasillo y "Entrar" no responde con mouse. */
  });
  window.addEventListener("pointermove", (e) => {
    if (!arrastrando) return;
    const dx = e.clientX - sx, dy = e.clientY - sy;
    if (!movido && Math.hypot(dx, dy) > 6) { movido = true; stage.classList.add("dragging"); $("#hint").classList.add("gone"); try { stage.setPointerCapture(e.pointerId); } catch (err) {} }
    if (movido) { panX = ox + dx; panY = oy + dy; limitar(); }
  });
  window.addEventListener("pointerup", () => { arrastrando = false; stage.classList.remove("dragging"); setTimeout(() => (movido = false), 0); });
  window.addEventListener("pointercancel", () => { arrastrando = false; movido = false; stage.classList.remove("dragging"); });
  stage.addEventListener("wheel", (e) => {
    if (e.deltaX) panX -= e.deltaX;
    if (e.deltaY) {
      if (e.shiftKey && panoH > stage.clientHeight + 2) panY -= e.deltaY;
      else panX -= e.deltaY; /* la rueda recorre el pasillo; Shift mueve en vertical si hace falta */
    }
    limitar();
    e.preventDefault();
  }, { passive: false });
  window.addEventListener("resize", () => { const fx = (stage.clientWidth / 2 - panX) / (panoW || 1); medir(); centrar(fx); });

  $("#prevBtn").onclick = () => { const t = tiendaActual(); if (!t) ir({ tipo: "pasillo", i: escena.i - 1 }, "back"); else if (escena.s === 0) salir(); else ir({ tipo: "tienda", t: t.id, s: escena.s - 1 }, "back"); };
  $("#nextBtn").onclick = () => { const t = tiendaActual(); if (!t) ir({ tipo: "pasillo", i: escena.i + 1 }, "fwd"); else ir({ tipo: "tienda", t: t.id, s: escena.s + 1 }, "fwd"); };

  /* ---------- Panel de producto ---------- */
  let actual = null, qty = 1, talla = null;
  function abrirProducto(id) {
    const p = PROD[id], t = tiendaPorId[p.tienda]; actual = p; qty = 1;
    $("#panel").classList.toggle("lux", !!t.soloCita);
    const gal = [p.img].concat(Array.isArray(p.fotos) ? p.fotos : []).filter((s, i, a) => s && a.indexOf(s) === i);
    $("#pImg").src = gal[0] || p.img; $("#pImg").alt = p.nombre;
    const gbox = $("#pGal");
    if (gbox) {
      if (gal.length > 1) {
        gbox.hidden = false;
        gbox.innerHTML = gal.map((src, i) => `<button type="button" class="gth${i === 0 ? " on" : ""}" data-src="${esc(src)}"><img src="${esc(src)}" alt=""></button>`).join("");
        gbox.querySelectorAll("button").forEach((b) => {
          b.onclick = () => { $("#pImg").src = b.dataset.src; gbox.querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b)); };
        });
      } else { gbox.hidden = true; gbox.innerHTML = ""; }
    }
    $("#pStore").textContent = nombreTienda(t) + (p.grupo && !p.sinGrupo ? " · " + p.grupo : "");
    $("#pName").textContent = p.nombre;
    const semBadge = $("#pSemanaBadge");
    if (semBadge) {
      if (p.productoSemana) {
        semBadge.hidden = false;
        semBadge.textContent = "🔥 Producto de la semana · Envío gratis desde S/ 200";
        semBadge.classList.remove("p-prota-badge");
      } else if (p.protagonistaMes) {
        semBadge.hidden = false;
        semBadge.textContent = "Protagonista del mes · Envío gratis desde S/ 200";
        semBadge.classList.add("p-prota-badge");
      } else {
        semBadge.hidden = true;
        semBadge.classList.remove("p-prota-badge");
      }
    }
    const sinCompra = !!(t.enConstruccion || t.sinCompra);
    if (t.soloCita && p.precio == null) { $("#pPrice").textContent = ""; $("#pPrice").innerHTML = ""; }
    else if (p.precio == null) { $("#pPrice").textContent = "Precio a consultar"; }
    else {
      const notaIgv = t.aviso && /incluyen IGV/i.test(t.aviso) ? `<small class="nota-igv">Precios incluyen IGV</small>` : "";
      let notaDto = "";
      if (p.productoSemana) notaDto = `<small class="nota-oferta nota-semana">🔥 Producto de la semana · Envío gratis desde S/ 200</small><small class="nota-oferta">S/ 154.90 en otras tiendas. El 10% de la tienda no se acumula.</small>`;
      else if (p.protagonistaMes) notaDto = `<small class="nota-oferta nota-semana">Protagonista del mes · Envío gratis desde S/ 200</small><small class="nota-oferta">Precio especial. El 10% de la tienda no se acumula.</small>`;
      else if (t.descuento && p.precioVenta == null) notaDto = `<small class="nota-oferta">${Math.round(t.descuento * 100)}% de descuento en toda la tienda</small>`;
      $("#pPrice").innerHTML = precioHTML(p) + notaIgv + notaDto;
    }
    $("#pPrice").hidden = !!t.soloCita && p.precio == null;
    $("#pEj").hidden = !p.ejemplo;
    $("#pDesc").textContent = p.desc || ""; $("#pDesc").hidden = !p.desc;
    const specsEl = $("#pSpecs");
    if (specsEl) {
      const specs = Array.isArray(p.specs) ? p.specs : [];
      if (specs.length) { specsEl.hidden = false; specsEl.innerHTML = specs.map((s) => `<li>${esc(s)}</li>`).join(""); }
      else { specsEl.hidden = true; specsEl.innerHTML = ""; }
    }
    $("#pIncluye").hidden = !p.incluye;
    $("#pIncluye").innerHTML = p.incluye ? `<span>Incluye</span><ul>${p.incluye.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
    $("#qRow").hidden = !!t.soloCita || sinCompra;
    $("#addBtn").hidden = !!t.soloCita;
    if (sinCompra) {
      $("#addBtn").hidden = false;
      $("#addBtn").disabled = true;
      $("#addBtn").textContent = "En construcción";
      $("#addBtn").classList.add("disabled");
    } else {
      $("#addBtn").disabled = false;
      $("#addBtn").classList.remove("disabled");
      $("#addBtn").textContent = p.accion === "turismo" ? "✈ Solicitar este tratamiento" : p.precio == null ? "Agregar para cotizar" : "Agregar a la canasta";
    }
    let notaC = $("#pCierre");
    if (!notaC) { notaC = document.createElement("p"); notaC.id = "pCierre"; notaC.className = "fine aviso-compra"; $("#addBtn").insertAdjacentElement("afterend", notaC); }
    notaC.hidden = !sinCompra;
    notaC.textContent = sinCompra ? "Esta tienda está en construcción. Pronto podrás armar tu pedido aquí." : "";
    $("#qRow").hidden = !!t.soloCita || p.accion === "turismo" || sinCompra;
    talla = null;
    const tallas = !t.soloCita && !p.sinTalla && t.tallas ? t.tallas : null;
    $("#tRow").hidden = !tallas; $("#tErr").textContent = "";
    $("#pTallas").innerHTML = "";
    (tallas || []).forEach((tl) => { const b = document.createElement("button"); b.type = "button"; b.className = "talla"; b.textContent = tl; b.dataset.talla = tl;
      b.onclick = () => { talla = tl; $("#tErr").textContent = ""; document.querySelectorAll("#pTallas .talla").forEach((x) => x.classList.toggle("on", x === b)); };
      $("#pTallas").appendChild(b); });
    $("#panel").classList.toggle("vert", !!t.fotosVerticales);
    const ac = t.soloCita ? p.accion || "evaluacion" : null;
    $("#citaBtn").hidden = !t.soloCita;
    $("#citaBtn").textContent = ac === "examenes" ? "Enviar mis exámenes por WhatsApp" : ac === "solicitar" ? "✦ Solicitar" : ac === "pagar" ? `✦ Pagar ${precioDe(p)}` : "✦ Agenda tu videoconsulta";
    $("#citaNote").hidden = !t.soloCita;
    $("#citaNote").innerHTML = ac === "examenes"
      ? `No subas tus exámenes en esta página: al tocar el botón se abre WhatsApp y nos los envías por ahí (fotos o PDF).${EMAIL_EXAMENES ? ` También puedes enviarlos a <a href="mailto:${esc(EMAIL_EXAMENES)}">${esc(EMAIL_EXAMENES)}</a>.` : ""}<br><b>Tus resultados se tratan de forma confidencial.</b>`
      : ac === "solicitar" ? "Te responderemos por WhatsApp con la disponibilidad y las indicaciones." : ac === "pagar" ? "No necesitas consulta previa: respondes 3 preguntas, pagas y envías tu comprobante por WhatsApp para coordinar la fecha." : "Cada caso se define en una evaluación médica personalizada.";
    $("#askBtn").hidden = false;
    $("#askBtn").textContent = !t.soloCita || ac === "pagar" ? "Consultar por WhatsApp" : ac === "evaluacion" ? "Prefiero escribir por WhatsApp" : "Agendar una videoconsulta";
    pintarQty(); abrir("#panel");
  }
  function pintarQty() { $("#pQty").textContent = qty; $("#pSub").textContent = actual.precio == null ? "" : precioDe(actual, actual.precio * qty); }
  $("#qMinus").onclick = () => { if (qty > 1) { qty--; pintarQty(); } };
  $("#qPlus").onclick = () => { if (qty < 99) { qty++; pintarQty(); } };
  $("#addBtn").onclick = () => {
    const tAdd = actual && tiendaPorId[actual.tienda];
    if (tAdd && (tAdd.enConstruccion || tAdd.sinCompra)) { toast("Esta tienda está en construcción"); return; }
    if (actual.accion === "turismo") return abrirTurismo(tiendaPorId[actual.tienda], actual.nombre);
    if (!$("#tRow").hidden && !talla) { $("#tErr").textContent = "Elige tu talla."; return; }
    agregar(actual.id, qty, $("#tRow").hidden ? null : talla);
    toast(`✓ ${qty} x ${actual.nombre}${!$("#tRow").hidden ? " (talla " + talla + ")" : ""} agregado a tu canasta`); cerrarTodo();
  };
  $("#citaBtn").onclick = () => {
    const ac = actual.accion || "evaluacion";
    if (ac === "examenes") window.open(wa(String(WHATSAPP_PREOPERATORIOS).replace(/\D/g, ""), `Hola Dra. Roma Coletti, vengo de ${NOMBRE_CENTRO}. Quisiera el servicio de interpretación de exámenes preoperatorios. Me voy a operar con otro cirujano y les enviaré mis exámenes por aquí.`), "_blank", "noopener");
    else if (ac === "pagar") abrirPagoServicio(actual);
    else if (ac === "solicitar") window.open(wa(numero(tiendaPorId.consultorio), `Hola Dra. Roma Coletti, vengo de ${NOMBRE_CENTRO}. Quisiera solicitar: ${actual.nombre}.`), "_blank", "noopener");
    else abrirAgenda(actual.nombre);
  };
  $("#askBtn").onclick = () => { const t = tiendaPorId[actual.tienda];
    if (actual.accion === "pagar") { window.open(wa(numero(t), actual.pago.mensajeConsulta), "_blank", "noopener"); return; }
    if (t.soloCita) { (actual.accion || "evaluacion") === "evaluacion" ? abrirCita(actual.nombre) : abrirAgenda(actual.nombre); return; } window.open(wa(numero(t), `Hola ${nombreTienda(t)}, vengo de ${NOMBRE_CENTRO}. Quisiera información sobre: ${actual.nombre}.`), "_blank", "noopener"); };

  /* ---------- Capas ---------- */
  function abrir(sel) { cerrarTodo(); $(sel).classList.add("open"); $("#scrim").classList.add("on"); }
  function cerrarTodo() { pararVideos(); document.querySelectorAll(".layer.open").forEach((l) => l.classList.remove("open")); $("#scrim").classList.remove("on"); }
  document.querySelectorAll("[data-close]").forEach((b) => (b.onclick = cerrarTodo));

  if ($("#buzonBtn")) $("#buzonBtn").onclick = abrirBuzon;
  if ($("#wBuzon")) $("#wBuzon").onclick = abrirBuzon;
  if ($("#bzEnviar")) $("#bzEnviar").onclick = enviarBuzon;
  $("#scrim").onclick = cerrarTodo;
  $("#cartBtn").onclick = () => { pintarCarrito(); abrir("#cart"); };
  $("#keepShopping").onclick = cerrarTodo;
  $("#clearCart").onclick = () => { if (confirm("¿Vaciar toda la canasta?")) { carrito = []; guardar(); pintarCarrito(); } };
  $("#cDistrito").addEventListener("change", (e) => { $("#cDistritoOtro").hidden = e.target.value !== "Otro"; pintarEnvioUI(); });
  if ($("#cDistritoOtro")) $("#cDistritoOtro").addEventListener("input", () => pintarEnvioUI());
  function syncEnvio() {
    const envio = (document.querySelector('input[name="cEnvio"]:checked') || {}).value || "delivery";
    if ($("#cDeliveryFields")) $("#cDeliveryFields").hidden = envio === "recojo";
    pintarEnvioUI();
  }
  document.querySelectorAll('input[name="cEnvio"]').forEach((r) => r.addEventListener("change", syncEnvio));
  syncEnvio();
  if ($("#ckVolver")) $("#ckVolver").onclick = () => mostrarPasoCheckout(false);
  function enviarCopiaPedido(g, cli, nro) {
    try {
      if (!esPuco(g.t)) return;
      const endpoint = (typeof PUCO_PEDIDO_RELAY !== "undefined" && String(PUCO_PEDIDO_RELAY || "").trim()) || "";
      if (!endpoint) return;
      const env = cargoEnvio(g, cli);
      const vol = descVolumenDe(g);
      const pagar = env ? totalPagar(g, env) : (vol.aplica ? { "S/": Math.round((subtotalSoles(g) - vol.monto) * 100) / 100 } : g.totales);
      const items = g.items.map((i) => {
        const p = PROD[i.id], n = p.nombre + (i.talla ? " – talla " + i.talla : "");
        if (p.precio == null) return i.qty + " x " + n + " (precio a consultar)";
        const pct = descuentoPctDe(p);
        return i.qty + " x " + n + " (" + precioDe(p) + " c/u" + (pct ? ", " + pct + "% dto." : "") + ") = " + precioDe(p, p.precio * i.qty);
      }).join("\n");
      const descuentos = [];
      if (vol.tieneDestacado) descuentos.push(notaDestacadosDe(vol) + " (el 10% adicional no se acumula en esos ítems)");
      if (vol.aplica) descuentos.push("Descuento compra > S/ " + vol.minimo + " (-" + vol.pct + "%): −" + soles(vol.monto));
      let envioTxt = "—";
      if (env) {
        if (env.gratis) envioTxt = env.zona.nombre + ": Gratis";
        else if (env.pagoEnDestino) envioTxt = env.zona.nombre + ": " + soles(env.monto) + " referencial, se paga en destino";
        else envioTxt = env.zona.nombre + ": " + soles(env.monto);
      }
      const payload = {
        _subject: "Pedido PuCo Tech " + nro,
        _template: "table",
        _captcha: "false",
        _honey: "",
        nombre: cli.nombre || "",
        pedido: nro,
        items: items,
        subtotal: fmtTot(g.totales),
        descuentos: descuentos.join(" | ") || "Ninguno",
        envio: envioTxt,
        total: fmtTot(pagar) + (g.cotizar ? " + ítems a cotizar" : ""),
        celular: cli.celularNorm || cli.celular || "",
        entrega: cli.envio === "recojo" ? "Recojo en tienda" : "Delivery",
        distrito: cli.envio === "recojo" ? "" : (cli.distrito || ""),
        direccion: cli.envio === "recojo" ? "" : (cli.direccion || ""),
        referencia: cli.envio === "recojo" ? "" : (cli.referencia || ""),
        notas: cli.nota || "",
        yape_operacion: cli.yapeOp || "",
        mensaje: mensaje(g, cli, nro)
      };
      const body = JSON.stringify(payload);
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body, keepalive: true, mode: "cors" }).catch(() => {});
    } catch (e) { /* nunca bloquear WhatsApp */ }
  }
  if ($("#ckYaPague")) $("#ckYaPague").onclick = () => {
    if (!pedidoActual) return;
    const { g, nro, tid } = pedidoActual;
    const cli = Object.assign({}, pedidoActual.cli, leerCliente());
    if ($("#cYapeOp")) cli.yapeOp = $("#cYapeOp").value.trim();
    pedidoActual.cli = cli;
    enviarCopiaPedido(g, cli, nro);
    const url = wa(numero(g.t), mensaje(g, cli, nro));
    window.open(url, "_blank", "noopener");
    const b = $("#ckYaPague");
    b.classList.add("sent");
    b.textContent = "Pedido enviado ✓ (toca para reenviar por WhatsApp)";
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarTodo();
    if (document.querySelector(".layer.open") || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) return;
    if (e.key === "ArrowRight" && !$("#nextBtn").hidden) $("#nextBtn").click();
    if (e.key === "ArrowLeft" && !$("#prevBtn").hidden) $("#prevBtn").click();
  });
  let tt; function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2200); }


  const BUZON_KEY = "homeMallBuzon_v1";
  const BUZON_WA = "51948042949";
  function abrirBuzon() {
    const err = $("#bzErr"); if (err) err.textContent = "";
    const w = $("#welcome");
    if (w && !w.classList.contains("gone")) w.classList.add("gone");
    abrir("#buzon");
    const op = $("#bzOpinion"); if (op) setTimeout(() => op.focus(), 200);
  }
  function enviarBuzon() {
    const v = (id) => ($(id) && $(id).value ? $(id).value.trim() : "");
    const opinion = v("#bzOpinion"), deseo = v("#bzDeseo"), nombre = v("#bzNombre"), contacto = v("#bzContacto");
    const err = $("#bzErr");
    if (!opinion && !deseo) {
      if (err) err.textContent = "Escribe tu opinión o lo que te gustaría encontrar.";
      return;
    }
    if (err) err.textContent = "";
    const item = { fecha: new Date().toISOString(), opinion, deseo, nombre, contacto };
    let lista = [];
    try { lista = JSON.parse(localStorage.getItem(BUZON_KEY) || "[]"); } catch (e) { lista = []; }
    if (!Array.isArray(lista)) lista = [];
    lista.push(item);
    try { localStorage.setItem(BUZON_KEY, JSON.stringify(lista)); } catch (e) { /* cuota llena */ }
    const lineas = ["Sugerencia Home Mall:"];
    if (opinion) lineas.push("", "Opinión: " + opinion);
    if (deseo) lineas.push("", "¿Qué te gustaría encontrar en Home Mall?: " + deseo);
    if (nombre) lineas.push("", "Nombre: " + nombre);
    if (contacto) lineas.push("Contacto: " + contacto);
    window.open(wa(BUZON_WA, lineas.join("\n")), "_blank", "noopener");
    toast("Gracias. Te abrimos WhatsApp y guardamos una copia aquí.");
    ["#bzOpinion","#bzDeseo","#bzNombre","#bzContacto"].forEach((id) => { if ($(id)) $(id).value = ""; });
    cerrarTodo();
  }


  /* ---------- Consultorio virtual: solicitud + pago, sala de espera, servicios ---------- */
  /* La fecha, la hora y el enlace de Zoom los coordina la clínica por WhatsApp. */
  const CITAS_KEY = CitasComun.CITAS_KEY, ESPERA_KEY = "galeria_espera_v1";
  const pad = CitasComun.pad;
  let citas = [];
  try { citas = JSON.parse(localStorage.getItem(CITAS_KEY) || "[]"); } catch (e) { citas = []; }
  const guardarCitas = () => { try { localStorage.setItem(CITAS_KEY, JSON.stringify(citas)); } catch (e) {} };

  let agTipo = TIPOS_VIDEOCONSULTA[0].id, agRegion = "peru";
  const tipoSel = () => TIPOS_VIDEOCONSULTA.find((t) => t.id === agTipo) || TIPOS_VIDEOCONSULTA[0];
  const precioSel = () => { const t = tipoSel(); return t.precios[agRegion] || t.precios.peru; };
  function pintarTipos() {
    const box = $("#aTipos"); box.innerHTML = "";
    tiposAgenda().forEach((t) => {
      const pr = t.precios[agRegion] || t.precios.peru;
      const b = document.createElement("button"); b.type = "button"; b.className = "tipo" + (t.id === agTipo ? " on" : ""); b.dataset.tipo = t.id;
      b.innerHTML = `<strong>${esc(t.nombre)}</strong><small>${esc(t.desc)}</small><b>${CitasComun.monto(pr.moneda, pr.monto)}</b>`;
      b.onclick = () => { agTipo = t.id; pintarTipos(); };
      box.appendChild(b);
    });
    document.querySelectorAll("#aRegion button").forEach((b) => b.classList.toggle("on", b.dataset.region === agRegion));
    const pr = precioSel();
    $("#aEnviar").textContent = `Continuar al pago · ${CitasComun.monto(pr.moneda, pr.monto)}`;
  }
  document.querySelectorAll("#aRegion button").forEach((b) => (b.onclick = () => { agRegion = b.dataset.region; pintarTipos(); }));
  function abrirAgenda(servicio, tipo) {
    if (estadoDe("consultorio") === "parcial") agTipo = "consulta";
    if (tipo && tiposAgenda().some((x) => x.id === tipo)) agTipo = tipo;
    const t = tiendaPorId.consultorio, sel = $("#aServicio");
    if (!sel.options.length) {
      sel.innerHTML = '<option value="">Elige un procedimiento o servicio</option>';
      const grupos = {};
      t.productos.filter((p) => !p.zona).forEach((p) => (grupos[p.grupo] = grupos[p.grupo] || []).push(p));
      Object.entries(grupos).forEach(([g, ps]) => { const og = document.createElement("optgroup"); og.label = g; ps.forEach((p) => { const o = document.createElement("option"); o.value = o.textContent = p.nombre; og.appendChild(o); }); sel.appendChild(og); });
      const o = document.createElement("option"); o.value = o.textContent = "Aún no lo sé / quiero orientación"; sel.appendChild(o);
    }
    if (servicio) sel.value = servicio;
    try { const c = JSON.parse(localStorage.getItem(CLIENT_KEY) || "null"); if (c && !$("#aNombre").value) $("#aNombre").value = c.nombre || ""; } catch (e) {}
    $("#agForm").hidden = false; $("#agPago").hidden = true; $("#agOk").hidden = true; $("#agErr").textContent = "";
    pintarTipos(); abrir("#agenda");
  }
  function codigoNuevo() { const c = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; let s = "RC-"; for (let i = 0; i < 5; i++) s += c[Math.floor(Math.random() * c.length)]; return s; }
  const mensajeCita = (c) => CitasComun.mensajeCita(c, NOMBRE_CENTRO);
  const esPlaceholder = (v) => !v || /TU_|XXX/i.test(v);
  let citaPago = null;
  function continuarPago() {
    const tp = tipoSel(), pr = precioSel();
    const c = { tipo: tp.id, tipoNombre: tp.nombre, region: agRegion, moneda: pr.moneda, monto: pr.monto, enlace: pr.enlace,
      nombre: $("#aNombre").value.trim(), telefono: $("#aTel").value.trim(), email: $("#aEmail").value.trim(), servicio: $("#aServicio").value };
    const err = $("#agErr");
    if (!c.nombre) return (err.textContent = "Escribe tu nombre.");
    if (c.telefono.replace(/\D/g, "").length < 7) return (err.textContent = "Escribe un teléfono / WhatsApp válido.");
    if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) return (err.textContent = "Revisa tu email (o déjalo vacío).");
    if (!c.servicio) return (err.textContent = "Elige el procedimiento o servicio de tu interés.");
    err.textContent = "";
    c.codigo = codigoNuevo(); c.creada = new Date().toISOString(); c.estado = "pendiente_pago";
    citas.push(c); guardarCitas();
    try { localStorage.setItem(CitasComun.PENDIENTE_KEY, c.codigo); } catch (e) {}
    citaPago = c; mostrarPago();
  }
  function mostrarPago() {
    const c = citaPago, pr = (TIPOS_VIDEOCONSULTA.find((t) => t.id === c.tipo) || TIPOS_VIDEOCONSULTA[0]).precios[c.region];
    $("#agForm").hidden = true; $("#agPago").hidden = false; $("#agOk").hidden = true;
    $("#pgResumen").innerHTML = `<strong>${esc(c.tipoNombre)} · ${c.region === "extranjero" ? "paciente en el extranjero" : "paciente en Perú"}</strong><span>${esc(c.nombre)} · ${esc(c.servicio)}</span><span>Código ${esc(c.codigo)} · la fecha y la hora se coordinan por WhatsApp</span>`;
    $("#pgMonto").textContent = CitasComun.monto(c.moneda, c.monto);
    const conEnlace = pr.metodos.includes("enlace") && !esPlaceholder(c.enlace);
    const conYape = pr.metodos.includes("yape") && !!PAGO.YAPE_NUMERO && c.moneda === "S/";
    $("#pgEnlaceBox").hidden = !conEnlace;
    $("#pgEnlaceNota").textContent = pr.notaEnlace || "";
    $("#pgEnlaceListo").hidden = true;
    $("#pgYapeBox").hidden = !conYape;
    $("#pgYapeNum").textContent = PAGO.YAPE_NUMERO;
    $("#pgYapeTit").textContent = PAGO.YAPE_TITULAR ? "Titular: " + PAGO.YAPE_TITULAR : ""; $("#pgYapeTit").hidden = !PAGO.YAPE_TITULAR;
    $("#pgQR").hidden = !PAGO.QR_IMAGEN; if (PAGO.QR_IMAGEN) $("#pgQR").src = PAGO.QR_IMAGEN;
    $("#pgYapeMonto").textContent = CitasComun.monto(c.moneda, c.monto);
    $("#pgAlt").hidden = !PAGO_WEB_ALTERNATIVA; $("#pgAlt").href = PAGO_WEB_ALTERNATIVA || "#";
    $("#pgNinguno").hidden = conEnlace || conYape;
    $("#pgErr").textContent = "";
  }
  function pagarEnlace() {
    if (esPlaceholder(citaPago.enlace)) return;
    try { localStorage.setItem(CitasComun.PENDIENTE_KEY, citaPago.codigo); } catch (e) {}
    window.open(citaPago.enlace, "_blank", "noopener");   // PayPal no redirige de vuelta: mostramos "Ya pagué"
    $("#pgEnlaceListo").hidden = false;
  }
  function yaPague(metodo) {
    const pr = TIPOS_VIDEOCONSULTA.find((t) => t.id === citaPago.tipo).precios[citaPago.region];
    const op = metodo === "Yape" ? $("#pgOperacion").value.trim() : $("#pgOperacionEnlace").value.trim();
    citaPago.pago = { metodo: metodo === "Yape" ? "Yape" : "PayPal (tarjeta / Apple Pay / PayPal)", operacion: op,
      detalle: metodo !== "Yape" && citaPago.moneda === "S/" && pr.notaEnlace ? "cobro de US$ 62 al tipo de cambio del día" : "", fecha: new Date().toISOString() };
    citaPago.estado = "pago_reportado"; guardarCitas();
    try { localStorage.removeItem(CitasComun.PENDIENTE_KEY); } catch (e) {}
    const url = wa(numero(tiendaPorId.consultorio), mensajeCita(citaPago));
    window.open(url, "_blank", "noopener");
    $("#agPago").hidden = true; $("#agOk").hidden = false;
    $("#okCodigo").textContent = citaPago.codigo;
    $("#okDetalle").textContent = `${citaPago.tipoNombre} · ${citaPago.servicio}`;
    $("#okWa").href = url;
  }
  /* Pago directo de un servicio con precio fijo (p. ej. bichectomía): Yape + enlace de tarjeta opcional */
  let servPago = null;
  function abrirPagoServicio(p) {
    servPago = p; const pg = p.pago || {};
    $("#spTitulo").textContent = p.nombre;
    $("#spIncluye").innerHTML = (p.incluye || []).map((x) => `<li>${esc(x)}</li>`).join("");
    $("#spMonto").textContent = precioDe(p);
    const conEnlace = (pg.metodos || []).includes("enlace") && !esPlaceholder(pg.enlace);
    const conYape = (pg.metodos || []).includes("yape") && !!PAGO.YAPE_NUMERO && mon(p) === "S/";
    $("#spTarjetaBox").hidden = !conEnlace; $("#spTarjetaListo").hidden = true;
    $("#spYapeBox").hidden = !conYape;
    $("#spYapeMonto").textContent = precioDe(p); $("#spYapeNum").textContent = PAGO.YAPE_NUMERO;
    $("#spYapeTit").textContent = PAGO.YAPE_TITULAR ? "Titular: " + PAGO.YAPE_TITULAR : ""; $("#spYapeTit").hidden = !PAGO.YAPE_TITULAR;
    const nota = (pg.nota || "");
    $("#spDev").textContent = nota; $("#spDev").hidden = !nota;
    $("#spQR").hidden = !PAGO.QR_IMAGEN; if (PAGO.QR_IMAGEN) $("#spQR").src = PAGO.QR_IMAGEN;
    $("#spOperacion").value = "";
    // requisitos (Sí / No) antes del pago
    const reqs = p.requisitos || [], resp = {};
    $("#spCheck").hidden = !reqs.length; $("#spPago").hidden = !!reqs.length;
    $("#spReqs").innerHTML = reqs.map((r, i) => `<div class="req" data-i="${i}">
      <div class="reqtx"><p>${esc(r.texto)}</p>${r.ayuda ? `<small>${esc(r.ayuda)}</small>` : ""}</div>
      ${r.imagen ? `<img class="reqimg" src="${esc(r.imagen)}" alt="${esc(r.alt || "")}">` : ""}
      <div class="sino" role="group" aria-label="${esc(r.texto)}"><button type="button" data-v="si" aria-pressed="false">Sí</button><button type="button" data-v="no" aria-pressed="false">No</button></div></div>`).join("");
    const na = p.noApto || {};
    $("#spNoTit").textContent = na.titulo || ""; $("#spNoTxt").textContent = na.texto || ""; $("#spNoWa").textContent = na.boton || "Consultar por WhatsApp";
    const pintar = () => {
      const vals = reqs.map((_, i) => resp[i]);
      const todosSi = vals.every((v) => v === "si"), algunNo = vals.includes("no");
      $("#spPagar").disabled = !todosSi; $("#spPagar").textContent = `Pagar ${precioDe(p)}`;
      $("#spPagarNota").hidden = todosSi || algunNo;
      $("#spNoApto").hidden = !algunNo; $("#spPagar").hidden = algunNo;
    };
    $("#spReqs").querySelectorAll(".req").forEach((el) => el.querySelectorAll(".sino button").forEach((bt) => bt.onclick = () => {
      resp[el.dataset.i] = bt.dataset.v;
      el.querySelectorAll(".sino button").forEach((x) => { x.classList.toggle("on", x === bt); x.setAttribute("aria-pressed", x === bt); });
      el.classList.toggle("si", bt.dataset.v === "si"); el.classList.toggle("no", bt.dataset.v === "no"); pintar();
    }));
    pintar();
    abrir("#pagoServicio");
  }
  function mensajePagado() {
    const op = $("#spOperacion").value.trim();
    return servPago.pago.mensajePagado + (op ? `\nN° de operación: ${op}` : "");
  }
  $("#spTarjeta").onclick = () => { if (!servPago || esPlaceholder(servPago.pago.enlace)) return; window.open(servPago.pago.enlace, "_blank", "noopener"); $("#spTarjetaListo").hidden = false; };
  $("#spYaPague").onclick = $("#spYaPagueTarjeta").onclick = () => { window.open(wa(numero(tiendaPorId.consultorio), mensajePagado()), "_blank", "noopener"); toast("Se abrió WhatsApp: adjunta tu comprobante"); };
  $("#spConsultar").onclick = () => window.open(wa(numero(tiendaPorId.consultorio), servPago.pago.mensajeConsulta), "_blank", "noopener");
  $("#spCopiar").onclick = () => { try { navigator.clipboard.writeText(PAGO.YAPE_NUMERO.replace(/\D/g, "")); toast("Número copiado"); } catch (e) {} };
  $("#spVolver").onclick = () => abrirProducto(servPago.id);
  $("#spPagar").onclick = () => { if ($("#spPagar").disabled) return; $("#spCheck").hidden = true; $("#spPago").hidden = false; $("#pagoServicio").scrollTop = 0; };
  $("#spAtras").onclick = () => { $("#spPago").hidden = true; $("#spCheck").hidden = false; };
  $("#spNoWa").onclick = () => window.open(wa(numero(tiendaPorId.consultorio), servPago.noApto.mensaje), "_blank", "noopener");

  $("#aEnviar").onclick = continuarPago;
  $("#pgEnlace").onclick = pagarEnlace;
  $("#pgYaPague").onclick = () => yaPague("Yape");
  $("#pgYaPagueEnlace").onclick = () => yaPague("enlace");
  $("#pgCopiar").onclick = () => { try { navigator.clipboard.writeText(PAGO.YAPE_NUMERO.replace(/\D/g, "")); toast("Número copiado"); } catch (e) {} };
  $("#pgVolver").onclick = () => { $("#agPago").hidden = true; $("#agForm").hidden = false; };
  $("#okEspera").onclick = () => irAEspera();

  /* Sala de espera: el paciente pega el enlace de Zoom que recibió por WhatsApp */
  let espera = null, timer = null;
  try { espera = JSON.parse(localStorage.getItem(ESPERA_KEY) || "null"); } catch (e) { espera = null; }
  function zoomValido(u) {
    try { const x = new URL(u.trim()); return x.protocol === "https:" && (x.hostname === "zoom.us" || x.hostname.endsWith(".zoom.us")) && x.pathname.length > 1; } catch (e) { return false; }
  }
  function irAEspera() {
    const t = tiendaPorId.consultorio, idx = t.salas.findIndex((s) => s.id === "espera");
    if (!(escena.tipo === "tienda" && escena.t === "consultorio" && escena.s === idx)) { cerrarTodo(); ir({ tipo: "tienda", t: "consultorio", s: idx }, "fwd"); setTimeout(abrirEspera, 900); }
    else abrirEspera();
  }
  function abrirEspera() {
    const ult = citas[citas.length - 1];
    $("#eNombre").value = (espera && espera.nombre) || (ult && ult.nombre) || $("#eNombre").value;
    $("#eZoomUrl").value = (espera && espera.zoom) || "";
    $("#eFecha").value = (espera && espera.fecha) || ""; $("#eHora").value = (espera && espera.hora) || "";
    $("#eLogin").hidden = false; $("#eSala").hidden = true; $("#eErr").textContent = "";
    abrir("#espera");
  }
  function entrarEspera() {
    const nombre = $("#eNombre").value.trim(), zoom = $("#eZoomUrl").value.trim(), fecha = $("#eFecha").value, hora = $("#eHora").value;
    const err = $("#eErr");
    if (!nombre) return (err.textContent = "Escribe tu nombre para ingresar.");
    if (!zoomValido(zoom)) return (err.textContent = "Pega el enlace de Zoom que te enviamos por WhatsApp (empieza con https:// y es de zoom.us).");
    if (hora && !fecha) return (err.textContent = "Si escribes la hora, indica también la fecha (o deja ambas vacías).");
    err.textContent = "";
    espera = { nombre, zoom, fecha, hora, guardado: new Date().toISOString() };
    try { localStorage.setItem(ESPERA_KEY, JSON.stringify(espera)); } catch (e) {}
    const cita = citas.filter((c) => c.nombre.toLowerCase() === nombre.toLowerCase()).pop() || null;
    $("#eLogin").hidden = true; $("#eSala").hidden = false;
    $("#eHola").textContent = `Hola, ${nombre.split(" ")[0]}`;
    $("#eCita").innerHTML = `<span>Tu videoconsulta</span>` +
      (cita ? `<strong>${esc(cita.tipoNombre)}</strong><small>${esc(cita.servicio)} · Código ${esc(cita.codigo)}</small>` : "") +
      (fecha && hora ? `<strong>${esc(CitasComun.fechaLarga(fecha))} · ${esc(hora)} (hora de Lima)</strong>` : `<small>Fecha y hora: las que te confirmamos por WhatsApp.</small>`) +
      `<em class="okp">Enlace de Zoom guardado ✓ <button class="link" id="eCambiar" type="button">Cambiar</button></em>`;
    $("#eCambiar").onclick = abrirEspera;
    $("#eCuentaBox").hidden = !(fecha && hora);
    clearInterval(timer); if (fecha && hora) { tick(); timer = setInterval(tick, 1000); }
  }
  function tick() {
    const ini = new Date(`${espera.fecha}T${espera.hora}:00${CitasComun.OFF}`).getTime(), falta = ini - Date.now();
    if (falta > 0) {
      const s = Math.floor(falta / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
      $("#eCuenta").textContent = (d ? d + (d === 1 ? " día " : " días ") : "") + `${pad(h)}:${pad(m)}:${pad(x)}`;
      $("#eEstado").textContent = falta < 10 * 6e4 ? "¡Ya casi! Entra a Zoom y espera a que la doctora te admita" : "Faltan para tu videoconsulta";
    } else { $("#eCuenta").textContent = "Es tu hora"; $("#eEstado").textContent = "Entra a Zoom: la doctora te admitirá en un momento"; }
  }
  $("#eEntrar").onclick = entrarEspera;
  $("#eZoom").onclick = () => { if (espera && zoomValido(espera.zoom)) window.open(espera.zoom, "_blank", "noopener"); };
  $("#eAviso").onclick = () => {
    const n = (espera && espera.nombre) || $("#eNombre").value.trim();
    const cita = citas.filter((c) => c.nombre.toLowerCase() === n.toLowerCase()).pop();
    const cuando = espera && espera.fecha && espera.hora ? ` de las ${espera.hora} (${CitasComun.fechaLarga(espera.fecha)})` : "";
    const txt = `Hola, soy ${n}${cita ? ` (código ${cita.codigo})` : ""}. Ya estoy en la sala de espera virtual de ${NOMBRE_CENTRO} para mi videoconsulta${cuando}. Quedo atenta(o) para que me admitan en Zoom.`;
    window.open(wa(numero(tiendaPorId.consultorio), txt), "_blank", "noopener");
  };
  $("#eSalir").onclick = () => { clearInterval(timer); cerrarTodo(); };
  function tickReloj() { const r = document.getElementById("reloj"); if (r) r.textContent = new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", timeZone: "America/Lima" }); }
  setInterval(tickReloj, 15000);

  /* Menú de servicios */
  function abrirServicios() {
    if (estadoDe("consultorio") === "parcial") { toast("El área de servicios está en remodelación"); return; }
    const t = tiendaPorId.consultorio, box = $("#servList"); box.innerHTML = "";
    const grupos = {};
    t.productos.filter((p) => !p.zona).forEach((p) => (grupos[p.grupo] = grupos[p.grupo] || []).push(PROD[p.id]));
    Object.entries(grupos).forEach(([g, ps]) => {
      const h = document.createElement("h3"); h.textContent = g; box.appendChild(h);
      ps.forEach((p) => {
        const ac = p.accion || "evaluacion";
        const r = document.createElement("div"); r.className = "serv"; r.dataset.id = p.id;
        r.innerHTML = `<div><strong>${esc(p.nombre)}</strong><small>${esc(p.incluye ? precioDe(p) + " · incluye " + p.incluye.join(", ").toLowerCase() : p.desc)}</small></div><button class="sbtn">${ac === "evaluacion" ? "Agendar" : ac === "examenes" ? "Enviar" : ac === "pagar" ? "Pagar" : "Solicitar"}</button>`;
        r.querySelector("div").onclick = () => abrirProducto(p.id);
        r.querySelector("button").onclick = () => { abrirProducto(p.id); $("#citaBtn").click(); };
        box.appendChild(r);
      });
    });
    abrir("#servicios");
  }
  function accionar(p) {
    if (p.accion === "sede") return abrirSede(p);
    if (estadoDe("consultorio") === "parcial" && (p.accion === "espera" || p.accion === "servicios")) { toast("Esta área está en remodelación"); return; }
    if (p.accion === "agenda") return abrirAgenda();
    if (p.accion === "espera") return irAEspera();
    if (p.accion === "servicios") return abrirServicios();
    if (p.cartelera) return abrirPoster(p);
    if (p.stand) return abrirStand(p);
    abrirProducto(p.id);
  }
  window.Galeria.citas = () => citas;
  window.Galeria.mirar = (fx) => centrar(fx);   // centra la vista en una posición horizontal (0–1)
  window.Galeria.precioSel = () => ({ tipo: agTipo, region: agRegion, ...precioSel() });

  /* ---------- Inicio ---------- */
  document.title = NOMBRE_CENTRO + " · Centro comercial virtual";
  document.querySelectorAll("[data-nombre]").forEach((el) => (el.textContent = NOMBRE_CENTRO));
  document.querySelectorAll("[data-lema]").forEach((el) => (el.textContent = LEMA_CENTRO));
  const dir = $("#dirList");
  tiendas.forEach((t) => {
    const b = document.createElement("button"); b.className = "diritem"; b.style.setProperty("--ta", t.tema.a);
    const est = estadoDe(t);
    const badge = est === "construccion" ? '<em class="dir-estado">En construcción</em>'
      : (t.id === "consultorio" && est === "parcial") ? '<em class="dir-estado">Recepción abierta</em>'
      : (t.id === "laboratorio" && est === "parcial") ? '<em class="dir-estado">Sedes</em>'
      : (tieneEjemplo(t) ? "<em>ejemplo</em>" : "");
    b.innerHTML = `<img src="${t.salas[0].img}" alt=""><span><strong>${esc(nombreTienda(t))}</strong><small>${esc(t.esTemporada ? "Tienda de Temporada" : t.rubro)}</small></span>${badge}`;
    b.onclick = () => { cerrarTodo(); $("#welcome").classList.add("gone"); entrar(t.id); };
    dir.appendChild(b);
  });
  $("#wStores").textContent = tiendas.map(nombreTienda).join(" · ");
  const sel = $("#cDistrito");
  DISTRITOS.forEach((d) => { const o = document.createElement("option"); o.value = o.textContent = d; sel.appendChild(o); });
  try {
    const c = JSON.parse(localStorage.getItem(CLIENT_KEY) || "null");
    if (c) {
      $("#cNombre").value = c.nombre || "";
      if ($("#cCelular")) $("#cCelular").value = c.celular || c.celularNorm || "";
      if ($("#cReferencia")) $("#cReferencia").value = c.referencia || "";
      $("#cDireccion").value = c.direccion || "";
      if ($("#cNota") && c.nota) $("#cNota").value = c.nota;
      if (c.envio) {
        const r = document.querySelector(`input[name="cEnvio"][value="${c.envio}"]`);
        if (r) r.checked = true;
        syncEnvio();
      }
      if (DISTRITOS.includes(c.distrito)) sel.value = c.distrito; else if (c.distrito) { sel.value = "Otro"; $("#cDistritoOtro").hidden = false; $("#cDistritoOtro").value = c.distrito; }
    }
  } catch (e) {}
  /* Entrada: la puerta (logo) se abre y pasa al Pasillo 1 */
  let abriendo = false;
  function abrirPuerta() {
    if (abriendo) return; abriendo = true;
    const w = $("#welcome");
    if (escena.tipo !== "pasillo" || escena.i !== 0) ir({ tipo: "pasillo", i: 0 }, "fwd");
    const reducir = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducir) { w.classList.add("gone"); return; }
    w.classList.add("abriendo");
    setTimeout(() => w.classList.add("cruzando"), 700);
    setTimeout(() => { w.classList.add("gone"); }, 1100);
    setTimeout(() => w.classList.remove("abriendo", "cruzando"), 1900);
  }
  const festBtn = $("#festAvisar");
  if (festBtn) festBtn.onclick = (e) => { e.preventDefault(); e.stopPropagation(); festWa(); };
  $("#startTour").onclick = abrirPuerta;
  $("#perilla").onclick = (e) => { e.stopPropagation(); abrirPuerta(); };
  $("#puerta").onclick = abrirPuerta;
  $("#puerta").onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirPuerta(); } };
  $("#wDir").onclick = () => { $("#welcome").classList.add("gone"); abrir("#directorio"); };
  pintarCarrito();
  // escena inicial desde la URL (#pasillo-2, #visa, #temporada/luces)
  const h = decodeURIComponent(location.hash.slice(1));
  let ini = { tipo: "pasillo", i: 0 };
  if (h) {
    const pi = PASILLOS.findIndex((p) => p.id === h);
    const [tid, sid] = h.split("/");
    if (pi >= 0) { ini = { tipo: "pasillo", i: pi }; $("#welcome").classList.add("gone"); }
    else if (tiendaPorId[tid] && tiendaPorId[tid].salas) { ini = { tipo: "tienda", t: tid, s: Math.max(0, tiendaPorId[tid].salas.findIndex((s) => s.id === sid)) }; $("#welcome").classList.add("gone"); }
  }
  if (h === "visa" || h === "turismo/secreto") { ini = { tipo: "tienda", t: "turismo", s: 0 }; $("#welcome").classList.add("gone"); setTimeout(() => abrirSecreto(tiendaPorId.turismo), 900); }

  window.addEventListener("hashchange", () => {
    const h = decodeURIComponent(location.hash.slice(1) || "");
    if (!h) return;
    const pi = PASILLOS.findIndex((p) => p.id === h);
    if (pi >= 0) { if (escena.tipo !== "pasillo" || escena.i !== pi) ir({ tipo: "pasillo", i: pi }, "fwd"); return; }
    const [tid, sid] = h.split("/");
    if (!tiendaPorId[tid] || !tiendaPorId[tid].salas) return;
    const s = Math.max(0, tiendaPorId[tid].salas.findIndex((x) => x.id === sid));
    if (escena.tipo !== "tienda" || escena.t !== tid || escena.s !== s) ir({ tipo: "tienda", t: tid, s }, "fwd");
  });
  ir(ini, "fwd");
  setTimeout(() => $("#hint").classList.add("gone"), 6000);
})();
