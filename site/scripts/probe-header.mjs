// scripts/probe-header.mjs
// Liest alle Header/Nav-Fundamentwerte vom Live-Staging aus.
// READ-ONLY. Aufruf: node scripts/probe-header.mjs
// Ausgabe: tmp/header_computed.json + Tabelle in der Konsole.

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const URL   = 'https://wizardly-gauss.92-205-58-98.plesk.page/';
const OUT   = 'tmp/header_computed.json';
mkdirSync('tmp', { recursive: true });

async function openPage(browser, width) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 900 });
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 40_000 });
  try { await page.click('#onContinue', { timeout: 4_000 }); await page.waitForLoadState('networkidle', { timeout: 20_000 }); } catch {}
  try {
    const btn = page.locator('a,button').filter({ hasText: /continue to website|zur website/i });
    if (await btn.count() > 0) { await btn.first().click(); await page.waitForLoadState('networkidle', { timeout: 20_000 }); }
  } catch {}
  await page.waitForTimeout(500);
  return page;
}

const browser = await chromium.launch({ headless: true });
const result  = {};

// ── Hilfsfunktion: einzelnes Element messen ──────────────────────────────────
function el(e, label) {
  if (!e) return { label, found: false };
  const cs   = getComputedStyle(e);
  const rect = e.getBoundingClientRect();
  return {
    label, found: true,
    tag: e.tagName,
    id:  e.id   || null,
    cls: e.className.trim().split(/\s+/).slice(0,6).join(' '),
    renderedW: Math.round(rect.width),
    renderedH: Math.round(rect.height),
    top:  Math.round(rect.top),
    left: Math.round(rect.left),
    fontFamily:    cs.fontFamily,
    fontSize:      cs.fontSize,
    fontWeight:    cs.fontWeight,
    lineHeight:    cs.lineHeight,
    color:         cs.color,
    bg:            cs.backgroundColor,
    padding:       cs.padding,
    paddingTop:    cs.paddingTop,
    paddingBottom: cs.paddingBottom,
    paddingLeft:   cs.paddingLeft,
    paddingRight:  cs.paddingRight,
    margin:        cs.margin,
    marginTop:     cs.marginTop,
    marginBottom:  cs.marginBottom,
    maxWidth:      cs.maxWidth,
    display:       cs.display,
    position:      cs.position,
    zIndex:        cs.zIndex,
    boxShadow:     cs.boxShadow,
    textTransform: cs.textTransform,
    letterSpacing: cs.letterSpacing,
    borderRadius:  cs.borderRadius,
    transition:    cs.transition,
    height:        cs.height,
    minHeight:     cs.minHeight,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHRITT A: 1280px und 1920px – Header-Struktur, Container, Logo, Nav, Links
// ─────────────────────────────────────────────────────────────────────────────
for (const vw of [1280, 1920]) {
  console.log(`\n=== Viewport ${vw}px ===`);
  const page = await openPage(browser, vw);

  const data = await page.evaluate((vw) => {
    function measure(e, label) {
      if (!e) return { label, found: false };
      const cs   = getComputedStyle(e);
      const rect = e.getBoundingClientRect();
      return {
        label, found: true,
        tag: e.tagName,
        id:  e.id   || null,
        cls: e.className.trim().split(/\s+/).slice(0,8).join(' '),
        renderedW: Math.round(rect.width),
        renderedH: Math.round(rect.height),
        top:  Math.round(rect.top),
        left: Math.round(rect.left),
        fontFamily:    cs.fontFamily,
        fontSize:      cs.fontSize,
        fontWeight:    cs.fontWeight,
        lineHeight:    cs.lineHeight,
        color:         cs.color,
        bg:            cs.backgroundColor,
        padding:       cs.padding,
        paddingTop:    cs.paddingTop,
        paddingBottom: cs.paddingBottom,
        paddingLeft:   cs.paddingLeft,
        paddingRight:  cs.paddingRight,
        margin:        cs.margin,
        marginTop:     cs.marginTop,
        marginBottom:  cs.marginBottom,
        marginLeft:    cs.marginLeft,
        marginRight:   cs.marginRight,
        maxWidth:      cs.maxWidth,
        display:       cs.display,
        position:      cs.position,
        zIndex:        cs.zIndex,
        boxShadow:     cs.boxShadow,
        textTransform: cs.textTransform,
        letterSpacing: cs.letterSpacing,
        borderRadius:  cs.borderRadius,
        transition:    cs.transition,
        height:        cs.height,
        minHeight:     cs.minHeight,
        flexDirection: cs.flexDirection,
        alignItems:    cs.alignItems,
        justifyContent:cs.justifyContent,
        gap:           cs.gap,
      };
    }

    // Kandidaten fuer den Header-Wrapper
    const headerWrapper =
      document.querySelector('#header') ||
      document.querySelector('header') ||
      document.querySelector('.mod_article#header') ||
      document.querySelector('[id*="header"]');

    // inside-Container
    const headerInside =
      document.querySelector('#header .inside') ||
      document.querySelector('header .inside');

    // Logo: pct_theme rendert oft ein <a> mit CSS-Background-Image
    const logoA =
      document.querySelector('#header .logo a') ||
      document.querySelector('#header a.logo') ||
      document.querySelector('#header .logo') ||
      document.querySelector('header .logo') ||
      document.querySelector('#header a') ||
      document.querySelector('header a');

    // Nav-Wrapper
    const navWrapper =
      document.querySelector('#header nav') ||
      document.querySelector('#nav') ||
      document.querySelector('header nav') ||
      document.querySelector('#header .navigation') ||
      document.querySelector('.mod_navigation');

    // Level-1-Links: erste 3 stichprobenartig
    const l1Links = [...document.querySelectorAll(
      '#header nav > ul > li > a, #nav > ul > li > a, .mod_navigation > ul > li > a, header nav ul > li > a'
    )].slice(0, 3);

    // "Aktuelle Angebote"-Button
    const cta = [...document.querySelectorAll(
      '#header a, header a, nav a'
    )].find(a => /angebote|angebot/i.test(a.textContent));

    // Dropdown: erstes ul.level_2 oder sub-nav
    const dropdown =
      document.querySelector('#header nav ul ul') ||
      document.querySelector('header nav ul ul') ||
      document.querySelector('.dropdown-menu');

    // Dropdown-Items
    const ddItems = dropdown ? [...dropdown.querySelectorAll('li a')].slice(0,3) : [];

    // Sticky-Header: #stickyheader oder .sticky-header
    const sticky =
      document.querySelector('#stickyheader') ||
      document.querySelector('.stickyheader') ||
      document.querySelector('[id*="sticky"]') ||
      document.querySelector('[class*="sticky"]');

    // Nav-List-Container (ul)
    const navUL =
      document.querySelector('#header nav > ul') ||
      document.querySelector('#nav > ul') ||
      document.querySelector('header nav > ul');

    // Logo: background-image aus ::before oder direkt
    let logoBg = '';
    if (logoA) {
      logoBg = getComputedStyle(logoA).backgroundImage;
      const img = logoA.querySelector('img');
      if (!logoBg || logoBg === 'none') logoBg = img ? img.src : '';
    }

    // Header-Gesamthoehe
    const headerH = headerWrapper ? Math.round(headerWrapper.getBoundingClientRect().height) : null;

    return {
      vw,
      headerWrapper: measure(headerWrapper, 'header-wrapper'),
      headerInside:  measure(headerInside, 'header-inside'),
      logoA:         { ...measure(logoA, 'logo-a'), backgroundImage: logoBg },
      navWrapper:    measure(navWrapper, 'nav-wrapper'),
      navUL:         measure(navUL, 'nav-ul'),
      l1Links:       l1Links.map((a, i) => ({ ...measure(a, `l1-link-${i}`), text: a.textContent.trim().slice(0,30) })),
      ctaButton:     cta ? { ...measure(cta, 'cta-button'), text: cta.textContent.trim().slice(0,30) } : { found: false, label: 'cta-button' },
      dropdown:      measure(dropdown, 'dropdown-ul'),
      ddItems:       ddItems.map((a, i) => ({ ...measure(a, `dd-item-${i}`), text: a.textContent.trim().slice(0,30) })),
      stickyHeader:  measure(sticky, 'sticky-header'),
      headerTotalH:  headerH,
      // DOM-Struktur
      headerHTML:    headerWrapper ? headerWrapper.innerHTML.replace(/\s+/g, ' ').slice(0, 2000) : null,
    };
  }, vw);

  result[`vp${vw}`] = data;

  // Tabelle ausgeben
  function row(label, val) { console.log(`  ${label.padEnd(30)}: ${val ?? '—'}`); }
  row('Header total height', `${data.headerTotalH}px`);
  row('header-inside max-width', data.headerInside.maxWidth);
  row('header-inside rendered', `${data.headerInside.renderedW}px`);
  row('header-inside padding', `${data.headerInside.paddingTop} ${data.headerInside.paddingRight} ${data.headerInside.paddingBottom} ${data.headerInside.paddingLeft}`);
  row('header bg', data.headerWrapper.bg);
  row('logo rendered W×H', data.logoA.found ? `${data.logoA.renderedW}×${data.logoA.renderedH}` : 'nicht gefunden');
  row('logo margin', data.logoA.found ? data.logoA.margin : '—');
  row('logo background-image', data.logoA.backgroundImage?.slice(0,60) ?? '—');
  row('nav display', data.navWrapper.display);
  row('nav-ul gap', data.navUL.gap);
  row('nav-ul justify-content', data.navUL.justifyContent);
  if (data.l1Links.length) {
    const l = data.l1Links[0];
    row('l1 font', `${l.fontFamily?.split(',')[0]} ${l.fontSize} w${l.fontWeight}`);
    row('l1 color', l.color);
    row('l1 padding', l.padding);
    row('l1 text-transform', l.textTransform);
    row('l1 rendered H', `${l.renderedH}px`);
  }
  row('CTA button text', data.ctaButton.found ? data.ctaButton.text : 'nicht gefunden');
  row('CTA bg', data.ctaButton.found ? data.ctaButton.bg : '—');
  row('CTA color', data.ctaButton.found ? data.ctaButton.color : '—');
  row('CTA padding', data.ctaButton.found ? data.ctaButton.padding : '—');
  row('CTA border-radius', data.ctaButton.found ? data.ctaButton.borderRadius : '—');
  row('dropdown bg', data.dropdown.found ? data.dropdown.bg : 'nicht gefunden');
  row('dropdown box-shadow', data.dropdown.found ? data.dropdown.boxShadow?.slice(0,60) : '—');
  if (data.ddItems.length) {
    const d = data.ddItems[0];
    row('dd-item font/size', `${d.fontFamily?.split(',')[0]} ${d.fontSize}`);
    row('dd-item color', d.color);
    row('dd-item padding', d.padding);
  }

  await page.close();
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHRITT B: Dropdown hover simulieren (1280px, CSS-hover-State)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== Dropdown hover (1280px) ===');
const pageHover = await openPage(browser, 1280);
const dropdownData = await pageHover.evaluate(() => {
  function measure(e, label) {
    if (!e) return { label, found: false };
    const cs   = getComputedStyle(e);
    const rect = e.getBoundingClientRect();
    return {
      label, found: true,
      renderedW: Math.round(rect.width), renderedH: Math.round(rect.height),
      top: Math.round(rect.top), left: Math.round(rect.left),
      bg: cs.backgroundColor, boxShadow: cs.boxShadow,
      padding: cs.padding, borderRadius: cs.borderRadius,
      display: cs.display, position: cs.position,
      border: cs.border, zIndex: cs.zIndex,
    };
  }

  // Ersten Level-1-Link mit Dropdown finden und :hover via JS-forceHover
  const l1WithDD = [...document.querySelectorAll(
    '#header nav > ul > li, header nav > ul > li, .mod_navigation > ul > li'
  )].find(li => li.querySelector('ul'));

  if (!l1WithDD) return { found: false };

  // Sub-nav VOR hover
  const subBefore = l1WithDD.querySelector('ul');
  const subCsBefore = subBefore ? getComputedStyle(subBefore).display : null;

  // Hover-State simulieren: Element kurz als :hover markieren geht nicht direkt
  // Stattdessen: CSS-Werte auslesen, wenn Hover per class aktiviert
  l1WithDD.classList.add('hover', 'open');
  const subCsAfter = subBefore ? getComputedStyle(subBefore) : null;
  const ddMeasure = subBefore ? {
    display: subCsAfter?.display,
    position: subCsAfter?.position,
    bg: subCsAfter?.backgroundColor,
    boxShadow: subCsAfter?.boxShadow,
    minWidth: subCsAfter?.minWidth,
    padding: subCsAfter?.padding,
    borderRadius: subCsAfter?.borderRadius,
    top: subCsAfter?.top,
    border: subCsAfter?.border,
  } : null;
  l1WithDD.classList.remove('hover', 'open');

  // Items im Dropdown
  const ddLinks = subBefore ? [...subBefore.querySelectorAll('a')].slice(0,3).map(a => {
    const cs = getComputedStyle(a);
    return { text: a.textContent.trim(), fs: cs.fontSize, fw: cs.fontWeight, color: cs.color, padding: cs.padding, ff: cs.fontFamily };
  }) : [];

  return {
    found: true,
    l1text: l1WithDD.querySelector('a')?.textContent.trim(),
    subDisplayBefore: subCsBefore,
    ddMeasure,
    ddLinks,
    subHTML: subBefore?.innerHTML.slice(0,500),
  };
});
result.dropdownProbe = dropdownData;
if (dropdownData.found) {
  console.log(`  Level-1 mit Dropdown: "${dropdownData.l1text}"`);
  console.log(`  Sub-nav display (default): ${dropdownData.subDisplayBefore}`);
  if (dropdownData.ddMeasure) {
    console.log(`  Dropdown bg: ${dropdownData.ddMeasure.bg}`);
    console.log(`  Dropdown box-shadow: ${dropdownData.ddMeasure.boxShadow?.slice(0,60)}`);
    console.log(`  Dropdown padding: ${dropdownData.ddMeasure.padding}`);
    console.log(`  Dropdown border-radius: ${dropdownData.ddMeasure.borderRadius}`);
    console.log(`  Dropdown border: ${dropdownData.ddMeasure.border}`);
  }
  for (const d of dropdownData.ddLinks) {
    console.log(`  DD-Link "${d.text}": ${d.fs} w${d.fw} ${d.color} pad=${d.padding}`);
  }
}
await pageHover.close();

// ─────────────────────────────────────────────────────────────────────────────
// SCHRITT C: Sticky-Header nach Scroll (1280px)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== Sticky nach Scroll (1280px) ===');
const pageScroll = await openPage(browser, 1280);
await pageScroll.evaluate(() => window.scrollBy(0, 700));
await pageScroll.waitForTimeout(800);
const stickyData = await pageScroll.evaluate(() => {
  function measure(e, label) {
    if (!e) return { label, found: false };
    const cs   = getComputedStyle(e);
    const rect = e.getBoundingClientRect();
    return {
      label, found: true,
      tag: e.tagName,
      cls: e.className.trim().split(/\s+/).slice(0,8).join(' '),
      renderedW: Math.round(rect.width), renderedH: Math.round(rect.height),
      top: Math.round(rect.top), left: Math.round(rect.left),
      bg: cs.backgroundColor, boxShadow: cs.boxShadow,
      position: cs.position, zIndex: cs.zIndex,
      opacity: cs.opacity, display: cs.display,
      transition: cs.transition,
    };
  }

  // Original-Header-Zustand nach Scroll
  const origHeader =
    document.querySelector('#header') ||
    document.querySelector('header');

  const stickyEl =
    document.querySelector('#stickyheader') ||
    document.querySelector('.stickyheader') ||
    document.querySelector('[id*="sticky"]');

  // Logo im sticky
  const stickyLogo = stickyEl?.querySelector('img, .logo, a');
  const origLogo   = origHeader?.querySelector('img, .logo a, a.logo');

  // Sticky-Logo-Groesse
  const stickyLogoCs = stickyLogo ? getComputedStyle(stickyLogo) : null;
  const stickyLogoRect = stickyLogo ? stickyLogo.getBoundingClientRect() : null;

  // Original-Header nach Scroll – ist er noch sichtbar?
  const origRect = origHeader ? origHeader.getBoundingClientRect() : null;
  const origVisible = origRect ? (origRect.bottom > 0) : false;

  // Sticky-Nav-Links Farbe
  const stickyLinks = stickyEl ? [...stickyEl.querySelectorAll('a')].slice(0,3).map(a => {
    const cs = getComputedStyle(a);
    return { text: a.textContent.trim().slice(0,20), color: cs.color, bg: cs.backgroundColor, fs: cs.fontSize };
  }) : [];

  return {
    origHeaderBg: origHeader ? getComputedStyle(origHeader).backgroundColor : null,
    origHeaderPos: origHeader ? getComputedStyle(origHeader).position : null,
    origHeaderTop: origRect ? Math.round(origRect.top) : null,
    origVisible,
    sticky: measure(stickyEl, 'sticky-header'),
    stickyLogo: stickyLogoRect ? {
      renderedW: Math.round(stickyLogoRect.width),
      renderedH: Math.round(stickyLogoRect.height),
      opacity: stickyLogoCs?.opacity,
      bg: stickyLogoCs?.backgroundImage?.slice(0,60),
    } : null,
    stickyLinks,
    scrollY: null, // kann nicht im evaluate-Kontext gelesen werden
  };
});
// scrollY separat
const scrollY = await pageScroll.evaluate(() => window.scrollY);
stickyData.scrollY = scrollY;
result.sticky = stickyData;

console.log(`  scrollY: ${scrollY}px`);
console.log(`  Original-Header sichtbar: ${stickyData.origVisible} (top: ${stickyData.origHeaderTop}px)`);
if (stickyData.sticky.found) {
  console.log(`  Sticky-Element: ${stickyData.sticky.cls}`);
  console.log(`  Sticky bg: ${stickyData.sticky.bg}`);
  console.log(`  Sticky height: ${stickyData.sticky.renderedH}px`);
  console.log(`  Sticky box-shadow: ${stickyData.sticky.boxShadow?.slice(0,60)}`);
  console.log(`  Sticky position: ${stickyData.sticky.position} z${stickyData.sticky.zIndex}`);
  console.log(`  Sticky opacity: ${stickyData.sticky.opacity}`);
} else {
  console.log('  Kein Sticky-Element im DOM gefunden.');
  console.log('  → Original-Header nutzt moeglicherweise position:sticky + box-shadow');
  console.log(`  → Original-Header bg nach Scroll: ${stickyData.origHeaderBg}`);
}
await pageScroll.close();

// ─────────────────────────────────────────────────────────────────────────────
// SCHRITT D: Breakpoint + Burger (375px)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== Mobil 375px ===');
const pageMobile = await openPage(browser, 375);
const mobileData = await pageMobile.evaluate(() => {
  function measure(e, label) {
    if (!e) return { label, found: false };
    const cs   = getComputedStyle(e);
    const rect = e.getBoundingClientRect();
    return { label, found: true,
      renderedW: Math.round(rect.width), renderedH: Math.round(rect.height),
      display: cs.display, bg: cs.backgroundColor, position: cs.position };
  }

  const nav = document.querySelector('#header nav, header nav, .mod_navigation');
  const burger = document.querySelector('[class*="burger"], [class*="toggle"], button[aria-label*="Menu"], button[aria-label*="menu"], .nav-toggle');
  const logo   = document.querySelector('#header .logo, header .logo, #header img, header img');
  const header = document.querySelector('#header, header');

  return {
    navDisplay:    nav  ? getComputedStyle(nav).display : 'nicht gefunden',
    burger:        measure(burger, 'burger'),
    logo:          measure(logo, 'logo-mobile'),
    headerH:       header ? Math.round(header.getBoundingClientRect().height) : null,
    headerBg:      header ? getComputedStyle(header).backgroundColor : null,
  };
});
result.mobile375 = mobileData;
console.log(`  Nav display bei 375px: ${mobileData.navDisplay}`);
console.log(`  Header Höhe: ${mobileData.headerH}px`);
console.log(`  Header bg: ${mobileData.headerBg}`);
console.log(`  Burger found: ${mobileData.burger.found} (display: ${mobileData.burger.display})`);
console.log(`  Logo rendered: ${mobileData.logo.renderedW}×${mobileData.logo.renderedH}`);
await pageMobile.close();

// ─────────────────────────────────────────────────────────────────────────────
// SCHRITT E: Header-DOM-Struktur dumpen (fuer Analyse)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n=== Header DOM-Struktur ===');
const pageDom = await openPage(browser, 1280);
const domDump = await pageDom.evaluate(() => {
  const h = document.querySelector('#header') || document.querySelector('header');
  if (!h) return 'nicht gefunden';

  // Nur Struktur: Tags + IDs + Klassen + Text-Snippet, keine Attribute wie style
  function nodeInfo(node, depth = 0) {
    if (depth > 5) return null;
    if (node.nodeType === 3) {
      const t = node.textContent.trim().slice(0,40);
      return t ? '  '.repeat(depth) + `TEXT: "${t}"` : null;
    }
    if (node.nodeType !== 1) return null;
    const tag  = node.tagName.toLowerCase();
    const id   = node.id ? `#${node.id}` : '';
    const cls  = node.className ? `.${[...node.classList].slice(0,4).join('.')}` : '';
    const cs   = getComputedStyle(node);
    const dims = `${Math.round(node.getBoundingClientRect().width)}×${Math.round(node.getBoundingClientRect().height)}`;
    const bg   = cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'rgb(255, 255, 255)' ? ` bg=${cs.backgroundColor}` : '';
    const lines = [`${'  '.repeat(depth)}<${tag}${id}${cls}> [${dims}${bg}]`];
    for (const child of node.childNodes) {
      const line = nodeInfo(child, depth + 1);
      if (line) lines.push(line);
    }
    return lines.join('\n');
  }
  return nodeInfo(h);
});
result.domStructure = domDump;
console.log(domDump ? domDump.slice(0, 3000) : 'kein DOM');
await pageDom.close();

// ─────────────────────────────────────────────────────────────────────────────
// Screenshot Header bei 1280 + 375 speichern
// ─────────────────────────────────────────────────────────────────────────────
for (const vw of [1280, 375]) {
  const p = await openPage(browser, vw);
  const box = await p.evaluate(() => {
    const h = document.querySelector('#header') || document.querySelector('header');
    if (!h) return null;
    const r = h.getBoundingClientRect();
    return { x: 0, y: 0, width: window.innerWidth, height: Math.round(r.bottom) + 5 };
  });
  const path = `tmp/header_staging_${vw}.png`;
  if (box) {
    await p.screenshot({ path, clip: box });
  } else {
    await p.screenshot({ path, clip: { x: 0, y: 0, width: vw, height: 200 } });
  }
  console.log(`Screenshot: ${path}`);
  await p.close();
}

await browser.close();
writeFileSync(OUT, JSON.stringify(result, null, 2));
console.log(`\n✓ Dump: ${OUT}`);
