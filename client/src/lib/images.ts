type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number;
  resize?: "cover" | "contain" | "fill";
};

type ResponsiveImageOptions = ImageTransformOptions & {
  widths?: number[];
  sizes?: string;
};

const DEFAULT_QUALITY = 80;
const ENABLE_SUPABASE_IMAGE_TRANSFORMS =
  import.meta.env.VITE_ENABLE_SUPABASE_IMAGE_TRANSFORMS === "true";

function isSupabaseStorageUrl(url: string) {
  return url.includes("/storage/v1/object/public/") || url.includes("/storage/v1/render/image/public/");
}

export function supportsResponsiveImageVariants(url?: string | null) {
  if (!url) {
    return false;
  }

  if (isSupabaseStorageUrl(url)) {
    return ENABLE_SUPABASE_IMAGE_TRANSFORMS;
  }

  return url.includes("images.unsplash.com") || (url.includes("wikimedia.org") && url.includes("/thumb/"));
}

function buildSupabaseImageUrl(url: string, options: ImageTransformOptions) {
  try {
    const imageUrl = new URL(url);

    if (imageUrl.pathname.includes("/storage/v1/object/public/")) {
      imageUrl.pathname = imageUrl.pathname.replace(
        "/storage/v1/object/public/",
        "/storage/v1/render/image/public/",
      );
    }

    if (options.width) {
      imageUrl.searchParams.set("width", String(options.width));
    }

    if (options.height) {
      imageUrl.searchParams.set("height", String(options.height));
    }

    imageUrl.searchParams.set("quality", String(options.quality ?? DEFAULT_QUALITY));

    if (options.resize) {
      imageUrl.searchParams.set("resize", options.resize);
    }

    return imageUrl.toString();
  } catch {
    return url;
  }
}

function buildUnsplashImageUrl(url: string, options: ImageTransformOptions) {
  try {
    const imageUrl = new URL(url);

    if (options.width) {
      imageUrl.searchParams.set("w", String(options.width));
    }

    if (options.height) {
      imageUrl.searchParams.set("h", String(options.height));
    }

    imageUrl.searchParams.set("q", String(options.quality ?? DEFAULT_QUALITY));
    imageUrl.searchParams.set("auto", "format");

    if (options.resize === "contain") {
      imageUrl.searchParams.set("fit", "max");
    } else if (options.resize) {
      imageUrl.searchParams.set("fit", "crop");
    }

    return imageUrl.toString();
  } catch {
    return url;
  }
}

function buildWikimediaImageUrl(url: string, width?: number) {
  if (!width || !url.includes("wikimedia.org") || !url.includes("/thumb/")) {
    return url;
  }

  return url.replace(/\/\d+px-/, `/${width}px-`);
}

export function getOptimizedImageUrl(url?: string | null, options: ImageTransformOptions = {}) {
  if (!url) {
    return "";
  }

  if (isSupabaseStorageUrl(url)) {
    return ENABLE_SUPABASE_IMAGE_TRANSFORMS
      ? buildSupabaseImageUrl(url, options)
      : url;
  }

  if (url.includes("images.unsplash.com")) {
    return buildUnsplashImageUrl(url, options);
  }

  if (url.includes("wikimedia.org")) {
    return buildWikimediaImageUrl(url, options.width);
  }

  return url;
}

export function getImageSrcSet(
  url?: string | null,
  widths: number[] = [400, 640, 800, 1280],
  options: Omit<ImageTransformOptions, "width"> = {},
) {
  if (!url || !supportsResponsiveImageVariants(url)) {
    return "";
  }

  return widths
    .map((width) => `${getOptimizedImageUrl(url, { ...options, width })} ${width}w`)
    .join(", ");
}

export function getResponsiveImageProps(
  url?: string | null,
  {
    width,
    widths = [400, 640, 800, 1280],
    sizes,
    ...options
  }: ResponsiveImageOptions = {},
) {
  const src = getOptimizedImageUrl(url, { width, ...options });
  const srcSet = getImageSrcSet(url, widths, options);

  return {
    src,
    srcSet: srcSet || undefined,
    sizes: srcSet ? sizes : undefined,
  };
}

export function getOptimizedGalleryImages(
  images: Array<string | null | undefined>,
  options: ImageTransformOptions = {},
) {
  const uniqueImages = Array.from(
    new Set(images.filter((image): image is string => typeof image === "string" && image.length > 0)),
  );

  return uniqueImages.map((image) => getOptimizedImageUrl(image, options));
}
