import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const pages: Record<string, { title: string; description: string; indexable: boolean }> = {
  "/": {
    title: "Christian Leaders SU at St Faith’s | Faith, Worship & Community",
    description: "Discover Christian Leaders SU at St Faith’s: a student Christian community built around prayer, Bible study, worship, fellowship, and service.",
    indexable: true,
  },
  "/events": {
    title: "Events & Gatherings | Christian Leaders SU at St Faith’s",
    description: "Explore upcoming Christian Leaders SU events, services, revivals, and highlights from our community gatherings at St Faith’s.",
    indexable: true,
  },
  "/family": {
    title: "Our Family & Leadership | Christian Leaders SU at St Faith’s",
    description: "Meet the Christian Leaders SU family, including our patrons, ministry departments, and board serving the St Faith’s community.",
    indexable: true,
  },
  "/login": {
    title: "Editor Sign In | Christian Leaders SU",
    description: "Sign in to the Christian Leaders SU content dashboard.",
    indexable: false,
  },
  "/dashboard": {
    title: "Content Dashboard | Christian Leaders SU",
    description: "Manage Christian Leaders SU website content.",
    indexable: false,
  },
};

function setMeta(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }
  element.content = content;
}

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const page = pages[pathname] ?? {
      title: "Page Not Found | Christian Leaders SU at St Faith’s",
      description: "The requested Christian Leaders SU page could not be found.",
      indexable: false,
    };
    const configuredBaseUrl = (import.meta.env.VITE_SITE_URL as string | undefined)?.trim().replace(/\/$/, "");
    const renderedCanonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;
    const baseUrl = configuredBaseUrl || (renderedCanonical ? new URL(renderedCanonical).origin : "");
    const canonicalUrl = baseUrl ? `${baseUrl}${pathname === "/" ? "/" : pathname}` : "";
    document.title = page.title;
    setMeta('meta[name="description"]', "name", "description", page.description);
    setMeta('meta[name="robots"]', "name", "robots", page.indexable ? "index,follow" : "noindex,nofollow");
    setMeta('meta[property="og:type"]', "property", "og:type", "website");
    setMeta('meta[property="og:site_name"]', "property", "og:site_name", "Christian Leaders SU at St Faith’s");
    setMeta('meta[property="og:title"]', "property", "og:title", page.title);
    setMeta('meta[property="og:description"]', "property", "og:description", page.description);
    setMeta('meta[property="og:image"]', "property", "og:image", baseUrl ? `${baseUrl}/og-image.jpg` : `${window.location.origin}/og-image.jpg`);
    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", page.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", page.description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", baseUrl ? `${baseUrl}/og-image.jpg` : `${window.location.origin}/og-image.jpg`);

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonicalUrl) {
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.append(canonical);
      }
      canonical.href = canonicalUrl;
      setMeta('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    } else {
      canonical?.remove();
      document.head.querySelector('meta[property="og:url"]')?.remove();
    }
  }, [pathname]);

  return null;
}
