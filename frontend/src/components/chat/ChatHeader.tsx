'use client'

import { Character } from '@/types'
import { cn, getInitials } from '@/lib/utils'
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface ChatHeaderProps {
  character: Character
  isOnline?: boolean
  className?: string
}

export function ChatHeader({ character, isOnline = true, className }: ChatHeaderProps) {
  return (
    <div className={cn(
      "bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between",
      className
    )}>
      <div className="flex items-center space-x-3">
        <Link 
          href="/"
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {character.avatar_url ? (
                <img 
                  src={character.avatar_url} 
                  alt={character.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                getInitials(character.name)
              )}
            </div>
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div>
            <h1 className="text-lg font-semibold text-gray-900">
              {character.name}
            </h1>
            <p className="text-sm text-gray-500">
              {character.era} • {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
            </p>
          </div>
        </div>
      </div>

      <button className="text-gray-400 hover:text-gray-600 transition-colors">
        <InformationCircleIcon className="h-6 w-6" />
      </button>
    </div>
  )
}
