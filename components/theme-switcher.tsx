'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Contrast, Laptop, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { createThemeUtils, type ThemeMode } from '@/lib/lowcode/design-system'

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false)
  const { theme: nextTheme, setTheme: setNextTheme } = useTheme()
  const { initTheme, getSavedTheme } = createThemeUtils()

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true)
    // 初始化设计系统主题
    const savedTheme = getSavedTheme()
    if (savedTheme) {
      initTheme(savedTheme)
    }
  }, [initTheme, getSavedTheme])

  if (!mounted) {
    return null
  }

  const ICON_SIZE = 16

  // 处理主题切换
  const handleThemeChange = (newTheme: string) => {
    setNextTheme(newTheme)

    // 如果是高对比度主题，需要特殊处理
    if (newTheme === 'high-contrast') {
      initTheme('high-contrast')
    } else if (newTheme === 'system') {
      // 系统主题需要检测用户偏好
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      initTheme(prefersDark ? 'dark' : 'light')
    } else {
      initTheme(newTheme as ThemeMode)
    }
  }

  // 获取当前主题的图标
  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <Sun size={ICON_SIZE} className={'text-muted-foreground'} />
      case 'dark':
        return <Moon size={ICON_SIZE} className={'text-muted-foreground'} />
      case 'high-contrast':
        return <Contrast size={ICON_SIZE} className={'text-muted-foreground'} />
      default:
        return <Laptop size={ICON_SIZE} className={'text-muted-foreground'} />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={'sm'}>
          {getThemeIcon(nextTheme || 'system')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-content" align="start">
        <DropdownMenuRadioGroup value={nextTheme} onValueChange={handleThemeChange}>
          <DropdownMenuRadioItem className="flex gap-2" value="light">
            <Sun size={ICON_SIZE} className="text-muted-foreground" /> <span>明亮</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="dark">
            <Moon size={ICON_SIZE} className="text-muted-foreground" /> <span>暗黑</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="high-contrast">
            <Contrast size={ICON_SIZE} className="text-muted-foreground" /> <span>高对比度</span>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem className="flex gap-2" value="system">
            <Laptop size={ICON_SIZE} className="text-muted-foreground" /> <span>跟随系统</span>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ThemeSwitcher }
