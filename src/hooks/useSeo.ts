import { useEffect } from "react";

const DEFAULT_DESCRIPTION =
  "PallaviTraders offers a wide range of iron, steel and construction materials. Browse our product catalogue and contact us for availability and quotations.";

function upsertMetaAttribute(selector: string, attribute: string, content: string): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, content);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

/** Sets the page title and meta description for the current route (SEO). */
export function useSeo(title: string, description: string = DEFAULT_DESCRIPTION): void {
  useEffect(() => {
    document.title = title;
    upsertMetaAttribute('meta[name="description"]', "name", description);
    upsertMetaAttribute('meta[property="og:title"]', "property", title);
    upsertMetaAttribute('meta[property="og:description"]', "property", description);
  }, [title, description]);
}
