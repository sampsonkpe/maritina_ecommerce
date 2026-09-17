import { useState } from "react";
import { ImageOff } from "lucide-react";

import type { ImgHTMLAttributes, SyntheticEvent, } from "react";

interface OptimizedImageProps
  extends ImgHTMLAttributes<HTMLImageElement> {
  priority?: boolean;
  fallbackClassName?: string;
}

export default function OptimizedImage({
  src,
  alt = "",
  className = "",
  loading,
  priority = false,
  fallbackClassName = "",
  onError,
  ...props
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = (
    event: SyntheticEvent<HTMLImageElement, Event>
  ) => {
    setHasError(true);
    onError?.(event);
  };

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-(--color-surface-muted) text-(--color-text-subtle) ${className} ${fallbackClassName}`}
      >
        <ImageOff
          size={28}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={loading ?? (priority ? "eager" : "lazy")}
      decoding="async"
      onError={handleError}
      {...props}
    />
  );
}