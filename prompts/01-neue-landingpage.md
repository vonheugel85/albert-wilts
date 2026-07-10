Lege eine neue Landingpage an: site/src/pages/{{slug}}.astro
1. LESEN ZUERST: eine bestehende Landingpage als Vorbild, BaseLayout (Props),
   Nav (breadcrumbs-Prop), LandingHero.
2. AENDERN: neue Page nach dem Muster. Eyebrow {{eyebrow}}, Headline {{headline}}
   (Akzent in {{accentColor}}), Lead {{lead}}, Sektionen {{sektionen}}.
   breadcrumbs-Prop + BreadcrumbList-JSON-LD via jsonLd-Prop (NICHT in Nav).
3. Neue Page in sitemap.xml.ts in staticPages eintragen.
Randbedingungen + Verifizieren + Bericht: siehe 00-standard-geruest.md.
Zusaetzlich: /{{slug}}/ liefert eigenen ETag (kein SPA-Bug).
