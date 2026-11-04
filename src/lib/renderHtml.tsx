import { createElement } from "react";

const BLOCKED_TAGS = "script,style,iframe,object,embed,link,meta,form";

// Strips dangerous tags, inline event handlers and javascript: URLs.
const sanitizeHtml = (html: string): string => {
  if (typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  doc.body.querySelectorAll(BLOCKED_TAGS).forEach((el) => el.remove());
  doc.body.querySelectorAll("*").forEach((el) => {
    Array.from(el.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim().toLowerCase();
      if (
        name.startsWith("on") ||
        ((name === "href" || name === "src") && value.startsWith("javascript:"))
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return doc.body.innerHTML;
};

/**
 * Renders an HTML string (e.g. rich-text CMS content) as sanitized markup.
 * Returns null for empty values.
 */
export const renderHtml = (html?: string | null, className?: string) => {
  if (!html) return null;
  return createElement("div", {
    className,
    dangerouslySetInnerHTML: { __html: sanitizeHtml(html) },
  });
};
