'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      try {
        // 初始化数据库
        await fetch('/api/init')
        
        // 获取会话列表
        const response = await fetch('/api/sessions')
        const sessions = await response.json()
        
        if (sessions.length > 0) {
          // 如果有会话，重定向到最新的会话
          router.push(`/chat/${sessions[0].id}`)
        } else {
          // 如果没有会话，创建一个新会话
          const createResponse = await fetch('/api/sessions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: '新对话' }),
          })
          
          const newSession = await createResponse.json()
          router.push(`/chat/${newSession.id}`)
        }
      } catch (error) {
        console.error('初始化失败:', error)
        setError('应用初始化失败，请刷新页面重试')
      }
    }
    
    init()
  }, [router])

  return (
    <div className="flex items-center justify-center h-screen bg-[#1E1E1E] text-white">
      {error ? (
        <div className="bg-red-500 text-white p-4 rounded-md">
          {error}
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p>正在加载聊天...</p>
        </div>
      )}
    </div>
  )
}
