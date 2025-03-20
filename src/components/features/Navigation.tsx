'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationItem {
  path: string
  label: string
}

interface NavigationProps {
  items: NavigationItem[]
}

const Navigation = ({ items }: NavigationProps) => {
  const pathname = usePathname()
  
  return (
    <nav className="flex">
      {items.map((item) => {
        const isActive = pathname === item.path
        
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`px-4 py-2 text-sm transition-colors ${
              isActive 
                ? 'text-white border-b-2 border-white' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export default Navigation 