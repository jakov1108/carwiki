import type { ImgHTMLAttributes } from "react";
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
  ...imgProps
}: ResponsiveImageProps) {
  const imageProps = getResponsiveImageProps(src, {
    width: targetWidth,
    widths: responsiveWidths,
    sizes,
    quality,
    resize,
  });

  return (
    <img
      {...imgProps}
      src={imageProps.src}
      srcSet={imageProps.srcSet}
      sizes={imageProps.sizes}
    />
  );
}
