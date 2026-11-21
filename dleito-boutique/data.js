/* =====================================================================
   D’LEITO BOUTIQUE — DATOS DE LA DEMO
   ---------------------------------------------------------------------
   Este es el ÚNICO archivo que hay que tocar para actualizar la tienda:
   productos, precios, categorías, tarifas y respuestas del asistente.
   (No hay panel administrativo: se edita desde el código.)
   ===================================================================== */

/* Rutas de imágenes. Son las fotografías originales, sin editar. */
const ASSETS = {
  hero: "assets/hero-jorgito.webp",
  logo: "assets/logo-dleito.webp",
  tee: "assets/camiseta-chupalo-vintage.webp",
  mug: "assets/taza-guayaco-xhupalo.webp",
  kids: "assets/conjunto-nino-dude-skater.webp",
};

/* Datos oficiales proporcionados por la boutique. */
const STORE = {
  name: "D’Leito Boutique",
  city: "Guayaquil, Ecuador",
  whatsappDisplay: "+593 99 333 9567",
  whatsappNumber: "593993339567",
  whatsappLink: "https://wa.me/593993339567",
  instagram: "https://www.instagram.com/dleito_boutique/",
  instagramHandle: "@dleito_boutique",
  maps: "https://maps.app.goo.gl/DvKRyKnCKTTZ8LhPA",
  currency: "USD",
};

/* Tarifas de entrega. null = "por cotizar". Todo valor es ILUSTRATIVO. */
const SHIPPING = {
  delivery: { label: "Delivery en Guayaquil", cost: 3.0, note: "Tarifa ilustrativa (ficticia)" },
  pickup: { label: "Retiro en tienda", cost: 0, note: "Pendiente de confirmación comercial" },
  national: { label: "Envío nacional", cost: null, note: "Costo por cotizar" },
  international: { label: "Envío internacional", cost: null, note: "Costo y cobertura por cotizar" },
};

/* Categorías de la navegación y de las tarjetas de portada.
   zoom/pos permiten encuadrar la misma foto sin editar el archivo. */
const CATEGORIES = [
  { id: "hombre", name: "Hombre", img: ASSETS.tee, pos: "50% 50%", zoom: 1, note: "Streetwear y camisetas" },
  { id: "mujer", name: "Mujer", img: ASSETS.tee, pos: "50% 42%", zoom: 1.85, note: "Piezas unisex · más estilos pronto" },
  { id: "ninos", name: "Niños", img: ASSETS.kids, pos: "50% 50%", zoom: 1, note: "Conjuntos con actitud" },
  { id: "accesorios", name: "Accesorios", img: ASSETS.mug, pos: "50% 50%", zoom: 1, note: "Detalles que hablan" },
  { id: "jorgito", name: "Colección Jorgito", img: ASSETS.hero, pos: "73% 30%", zoom: 1, note: "Auténtico estilo guayaco", featured: true },
];

/* Productos reales de la boutique (fotos adjuntas).
   PRECIOS: ficticios hasta tener los valores oficiales.
   Para añadir un producto, copia un bloque y cambia los datos. */
const PRODUCTS = [
  {
    id: "camiseta-chupalo-vintage",
    name: "Camiseta Chupalo Vintage",
    categories: ["jorgito", "hombre", "mujer"],
    brand: "D’Leito",
    img: ASSETS.tee,
    price: 25.0,
    oldPrice: null,
    colors: [{ name: "Negro lavado", hex: "#3b3b3e" }],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: true,
    featured: true,
    desc:
      "Camiseta de acabado lavado con estampado collage de Jorgito el Guayaco y la firma “Chupalo”. Etiqueta D’Leito Boutique en el cuello. Una pieza de colección con identidad guayaca.",
    details: ["Material y composición: pendiente de confirmar", "Tallas referenciales para la demo", "Uso unisex sugerido (por confirmar)"],
  },
  {
    id: "taza-guayaco-xhupalo",
    name: "Taza Guayaco Xhupalo",
    categories: ["accesorios", "jorgito"],
    brand: "Guayaco",
    img: ASSETS.mug,
    price: 12.0,
    oldPrice: 15.0,
    colors: [{ name: "Negro / Azul", hex: "#1d3f9a" }],
    sizes: ["Única"],
    isNew: true,
    featured: true,
    desc:
      "Taza de cerámica con impresión envolvente de Jorgito el Guayaco en tonos azul eléctrico y la frase “Xhupalo”. Ideal para regalo o para tu café de todos los días.",
    details: ["Capacidad: pendiente de confirmar", "Oferta ilustrativa: precios ficticios", "Apta para lavavajillas: por confirmar"],
  },
  {
    id: "conjunto-nino-dude-skater",
    name: "Conjunto Niño Dude Skater",
    categories: ["ninos"],
    brand: "Por confirmar",
    img: ASSETS.kids,
    price: 22.0,
    oldPrice: null,
    colors: [{ name: "Blanco / Negro estampado", hex: "#f1f1ee" }],
    sizes: ["2", "4", "6", "8", "10"],
    isNew: true,
    featured: true,
    desc:
      "Conjunto de camiseta blanca “Dude Skater — Get Soaked” y short negro con estampado tropical de palmeras y avionetas en colores neón. Fresco, divertido y listo para el verano.",
    details: ["Material: pendiente de confirmar", "Tallas infantiles referenciales", "Marca del fabricante: por confirmar"],
  },
];

/* Provincias del Ecuador para envíos nacionales. */
const EC_PROVINCES = [
  "Azuay", "Bolívar", "Cañar", "Carchi", "Chimborazo", "Cotopaxi", "El Oro", "Esmeraldas", "Galápagos", "Guayas",
  "Imbabura", "Loja", "Los Ríos", "Manabí", "Morona Santiago", "Napo", "Orellana", "Pastaza", "Pichincha",
  "Santa Elena", "Santo Domingo de los Tsáchilas", "Sucumbíos", "Tungurahua", "Zamora Chinchipe",
];

/* =====================================================================
   ASISTENTE "PREGÚNTALE A JORGITO"
   Respuestas por reglas (preguntas frecuentes + palabras clave).
   NO es IA generativa. Para conectarlo a una IA en el futuro, ver
   CHAT_CONFIG.endpoint y la función getBotReply() en app.js.
   ===================================================================== */
const CHAT_CONFIG = {
  // URL de TU backend seguro (nunca pongas claves de API en el frontend).
  // Si es null, se usan solo las respuestas locales de abajo.
  endpoint: null,
  welcome:
    "¡Qué fue, mi gente! 😎🔥 Bienvenidos a D’Leito Boutique. Soy el asistente virtual de la tienda. ¿En qué te ayudo hoy?",
  quick: ["¿Dónde queda la tienda?", "¿Qué tallas tienen?", "¿Hacen delivery?", "¿Cómo puedo comprar?", "Métodos de pago"],
};

/* Cada intención: palabras clave (sin tildes, en minúsculas) + respuesta.
   La respuesta puede usar {wa}, {maps}, {ig} y {shop} como enlaces. */
const CHAT_INTENTS = [
  {
    id: "saludo",
    keys: ["hola", "buenas", "que fue", "saludos", "hey", "buenos dias", "buenas tardes", "buenas noches"],
    reply: "¡Qué fue! 🙌 Pregúntame por la ubicación, tallas, delivery, envíos o cómo comprar.",
  },
  {
    id: "ubicacion",
    keys: ["donde", "ubicacion", "direccion", "queda", "local", "mapa", "maps", "llegar", "tienda fisica", "sucursal"],
    reply:
      "📍 Estamos en Guayaquil, Ecuador. Aquí tienes la ubicación oficial: {maps}<br><small>El retiro en tienda está pendiente de confirmación comercial.</small>",
  },
  {
    id: "productos",
    keys: ["que venden", "ropa", "productos", "catalogo", "camiseta", "camisetas", "taza", "coleccion", "venden", "tienen", "prendas"],
    reply:
      "👕 Tenemos moda para Hombre, Mujer, Niños, Accesorios y la exclusiva Colección Jorgito: camisetas, conjuntos infantiles y tazas. Míralo todo aquí: {shop}",
  },
  {
    id: "tallas",
    keys: ["talla", "tallas", "medida", "medidas", "size", "xl", "grande", "pequena"],
    reply:
      "📏 En esta demo: camisetas S a XXL, conjunto infantil tallas 2 a 10 y taza en talla única. Las tallas oficiales están por confirmar; para tu medida exacta escríbenos por {wa}.",
  },
  {
    id: "precios",
    keys: ["precio", "precios", "cuanto", "cuesta", "vale", "valor", "costo"],
    reply:
      "💲 Los precios que ves en la web son <b>ilustrativos</b> (ficticios) mientras se confirman los valores oficiales. Para un precio real consulta por {wa}.",
  },
  {
    id: "delivery",
    keys: ["delivery", "domicilio", "entrega", "a domicilio", "llevan", "mandan", "guayaquil"],
    reply:
      "🛵 Sí, la demo incluye delivery en Guayaquil con tarifa ilustrativa de $3,00 (ficticia). También está la opción de retiro en tienda, pendiente de confirmación.",
  },
  {
    id: "nacional",
    keys: ["otras ciudades", "otra ciudad", "provincia", "nacional", "quito", "cuenca", "manta", "machala", "ambato", "loja", "ecuador"],
    reply:
      "📦 Envíos nacionales: puedes elegir provincia y ciudad en el checkout. El costo es <b>por cotizar</b>; la boutique te lo confirma por {wa}.",
  },
  {
    id: "internacional",
    keys: ["internacional", "otro pais", "exterior", "extranjero", "usa", "estados unidos", "espana", "europa", "fuera del pais"],
    reply:
      "🌎 Envíos internacionales: puedes dejar país, ciudad y dirección en el checkout. Costo y cobertura <b>por cotizar</b>; aún no están confirmados.",
  },
  {
    id: "comprar",
    keys: ["comprar", "compro", "pedido", "ordenar", "carrito", "como compro", "como puedo comprar", "checkout"],
    reply:
      "🛒 Es fácil: 1) elige tu prenda y talla, 2) agrégala al carrito, 3) escoge entrega y método de pago, 4) confirma. En esta demo todo es simulado. Empieza aquí: {shop}",
  },
  {
    id: "pagos",
    keys: ["pago", "pagos", "pagar", "tarjeta", "transferencia", "efectivo", "contra entrega", "metodos", "visa", "mastercard"],
    reply:
      "💳 Métodos de la demo: tarjeta (pago simulado), transferencia (simulada), pago contra entrega (propuesta pendiente de confirmar) y pedido por WhatsApp. No se procesan pagos reales.",
  },
  {
    id: "contacto",
    keys: ["contacto", "contactar", "whatsapp", "telefono", "numero", "celular", "instagram", "redes", "escribir", "llamar"],
    reply: "📲 WhatsApp: {wa}<br>📸 Instagram: {ig}<br>📍 Ubicación: {maps}",
  },
  {
    id: "jorgito",
    keys: ["jorgito", "guayaco", "chupalo", "xhupalo"],
    reply: "😎 ¡La Colección Jorgito es puro estilo guayaco! Camisetas y tazas oficiales de la boutique: {shopJorgito}",
  },
  {
    id: "gracias",
    keys: ["gracias", "chevere", "bacan", "genial", "listo", "ok"],
    reply: "¡De nada, mi pana! 🔥 Aquí estoy para lo que necesites.",
  },
];
