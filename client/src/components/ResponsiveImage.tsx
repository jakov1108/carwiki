import { useEffect, useRef, useState } from "react";
import type { ImgHTMLAttributes, SyntheticEvent } from "react";
import { getResponsiveImageProps } from "../lib/images";

interface ResponsiveImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> {
  src: string;
  targetWidth?: number;
  responsiveWidths?: number[];
  quality?: number;
  resize?: "cover" | "contain" | "fill";
}

export default function ResponsiveImage({
  src,
  targetWidth,
  responsiveWidths,
  sizes,
  quality,
  resize,
  className,
  onLoad,
  onError,
  ...imgProps
}: ResponsiveImageProps) {
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const imageProps = getResponsiveImageProps(src, {
    width: targetWidth,
    widths: responsiveWidths,
    sizes,
    quality,
    resize,
  });

  const hasSrc = imageProps.src.length > 0;
  const isLoaded = loadedSrc === imageProps.src;
  const hasError = failedSrc === imageProps.src || !hasSrc;
  const imageStateClass = hasError
    ? "responsive-image-error"
    : isLoaded
      ? "responsive-image-loaded"
      : "responsive-image-loading";

  useEffect(() => {
    const image = imageRef.current;

    if (!hasSrc) {
      setLoadedSrc(null);
      return;
    }

    if (image?.complete && image.naturalWidth > 0) {
      setLoadedSrc(imageProps.src);
      setFailedSrc(null);
    }
  }, [hasSrc, imageProps.src, imageProps.srcSet]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    setLoadedSrc(imageProps.src);
    setFailedSrc(null);
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement>) => {
    setLoadedSrc(null);
    setFailedSrc(imageProps.src);
    onError?.(event);
  };

  return (
    <img
      {...imgProps}
      ref={imageRef}
      src={imageProps.src}
      srcSet={imageProps.srcSet}
      sizes={imageProps.sizes}
      className={["responsive-image", imageStateClass, className].filter(Boolean).join(" ")}
      data-image-state={hasError ? "error" : isLoaded ? "loaded" : "loading"}
      onLoad={handleLoad}
      onError={handleError}
    />
  );
}
