'use client'

import { useState } from 'react'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackClassName?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-xl'
}

export function Avatar({ 
  src, 
  alt, 
  name, 
  size = 'md', 
  className,
  fallbackClassName 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const shouldShowImage = src && !imageError
  const initials = getInitials(name)

  return (
    <div className={cn(
      "relative rounded-full overflow-hidden flex items-center justify-center",
      sizeClasses[size],
      className
    )}>
      {shouldShowImage && (
        <img
          src={src}
          alt={alt}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-200",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}
      
      {/* Fallback with initials */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold transition-opacity duration-200",
        shouldShowImage && imageLoaded ? "opacity-0" : "opacity-100",
        fallbackClassName
      )}>
        {initials}
      </div>
    </div>
  )
}