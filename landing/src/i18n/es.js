/**
 * i18n/es.js
 *
 * Spanish dictionary. Mirrors `i18n/en.js` — same keys, same
 * shape, Spanish values. The `useLocale()` hook falls back to
 * the English dictionary when a key is missing on the Spanish
 * side, but a missing key here means the page renders in
 * English in places that should be Spanish. Keep the two
 * files in sync; add a new key to both at the same time.
 *
 * Translation notes:
 *
 *   - "Robust Computer" stays in English everywhere. It's a
 *     brand name, not a translatable term.
 *
 *   - "Field notes" also stays in English. The product is
 *     referenced as a brand label ("Field notes — Issue 001")
 *     throughout the site. Translating the eyebrow / index
 *     title would split the brand identity between locales.
 *
 *   - "News" (the navbar label for /field-notes) translates
 *     to "Notas" — short, fits the same visual slot, and
 *     pairs cleanly with the untranslated "Field notes"
 *     brand reference.
 *
 *   - "Field Notes" appears once as a content title in the
 *     NewsletterBox subscribe widget ("Subscribe to 'Field
 *     Notes' today."). Kept in English for brand consistency.
 *
 *   - Numbers stay as Latin digits everywhere (no
 *     locale-specific separators yet — the form chips
 *     use bare "5k" / "15k" patterns that don't need
 *     thousand separators in either language).
 *
 *   - The 0-for-O rule still applies to Spanish strings
 *     that go through `<Zer0Text>`: Spanish has O letters
 *     ("Hola" → "H0LA"), so the slashed-zero substitution
 *     works the same way it does in English. Don't try to
 *     skip zer0 in Spanish.
 */

// ── Brand ────────────────────────────────────────────────────────────────
export const brand = {
  tagline: '',
}

// ── Hero ─────────────────────────────────────────────────────────────────
export const hero = {
  headline: 'Software a medida, construido para durar.',
  lead: 'Robust Computer es un equipo pequeño de desarrolladores. Diseñamos, construimos y nos quedamos después del lanzamiento, para que lo que entregamos siga funcionando mucho después de la entrega.',
}

// ── Hero chrome ──────────────────────────────────────────────────────────
export const heroChrome = {
  start: 'Iniciar un proyecto',
  team: 'Conoce al equipo',
  buildLog: 'Bitácora',
  shipped: 'Publicado',
  emptyTicket: '$ curl /latest.txt\n> (aún no hay ediciones)',
  releasePrefix: 'Versión',
}

// ── Promises (marquee items) ─────────────────────────────────────────────
export const promisesItems = [
  '4+ años construyendo',
  'equipo pequeño, acceso directo',
  'alcance fijo, precio claro',
  'soporte después del lanzamiento',
  'entrega en la fecha acordada',
  'sin facturas sorpresa',
  'personas reales, no chatbots',
  'tu código sigue siendo tuyo',
  'probado antes de entregarse',
  'demos semanales, no sorpresas',
  'Propiedad total al entregar',
  'Soluciones a medida',
]

// ── Services ────────────────────────────────────────────────────────────
export const services = {
  headline: 'Lo que construimos',
  lead: 'Cada proyecto se diseña en torno al negocio del cliente, no a una plantilla. Pequeño o grande, recibe el mismo cuidado, y se construye para encajar en cómo trabajas realmente.',
  items: [
    {
      span: 7,
      bg: 'ink',
      fg: 'paper',
      icon: 'MonitorSmartphone',
      title: 'Páginas y sitios web',
      body: 'Sitios de marketing rápidos y claros que explican lo que haces y mueven a la acción.',
    },
    {
      span: 5,
      bg: 'gold',
      fg: 'ink',
      icon: 'Code2',
      title: 'Aplicaciones web a medida',
      body: 'Portales, dashboards y herramientas internas moldeadas al modo de trabajar de tu equipo.',
    },
    {
      span: 5,
      bg: 'paper',
      fg: 'ink',
      icon: 'Boxes',
      title: 'Plataformas SaaS',
      body: 'Cuentas, facturación y el producto en sí, construidos para escalar.',
    },
    {
      span: 7,
      bg: 'gold',
      fg: 'ink',
      icon: 'Workflow',
      title: 'Integraciones y APIs',
      body: 'Conecta las herramientas que ya usas para que los datos fluyan sin que nadie los reescriba.',
    },
  ],
}

// ── Steps ───────────────────────────────────────────────────────────────
export const stepsHeadline = 'Cómo se desarrolla un proyecto'
export const stepsLead = 'Cuatro pasos, sin sorpresas. — Siempre sabrás qué está pasando y qué viene después.'

export const steps = [
  {
    title: 'Alcance',
    body: 'Hablamos de los objetivos y acordamos qué se construye, con un precio fijo en una propuesta por escrito.',
  },
  {
    title: 'Diseño',
    body: 'Ves los mockups y la guía de marca antes de que escribamos una sola línea de código.',
  },
  {
    title: 'Construcción',
    body: 'Actualizaciones periódicas y previews funcionando, no una sorpresa al final.',
  },
  {
    title: 'Lanzamiento',
    body: 'Desplegamos, entregamos y nos quedamos para arreglos y nuevas funciones.',
  },
]

// ── Industries ──────────────────────────────────────────────────────────
export const industriesHeadline = 'Construido para múltiples sectores'

export const industries = [
  'Finanzas',
  'Salud',
  'Retail',
  'Hostelería',
  'Educación',
  'Logística',
  'Sin ánimo de lucro',
  'Servicios profesionales',
]

// ── Field Notes ──────────────────────────────────────────────────────────
export const fieldNotes = {
  headline: 'Field notes',
  indexTitle: 'Field notes',
  lead: 'Ediciones cortas — frecuentes — sobre construir software que perdure. Prácticas, sin spam, cancela cuando quieras.',
  contactBox: {
    header: 'Field notes',
    sub: 'Ediciones cortas — frecuentes — sobre construir software que perdure.',
  },
  subscribeBox: {
    header: '¿Aún no estás suscrito?',
    sub: "Suscríbete hoy a 'Field Notes'.",
  },
}

// ── CTABand ─────────────────────────────────────────────────────────────
export const ctaBand = {
  headline: 'Trabaja con el equipo',
  lead: 'Cuéntanos qué estás construyendo y para quién. Responderemos en un día laborable.',
}

// ── Navbar ─────────────────────────────────────────────────────────────
export const navbarMobilePages = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/about', label: 'Equipo' },
]

export const navbarPages = [
  { to: '/', label: 'Inicio', hint: 'Lo que construimos', icon: 'Home' },
  { to: '/contact', label: 'Iniciar un proyecto', hint: 'Hablemos', icon: 'Send' },
  { to: '/about', label: 'Conoce al equipo', hint: 'Sobre nosotros', icon: 'Users' },
  { to: '/field-notes', label: 'Notas', hint: 'Field notes', icon: 'Newspaper' },
]

export const navbarConnects = [
  {
    href: 'https://github.com/robust-computer/web',
    label: 'GitHub',
    hint: 'Ver el código',
    external: true,
    icon: 'Github',
    mainBar: true,
  },
  {
    href: 'mailto:hello@robust.computer',
    label: 'Email',
    hint: 'Escríbenos',
    external: false,
    icon: 'Mail',
  },
  {
    href: '/rss.xml',
    label: 'RSS Feed',
    hint: 'Suscribirse',
    external: false,
    icon: 'Rss',
    mainBar: true,
  },
]

export const navbarSocials = [
  {
    href: 'https://linkedin.com/company/robust-computer',
    label: 'LinkedIn',
    hint: 'Seguir',
    external: true,
    icon: 'Linkedin',
  },
  {
    href: 'https://x.com/Robust_Computer',
    label: 'X',
    hint: 'Seguir',
    external: true,
    icon: 'X',
  },
  {
    href: 'https://www.instagram.com/robust.computer/',
    label: 'Instagram',
    hint: 'Seguir',
    external: true,
    icon: 'Instagram',
  },
  {
    href: 'https://www.facebook.com/profile.php?id=61594902219428',
    label: 'Facebook',
    hint: 'Seguir',
    external: true,
    icon: 'Facebook',
  },
]

// ── Navbar chrome ───────────────────────────────────────────────────────
export const navChrome = {
  menu: {
    title: 'Menú',
    sub: 'Salta a cualquier sitio',
    pagesHeader: 'Páginas',
    connectHeader: 'Contacto',
    elsewhereHeader: 'En otros lugares',
  },
  // Short labels for the two inline main-bar links. The
  // mobile panel reads its labels from `navbarMobilePages`
  // (per-entry) and the site-menu modal reads from
  // `navbarPages` (per-entry) — those two paths don't go
  // through these keys, only the inline main bar does.
  about: 'Equipo',
  news: 'Notas',
  openSiteMenu: 'Abrir el menú del sitio',
  openMenu: 'Abrir menú',
  closeMenu: 'Cerrar menú',
}

// ── Language button chrome ──────────────────────────────────────────────
export const languageChrome = {
  ariaLabel: 'Idioma',
  tooltip: 'Idioma',
  modalAriaLabel: 'Idioma',
  comingSoon: '(próximamente)',
}

// ── Footer ─────────────────────────────────────────────────────────────
export const footerSections = {
  site: [
    { to: '/', label: 'Inicio', icon: 'Home' },
    { to: '/about', label: 'Equipo', icon: 'Users' },
    { to: '/contact', label: 'Contacto', icon: 'Send' },
    { to: '/field-notes', label: 'Notas', icon: 'Newspaper' },
  ],
  connect: [
    { href: 'https://github.com/robust-computer/web', label: 'GitHub', icon: 'Github' },
    { href: 'mailto:hello@robust.computer', label: 'Email', icon: 'Mail' },
  ],
  elsewhere: [
    { href: 'https://linkedin.com/company/robust-computer', label: 'LinkedIn', icon: 'Linkedin' },
    { href: 'https://x.com/Robust_Computer', label: 'X', icon: 'X' },
    { href: 'https://www.instagram.com/robust.computer/', label: 'Instagram', icon: 'Instagram' },
    { href: 'https://www.facebook.com/profile.php?id=61594902219428', label: 'Facebook', icon: 'Facebook' },
  ],
}

export const footerChrome = {
  site: 'Sitio',
  connect: 'Contacto',
  elsewhere: 'En otros lugares',
  privacy: 'Política de privacidad',
  terms: 'Términos del servicio',
  bug: 'Reportar un error',
  tagline: 'Software a medida, construido para durar.',
}

// ── Not Found ───────────────────────────────────────────────────────────
export const notFound = {
  headline: 'Página no encontrada',
  lede: 'Esa página no está aquí. El enlace es antiguo o la URL es incorrecta.',
}

// ── Team (About page) ───────────────────────────────────────────────────
export const developers = [
  {
    name: 'Aeryn',
    role: 'Desarrollador/a full-stack',
    bio: 'Aeryn construye los dos lados de una aplicación: front-ends en React que la gente disfruta usando, y los servicios back-end de los que dependen. Cuatro años de trabajo full-stack en proyectos de cliente de todos los tamaños y sectores.',
    stack: ['JavaScript', 'Python', 'React', 'MongoDB/SQL', 'APIs'],
    avatar: 'iconVarHappy',
    links: {
      portfolio: 'https://grue.vercel.app/',
      github: 'https://github.com/OrkoTheMage',
      linkedin: 'https://www.linkedin.com/in/aeryn-grindle-5730002b5',
    },
  },
  {
    name: 'Marcador',
    role: 'Desarrollador/a front-end',
    bio: 'Bio corta aquí: en qué se enfoca, qué ha entregado, y qué proyectos pueden confiarle. Dos o tres frases son suficientes.',
    stack: ['Añade', 'Su', 'Stack'],
    avatar: 'iconVarPanicked',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
  {
    name: 'Marcador',
    role: 'Desarrollador/a back-end',
    bio: 'Bio corta aquí: en qué se enfoca, qué ha entregado, y qué proyectos pueden confiarle. Dos o tres frases son suficientes.',
    stack: ['Añade', 'Su', 'Stack'],
    avatar: 'iconVarDead',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
  {
    name: 'Marcador',
    role: 'Ingeniero/a de diseño',
    bio: 'Bio corta aquí: en qué se enfoca, qué ha entregado, y qué proyectos pueden confiarle. Dos o tres frases son suficientes.',
    stack: ['Añade', 'Su', 'Stack'],
    avatar: 'iconVarUnamused',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
]

// ── Contact ─────────────────────────────────────────────────────────────
export const contactWhatHappens = [
  'Respondemos en 1-3 días laborables con preguntas.',
  'Una llamada corta para acordar alcance y plazos.',
  'Una propuesta por escrito con precio fijo.',
]

// ── Bug Report ──────────────────────────────────────────────────────────
export const bugReportLead = 'Cuéntanos qué se rompió, qué esperabas, y qué pasó en realidad. El formulario es anónimo — solo los tres campos de reproducción son obligatorios.'

// ── Privacy (section titles only — body paragraphs stay inline as
//     placeholder legal copy until a real lawyer rewrites them) ──
export const privacySections = [
  'Cookies y analítica',
  'Cambios en esta política',
]

// ── Terms (section titles only) ──
export const termsSections = [
  'Propiedad intelectual',
  'Encargos y entregables',
  'Limitación de responsabilidad',
  'Cambios en estos Términos',
]

// ── TopBar ──────────────────────────────────────────────────────────────
export const topBar = {
  nowWith: 'Ahora con —',
  replies: 'Respondemos en 1-3 días laborables',
}

// ── Subscribe widget status ─────────────────────────────────────────────
export const subscribeStatus = {
  sending: 'Enviando…',
  subscribe: 'Suscribirse',
  success: 'Gracias — revisa tu bandeja.',
  already: 'Ya estás en la lista. No hemos enviado otro email.',
  error: 'Algo salió mal. Inténtalo de nuevo en un momento.',
  optional: 'Opcional. Sin spam.',
  latestPrefix: 'Última edición: ',
  latestSuffix: ', leer en línea.',
  latestEmpty: 'Última edición: título de marcador, leer en línea.',
}

// ── Form chrome ─────────────────────────────────────────────────────────
export const fields = {
  email: 'Email',
  emailAddress: 'Dirección de email',
  yourName: 'Tu nombre',
  company: 'Empresa o proyecto',
  message: 'Cuéntanos más',
  whatDoing: '¿Qué estabas haciendo?',
  whatExpected: '¿Qué esperabas?',
  whatHappened: '¿Qué pasó en realidad?',
  browserDevice: 'Navegador + dispositivo',
}

export const placeholders = {
  fullName: 'Nombre completo',
  email: 'tu@empresa.com',
  optional: 'Opcional',
  messageContact: '¿Qué problema debería resolver y quién lo va a usar?',
  stepsRepro: 'Pasos para reproducir — la página, el clic, la entrada.',
  whatExpected: 'Lo que debería haber pasado.',
  whatHappened: 'El comportamiento real — mensajes de error, diseño roto, etc.',
  browserDevice: 'p. ej. Chrome 119 en macOS 14, iPhone 15 Safari',
}

export const projectTypes = [
  { value: 'landing', label: 'Landing page' },
  { value: 'webapp', label: 'Aplicación web' },
  { value: 'saas', label: 'Plataforma SaaS' },
  { value: 'unsure', label: 'Aún no estoy seguro/a' },
]

export const budgets = [
  { value: 'under_5k', label: 'Menos de 5k' },
  { value: '5k_15k', label: 'De 5k a 15k' },
  { value: '15k_50k', label: 'De 15k a 50k' },
  { value: '50k_plus', label: '50k+' },
]

export const contactPage = {
  seoTitle: 'Contacto',
  seoDescription: 'Inicia un proyecto con Robust Computer. Envíanos una consulta directamente a la bandeja del equipo — respondemos en 1–3 días laborables.',
  title: 'Iniciar un proyecto',
  lead: 'Cuéntanos qué estás construyendo. Un mensaje corto es suficiente, haremos las preguntas correctas después. Sea una idea inicial o un plan detallado, responderá un desarrollador.',
  enquiryTitle: 'Consulta de proyecto',
  enquiryLead: 'Envía una consulta automática directamente a la bandeja del equipo.',
  thankTitle: 'Consulta enviada',
  thankBefore: 'Gracias por los detalles — responderemos en 1-3 días laborables desde una persona real en ',
  thankAfter: '.',
  preferEmailTitle: '¿Prefieres email a secas?',
  preferEmailBody: 'Escríbenos directamente y te responderá una persona real.',
  whatNextTitle: 'Qué pasa después',
  whatAreYouBuilding: '¿Qué estás construyendo?',
  roughBudget: 'Presupuesto aproximado',
  sending: 'Enviando…',
  send: 'Enviar consulta',
  errorFallback: 'Algo salió mal. Inténtalo de nuevo.',
}

export const bugReportPage = {
  seoTitle: 'Reportar un error',
  seoDescription: 'Reporta un error — cuéntanos qué se rompió, qué esperabas, y qué pasó en realidad.',
  title: 'Reportar un error',
  sheetTitle: 'Reportar un error',
  sheetLead: 'Anónimo. Solo los tres campos de reproducción son obligatorios.',
  thankTitle: 'Reporte enviado',
  thankBody: 'Gracias — el reporte está en la cola del equipo. Si dejaste un email, te seguimos por ahí.',
  sending: 'Enviando…',
  send: 'Enviar reporte',
}

export const aboutPage = {
  seoTitle: 'Equipo',
  seoDescription: 'Conoce al equipo de Robust Computer — un estudio pequeño en el que trabajas con las personas que escriben el código.',
  title: 'Conoce al equipo',
  lead: 'Robust Computer es un equipo pequeño. Cuando nos contratas, trabajas con las personas que escriben el código. Aquí están y esto es lo que aportan a tu proyecto',
}

export const privacyPage = {
  seoTitle: 'Privacidad',
  seoDescription: 'Política de privacidad de Robust Computer — qué recogemos cuando visitas el sitio, envías una consulta o te suscribes a Field Notes.',
  title: 'Política de privacidad',
  lead: 'Qué recogemos cuando nos contactas, y qué hacemos con ello.',
}

export const termsPage = {
  seoTitle: 'Términos',
  seoDescription: 'Términos del servicio para el sitio de Robust Computer y cualquier trabajo que entreguemos.',
  title: 'Términos del servicio',
  lead: 'Las reglas básicas para usar este sitio y trabajar con nosotros.',
}

export const fieldNotesPage = {
  empty: 'Aún no hay publicaciones — suscríbete y recibirás la primera.',
  published: 'Publicado',
  prev: '‹ Anterior',
  next: 'Siguiente ›',
  previousPageLabel: 'Página anterior',
  nextPageLabel: 'Página siguiente',
  goToPage: (n) => `Ir a la página ${n}`,
}

export const fieldNotePage = {
  eyebrow: 'Field notes',
  back: 'Volver al inicio',
  publishedLabel: 'Publicado',
}

export const notFoundPage = {
  seoTitle: 'No encontrado',
  back: 'Volver al inicio',
}

export const unsubscribePage = {
  seoTitle: 'Darse de baja',
  seoDescription: 'Date de baja de Field Notes — la newsletter de ediciones cortas de Robust Computer.',
  loading: 'Dando de baja…',
  successTitle: 'Estás fuera de la lista',
  successLede: 'ya no recibirá Field Notes. ¿Cambiaste de opinión? Puedes volver a suscribirte cuando quieras desde la página de inicio.',
  errorTitle: 'No pudimos darte de baja',
  errorFallback: 'Algo salió mal de nuestra parte. Inténtalo de nuevo en un momento.',
  brokenTitle: 'Este enlace está roto',
  brokenLede: 'Al enlace de baja le falta la dirección de email. Abre el email más reciente de Field Notes y usa el enlace al final de ese mensaje.',
  back: 'Volver al inicio',
  errorEmailSuffix: (email) => ` Intentando dar de baja ${email}.`,
  defaultError: 'No pudimos darte de baja ahora mismo. Inténtalo de nuevo en un momento.',
}

export const homePage = {
  seoDescription: 'Software a medida, construido para durar. Robust Computer es un equipo pequeño de desarrolladores. Diseñamos, construimos y nos quedamos después del lanzamiento.',
}

export const formErrors = {
  contactFallback: 'No se pudo enviar la consulta. Inténtalo de nuevo.',
  bugFallback: 'No se pudo enviar el reporte. Inténtalo de nuevo.',
  newsletterFallback: 'Algo salió mal. Inténtalo de nuevo.',
}
