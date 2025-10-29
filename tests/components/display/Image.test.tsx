import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Image } from '@/components/lowcode/display/Image'

/* eslint-disable jsx-a11y/alt-text */

// Mock next/image to avoid issues with image loading in tests
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    onLoad,
    onError,
    ...props
  }: {
    src?: string
    alt?: string
    onLoad?: () => void
    onError?: () => void
    [key: string]: unknown
  }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || '测试图片'}
        onLoad={onLoad}
        onError={onError}
        data-testid="next-image"
        {...props}
      />
    )
  }
})

describe('Image组件', () => {
  test('正确渲染默认图片', () => {
    render(<Image />)

    const image = screen.getByTestId('next-image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/api/placeholder/300/200')
    expect(image).toHaveAttribute('alt', '图片')
  })

  test('支持自定义src和alt', () => {
    render(<Image src="/custom-image.jpg" alt="自定义图片" />)

    const image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('src', '/custom-image.jpg')
    expect(image).toHaveAttribute('alt', '自定义图片')
  })

  test('支持自定义className', () => {
    render(<Image className="custom-image-class" />)

    const container = screen.getByTestId('next-image').closest('div')
    expect(container).toHaveClass('custom-image-class')
  })

  test('正确应用object-fit样式', async () => {
    const { rerender } = render(<Image object_fit="cover" />)
    let image = screen.getByTestId('next-image')
    expect(image).toHaveStyle({ objectFit: 'cover' })

    rerender(<Image object_fit="contain" />)
    image = screen.getByTestId('next-image')
    expect(image).toHaveStyle({ objectFit: 'contain' })

    rerender(<Image object_fit="fill" />)
    image = screen.getByTestId('next-image')
    expect(image).toHaveStyle({ objectFit: 'fill' })

    rerender(<Image object_fit="none" />)
    image = screen.getByTestId('next-image')
    expect(image).toHaveStyle({ objectFit: 'none' })

    rerender(<Image object_fit="scale-down" />)
    image = screen.getByTestId('next-image')
    expect(image).toHaveStyle({ objectFit: 'scale-down' })
  })

  test('正确应用圆角样式', () => {
    const { rerender } = render(<Image rounded="none" />)
    let container = screen.getByTestId('next-image').closest('div')
    expect(container).not.toHaveClass('rounded')

    rerender(<Image rounded="sm" />)
    container = screen.getByTestId('next-image').closest('div')
    expect(container).toHaveClass('rounded-sm')

    rerender(<Image rounded="md" />)
    container = screen.getByTestId('next-image').closest('div')
    expect(container).toHaveClass('rounded-md')

    rerender(<Image rounded="lg" />)
    container = screen.getByTestId('next-image').closest('div')
    expect(container).toHaveClass('rounded-lg')

    rerender(<Image rounded="xl" />)
    container = screen.getByTestId('next-image').closest('div')
    expect(container).toHaveClass('rounded-xl')

    rerender(<Image rounded="full" />)
    container = screen.getByTestId('next-image').closest('div')
    expect(container).toHaveClass('rounded-full')
  })

  test('正确应用阴影样式', () => {
    const { rerender } = render(<Image shadow="none" />)
    let container = screen.getByTestId('next-image').closest('div')
    expect(container).not.toHaveClass('shadow')

    rerender(<Image shadow="sm" />)
    container = screen.getByTestId('next-image').closest('div')
    expect(container).toHaveClass('shadow-sm')

    rerender(<Image shadow="md" />)
    container = screen.getByTestId('next-image').closest('div')
    expect(container).toHaveClass('shadow-md')

    rerender(<Image shadow="lg" />)
    container = screen.getByTestId('next-image').closest('div')
    expect(container).toHaveClass('shadow-lg')

    rerender(<Image shadow="xl" />)
    container = screen.getByTestId('next-image').closest('div')
    expect(container).toHaveClass('shadow-xl')
  })

  test('处理图片加载成功', async () => {
    render(<Image src="/test-image.jpg" />)

    const image = screen.getByTestId('next-image')

    fireEvent.load(image)

    await waitFor(() => {
      expect(image).toHaveClass('opacity-100')
      expect(image).not.toHaveClass('opacity-0')
    })
  })

  test('处理图片加载失败', async () => {
    render(<Image src="/non-existent-image.jpg" />)

    const image = screen.getByTestId('next-image')

    fireEvent.error(image)

    await waitFor(() => {
      expect(screen.getByText('图片加载失败')).toBeInTheDocument()
    })
  })

  test('支持自定义宽高', () => {
    render(<Image width={400} height={300} />)

    const image = screen.getByTestId('next-image')
    expect(image).toHaveAttribute('width', '400')
    expect(image).toHaveAttribute('height', '300')
  })
})
