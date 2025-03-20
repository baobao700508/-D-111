'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useParams } from 'next/navigation'
import ChatContainer from '@/components/layout/ChatContainer'
import MessageList, { Message } from '@/components/features/MessageList'
import MessageInput from '@/components/features/MessageInput'
import { AppError } from '@/types/error'

// 定义会话消息类型
interface SessionMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string | Date;
  chatSessionId: string;
}

export default function ChatPage() {
  // 获取动态参数
  const params = useParams()
  const chatSessionId = params.id as string
  
  // 状态
  const [messages, setMessages] = useState<Message[]>([])
  const [title, setTitle] = useState('聊天中...')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // 获取会话和消息
  useEffect(() => {
    const fetchChatSession = async () => {
      if (!chatSessionId) return
      
      try {
        const response = await fetch(`/api/sessions/${chatSessionId}`)
        
        if (!response.ok) {
          throw new Error('获取会话失败')
        }
        
        const session = await response.json()
        setTitle(session.title)
        
        // 格式化消息
        if (session.messages && session.messages.length > 0) {
          const formattedMessages = session.messages.map((msg: SessionMessage) => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender as 'user' | 'ai',
            timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
          
          setMessages(formattedMessages)
        } else {
          // 如果没有消息，显示欢迎消息
          setMessages([
            {
              id: uuidv4(),
              content: 'conversation start',
              sender: 'ai',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ])
        }
      } catch (error: unknown) {
        const appError = error as AppError;
        console.error('获取会话失败:', appError)
        setError('获取会话失败，请尝试刷新页面')
      }
    }
    
    fetchChatSession()
  }, [chatSessionId])
  
  // 处理发送消息
  const handleSendMessage = async (content: string) => {
    // 创建用户消息
    const userMessage: Message = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // 更新UI
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    
    try {
      // 发送消息到API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          chatSessionId,
        }),
      })
      
      if (!response.ok) {
        throw new Error('发送消息失败')
      }
      
      const data = await response.json()
      
      // 添加AI回复
      const aiMessage: Message = {
        id: uuidv4(),
        content: data.aiResponse,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setMessages(prev => [...prev, aiMessage])
    } catch (error: unknown) {
      const appError = error as AppError;
      console.error('发送消息错误:', appError)
      setError(appError.message || '发送消息失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <ChatContainer title={title}>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto mb-4">
          {error && (
            <div className="bg-red-500 text-white p-3 rounded-md mb-4">
              {error}
            </div>
          )}
          <MessageList messages={messages} />
          {isLoading && (
            <div className="flex justify-center my-4">
              <div className="animate-pulse text-zinc-400">AI正在思考中...</div>
            </div>
          )}
        </div>
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </ChatContainer>
  )
} 