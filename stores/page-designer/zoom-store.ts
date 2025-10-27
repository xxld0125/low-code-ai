import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'

export interface ZoomStore {
  // 缩放状态
  zoom: number
  minZoom: number
  maxZoom: number
  zoomStep: number
  zoomToFitPadding: number

  // 平移状态
  pan: { x: number; y: number }
  isPanning: boolean
  panStart: { x: number; y: number } | null
  panStartScroll: { x: number; y: number } | null

  // 画布状态
  canvasSize: { width: number; height: number }
  viewportSize: { width: number; height: number }
  contentSize: { width: number; height: number }

  // 对齐和网格
  gridSize: number
  showGrid: boolean
  snapToGrid: boolean
  showRulers: boolean

  // 缩放动画
  isAnimating: boolean
  animationDuration: number

  // Actions
  setZoom: (zoom: number, center?: { x: number; y: number }) => void
  zoomIn: (center?: { x: number; y: number }) => void
  zoomOut: (center?: { x: number; y: number }) => void
  zoomToFit: (padding?: number) => void
  zoomToSelection: (selectionBounds: {
    x: number
    y: number
    width: number
    height: number
  }) => void
  resetZoom: () => void

  // 平移操作
  setPan: (pan: { x: number; y: number }) => void
  startPanning: (position: { x: number; y: number }) => void
  updatePanning: (position: { x: number; y: number }) => void
  endPanning: () => void
  centerContent: () => void

  // 画布尺寸
  setCanvasSize: (size: { width: number; height: number }) => void
  setViewportSize: (size: { width: number; height: number }) => void
  setContentSize: (size: { width: number; height: number }) => void

  // 网格和对齐
  setGridSize: (size: number) => void
  toggleGrid: () => void
  setSnapToGrid: (snap: boolean) => void
  toggleRulers: () => void

  // 坐标转换
  screenToCanvas: (screenPoint: { x: number; y: number }) => { x: number; y: number }
  canvasToScreen: (canvasPoint: { x: number; y: number }) => { x: number; y: number }
  snapToGridPoint: (point: { x: number; y: number }) => { x: number; y: number }

  // 工具函数
  getVisibleArea: () => { x: number; y: number; width: number; height: number }
  getScale: () => number
  isPointVisible: (point: { x: number; y: number }) => boolean
  getZoomLevel: () => 'zoom-in' | 'zoom-out' | 'fit' | 'normal'

  // 预设缩放
  setZoomLevel: (level: 'fit' | '100%' | '125%' | '150%' | '200%' | '50%' | '25%') => void
}

export const useZoomStore = create<ZoomStore>()(
  subscribeWithSelector(
    devtools(
      (set, get) => ({
        // 初始状态
        zoom: 1,
        minZoom: 0.1,
        maxZoom: 3,
        zoomStep: 0.1,
        zoomToFitPadding: 20,

        pan: { x: 0, y: 0 },
        isPanning: false,
        panStart: null,
        panStartScroll: null,

        canvasSize: { width: 1200, height: 800 },
        viewportSize: { width: 800, height: 600 },
        contentSize: { width: 1200, height: 800 },

        gridSize: 8,
        showGrid: true,
        snapToGrid: true,
        showRulers: true,

        isAnimating: false,
        animationDuration: 300,

        // 缩放操作
        setZoom: (newZoom, center) => {
          const { minZoom, maxZoom, pan, viewportSize } = get()
          const clampedZoom = Math.max(minZoom, Math.min(maxZoom, newZoom))

          set(state => {
            let newPan = { ...pan }

            // 如果指定了缩放中心，调整平移以保持中心点不变
            if (center) {
              const zoomRatio = clampedZoom / state.zoom
              const viewportCenter = {
                x: viewportSize.width / 2,
                y: viewportSize.height / 2,
              }

              const canvasCenter = {
                x: viewportCenter.x - pan.x,
                y: viewportCenter.y - pan.y,
              }

              const newCanvasCenter = {
                x: center.x + (canvasCenter.x - center.x) * zoomRatio,
                y: center.y + (canvasCenter.y - center.y) * zoomRatio,
              }

              newPan = {
                x: viewportCenter.x - newCanvasCenter.x,
                y: viewportCenter.y - newCanvasCenter.y,
              }
            }

            return {
              zoom: clampedZoom,
              pan: newPan,
            }
          })
        },

        zoomIn: center => {
          const { zoom, zoomStep, setZoom } = get()
          setZoom(zoom + zoomStep, center)
        },

        zoomOut: center => {
          const { zoom, zoomStep, setZoom } = get()
          setZoom(zoom - zoomStep, center)
        },

        zoomToFit: padding => {
          const {
            contentSize,
            viewportSize,
            zoomToFitPadding: defaultPadding,
            setZoom,
            setPan,
          } = get()

          const actualPadding = padding ?? defaultPadding

          // 计算缩放比例
          const scaleX = (viewportSize.width - actualPadding * 2) / contentSize.width
          const scaleY = (viewportSize.height - actualPadding * 2) / contentSize.height
          const scale = Math.min(scaleX, scaleY, 1) // 不超过100%

          setZoom(scale)

          // 居中内容
          const centerPan = {
            x: (viewportSize.width - contentSize.width * scale) / 2,
            y: (viewportSize.height - contentSize.height * scale) / 2,
          }
          setPan(centerPan)
        },

        zoomToSelection: selectionBounds => {
          const { viewportSize, setZoom, setPan } = get()

          // 计算选择区域的缩放比例
          const scaleX = viewportSize.width / (selectionBounds.width + 100)
          const scaleY = viewportSize.height / (selectionBounds.height + 100)
          const scale = Math.min(scaleX, scaleY, 2) // 最大200%

          const selectionCenter = {
            x: selectionBounds.x + selectionBounds.width / 2,
            y: selectionBounds.y + selectionBounds.height / 2,
          }

          setZoom(scale, selectionCenter)

          // 调整平移使选择区域居中
          const viewportCenter = {
            x: viewportSize.width / 2,
            y: viewportSize.height / 2,
          }

          const newPan = {
            x: viewportCenter.x - selectionCenter.x * scale,
            y: viewportCenter.y - selectionCenter.y * scale,
          }

          setPan(newPan)
        },

        resetZoom: () => {
          set({
            zoom: 1,
            pan: { x: 0, y: 0 },
          })
        },

        // 平移操作
        setPan: newPan => {
          set({ pan: newPan })
        },

        startPanning: position => {
          const { pan } = get()
          set({
            isPanning: true,
            panStart: position,
            panStartScroll: pan,
          })
        },

        updatePanning: position => {
          const { panStart, panStartScroll } = get()
          if (!panStart || !panStartScroll) return

          const deltaX = position.x - panStart.x
          const deltaY = position.y - panStart.y

          set({
            pan: {
              x: panStartScroll.x + deltaX,
              y: panStartScroll.y + deltaY,
            },
          })
        },

        endPanning: () => {
          set({
            isPanning: false,
            panStart: null,
            panStartScroll: null,
          })
        },

        centerContent: () => {
          const { contentSize, viewportSize, zoom, setPan } = get()
          const scaledContentSize = {
            width: contentSize.width * zoom,
            height: contentSize.height * zoom,
          }

          const centerPan = {
            x: (viewportSize.width - scaledContentSize.width) / 2,
            y: (viewportSize.height - scaledContentSize.height) / 2,
          }

          setPan(centerPan)
        },

        // 画布尺寸
        setCanvasSize: size => {
          set({ canvasSize: size })
        },

        setViewportSize: size => {
          set({ viewportSize: size })
        },

        setContentSize: size => {
          set({ contentSize: size })
        },

        // 网格和对齐
        setGridSize: size => {
          set({ gridSize: size })
        },

        toggleGrid: () => {
          set(state => ({ showGrid: !state.showGrid }))
        },

        setSnapToGrid: snap => {
          set({ snapToGrid: snap })
        },

        toggleRulers: () => {
          set(state => ({ showRulers: !state.showRulers }))
        },

        // 坐标转换
        screenToCanvas: screenPoint => {
          const { zoom, pan } = get()
          return {
            x: (screenPoint.x - pan.x) / zoom,
            y: (screenPoint.y - pan.y) / zoom,
          }
        },

        canvasToScreen: canvasPoint => {
          const { zoom, pan } = get()
          return {
            x: canvasPoint.x * zoom + pan.x,
            y: canvasPoint.y * zoom + pan.y,
          }
        },

        snapToGridPoint: point => {
          const { gridSize, snapToGrid } = get()
          if (!snapToGrid) return point

          return {
            x: Math.round(point.x / gridSize) * gridSize,
            y: Math.round(point.y / gridSize) * gridSize,
          }
        },

        // 工具函数
        getVisibleArea: () => {
          const { pan, viewportSize, zoom } = get()
          const topLeft = { x: -pan.x / zoom, y: -pan.y / zoom }
          const bottomRight = {
            x: (-pan.x + viewportSize.width) / zoom,
            y: (-pan.y + viewportSize.height) / zoom,
          }

          return {
            x: topLeft.x,
            y: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y,
          }
        },

        getScale: () => {
          return get().zoom
        },

        isPointVisible: point => {
          const visibleArea = get().getVisibleArea()
          return (
            point.x >= visibleArea.x &&
            point.x <= visibleArea.x + visibleArea.width &&
            point.y >= visibleArea.y &&
            point.y <= visibleArea.y + visibleArea.height
          )
        },

        getZoomLevel: () => {
          const { zoom } = get()
          if (zoom < 0.5) return 'zoom-out'
          if (zoom > 1.5) return 'zoom-in'
          if (Math.abs(zoom - 1) < 0.1) return 'normal'
          return 'normal'
        },

        // 预设缩放
        setZoomLevel: level => {
          const zoomLevels = {
            fit: () => get().zoomToFit(),
            '100%': () => get().setZoom(1),
            '125%': () => get().setZoom(1.25),
            '150%': () => get().setZoom(1.5),
            '200%': () => get().setZoom(2),
            '50%': () => get().setZoom(0.5),
            '25%': () => get().setZoom(0.25),
          }

          const zoomFunction = zoomLevels[level]
          if (zoomFunction) {
            zoomFunction()
          }
        },
      }),
      { name: 'zoom-store' }
    )
  )
)
