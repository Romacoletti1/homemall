/* Funciones compartidas por index.html y pago-exitoso.html (no editar) */
(function () {
  const OFF = "-05:00", pad = (n) => String(n).padStart(2, "0");
  const aMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
  const aHHMM = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
  const fechaLarga = (fecha) => new Date(`${fecha}T12:00:00${OFF}`).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "America/Lima" });
  const monto = (moneda, n) => `${moneda} ${Number(n).toFixed(2)}`;
  function mensajeCita(c, centro) {
    return [`Hola Dra. Roma Coletti, vengo de ${centro}. Quisiera una *${c.tipoNombre}* por videollamada:`, "",
      `Código: ${c.codigo}`, `Nombre: ${c.nombre}`, `Teléfono: ${c.telefono}`, c.email ? `Email: ${c.email}` : null,
      `Paciente: ${c.region === "extranjero" ? "en el extranjero" : "en Perú"}`,
      `Procedimiento de interés: ${c.servicio}`,
      `Valor: ${monto(c.moneda, c.monto)}`,
      c.pago ? "" : null,
      c.pago ? `✅ *Ya pagué* ${monto(c.moneda, c.monto)} por ${c.pago.metodo}${c.pago.detalle ? " (" + c.pago.detalle + ")" : ""}.` : null,
      c.pago && c.pago.operacion ? `N° de operación: ${c.pago.operacion}` : null,
      c.pago ? "Les envío la captura de mi comprobante por aquí. 📎" : null,
      "", "Quedo atenta(o) para coordinar por WhatsApp la fecha y hora de mi videoconsulta y recibir el enlace de Zoom. Gracias."].filter((x) => x !== null).join("\n");
  }
  window.CitasComun = { OFF, pad, aMin, aHHMM, fechaLarga, monto, mensajeCita, CITAS_KEY: "galeria_citas_v1", PENDIENTE_KEY: "galeria_cita_pendiente" };
})();
