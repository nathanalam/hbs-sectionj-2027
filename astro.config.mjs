// @ts-check
import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  site: process.env.BASE_PATH ? "https://nathanalam.github.io" : undefined,
  base: (process.env.BASE_PATH || "").replace(/\/$/, "") + "/",
});
