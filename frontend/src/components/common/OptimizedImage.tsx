interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  className = "",
  loading,
  priority = false,
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={
        loading ?? (priority ? "eager" : "lazy")
      }
      decoding="async"
    />
  );
}