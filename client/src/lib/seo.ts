import { useEffect } from "react";

type PageMeta = {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
};

const DEFAULT_DESCRIPTION =
  "Auto Wiki je enciklopedija automobila s modelima, generacijama, motornim varijantama, specifikacijama i blog člancima.";

export function usePageMeta({ title, description = DEFAULT_DESCRIPTION, image, type = "website" }: PageMeta) {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, "property");
    setMeta("og:description", description, "property");
    setMeta("og:type", type, "property");
    setMeta("og:url", window.location.href, "property");

    if (image) {
      setMeta("og:image", image, "property");
    }
  }, [description, image, title, type]);
}

function setMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}
