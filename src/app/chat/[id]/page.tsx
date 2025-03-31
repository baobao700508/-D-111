'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useParams } from 'next/navigation'
import ChatContainer from '@/components/layout/ChatContainer'
import MessageList, { Message } from '@/components/features/MessageList'
import MessageInput from '@/components/features/MessageInput'
import { AppError } from '@/types/error'
import { useLanguage } from '@/contexts/LanguageContext'

// 定义会话消息类型
interface SessionMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: string | Date;
  chatSessionId: string;
}

export default function ChatPage() {
  const { t } = useLanguage()
  // 获取动态参数
  const params = useParams()
  const chatSessionId = params.id as string
  
  // 状态
  const [messages, setMessages] = useState<Message[]>([])
  const [title, setTitle] = useState(t('chat.new_conversation'))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useStreaming, setUseStreaming] = useState(true) // 是否使用流式生成
  
  // 获取会话和消息
  useEffect(() => {
    const fetchChatSession = async () => {
      if (!chatSessionId) return
      
      try {
        const response = await fetch(`/api/sessions/${chatSessionId}`)
        
        if (!response.ok) {
          throw new Error(t('error.fetch_session'))
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
        setError(t('error.fetch_session'))
      }
    }
    
    fetchChatSession()
  }, [chatSessionId, t])
  
  // 处理发送消息 - 流式响应
  const handleStreamMessage = async (content: string) => {
    // 创建用户消息
    const userMessage: Message = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // 判断是否是第一次对话（当前只有一条欢迎消息）
    const isFirstConversation = messages.length === 1 && messages[0].sender === 'ai' && messages[0].content === 'conversation start';
    
    // 更新UI，显示用户消息
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)
    
    try {
      // 使用流式API
      const response = await fetch('/api/chat/stream', {
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
        throw new Error(t('error.send_message'))
      }
      
      // 创建AI消息，初始内容为空
      const aiMessage: Message = {
        id: uuidv4(),
        content: '',
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      // 添加AI消息到列表
      setMessages(prev => [...prev, aiMessage])
      
      // 处理Server-Sent Events流
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      
      if (reader) {
        let done = false
        
        while (!done) {
          const { done: isDone, value } = await reader.read()
          done = isDone
          
          if (done) break
          
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n\n')
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.replace('data: ', ''))
                
                if (data.content) {
                  // 更新AI消息内容
                  setMessages(prev => 
                    prev.map(msg => 
                      msg.id === aiMessage.id 
                        ? {...msg, content: msg.content + data.content} 
                        : msg
                    )
                  )
                }
                
                if (data.done) {
                  // 消息完成，如果是第一次对话，处理标题生成
                  if (isFirstConversation) {
                    try {
                      // 获取最新消息内容
                      const updatedMessages = messages
                        .concat(userMessage)
                        .concat({...aiMessage, content: aiMessage.content})
                      
                      // 调用API生成并更新标题
                      const titleResponse = await fetch(`/api/sessions/${chatSessionId}/generate-title`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          messages: [userMessage, aiMessage].map(msg => ({
                            content: msg.content,
                            sender: msg.sender
                          }))
                        }),
                      })
                      
                      if (titleResponse.ok) {
                        const titleData = await titleResponse.json()
                        // 更新本地状态
                        setTitle(titleData.title)
                        
                        // 手动触发全局会话刷新
                        try {
                          // 触发会话数据刷新的事件
                          const event = new CustomEvent('chat-title-updated', { 
                            detail: { id: chatSessionId, title: titleData.title } 
                          })
                          window.dispatchEvent(event)
                        } catch (eventError) {
                          console.error('触发标题更新事件失败:', eventError)
                        }
                      }
                    } catch (titleError) {
                      console.error('更新会话标题失败:', titleError)
                    }
                  }
                }
                
                if (data.error) {
                  throw new Error(data.error)
                }
              } catch (parseError) {
                console.error('解析流数据失败:', parseError)
              }
            }
          }
        }
      }
    } catch (error: unknown) {
      const appError = error as AppError
      console.error('流式消息处理错误:', appError)
      setError(appError.message || t('error.send_message'))
    } finally {
      setIsLoading(false)
    }
  }
  
  // 处理发送消息 - 标准响应（保留原来的实现作为备选）
  const handleSendMessage = async (content: string) => {
    // 如果启用流式响应，使用流式处理函数
    if (useStreaming) {
      return handleStreamMessage(content)
    }
    
    // 以下是原来的非流式实现
    // 创建用户消息
    const userMessage: Message = {
      id: uuidv4(),
      content,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    
    // 判断是否是第一次对话（当前只有一条欢迎消息）
    const isFirstConversation = messages.length === 1 && messages[0].sender === 'ai' && messages[0].content === 'conversation start';
    
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
        throw new Error(t('error.send_message'))
      }
      
      const data = await response.json()
      
      // 添加AI回复
      const aiMessage: Message = {
        id: uuidv4(),
        content: data.aiResponse,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      const updatedMessages = [...messages, userMessage, aiMessage];
      setMessages(updatedMessages);
      
      // 如果是第一次对话，使用AI生成主题并更新
      if (isFirstConversation) {
        try {
          // 调用API生成并更新标题
          const titleResponse = await fetch(`/api/sessions/${chatSessionId}/generate-title`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [userMessage, aiMessage].map(msg => ({
                content: msg.content,
                sender: msg.sender
              }))
            }),
          });
          
          if (titleResponse.ok) {
            const titleData = await titleResponse.json();
            // 更新本地状态
            setTitle(titleData.title);
            
            // 手动触发全局会话刷新
            try {
              // 触发会话数据刷新的事件
              const event = new CustomEvent('chat-title-updated', { 
                detail: { id: chatSessionId, title: titleData.title } 
              });
              window.dispatchEvent(event);
            } catch (eventError) {
              console.error('触发标题更新事件失败:', eventError);
            }
          }
        } catch (titleError) {
          console.error('更新会话标题失败:', titleError);
          // 标题更新失败不影响主流程
        }
      }
    } catch (error: unknown) {
      const appError = error as AppError;
      console.error('发送消息错误:', appError)
      setError(appError.message || t('error.send_message'))
    } finally {
      setIsLoading(false)
    }
  }
  
  // 切换流式生成模式
  const toggleStreaming = () => {
    setUseStreaming(prev => !prev)
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
          <div className="flex justify-end mb-2 mx-4">
            <button 
              onClick={toggleStreaming}
              className={`text-xs px-2 py-1 rounded ${useStreaming ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              {useStreaming ? '流式生成: 开启' : '流式生成: 关闭'}
            </button>
          </div>
          <MessageList messages={messages} />
          {isLoading && (
            <div className="flex justify-center my-4">
              <div className="animate-pulse text-zinc-400">{t('chat.ai_thinking')}</div>
            </div>
          )}
        </div>
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </ChatContainer>
  )
} 