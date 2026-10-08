/**
 * i18n/fr.js
 *
 * French dictionary. Mirrors `i18n/en.js` — same keys, same
 * shape, French values. Same fallback behavior as the Spanish
 * dict: a missing key here falls back to the English value via
 * the LocaleContext merge, so a partial dict is safe.
 *
 * Translation notes:
 *
 *   - Formality register is "tu" (informal). The English copy
 *     is informal ("Tell us what you are building.") so
 *     French matches: "Dites-nous ce que vous construisez."
 *     If the audience shifts to formal, every "vous" → "tu"
 *     flip is mechanical; the per-line decisions are
 *     pre-baked here.
 *
 *   - Regional default is fr-FR (France). "Associations" is
 *     used for the non-profit chip rather than "Sans but
 *     lucratif" because that's how French companies actually
 *     refer to the sector in their menus. No Quebec-specific
 *     vocabulary.
 *
 *   - "Robust Computer" / "Field notes" / "News" stay in
 *     English per the same untranslated-by-design contract
 *     documented in i18n/index.js. "News" becomes "Actu" in
 *     the inline main-bar `navChrome.news` slot, matching
 *     the "short brand token" feel of the Spanish "Notas".
 *
 *   - Inclusive forms are used in role labels and bios
 *     ("Développeur·euse", "iel"). The middle-dot form is
 *     the more widely-adopted French convention; "iel" /
 *     "celleux" appear in the most modern style guides but
 *     still trip some readers. If the audience is more
 *     conservative, the role labels can flip to the
 *     masculine-default ("Développeur full-stack") without
 *     touching anything else.
 *
 *   - The 0-for-O rule still applies to French strings
 *     passing through `<Zer0Text>`. French has O letters
 *     ("Logiciel" → "L0GICIEL") so the substitution works
 *     the same as English / Spanish.
 */

import { FIELD_NOTES_LEAD } from '../data/brand.js'

// ── Brand ────────────────────────────────────────────────────────────────
export const brand = {
  tagline: '',
}

// ── Hero ─────────────────────────────────────────────────────────────────
export const hero = {
  headline: 'Logiciel sur mesure, conçu pour durer.',
  lead: 'Robust Computer est une petite équipe de développeurs. Nous concevons, construisons, et restons après le lancement, pour que ce que nous livrons continue de fonctionner bien après la passation.',
}

// ── Hero chrome ──────────────────────────────────────────────────────────
export const heroChrome = {
  start: 'Démarrer un projet',
  team: 'Rencontrez l\'équipe',
  buildLog: 'Carnet de développement',
  shipped: 'Publié',
  emptyTicket: '$ curl /latest.txt\n> (aucun numéro pour l\'instant)',
  releasePrefix: 'Version',
}

// ── Promises (marquee items) ─────────────────────────────────────────────
export const promisesItems = [
  '4+ ans à construire',
  'petite équipe, accès direct',
  'périmètre fixe, prix clair',
  'support après le lancement',
  'livraison à la date convenue',
  'pas de factures surprises',
  'de vraies personnes, pas des chatbots',
  'votre code reste le vôtre',
  'testé avant livraison',
  'démos hebdomadaires, pas de surprises',
  'Propriété totale après livraison',
  'Solutions sur mesure',
]

// ── Services ────────────────────────────────────────────────────────────
export const services = {
  headline: 'Ce que nous construisons',
  lead: 'Chaque projet est conçu autour de l\'activité du client, pas d\'un modèle. Petit ou grand, il reçoit le même soin, et il est construit pour s\'adapter à votre façon réelle de travailler.',
  items: [
    {
      span: 7,
      bg: 'ink',
      fg: 'paper',
      icon: 'MonitorSmartphone',
      title: 'Pages et sites web',
      body: 'Sites marketing rapides et clairs qui expliquent ce que vous faites et incitent à passer à l\'action.',
    },
    {
      span: 5,
      bg: 'gold',
      fg: 'ink',
      icon: 'Code2',
      title: 'Applications web sur mesure',
      body: 'Portails, tableaux de bord et outils internes modelés sur la façon dont votre équipe travaille.',
    },
    {
      span: 5,
      bg: 'paper',
      fg: 'ink',
      icon: 'Boxes',
      title: 'Plateformes SaaS',
      body: 'Comptes, facturation et le produit lui-même, conçus pour évoluer.',
    },
    {
      span: 7,
      bg: 'gold',
      fg: 'ink',
      icon: 'Workflow',
      title: 'Intégrations et APIs',
      body: 'Connectez les outils que vous utilisez déjà pour que les données circulent sans que personne ait à les ressaisir.',
    },
  ],
}

// ── Steps ───────────────────────────────────────────────────────────────
export const stepsHeadline = 'Comment se déroule un projet'
export const stepsLead = 'Quatre étapes, pas de surprises. — Vous saurez toujours où nous en sommes et ce qui vient ensuite.'

export const steps = [
  {
    title: 'Cadrage',
    body: 'Nous discutons des objectifs et nous accordons sur ce qui sera construit, tarifé dans un devis, par écrit.',
  },
  {
    title: 'Design',
    body: 'Vous voyez les maquettes et la charte graphique avant qu\'on écrive la moindre ligne de code.',
  },
  {
    title: 'Construction',
    body: 'Mises à jour régulières et aperçus fonctionnels, pas de surprise à la fin.',
  },
  {
    title: 'Lancement',
    body: 'Nous déployons, transmettons, et restons disponibles pour les corrections et les nouvelles fonctionnalités.',
  },
]

// ── Industries ──────────────────────────────────────────────────────────
export const industriesHeadline = 'Conçu pour tous les secteurs'

export const industries = [
  'Finance',
  'Santé',
  'Commerce',
  'Hôtellerie',
  'Éducation',
  'Logistique',
  'Associations',
  'Services professionnels',
]

// ── Field Notes ──────────────────────────────────────────────────────────
export const fieldNotes = {
  headline: 'Field notes',
  indexTitle: 'Field notes',
  lead: 'Numéros courts — fréquents — sur la création de logiciels durables. Concrets, sans spam, désabonnement en un clic.',
  contactBox: {
    header: 'Field notes',
    sub: 'Numéros courts — fréquents — sur la création de logiciels durables.',
  },
  subscribeBox: {
    header: 'Pas encore abonné·e ?',
    sub: "Abonnez-vous à 'Field Notes' aujourd'hui.",
  },
}

// ── CTABand ─────────────────────────────────────────────────────────────
export const ctaBand = {
  headline: 'Travaillez avec l\'équipe',
  lead: 'Dites-nous ce que vous construisez et pour qui. Nous répondrons sous un jour ouvré.',
}

// ── Navbar ─────────────────────────────────────────────────────────────
export const navbarMobilePages = [
  { to: '/', label: 'Accueil', end: true },
  { to: '/about', label: 'Équipe' },
]

export const navbarPages = [
  { to: '/', label: 'Accueil', hint: 'Ce que nous construisons', icon: 'Home' },
  { to: '/contact', label: 'Démarrer un projet', hint: 'Contactez-nous', icon: 'Send' },
  { to: '/about', label: 'Rencontrez l\'équipe', hint: 'L\'équipe', icon: 'Users' },
  { to: '/field-notes', label: 'Actu', hint: 'Field notes', icon: 'Newspaper' },
]

export const navbarConnects = [
  {
    href: 'https://github.com/robust-computer/web',
    label: 'GitHub',
    hint: 'Voir le code',
    external: true,
    icon: 'Github',
    mainBar: true,
  },
  {
    href: 'mailto:hello@robust.computer',
    label: 'E-mail',
    hint: 'Écrivez-nous',
    external: false,
    icon: 'Mail',
  },
  {
    href: '/rss.xml',
    label: 'Flux RSS',
    hint: 'S\'abonner',
    external: false,
    icon: 'Rss',
    mainBar: true,
  },
]

export const navbarSocials = [
  {
    href: 'https://linkedin.com/company/robust-computer',
    label: 'LinkedIn',
    hint: 'Suivre',
    external: true,
    icon: 'Linkedin',
  },
  {
    href: 'https://x.com/Robust_Computer',
    label: 'X',
    hint: 'Suivre',
    external: true,
    icon: 'X',
  },
  {
    href: 'https://www.instagram.com/robust.computer/',
    label: 'Instagram',
    hint: 'Suivre',
    external: true,
    icon: 'Instagram',
  },
  {
    href: 'https://www.facebook.com/profile.php?id=61594902219428',
    label: 'Facebook',
    hint: 'Suivre',
    external: true,
    icon: 'Facebook',
  },
]

// ── Navbar chrome ───────────────────────────────────────────────────────
export const navChrome = {
  menu: {
    title: 'Menu',
    sub: 'Naviguez librement',
    pagesHeader: 'Pages',
    connectHeader: 'Contact',
    elsewhereHeader: 'Ailleurs',
  },
  // Short labels for the two inline main-bar links. The
  // mobile panel reads its labels from `navbarMobilePages`
  // (per-entry) and the site-menu modal reads from
  // `navbarPages` (per-entry) — those two paths don't go
  // through these keys, only the inline main bar does.
  about: 'Équipe',
  news: 'Actu',
  openSiteMenu: 'Ouvrir le menu du site',
  openMenu: 'Ouvrir le menu',
  closeMenu: 'Fermer le menu',
}

// ── Language button chrome ──────────────────────────────────────────────
export const languageChrome = {
  ariaLabel: 'Langue',
  tooltip: 'Langue',
  modalAriaLabel: 'Langue',
  comingSoon: '(bientôt disponible)',
}

// ── Footer ─────────────────────────────────────────────────────────────
export const footerSections = {
  site: [
    { to: '/', label: 'Accueil', icon: 'Home' },
    { to: '/about', label: 'Équipe', icon: 'Users' },
    { to: '/contact', label: 'Contact', icon: 'Send' },
    { to: '/field-notes', label: 'Actu', icon: 'Newspaper' },
  ],
  connect: [
    { href: 'https://github.com/robust-computer/web', label: 'GitHub', icon: 'Github' },
    { href: 'mailto:hello@robust.computer', label: 'E-mail', icon: 'Mail' },
  ],
  elsewhere: [
    { href: 'https://linkedin.com/company/robust-computer', label: 'LinkedIn', icon: 'Linkedin' },
    { href: 'https://x.com/Robust_Computer', label: 'X', icon: 'X' },
    { href: 'https://www.instagram.com/robust.computer/', label: 'Instagram', icon: 'Instagram' },
    { href: 'https://www.facebook.com/profile.php?id=61594902219428', label: 'Facebook', icon: 'Facebook' },
  ],
}

export const footerChrome = {
  site: 'Site',
  connect: 'Contact',
  elsewhere: 'Ailleurs',
  privacy: 'Politique de confidentialité',
  terms: 'Conditions d\'utilisation',
  bug: 'Signaler un bug',
  tagline: 'Logiciel sur mesure, conçu pour durer.',
}

// ── Not Found ───────────────────────────────────────────────────────────
export const notFound = {
  headline: 'Page introuvable',
  lede: 'Cette page n\'est pas ici. Le lien est ancien ou l\'URL est incorrecte.',
}

// ── Team (About page) ───────────────────────────────────────────────────
export const developers = [
  {
    name: 'Aeryn',
    role: 'Développeur·euse full-stack',
    bio: 'Aeryn construit les deux faces d\'une application : des front-ends en React que les gens apprécient utiliser, et les services back-end sur lesquels ils s\'appuient. Quatre ans de travail full-stack sur des projets clients de toutes tailles et de tous secteurs d\'activité.',
    stack: ['JavaScript', 'Python', 'React', 'MongoDB/SQL', 'APIs'],
    avatar: 'iconVarHappy',
    links: {
      portfolio: 'https://grue.vercel.app/',
      github: 'https://github.com/OrkoTheMage',
      linkedin: 'https://www.linkedin.com/in/aeryn-grindle-5730002b5',
    },
  },
  {
    name: 'Espace réservé',
    role: 'Développeur·euse front-end',
    bio: 'Une courte bio ici : ce sur quoi la personne se concentre, ce qu\'elle a livré, et ce qu\'on peut lui confier en toute confiance. Deux ou trois phrases suffisent.',
    stack: ['Ajoutez', 'Votre', 'Stack'],
    avatar: 'iconVarPanicked',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
  {
    name: 'Espace réservé',
    role: 'Développeur·euse back-end',
    bio: 'Une courte bio ici : ce sur quoi la personne se concentre, ce qu\'elle a livré, et ce qu\'on peut lui confier en toute confiance. Deux ou trois phrases suffisent.',
    stack: ['Ajoutez', 'Votre', 'Stack'],
    avatar: 'iconVarDead',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
  {
    name: 'Espace réservé',
    role: 'Ingénieur·e design',
    bio: 'Une courte bio ici : ce sur quoi la personne se concentre, ce qu\'elle a livré, et ce qu\'on peut lui confier en toute confiance. Deux ou trois phrases suffisent.',
    stack: ['Ajoutez', 'Votre', 'Stack'],
    avatar: 'iconVarUnamused',
    links: { portfolio: '#', github: '#', linkedin: '#' },
  },
]

// ── Contact ─────────────────────────────────────────────────────────────
export const contactWhatHappens = [
  'Nous répondons sous 1 à 3 jours ouvrés avec des questions.',
  'Un court appel pour s\'aligner sur le périmètre et les délais.',
  'Un devis écrit avec un prix fixe.',
]

// ── Bug Report ──────────────────────────────────────────────────────────
export const bugReportLead = 'Dites-nous ce qui s\'est cassé, ce que vous attendiez, et ce qui s\'est réellement passé. Le formulaire est anonyme — seuls les trois champs de reproduction sont obligatoires.'

// ── Privacy (section titles only — body paragraphs stay inline as
//     placeholder legal copy until a real lawyer rewrites them) ──
export const privacySections = [
  'Cookies et analytique',
  'Modifications de cette politique',
]

// ── Terms (section titles only) ──
export const termsSections = [
  'Propriété intellectuelle',
  'Engagements et livrables',
  'Limitation de responsabilité',
  'Modifications de ces Conditions',
]

// ── TopBar ──────────────────────────────────────────────────────────────
export const topBar = {
  nowWith: 'Nouveau : ',
  replies: 'Réponse sous 1 à 3 jours ouvrés',
}

// ── Subscribe widget status ─────────────────────────────────────────────
export const subscribeStatus = {
  sending: 'Envoi…',
  subscribe: 'S\'abonner',
  success: 'Merci — vérifiez votre boîte de réception.',
  already: 'Déjà inscrit·e. Aucun nouvel e-mail envoyé.',
  error: 'Une erreur s\'est produite. Réessayez dans un instant.',
  optional: 'Facultatif. Pas de spam.',
  latestPrefix: 'Dernier numéro : ',
  latestSuffix: ', à lire en ligne.',
  latestEmpty: 'Dernier numéro : titre de l\'espace réservé, à lire en ligne.',
}

// ── Form chrome ─────────────────────────────────────────────────────────
export const fields = {
  email: 'E-mail',
  emailAddress: 'Adresse e-mail',
  yourName: 'Votre nom',
  company: 'Entreprise ou projet',
  message: 'Dites-nous en plus',
  whatDoing: 'Que faisiez-vous ?',
  whatExpected: 'Qu\'attendiez-vous ?',
  whatHappened: 'Que s\'est-il réellement passé ?',
  browserDevice: 'Navigateur + appareil',
}

export const placeholders = {
  fullName: 'Nom complet',
  email: 'vous@entreprise.com',
  optional: 'Facultatif',
  messageContact: 'Quel problème doit-il résoudre, et qui va l\'utiliser ?',
  stepsRepro: 'Étapes pour reproduire — la page, le clic, la saisie.',
  whatExpected: 'Ce qui aurait dû se passer.',
  whatHappened: 'Le comportement réel — messages d\'erreur, mise en page cassée, etc.',
  browserDevice: 'par ex. Chrome 119 sur macOS 14, iPhone 15 Safari',
}

export const projectTypes = [
  { value: 'landing', label: 'Landing page' },
  { value: 'webapp', label: 'Application web' },
  { value: 'saas', label: 'Plateforme SaaS' },
  { value: 'unsure', label: 'Pas encore sûr·e' },
]

export const budgets = [
  { value: 'under_5k', label: 'Moins de 5k' },
  { value: '5k_15k', label: 'De 5k à 15k' },
  { value: '15k_50k', label: 'De 15k à 50k' },
  { value: '50k_plus', label: '50k et plus' },
]

export const contactPage = {
  seoTitle: 'Contact',
  seoDescription: 'Démarrez un projet avec Robust Computer. Envoyez une demande directement à la boîte de réception de l\'équipe — nous répondons sous 1 à 3 jours ouvrés.',
  title: 'Démarrer un projet',
  lead: 'Dites-nous ce que vous construisez. Un court message suffit, nous poserons les bonnes questions ensuite. Que ce soit une idée vague ou un plan détaillé, un développeur vous répondra.',
  enquiryTitle: 'Demande de projet',
  enquiryLead: 'Envoyez une demande directement dans la boîte de réception de l\'équipe.',
  thankTitle: 'Demande envoyée',
  thankBefore: 'Merci pour les détails — nous répondrons sous 1 à 3 jours ouvrés, par une vraie personne, à l\'adresse ',
  thankAfter: '.',
  preferEmailTitle: 'Préférez-vous un simple e-mail ?',
  preferEmailBody: 'Écrivez-nous directement et nous vous répondrons en personne.',
  whatNextTitle: 'La suite',
  whatAreYouBuilding: 'Que construisez-vous ?',
  roughBudget: 'Budget approximatif',
  sending: 'Envoi…',
  send: 'Envoyer la demande',
  errorFallback: 'Une erreur s\'est produite. Veuillez réessayer.',
}

export const bugReportPage = {
  seoTitle: 'Signaler un bug',
  seoDescription: 'Signalez un bug — dites-nous ce qui s\'est cassé, ce que vous attendiez, et ce qui s\'est réellement passé.',
  title: 'Signaler un bug',
  sheetTitle: 'Signaler un bug',
  sheetLead: 'Anonyme. Seuls les trois champs de reproduction sont obligatoires.',
  thankTitle: 'Rapport envoyé',
  thankBody: 'Merci — le rapport est dans la file d\'attente de l\'équipe. Si vous avez laissé un e-mail, nous vous y répondrons.',
  sending: 'Envoi…',
  send: 'Envoyer le rapport',
}

export const aboutPage = {
  seoTitle: 'Équipe',
  seoDescription: 'Découvrez l\'équipe de Robust Computer — un petit studio où vous travaillez avec les personnes qui écrivent le code.',
  title: 'Rencontrez l\'équipe',
  lead: 'Robust Computer est une petite équipe. Quand vous nous embauchez, vous travaillez avec les personnes qui écrivent le code. Voici qui elles sont et ce qu\'elles apportent à votre projet',
}

export const privacyPage = {
  seoTitle: 'Confidentialité',
  seoDescription: 'Politique de confidentialité de Robust Computer — ce que nous collectons quand vous visitez le site, envoyez une demande, ou vous abonnez à Field Notes.',
  title: 'Politique de confidentialité',
  lead: 'Ce que nous collectons quand vous nous contactez, et ce que nous en faisons.',
}

export const termsPage = {
  seoTitle: 'Conditions',
  seoDescription: 'Conditions d\'utilisation du site Robust Computer et de tout travail que nous livrons.',
  title: 'Conditions d\'utilisation',
  lead: 'Les règles de base pour utiliser ce site et travailler avec nous.',
}

export const fieldNotesPage = {
  empty: 'Aucun article pour l\'instant — abonnez-vous et vous recevrez le premier.',
  published: 'Publié',
  prev: '‹ Précédent',
  next: 'Suivant ›',
  previousPageLabel: 'Page précédente',
  nextPageLabel: 'Page suivante',
  goToPage: (n) => `Aller à la page ${n}`,
}

export const fieldNotePage = {
  eyebrow: 'Field notes',
  back: 'Retour à l\'accueil',
  publishedLabel: 'Publié',
}

export const notFoundPage = {
  seoTitle: 'Introuvable',
  back: 'Retour à l\'accueil',
}

export const unsubscribePage = {
  seoTitle: 'Se désabonner',
  seoDescription: 'Désabonnez-vous de Field Notes — la newsletter aux numéros courts de Robust Computer.',
  loading: 'Désabonnement…',
  successTitle: 'Vous n\'êtes plus sur la liste',
  successLede: 'ne recevra plus Field Notes. Vous avez changé d\'avis ? Vous pouvez vous réabonner à tout moment depuis la page d\'accueil.',
  errorTitle: 'Impossible de vous désabonner',
  errorFallback: 'Une erreur s\'est produite de notre côté. Veuillez réessayer dans un instant.',
  brokenTitle: 'Ce lien est cassé',
  brokenLede: 'Le lien de désabonnement ne contient pas d\'adresse e-mail. Ouvrez l\'e-mail Field Notes le plus récent et utilisez le lien en bas de ce message.',
  back: 'Retour à l\'accueil',
  errorEmailSuffix: (email) => ` Tentative de désabonnement de ${email}.`,
  defaultError: 'Impossible de vous désabonner pour le moment. Réessayez dans un instant.',
}

export const homePage = {
  seoDescription: 'Logiciel sur mesure, conçu pour durer. Robust Computer est une petite équipe de développeurs. Nous concevons, construisons, et restons après le lancement.',
}

export const formErrors = {
  contactFallback: 'Impossible d\'envoyer la demande. Veuillez réessayer.',
  bugFallback: 'Impossible d\'envoyer le rapport. Veuillez réessayer.',
  newsletterFallback: 'Une erreur s\'est produite. Veuillez réessayer.',
}
