'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Moon, Sun, Globe, Key, Zap } from 'lucide-react'
import Link from 'next/link'
import { AppError } from '@/types/error'
import { useLanguage } from '@/contexts/LanguageContext'
import { useStreaming } from '@/contexts/StreamingContext'
import ToggleSwitch from '@/components/ui/ToggleSwitch'

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
  const { t, language, setLanguage } = useLanguage()
  const { useStreaming: streamingEnabled, setUseStreaming, isLoading: streamingLoading } = useStreaming()
  const [theme, setTheme] = useState('dark')
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
        setSuccessMessage(t('settings.save_success'));
        
        // 如果用户清空了API Key，显示相应消息
        if (!openaiKey.trim()) {
          setSuccessMessage(t('settings.api_key_cleared'));
        }
      } else {
        const error = await response.json();
        setErrorMessage(error.error || t('settings.save_failed'));
      }
    } catch (error: unknown) {
      const appError = error as AppError;
      setErrorMessage(appError.message || t('settings.save_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  // 处理语言切换
  const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value as 'zh' | 'en';
    await setLanguage(newLang);
  };

  // 处理流式生成切换
  const handleStreamingChange = async (newValue: boolean) => {
    await setUseStreaming(newValue);
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      {/* 标题栏 */}
      <div className="h-16 border-b border-zinc-800 flex items-center px-4">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
          <span>{t('settings.back')}</span>
        </Link>
        <h1 className="text-xl font-medium mx-auto">{t('settings.title')}</h1>
      </div>

      {/* 设置选项 */}
      <div className="max-w-2xl mx-auto mt-8">
        {/* OpenAI API Key 设置 */}
        <SettingItem 
          icon={<Key size={20} />}
          title={t('settings.api_key')}
          description={hasApiKey ? t('settings.api_key_custom') : t('settings.api_key_default')}
        >
          <div className="flex flex-col gap-2 w-64">
            <input 
              type="password"
              value={openaiKey}
              onChange={(e) => setOpenaiKey(e.target.value)}
              placeholder={t('settings.api_key_placeholder')}
              className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
            />
            <button 
              onClick={saveApiKey}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              {isLoading ? t('settings.saving') : t('settings.save')}
            </button>
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
          </div>
        </SettingItem>

        <SettingItem 
          icon={<Zap size={20} />}
          title={t('settings.streaming')}
          description={t('settings.streaming_desc')}
        >
          <ToggleSwitch
            checked={streamingEnabled}
            onChange={handleStreamingChange}
            onLabel={t('settings.streaming_on')}
            offLabel={t('settings.streaming_off')}
            disabled={streamingLoading}
          />
        </SettingItem>

        <SettingItem 
          icon={theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
          title={t('settings.theme')}
          description={t('settings.theme_desc')}
        >
          <select 
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="bg-zinc-800 text-white border border-zinc-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="light">{t('settings.theme_light')}</option>
            <option value="dark">{t('settings.theme_dark')}</option>
            <option value="system">{t('settings.theme_system')}</option>
          </select>
        </SettingItem>

        <SettingItem 
          icon={<Globe size={20} />}
          title={t('settings.language')}
          description={t('settings.language_desc')}
        >
          <select 
            value={language}
            onChange={handleLanguageChange}
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