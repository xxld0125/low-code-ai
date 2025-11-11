import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ params: string[] }> }
) {
  try {
    const resolvedParams = await params
    const [width, height] = resolvedParams.params

    // 参数验证
    const w = Math.max(1, Math.min(2000, parseInt(width) || 300))
    const h = Math.max(1, Math.min(2000, parseInt(height) || 200))

    // 创建一个简单的 SVG 占位符图片
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af">
          ${w} × ${h}
        </text>
      </svg>
    `

    const buffer = Buffer.from(svg.trim())

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // 缓存一天
      },
    })
  } catch (error) {
    console.error('Placeholder API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate placeholder' },
      { status: 500 }
    )
  }
}