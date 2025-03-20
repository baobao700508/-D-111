'use client'

import { Plus } from 'lucide-react'

interface HeaderProps {
  title: string
}

const Header = ({ title }: HeaderProps) => {
  return (
    <div className="h-16 bg-[#1E1E1E] border-b border-zinc-800 flex items-center justify-between px-4">
      {/* 标题区域 */}
      <div className="flex-1 flex justify-center">
        <h1 className="text-xl font-medium text-white">{title}</h1>
      </div>
      
      {/* 添加按钮 */}
      <button className="p-2 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
        <Plus size={20} />
      </button>
    </div>
  )
}

export default Header 