'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// 定义语言类型
export type Language = 'zh' | 'en'

// 语言上下文接口
interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: string) => string // 翻译函数
  isLoading: boolean
}

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 翻译字典
const translations: Record<Language, Record<string, string>> = {
  zh: {
    // 通用
    'app.name': 'Cal AI',
    'app.new_chat': '新建聊天',
    'app.loading': '加载中...',
    'app.no_records': '暂无聊天记录，点击上方按钮创建新对话',
    'app.today': '今天',
    'app.yesterday': '昨天',
    
    // 聊天
    'chat.ai_thinking': 'AI正在思考中...',
    'chat.type_message': '输入消息...',
    'chat.send': '发送',
    'chat.new_conversation': '新对话',
    
    // 设置
    'settings.title': '设置',
    'settings.back': '返回',
    'settings.api_key': 'OpenAI API Key',
    'settings.api_key_custom': '已设置自定义API Key',
    'settings.api_key_default': '使用系统默认API Key',
    'settings.api_key_placeholder': '输入您的OpenAI API Key',
    'settings.save': '保存',
    'settings.saving': '保存中...',
    'settings.save_success': 'API Key 保存成功',
    'settings.save_failed': '保存失败',
    'settings.api_key_cleared': 'API Key 已清空，将使用系统默认Key',
    'settings.theme': '主题',
    'settings.theme_desc': '调整界面外观',
    'settings.theme_light': '浅色',
    'settings.theme_dark': '深色',
    'settings.theme_system': '跟随系统',
    'settings.language': '语言',
    'settings.language_desc': '选择界面语言',
    'settings.streaming': '流式生成',
    'settings.streaming_desc': '实时显示AI回答过程',
    'settings.streaming_on': '开启',
    'settings.streaming_off': '关闭',
    
    // 日期
    'date.month_day': '{0}月{1}日',
    
    // 错误
    'error.fetch_session': '获取会话失败，请尝试刷新页面',
    'error.send_message': '发送消息失败，请重试',
  },
  en: {
    // General
    'app.name': 'Cal AI',
    'app.new_chat': 'New Chat',
    'app.loading': 'Loading...',
    'app.no_records': 'No chat records, click the button above to create a new conversation',
    'app.today': 'Today',
    'app.yesterday': 'Yesterday',
    
    // Chat
    'chat.ai_thinking': 'AI is thinking...',
    'chat.type_message': 'Type a message...',
    'chat.send': 'Send',
    'chat.new_conversation': 'New Conversation',
    
    // Settings
    'settings.title': 'Settings',
    'settings.back': 'Back',
    'settings.api_key': 'OpenAI API Key',
    'settings.api_key_custom': 'Custom API Key is set',
    'settings.api_key_default': 'Using system default API Key',
    'settings.api_key_placeholder': 'Enter your OpenAI API Key',
    'settings.save': 'Save',
    'settings.saving': 'Saving...',
    'settings.save_success': 'API Key saved successfully',
    'settings.save_failed': 'Save failed',
    'settings.api_key_cleared': 'API Key cleared, will use system default Key',
    'settings.theme': 'Theme',
    'settings.theme_desc': 'Adjust the appearance',
    'settings.theme_light': 'Light',
    'settings.theme_dark': 'Dark',
    'settings.theme_system': 'System',
    'settings.language': 'Language',
    'settings.language_desc': 'Select interface language',
    'settings.streaming': 'Streaming Generation',
    'settings.streaming_desc': 'Show AI response in real-time',
    'settings.streaming_on': 'On',
    'settings.streaming_off': 'Off',
    
    // Date
    'date.month_day': '{0}/{1}',
    
    // Errors
    'error.fetch_session': 'Failed to fetch session, please try refreshing the page',
    'error.send_message': 'Failed to send message, please try again',
  }
}

// 格式化翻译字符串中的参数
const formatString = (str: string, ...args: any[]): string => {
  return str.replace(/{(\d+)}/g, (match, number) => {
    return typeof args[number] !== 'undefined' ? args[number] : match
  })
}

// 提供者组件
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('zh')
  const [isLoading, setIsLoading] = useState(true)
  
  // 在组件加载时从API获取用户语言设置
  useEffect(() => {
    const fetchLanguage = async () => {
      try {
        const response = await fetch('/api/config/language')
        if (response.ok) {
          const data = await response.json()
          setLanguageState(data.language as Language)
        }
      } catch (error) {
        console.error('获取语言设置失败:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchLanguage()
  }, [])
  
  // 更新语言设置
  const setLanguage = async (newLang: Language) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/config/language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ language: newLang }),
      })
      
      if (response.ok) {
        setLanguageState(newLang)
      }
    } catch (error) {
      console.error('保存语言设置失败:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // 翻译函数
  const t = (key: string, ...args: any[]): string => {
    const translation = translations[language][key] || key
    return args.length ? formatString(translation, ...args) : translation
  }
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  )
}

// 使用语言上下文的自定义钩子
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
} 