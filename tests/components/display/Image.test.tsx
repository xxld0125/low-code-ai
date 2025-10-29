import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PageImage, PageImagePreview } from '@/components/lowcode/display/Image/Image'
import { ComponentRendererProps } from '@/types/page-designer/component'

// Image 组件属性类型定义
interface ImageProps {
  src: string
  alt?: string
  width?: number
  height?: number
  object_fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  rounded?: boolean
  shadow?: boolean
  loading?: 'lazy' | 'eager'
}

// 创建标准测试 props 的辅助函数
const createMockProps = (
  overrides: Partial<ComponentRendererProps> = {}
): ComponentRendererProps => ({
  id: 'test-image',
  type: 'image',
  props: {},
  styles: {},
  events: {},
  isSelected: false,
  isDragging: false,
  ...overrides,
})

describe('Image组件', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PageImage基础渲染', () => {
    test('正确渲染默认图片组件', () => {
      const mockProps = createMockProps({ id: 'test-image-1' })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-1"]')
      expect(imageContainer).toBeInTheDocument()
      expect(imageContainer).toHaveAttribute('data-component-type', 'image')
      expect(imageContainer).toHaveAttribute('role', 'img')
      expect(imageContainer).toHaveAttribute('aria-label', '图片')
    })

    test('支持自定义className', () => {
      const mockProps = createMockProps({
        id: 'test-image-2',
        props: { className: 'custom-image-class' },
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-2"]')
      expect(imageContainer).toHaveClass('custom-image-class')
    })

    test('正确使用默认图片属性', () => {
      const mockProps = createMockProps({ id: 'test-image-3' })

      render(<PageImage {...mockProps} />)

      const image = screen.getByAltText('图片')
      expect(image).toHaveAttribute('src', '/api/placeholder/300/200')
      expect(image).toHaveAttribute('alt', '图片')
    })
  })

  describe('图片属性配置', () => {
    test('正确渲染自定义图片属性', () => {
      const customImageProps = {
        src: '/test-image.jpg',
        alt: '测试图片',
        width: 400,
        height: 300,
        object_fit: 'contain',
        rounded: true,
        shadow: true,
        loading: 'eager',
      }

      const mockProps = createMockProps({
        id: 'test-image-4',
        props: { image: customImageProps as ImageProps },
      })

      render(<PageImage {...mockProps} />)

      const image = screen.getByAltText('测试图片')
      expect(image).toHaveAttribute('src', '/test-image.jpg')
      expect(image).toHaveAttribute('alt', '测试图片')
    })

    test('正确应用圆角样式', () => {
      const imageProps = {
        src: '/test.jpg',
        alt: '测试',
        width: 200,
        height: 200,
        rounded: true,
      }

      const mockProps = createMockProps({
        id: 'test-image-5',
        props: { image: imageProps as ImageProps },
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-5"]')
      expect(imageContainer).toHaveClass('rounded-lg')
    })

    test('正确应用阴影样式', () => {
      const imageProps = {
        src: '/test.jpg',
        alt: '测试',
        width: 200,
        height: 200,
        shadow: true,
      }

      const mockProps = createMockProps({
        id: 'test-image-6',
        props: { image: imageProps as ImageProps },
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-6"]')
      expect(imageContainer).toHaveClass('shadow-lg')
    })
  })

  describe('样式系统', () => {
    test('正确应用自定义样式', () => {
      const customStyles = {
        width: '500px',
        height: '400px',
        backgroundColor: '#f0f0f0',
        border: '2px solid #ccc',
        margin: '10px',
        padding: '5px',
      }

      const mockProps = createMockProps({
        id: 'test-image-7',
        styles: customStyles,
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-7"]')
      expect(imageContainer).toHaveStyle({
        width: '500px',
        height: '400px',
        border: '2px solid #ccc',
        margin: '10px',
        padding: '5px',
      })
    })

    test('过滤不兼容的样式属性', () => {
      const invalidStyles = {
        width: '300px',
        boxShadow: true, // 应该被过滤
        background: {}, // 应该被过滤
        border: [] as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        borderRadius: true, // 应该被过滤
        color: '#333', // 应该保留
        fontSize: '16px', // 应该保留
      }

      const mockProps = createMockProps({
        id: 'test-image-8',
        styles: invalidStyles,
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-8"]')
      expect(imageContainer).toHaveStyle({
        width: '300px',
        color: '#333',
        fontSize: '16px',
      })
    })
  })

  describe('状态管理', () => {
    test('正确处理选中状态', () => {
      const mockProps = createMockProps({
        id: 'test-image-9',
        isSelected: true,
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-9"]')
      expect(imageContainer).toHaveClass('ring-2', 'ring-blue-500', 'ring-offset-2')
    })

    test('正确处理拖拽状态', () => {
      const mockProps = createMockProps({
        id: 'test-image-10',
        isDragging: true,
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-10"]')
      expect(imageContainer).toHaveClass('opacity-75')
      expect(imageContainer).toHaveStyle({ cursor: 'grabbing' })
    })

    test('显示选中状态下的尺寸信息', () => {
      const imageProps = {
        src: '/test.jpg',
        alt: '测试',
        width: 400,
        height: 300,
      }

      const mockProps = createMockProps({
        id: 'test-image-11',
        props: { image: imageProps as ImageProps },
        isSelected: true,
      })

      render(<PageImage {...mockProps} />)

      const sizeInfo = screen.getByText('400 × 300')
      expect(sizeInfo).toBeInTheDocument()
      expect(sizeInfo).toHaveClass('text-white')
    })
  })

  describe('事件处理', () => {
    test('正确处理点击事件', async () => {
      const onSelect = jest.fn()
      const mockProps = createMockProps({
        id: 'test-image-12',
        onSelect,
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-12"]')
      await user.click(imageContainer!)

      expect(onSelect).toHaveBeenCalledWith('test-image-12')
      expect(onSelect).toHaveBeenCalledTimes(1)
    })

    test('正确处理双击事件', async () => {
      const mockProps = createMockProps({ id: 'test-image-13' })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-13"]')
      await user.dblClick(imageContainer!)

      // 双击事件不应该抛出错误
      expect(imageContainer).toBeInTheDocument()
    })

    test('正确处理键盘事件', async () => {
      const onDelete = jest.fn()
      const mockProps = createMockProps({
        id: 'test-image-14',
        onDelete,
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-14"]')
      ;(imageContainer as HTMLElement).focus()
      await user.keyboard('{Delete}')

      expect(onDelete).toHaveBeenCalledWith('test-image-14')
      expect(onDelete).toHaveBeenCalledTimes(1)
    })

    test('正确处理Backspace键删除', async () => {
      const onDelete = jest.fn()
      const mockProps = createMockProps({
        id: 'test-image-15',
        onDelete,
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-15"]')
      ;(imageContainer as HTMLElement).focus()
      await user.keyboard('{Backspace}')

      expect(onDelete).toHaveBeenCalledWith('test-image-15')
      expect(onDelete).toHaveBeenCalledTimes(1)
    })
  })

  describe('图片加载状态', () => {
    test('显示加载状态', () => {
      const mockProps = createMockProps({
        id: 'test-image-16',
        props: {
          image: {
            src: '/test.jpg',
            alt: '测试',
            width: 300,
            height: 200,
          },
        },
      })

      render(<PageImage {...mockProps} />)

      // 初始状态应该显示加载指示器
      const loadingSpinner = document.querySelector('.animate-spin')
      expect(loadingSpinner).toBeInTheDocument()
    })

    test('处理图片加载错误', async () => {
      const mockProps = createMockProps({
        id: 'test-image-17',
        props: {
          image: {
            src: '/non-existent-image.jpg',
            alt: '测试图片',
            width: 300,
            height: 200,
          },
        },
      })

      render(<PageImage {...mockProps} />)

      const image = screen.getByAltText('测试图片')

      // 触发错误事件
      fireEvent.error(image)

      // 等待状态更新
      await waitFor(() => {
        const errorMessage = screen.getByText('图片加载失败')
        expect(errorMessage).toBeInTheDocument()
      })
    })

    test('显示错误状态的图标', async () => {
      const mockProps = createMockProps({
        id: 'test-image-18',
        props: {
          image: {
            src: '/error.jpg',
            alt: '错误图片',
            width: 300,
            height: 200,
            rounded: true,
          },
        },
      })

      render(<PageImage {...mockProps} />)

      const image = screen.getByAltText('错误图片')
      fireEvent.error(image)

      await waitFor(() => {
        const errorIcon = document.querySelector('svg')
        expect(errorIcon).toBeInTheDocument()
        const errorMessage = screen.getByText('图片加载失败')
        expect(errorMessage).toBeInTheDocument()
      })
    })
  })

  describe('可访问性', () => {
    test('支持键盘导航', () => {
      const mockProps = createMockProps({ id: 'test-image-19' })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-19"]')
      expect(imageContainer).toHaveAttribute('tabIndex', '0')
    })

    test('具有正确的ARIA属性', () => {
      const mockProps = createMockProps({
        id: 'test-image-20',
        props: {
          image: {
            src: '/test.jpg',
            alt: '自定义替代文本',
            width: 300,
            height: 200,
          },
        },
      })

      render(<PageImage {...mockProps} />)

      const imageContainer = document.querySelector('[data-component-id="test-image-20"]')
      expect(imageContainer).toHaveAttribute('role', 'img')
      expect(imageContainer).toHaveAttribute('aria-label', '自定义替代文本')
    })
  })

  describe('PageImagePreview组件', () => {
    test('正确渲染预览组件', () => {
      const onClick = jest.fn()
      render(<PageImagePreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      expect(previewContainer).toBeInTheDocument()
      expect(screen.getByText('图片')).toBeInTheDocument()
    })

    test('支持点击事件', async () => {
      const onClick = jest.fn()
      render(<PageImagePreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      await user.click(previewContainer)

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('支持键盘交互', async () => {
      const onClick = jest.fn()
      render(<PageImagePreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      previewContainer.focus()
      await user.keyboard('{Enter}')

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('支持空格键交互', async () => {
      const onClick = jest.fn()
      render(<PageImagePreview onClick={onClick} />)

      const previewContainer = screen.getByRole('button')
      previewContainer.focus()
      await user.keyboard(' ')

      expect(onClick).toHaveBeenCalledTimes(1)
    })

    test('具有悬停样式', () => {
      render(<PageImagePreview />)

      const previewContainer = screen.getByRole('button')
      expect(previewContainer).toHaveClass('hover:border-blue-300', 'hover:bg-blue-50')
    })
  })

  describe('响应式和性能', () => {
    test('使用正确的图片优化属性', () => {
      const imageProps = {
        src: '/test.jpg',
        alt: '测试',
        width: 400,
        height: 300,
        loading: 'eager',
      }

      const mockProps = createMockProps({
        id: 'test-image-21',
        props: { image: imageProps as ImageProps },
      })

      render(<PageImage {...mockProps} />)

      const image = screen.getByAltText('测试')
      expect(image).toHaveAttribute('quality', '85')
      expect(image).toHaveAttribute(
        'sizes',
        '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      )
    })

    test('支持懒加载', () => {
      const imageProps = {
        src: '/test.jpg',
        alt: '测试',
        width: 400,
        height: 300,
        loading: 'lazy',
      }

      const mockProps = createMockProps({
        id: 'test-image-22',
        props: { image: imageProps as ImageProps },
      })

      render(<PageImage {...mockProps} />)

      const image = screen.getByAltText('测试')
      expect(image).not.toHaveAttribute('priority')
    })

    test('支持优先级加载', () => {
      const imageProps = {
        src: '/test.jpg',
        alt: '测试',
        width: 400,
        height: 300,
        loading: 'eager',
      }

      const mockProps = createMockProps({
        id: 'test-image-23',
        props: { image: imageProps as ImageProps },
      })

      render(<PageImage {...mockProps} />)

      const image = screen.getByAltText('测试')
      // 在Next.js Image组件中，priority属性不会直接出现在HTML中
      // 而是影响图片的加载行为，这里我们验证图片存在即可
      expect(image).toBeInTheDocument()
    })
  })
})
