/* =========================================================================
   CENTRO COMERCIAL VIRTUAL — ARCHIVO DE CATÁLOGO (lo único que debes editar)
   -------------------------------------------------------------------------
   • Precios en soles, solo el número (ej.: 129). precio: null = "Consultar".
   • ejemplo: true  → producto/precio de ejemplo (muestra la etiqueta
     "Catálogo de ejemplo"). Cámbialo a false cuando pongas datos reales.
   • x, y = posición del punto dorado sobre la foto, en % (0–100).
   • whatsapp = código de país + número, solo dígitos (ej.: "51948042949").
   ========================================================================= */

const NOMBRE_CENTRO = "Home Mall";           // ← cambia el nombre del centro comercial
const LEMA_CENTRO   = "Tu centro comercial virtual en Lima";

/* Videos del stand de la Dra. Roma Coletti en Aesthetic Fest.
   Cuando ella envíe los enlaces, agrégalos aquí. Cada ítem: { titulo, url }
   url puede ser YouTube, Instagram o un .mp4. Lista vacía = se muestra el aviso
   «Pronto: videos de la Dra. Roma Coletti». No uses fotos de pacientes. */
const VIDEOS_STAND_ROMA = [
];

/* Pantalla LED central del Centro de Convenciones: solo videos oficiales de
   YouTube (se incrustan desde youtube-nocookie.com, no se descargan ni se
   rehostean). IDs comprobados con oEmbed en el canal HYBE LABELS:
   Dynamite (gdZLi9oWNZg), Butter (WMweEpGlu_U), Permission to Dance (CuklIb9d3fI). */
const PANTALLA_CENTRAL_VIDEOS = [
  { titulo: "Dynamite", youtube: "gdZLi9oWNZg" },
  { titulo: "Butter", youtube: "WMweEpGlu_U" },
  { titulo: "Permission to Dance", youtube: "CuklIb9d3fI" }
];

/* ------------------------ CONSULTORIO VIRTUAL --------------------------
   La fecha, la hora y el enlace de Zoom de cada cita los coordina la clínica por
   WhatsApp (no se eligen en la web). */
const WHATSAPP_PREOPERATORIOS = "51953168737";             // WhatsApp para recibir e interpretar exámenes preoperatorios (+51 953 168 737)
const EMAIL_EXAMENES = "";                           // ← opcional: correo para recibir exámenes (ej.: "examenes@tudominio.com"). Vacío = no se muestra

/* Pagos de videoconsulta: se paga ANTES; luego el paciente envía el comprobante por
   WhatsApp (51915124360) y la clínica coordina fecha/hora y envía el enlace de Zoom. */
const PAGO_ENLACE_CONSULTA   = "https://www.paypal.com/ncp/payment/HR8T9L247KZV2";  // PayPal: tarjeta, Apple Pay o PayPal (cobra US$ 62)
const PAGO_ENLACE_EVALUACION = "https://TU_ENLACE_DE_PAGO_EVALUACION";             // ← REEMPLAZA cuando tengas link para la evaluación (mientras tanto solo Yape)
const PAGO_ENLACE_BICHECTOMIA = "https://TU_ENLACE_DE_PAGO_BICHECTOMIA";       // ← REEMPLAZA con un link que cobre S/ 750 + IGV (tarjeta). Mientras tenga "TU_" solo se muestra Yape
const PAGO_WEB_ALTERNATIVA   = "https://draromacoletti.com/pago";                   // otra forma de pago (se muestra como enlace)

const PAGO = {
  YAPE_NUMERO: "915 124 360",     // Yape (solo pagos desde Perú, en soles). "" = ocultar
  YAPE_TITULAR: "",               // ← opcional: nombre que aparece en Yape
  QR_IMAGEN: ""                   // ← opcional: ruta de tu QR de Yape (ej.: "assets/img/pago/qr-yape.png"). "" = no se muestra
};

/* PuCo Tech — Yape/Plin de la tienda (NO uses el Yape de la clínica 915 124 360).
   Vacío = en el paso de pago se muestra «Próximamente». Completa el número cuando lo tengas. */
const PUCO_YAPE_NUMERO = "";    // ej.: "9XX XXX XXX"  (Yape / Plin de PuCo Tech)
const PUCO_YAPE_TITULAR = "";   // opcional: nombre que aparece en Yape/Plin
const PUCO_YAPE_QR = "";        // opcional: ruta del QR (ej.: "assets/img/pago/qr-puco-yape.png")

/* Copia silenciosa de cada pedido PuCo Tech a Gmail (FormSubmit, sin backend).
   Tras el primer envío, FormSubmit pide activar el formulario por correo.
   Cuando llegue el alias hash, reemplaza PUCO_PEDIDO_RELAY_ALIAS para no exponer el correo. */
const PUCO_PEDIDO_RELAY_ALIAS = "2aafb76c3a2e224b498014cea2b5a796"; // alias FormSubmit (no expone el correo)
const PUCO_PEDIDO_RELAY = (typeof PUCO_PEDIDO_RELAY_ALIAS === "string" && PUCO_PEDIDO_RELAY_ALIAS.trim())
  ? ("https://formsubmit.co/ajax/" + PUCO_PEDIDO_RELAY_ALIAS.trim())
  : ("https://formsubmit.co/ajax/" + atob("cm9tYWNvbGV0dGkyMDE2QGdtYWlsLmNvbQ=="));

/* PuCo Tech — gastos de envío (Roma, 17 nov 2026).
   Recojo gratis. Lima Metropolitana S/ 10. Callao y zonas alejadas S/ 15.
   Provincias: S/ 18 referencial, se paga en destino (Shalom / Olva) o se coordina.
   Envío gratis en Lima (metro y zonas alejadas/Callao) desde S/ 200.
   El producto de la semana no incluye envío gratis por sí solo. */
const PUCO_ENVIO = {
  gratisDesde: 200,
  zonas: {
    recojo: { id: "recojo", nombre: "Recojo en tienda", precio: 0, nota: "Gratis" },
    lima: {
      id: "lima", nombre: "Lima Metropolitana", precio: 10,
      distritos: ["Miraflores","San Isidro","Santiago de Surco","San Borja","La Molina","Barranco","Jesús María","Lince","Magdalena del Mar","Pueblo Libre","San Miguel","Surquillo","La Victoria","Cercado de Lima"]
    },
    alejada: {
      id: "alejada", nombre: "Callao y zonas alejadas de Lima", precio: 15,
      distritos: ["Callao","Ate","Los Olivos","San Martín de Porres","Chorrillos"]
    },
    provincias: {
      id: "provincias", nombre: "Provincias (agencia Shalom / Olva)", precio: 18,
      pagoEnDestino: true,
      nota: "S/ 18 referencial, se paga en destino o se coordina"
    }
  }
};

/* 10% adicional cuando el subtotal (ya con el 10% de la tienda, antes del envío) es mayor a S/ 200.
   El producto de la semana y los protagonistas del mes cuentan para el umbral (y para el envío gratis),
   pero no reciben este 10%: ya tienen precio especial y los descuentos no se acumulan en esos ítems. */
const PUCO_DESC_VOLUMEN = { minimo: 200, pct: 10 };

/* Estado de cada tienda: "abierta" | "parcial" | "construccion".
   Roma puede reabrir un local cambiando solo este mapa (no borra el contenido). */
const TIENDAS_ESTADO = {
  consultorio: "parcial",
  matteo: "abierta",
  fajas: "abierta",
  laboratorio: "parcial",
  turismo: "construccion",
  ropa: "construccion",
  amigurumis: "abierta",
  convenciones: "construccion",
  temporada: "construccion",
  alquiler: "disponible"
};

const AESTHETIC_FEST = {
  titulo: "Aesthetic Fest",
  fechasCorto: "11–23 dic",
  fechasLargo: "11 al 23 de diciembre de 2026",
  lugar: "Centro de Convenciones Home Mall",
  cinta: "Descuentos exclusivos en cada especialidad",
  preop: "Con preoperatorio completo: evaluación preoperatoria gratuita y luego agendas con quien quieras",
  whatsapp: "51948042949",
  mensaje: "Hola, vengo de Home Mall. Quiero que me avisen / quiero participar en Aesthetic Fest, del 11 al 23 de diciembre de 2026, en el Centro de Convenciones Home Mall. Descuentos exclusivos en cada especialidad, con preoperatorio completo: evaluación preoperatoria gratuita y luego agendas con quien quieras."
};

/* Tipos de videoconsulta. "metodos": "enlace" = botón de pago con link · "yape" = Yape */
const TIPOS_VIDEOCONSULTA = [
  { id: "consulta", nombre: "Consulta médica virtual", desc: "Videoconsulta con la Dra. Roma Coletti",
    precios: {
      peru:       { moneda: "S/",  monto: 200, enlace: PAGO_ENLACE_CONSULTA, metodos: ["enlace", "yape"],
                    notaEnlace: "Con PayPal se cobra US$ 62 al tipo de cambio del día." },
      extranjero: { moneda: "US$", monto: 62,  enlace: PAGO_ENLACE_CONSULTA, metodos: ["enlace"] }
    } },
  { id: "prequirurgica", nombre: "Evaluación prequirúrgica", desc: "Evaluación por videollamada antes de tu cirugía",
    precios: {
      peru:       { moneda: "S/", monto: 50, enlace: PAGO_ENLACE_EVALUACION, metodos: ["enlace", "yape"] },
      extranjero: { moneda: "S/", monto: 50, enlace: PAGO_ENLACE_EVALUACION, metodos: ["enlace", "yape"] }
    } }
];

/* ---------------------------- TEMPORADA -------------------------------- */
const CAMPAÑA_ACTIVA = "navidad";   // ← "navidad" | "sanvalentin" | "madre" | "patrias" | "halloween"
const CAMBIO_AUTOMATICO = false;    // true = elige la campaña según las fechas de cada una (abajo)

/* ---------------------------- PASILLOS --------------------------------- */
/* Cada vitrina: tienda = id de la tienda; letrero = posición del letrero; x,y = punto para entrar */
/* Cartel del local libre (vitrina con alquiler: true en PASILLOS) */
const LOCAL_EN_ALQUILER = {
  letrero: "Se alquila",
  sublema: "Local disponible",
  titulo: "¿Quieres tu tienda en Home Mall?",
  texto: "Este local está disponible.",
  boton: "Consultar por WhatsApp",
  whatsapp: "51948042949",
  mensaje: "Hola, me interesa alquilar un local en Home Mall.",
  /* Planes que se muestran como tarjetas. "mensaje" = texto de WhatsApp de cada botón. Borra o agrega planes libremente. */
  planes: [
    { nombre: "Básico",     precio: "desde S/ 250", periodo: "/mes",
      incluye: ["Ambiente propio", "Hasta 15 productos", "Pedidos por WhatsApp"],
      mensaje: "Hola, me interesa el plan Básico para alquilar un local en Home Mall." },
    { nombre: "Intermedio", precio: "desde S/ 450", periodo: "/mes",
      incluye: ["Todo lo del Básico", "Más productos", "Actualizaciones mensuales"],
      mensaje: "Hola, me interesa el plan Intermedio para alquilar un local en Home Mall." },
    { nombre: "Premium",    precio: "desde S/ 800", periodo: "/mes", destacado: true,
      incluye: ["Vitrina destacada", "Cambios de temporada", "Prioridad en el pasillo"],
      mensaje: "Hola, me interesa el plan Premium para alquilar un local en Home Mall." },
    { nombre: "Carrito en pasillo", precio: "S/ 150", periodo: "/mes", carrito: true,
      incluye: ["Carrito tipo kiosko en el pasillo (como el de Amigurumis)", "Hasta 8 productos", "Lanzamiento: S/ 100/mes los 3 primeros meses"],
      /* Se muestra plegado bajo la tarjeta como «Ver plan de pago» */
      planPago: [
        { t: "Instalación", v: "S/ 300", d: "Pago único al firmar: diseño del carrito, fotos y carga de hasta 8 productos." },
        { t: "Alquiler", v: "S/ 150/mes", d: "Pago adelantado los primeros días de cada mes (Yape o transferencia)." },
        { t: "Lanzamiento", v: "S/ 100/mes", d: "Los primeros 3 meses. Primer pago: S/ 400 (instalación + primer mes)." },
        { t: "Permanencia mínima", v: "3 meses" },
        { t: "Cambio de productos", v: "1 gratis/mes", d: "Cambios extra: S/ 30 c/u." }
      ],
      mensaje: "Hola, me interesa alquilar un carrito en el pasillo de Home Mall." }
  ],
  boton_plan: "Lo quiero",
  instalacion: "Instalación única desde S/ 800 (básico) · desde S/ 1,800 (premium)",
  cinta: "Lanzamiento: 3 meses con descuento para los primeros locales"
};

const PASILLOS = [
  { id: "pasillo-1", nombre: "Pasillo 1", img: "assets/img/pasillo-1.jpg", vitrinas: [
    /* letrero: x/y = centro de la placa dorada de la foto, w/h = su tamaño (en % de la foto). La placa HTML la cubre. */
    /* Orden L→R: Roma Coletti, PuCo Tech, DIH Fajas, Arcalab. El carrito va en el piso, a la izquierda, sin tapar fachadas ni letreros. */
    /* Fachadas: van con el id de la tienda (tools/build_pasillos.py + assets/img/fachadas/), nunca con el número de slot. */
    { tienda: "consultorio", letrero: { x: 14.2, y: 25.6, w: 20.4, h: 10.6 }, x: 14, y: 58 },
    { tienda: "matteo",      letrero: { x: 38.3, y: 25.6, w: 19.6, h: 10.6 }, x: 38, y: 58 },
    { tienda: "fajas",       letrero: { x: 61.6, y: 25.6, w: 19.2, h: 10.6 }, x: 67, y: 44 },
    { tienda: "amigurumis",  kiosko: true, letrero: { x: 24.2, y: 68.3, w: 12 }, x: 24.2, y: 84.5 },
    { tienda: "laboratorio", letrero: { x: 85.5, y: 25.6, w: 20.4, h: 10.6 }, x: 86, y: 58 },
    { tienda: "convenciones", colgante: true, letrero: { x: 50, y: 14.0, w: 26, h: 8.0 }, x: 50, y: 14.0 }
  ]},
  { id: "pasillo-2", nombre: "Pasillo 2", img: "assets/img/pasillo-2.jpg", vitrinas: [
    { tienda: "turismo",     letrero: { x: 14.2, y: 21.9, w: 14.4, h: 6.6 }, x: 13, y: 52 },
    { tienda: "ropa",        letrero: { x: 38.0, y: 21.9, w: 14.4, h: 6.6 }, x: 38, y: 50 },
    { alquiler: true,        letrero: { x: 61.5, y: 21.9, w: 14.4, h: 6.6 }, x: 61, y: 70, cartel: { x: 61.5, y: 49, w: 13.2, h: 30 } },
    { tienda: "temporada",   letrero: { x: 85.0, y: 21.9, w: 14.6, h: 6.6 }, x: 85, y: 52, vitrina: { x: 74, y: 27, w: 21.3, h: 46 } }
  ]}
];

/* ----------------------------- TIENDAS --------------------------------- */
const TIENDAS = [
  {
    id: "turismo", nombre: "Turismo Médico", rubro: "Tratamientos en Perú para pacientes del extranjero", whatsapp: "51948042949",
    tema: { a: "#7a5c2e", b: "#d9bf7a" },
    salas: [{ id: "lounge", nombre: "Lounge", sub: "Te ponemos en contacto y coordinamos tu tratamiento en Perú", img: "assets/img/tiendas/turismo.jpg" }],
    /* accion: "turismo" = formulario de solicitud; cartelera: true = afiche de especialidad */
    turismo: {
      titulo: "Solicita tu tratamiento en Perú",
      intro: "Cuéntanos desde dónde viajas, qué tratamiento buscas y tus fechas tentativas. Te ponemos en contacto con especialistas y coordinamos tu visita.",
      tratamientos: ["Cirugía bariátrica", "Oftalmología", "Odontología", "Cirugía cardiovascular – várices", "Cirugía maxilofacial", "Cirugía plástica", "Chequeos médicos"]
    },
    /* Puerta secreta: una cerradura dorada discreta en la foto abre la pestaña con estos productos */
    puertaSecreta: { x: 84.6, y: 47.2, titulo: "Adelantamos tu cita para la visa", productos: ["visa-1"],
      aviso: "La disponibilidad depende del calendario del consulado. No se garantizan fechas." },
    cierreMensaje: "¿Me indican los pasos a seguir? Gracias.",
    productos: [
      { id: "tur-bar", nombre: "Cirugía bariátrica", precio: null, accion: "turismo", cartelera: true,
        img: "assets/img/cartelera/tur-bar.svg",
        desc: "Te ponemos en contacto con especialistas en cirugía de obesidad y coordinamos tu evaluación en Perú." },
      { id: "tur-oft", nombre: "Oftalmología", precio: null, accion: "turismo", cartelera: true,
        img: "assets/img/cartelera/tur-oft.svg",
        desc: "Cirugía de ojos, corrección de la vista y evaluaciones oftalmológicas en clínicas de Lima." },
      { id: "tur-odo", nombre: "Odontología", precio: null, accion: "turismo", cartelera: true,
        img: "assets/img/cartelera/tur-odo.svg",
        desc: "Estética dental, implantes, carillas y otros tratamientos odontológicos, con citas coordinadas para tu viaje." },
      { id: "tur-var", nombre: "Cirugía cardiovascular – várices", precio: null, accion: "turismo", cartelera: true,
        img: "assets/img/cartelera/tur-var.svg",
        desc: "Te conectamos con especialistas en el tratamiento de várices y circulación." },
      { id: "tur-max", nombre: "Cirugía maxilofacial", precio: null, accion: "turismo", cartelera: true,
        img: "assets/img/cartelera/tur-max.svg",
        desc: "Coordinamos tu evaluación con especialistas en cirugía de rostro, maxilar y articulación." },
      { id: "tur-pla", nombre: "Cirugía plástica", precio: null, accion: "turismo", cartelera: true,
        nota: "Dra. Roma Coletti", img: "assets/img/cartelera/tur-pla.svg",
        desc: "Procedimientos de cirugía plástica con la Dra. Roma Coletti, coordinación de fechas y acompañamiento en tu recuperación." },
      { id: "tur-che", nombre: "Chequeos médicos", precio: null, accion: "turismo", cartelera: true,
        img: "assets/img/cartelera/tur-che.svg",
        desc: "Chequeos preventivos y análisis para que viajes a Perú con tu evaluación en orden." },
      { id: "visa-1", nombre: "Adelanto de cita de visa", precio: 150, moneda: "US$", secreto: true,
        notaMensaje: "Entiendo que la disponibilidad depende del calendario del consulado.",
        desc: "Gestionamos el adelanto de tu cita de entrevista de visa de EE.UU. a una fecha más próxima cuando el consulado libera espacios. Precio: US$ 150. La disponibilidad depende del calendario del consulado; no se garantizan fechas." }
    ]
  },
  {
    id: "ropa", nombre: "Ropa y Calzado", rubro: "Moda para ella y él", whatsapp: "51948042949",
    tema: { a: "#3b2f2a", b: "#c9a24a" },
    salas: [{ id: "tienda", nombre: "Boutique", sub: "Nueva colección", img: "assets/img/tiendas/ropa.jpg" }],
    productos: [
      { id: "ropa-1", nombre: "Vestido midi floral",   precio: 129, ejemplo: true, x: 14, y: 52, desc: "Vestido midi con estampado floral y lazo en la cintura. Tallas S–L." },
      { id: "ropa-2", nombre: "Blusas y camisas",      precio: 69,  ejemplo: true, x: 27, y: 42, desc: "Blusas de tela fluida en tonos neutros. Tallas S–XL." },
      { id: "ropa-3", nombre: "Jean tiro alto",        precio: 119, ejemplo: true, x: 44, y: 50, desc: "Jean stretch tiro alto, corte recto." },
      { id: "ropa-4", nombre: "Stilettos clásicos",    precio: 159, ejemplo: true, x: 68, y: 22, desc: "Tacón de 9 cm, acabado charol o gamuza. Tallas 35–39." },
      { id: "ropa-5", nombre: "Zapatillas urbanas",    precio: 189, ejemplo: true, x: 68, y: 44, desc: "Zapatillas blancas de cuero sintético, suela cómoda. Tallas 35–43." },
      { id: "ropa-6", nombre: "Camisa casual hombre",  precio: 89,  ejemplo: true, x: 84, y: 66, desc: "Camisa de algodón, manga larga. Tallas S–XL." }
    ]
  },
  {
    id: "amigurumis", nombre: "Amigurumis", rubro: "Carrito de muñecos tejidos a mano", whatsapp: "51948042949",
    tema: { a: "#7a5a7e", b: "#e8b4b8" },
    salas: [{ id: "carrito", nombre: "Carrito", sub: "Tejidos a crochet, uno por uno", img: "assets/img/tiendas/amigurumis-kiosko.jpg" }],
    productos: [
      { id: "ami-1", nombre: "Osito con bufanda",        precio: 65,  ejemplo: true, x: 17, y: 40, desc: "Osito tejido a crochet, 20 cm, relleno hipoalergénico." },
      { id: "ami-2", nombre: "Conejita",                 precio: 65,  ejemplo: true, x: 28, y: 36, desc: "Conejita de 22 cm con orejas largas, ideal para regalo." },
      { id: "ami-3", nombre: "Pulpito",                  precio: 45,  ejemplo: true, x: 38, y: 43, desc: "Pulpito de 12 cm, colores a elección." },
      { id: "ami-4", nombre: "Muñeca grande",            precio: 120, ejemplo: true, x: 46, y: 64, desc: "Muñeca de 30 cm con vestido tejido. Pelo y colores a elección." },
      { id: "ami-5", nombre: "Muñeca personalizada en caja", precio: 95, ejemplo: true, x: 60, y: 66, desc: "Muñeca inspirada en la persona que recibe el regalo, en caja de presentación." },
      { id: "ami-6", nombre: "Llaveros amigurumi",       precio: 18,  ejemplo: true, x: 75, y: 56, desc: "Llaveros tejidos de 6 cm: estrellas, corazones y animalitos." },
      { id: "ami-7", nombre: "Set sonajeros bebé",       precio: 55,  ejemplo: true, x: 71, y: 82, desc: "Sonajeros con aro de madera natural y tejido de algodón." }
    ]
  },
  {
    id: "consultorio", nombre: "Roma Coletti", letreroCorto: "Roma Coletti", rubro: "Cirugía Plástica · Contorno Corporal", whatsapp: "51915124360",
    soloCita: true,   // sin carrito ni precios: todo se solicita por WhatsApp
    lema: "Sé quien quieras ser", registro: "CMP 60940 · RNE 30051", web: "https://draromacoletti.com/",
    tema: { a: "#8c6d2f", b: "#d4af37" },
    salas: [
      { id: "consultorio", nombre: "Recepción", sub: "Agenda tu videoconsulta", img: "assets/img/tiendas/consultorio.jpg" },
      { id: "espera", nombre: "Sala de espera virtual", sub: "Relájate, te llamaremos cuando sea tu turno", img: "assets/img/tiendas/consultorio-espera.jpg",
        pantalla: { x: 33, y: 21.5, w: 26.4, h: 29.5 } }   // pantalla dorada de la foto (se muestra la hora)
    ],
    /* accion: "agenda" = abre la agenda de videoconsulta · "espera" = sala de espera virtual
               "servicios" = menú de servicios · "examenes" = envío de exámenes por WhatsApp
               "evaluacion" = cirugía (agenda videoconsulta o escribe) · "solicitar" = botón Solicitar
       Sin x/y = no aparece punto en la foto, pero sí en el menú de Servicios y en la barra inferior. */
    remodelacion: { x: 84, y: 46, texto: "En remodelación", sub: "Postoperatorio" },
    productos: [
      { id: "zona-agenda",   zona: true, accion: "agenda",    nombre: "Agenda tu videoconsulta", sub: "Consulta médica virtual", sala: "consultorio", x: 52, y: 58, visibleEnParcial: true, desc: "" },
      { id: "zona-servicios", zona: true, accion: "servicios", nombre: "Servicios",              sub: "Cirugía · Bienestar · Exámenes", sala: "consultorio", x: 18, y: 60, desc: "" },
      { id: "zona-espera",   zona: true, accion: "espera",    nombre: "Sala de espera virtual",  sub: "Con tu enlace de Zoom", sala: "consultorio", x: 72, y: 32, desc: "" },
      { id: "espera-entrar", zona: true, accion: "espera",    nombre: "Ingresar a la sala de espera", sub: "Con tu nombre o código", sala: "espera", x: 46, y: 62, desc: "" },
      { id: "espera-agenda", zona: true, accion: "agenda",    nombre: "¿Aún no tienes cita?",     sub: "Agenda tu videoconsulta", sala: "espera", x: 82, y: 72, desc: "" },

      { id: "cx-1", nombre: "Lipoescultura",       grupo: "Cirugía de contorno corporal", accion: "evaluacion", desc: "Remodelación del contorno corporal mediante la extracción de grasa localizada. Plan personalizado según tu evaluación." },
      { id: "cx-2", nombre: "Lipoabdominoplastia", grupo: "Cirugía de contorno corporal", accion: "evaluacion", desc: "Combina lipoescultura y abdominoplastia para redefinir el abdomen y la cintura." },
      { id: "cx-3", nombre: "Mastopexia",          grupo: "Cirugía de contorno corporal", accion: "evaluacion", desc: "Levantamiento y remodelación de las mamas para devolverles forma y posición." },
      { id: "cx-4", nombre: "Implantes mamarios",  grupo: "Cirugía de contorno corporal", accion: "evaluacion", desc: "Aumento mamario con implantes, elegidos contigo según tu anatomía y tus objetivos." },
      { id: "cx-5", nombre: "Braquioplastia",      grupo: "Cirugía de contorno corporal", accion: "evaluacion", desc: "Remodelación de brazos para retirar exceso de piel y grasa." },
      { id: "cx-6", nombre: "Remodelación costal", grupo: "Cirugía de contorno corporal", accion: "evaluacion", desc: "Técnica para afinar la cintura y estilizar la silueta. Se indica tras evaluación." },

      { id: "int-1", nombre: "Rejuvenecimiento íntimo con Retraction", grupo: "Bienestar íntimo y armonía", accion: "solicitar", x: 86, y: 66,
        desc: "Tratamiento de radiofrecuencia Retraction para el bienestar y la firmeza de la zona íntima, con piezas especializadas. Se realiza en privado y de forma discreta, siempre después de una evaluación médica. Precio a consultar." },
      { id: "bic-1", nombre: "Bichectomía", grupo: "Bienestar íntimo y armonía", accion: "pagar", x: 90, y: 36,
        precio: 750, moneda: "S/", masIgv: true, precioTexto: "S/ 750 + IGV", sinGrupo: true, desc: "",
        incluye: ["Preoperatorio", "Procedimiento", "Faja", "Cita virtual de control a los 3 días"],
        pago: { metodos: ["yape", "enlace"], enlace: PAGO_ENLACE_BICHECTOMIA,
                nota: "Si los exámenes preoperatorios indican que no eres apta, se descuenta el costo de los exámenes y se devuelve el resto.",
                mensajePagado: "Hola, pagué la bichectomía (S/ 750 + IGV: preoperatorio, procedimiento, faja y control virtual a los 3 días). Adjunto mi comprobante para coordinar fecha.",
                mensajeConsulta: "Hola Dra. Roma Coletti, vengo de Home Mall. Quisiera consultar sobre la bichectomía (S/ 750 + IGV)." },
        /* No requiere consulta previa: antes de pagar, la paciente responde estas 3 preguntas. "Pagar" se activa solo si todas son "Sí". */
        requisitos: [
          { texto: "¿Tienes menos de 35 años?" },
          { texto: "¿Quieres reducir el volumen de la parte baja de las mejillas?", imagen: "assets/img/ilustraciones/zona-bichat.svg",
            alt: "Ilustración de un rostro con la zona baja de las mejillas marcada en dorado" },
          { texto: "¿No tienes problemas de mordida?",
            ayuda: "Tus dientes de arriba y de abajo encajan bien al cerrar la boca, no tienes la mandíbula muy adelantada ni muy atrás, y no tienes bruxismo ni dolor o chasquidos en la mandíbula." }
        ],
        noApto: { titulo: "Para tu seguridad, primero queremos evaluarte",
                  texto: "Según tus respuestas, lo mejor es que la doctora revise tu caso antes del procedimiento. Escríbenos y te orientamos con gusto.",
                  boton: "Consultar por WhatsApp", mensaje: "Hola, quiero consultar si soy candidata para bichectomía." } },
      { id: "rf-1", nombre: "Sesiones INDIBA",     grupo: "Postoperatorio y bienestar", accion: "solicitar", x: 81, y: 52, desc: "Radiofrecuencia para acompañar tu recuperación postoperatoria, según indicación médica." },
      { id: "rf-2", nombre: "Sesiones Retraction", grupo: "Postoperatorio y bienestar", accion: "solicitar", desc: "Radiofrecuencia orientada a la firmeza de la piel, como parte de tu protocolo." },
      { id: "rf-3", nombre: "Sesiones Tensamax",   grupo: "Postoperatorio y bienestar", accion: "solicitar", desc: "Sesiones de radiofrecuencia para bienestar y tensado de la piel, indicadas tras evaluación." },
      { id: "pos-2", nombre: "Terapia del dolor",  grupo: "Postoperatorio y bienestar", accion: "solicitar", desc: "Manejo del dolor, incluido el dolor postoperatorio, con un plan indicado tras tu evaluación." },

      { id: "exa-1", nombre: "Interpretación de exámenes preoperatorios", grupo: "Exámenes", accion: "examenes",
        desc: "¿Te vas a operar con otro cirujano y ya tienes tus exámenes? Envíanoslos: nuestro equipo los revisa e interpreta, y te entrega diagnóstico, recomendaciones y un informe escrito." }
    ]
  },
  {
    id: "fajas", nombre: "DIH Fajas", letreroCorto: "DIH Fajas", rubro: "Prendas de compresión postoperatoria", whatsapp: "51930950652",
    tema: { a: "#8a5a5a", b: "#e5c3b3" },
    tallas: ["XS", "S", "M", "L", "XL", "XXL"],   // selector de talla en prendas (no en accesorios con sinTalla)
    fotosVerticales: true,                        // las fotos de producto se muestran completas (maniquí entero)
    aviso: "Precios incluyen IGV",
    salas: [{ id: "tienda", nombre: "Showroom", sub: "Toca un maniquí o un punto dorado para ver la prenda", img: "assets/img/tiendas/fajas-maniquies.jpg" }],
    productos: [
      { id: "faja-tl", nombre: "Tabla lumbar",              precio: 120, sinTalla: true, x: 9,  y: 62, img: "assets/img/productos/faja-tl.jpg", desc: "Tabla de apoyo lumbar." },
      { id: "faja-ta", nombre: "Tabla abdominal",           precio: 120, sinTalla: true, x: 83, y: 48, img: "assets/img/productos/faja-ta.jpg", desc: "Tabla de apoyo abdominal." },
      { id: "faja-lf", nombre: "Lipo foam x3",              precio: 180, sinTalla: true, x: 9,  y: 48, img: "assets/img/productos/faja-lf.jpg", desc: "Set de 3 láminas de foam." },
      { id: "faja-me", nombre: "Mentonera",                 precio: 100, sinTalla: true, x: 91, y: 36, img: "assets/img/productos/faja-me.jpg", desc: "Mentonera de compresión." },
      { id: "faja-fo", nombre: "Formador de ombligo",       precio: 100, sinTalla: true, x: 91, y: 62, img: "assets/img/productos/faja-fo.jpg", desc: "Formador de ombligo." },
      { id: "faja-ci", nombre: "Cinturilla",                precio: 270, x: 70, y: 48, img: "assets/img/productos/faja-ci.jpg", desc: "Cinturilla de compresión." },
      { id: "faja-en", nombre: "Faja enterizo",             precio: 350, x: 56, y: 46, img: "assets/img/productos/faja-en.jpg", desc: "Faja enterizo de compresión." },
      { id: "faja-sh", nombre: "Faja Sheila",               precio: 210, x: 43, y: 50, img: "assets/img/productos/faja-sh.jpg", desc: "Faja Sheila de compresión." },
      { id: "faja-br", nombre: "Brasier postoperatorio",    precio: 200, x: 30, y: 38, img: "assets/img/productos/faja-br.jpg", desc: "Brasier postoperatorio." },
      { id: "faja-bs", nombre: "Faja bajo busto sin mangas", precio: 350, x: 17, y: 46, img: "assets/img/productos/faja-bs.jpg", desc: "Faja bajo busto sin mangas." },
      { id: "faja-bc", nombre: "Faja bajo busto con mangas", precio: 350, x: 63, y: 32, img: "assets/img/productos/faja-bc.jpg", desc: "Faja bajo busto con mangas." }
    ]
  },
  {
    id: "matteo", nombre: "PuCo Tech", letreroCorto: "PuCo Tech",
    rubro: "Tecnología y accesorios importados", whatsapp: "51948042949",
    tema: { a: "#2b211b", b: "#c9a24a" },
    descuento: 0.10,
    banner: "10% en toda la tienda",
    buscador: true,
    buscadorTitulo: "Catálogo PuCo Tech",
    buscadorPlaceholder: "Buscar producto… (ej. lámpara, audífono, balanza)",
    buscadorItem: "producto",
    buscadorItems: "productos",
    buscadorVista: "grid",
    categorias: ["Iluminación", "Audio", "Cocina y hogar", "Relojes", "Celulares y foto", "Cables y energía", "Accesorios"],
    salas: [
      { id: "tecnologia", nombre: "Tecnología y accesorios", sub: "Cables, energía, celular, audio, iluminación, trípodes y cámaras", img: "assets/img/tiendas/puco-tecnologia.jpg" },
      { id: "hogar", nombre: "Hogar y cocina", sub: "Cocina, hogar, relojes, despertadores y cuidado personal", img: "assets/img/tiendas/puco-hogar.jpg" }
    ],
    productos: typeof PUCO_PRODUCTOS !== "undefined" ? PUCO_PRODUCTOS : []
  },
  {
    id: "laboratorio", nombre: "Arcalab", letreroCorto: "Arcalab", rubro: "Laboratorio clínico", whatsapp: "51960711669",
    /* Sedes: la segunda es Sede San Borja (nunca Surco). WhatsApp San Borja: 51960711669.
       Sede Miraflores: 51922777640. */
    tema: { a: "#1f5f8b", b: "#9fd3e6" },
    buscador: true,   // muestra "Buscar examen…" con filtros por categoría
    categorias: ["Hematología", "Bioquímica", "Hormonas", "Orina y heces", "Inmunología", "Perfiles", "Domicilio"],
    /* Foto por categoría para los exámenes sin punto en la sala */
    imgCategoria: { "Hematología": "assets/img/productos/labcat-hematologia.jpg", "Bioquímica": "assets/img/productos/labcat-bioquimica.jpg", "Hormonas": "assets/img/productos/labcat-hormonas.jpg",
      "Orina y heces": "assets/img/productos/labcat-orina.jpg", "Inmunología": "assets/img/productos/labcat-inmunologia.jpg", "Perfiles": "assets/img/productos/labcat-perfiles.jpg", "Domicilio": "assets/img/productos/labcat-domicilio.jpg" },
    sedes: [
      { id: "miraflores", nombre: "Sede Miraflores", whatsapp: "51922777640", sub: "Agenda y consultas" },
      { id: "san-borja", nombre: "Sede San Borja", whatsapp: "51960711669", sub: "Agenda y consultas" }
    ],
    salas: [{ id: "sede", nombre: "Recepción", sub: "Sede Miraflores y Sede San Borja", img: "assets/img/tiendas/laboratorio.jpg" }],
    /* claves = sinónimos para el buscador (sin tildes, separados por espacios). x/y = punto en la foto (solo destacados) */
    productos: [
      { id: "lab-sede-miraflores", zona: true, accion: "sede", sedeId: "miraflores", nombre: "Sede Miraflores", sub: "WhatsApp 922 777 640", sala: "sede", x: 36, y: 52, img: "assets/img/tiendas/laboratorio.jpg", desc: "" },
      { id: "lab-sede-san-borja", zona: true, accion: "sede", sedeId: "san-borja", nombre: "Sede San Borja", sub: "WhatsApp 960 711 669", sala: "sede", x: 64, y: 52, img: "assets/img/tiendas/laboratorio.jpg", desc: "" },
      { id: "lab-1", nombre: "Hemograma completo", precio: 25, categoria: "Hematología", claves: "hemoglobina hematocrito globulos rojos blancos leucocitos plaquetas anemia sangre", ejemplo: true, x: 95, y: 72, desc: "Recuento de glóbulos rojos, blancos y plaquetas, hemoglobina y hematocrito." },
      { id: "lab-8", nombre: "Hemoglobina y hematocrito", precio: 12, categoria: "Hematología", claves: "anemia sangre hb hto", ejemplo: true, desc: "Medición de hemoglobina y hematocrito." },
      { id: "lab-9", nombre: "Velocidad de sedimentación (VSG)", precio: 12, categoria: "Hematología", claves: "vsg eritrosedimentacion inflamacion", ejemplo: true, desc: "Marcador general de inflamación." },
      { id: "lab-10", nombre: "Grupo sanguíneo y factor Rh", precio: 15, categoria: "Hematología", claves: "tipo de sangre rh grupo", ejemplo: true, desc: "Determina tu grupo sanguíneo (A, B, AB, O) y el factor Rh." },
      { id: "lab-11", nombre: "Perfil de coagulación (TP, TTPa, INR)", precio: 45, categoria: "Hematología", claves: "coagulacion tiempo de protrombina inr ttp sangrado", ejemplo: true, desc: "Evalúa la coagulación de la sangre; se pide antes de cirugías." },
      { id: "lab-12", nombre: "Recuento de plaquetas", precio: 12, categoria: "Hematología", claves: "plaquetas dengue", ejemplo: true, desc: "Cantidad de plaquetas en sangre." },
      { id: "lab-2", nombre: "Glucosa en ayunas", precio: 10, categoria: "Bioquímica", claves: "azucar glicemia glucemia diabetes", ejemplo: true, x: 8, y: 71, desc: "Medición de glucosa (azúcar) en sangre. Requiere 8 h de ayuno." },
      { id: "lab-13", nombre: "Hemoglobina glicosilada (HbA1c)", precio: 45, categoria: "Bioquímica", claves: "azucar diabetes glicada hba1c a1c", ejemplo: true, desc: "Promedio de azúcar en sangre de los últimos 3 meses." },
      { id: "lab-14", nombre: "Curva de tolerancia a la glucosa", precio: 60, categoria: "Bioquímica", claves: "azucar diabetes embarazo tolerancia", ejemplo: true, desc: "Glucosa en ayunas y después de una bebida azucarada." },
      { id: "lab-15", nombre: "Colesterol total", precio: 12, categoria: "Bioquímica", claves: "colesterol grasa lipidos", ejemplo: true, desc: "Nivel de colesterol total en sangre." },
      { id: "lab-16", nombre: "Triglicéridos", precio: 12, categoria: "Bioquímica", claves: "trigliceridos grasa lipidos", ejemplo: true, desc: "Nivel de triglicéridos en sangre. Requiere ayuno." },
      { id: "lab-17", nombre: "Urea", precio: 12, categoria: "Bioquímica", claves: "rinon renal", ejemplo: true, desc: "Evalúa la función de los riñones." },
      { id: "lab-18", nombre: "Creatinina", precio: 12, categoria: "Bioquímica", claves: "rinon renal funcion renal", ejemplo: true, desc: "Evalúa la función de los riñones." },
      { id: "lab-19", nombre: "Ácido úrico", precio: 12, categoria: "Bioquímica", claves: "gota acido urico articulaciones", ejemplo: true, desc: "Nivel de ácido úrico en sangre." },
      { id: "lab-20", nombre: "Perfil hepático", precio: 70, categoria: "Bioquímica", claves: "higado transaminasas tgo tgp bilirrubina fosfatasa", ejemplo: true, desc: "Transaminasas, bilirrubinas, fosfatasa alcalina y proteínas." },
      { id: "lab-21", nombre: "Transaminasas (TGO / TGP)", precio: 30, categoria: "Bioquímica", claves: "higado tgo tgp ast alt", ejemplo: true, desc: "Enzimas del hígado." },
      { id: "lab-22", nombre: "Electrolitos (Na, K, Cl)", precio: 40, categoria: "Bioquímica", claves: "sodio potasio cloro electrolitos", ejemplo: true, desc: "Sodio, potasio y cloro en sangre." },
      { id: "lab-23", nombre: "Ferritina", precio: 45, categoria: "Bioquímica", claves: "hierro anemia reservas", ejemplo: true, desc: "Reservas de hierro del cuerpo." },
      { id: "lab-24", nombre: "Vitamina D", precio: 95, categoria: "Bioquímica", claves: "vitamina d 25 oh huesos", ejemplo: true, desc: "Nivel de vitamina D (25-OH)." },
      { id: "lab-25", nombre: "Vitamina B12", precio: 85, categoria: "Bioquímica", claves: "vitamina b12 cobalamina anemia", ejemplo: true, desc: "Nivel de vitamina B12." },
      { id: "lab-26", nombre: "Proteína C reactiva (PCR)", precio: 35, categoria: "Bioquímica", claves: "pcr inflamacion infeccion", ejemplo: true, desc: "Marcador de inflamación o infección." },
      { id: "lab-4", nombre: "Perfil tiroideo (TSH, T3, T4 libre)", precio: 75, categoria: "Hormonas", claves: "tsh t3 t4 tiroides tiroideo", ejemplo: true, x: 71, y: 55, desc: "Evalúa el funcionamiento de la tiroides." },
      { id: "lab-27", nombre: "TSH", precio: 35, categoria: "Hormonas", claves: "tsh tiroides", ejemplo: true, desc: "Hormona estimulante de la tiroides." },
      { id: "lab-28", nombre: "Prueba de embarazo en sangre (β-hCG)", precio: 35, categoria: "Hormonas", claves: "embarazo beta hcg gestacion", ejemplo: true, desc: "Detecta el embarazo en sangre." },
      { id: "lab-29", nombre: "Prolactina", precio: 45, categoria: "Hormonas", claves: "prolactina hormonas", ejemplo: true, desc: "Nivel de prolactina en sangre." },
      { id: "lab-30", nombre: "Insulina basal", precio: 45, categoria: "Hormonas", claves: "insulina resistencia a la insulina azucar", ejemplo: true, desc: "Nivel de insulina en ayunas." },
      { id: "lab-31", nombre: "Cortisol", precio: 50, categoria: "Hormonas", claves: "cortisol estres hormonas", ejemplo: true, desc: "Nivel de cortisol en sangre." },
      { id: "lab-32", nombre: "PSA total", precio: 45, categoria: "Hormonas", claves: "psa prostata antigeno prostatico", ejemplo: true, desc: "Antígeno prostático específico." },
      { id: "lab-33", nombre: "Examen completo de orina", precio: 12, categoria: "Orina y heces", claves: "orina infeccion urinaria", ejemplo: true, desc: "Análisis físico, químico y microscópico de la orina." },
      { id: "lab-34", nombre: "Urocultivo", precio: 35, categoria: "Orina y heces", claves: "orina cultivo infeccion urinaria antibiograma", ejemplo: true, desc: "Cultivo de orina para detectar bacterias." },
      { id: "lab-35", nombre: "Examen parasitológico seriado", precio: 25, categoria: "Orina y heces", claves: "heces parasitos parasitologico", ejemplo: true, desc: "Búsqueda de parásitos en 3 muestras de heces." },
      { id: "lab-36", nombre: "Sangre oculta en heces (Thevenon)", precio: 20, categoria: "Orina y heces", claves: "heces sangre oculta thevenon", ejemplo: true, desc: "Detecta sangre no visible en las heces." },
      { id: "lab-37", nombre: "Coprocultivo", precio: 40, categoria: "Orina y heces", claves: "heces cultivo diarrea", ejemplo: true, desc: "Cultivo de heces para detectar bacterias." },
      { id: "lab-38", nombre: "VIH (ELISA)", precio: 35, categoria: "Inmunología", claves: "vih hiv sida", ejemplo: true, desc: "Prueba de detección de VIH." },
      { id: "lab-39", nombre: "Sífilis (RPR / VDRL)", precio: 15, categoria: "Inmunología", claves: "sifilis rpr vdrl", ejemplo: true, desc: "Prueba de detección de sífilis." },
      { id: "lab-40", nombre: "Hepatitis B (HBsAg)", precio: 35, categoria: "Inmunología", claves: "hepatitis b hbsag higado", ejemplo: true, desc: "Detección del antígeno de hepatitis B." },
      { id: "lab-41", nombre: "Hepatitis C (anti-HCV)", precio: 40, categoria: "Inmunología", claves: "hepatitis c hcv higado", ejemplo: true, desc: "Detección de anticuerpos de hepatitis C." },
      { id: "lab-42", nombre: "Factor reumatoide", precio: 25, categoria: "Inmunología", claves: "artritis reumatoide factor", ejemplo: true, desc: "Ayuda a evaluar artritis reumatoide." },
      { id: "lab-43", nombre: "ASO (antiestreptolisina O)", precio: 25, categoria: "Inmunología", claves: "aso garganta estreptococo", ejemplo: true, desc: "Evalúa infección reciente por estreptococo." },
      { id: "lab-3", nombre: "Perfil lipídico", precio: 45, categoria: "Perfiles", claves: "colesterol hdl ldl trigliceridos grasa lipidos", ejemplo: true, x: 82, y: 15, desc: "Colesterol total, HDL, LDL y triglicéridos." },
      { id: "lab-5", nombre: "Perfil preoperatorio", precio: 120, categoria: "Perfiles", claves: "preoperatorio cirugia operacion riesgo quirurgico coagulacion", ejemplo: true, x: 18, y: 58, desc: "Hemograma, glucosa, perfil de coagulación, grupo sanguíneo y más, según indicación médica." },
      { id: "lab-6", nombre: "Chequeo preventivo", precio: 180, categoria: "Perfiles", claves: "chequeo anual control general preventivo", ejemplo: true, x: 89, y: 50, desc: "Paquete de análisis generales para tu control anual." },
      { id: "lab-44", nombre: "Perfil renal", precio: 45, categoria: "Perfiles", claves: "rinon renal urea creatinina", ejemplo: true, desc: "Urea, creatinina y ácido úrico." },
      { id: "lab-45", nombre: "Perfil prenatal", precio: 150, categoria: "Perfiles", claves: "embarazo gestante prenatal", ejemplo: true, desc: "Análisis recomendados al inicio del embarazo." },
      { id: "lab-7", nombre: "Toma de muestra a domicilio", precio: 30, categoria: "Domicilio", claves: "domicilio casa delivery a domicilio", ejemplo: true, x: 44, y: 45, desc: "Vamos a tu casa en Lima para tomar la muestra. Se suma a tus análisis." }
    ]
  },
  {
    id: "convenciones", nombre: "Centro de Convenciones", letreroCorto: "Centro de Convenciones",
    rubro: "Eventos y ferias en Home Mall", whatsapp: "51948042949",
    tema: { a: "#7a5c2e", b: "#d9bf7a" },
    evento: {
      eyebrow: "Próximamente · 11 al 23 de diciembre de 2026",
      titulo: "Aesthetic Fest",
      subtitulo: "Feria de Estética",
      cinta: "Descuentos exclusivos en cada especialidad",
      fecha: "11 al 23 de diciembre de 2026",
      banner: { x: 50, y: 21, w: 21.2, h: 10 },
      pantallaCentral: { x: 50, y: 56.5, w: 14.5, h: 20 },
      mensajeStand: "Hola, vengo de Home Mall. Quiero un stand en Aesthetic Fest — Feria de Estética.",
      beneficio: {
        titulo: "Evaluación preoperatoria GRATUITA durante el Aesthetic Fest",
        texto: "Trae tu preoperatorio completo, te evaluamos gratis y luego agendas con el médico que quieras.",
        boton: "Reservar mi evaluación gratuita",
        whatsapp: "51948042949",
        mensaje: "Hola, vengo de Home Mall. Quiero reservar mi evaluación preoperatoria gratuita durante el Aesthetic Fest."
      },
      botones: [
        { id: "asistir", texto: "Avisarme / Quiero participar",
          mensaje: "Hola, vengo de Home Mall. Quiero que me avisen / quiero participar en Aesthetic Fest, del 11 al 23 de diciembre de 2026, en el Centro de Convenciones Home Mall. Descuentos exclusivos en cada especialidad, con preoperatorio completo: evaluación preoperatoria gratuita y luego agendas con quien quieras." }
      ]
    },
    salas: [{ id: "salon", nombre: "Salón principal", sub: "Próximamente: Aesthetic Fest, 11–23 dic 2026", img: "assets/img/tiendas/convenciones.jpg" }],
    productos: [
      { id: "st-1", nombre: "Stand disponible", precio: null, stand: true, x: 16, y: 58,
        booth: { x: 16, y: 54, w: 8, h: 22 },
        desc: "Este stand está disponible para exponer en Aesthetic Fest — Feria de Estética." },
      { id: "st-2", nombre: "Stand disponible", precio: null, stand: true, x: 25.5, y: 53,
        booth: { x: 25.8, y: 51, w: 7.4, h: 20 },
        desc: "Este stand está disponible para exponer en Aesthetic Fest — Feria de Estética." },
      { id: "st-roma", nombre: "Dra. Roma Coletti", precio: null, stand: true, standRoma: true,
        x: 36.8, y: 54, fachada: { x: 36.8, y: 50, w: 12.2, h: 30 },
        whatsapp: "51915124360",
        desc: "Stand de la Dra. Roma Coletti, Cirugía Plástica. Pronto podrás ver aquí sus videos.",
        mensaje: "Hola Dra. Roma Coletti, vengo de Home Mall, del stand en Aesthetic Fest." },
      { id: "st-4", nombre: "Stand disponible", precio: null, stand: true, x: 65.5, y: 54,
        booth: { x: 65.2, y: 51, w: 7.4, h: 20 },
        desc: "Este stand está disponible para exponer en Aesthetic Fest — Feria de Estética." },
      { id: "st-5", nombre: "Stand disponible", precio: null, stand: true, x: 74.5, y: 53,
        booth: { x: 74.4, y: 51, w: 7.4, h: 20 },
        desc: "Este stand está disponible para exponer en Aesthetic Fest — Feria de Estética." },
      { id: "st-6", nombre: "Stand disponible", precio: null, stand: true, x: 84, y: 58,
        booth: { x: 84, y: 54, w: 8, h: 22 },
        desc: "Este stand está disponible para exponer en Aesthetic Fest — Feria de Estética." }
    ]
  },
  /* La Tienda de Temporada toma su contenido de CAMPAÑAS (abajo) */
  { id: "temporada", nombre: "Tienda de Temporada", rubro: "Cambia con cada campaña", whatsapp: "51948042949", esTemporada: true }
];

/* ---------------------------- CAMPAÑAS --------------------------------- */
/* fechas "MM-DD" solo se usan si CAMBIO_AUTOMATICO = true */
const CAMPAÑAS = {
  navidad: {
    nombre: "Navidad 360", lema: "Árboles, luces y adornos para tu hogar", fechas: { desde: "11-01", hasta: "12-31" },
    tema: { a: "#8e1b2a", b: "#d4af37" }, letrero: "✦ Navidad 360",
    enConstruccion: true,
    banner: "En construcción",
    aviso: "Las compras estarán disponibles cuando la tienda termine de armarse.",
    vitrina: null, // la foto del pasillo ya muestra la vitrina navideña
    salas: [
      { id: "entrada",      nombre: "Entrada",            sub: "Bienvenida a Navidad 360",        img: "assets/img/temporada/navidad/sala-entrada.jpg" },
      { id: "arboles",      nombre: "Sala de Árboles",    sub: "Encuentra el árbol para tu hogar", img: "assets/img/temporada/navidad/sala-arboles.jpg" },
      { id: "luces",        nombre: "Sala de Luces",      sub: "Calidez que se enciende",          img: "assets/img/temporada/navidad/sala-luces.jpg" },
      { id: "adornos",      nombre: "Sala de Adornos",    sub: "Los detalles que lo cambian todo", img: "assets/img/temporada/navidad/sala-adornos.jpg" },
      { id: "figuras",      nombre: "Figuras Iluminadas", sub: "Magia para tu jardín y terraza",   img: "assets/img/temporada/navidad/sala-figuras.jpg" },
      { id: "complementos", nombre: "Complementos",       sub: "Lo que no puede faltar",           img: "assets/img/temporada/navidad/sala-complementos.jpg" }
    ],
    productos: [
      { id: "nav-1",  nombre: "Árbol Clásico 1.80 m",      precio: 189, sala: "entrada",      x: 52, y: 44, img: "assets/img/temporada/navidad/productos/p1.jpg",  desc: "Árbol artificial clásico de 1.80 m, 650 puntas, PVC + metal. Ideal para espacios medianos." },
      { id: "nav-2",  nombre: "Kit Decoración 40 piezas",  precio: 89,  sala: "entrada",      x: 20, y: 60, img: "assets/img/temporada/navidad/productos/p2.jpg",  desc: "Kit completo con esferas, lazos, estrellas y copos." },
      { id: "nav-3",  nombre: "Árbol Nevado 1.80 m",       precio: 249, sala: "arboles",      x: 30, y: 55, img: "assets/img/temporada/navidad/productos/p3.jpg",  desc: "Árbol con efecto nieve, 700 puntas, look invernal elegante." },
      { id: "nav-4",  nombre: "Árbol Slim 2.10 m",         precio: 219, sala: "arboles",      x: 69, y: 50, img: "assets/img/temporada/navidad/productos/p4.jpg",  desc: "Árbol estrecho ideal para espacios pequeños." },
      { id: "nav-5",  nombre: "Guirnalda LED Cálida 10 m", precio: 39,  sala: "luces",        x: 20, y: 66, img: "assets/img/temporada/navidad/productos/p5.jpg",  desc: "100 luces LED cálidas, 8 funciones, interior y exterior." },
      { id: "nav-6",  nombre: "Cortina de Luces",          precio: 79,  sala: "luces",        x: 68, y: 40, img: "assets/img/temporada/navidad/productos/p6.jpg",  desc: "Cortina LED 2x2 m con efecto cascada." },
      { id: "nav-7",  nombre: "Set Esferas 24 u.",         precio: 49,  sala: "adornos",      x: 52, y: 64, img: "assets/img/temporada/navidad/productos/p7.jpg",  desc: "24 esferas de 6 cm en rojo, dorado y plateado." },
      { id: "nav-8",  nombre: "Lazos y Cintas",            precio: 29,  sala: "adornos",      x: 23, y: 50, img: "assets/img/temporada/navidad/productos/p8.jpg",  desc: "Pack de 5 lazos y cintas de diferentes tamaños." },
      { id: "nav-9",  nombre: "Santa Iluminado 1.20 m",    precio: 189, sala: "figuras",      x: 29, y: 48, img: "assets/img/temporada/navidad/productos/p9.jpg",  desc: "Figura iluminada de Santa de 1.20 m, exterior, 8 funciones." },
      { id: "nav-10", nombre: "Reno Iluminado",            precio: 149, sala: "figuras",      x: 58, y: 50, img: "assets/img/temporada/navidad/productos/p10.jpg", desc: "Reno iluminado de 90 cm, resistente al agua." },
      { id: "nav-11", nombre: "Pie de Árbol",              precio: 45,  sala: "complementos", x: 28, y: 45, img: "assets/img/temporada/navidad/productos/p11.jpg", desc: "Pie metálico resistente para árboles hasta 2.40 m." },
      { id: "nav-12", nombre: "Pasto Nieve 1x1 m",         precio: 35,  sala: "complementos", x: 63, y: 70, img: "assets/img/temporada/navidad/productos/p12.jpg", desc: "Pasto artificial con efecto nieve, lavable." }
    ]
  },
  sanvalentin: {
    nombre: "San Valentín", lema: "Regalos para decir te quiero", fechas: { desde: "01-25", hasta: "02-15" },
    tema: { a: "#b0213f", b: "#f4a7b9" }, letrero: "♥ San Valentín", vitrina: "assets/img/temporada/otras/sanvalentin.jpg",
    salas: [{ id: "regalos", nombre: "Regalos de amor", sub: "Flores, chocolates y detalles", img: "assets/img/temporada/otras/sanvalentin.jpg" }],
    productos: [
      { id: "sv-1", nombre: "Caja de rosas rojas",   precio: 89,  ejemplo: true, x: 15, y: 40, desc: "12 rosas en caja de regalo con lazo." },
      { id: "sv-2", nombre: "Bombones corazón",      precio: 59,  ejemplo: true, x: 47, y: 70, desc: "Caja corazón con 12 bombones." },
      { id: "sv-3", nombre: "Oso de peluche",        precio: 79,  ejemplo: true, x: 61, y: 60, desc: "Oso de 40 cm con corazón." },
      { id: "sv-4", nombre: "Canasta sorpresa",      precio: 149, ejemplo: true, x: 80, y: 42, desc: "Canasta con chocolates, peluche y tarjeta." },
      { id: "sv-5", nombre: "Bouquet de globos",     precio: 25,  ejemplo: true, x: 90, y: 14, desc: "3 globos metalizados." }
    ]
  },
  madre: {
    nombre: "Día de la Madre", lema: "Para la mujer más importante", fechas: { desde: "04-25", hasta: "05-12" },
    tema: { a: "#6b4c8a", b: "#d9c2ec" }, letrero: "❀ Día de la Madre", vitrina: "assets/img/temporada/otras/madre.jpg",
    salas: [{ id: "regalos", nombre: "Regalos para mamá", sub: "Flores, spa y desayunos", img: "assets/img/temporada/otras/madre.jpg" }],
    productos: [
      { id: "dm-1", nombre: "Flores en caja",        precio: 119, ejemplo: true, x: 14, y: 32, desc: "Arreglo floral en caja sombrerera." },
      { id: "dm-2", nombre: "Canasta spa",           precio: 159, ejemplo: true, x: 50, y: 55, desc: "Velas, sales y cremas en canasta de regalo." },
      { id: "dm-3", nombre: "Velas aromáticas",      precio: 35,  ejemplo: true, x: 38, y: 72, desc: "Set de 2 velas de soya." },
      { id: "dm-4", nombre: "Desayuno sorpresa",     precio: 99,  ejemplo: true, x: 84, y: 34, desc: "Bandeja de desayuno con delivery en Lima." },
      { id: "dm-5", nombre: "Joyero",                precio: 69,  ejemplo: true, x: 78, y: 82, desc: "Joyero forrado con espejo." }
    ]
  },
  patrias: {
    nombre: "Fiestas Patrias", lema: "¡Viva el Perú!", fechas: { desde: "07-10", hasta: "07-31" },
    tema: { a: "#c8102e", b: "#ffffff" }, letrero: "🇵🇪 Fiestas Patrias", vitrina: "assets/img/temporada/otras/patrias.jpg",
    salas: [{ id: "patrias", nombre: "Rojo y blanco", sub: "Decora tu casa para el 28", img: "assets/img/temporada/otras/patrias.jpg" }],
    productos: [
      { id: "fp-1", nombre: "Bandera para ventana",  precio: 15, ejemplo: true, x: 12, y: 30, desc: "Bandera de tela con asta." },
      { id: "fp-2", nombre: "Polo rojiblanco",       precio: 35, ejemplo: true, x: 14, y: 70, desc: "Polo de algodón, tallas S–XL." },
      { id: "fp-3", nombre: "Escarapelas x10",       precio: 5,  ejemplo: true, x: 55, y: 66, desc: "Pack de 10 escarapelas." },
      { id: "fp-4", nombre: "Guirnalda de banderines", precio: 19, ejemplo: true, x: 46, y: 15, desc: "Banderines de 3 m." },
      { id: "fp-5", nombre: "Kit fiesta + globos",   precio: 29, ejemplo: true, x: 85, y: 30, desc: "Platos, vasos y globos rojo y blanco." }
    ]
  },
  halloween: {
    nombre: "Halloween", lema: "Dulce o truco", fechas: { desde: "10-10", hasta: "10-31" },
    tema: { a: "#d35400", b: "#6c3483" }, letrero: "🎃 Halloween", vitrina: "assets/img/temporada/otras/halloween.jpg",
    salas: [{ id: "halloween", nombre: "Halloween", sub: "Disfraces y decoración", img: "assets/img/temporada/otras/halloween.jpg" }],
    productos: [
      { id: "hw-1", nombre: "Calabazas LED",         precio: 39, ejemplo: true, x: 18, y: 70, desc: "Calabaza con luz LED, 20 cm." },
      { id: "hw-2", nombre: "Disfraz de brujita",    precio: 79, ejemplo: true, x: 37, y: 50, desc: "Vestido, capa y sombrero. Tallas 4–10." },
      { id: "hw-3", nombre: "Capa de vampiro",       precio: 59, ejemplo: true, x: 57, y: 50, desc: "Capa con forro naranja." },
      { id: "hw-4", nombre: "Balde de dulces",       precio: 19, ejemplo: true, x: 87, y: 26, desc: "Balde calabaza para dulces." },
      { id: "hw-5", nombre: "Luces naranja y morado", precio: 29, ejemplo: true, x: 74, y: 40, desc: "Guirnalda LED de 5 m." }
    ]
  }
};

/* Distritos sugeridos para delivery */
const DISTRITOS = ["Miraflores","San Isidro","Santiago de Surco","San Borja","La Molina","Barranco","Jesús María","Lince","Magdalena del Mar","Pueblo Libre","San Miguel","Surquillo","Chorrillos","Los Olivos","San Martín de Porres","Ate","La Victoria","Cercado de Lima","Callao","Otro"];
