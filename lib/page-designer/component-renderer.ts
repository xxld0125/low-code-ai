import React from 'react'
import type { ComponentInstance, PageDesign } from '@/types/page-designer'

/**
 * 过滤掉不应该传递给DOM元素的事件处理器属性
 */
const filterDomProps = (props: Record<string, any>): Record<string, any> => {
  const filteredProps: Record<string, any> = {}
  const invalidProps = new Set([
    'onClick',
    'onUpdate',
    'onDelete',
    'onSelect',
    'isSelected',
    'isDragging',
    'isEditable',
    'onDragStart',
    'onDragEnd',
    'onDragOver',
    'onDrop',
  ])

  Object.keys(props).forEach(key => {
    if (!invalidProps.has(key)) {
      filteredProps[key] = props[key]
    }
  })

  return filteredProps
}

/**
 * 组件渲染器
 * 负责将组件实例渲染为React组件
 */
export class ComponentRenderer {
  /**
   * 渲染单个组件为React元素
   */
  static renderComponent(component: ComponentInstance): React.ReactElement {
    const { component_type, props, styles, id } = component

    // 合并默认样式和自定义样式
    const combinedStyles = {
      ...this.getDefaultStyles(component_type),
      ...styles,
    }

    // 根据组件类型渲染不同的React组件
    switch (component_type) {
      case 'button':
        return this.renderButton(props, combinedStyles, id)
      case 'text':
        return this.renderText(props, combinedStyles, id)
      case 'image':
        return this.renderImage(props, combinedStyles, id)
      case 'container':
        return this.renderContainer(props, combinedStyles, id, [])
      case 'input':
        return this.renderInput(props, combinedStyles, id)
      case 'link':
        return this.renderLink(props, combinedStyles, id)
      case 'textarea':
        return this.renderTextarea(props, combinedStyles, id)
      case 'select':
        return this.renderSelect(props, combinedStyles, id)
      case 'checkbox':
        return this.renderCheckbox(props, combinedStyles, id)
      case 'radio':
        return this.renderRadio(props, combinedStyles, id)
      case 'heading':
        return this.renderHeading(props, combinedStyles, id)
      case 'card':
        return this.renderCard(props, combinedStyles, id)
      case 'badge':
        return this.renderBadge(props, combinedStyles, id)
      default:
        return this.renderDefault(component, combinedStyles)
    }
  }

  /**
   * 递归渲染组件树
   */
  static renderComponentTree(
    components: ComponentInstance[],
    rootId: string | null
  ): React.ReactElement[] {
    if (!rootId) {
      // 如果没有根组件，渲染所有顶级组件并按order字段排序
      const topLevelComponents = components
        .filter(c => !c.parent_id)
        .sort((a, b) => (a.position?.order || 0) - (b.position?.order || 0))
      return topLevelComponents.map(c => this.renderComponent(c))
    }

    // 找到根组件
    const rootComponent = components.find(c => c.id === rootId)

    if (!rootComponent) {
      // 如果指定的根组件ID不存在，回退到渲染所有顶级组件并按order字段排序
      const topLevelComponents = components
        .filter(c => !c.parent_id)
        .sort((a, b) => (a.position?.order || 0) - (b.position?.order || 0))
      return topLevelComponents.map(c => this.renderComponent(c))
    }

    // 递归渲染子组件
    return [this.renderComponentWithChildren(rootComponent, components)]
  }

  /**
   * 渲染组件及其子组件
   */
  private static renderComponentWithChildren(
    component: ComponentInstance,
    allComponents: ComponentInstance[]
  ): React.ReactElement {
    // 找到子组件并按order字段排序
    const children = allComponents
      .filter(c => c.parent_id === component.id)
      .sort((a, b) => (a.position?.order || 0) - (b.position?.order || 0))

    // 递归渲染子组件
    const renderedChildren = children.map(child =>
      this.renderComponentWithChildren(child, allComponents)
    )

    // 渲染当前组件，传入子组件
    return this.renderComponentWithChildrenProps(component, renderedChildren)
  }

  /**
   * 渲染带子组件的组件
   */
  private static renderComponentWithChildrenProps(
    component: ComponentInstance,
    children: React.ReactElement[]
  ): React.ReactElement {
    const { component_type, props, styles, id } = component
    const combinedStyles = {
      ...this.getDefaultStyles(component_type),
      ...styles,
    }

    switch (component_type) {
      case 'container':
        return this.renderContainer(props, combinedStyles, id, children)
      default:
        // 对于不支持子组件的组件，只渲染自身
        return this.renderComponent(component)
    }
  }

  /**
   * 渲染按钮组件
   */
  private static renderButton(props: any, styles: any, id: string): React.ReactElement {
    // 在预览模式下，创建完全静态的按钮组件，完全忽略任何传入的props
    return React.createElement(
      'button',
      {
        key: id,
        style: {
          padding: '8px 16px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          backgroundColor: '#f0f0f0',
          cursor: 'pointer',
          fontSize: '14px',
          ...styles,
        },
        className: `component-${id}`,
        type: 'button',
        disabled: false,
        // 完全不使用任何传入的属性，确保绝对安全
      },
      '按钮'
    )
  }

  /**
   * 渲染文本组件
   */
  private static renderText(props: any, styles: any, id: string): React.ReactElement {
    const textProps = props?.text || {}
    const filteredProps = filterDomProps(textProps)
    const Tag = textProps.tag || 'div'

    return React.createElement(
      Tag,
      {
        key: id,
        style: styles,
        className: `component-${id} ${textProps.className || ''}`,
        ...filteredProps,
      },
      textProps.content || '文本内容'
    )
  }

  /**
   * 渲染图片组件
   */
  private static renderImage(props: any, styles: any, id: string): React.ReactElement {
    const imageProps = props?.image || {}
    const filteredProps = filterDomProps(imageProps)

    return React.createElement('img', {
      key: id,
      style: styles,
      className: `component-${id} ${imageProps.className || ''}`,
      src: imageProps.src || '',
      alt: imageProps.alt || '',
      width: imageProps.width,
      height: imageProps.height,
      ...filteredProps,
    })
  }

  /**
   * 渲染容器组件
   */
  private static renderContainer(
    props: any,
    styles: any,
    id: string,
    children: React.ReactNode
  ): React.ReactElement {
    const containerProps = props?.container || {}
    const filteredProps = filterDomProps(containerProps)
    const tagName = containerProps.tag || 'div'

    return React.createElement(
      tagName,
      {
        key: id,
        style: styles,
        className: `component-${id} ${containerProps.className || ''}`,
        ...filteredProps,
      },
      children
    )
  }

  /**
   * 渲染输入框组件
   */
  private static renderInput(props: any, styles: any, id: string): React.ReactElement {
    const inputProps = props?.input || {}
    const filteredProps = filterDomProps(inputProps)

    return React.createElement('input', {
      key: id,
      style: styles,
      className: `component-${id} ${inputProps.className || ''}`,
      type: inputProps.type || 'text',
      placeholder: inputProps.placeholder,
      defaultValue: inputProps.value || '',
      disabled: inputProps.disabled,
      readOnly: inputProps.readOnly,
      ...filteredProps,
    })
  }

  /**
   * 渲染链接组件
   */
  private static renderLink(props: any, styles: any, id: string): React.ReactElement {
    const linkProps = props?.link || {}
    const filteredProps = filterDomProps(linkProps)

    return React.createElement(
      'a',
      {
        key: id,
        style: styles,
        className: `component-${id} ${linkProps.className || ''}`,
        href: linkProps.href || '#',
        target: linkProps.target || '_self',
        ...filteredProps,
      },
      linkProps.text || '链接'
    )
  }

  /**
   * 渲染默认组件
   */
  private static renderDefault(component: ComponentInstance, styles: any): React.ReactElement {
    return React.createElement(
      'div',
      {
        key: component.id,
        style: styles,
        className: `component-${component.id}`,
      },
      `<!-- ${component.component_type} -->`
    )
  }

  /**
   * 渲染文本域组件
   */
  private static renderTextarea(props: any, styles: any, id: string): React.ReactElement {
    const textareaProps = props?.textarea || {}
    const filteredProps = filterDomProps(textareaProps)

    return React.createElement('textarea', {
      key: id,
      style: styles,
      className: `component-${id} ${textareaProps.className || ''}`,
      placeholder: textareaProps.placeholder,
      defaultValue: textareaProps.value || '',
      rows: textareaProps.rows || 4,
      disabled: textareaProps.disabled,
      readOnly: textareaProps.readOnly,
      ...filteredProps,
    })
  }

  /**
   * 渲染选择框组件
   */
  private static renderSelect(props: any, styles: any, id: string): React.ReactElement {
    const selectProps = props?.select || {}
    const filteredProps = filterDomProps(selectProps)

    return React.createElement(
      'select',
      {
        key: id,
        style: styles,
        className: `component-${id} ${selectProps.className || ''}`,
        defaultValue: selectProps.value || '',
        disabled: selectProps.disabled,
        ...filteredProps,
      },
      [
        React.createElement(
          'option',
          {
            key: 'placeholder',
            value: '',
            disabled: true,
          },
          selectProps.placeholder || '请选择'
        ),
        ...(selectProps.options || []).map((option: any, index: number) =>
          React.createElement(
            'option',
            {
              key: index,
              value: option.value || option.label,
            },
            option.label || option.value
          )
        ),
      ]
    )
  }

  /**
   * 渲染复选框组件
   */
  private static renderCheckbox(props: any, styles: any, id: string): React.ReactElement {
    const checkboxProps = props?.checkbox || {}
    const filteredProps = filterDomProps(checkboxProps)

    return React.createElement(
      'label',
      {
        key: id,
        style: {
          ...styles,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
        },
        className: `component-${id} ${checkboxProps.className || ''}`,
      },
      [
        React.createElement('input', {
          key: 'input',
          type: 'checkbox',
          defaultChecked: checkboxProps.defaultChecked || false,
          disabled: checkboxProps.disabled,
          ...filteredProps,
        }),
        React.createElement(
          'span',
          {
            key: 'label',
          },
          checkboxProps.label || ''
        ),
      ]
    )
  }

  /**
   * 渲染单选框组件
   */
  private static renderRadio(props: any, styles: any, id: string): React.ReactElement {
    const radioProps = props?.radio || {}
    const filteredProps = filterDomProps(radioProps)

    return React.createElement(
      'div',
      {
        key: id,
        style: styles,
        className: `component-${id} ${radioProps.className || ''}`,
      },
      [
        React.createElement(
          'div',
          {
            key: 'label',
            style: { marginBottom: '8px', fontWeight: 'bold' },
          },
          radioProps.label || ''
        ),
        React.createElement(
          'div',
          {
            key: 'options',
            style: { display: 'flex', flexDirection: 'column', gap: '4px' },
          },
          ...(radioProps.options || []).map((option: any, index: number) =>
            React.createElement(
              'label',
              {
                key: index,
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                },
              },
              [
                React.createElement('input', {
                  key: 'input',
                  type: 'radio',
                  name: `radio-${id}`,
                  value: option.value || option.label,
                  defaultChecked:
                    (radioProps.defaultValue || '') === (option.value || option.label),
                  disabled: radioProps.disabled,
                }),
                React.createElement(
                  'span',
                  {
                    key: 'label',
                  },
                  option.label || option.value
                ),
              ]
            )
          )
        ),
      ]
    )
  }

  /**
   * 渲染标题组件
   */
  private static renderHeading(props: any, styles: any, id: string): React.ReactElement {
    const textProps = props?.text || {}
    const filteredProps = filterDomProps(textProps)

    // 根据标题级别选择标签
    let tag = 'h1'
    if (textProps.tag) {
      tag = textProps.tag
    } else if (textProps.variant) {
      const level = textProps.variant.replace('heading', '')
      tag = `h${level || '1'}`
    }

    return React.createElement(
      tag,
      {
        key: id,
        style: styles,
        className: `component-${id} ${textProps.className || ''}`,
        ...filteredProps,
      },
      textProps.content || '标题'
    )
  }

  /**
   * 渲染卡片组件
   */
  private static renderCard(props: any, styles: any, id: string): React.ReactElement {
    const containerProps = props?.container || {}
    const filteredProps = filterDomProps(containerProps)

    return React.createElement(
      'div',
      {
        key: id,
        style: {
          ...styles,
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          padding: '16px',
          backgroundColor: '#ffffff',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
        className: `component-${id} ${containerProps.className || ''}`,
        ...filteredProps,
      },
      React.createElement(
        'div',
        {
          style: {
            padding: '20px',
            textAlign: 'center',
            color: '#666',
            border: '2px dashed #ddd',
            borderRadius: '4px',
            backgroundColor: '#f9f9f9',
          },
        },
        '卡片组件'
      )
    )
  }

  /**
   * 渲染徽章组件
   */
  private static renderBadge(props: any, styles: any, id: string): React.ReactElement {
    const textProps = props?.text || {}
    const filteredProps = filterDomProps(textProps)

    return React.createElement(
      'span',
      {
        key: id,
        style: {
          ...styles,
          display: 'inline-block',
          padding: '4px 8px',
          fontSize: '12px',
          fontWeight: 'bold',
          borderRadius: '12px',
          backgroundColor: '#007bff',
          color: '#ffffff',
          border: '1px solid #0056b3',
        },
        className: `component-${id} ${textProps.className || ''}`,
        ...filteredProps,
      },
      textProps.content || '徽章'
    )
  }

  /**
   * 获取组件的默认样式
   */
  private static getDefaultStyles(componentType: string): any {
    const defaultStyles = {
      button: {
        padding: '8px 16px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: '#f0f0f0',
        cursor: 'pointer',
        fontSize: '14px',
      },
      text: {
        margin: '0',
        padding: '4px 0',
        fontSize: '14px',
        lineHeight: '1.5',
      },
      image: {
        maxWidth: '100%',
        height: 'auto',
        display: 'block',
      },
      container: {
        padding: '16px',
        border: '1px dashed #ccc',
        borderRadius: '4px',
      },
      input: {
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%',
      },
      textarea: {
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%',
        minHeight: '100px',
        resize: 'vertical',
      },
      select: {
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontSize: '14px',
        width: '100%',
        backgroundColor: '#ffffff',
      },
      checkbox: {
        margin: '4px 0',
      },
      radio: {
        margin: '8px 0',
      },
      heading: {
        margin: '16px 0 8px 0',
        fontWeight: 'bold',
      },
      card: {
        margin: '16px 0',
        maxWidth: '100%',
      },
      badge: {
        margin: '2px 4px',
      },
      link: {
        color: '#0066cc',
        textDecoration: 'underline',
        cursor: 'pointer',
      },
    }

    return defaultStyles[componentType as keyof typeof defaultStyles] || {}
  }

  /**
   * 应用页面级样式
   */
  static applyPageStyles(pageDesign: PageDesign): React.CSSProperties {
    const config = pageDesign.config || {}
    const styles = config.styles || {}
    const layout = config.layout || {}

    return {
      backgroundColor: (styles as any)?.backgroundColor || '#ffffff',
      backgroundImage: (styles as any)?.backgroundImage
        ? `url(${(styles as any).backgroundImage})`
        : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      lineHeight: '1.6',
      color: '#333',
      margin: 0,
      padding: (layout as any)?.padding
        ? `${(layout as any).padding.top}px ${(layout as any).padding.right}px ${(layout as any).padding.bottom}px ${(layout as any).padding.left}px`
        : '20px',
      maxWidth: (layout as any)?.maxWidth ? `${(layout as any).maxWidth}px` : '100%',
      minHeight: '100vh',
    }
  }
}
