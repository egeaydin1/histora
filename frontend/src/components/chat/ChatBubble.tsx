'use client'

import { formatTime } from '@/lib/utils'
import { ChatMessage } from '@/types'
import { cn } from '@/lib/utils'

interface ChatBubbleProps {
  message: ChatMessage
  isUser?: boolean
  className?: string
}

export function ChatBubble({ message, isUser, className }: ChatBubbleProps) {
  return (
    <div className={cn(
      "flex w-full mb-4",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl",
        "px-4 py-2 rounded-lg",
        "break-words",
        isUser 
          ? "bg-blue-600 text-white rounded-br-sm" 
          : "bg-white text-gray-900 border border-gray-200 rounded-bl-sm"
      )}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>
        <p className={cn(
          "text-xs mt-1",
          isUser ? "text-blue-100" : "text-gray-500"
        )}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  )
}
