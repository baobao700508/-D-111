'use client'

import { useState, useEffect } from 'react'
import { Settings, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { TranslateFunction } from '@/types'

// 侧边栏聊天历史项组件
const SidebarItem = ({ 
  date, 
  title, 
  isActive = false,
  onDelete,
  id
}: { 
  date: string, 
  title: string, 
  isActive?: boolean,
  onDelete?: () => void,
  id: string
}) => {
  const router = useRouter()
  const [showDelete, setShowDelete] = useState(false)

  return (
    <div 
      className={`flex flex-col p-3 rounded-md cursor-pointer transition-colors relative ${
        isActive ? 'bg-zinc-700' : 'hover:bg-zinc-700'
      }`}
      onClick={() => router.push(`/chat/${id}`)}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      <span className="text-xs text-zinc-400">{date}</span>
      <span className="text-sm text-white truncate">{title}</span>
      
      {showDelete && onDelete && (
        <button 
          className="absolute right-2 top-2 text-zinc-400 hover:text-white p-1"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  )
}

// 分组标题组件
const GroupTitle = ({ title }: { title: string }) => {
  return (
    <div className="px-3 py-2">
      <span className="text-xs font-medium text-zinc-400">{title}</span>
    </div>
  )
}

// 定义聊天项的类型
interface ChatItem {
  id: string
  title: string
  updatedAt: string
}

// 格式化日期函数
const formatDate = (dateString: string, t: TranslateFunction) => {
  const date = new Date(dateString)
  const now = new Date()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  
  // 今天
  if (date.toDateString() === now.toDateString()) {
    return t('app.today')
  }
  
  // 昨天
  if (date.toDateString() === yesterday.toDateString()) {
    return t('app.yesterday')
  }
  
  // 其他日期
  return t('date.month_day', date.getMonth() + 1, date.getDate())
}

// 根据日期对聊天会话进行分组
const groupChatsByDate = (chats: ChatItem[], t: TranslateFunction) => {
  const groups: Record<string, ChatItem[]> = {}
  
  chats.forEach(chat => {
    const date = formatDate(chat.updatedAt, t)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(chat)
  })
  
  return Object.entries(groups)
}

const Sidebar = () => {
  const { t } = useLanguage()
  const [chatSessions, setChatSessions] = useState<ChatItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  
  // 获取当前活跃的聊天会话ID
  const currentChatId = pathname.startsWith('/chat/') 
    ? pathname.split('/chat/')[1] 
    : null
  
  // 获取所有聊天会话
  const fetchChatSessions = async () => {
    try {
      const response = await fetch('/api/sessions')
      if (response.ok) {
        const data = await response.json()
        setChatSessions(data)
      }
    } catch (error) {
      console.error('获取聊天会话失败:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 初次加载和currentChatId变化时获取会话
  useEffect(() => {
    fetchChatSessions()
  }, [currentChatId])
  
  // 设置定期刷新会话
  useEffect(() => {
    // 初次加载
    fetchChatSessions()
    
    // 设置间隔刷新 (每3秒刷新一次)
    const intervalId = setInterval(() => {
      fetchChatSessions()
    }, 3000)
    
    // 添加标题更新事件监听
    const handleTitleUpdate = (event: CustomEvent) => {
      const { id, title } = event.detail;
      // 直接更新指定会话的标题
      setChatSessions(prev => prev.map(session => 
        session.id === id ? { ...session, title } : session
      ));
    };
    
    // 添加事件监听
    window.addEventListener('chat-title-updated', handleTitleUpdate as EventListener);
    
    // 清理定时器和事件监听
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('chat-title-updated', handleTitleUpdate as EventListener);
    }
  }, [])
  
  // 创建新聊天
  const createNewChat = async () => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: t('chat.new_conversation') }),
      })
      
      if (response.ok) {
        const newSession = await response.json()
        setChatSessions(prev => [newSession, ...prev])
        router.push(`/chat/${newSession.id}`)
      }
    } catch (error) {
      console.error('创建新聊天失败:', error)
    }
  }
  
  // 删除聊天会话
  const deleteChat = async (id: string) => {
    if (!confirm('确定要删除此对话吗？')) return
    
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setChatSessions(prev => prev.filter(session => session.id !== id))
        if (currentChatId === id) {
          router.push('/')
        }
      }
    } catch (error) {
      console.error('删除会话失败:', error)
    }
  }

  // 按日期分组聊天会话
  const groupedChats = groupChatsByDate(chatSessions, t)

  return (
    <div className="w-64 h-screen bg-[#252526] flex flex-col">
      {/* 顶部Logo和设置区域 */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <div className="flex items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">{t('app.name')}</span>
        </div>
        <Link href="/settings" className="text-zinc-400 hover:text-white transition-colors">
          <Settings size={20} />
        </Link>
      </div>

      {/* 新建聊天按钮 */}
      <div className="p-3">
        <button 
          onClick={createNewChat}
          className="w-full flex items-center justify-center gap-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-md py-2 px-4 transition-colors"
        >
          <Plus size={16} />
          <span>{t('app.new_chat')}</span>
        </button>
      </div>

      {/* 聊天历史列表 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-20 text-zinc-400">
            {t('app.loading')}
          </div>
        ) : chatSessions.length === 0 ? (
          <div className="flex justify-center items-center h-20 text-zinc-400 text-sm px-4 text-center">
            {t('app.no_records')}
          </div>
        ) : (
          groupedChats.map(([date, chats]) => (
            <div key={date} className="mb-2">
              <GroupTitle title={date} />
              <div className="space-y-1 px-2">
                {chats.map((chat) => (
                  <SidebarItem 
                    key={chat.id}
                    id={chat.id}
                    date={date}
                    title={chat.title}
                    isActive={currentChatId === chat.id}
                    onDelete={() => deleteChat(chat.id)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Sidebar 