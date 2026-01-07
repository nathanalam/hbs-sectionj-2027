// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  site: process.env.GITHUB_PAGES_SITE,
  base: process.env.GITHUB_PAGES_BASE,
  integrations: [tailwind()],
});
