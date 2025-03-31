'use client'

import { useState, FormEvent } from 'react'
import { Send } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface MessageInputProps {
  onSendMessage: (message: string) => void
}

const MessageInput = ({ onSendMessage }: MessageInputProps) => {
  const { t } = useLanguage()
  const [message, setMessage] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
    }
  }

  return (
    <div className="border-t border-zinc-800 bg-[#1E1E1E] p-4">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={t('chat.type_message')}
          className="flex-1 bg-[#3D3D3D] text-white rounded-md px-4 py-3 focus:outline-none"
        />
        <button 
          type="submit" 
          className="bg-[#0066FF] text-white p-3 rounded-md hover:bg-blue-600 transition-colors"
          disabled={!message.trim()}
          aria-label={t('chat.send')}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  )
}

export default MessageInput 