/**
 * probe-quicklinks.mjs
 * Misst die Quicklinks-Sidebar auf dem Live-Staging.
 * Ergebnis: tmp/quicklinks.json
 *
 * Gemessen wird:
 * - Container: Position, Groesse, Gap
 * - Pro Tab: width, height, background-color, border-radius,
 *   Position (right-Offset), Icon-Klasse/Glyph, Icon-Groesse/-Farbe,
 *   Label-Text, Label-Schrift
 * - Hover: translateX-Verschiebung, transition
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';

const STAGING = 'https://wizardly-gauss.92-205-58-98.plesk.page/';
const OUT = 'tmp/quicklinks.json';
mkdirSync('tmp', { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(STAGING, { waitUntil: 'networkidle' });

// Plesk-Schutzschirm
try {
  await page.click('#onContinue', { timeout: 4000 });
  await page.waitForLoadState('networkidle');
} catch {}
await page.waitForTimeout(500);

const data = await page.evaluate(() => {
  // Quicklinks-Container finden: fix positioniert, rechts, enthält mehrere Links/Buttons
  // Moegliche Klassen: .quicklinks, .ce_quicklinks, .ql-container, .mod_quicklink,
  // oder einfach: element das position:fixed und right:0 hat
  function isQuicklinks(el) {
    const cs = getComputedStyle(el);
    return cs.position === 'fixed' && (parseFloat(cs.right) < 10) && cs.display !== 'none';
  }

  // Alle fixed Elemente durchsuchen
  const allEls = document.querySelectorAll('*');
  let container = null;
  for (const el of allEls) {
    if (isQuicklinks(el)) {
      // Hat mehrere Kind-Links/Elemente?
      if (el.children.length >= 2) {
        container = el;
        break;
      }
    }
  }

  if (!container) {
    // Fallback: suche nach bekannten Quicklinks-Selektoren
    container = document.querySelector(
      '.quicklinks, .ce_quicklinks, [class*="quicklink"], [class*="quickbtn"], .stickybar, .contact-bar'
    );
  }

  if (!container) {
    // Debug: alle fixed Elemente ausgeben
    const fixed = [...allEls].filter(el => {
      const cs = getComputedStyle(el);
      return cs.position === 'fixed' && cs.display !== 'none';
    });
    return {
      error: 'Kein Quicklinks-Container gefunden',
      fixedElements: fixed.slice(0, 20).map(el => ({
        tag: el.tagName,
        cls: el.className,
        id: el.id,
        right: getComputedStyle(el).right,
        top: getComputedStyle(el).top,
        w: Math.round(el.getBoundingClientRect().width),
        h: Math.round(el.getBoundingClientRect().height),
        children: el.children.length,
      })),
      // Auch body HTML hint
      bodyClasses: document.body.className,
    };
  }

  const cR = container.getBoundingClientRect();
  const cCs = getComputedStyle(container);

  // Alle direkten Kind-Elemente (Tabs)
  const tabs = [...container.children];

  // Fuer jeden Tab: computed styles + Icon-Info
  const tabData = tabs.map(tab => {
    const r = tab.getBoundingClientRect();
    const cs = getComputedStyle(tab);
    
    // Icon suchen: <i class="fa fa-..."> oder SVG oder ::before-Pseudo
    const iEl = tab.querySelector('i, [class*="icon"], svg');
    const iCs = iEl ? getComputedStyle(iEl) : null;
    
    // ::before Glyph
    const beforeCs = getComputedStyle(tab, '::before');
    const beforeContent = beforeCs.content;
    const beforeFont = beforeCs.fontFamily;
    const beforeFontSize = beforeCs.fontSize;
    const beforeColor = beforeCs.color;
    
    // Icon via <i> tag
    let iconClass = null;
    let iconFontFamily = null;
    let iconContent = null;
    let iconFontSize = null;
    let iconColor = null;
    
    if (iEl) {
      iconClass = iEl.className;
      iconFontFamily = iCs.fontFamily;
      iconFontSize = iCs.fontSize;
      iconColor = iCs.color;
      // Glyph aus ::before des <i>
      const iBefore = getComputedStyle(iEl, '::before');
      iconContent = iBefore.content;
    }
    
    // Label suchen
    const labelEl = tab.querySelector('span, .label, [class*="label"]');
    const labelCs = labelEl ? getComputedStyle(labelEl) : null;
    
    // Text-Content bereinigt
    const rawText = tab.textContent.trim().replace(/\s+/g, ' ');
    
    // Transform im Ruhezustand (translateX)
    const transform = cs.transform;
    // Transition
    const transition = cs.transition;
    
    // Viewport-Breite: Abstand rechter Rand Tab zu rechtem Viewport-Rand
    const vw = window.innerWidth;
    const rightOffset = vw - r.right;
    
    return {
      tag: tab.tagName,
      cls: tab.className,
      id: tab.id,
      text: rawText,
      // Abmessungen
      x:     Math.round(r.left),
      y:     Math.round(r.top),
      w:     Math.round(r.width),
      h:     Math.round(r.height),
      rightOffset: Math.round(rightOffset),
      // Styling
      bg:           cs.backgroundColor,
      color:        cs.color,
      borderRadius: cs.borderRadius,
      padding:      `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      fontSize:     cs.fontSize,
      fontFamily:   cs.fontFamily,
      fontWeight:   cs.fontWeight,
      lineHeight:   cs.lineHeight,
      // Transform/Transition (Hover-Slide)
      transform,
      transition,
      // ::before Glyph (oft das Icon)
      before_content:    beforeContent,
      before_fontFamily: beforeFont,
      before_fontSize:   beforeFontSize,
      before_color:      beforeColor,
      // <i>-Icon
      iconClass,
      iconFontFamily,
      iconContent,
      iconFontSize,
      iconColor,
      // Label
      labelText:     labelEl ? labelEl.textContent.trim() : null,
      labelFontSize: labelCs ? labelCs.fontSize : null,
      labelFontFamily: labelCs ? labelCs.fontFamily : null,
      labelPadding:  labelCs ? `${labelCs.paddingTop} ${labelCs.paddingRight} ${labelCs.paddingBottom} ${labelCs.paddingLeft}` : null,
    };
  });

  return {
    container: {
      tag:     container.tagName,
      cls:     container.className,
      id:      container.id,
      x:       Math.round(cR.left),
      y:       Math.round(cR.top),
      w:       Math.round(cR.width),
      h:       Math.round(cR.height),
      display: cCs.display,
      flexDirection: cCs.flexDirection,
      gap:     cCs.gap,
      top:     cCs.top,
      right:   cCs.right,
      zIndex:  cCs.zIndex,
    },
    tabCount: tabs.length,
    tabs: tabData,
  };
});

writeFileSync(OUT, JSON.stringify(data, null, 2));
console.log(JSON.stringify(data, null, 2));
await browser.close();
