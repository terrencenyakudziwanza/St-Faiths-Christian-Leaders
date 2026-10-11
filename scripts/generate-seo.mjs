import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const dotenvValues = await Promise.all([".env.production.local", ".env.local", ".env.production", ".env"].map(async (file) => {
  const text = await readFile(join(process.cwd(), file), "utf8").catch(() => "");
  return text.match(/^\s*VITE_SITE_URL\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s#]+))/m)?.slice(1).find(Boolean) ?? "";
}));
const configuredUrl = process.env.VITE_SITE_URL || dotenvValues.find(Boolean) || "https://www.stfaithschristianleaders.com";
const siteUrl = configuredUrl
  ? new URL(configuredUrl.includes("://") ? configuredUrl : `https://${configuredUrl}`).origin
  : null;
const outputDirectory = join(process.cwd(), "dist");
await mkdir(outputDirectory, { recursive: true });

const sitemapLine = siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : "";
await writeFile(join(outputDirectory, "robots.txt"), `User-agent: *\nAllow: /\n${sitemapLine}`);

const routeMetadata = {
  "/": {
    title: "Christian Leaders SU at St Faith’s | Faith, Worship & Community",
    heading: "Christian Leaders SU at St Faith’s",
    description: "Discover Christian Leaders SU at St Faith’s: a student Christian community built around prayer, Bible study, worship, fellowship, and service.",
    indexable: true,
  },
  "/events": {
    title: "Events & Gatherings | Christian Leaders SU at St Faith’s",
    heading: "Events & Gatherings",
    description: "Explore upcoming Christian Leaders SU events, services, revivals, and highlights from our community gatherings at St Faith’s.",
    indexable: true,
  },
  "/family": {
    title: "Our Family & Leadership | Christian Leaders SU at St Faith’s",
    heading: "Our Family & Leadership",
    description: "Meet the Christian Leaders SU family, including our patrons, ministry departments, and board serving the St Faith’s community.",
    indexable: true,
  },
  "/login": {
    title: "Editor Sign In | Christian Leaders SU",
    heading: "Editor sign in",
    description: "Sign in to the Christian Leaders SU content dashboard.",
    indexable: false,
  },
  "/dashboard": {
    title: "Content Dashboard | Christian Leaders SU",
    heading: "Content dashboard",
    description: "Manage Christian Leaders SU website content.",
    indexable: false,
  },
};

const baseHtml = await readFile(join(outputDirectory, "index.html"), "utf8");
for (const [route, page] of Object.entries(routeMetadata)) {
  const canonical = siteUrl && page.indexable ? `<link rel="canonical" href="${siteUrl}${route === "/" ? "/" : route}" />` : "";
  const socialImage = siteUrl ? `${siteUrl}/og-image.jpg` : "/og-image.jpg";
  const robots = page.indexable ? "index,follow" : "noindex,nofollow";
  const headTags = [
    `<title>${page.title}</title>`,
    `<meta name="description" content="${page.description}" />`,
    `<meta name="robots" content="${robots}" />`,
    canonical,
    `<meta property="og:title" content="${page.title}" />`,
    `<meta property="og:description" content="${page.description}" />`,
    siteUrl && page.indexable ? `<meta property="og:url" content="${siteUrl}${route === "/" ? "/" : route}" />` : "",
    `<meta property="og:image" content="${socialImage}" />`,
    `<meta property="og:image:type" content="image/jpeg" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Christian Leaders SU at St Faith’s in gold and white on a dark background." />`,
    `<meta name="twitter:title" content="${page.title}" />`,
    `<meta name="twitter:description" content="${page.description}" />`,
    `<meta name="twitter:image" content="${socialImage}" />`,
    `<meta name="twitter:image:alt" content="Christian Leaders SU at St Faith’s in gold and white on a dark background." />`,
    siteUrl && route === "/" ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "Christian Leaders SU at St Faith’s", url: `${siteUrl}/` })}</script>` : "",
  ].filter(Boolean).join("\n    ");
  const noScriptFallback = `<noscript><main><h1>${page.heading}</h1><p>${page.description}</p><nav aria-label="Main pages"><a href="/">Home</a> · <a href="/events">Events and gatherings</a> · <a href="/family">Our family and leadership</a></nav></main></noscript>`;
  const routeHtml = baseHtml
    .replace(/\s*<title>[\s\S]*?<\/title>/i, "")
    .replace(/\s*<meta name="description"[^>]*>/i, "")
    .replace(/\s*<meta name="robots"[^>]*>/i, "")
    .replace(/\s*<meta property="og:title"[^>]*>/i, "")
    .replace(/\s*<meta property="og:description"[^>]*>/i, "")
    .replace(/\s*<meta property="og:image"[^>]*>/i, "")
    .replace(/\s*<meta property="og:image:(?:type|width|height|alt)"[^>]*>/gi, "")
    .replace(/\s*<meta name="twitter:title"[^>]*>/i, "")
    .replace(/\s*<meta name="twitter:description"[^>]*>/i, "")
    .replace(/\s*<meta name="twitter:image"[^>]*>/i, "")
    .replace(/\s*<meta name="twitter:image:alt"[^>]*>/i, "")
    .replace("</head>", `    ${headTags}\n  </head>`)
    .replace("</body>", `  ${noScriptFallback}\n</body>`);
  const routeFile = route === "/" ? "index.html" : `${route.slice(1)}.html`;
  await writeFile(join(outputDirectory, routeFile), routeHtml);
}

if (siteUrl) {
  const publicRoutes = ["/", "/events", "/family"];
  const entries = publicRoutes.map((route) => `  <url><loc>${siteUrl}${route}</loc></url>`).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  await writeFile(join(outputDirectory, "sitemap.xml"), xml);
  console.log(`Generated sitemap for ${siteUrl}`);
} else {
  console.warn("No production host is configured for this build; sitemap.xml and canonical URLs were omitted. Set VITE_SITE_URL to override the configured production domain.");
}
