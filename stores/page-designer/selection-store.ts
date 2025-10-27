import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

export interface SelectionStore {
  // 选择状态
  selectedIds: Set<string>
  hoveredId: string | null
  activeId: string | null

  // 多选状态
  isMultiSelecting: boolean
  selectionRect: {
    x: number
    y: number
    width: number
    height: number
  } | null

  // 剪贴板
  clipboard: Array<{
    id: string
    componentType: string
    props: Record<string, any>
    styles: Record<string, any>
    layoutProps?: Record<string, any>
  }>
  clipboardPosition: { x: number; y: number }

  // Actions
  select: (id: string, multi?: boolean) => void
  unselect: (id: string) => void
  selectAll: (componentIds: string[]) => void
  clearSelection: () => void
  setHovered: (id: string | null) => void
  setActive: (id: string | null) => void

  // 多选操作
  startMultiSelect: (rect: { x: number; y: number; width: number; height: number }) => void
  updateMultiSelect: (rect: { x: number; y: number; width: number; height: number }) => void
  endMultiSelect: (componentIdsInRect: string[]) => void

  // 剪贴板操作
  copy: (components: any[]) => void
  cut: (components: any[]) => void
  paste: (position: { x: number; y: number }) => string[]
  duplicate: (componentIds: string[]) => string[]

  // 选择检查
  isSelected: (id: string) => boolean
  isHovered: (id: string) => boolean
  isActive: (id: string) => boolean
  getSelectedCount: () => number
  getSelectedIds: () => string[]
  getFirstSelectedId: () => string | null

  // 选择操作
  selectNext: () => void
  selectPrevious: () => void
  selectParent: () => void
  selectChildren: () => void
  selectSiblings: () => void

  // 键盘快捷键
  handleKeyDown: (
    event: KeyboardEvent,
    components: any[],
    onSelectCallback?: (id: string) => void
  ) => void
}

export const useSelectionStore = create<SelectionStore>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // 初始状态
        selectedIds: new Set(),
        hoveredId: null,
        activeId: null,
        isMultiSelecting: false,
        selectionRect: null,
        clipboard: [],
        clipboardPosition: { x: 0, y: 0 },

        // 基础选择操作
        select: (id, multi = false) => {
          set(state => {
            const newSelectedIds = new Set(state.selectedIds)

            if (multi) {
              if (newSelectedIds.has(id)) {
                newSelectedIds.delete(id)
              } else {
                newSelectedIds.add(id)
              }
            } else {
              newSelectedIds.clear()
              newSelectedIds.add(id)
            }

            return {
              selectedIds: newSelectedIds,
              activeId: id,
            }
          })
        },

        unselect: id => {
          set(state => {
            const newSelectedIds = new Set(state.selectedIds)
            newSelectedIds.delete(id)

            return {
              selectedIds: newSelectedIds,
              activeId: state.activeId === id ? null : state.activeId,
            }
          })
        },

        selectAll: componentIds => {
          set({
            selectedIds: new Set(componentIds),
            activeId: componentIds.length > 0 ? componentIds[0] : null,
          })
        },

        clearSelection: () => {
          set({
            selectedIds: new Set(),
            hoveredId: null,
            activeId: null,
            selectionRect: null,
          })
        },

        setHovered: id => {
          set({ hoveredId: id })
        },

        setActive: id => {
          set({ activeId: id })
        },

        // 多选操作
        startMultiSelect: rect => {
          set({
            isMultiSelecting: true,
            selectionRect: rect,
          })
        },

        updateMultiSelect: rect => {
          set({
            selectionRect: rect,
          })
        },

        endMultiSelect: componentIdsInRect => {
          set(state => {
            const newSelectedIds = new Set(state.selectedIds)

            // 添加矩形区域内的组件到选择中
            componentIdsInRect.forEach(id => {
              newSelectedIds.add(id)
            })

            return {
              selectedIds: newSelectedIds,
              isMultiSelecting: false,
              selectionRect: null,
              activeId: componentIdsInRect.length > 0 ? componentIdsInRect[0] : state.activeId,
            }
          })
        },

        // 剪贴板操作
        copy: components => {
          const clipboardData = components.map(component => ({
            id: component.id,
            componentType: component.component_type,
            props: component.props,
            styles: component.styles,
            layoutProps: component.layout_props,
          }))

          set({
            clipboard: clipboardData,
            clipboardPosition: { x: 0, y: 0 },
          })
        },

        cut: components => {
          get().copy(components)
          // 注意：实际删除组件需要在主store中处理
        },

        paste: (position): string[] => {
          const { clipboard } = get()
          if (clipboard.length === 0) return []

          // 生成新的组件ID
          const newIds = clipboard.map(
            () => `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          )

          set({
            clipboardPosition: position,
            selectedIds: new Set(newIds),
            activeId: newIds[0],
          })

          return newIds
        },

        duplicate: (componentIds): string[] => {
          const newIds = componentIds.map(
            () => `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          )

          set({
            selectedIds: new Set(newIds),
            activeId: newIds[0],
          })

          return newIds
        },

        // 选择检查
        isSelected: id => {
          return get().selectedIds.has(id)
        },

        isHovered: id => {
          return get().hoveredId === id
        },

        isActive: id => {
          return get().activeId === id
        },

        getSelectedCount: () => {
          return get().selectedIds.size
        },

        getSelectedIds: () => {
          return Array.from(get().selectedIds)
        },

        getFirstSelectedId: () => {
          const ids = get().getSelectedIds()
          return ids.length > 0 ? ids[0] : null
        },

        // 选择操作
        selectNext: () => {
          // 这个需要在具体的组件列表中实现
          // 这里只是示例逻辑
          const { getSelectedIds } = get()
          const currentIds = getSelectedIds()
          if (currentIds.length === 0) return

          // 需要传入组件列表来找到下一个组件
          // select(nextId)
        },

        selectPrevious: () => {
          // 类似selectNext的实现
          const { getSelectedIds } = get()
          const currentIds = getSelectedIds()
          if (currentIds.length === 0) return

          // 需要传入组件列表来找到上一个组件
          // select(previousId)
        },

        selectParent: (components?: any[]) => {
          const { activeId } = get()
          if (!activeId || !components) return

          const activeComponent = components.find(c => c.id === activeId)
          if (activeComponent?.parent_id) {
            // select(activeComponent.parent_id)
          }
        },

        selectChildren: (components?: any[]) => {
          const { selectedIds, selectAll } = get()
          if (!components || selectedIds.size === 0) return

          const childrenIds = components
            .filter(component => Array.from(selectedIds).includes(component.parent_id || ''))
            .map(component => component.id)

          if (childrenIds.length > 0) {
            selectAll(childrenIds)
          }
        },

        selectSiblings: (components?: any[]) => {
          const { activeId } = get()
          if (!activeId || !components) return

          const activeComponent = components.find(c => c.id === activeId)
          if (!activeComponent) return

          const siblings = components.filter(
            component =>
              component.parent_id === activeComponent.parent_id && component.id !== activeId
          )

          if (siblings.length > 0) {
            // const siblingIds = [activeId, ...siblings.map((s) => s.id)]
            // selectAll(siblingIds)
          }
        },

        // 键盘快捷键处理
        handleKeyDown: (event, components, onSelectCallback) => {
          const {
            selectedIds,
            clearSelection,
            selectAll,
            isSelected,
            getSelectedIds,
            copy,
            duplicate,
          } = get()
          const { paste } = get() // 获取paste方法

          // 防止在输入框中触发快捷键
          if (
            event.target instanceof HTMLInputElement ||
            event.target instanceof HTMLTextAreaElement ||
            event.target instanceof HTMLSelectElement
          ) {
            return
          }

          const hasSelection = selectedIds.size > 0
          const selectedIdsArray = getSelectedIds()

          switch (event.key) {
            case 'Escape':
              // 清除选择
              event.preventDefault()
              clearSelection()
              break

            case 'a':
            case 'A':
              if (event.ctrlKey || event.metaKey) {
                // Ctrl/Cmd + A: 全选
                event.preventDefault()
                selectAll(components.map(c => c.id))
              }
              break

            case 'c':
            case 'C':
              if ((event.ctrlKey || event.metaKey) && hasSelection) {
                // Ctrl/Cmd + C: 复制
                event.preventDefault()
                const selectedComponents = components.filter(c => isSelected(c.id))
                copy(selectedComponents)
              }
              break

            case 'v':
            case 'V':
              if (event.ctrlKey || event.metaKey) {
                // Ctrl/Cmd + V: 粘贴
                event.preventDefault()
                const newIds = paste({ x: 0, y: 0 })
                // 粘贴操作需要在主store中处理组件的创建
                if (onSelectCallback && newIds.length > 0) {
                  onSelectCallback(newIds[0])
                }
              }
              break

            case 'd':
            case 'D':
              if ((event.ctrlKey || event.metaKey) && hasSelection) {
                // Ctrl/Cmd + D: 复制
                event.preventDefault()
                const newIds = duplicate(selectedIdsArray)
                // 复制操作需要在主store中处理
                if (onSelectCallback && newIds.length > 0) {
                  onSelectCallback(newIds[0])
                }
              }
              break

            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
              if (!event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
                // 方向键：选择相邻组件
                event.preventDefault()
                // 这里需要根据具体的布局逻辑来选择相邻组件
                // 实现比较复杂，需要考虑组件的层级和位置
              }
              break

            case 'Enter':
            case ' ':
              if (hasSelection) {
                // Enter/Space: 激活选中的组件（例如开始编辑）
                event.preventDefault()
                // 可以触发编辑模式或其他操作
              }
              break

            case 'Tab':
              if (!event.shiftKey) {
                // Tab: 选择下一个组件
                event.preventDefault()
                // 类似方向键的逻辑
              } else {
                // Shift + Tab: 选择上一个组件
                event.preventDefault()
                // 类似方向键的逻辑
              }
              break

            case 'Delete':
            case 'Backspace':
              if (hasSelection) {
                // Delete/Backspace: 删除选中的组件
                event.preventDefault()
                // 删除操作需要在主store中处理
              }
              break
          }
        },
      }),
      { name: 'selection-store' }
    )
  )
)
