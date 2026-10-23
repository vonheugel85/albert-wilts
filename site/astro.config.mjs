// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Kanonische Domain (ohne www), siehe server.mjs. Canonical-Links und Sitemap zeigen immer hierhin,
  // auch auf dev.albert-wilts.de; dort setzt server.mjs zusaetzlich X-Robots-Tag: noindex.
  site: 'https://albert-wilts.de',
  integrations: [
    mdx(),
    sitemap({
      // Falls wieder interne Testseiten unter /test-* angelegt werden: bleiben draussen (zusaetzlich noindex-Prop in BaseLayout)
      filter: (page) => !page.includes('/test-'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
