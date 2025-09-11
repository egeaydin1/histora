'use client'

import { Character } from '@/types'
import { cn } from '@/lib/utils'
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { Avatar } from '@/components/ui/Avatar'
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
            <Avatar 
              src={character.avatar_url}
              alt={character.name}
              name={character.name}
              characterId={character.id}
              size="md"
            />
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
