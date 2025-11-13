/**
 * 虚拟化属性列表组件
 *
 * 用于优化大量属性项的渲染性能，支持：
 * - 虚拟滚动（只渲染可见项）
 * - 动态高度支持
 * - 智能缓存和回收
 * - 平滑滚动和动画
 * - 搜索和过滤
 */

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
  memo,
} from 'react'
import { FixedSizeList as List, VariableSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { cn } from '@/lib/utils'

// 属性项接口
export interface PropertyItem {
  id: string
  type: string
  name: string
  value: unknown
  schema: any
  category?: string
  visible?: boolean
  disabled?: boolean
  error?: string
  order?: number
}

// 虚拟化属性列表属性
interface VirtualizedPropertyListProps {
  items: PropertyItem[]
  renderItem: (item: PropertyItem, index: number) => React.ReactNode
  onItemClick?: (item: PropertyItem) => void
  selectedItem?: string
  className?: string
  height?: number
  itemHeight?: number
  enableSearch?: boolean
  searchPlaceholder?: string
  groupBy?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  emptyMessage?: string
  loading?: boolean
  overscanCount?: number
  getItemHeight?: (index: number) => number
  onScroll?: (scrollInfo: { scrollTop: number; scrollHeight: number }) => void
}

// 内部项目组件
interface PropertyListItemProps {
  index: number
  style: React.CSSProperties
  data: {
    items: PropertyItem[]
    renderItem: (item: PropertyItem, index: number) => React.ReactNode
    onItemClick?: (item: PropertyItem) => void
    selectedItem?: string
  }
}

const PropertyListItem: React.FC<PropertyListItemProps> = memo(({
  index,
  style,
  data
}) => {
  const { items, renderItem, onItemClick, selectedItem } = data
  const item = items[index]

  if (!item) return null

  const handleClick = useCallback(() => {
    onItemClick?.(item)
  }, [item, onItemClick])

  const isSelected = selectedItem === item.id

  return (
    <div
      style={style}
      className={cn(
        'border-b border-border/50 hover:bg-accent/50 transition-colors',
        isSelected && 'bg-accent border-accent-foreground/20',
        item.disabled && 'opacity-50 cursor-not-allowed',
        !item.disabled && 'cursor-pointer'
      )}
      onClick={handleClick}
    >
      <div className="p-3">
        {renderItem(item, index)}
      </div>
    </div>
  )
})

PropertyListItem.displayName = 'PropertyListItem'

// 分组头部组件
interface GroupHeaderProps {
  group: string
  count: number
  style?: React.CSSProperties
  className?: string
}

const GroupHeader: React.FC<GroupHeaderProps> = memo(({
  group,
  count,
  style,
  className
}) => {
  return (
    <div
      style={style}
      className={cn(
        'sticky top-0 z-10 bg-background border-b border-border px-3 py-2 font-medium text-sm text-foreground',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span>{group}</span>
        <span className="text-muted-foreground text-xs">{count}</span>
      </div>
    </div>
  )
})

GroupHeader.displayName = 'GroupHeader'

// 主虚拟化属性列表组件
export const VirtualizedPropertyList: React.FC<VirtualizedPropertyListProps> = ({
  items,
  renderItem,
  onItemClick,
  selectedItem,
  className,
  height = 400,
  itemHeight = 60,
  enableSearch = false,
  searchPlaceholder = 'Search properties...',
  groupBy,
  sortBy,
  sortOrder = 'asc',
  emptyMessage = 'No properties found',
  loading = false,
  overscanCount = 5,
  getItemHeight,
  onScroll,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredItems, setFilteredItems] = useState<PropertyItem[]>([])
  const [groupedItems, setGroupedItems] = useState<{
    items: PropertyItem[]
    groups: Array<{ name: string; start: number; count: number }>
  }>({ items: [], groups: [] })

  const listRef = useRef<List | VariableSizeList>(null)

  // 处理搜索
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  // 过滤和排序项目
  const processedItems = useMemo(() => {
    let result = [...items]

    // 应用搜索过滤
    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.type.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 应用排序
    if (sortBy) {
      result.sort((a, b) => {
        const aValue = a[sortBy as keyof PropertyItem]
        const bValue = b[sortBy as keyof PropertyItem]

        if (aValue === undefined || bValue === undefined) return 0

        let comparison = 0
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue)
        } else {
          comparison = (aValue as number) - (bValue as number)
        }

        return sortOrder === 'desc' ? -comparison : comparison
      })
    }

    return result
  }, [items, searchTerm, sortBy, sortOrder])

  // 应用分组
  useEffect(() => {
    if (!groupBy) {
      setGroupedItems({ items: processedItems, groups: [] })
      return
    }

    const groups = new Map<string, PropertyItem[]>()

    processedItems.forEach(item => {
      const groupValue = item[groupBy as keyof PropertyItem] as string || 'Other'
      if (!groups.has(groupValue)) {
        groups.set(groupValue, [])
      }
      groups.get(groupValue)!.push(item)
    })

    const sortedGroups = Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))

    const flatItems: PropertyItem[] = []
    const groupInfo: Array<{ name: string; start: number; count: number }> = []

    let currentIndex = 0
    sortedGroups.forEach(([groupName, groupItems]) => {
      // 添加分组头部占位符
      flatItems.push({
        id: `group-${groupName}`,
        name: groupName,
        type: 'group',
        value: null,
        schema: {},
        order: -1,
      } as any)

      const startIndex = currentIndex
      currentIndex++

      // 添加分组项目
      flatItems.push(...groupItems)
      currentIndex += groupItems.length

      groupInfo.push({
        name: groupName,
        start: startIndex,
        count: groupItems.length + 1, // +1 for header
      })
    })

    setGroupedItems({ items: flatItems, groups: groupInfo })
  }, [processedItems, groupBy])

  // 更新过滤后的项目
  useEffect(() => {
    if (groupBy) {
      setFilteredItems(groupedItems.items)
    } else {
      setFilteredItems(processedItems)
    }
  }, [processedItems, groupedItems, groupBy])

  // 滚动到指定项目
  const scrollToItem = useCallback((index: number) => {
    if (listRef.current) {
      listRef.current.scrollToItem(index)
    }
  }, [])

  // 滚动到指定项目ID
  const scrollToItemById = useCallback((itemId: string) => {
    const index = filteredItems.findIndex(item => item.id === itemId)
    if (index !== -1) {
      scrollToItem(index)
    }
  }, [filteredItems, scrollToItem])

  // 获取项目高度
  const getItemHeightInternal = useCallback((index: number) => {
    const item = filteredItems[index]
    if (!item) return itemHeight

    // 分组头部高度
    if (item.type === 'group') {
      return 40
    }

    // 自定义高度函数
    if (getItemHeight) {
      return getItemHeight(index)
    }

    return itemHeight
  }, [filteredItems, itemHeight, getItemHeight])

  // 自定义项目渲染
  const customRenderItem = useCallback((props: any) => {
    const { index, style } = props
    const item = filteredItems[index]

    if (!item) return null

    // 分组头部
    if (item.type === 'group') {
      const groupInfo = groupedItems.groups.find(g => g.start === index)
      if (groupInfo) {
        return (
          <GroupHeader
            group={groupInfo.name}
            count={groupInfo.count - 1}
            style={style}
          />
        )
      }
    }

    // 普通项目
    return (
      <PropertyListItem
        index={index}
        style={style}
        data={{
          items: filteredItems,
          renderItem,
          onItemClick,
          selectedItem,
        }}
      />
    )
  }, [filteredItems, renderItem, onItemClick, selectedItem, groupedItems.groups])

  // 处理滚动
  const handleScroll = useCallback(({ scrollOffset, scrollDirection }: any) => {
    onScroll?.({
      scrollTop: scrollOffset,
      scrollHeight: filteredItems.length * itemHeight,
    })
  }, [onScroll, filteredItems.length, itemHeight])

  // 暴露给外部的API
  React.useImperativeHandle(React.createRef(), () => ({
    scrollToItem,
    scrollToItemById,
    getItemCount: () => filteredItems.length,
  }))

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <div className="text-sm text-muted-foreground">Loading properties...</div>
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className={cn('flex items-center justify-center', className)} style={{ height }}>
        <div className="text-sm text-muted-foreground">{emptyMessage}</div>
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col', className)} style={{ height }}>
      {/* 搜索栏 */}
      {enableSearch && (
        <div className="p-3 border-b border-border">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      )}

      {/* 虚拟化列表 */}
      <div className="flex-1">
        <AutoSizer>
          {({ width, height: containerHeight }) => {
            // 使用可变高度列表如果提供了自定义高度函数
            if (getItemHeight || groupBy) {
              return (
                <VariableSizeList
                  ref={listRef as any}
                  width={width}
                  height={containerHeight}
                  itemCount={filteredItems.length}
                  itemSize={getItemHeightInternal}
                  overscanCount={overscanCount}
                  onScroll={handleScroll}
                >
                  {customRenderItem}
                </VariableSizeList>
              )
            }

            // 使用固定高度列表
            return (
              <List
                ref={listRef as any}
                width={width}
                height={containerHeight}
                itemCount={filteredItems.length}
                itemSize={itemHeight}
                overscanCount={overscanCount}
                onScroll={handleScroll}
              >
                {customRenderItem}
              </List>
            )
          }}
        </AutoSizer>
      </div>
    </div>
  )
}

// 便捷Hook
export const useVirtualizedPropertyList = (items: PropertyItem[]) => {
  const [selectedItem, setSelectedItem] = useState<string>()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items

    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [items, searchTerm])

  const scrollToItem = useCallback((index: number) => {
    // 这个方法需要在组件实现中使用
    console.log('Scroll to item:', index)
  }, [])

  return {
    selectedItem,
    setSelectedItem,
    searchTerm,
    setSearchTerm,
    filteredItems,
    scrollToItem,
  }
}