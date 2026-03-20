import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { writeFileSync } from "fs";

const BASE_URL = "https://www.stoffverkauf-weber.de";

function generateSitemapPlugin() {
  return {
    name: "generate-sitemap",
    closeBundle() {
      // Static pages with priorities
      const staticPages = [
        { path: "/", changefreq: "daily", priority: "1.0" },
        { path: "/about", changefreq: "monthly", priority: "0.7" },
        { path: "/contact", changefreq: "monthly", priority: "0.7" },
        { path: "/faq", changefreq: "monthly", priority: "0.6" },
        { path: "/blog", changefreq: "weekly", priority: "0.8" },
        { path: "/impressum", changefreq: "yearly", priority: "0.3" },
        { path: "/datenschutz", changefreq: "yearly", priority: "0.3" },
        { path: "/agb", changefreq: "yearly", priority: "0.3" },
        { path: "/widerruf", changefreq: "yearly", priority: "0.3" },
      ];

      // Product IDs 1-34
      const productIds = Array.from({ length: 34 }, (_, i) => i + 1);

      // Blog post IDs
      const blogPostIds = [1, 2, 3];

      const today = new Date().toISOString().split("T")[0];

      const urls = [
        ...staticPages.map(
          (p) =>
            `  <url>\n    <loc>${BASE_URL}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>`
        ),
        ...productIds.map(
          (id) =>
            `  <url>\n    <loc>${BASE_URL}/product/${id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
        ),
        ...blogPostIds.map(
          (id) =>
            `  <url>\n    <loc>${BASE_URL}/blog/${id}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>`
        ),
      ];

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

      writeFileSync("dist/sitemap.xml", sitemap);
      console.log(`✅ Sitemap generated with ${urls.length} URLs`);
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && generateSitemapPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
