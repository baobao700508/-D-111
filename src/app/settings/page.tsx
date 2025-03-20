'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Moon, Sun, Globe, Key } from 'lucide-react'
import Link from 'next/link'
import { AppError } from '@/types/error'

interface SettingItemProps {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}

const SettingItem = ({ icon, title, description, children }: SettingItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-zinc-800">
      <div className="flex items-center gap-4">
        <div className="text-zinc-400">
          {icon}
        </div>
        <div>
          <h3 className="text-white font-medium">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>
      </div>
      <div>
        {children}
      </div>
    </div>
  )
}

const Settings = () => {
  const [theme, setTheme] = useState('dark')
  const [language, setLanguage] = useState('zh')
  const [openaiKey, setOpenaiKey] = useState('')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // 获取用户配置
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          setHasApiKey(data.hasApiKey);
        }
      } catch (error: unknown) {
        const appError = error as AppError;
        console.error('获取配置失败:', appError);
      }
    };

    fetchConfig();
  }, []);

  // 保存API Key
  const saveApiKey = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ openaiKey }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setHasApiKey(data.hasApiKey);
        setSuccessMessage('API Key 保存成功');
        
        // 如果用户清空了API Key，显示相应消息
        if (!openaiKey.trim()) {
          setSuccessMessage('API Key 已清空，将使用系统默认Key');
        }
      } else {
        const error = await response.json();
        setErrorMessage(error.error || '保存失败');
      }
    } catch (error: unknown) {
      const appError = error as AppError;
      setErrorMessage(appError.message || '保存失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      {/* 标题栏 */}
      <div className="h-16 border-b border-zinc-800 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span>返回</span>
        </Link>
        <h1 className="text-xl font-medium mx-auto">设置</h1>
      </div>

      {/* 设置选项 */}
      <div className="max-w-2xl mx-auto mt-8">
        {/* OpenAI API Key 设置 */}
        <SettingItem 
          icon={<Key size={20} />}
          title="OpenAI API Key"
          description={hasApiKey ? "已设置自定义API Key" : "使用系统默认API Key"}
        >
          <div className="flex flex-col gap-2 w-64">
            <input 
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder="输入您的OpenAI API Key"
              className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <button 
              onClick={saveApiKey}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
          </div>
        </SettingItem>

        <SettingItem 
          icon={theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          title="主题"
          description="调整界面外观"
        >
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">浅色</option>
            <option value="dark">深色</option>
            <option value="system">跟随系统</option>
          </select>
        </SettingItem>

        <SettingItem 
          icon={<Globe size={20} />}
          title="语言"
          description="选择界面语言"
        >
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
          </select>
        </SettingItem>
      </div>
    </div>
  )
}

export default Settings 