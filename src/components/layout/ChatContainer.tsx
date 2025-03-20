'use client'

import { ReactNode } from 'react'
import Header from '@/components/layout/Header'

interface ChatContainerProps {
  title: string
  children: ReactNode
}

const ChatContainer = ({ title, children }: ChatContainerProps) => {
  return (
    <div className="flex flex-col h-screen bg-[#1E1E1E] flex-1">
      {/* 顶部标题区域 */}
      <Header title={title} />
      
      {/* 聊天内容区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        {children}
      </div>
    </div>
  )
}

export default ChatContainer 