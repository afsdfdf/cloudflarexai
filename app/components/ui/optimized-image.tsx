"use client"

import Image, { ImageProps } from "next/image"
import { useState } from "react"

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  debug?: boolean
  useStaticFallback?: boolean
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  priority,
  className,
  style,
  sizes,
  quality,
  placeholder,
  debug = false,
  useStaticFallback = false,
  ...rest
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  
  // Fall back to a static image path if loading fails and useStaticFallback is true
  const imageSrc = error && useStaticFallback ? "/logo.png" : src
  
  if (debug && error) {
    console.log(`Image failed to load: ${src}`)
  }

  return (
    <Image
      src={imageSrc}
      alt={alt || ""}
      width={width}
      height={height}
      fill={fill}
      priority={priority}
      className={className}
      style={style}
      sizes={sizes}
      quality={quality || 75}
      placeholder={placeholder}
      onError={() => setError(true)}
      {...rest}
    />
  )
} 