import { createContext, useState, useEffect, ReactNode, useContext } from 'react'

// 类型定义
type StreamingContextType = {
  useStreaming: boolean
  setUseStreaming: (value: boolean) => Promise<void>
  isLoading: boolean
}

// 创建上下文
const StreamingContext = createContext<StreamingContextType | undefined>(undefined)

// 提供者组件
export const StreamingProvider = ({ children }: { children: ReactNode }) => {
  const [useStreaming, setStreamingState] = useState<boolean>(true)
  const [isLoading, setIsLoading] = useState(true)
  
  // 在组件加载时从API获取用户流式生成设置
  useEffect(() => {
    const fetchStreamingSetting = async () => {
      try {
        const response = await fetch('/api/config/streaming')
        if (response.ok) {
          const data = await response.json()
          setStreamingState(data.useStreaming)
        }
      } catch (error) {
        console.error('获取流式生成设置失败:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchStreamingSetting()
  }, [])
  
  // 更新流式生成设置
  const setUseStreaming = async (newValue: boolean) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/config/streaming', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ useStreaming: newValue }),
      })
      
      if (response.ok) {
        setStreamingState(newValue)
      }
    } catch (error) {
      console.error('保存流式生成设置失败:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <StreamingContext.Provider value={{ useStreaming, setUseStreaming, isLoading }}>
      {children}
    </StreamingContext.Provider>
  )
}

// 自定义Hook，便于在组件中使用
export const useStreaming = () => {
  const context = useContext(StreamingContext)
  if (context === undefined) {
    throw new Error('useStreaming must be used within a StreamingProvider')
  }
  return context
} 