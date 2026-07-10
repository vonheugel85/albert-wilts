# Setup-Blueprint v2.1 — eigenständige Schablone für Web-Projekte

**Version:** v2.1 (Arbeitsprotokoll ergaenzt) — Stand: 2026-06-25
**Zweck:** Diese Datei ist die vollstaendige, in sich geschlossene Schablone fuer eigenstaendige Web-Projekte mit gleichem Tech-Stack. Sie vereint die bewaehrten technischen Patterns mit den Hard-Won-Learnings aus zwei realen Projekten und ist so gebaut, dass ein neues Projekt in **Tagen statt Wochen** und mit **wenigen Prompt-Runden** produktionsreif wird.

> **Lesehinweis:** Technische Patterns (Astro-Setup, Token-System, Nav-Logik, Audit- und Preflight-Suite, Coolify-Deploy, Prompt-Bibliothek) sind die eigentliche Schablone und werden 1:1 uebernommen. Konkrete Marken-Inhalte (Farbnamen, Schriften, Beispiel-Domains) sind **Beispiele**, keine Vorgaben, und werden pro Projekt ueber die Marken-Anker-Vorlage (Sektion 15) ersetzt.

---

## Inhaltsverzeichnis

1. [Tech-Stack-Foundation](#1--tech-stack-foundation)
2. [Hosting und Deploy](#2--hosting-und-deploy)
3. [Datei- und Ordner-Struktur](#3--datei--und-ordner-struktur)
4. [Design-Token-System](#4--design-token-system)
5. [Komponenten-Patterns](#5--komponenten-patterns)
6. [Navigation und Breadcrumb-Logik](#6--navigation-und-breadcrumb-logik)
7. [SEO, Schema.org und Analytics](#7--seo-schemaorg-und-analytics)
8. [Content Collections](#8--content-collections)
9. [Newsletter für statische Seiten](#9--newsletter-für-statische-seiten)
10. [Qualitätssicherung: Responsive-Audit, Preflight, Accessibility](#10--qualitätssicherung-responsive-audit-preflight-accessibility)
11. [Bild- und Feed-Pipeline](#11--bild--und-feed-pipeline)
12. [Tonalität und Schreibzeit-Regeln](#12--tonalität-und-schreibzeit-regeln)
13. [Workflow, Standard-Prompt-Gerüst und Prompt-Bibliothek](#13--workflow-standard-prompt-gerüst-und-prompt-bibliothek)
14. [Compliance und Recht](#14--compliance-und-recht)
15. [Marken-Anker-Vorlage](#15--marken-anker-vorlage)
16. [Setup-Reihenfolge für neue Projekte](#16--setup-reihenfolge-für-neue-projekte)
17. [Definition of Done und Go-Live-Checkliste](#17--definition-of-done-und-go-live-checkliste)
18. [Bekannte Stolperfallen](#18--bekannte-stolperfallen)
19. [Arbeitsprotokoll](#19--arbeitsprotokoll)

---

## 1 — Tech-Stack-Foundation

Statische Multi-Page-Application (MPA) auf Astro, ohne clientseitiges Framework. Interaktivitaet laeuft ueber kleine `is:inline`-IIFE-Scripts, nicht ueber React/Vue/Svelte.

### Exakte Dependencies (`site/package.json`)

```json
{
  "engines": { "node": ">=22.12.0" },
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "preflight": "node scripts/preflight.mjs",
    "test:responsive": "astro build && playwright test tests/responsive-audit",
    "check": "npm run preflight && npm run test:responsive"
  },
  "dependencies": {
    "@astrojs/mdx": "^5.0.3",
    "@tailwindcss/vite": "^4.2.2",
    "astro": "^6.1.8",
    "tailwindcss": "^4.2.2"
  },
  "devDependencies": {
    "@playwright/test": "^1.59.1"
  }
}
```

| Baustein | Version | Begruendung |
|----------|---------|------------|
| **Astro** | `^6.1.8` | Statischer MPA-Generator mit Content-Layer-API (glob-Loader). TypeScript strict. |
| **Tailwind CSS** | `^4.2.2` | v4 mit CSS-basiertem `@theme`-Block, **kein `tailwind.config.js`**. Eingebunden ueber `@tailwindcss/vite`, nicht ueber das Astro-Tailwind-Integration-Paket. |
| **MDX** | `@astrojs/mdx@^5.0.3` | Erlaubt Komponenten in Markdown-Artikeln. |
| **TypeScript** | via `astro/tsconfigs/strict` | Strict-Mode, `include: ["**/*"]`, `exclude: ["dist"]`. |
| **Playwright** | `@playwright/test@^1.59.1` | Test-Framework fuer die Responsive-Audit-Suite. Chromium-only. |

### Icon-Set (Beispiel: FontAwesome Pro 7, self-hosted)

Stylesheets in `src/styles/<icons>/`, Webfonts in `public/fonts/<icons>/webfonts/`, eingebunden per `@import` in `global.css`. Self-Hosting statt CDN aus zwei Gruenden: Performance und DSGVO (keine externen Calls), volle Versionskontrolle.

- **Lizenz:** Pro-Icon-Sets sind kostenpflichtig, Webfont-Dateien **nicht oeffentlich verteilbar**. Bei Repo-Klon/Migration die Lizenz mitdenken.
- **Performance:** Nur die real genutzten Varianten laden. Pro entfernter Variant ca. 30 bis 50 KB CSS plus Webfont gespart.

### Webfonts: immer lokal, nie Google-CDN

Webfonts ueber `@fontsource`-Pakete lokal einbinden, **keine** Google-Fonts-CDN (die uebertraegt Besucher-IPs an Google, DSGVO-Problem). Als `@theme`-Variablen `--font-sans`/`--font-mono` definieren, damit `font-sans`/`font-mono` als Tailwind-Klassen greifen. Bei Migration exakt dieselben Weights uebernehmen, sonst brechen Komponenten, die auf bestimmte Strichstaerken zugreifen.

```bash
npm install @fontsource/<display-font> @fontsource/<body-font>
```

---

## 2 — Hosting und Deploy

### Infrastruktur-Topologie

```
GitHub (privates Repo)
  └─ git push main ──► Webhook ──► Coolify Auto-Deploy
                                     │
Hetzner Cloud CPX32 (x86, Ubuntu 24.04, 4 vCPU / 8 GB RAM / 160 GB NVMe)
  └─ Docker + Coolify (Port 8000)
       └─ Nixpacks-Build ──► npx serve dist (Port 3000)
                                     │
DNS-Provider (nur DNS) ──► A-Record auf Server-IP
  └─ (optional Cloudflare-Proxy) ──► Let's Encrypt ──► https://domain
```

### Bausteine

| Komponente | Wert (Beispiel) | Hinweis |
|------------|-----------------|---------|
| **Server** | Hetzner CPX32 | x86, Ubuntu 24.04. ~17 €/Monat inkl. Backups. |
| **Orchestrator** | Coolify, Port 8000 | Self-hosted PaaS. Admin-Login im Passwortmanager. |
| **Build-Pipeline** | Nixpacks | Base Directory `/site`, Install `npm ci`, Build `npm run build`, Publish `dist`, Port 3000. |
| **Node-Pin** | `NIXPACKS_NODE_VERSION=22` (Env in Coolify) | Muss zur `engines`-Angabe (`>=22.12.0`) passen. |
| **Auto-Deploy** | Coolify-GitHub-App, Push auf `main` | Kein manueller Webhook noetig bei App-Anbindung. |
| **TLS** | Let's Encrypt via Traefik | Bei Verzoegerung `docker restart coolify-proxy`. |
| **Redirect** | `Redirect to non-www.` (HTTP 307) | Vermeidet Duplicate Content. |
| **Backups** | Provider-Snapshots | Retention im Provider-Dashboard, pro Projekt dokumentieren. |

### Pflicht-Override: `site/nixpacks.toml` (MPA-Fix)

Coolifys Nixpacks-Default startet `npx serve -s dist`. Das `-s`-Flag aktiviert **SPA-Fallback**, jeder unbekannte Pfad liefert die Root-`index.html`. Astro ist eine **MPA** mit echten Sub-Verzeichnissen, die so nie erreichbar sind und alle denselben ETag haben.

```toml
[start]
cmd = "npx --yes serve@latest dist -l tcp://0.0.0.0:3000"
```

Ohne `-s`. Diese Datei ist in **jedem** Astro-MPA-Projekt auf Coolify Pflicht.

### Mehrere Projekte auf einem Server

Ein zweites Projekt braucht **keinen** zweiten Server. Auf demselben Server als **eigenes Coolify-Projekt** anlegen (eigene Application, eigene Domain). Spart die zweite Server-Miete, die Trennung lebt in Coolify.

### Webhook-Routen (nicht verwechseln)

| Route | Zweck |
|-------|-------|
| `/webhooks/source/github/events` | GitHub-App-Integration |
| `/webhooks/source/github/events/manual` | Manuelle Per-Repo-Webhooks ohne App |

Falsche Route plus richtiges Secret = **stille Ablehnung** (HTTP 200 + Body `Invalid signature`). Diagnose immer ueber den **Response-Body** in GitHub Recent Deliveries, nicht ueber den Status-Code.

### Setup-Reihenfolge (Hosting)

1. Server provisionieren, Docker + Coolify installieren.
2. GitHub-App `<projekt>-coolify` manuell erstellen und verbinden.
3. Private Key + Webhook-Secret in Coolify hinterlegen, Secret identisch in GitHub.
4. Application anlegen: **Base Directory `/site`**, Nixpacks, Domains, Port 3000.
5. Der Coolify-GitHub-App pro Repo **manuell Zugriff** geben (GitHub Settings, Installations, Configure, Repo hinzufuegen), sonst sieht sie das Repo nicht.
6. `nixpacks.toml` ins Repo committen.
7. DNS-A-Record auf Server-IP.
8. `NIXPACKS_NODE_VERSION=22` als Env setzen.
9. Test-Commit, Auto-Deploy ueber Response-Body verifizieren, `/` und Sub-Pfade auf unterschiedliche ETags pruefen.

---

## 3 — Datei- und Ordner-Struktur

```
<repo-root>/
├── CHANGELOG.md                   # Verlauf, neueste oben (ausserhalb site/)
├── MEMORY.md                      # Persistentes Projekt-Gedaechtnis
├── STRUCTURE.md                   # Ordnerstruktur + Konventionen
├── agency/                        # Strategie + Planung (NICHT deployed)
│   ├── setup-blueprint.md         #   Diese Datei
│   ├── prompts/                   #   Prompt-Bibliothek (Sektion 13)
│   └── <projekt>-projekt-anweisung.md
└── site/                          # ◄── ASTRO-PROJEKT = Coolify Base Directory
    ├── astro.config.mjs
    ├── nixpacks.toml              #   Start-Command-Override (MPA-Fix)
    ├── playwright.config.ts
    ├── package.json
    ├── scripts/preflight.mjs      #   Schreibzeit-Check (Sektion 10)
    ├── public/                    #   Logos, Favicons, OG-Bilder, Fonts
    ├── src/
    │   ├── content.config.ts
    │   ├── styles/global.css      #   @theme-Block, prose, Animationen
    │   ├── layouts/BaseLayout.astro
    │   ├── components/
    │   ├── content/<collection>/  #   Code-Pfad englisch
    │   └── pages/
    │       ├── index.astro
    │       ├── impressum.astro
    │       ├── datenschutz.astro
    │       ├── <keyword-slug>.astro
    │       ├── sitemap.xml.ts
    │       └── <user-pfad>/       #   User-URL deutsch
    └── tests/responsive-audit/responsive-audit.spec.ts
```

**Grundsaetze:**

- **Astro-Projekt liegt in `site/`.** `CHANGELOG.md`, `MEMORY.md`, `STRUCTURE.md`, `agency/` liegen ausserhalb und werden **nicht deployed**.
- **Code-Identifier englisch, nutzersichtbare Pfade deutsch** (z. B. `/wissen/` als URL, `src/content/knowledge/` als Code-Pfad).
- **Landingpages als eigenstaendige Pages** unter `src/pages/<slug>.astro`, nicht als Content Collection.
- **`STRUCTURE.md` ist Single Source of Truth** fuer die Ordnerstruktur.

---

## 4 — Design-Token-System

Tailwind v4 erzeugt aus jedem `@theme`-Token automatisch die passenden Utility-Klassen. Vollstaendiger Block in `src/styles/global.css`.

```css
@import "tailwindcss";
/* + Icon-Stylesheets */

@theme {
  --font-sans: '<Body-Font>', sans-serif;
  --font-display: '<Display-Font>', serif;

  /* Neutrale Tokens (meist projektuebergreifend behalten) */
  --color-ink:     #1D1D1B;   /* Haupttext, dunkle Flaechen */
  --color-muted:   #71706C;   /* Sekundaertext */
  --color-subtle:  #B0AFA9;   /* Meta, Captions, Eyebrows */
  --color-surface: #F7F6F3;   /* helle Flaechen-Toenung */
  --color-border:  #E8E6E1;   /* Trennlinien, Card-Borders */

  /* Marken-Akzentfarben (projektspezifisch ersetzen, Beispiel) */
  --color-primary:         #869723;  /* Primaer-Akzent, theme-color */
  --color-primary-overlay: #6F7E1F;  /* gedeckter Ton fuer Vollflaechen */
  --color-cta:             #F59D21;  /* CTA / Buttons */
  --color-dark:            #665337;  /* dunkle Flaechen, Headlines */

  /* Content-driven Breakpoint */
  --breakpoint-nav: 62rem;          /* = 992px → erzeugt alle nav:*-Varianten */

  /* Fluid Headlines via clamp() */
  --text-headline-xl: clamp(1.875rem, 4vw + 1rem,   3.75rem);  /* H1 */
  --text-headline-lg: clamp(1.5rem,   3vw + 0.75rem, 3rem);    /* H2 */
  --text-headline-md: clamp(1.25rem,  2vw + 0.5rem, 1.875rem); /* H3 */
}
```

### Begruendungen

- **`clamp()`-Headlines statt fester Groessen:** Sanfte Skalierung Mobile zu Desktop ohne harte Breakpoint-Spruenge. Untere Schwelle ist das Lesbarkeits-Minimum, obere identisch zur Desktop-Darstellung. Verhindert Headline-Umbrueche auf 320px und Tablet-Zwischengroessen.
- **`--breakpoint-nav: 62rem` (992px):** Content-driven, nicht geraete-driven. Tailwind v4 erzeugt daraus automatisch alle `nav:*`-Varianten. Loest die haeufigen Tablet-Brueche bei `md:` (768px).
- **`--color-*-overlay`:** Vollflaechige Marken-Farbe (z. B. Mobile-Overlay) wirkt bei voller Saettigung erschlagend. Ein um ca. 15% gedeckterer Ton bleibt markenkonform. Die reine Primaerfarbe bleibt fuer Logo, Akzente, CTA-Schrift unangetastet.

### Dynamische Klassen

Bei dynamisch zusammengesetzten Klassen (`text-${name}`) findet der v4-Scanner die Klasse nicht. **Vorzugsloesung:** Klassen vorab vollstaendig komponieren (`iconClass: 'text-primary'`). Alternative: `@source inline(...)`-Safelist.

### Typografie-Disziplin

Nur Tailwind-v4-Standardklassen oder explizit via `@theme` definierte Variablen. **Keine Custom-Pixel-Werte** im HTML/CSS, Ausnahme nur Logo-Maße. Fehlt eine Groesse, als `@theme`-Variable anlegen, nicht inline ueberschreiben.

---

## 5 — Komponenten-Patterns

Reine Astro-Komponenten mit typisiertem `Props`-Interface. Interaktivitaet via `is:inline`-IIFE-Scripts.

### Konventionen

- **Akzent-Satzzeichen in Kategoriefarbe:** Headlines enden mit farbigem Satzzeichen, `{headline}<span class={`text-${accent}`}>{punctuation}</span>`.
- **`items-center` bei Icon-Text-Kombinationen** (Ausnahme: mehrzeilige Listen mit `items-start`).
- **Dynamische Farbklassen vorab komponieren**, nie `text-${accent}` ohne Safelist.
- **Komponenten beim Bau direkt verwenden oder loeschen**, nicht "auf Vorrat" anlegen (sonst Drift: Komponente existiert, Markup ist inline dupliziert).

### Typisches Inventar

| Datei | Zweck |
|-------|-------|
| `BaseLayout.astro` | Einziges Layout: head, SEO, Schema.org, Consent. |
| `Nav.astro` | Globale Navigation, zweiphasig (Sektion 6). |
| `Footer.astro` | Globaler Footer, zweispaltig. |
| `LandingHero.astro` | Hero fuer Landingpages, `text-headline-xl`, Akzent-Satzzeichen. |
| `KontaktBlock.astro` | Kontakt-CTA-Sektion (dunkel). |
| `FAQBlock.astro` | FAQ-Sektion **plus** FAQPage-JSON-LD aus einer Datenquelle. |
| `ConsentBanner.astro` | DSGVO-Cookie-Consent, `localStorage`, `gtag('consent','update')`. |
| `SectionLabel.astro` | Eyebrow-Label. |

---

## 6 — Navigation und Breadcrumb-Logik

`Nav.astro` ist die einzige zustandsbehaftete Komponente, gesteuert ueber die `breadcrumbs`-Prop:

- **Landing-Modus** (`breadcrumbs` leer) → Anker-Links zu Startseiten-Sektionen.
- **Sub-Page-Modus** (`breadcrumbs` uebergeben) → Breadcrumb-Pfad.

### Custom-Breakpoint als Tablet-Grenze

`--breakpoint-nav: 62rem` (992px). Alle Nav-Klassen nutzen `nav:*` statt `md:*` (`h-20 nav:h-52`, `nav:hidden`, `hidden nav:block`). Hero-Top-Padding synchron: `nav:pt-72`.

### Mobile-Overlay (Vollbild)

- `fixed inset-0 z-[100]`, Vollton-Overlay-Farbe, dunkle Schrift.
- **Steht ausserhalb der `<nav>`**, weil `<nav>` `backdrop-blur` hat, sonst waere das der Containing Block fuer `fixed`.
- JS: Body-Scroll-Lock, Auto-Close bei Klick auf `[data-mobile-nav-link]`, Esc schliesst.

### Sticky-Phase (Cross-Fade)

- Zwei Markup-Bloecke `[data-nav-initial]` (gross) und `[data-nav-sticky]` (kompakt).
- CSS: `#site-nav.is-sticky` blendet um (300ms opacity), Hoehe `13rem` → `4rem`.
- JS toggelt `is-sticky` ab `scrollY > 80px`, RAF-throttled.

### Breadcrumb

Home-Icon (`fa-house`) als fester erster Link, Chevron als Trenner. Startet die Crumb-Liste bereits mit `href === '/'`, wird der erste Crumb durch das Home-Icon **ersetzt** (`slice(1)`). Das `BreadcrumbList`-JSON-LD gehoert in die **Page-Files** (ueber die `jsonLd`-Prop), **nicht** in `Nav.astro`.

---

## 7 — SEO, Schema.org und Analytics

Zentral im `BaseLayout.astro`. Props: `title`, `description?`, `breadcrumbs?`, `ogImage?`, `ogImageAlt?`, `ogType?`, `jsonLd?`.

### Open Graph + Twitter

`og:type` (default `website`), `og:locale` (`de_DE`), `og:site_name`, `og:title`, `og:description`, `og:url` (canonical), `og:image`. **OG-Image als 1200x630** mit width/height/alt. Twitter Card `summary_large_image`. `<link rel="canonical">` aus `Astro.url.pathname`.

### Schema.org

| Typ | Ort | Inhalt |
|-----|-----|--------|
| **Organization** | statisch im BaseLayout | `@id`, name, logo, address, contactPoint, `founder`, `parentOrganization`. |
| **Person** | `/ueber-*` via `jsonLd`-Prop | name, jobTitle, knowsAbout, `worksFor`. |
| **BreadcrumbList** | jeweilige Page via `jsonLd`-Prop | Pfad-Hierarchie. |
| **FAQPage** | ueber `FAQBlock.astro` | `mainEntity[]` aus **einer** Datenquelle, die auch die sichtbare FAQ speist. |
| **LocalBusiness** | bei lokalem Bezug | Adresse, `openingHours`, geo, `areaServed`. Starker Local-SEO-Hebel. |

### Sitemap (Custom-Route)

`src/pages/sitemap.xml.ts`, **kein `@astrojs/sitemap`-Plugin** (zu unflexibel, kein `lastmod` aus Frontmatter). **Pflege-Trigger:** Jede neue Landingpage manuell in die `staticPages`-Liste.

### robots.txt + Favicons + Theme-Color

`public/robots.txt` mit Sitemap-Verweis. Favicon-Set (`favicon.ico/.svg`, `favicon-96x96.png`, `apple-touch-icon.png` 180x180), `site.webmanifest` (Maskable-Icons 192/512, `theme_color` = Marken-Farbe). `<meta name="theme-color">` pro Projekt anpassen. **Favicon-Pfade nach dem Generieren pruefen**, Dateien landen oft im falschen Unterordner.

### Analytics aktivieren (Rezept)

1. Property + Web-Datenstream anlegen, **Mess-ID** kopieren.
2. **Datenverarbeitungsbedingungen (AVV) akzeptieren**, Datenschutz-Kontakt eintragen.
3. **Datenaufbewahrung 14 Monate**, **Google-Signale aus** (datensparsam).
4. Im **ConsentBanner** den Platzhalter durch die echte ID ersetzen und einen etwaigen **Platzhalter-Guard entfernen** (`if (GA_ID === 'G-XXXX...') return;` blockiert sonst dauerhaft). Gating bleibt: Default `denied`, Laden erst nach Zustimmung.
5. **Fallstrick:** GA4 ignoriert `anonymize_ip` (anonymisiert selbst). Harmlos.
6. **Verifizieren:** privates Fenster, vor "Akzeptieren" kein Google-Aufruf im Netzwerk-Tab, danach Besuch in der Echtzeit-Ansicht.

Prompt-Vorlage: `prompts/03-analytics-aktivieren.md` (Sektion 13).

---

## 8 — Content Collections

`src/content.config.ts` mit glob-Loader (Astro 6 Content-Layer-API) und Zod-Schema.

```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const knowledge = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/knowledge' }),
  schema: z.object({
    titel: z.string(),
    kategorie: z.enum(['grundlagen','analyse','performance' /* projektspezifisch */]),
    beschreibung: z.string(),
    lesezeit: z.number(),
    fokus_keyword: z.string(),
    meta_title: z.string().max(60),
    meta_description: z.string().max(155),
    veröffentlicht: z.date(),
    aktualisiert: z.date().optional(),
    verwandte: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    autor: z.string().default('<default-autor>'),
    entwurf: z.boolean().default(false),
  }),
});

export const collections = { knowledge };
```

**Konventionen:** Astro 6 nutzt `src/content.config.ts` (nicht `src/content/config.ts`) mit glob-Loader. Dynamische Route `[slug].astro`: `render(eintrag)` statt `eintrag.render()`, `eintrag.id` statt `eintrag.slug`. `meta_title`/`meta_description` Zod-validiert auf 60/155 Zeichen (SEO-Limits hart erzwungen). Entwuerfe (`entwurf: true`) aus Sitemap und Listen filtern (`!data.entwurf`).

---

## 9 — Newsletter für statische Seiten

Eine statische Seite kann **kein eigenes Double-Opt-in** abwickeln (keine Datenbank, kein Server-Endpunkt). Der saubere Weg ist ein gehosteter Dienst, der DOI mitbringt.

- **Privacy-First: link-out statt embed.** Der Einbettcode vieler Dienste laedt Google reCAPTCHA und jQuery von googleapis, und auf Free-/Lite-Tiers laesst sich reCAPTCHA oft nicht entfernen. Ein gestylter Button auf das **gehostete** Formular haelt die eigene Seite frei von Drittanbieter-Skripten. DOI deckt Spam ohnehin ab.
- **AVV pro Dienstleister** abschliessen, sonst stimmt die Aussage im Datenschutz nicht.
- **Datenschutz-Abschnitt** Pflicht (Anbieter, gehostetes Formular, Serverstandort, DOI + Protokollierung, Rechtsgrundlage Art. 6 Abs. 1 lit. a DSGVO, Widerruf, Sperrliste Art. 6 Abs. 1 lit. f, Link).

Prompt-Vorlage: `prompts/04-newsletter-anbinden.md` (Sektion 13).

---

## 10 — Qualitätssicherung: Responsive-Audit, Preflight, Accessibility

Drei Ebenen fangen Fehler **lokal** ab, bevor sie eine Review-Runde kosten.

### Preflight-Selbstcheck (`scripts/preflight.mjs`)

Faengt die haeufigsten Schreibzeit-Fehler ab: ASCII-Umschrift statt echter Umlaute, Em-Dashes, uebrige Platzhalter. Node 22, ESM, ohne externe Dependencies.

```js
// scripts/preflight.mjs
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOT = 'src';
const EXTENSIONS = new Set(['.astro', '.ts', '.tsx', '.js', '.mjs', '.md', '.mdx']);

// Denylist bekannter Umschriften (erweiterbar). Bewusst KEINE breite
// ae/oe/ue-Regex, sonst zu viele False-Positives (neue, Steuer, Wasser ...).
const TRANSLITERATIONS = [
  'ueber', 'fuer', 'koenn', 'moegl', 'loesch', 'oeffn', 'schliess',
  'naechst', 'spaet', 'guenstig', 'waehr', 'gemaess', 'maessig',
  'zusaetz', 'gewaehr', 'behoerde', 'grundsaetz', 'datenuebertrag',
  'strasse', 'fuehl', 'tuer', 'beitraege', 'bestaetig',
  'einschraenk', 'vervielfaelt', 'europaeisch', 'verstoess'
];

// Token-Namen, die "Umschrift"-Fragmente legitim enthalten (pro Projekt pflegen).
const ALLOWLIST = ['text-gruen', 'bg-gruen', 'border-gruen', '--color-gruen'];

const EM_DASH = /\u2014/;
const PLACEHOLDERS = [
  /G-XXXX+/, /\bTODO\b/, /\bFIXME\b/, /lorem ipsum/i,
  /PLATZHALTER/i, /example\.com/
];

const findings = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) { walk(full); continue; }
    if (EXTENSIONS.has(extname(full))) scan(full);
  }
}

function scan(file) {
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const n = i + 1;
    let work = line;
    for (const allowed of ALLOWLIST) work = work.split(allowed).join('');

    for (const t of TRANSLITERATIONS) {
      if (work.toLowerCase().includes(t)) {
        findings.push(`${file}:${n}  ASCII-Umschrift "${t}"  ->  ${line.trim()}`);
        break;
      }
    }
    if (EM_DASH.test(line)) findings.push(`${file}:${n}  Em-Dash  ->  ${line.trim()}`);
    for (const p of PLACEHOLDERS) {
      if (p.test(line)) { findings.push(`${file}:${n}  Platzhalter ${p}  ->  ${line.trim()}`); break; }
    }
  });
}

walk(ROOT);

if (findings.length) {
  console.error(`\nPreflight: ${findings.length} Treffer\n`);
  for (const f of findings) console.error('  ' + f);
  console.error('\nBitte vor dem Commit beheben.\n');
  process.exit(1);
}
console.log('Preflight: sauber, keine Treffer.');
```

Copilot laeuft `npm run preflight` am Ende **jeder** Aufgabe und meldet das Ergebnis. Die FAQ-/JSON-LD-Konsistenz prueft man nicht per Skript, sondern **strukturell** (eine Datenquelle fuer sichtbare FAQ und JSON-LD).

### Responsive-Audit-Suite (Playwright)

Iteriert pixelweise ueber Viewports und sammelt Layout-Brueche zu einem Markdown-Report.

- Chromium-only, `workers: 1`, eigener Preview-Webserver auf **Port 4322** (vermeidet Konflikt mit dev auf 4321).
- **Pages × Viewports** (320 bis 1400px in 5px-Schritten). Pro Viewport doppeltes `requestAnimationFrame`.
- Checks: **A** nav-overlap (critical), **B** overflow (critical, Toleranz 5px), **C** headline-wrap (warning), **E** icon-align (warning, nur Container mit `align-items:center`).
- **Content-Root-Selektor:** `document.querySelector('main') ?? document.body`, plus `closest('nav, header, [data-nav-sticky], [data-nav-initial]')` ausschliessen (BaseLayout hat kein `<main>`).
- Ziel: 0 critical und 0 icon-align. Sehr schmale Viewports (320 bis 435px) sind oft tolerierbar.

### Accessibility-Baseline (pro Seite)

- Aussagekraeftige `alt`-Texte fuer inhaltliche Bilder, leere `alt=""` fuer dekorative.
- `aria-label` an icon-only-Buttons (Slider, Lightbox, Menue), sprachlich gepflegt mit echten Umlauten (Screenreader lesen sie vor).
- Sichtbare Fokuszustaende (Tastatur-Navigation).
- Kontrast der Markenpalette gegen Hintergruende pruefen (WCAG AA), besonders helle Akzente auf Weiss.

---

## 11 — Bild- und Feed-Pipeline

Nur relevant bei externem Feed oder Galerie.

- **Remote-Bilder (z. B. Instagram-Feeds):** brauchen `inferSize={true}` am `<Image>`, sonst Build-Fehler `MissingImageDimension`.
- **Video aus Feeds:** viele Dienste rehosten Video nicht. Video-Kacheln **verlinken** nach aussen statt inline abzuspielen, als Vorschau ein Standbild (Media-Fragment `#t=0.1`, `preload="metadata"`).
- **Chromium-Paint-Bug:** CSS-Multicol (`columns-3`) plus Hover-Transform kann Kacheln erst beim Hover zeichnen. Fix: `.paint-layer`-Klasse (`transform: translateZ(0); backface-visibility: hidden;`) erzwingt eine eigene Compositing-Ebene. Fallback: Multicol durch CSS-Grid ersetzen.
- **Feed-Refresh:** taeglicher Coolify-Rebuild, damit der Build-time-Import frische Inhalte zieht.

---

## 12 — Tonalität und Schreibzeit-Regeln

Die folgenden **Mechaniken** sind uebertragbar, die **Marken-Inhalte** pro Projekt ersetzen.

### Schreibzeit-Regeln (verhindern jeweils eine Korrektur-Runde)

| Regel | Warum |
|-------|-------|
| **Immer echte Umlaute (ä, ö, ü, ß) von Anfang an**, auch in Kommentaren. Nie ASCII-Umschrift. | Nachtraegliche Korrektur geht nur per Hand und oft ueber viele Dateien. |
| **Keine Em-Dashes (—).** | Schleicht sich in KI-Texte ein, faellt erst im Lesen auf. |
| **wir/ich pro Projekt einmal fixieren** und durchhalten. | Gemischte Ansprache erzeugt Korrektur-Sweeps. |
| **Rechtsform exakt** in Impressum, Datenschutz und Organization-JSON-LD. | Falsche Entitaet zieht sich durch mehrere Dateien. |
| **Strukturierte Daten spiegeln sichtbaren Inhalt.** | JSON-LD-Drift ist ein Rich-Result-Fehler und ein zweiter Edit. |
| **Keine Platzhalter im Commit.** | Platzhalter im Build = Rebuild plus Re-Deploy spaeter. |

**Umlaut-Falle:** Korrektur **niemals per Suchen-und-Ersetzen**. ae/oe/ue/ss kommen auch in korrekten Woertern vor (neue, Steuer, Wasser, dass, muss). Block fuer Block per Hand, ß nach langem Vokal/Diphthong, ss nach kurzem Vokal.

### Sprach-Disziplin

- **„anscheinend" statt „scheinbar"** (Bedeutungsunterschied).
- Bullets kurz und parallel, keine Mini-Absaetze als Bullets.
- Pull-Quotes als `blockquote` mit Akzent-Border-Left.
- **wir/ich-Konvention:** Solo-Selbststaendiger → „ich"; Marke/Team → „wir". Idiome bleiben („Lass uns reden"). Self-Check vor Live-Gang: Regex `\b(wir|uns|unser)\b`, nur Whitelist-Treffer bleiben.

### Blacklist (Agentur-/Startup-Jargon)

`Onboarding`, `Roadmap`, `Stakeholder`, `Use Case`, `Pain Point`, `skalieren`, `disruptiv`, `Deep Dive`, `Quick Win`, `Game Changer`, `Solution`, `Framework`, `End-to-End`. Stattdessen Alltagsdeutsch („wachsen" statt „skalieren").

---

## 13 — Workflow, Standard-Prompt-Gerüst und Prompt-Bibliothek

### Workflow-Konventionen

- **Patches gehen ueber Copilot-Prompts** mit praziser Spezifikation und Stop-Bedingung.
- **Lese-Pflicht vor jeder Aenderung:** Dateien erst lesen, dann aendern.
- **Stopp-Disziplin:** kein Auto-Commit, kein Auto-Push. Der Agent stoppt nach dem Bericht.
- **CHANGELOG oben drauf** nach jedem abgeschlossenen Schritt. Neueste oben, keine Code-Diffs, keine Secrets.
- **`npm run check` vor jedem Push** (Preflight + Responsive-Audit).
- **Push-Pattern** (Token-Env entfernen, damit der Credential-Helper greift):
  ```bash
  env -u GITHUB_TOKEN -u GITHUB_USER git push origin main
  ```
- **Stehende Constraints** als Copilot-Projektregeln hinterlegen, dann nicht in jedem Prompt wiederholen.

### Standard-Prompt-Geruest

Jeder Prompt folgt diesem Geruest, damit er first-time-right landet. Die Bibliothek instanziiert es nur noch.

```
<Ziel in einem Satz.>

1. LESEN ZUERST: <Datei(en)> vollstaendig lesen, bevor etwas geaendert wird.
2. AENDERN: <praezise Aufgabe>. Bei Klassen-Fixes: erst ALLE betroffenen
   Stellen benennen, ohne zu aendern, dann in einem Zug fixen.
3. NICHT ANFASSEN: <Code, Klassen, URLs, Eigennamen, fremde Dateien>.

Randbedingungen:
- Echte Umlaute (ä, ö, ü, ß), keine Em-Dashes.
- Variablennamen Englisch, Kommentare Deutsch.
- Nur die genannten Dateien aendern, sonst nichts.
- Kein Commit, kein Push. Stopp nach dem Bericht.

Verifizieren:
- npm run preflight sauber.
- npm run build im Ordner site sauber.
- <projektspezifischer Grep-Beweis im dist/>.

Bericht: geaenderte Dateien, kurzer Auszug, Preflight- und Build-Ergebnis.
```

### Prompt-Bibliothek (`agency/prompts/`)

Wiederkehrende Aufgaben als parametrisierte Vorlagen (Platzhalter in `{{...}}`). Als einzelne Dateien ablegen. Die zwei groessten Runden-Sparer der ganzen Schablone.

**`prompts/01-neue-landingpage.md`**

```
Lege eine neue Landingpage an: site/src/pages/{{slug}}.astro
1. LESEN ZUERST: eine bestehende Landingpage als Vorbild, BaseLayout (Props),
   Nav (breadcrumbs-Prop), LandingHero.
2. AENDERN: neue Page nach dem Muster. Eyebrow {{eyebrow}}, Headline {{headline}}
   (Akzent in {{accentColor}}), Lead {{lead}}, Sektionen {{sektionen}}.
   breadcrumbs-Prop + BreadcrumbList-JSON-LD via jsonLd-Prop (NICHT in Nav).
3. Neue Page in sitemap.xml.ts in staticPages eintragen.
Randbedingungen + Verifizieren + Bericht: Standard-Geruest.
Zusaetzlich: /{{slug}}/ liefert eigenen ETag (kein SPA-Bug).
```

**`prompts/02-faq-eintrag.md`**

```
Fuege der FAQ auf {{seite}} eine Frage hinzu, synchron im JSON-LD.
1. LESEN ZUERST: FAQ-Sektion und FAQPage-JSON-LD (Array oder getrennt?).
2. AENDERN: Frage {{frage}}, Antwort (Ton/Laenge wie bestehende) {{antwort}}.
   Array → ein Eintrag. Getrennt → in sichtbarer FAQ UND JSON-LD, gleicher
   Antwort-Wortlaut. Platzierung {{position}}.
Randbedingungen + Verifizieren + Bericht: Standard-Geruest.
Zusaetzlich: Frage steht im dist/ sichtbar UND im FAQPage-JSON-LD.
```

**`prompts/03-analytics-aktivieren.md`**

```
Setze die echte GA4-Mess-ID in den einwilligungs-gesteuerten ConsentBanner und
ergaenze den Datenschutz. WICHTIG: nur nach Einwilligung laden, kein ungegateter
Snippet.
1. LESEN ZUERST: ConsentBanner vollstaendig, Gating im Bericht beschreiben.
2. AENDERN ConsentBanner: Platzhalter durch {{measurement_id}}. Etwaigen
   Platzhalter-Guard entfernen (blockiert sonst dauerhaft). Mechanik sonst gleich.
   Keine Lade-Logik vorhanden → stoppen und melden.
3. AENDERN datenschutz.astro: GA4-Abschnitt (Google Ireland Ltd., Consent-Pflicht,
   IP nur kurz/nicht gespeichert, Art. 6 Abs. 1 lit. a DSGVO + § 25 Abs. 1 TDDDG,
   US-Transfer + Restrisiko, AVV, 14 Monate, Link policies.google.com/privacy).
Hinweis: GA4 ignoriert anonymize_ip, schadet nicht.
Randbedingungen + Verifizieren + Bericht: Standard-Geruest.
```

**`prompts/04-newsletter-anbinden.md`**

```
Binde den Newsletter ueber einen Button-Link auf das gehostete Formular von
{{dienst}} an (nicht einbetten), und ergaenze den Datenschutz.
1. LESEN ZUERST: Newsletter-Bereich und Datenschutz-Platzhalter.
2. AENDERN Hero: nicht funktionierendes Formular entfernen, ersetzen durch
   <a href="{{formular_url}}" target="_blank" rel="noopener noreferrer"
   class="{{primary_button_klasse}}">{{button_label}}</a> plus dezente Zeile
   mit Link auf /datenschutz.
3. AENDERN datenschutz.astro: Abschnitt zu {{dienst}} (Anbieter {{anbieter}},
   gehostetes Formular, Double-Opt-in + Protokollierung, Art. 6 Abs. 1 lit. a
   DSGVO, Widerruf, Sperrliste Art. 6 Abs. 1 lit. f, AVV, Link).
Randbedingungen + Verifizieren + Bericht: Standard-Geruest.
Zusaetzlich: kein Eingabefeld mehr im Hero, Button auf {{dienst}}.
```

**`prompts/05-schreibweisen-sweep.md`**

```
Korrigiere ASCII-Umschrift auf echte Umlaute und ß. NUR Schreibweise.
1. LESEN ZUERST: {{dateien}} vollstaendig.
2. ZUERST FINDEN: alle betroffenen Stellen listen, ohne zu aendern.
3. DANN FIXEN: in einem Zug. KEIN Suchen-Ersetzen (neue, Steuer, Wasser, dass
   bleiben). Block fuer Block, ß nach langem Vokal/Diphthong, ss nach kurzem.
4. NICHT ANFASSEN: Variablennamen, CSS-Klassen, URLs, Eigennamen, Code.
Randbedingungen + Verifizieren + Bericht: Standard-Geruest.
Zusaetzlich: npm run preflight danach 0 Treffer.
```

**`prompts/06-commit-push.md`**

```
Committe und pushe.
1. "git status" und "git log --oneline -6". Erwartet: {{dateien}}. Fremde Dateien
   → stopp und melden.
2. CHANGELOG.md (falls vorhanden): Eintrag oben, heutiges Datum, Zusammenfassung.
3. Stage Quelldateien (und ggf. CHANGELOG). Kein dist/, keine report.md.
4. Commit-Nachricht: {{nachricht}}
5. Push: env -u GITHUB_TOKEN -u GITHUB_USER git push origin main
Bericht: status vorher, committete Dateien, Commit-Hash, Push-Ergebnis.
```

**`prompts/07-legal-abschnitt.md`**

```
Ergaenze einen Drittanbieter-Abschnitt in der Datenschutzerklaerung.
1. LESEN ZUERST: datenschutz.astro, Gliederung und Ton (neutral, sachlich).
2. AENDERN: Abschnitt zu {{dienst}} (Anbieter {{anbieter}}, Zweck {{zweck}},
   Daten {{daten}}, Rechtsgrundlage {{rechtsgrundlage}}, Transfer {{transfer}},
   AVV-Hinweis, Link {{datenschutz_link}}). Existiert ein Abschnitt: erweitern,
   nicht duplizieren.
Randbedingungen + Verifizieren + Bericht: Standard-Geruest.
Hinweis: Legal-Text ist Entwurf, Profi-Pruefung vor Launch.
```

---

## 14 — Compliance und Recht

Wiederkehrt in jedem Projekt. Einmal abarbeiten, statt jedes Mal zusammenzusuchen.

- [ ] Rechtsform in Impressum, Datenschutz und Organization-JSON-LD identisch und korrekt.
- [ ] AVV mit **jedem** Auftragsverarbeiter (Analytics, Newsletter, Maps, ggf. Hosting).
- [ ] Rechtsgrundlagen korrekt (z. B. Art. 6 Abs. 1 lit. a DSGVO, § 25 Abs. 1 TDDDG).
- [ ] Drittland-/US-Transfer mit Restrisiko-Formulierung, wo zutreffend (DPF + SCC).
- [ ] Consent-Banner: Ablehnen so einfach wie Akzeptieren, Default `denied`, vor jedem Drittanbieter-Laden.
- [ ] Cookie-Widerruf erreichbar (Footer „Cookie-Einstellungen").
- [ ] **Profi-Rechtspruefung von Impressum und Datenschutz vor Go-Live.** Die Entwuerfe sind solide, aber kein Ersatz fuer juristische Pruefung.

---

## 15 — Marken-Anker-Vorlage

Diesen Block kopieren und ausfuellen, daraus entsteht die `<projekt>-projekt-anweisung.md`. So steht die projektspezifische Anweisung in Minuten.

```
## Marken-Anker {{projekt}}
- Domain: {{domain}}
- Betreiber / Rechtsform (exakt): {{entitaet}}
- Registeradresse: {{adresse}}
- Kontakt: {{telefon}} | {{email}} | USt-IdNr {{ustid}}
- Verantwortlich i. S. d. MStV: {{verantwortlicher}}

- Marken-Farben (global.css):
  --color-primary {{hex}}  (Primaer-Akzent, theme-color)
  --color-cta     {{hex}}  (CTA)
  --color-dark    {{hex}}  (dunkle Flaechen, Headlines)
  --color-surface {{hex}}  (helle Flaeche)
- theme-color: {{hex_primary}}
- Schriften: {{display_font}} (Headlines), {{body_font}} (Fliesstext),
  lokal via @fontsource, keine Google-CDN.

- Marken-Name-Schreibweise: {{regel}}
- Claim (exakt): {{claim}}
- Kurzer Markenclaim: {{kurzclaim}}
- Seiten: {{seitenliste}}

- Tonalitaet: {{du oder neutral je Kontext}}, {{stilworte}}.
- Verbotene Formulierungen (Brand-Schutz): {{verbote}}

## Was NICHT aus der Schablone uebernommen wird
- {{abweichungen}}
```

---

## 16 — Setup-Reihenfolge für neue Projekte

1. **GitHub-Repo** anlegen (privat).
2. **Astro-Projekt initialisieren** (Astro `^6.1.8`, Template `minimal`), in `site/` ablegen.
3. **Dependencies + Scripts** aus Sektion 1 uebernehmen (inkl. `preflight`, `test:responsive`, `check`).
4. **`global.css` mit Theme-Tokens** kopieren, Akzentfarben pro Projekt austauschen, neutrale Tokens behalten. `clamp()`-Headlines + `--breakpoint-nav` uebernehmen.
5. **BaseLayout, Nav, Footer** uebernehmen, Marken-Anker austauschen (Logo, Organization-JSON-LD, Kontakt, theme-color, Default-Description).
6. **Webfonts via `@fontsource`** lokal einbinden (keine Google-CDN).
7. **`scripts/preflight.mjs`** ablegen, Denylist/Allowlist pro Projekt pflegen.
8. **`content.config.ts`** uebernehmen, falls Knowledge-Sektion gewuenscht.
9. **Playwright-Audit-Suite** uebernehmen (Port 4322, `PAGES`-Array anpassen).
10. **Coolify-Service** anlegen (Base Directory `/site`), GitHub-App pro Repo freigeben, `nixpacks.toml` committen.
11. **Domain mit Let's Encrypt** verbinden (A-Record auf Server-IP), bei Haenger `docker restart coolify-proxy`.
12. **`NIXPACKS_NODE_VERSION=22`** als Env setzen.
13. **Erstes Deployment** testen, Auto-Deploy ueber Response-Body verifizieren, Sub-Pfade auf eigene ETags pruefen.
14. **`agency/prompts/`** anlegen, **Marken-Anker-Vorlage** ausfuellen, `CHANGELOG.md`/`MEMORY.md`/`STRUCTURE.md` initialisieren.

---

## 17 — Definition of Done und Go-Live-Checkliste

**Definition of Done pro Seite** (alles in einem Durchgang, nicht nachgereicht):

- [ ] Inhalt vollstaendig, Ton korrekt (du/neutral je Kontext)
- [ ] Echte Umlaute, keine Em-Dashes, `npm run preflight` sauber
- [ ] Responsive-Audit 0 critical
- [ ] Accessibility-Baseline erfuellt
- [ ] Schema.org/JSON-LD vorhanden und mit sichtbarem Inhalt konsistent
- [ ] Keine Platzhalter

**Go-Live-Checkliste** (sammelt alle Last-Minute-Punkte):

- [ ] Echte Analytics-Mess-ID statt Platzhalter, Guard entfernt
- [ ] Alle Platzhalter raus (Grep im dist/)
- [ ] AVVs abgeschlossen (alle Dienstleister)
- [ ] Profi-Rechtspruefung Impressum + Datenschutz erledigt
- [ ] OG-Bild, Favicon-Set, 404-Seite, robots.txt, sitemap.xml
- [ ] Consent getestet (kein Drittanbieter-Aufruf vor Zustimmung)
- [ ] DNS + TLS verifiziert (Sub-Pfade eigene ETags, kein SPA-Bug)
- [ ] Lighthouse-Durchlauf (Performance, SEO, Best Practices, Accessibility)

---

## 18 — Bekannte Stolperfallen

| # | Falle | Vermeidung |
|---|-------|------------|
| 1 | **Coolify SPA-Fallback (`-s`-Flag)** liefert fuer jeden Sub-Pfad die Root-`index.html`. | `nixpacks.toml` mit Start-Command **ohne `-s`**. |
| 2 | **Coolify HTTP 200 auch bei abgelehntem Webhook.** | Diagnose ueber Response-Body in GitHub Recent Deliveries. |
| 3 | **Webhook-Route `/events/manual` vs `/events`** verwechselt. | GitHub-App nutzt `/webhooks/source/github/events` (ohne `/manual`). |
| 4 | **Cloudflare-Edge-Cache** liefert alte ETags. | Verifikation mit `curl -sI ".../pfad/?nocache=$RANDOM"`. |
| 5 | **Em-Dashes (—)** schleichen sich in KI-Texte ein. | Schreibzeit-Regel + Preflight. |
| 6 | **Tablet-Viewports 768 bis 1024px** brechen mit `md:`. | Custom-Breakpoint `--breakpoint-nav: 62rem`, `nav:*` statt `md:*`. |
| 7 | **Kein `<main>`-Element** im BaseLayout, Audit greift ins Leere. | `querySelector('main') ?? document.body` + Nav-Ausschluss. |
| 8 | **Dynamische Tailwind-Klassen `text-${x}`** vom v4-Scanner nicht gefunden. | Klassen vorab komponieren oder `@source inline(...)`. |
| 9 | **`@astrojs/sitemap`-Plugin** unflexibel. | Custom-Route `sitemap.xml.ts`, neue Pages manuell nachtragen. |
| 10 | **Mobile-Overlay innerhalb `<nav>`** mit `backdrop-blur`. | Overlay-Markup **ausserhalb** der `<nav>`. |
| 11 | **Legal-Pages mit `max-w-3xl`** brechen Erklaerungstext um. | Container auf `max-w-5xl`. |
| 12 | **Komponenten-Drift** (existieren, aber inline dupliziert). | Beim Bau direkt verwenden oder loeschen. |
| 13 | **Preview-Port-Konflikt** mit dev-Server (4321). | Audit-Suite auf Port 4322. |
| 14 | **Direction `Allow www & non-www.`** erzeugt Duplicate Content. | Auf `Redirect to non-www.`. |
| 15 | **Let's Encrypt triggert nicht** nach Domain-Eintrag. | `docker restart coolify-proxy`, 30 bis 60s warten. |
| 16 | **ASCII-Umschrift (ae/oe/ue/ss)** statt echter Umlaute. | Schreibzeit-Regel (12) + Preflight (10). Korrektur nie per Replace. |
| 17 | **Platzhalter-Guard** im ConsentBanner blockiert nach ID-Einsetzen dauerhaft. | Guard beim Scharfschalten entfernen (7). |
| 18 | **FAQPage-JSON-LD driftet** vom sichtbaren FAQ ab. | Aus einer Datenquelle speisen (5, 7). |
| 19 | **Newsletter-Embed** schleppt reCAPTCHA/Google ein (Free-Tier nicht entfernbar). | Link-out auf gehostetes Formular (9). |
| 20 | **Coolify Base Directory** auf `/` statt `/site`. | Beim Anlegen auf `/site` setzen. |
| 21 | **Coolify-GitHub-App** sieht neues Repo nicht. | App pro Repo manuell Zugriff geben. |
| 22 | **Zweites Projekt = neuer Server?** Unnoetige Miete. | Eigenes **Coolify-Projekt** auf demselben Server. |
| 23 | **DNS im falschen Tab** zeigt auf Provider-Webspace statt Server-IP. | DNS-Tab: A-Record auf IP, CNAME `www` auf Domain. |
| 24 | **Favicon-Dateien** im falschen Unterordner, Referenzen ins Leere. | Pfade nach dem Generieren pruefen. |
| 25 | **Tote Bildpfade aus Vorgaenger-Projekt** nicht migriert. | Bild-Audit als eigener Schritt in Setup-Reihenfolge (16): `grep -rnoE "/bilder/..."` + Existenz-Check. |
| 26 | **Statische Inhalte** (Telefon, Adresse, HRA) mehrfach kopiert ohne Verifikation. | Beim ersten Einsetzen pruefen und als verifiziert markieren. Nie blind kopieren. |
| 27 | **Schriften-Syntax inkonsistent** in Components (Inline vs. CSS-Var). | Nur `var(--font-sans)` / `var(--font-display)` aus dem `@theme`-Block verwenden. |

---

## So nutzt du diese Schablone

1. Folge **Sektion 16** als Schritt-fuer-Schritt-Reihenfolge.
2. Tausche ueberall die **Marken-Anker** aus (Sektion 15, Farben in Sektion 4, Schema.org/Kontakt in Sektion 7, Tonalitaets-Inhalte in Sektion 12).
3. Lege die **Prompt-Bibliothek** (Sektion 13) an und arbeite Aenderungen ueber diese Vorlagen ab.

---

## 19 — Arbeitsprotokoll

Diese drei Regeln reduzieren die Anzahl der Prompt-Runden messbar. Sie gelten ab Beginn jedes Projekts, nicht erst wenn Probleme auftreten.

### 19.1 Bild-Platzhalter-Protokoll

Jedes Mal wenn ein `<Placeholder>` eingesetzt wird: gleichzeitig einen Eintrag in `offene-bildplaetze.md` (Repo-Root, ausserhalb `site/`) anlegen.

```markdown
| Seite / Component         | label (Soll-Motiv)                    | Ausrichtung | Status   |
|---------------------------|---------------------------------------|-------------|----------|
| /sortiment-und-leistungen | Frische Obst- und Gemüseauswahl       | quer        | offen    |
| /wochenmarkt              | Anke Wilts am Marktstand              | quer        | offen    |
```

Die Liste ist die Aufgabenliste fuer den Kunden. Sie entsteht automatisch beim Bau — keine nachtraeglichen Audit-Runden noetig. Status wird auf `gesetzt` geaendert sobald ein echtes Bild eingebunden ist.

**Ausrichtung zuerst klaeren:** `aspect="4/3"` oder `"16/9"` = Querformat-Slot, nur landscape-Bilder einsetzen. `aspect="1/1"` akzeptiert beide, bei Portrait-lastigen Motiven besser `aspect="3/4"` verwenden.

### 19.2 Statische Inhalte beim ersten Vorkommen verifizieren

Telefonnummer, Adresse, HRA-Nummer, E-Mail, Registerangaben — sie treten auf Impressum, Kontakt, Footer und Schema.org gleichzeitig auf. Regel: **erst pruefen, dann verteilen**.

```
Verifiziert-Checkliste (einmalig pro Projekt):
[ ] Telefon:       +49 XXXX XXXXX
[ ] Fax:           +49 XXXX XXXXX (falls verwendet)
[ ] E-Mail:        info@domain.de
[ ] Adresse:       Straße Nr., PLZ Ort
[ ] HRA/HRB:       XXXXXX (Amtsgericht)
[ ] USt-IdNr:      DE XXXXXXXXX (oder: nicht vorhanden → Abschnitt entfernen)
```

Nach der ersten Seite in `MEMORY.md` oder dem Marken-Anker dokumentieren. Korrekturen dann an einem zentralen Punkt, nicht auf 5 Seiten suchen.

### 19.3 Einheitliche Schriften-Syntax

Eine kanonische Definition im `@theme`-Block:

```css
--font-display: Cambria, Georgia, 'Times New Roman', Times, serif;
--font-sans:    Arial, Helvetica, sans-serif;
```

In Components und Inline-Styles **ausschliesslich** `var(--font-sans)` / `var(--font-display)` verwenden — keine abweichenden `font-family`-Werte. Falls ein Component eine andere Schrift benoetigt: zuerst fragen ob die vorhandene Variable passt, nicht inline ueberschreiben.

Fallstrick: `Arimo, Arial, sans-serif` in einem Component, `Arial, Helvetica, sans-serif` in einem anderen = optisch identisch auf den meisten Systemen, aber inkonsistent sobald Arimo geladen wird. Alles laeuft ueber die Variable.
4. Halte **Sektion 18** beim Bauen offen, die meisten Fehler sind dort schon geloest.
5. `npm run check` vor jedem Push, **Sektion 17** vor Go-Live.

*Blueprint v2.0, eigenstaendig, 2026-06-13. Technische Patterns sind Schablone, Marken-Inhalte sind Beispiel. Die groessten Runden-Sparer sind die Prompt-Bibliothek (13) und das Preflight-Skript (10).*
