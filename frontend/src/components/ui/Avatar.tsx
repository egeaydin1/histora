'use client'

import { useState, useEffect } from 'react'
import { cn, getInitials } from '@/lib/utils'

interface AvatarProps {
  src?: string
  alt: string
  name: string
  characterId?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
  fallbackClassName?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-xl',
  '2xl': 'w-32 h-32 text-2xl'
}

// Generate consistent colors for characters based on their name
const getCharacterColor = (name: string) => {
  const colors = [
    'from-blue-500 to-purple-600',
    'from-green-500 to-teal-600', 
    'from-orange-500 to-red-600',
    'from-purple-500 to-pink-600',
    'from-indigo-500 to-blue-600',
    'from-teal-500 to-green-600',
    'from-red-500 to-orange-600',
    'from-pink-500 to-purple-600'
  ]
  
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

export function Avatar({ 
  src, 
  alt, 
  name, 
  characterId,
  size = 'md', 
  className,
  fallbackClassName 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [finalSrc, setFinalSrc] = useState<string | undefined>(src)

  useEffect(() => {
    setImageError(false)
    setImageLoaded(false)
    
    // Try multiple avatar sources in priority order
    const tryAvatarSources = async () => {
      const sources = [
        src, // Original provided source
        characterId ? `/avatars/${characterId}.svg` : undefined,
        characterId ? `/avatars/${characterId}.jpg` : undefined,
        characterId ? `/avatars/${characterId}.png` : undefined,
        characterId ? `/avatars/${characterId.split('-')[0]}.svg` : undefined // fallback to base name
      ].filter(Boolean)
      
      for (const source of sources) {
        try {
          const response = await fetch(source as string, { method: 'HEAD' })
          if (response.ok) {
            setFinalSrc(source as string)
            return
          }
        } catch {
          // Continue to next source
        }
      }
      
      // No valid avatar found, use fallback
      setFinalSrc(undefined)
      setImageError(true)
    }

    if (src || characterId) {
      tryAvatarSources()
    } else {
      setFinalSrc(undefined)
      setImageError(true)
    }
  }, [src, characterId])

  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const shouldShowImage = finalSrc && !imageError
  const initials = getInitials(name)
  const colorClass = getCharacterColor(name)

  return (
    <div className={cn(
      "relative rounded-full overflow-hidden flex items-center justify-center bg-gray-100",
      sizeClasses[size],
      className
    )}>
      {shouldShowImage && (
        <img
          src={finalSrc}
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
        "absolute inset-0 bg-gradient-to-br flex items-center justify-center text-white font-bold transition-opacity duration-200",
        shouldShowImage && imageLoaded ? "opacity-0" : "opacity-100",
        colorClass,
        fallbackClassName
      )}>
        {initials}
      </div>
      
      {/* Loading state */}
      {shouldShowImage && !imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
      )}
    </div>
  )
}