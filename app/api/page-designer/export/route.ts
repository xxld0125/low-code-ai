import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { dataSerializer } from '@/lib/page-designer/serializer'
import { PermissionChecker } from '@/lib/page-designer/permissions'

// 导出配置验证
const ExportSchema = z.object({
  page_design_id: z.string().uuid(),
  format: z.enum(['json', 'html', 'react']).default('json'),
  include_components: z.boolean().default(true),
  include_styles: z.boolean().default(true),
  include_assets: z.boolean().default(false),
})

/**
 * POST /api/page-designer/export
 *
 * 导出页面设计为指定格式
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 验证请求数据
    const validationResult = ExportSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: '请求参数错误',
          details: validationResult.error.issues,
        },
        { status: 400 }
      )
    }

    const { page_design_id, format, include_components, include_styles, include_assets } =
      validationResult.data

    // 统一权限检查
    const permissionResult = await PermissionChecker.checkApiPermission(
      request,
      page_design_id,
      'view'
    )

    if (!permissionResult.hasPermission) {
      return NextResponse.json({ error: permissionResult.error || '权限不足' }, { status: 401 })
    }

    const { user, pageDesign } = permissionResult

    // 获取组件数据
    let components = []
    if (include_components) {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      const { data: componentData } = await supabase
        .from('component_instances')
        .select('*')
        .eq('page_design_id', page_design_id)
        .order('created_at', { ascending: true })

      components = componentData || []
    }

    let exportData: any
    let contentType: string
    let filename: string

    switch (format) {
      case 'json':
        exportData = dataSerializer.exportDesign(pageDesign, components)
        contentType = 'application/json'
        filename = `${pageDesign.name}-design.json`
        break

      case 'html':
        exportData = generateHTMLExport(pageDesign, components, {
          include_styles,
          include_assets,
        })
        contentType = 'text/html'
        filename = `${pageDesign.name}.html`
        break

      case 'react':
        exportData = generateReactExport(pageDesign, components, {
          include_styles,
          include_assets,
        })
        contentType = 'application/javascript'
        filename = `${pageDesign.name}.jsx`
        break

      default:
        return NextResponse.json({ error: '不支持的导出格式' }, { status: 400 })
    }

    // 记录导出日志
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    await supabase.from('export_logs').insert({
      page_design_id,
      exported_by: user.id,
      format,
      config: {
        include_components,
        include_styles,
        include_assets,
      },
      created_at: new Date().toISOString(),
    })

    // 返回文件下载
    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
        'Cache-Control': 'no-cache',
      },
    })
  } catch (error) {
    console.error('导出页面设计失败:', error)
    return NextResponse.json({ error: '导出失败' }, { status: 500 })
  }
}

/**
 * 生成HTML格式的导出
 */
function generateHTMLExport(pageDesign: any, components: any[], options: any) {
  const { include_styles, include_assets } = options

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${pageDesign.config?.title || pageDesign.name}</title>
    ${pageDesign.config?.meta?.description ? `<meta name="description" content="${pageDesign.config.meta.description}">` : ''}
    ${pageDesign.config?.meta?.keywords ? `<meta name="keywords" content="${pageDesign.config.meta.keywords.join(', ')}">` : ''}
    ${
      include_styles
        ? `
    <style>
        /* 基础样式 */
        body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: ${pageDesign.config?.styles?.backgroundColor || '#ffffff'};
        }

        .container {
            max-width: ${pageDesign.config?.layout?.maxWidth || 1200}px;
            margin: 0 auto;
            padding: ${
              pageDesign.config?.layout?.padding
                ? `${pageDesign.config.layout.padding.top}px ${pageDesign.config.layout.padding.right}px ${pageDesign.config.layout.padding.bottom}px ${pageDesign.config.layout.padding.left}px`
                : '20px'
            };
            ${pageDesign.config?.layout?.centered ? 'margin-left: auto; margin-right: auto;' : ''}
        }

        /* 组件样式 */
        ${generateComponentStyles(components)}
    </style>`
        : ''
    }
</head>
<body>
    <div class="container">
        ${generateComponentHTML(components)}
    </div>

    ${
      include_assets
        ? `
    <script>
        // 基础交互脚本
        document.addEventListener('DOMContentLoaded', function() {
            // 按钮点击事件
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('click', function(e) {
                    if (this.onclick) {
                        this.onclick(e);
                    }
                });
            });

            // 表单提交事件
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', function(e) {
                    e.preventDefault();
                    if (this.onsubmit) {
                        this.onsubmit(e);
                    }
                });
            });
        });
    </script>`
        : ''
    }
</body>
</html>`

  return html
}

/**
 * 生成React组件格式的导出
 */
function generateReactExport(pageDesign: any, components: any[], options: any) {
  const { include_styles } = options

  const componentCode = components
    .map(comp => {
      return generateReactComponent(comp)
    })
    .join('\n\n')

  const mainComponent = `import React from 'react';
${include_styles ? `import './styles.css';` : ''}

${componentCode}

export default function ${pageDesign.name.replace(/[^a-zA-Z0-9]/g, '')}Page() {
  return (
    <div className="${pageDesign.config?.layout?.centered ? 'container' : ''}">
      ${generateReactJSX(components)}
    </div>
  );
}`

  return mainComponent
}

/**
 * 生成组件样式
 */
function generateComponentStyles(components: any[]): string {
  return components
    .map(comp => {
      if (!comp.styles) return ''

      const selector = `.component-${comp.id}`
      const styles = Object.entries(comp.styles)
        .map(([prop, value]) => {
          const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase()
          return `${cssProp}: ${value};`
        })
        .join('\n        ')

      return `
${selector} {
        ${styles}
    }`
    })
    .join('\n')
}

/**
 * 生成组件HTML
 */
function generateComponentHTML(components: any[]): string {
  // 这里需要实现组件到HTML的转换逻辑
  // 简化实现，实际需要根据组件类型进行转换
  return components
    .map(comp => {
      switch (comp.component_type) {
        case 'button':
          return `<button class="component-${comp.id}">${comp.props?.button?.text || '按钮'}</button>`
        case 'text':
          return `<div class="component-${comp.id}">${comp.props?.text?.content || '文本内容'}</div>`
        case 'image':
          return `<img class="component-${comp.id}" src="${comp.props?.image?.src || ''}" alt="${comp.props?.image?.alt || ''}" />`
        default:
          return `<div class="component-${comp.id}"><!-- ${comp.component_type} --></div>`
      }
    })
    .join('\n        ')
}

/**
 * 生成React组件代码
 */
function generateReactComponent(comp: any): string {
  const componentName = comp.component_type.charAt(0).toUpperCase() + comp.component_type.slice(1)
  const props = Object.entries(comp.props || {})
    .map(([key, value]) => {
      if (typeof value === 'string') {
        return `${key}="${value}"`
      }
      return `${key}={${JSON.stringify(value)}}`
    })
    .join(' ')

  switch (comp.component_type) {
    case 'button':
      return `const ${componentName} = ({ ${Object.keys(comp.props || {}).join(', ')} }) => {
  return <button ${props}>{props.text || '按钮'}</button>;
};`
    case 'text':
      return `const ${componentName} = ({ ${Object.keys(comp.props || {}).join(', ')} }) => {
  return <div ${props}>{props.content || '文本内容'}</div>;
};`
    default:
      return `const ${componentName} = (props) => {
  return <div {...props}>{/* ${comp.component_type} */}</div>;
};`
  }
}

/**
 * 生成React JSX
 */
function generateReactJSX(components: any[]): string {
  // 这里需要实现组件到JSX的转换逻辑
  return components
    .map(comp => {
      const componentName =
        comp.component_type.charAt(0).toUpperCase() + comp.component_type.slice(1)
      const props = Object.entries(comp.props || {})
        .map(([key, value]) => {
          if (typeof value === 'string') {
            return `${key}="${value}"`
          }
          return `${key}={${JSON.stringify(value)}}`
        })
        .join(' ')

      switch (comp.component_type) {
        case 'button':
          return `<${componentName} ${props} />`
        case 'text':
          return `<${componentName} ${props} />`
        default:
          return `<${componentName} ${props} />`
      }
    })
    .join('\n        ')
}
