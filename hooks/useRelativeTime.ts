import { useState, useEffect } from 'react'

/**
 * 相对时间Hook
 * @param date 日期对象或时间戳
 * @param updateInterval 更新间隔（毫秒）
 * @returns 相对时间字符串
 */
export function useRelativeTime(
  date: Date | number | string,
  updateInterval: number = 60000 // 默认每分钟更新一次
): string {
  const [relativeTime, setRelativeTime] = useState<string>('')

  useEffect(() => {
    const calculateRelativeTime = () => {
      // 处理null、undefined或无效日期的情况
      if (!date) {
        setRelativeTime('未知时间')
        return
      }

      const targetDate =
        typeof date === 'string' ? new Date(date) : typeof date === 'number' ? new Date(date) : date

      // 检查日期是否有效
      if (isNaN(targetDate.getTime())) {
        setRelativeTime('无效时间')
        return
      }

      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000)

      if (diffInSeconds < 60) {
        setRelativeTime('刚刚')
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60)
        setRelativeTime(`${minutes}分钟前`)
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600)
        setRelativeTime(`${hours}小时前`)
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400)
        setRelativeTime(`${days}天前`)
      } else if (diffInSeconds < 31536000) {
        const months = Math.floor(diffInSeconds / 2592000)
        setRelativeTime(`${months}个月前`)
      } else {
        const years = Math.floor(diffInSeconds / 31536000)
        setRelativeTime(`${years}年前`)
      }
    }

    // 立即计算一次
    calculateRelativeTime()

    // 设置定时更新
    if (updateInterval > 0) {
      const interval = setInterval(calculateRelativeTime, updateInterval)
      return () => clearInterval(interval)
    }
  }, [date, updateInterval])

  return relativeTime
}
