"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedAvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  src?: string | null
  alt?: string
  fallback: string
}

/**
 * Avatar otimizado com Next.js Image para fotos do Supabase Storage
 * Usa next/image quando src é válido, fallback caso contrário
 */
export const OptimizedAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  OptimizedAvatarProps
>(({ className, src, alt = "Avatar", fallback, ...props }, ref) => {
  const [imageError, setImageError] = React.useState(false)
  const isValidUrl = src && src.trim() !== '' && (src.startsWith('http') || src.startsWith('/'))

  return (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}
      {...props}
    >
      {isValidUrl && !imageError ? (
        <>
          <AvatarPrimitive.Image 
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
            onError={() => setImageError(true)}
            onLoad={() => console.log('Avatar loaded:', src)}
          />
          <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted">
            <span className="text-sm font-medium">{fallback}</span>
          </AvatarPrimitive.Fallback>
        </>
      ) : (
        <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center rounded-full bg-muted">
          <span className="text-sm font-medium">{fallback}</span>
        </AvatarPrimitive.Fallback>
      )}
    </AvatarPrimitive.Root>
  )
})

OptimizedAvatar.displayName = "OptimizedAvatar"
