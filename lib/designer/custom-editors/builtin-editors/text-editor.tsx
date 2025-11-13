/**
 * 文本编辑器
 *
 * 基础文本输入编辑器，支持各种文本类型
 */

import React, { useCallback, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PropertyEditorProps } from '../property-editor-registry'
import { RegisterEditor } from '../property-editor-registry'

interface TextEditorProps extends PropertyEditorProps {
  multiline?: boolean
  maxLength?: number
  minLength?: number
  showCount?: boolean
  monospace?: boolean
}

export const TextEditor: React.FC<TextEditorProps> = ({
  value,
  onChange,
  schema,
  disabled = false,
  placeholder,
  className,
  error,
  onBlur,
  onFocus,
  multiline = false,
  maxLength,
  minLength,
  showCount = false,
  monospace = false,
}) => {
  const currentValue = useMemo(() => {
    return typeof value === 'string' ? value : ''
  }, [value])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    onChange(newValue)
  }, [onChange])

  const characterCount = useMemo(() => {
    return currentValue.length
  }, [currentValue])

  const isValidLength = useMemo(() => {
    if (minLength !== undefined && currentValue.length < minLength) return false
    if (maxLength !== undefined && currentValue.length > maxLength) return false
    return true
  }, [currentValue, minLength, maxLength])

  const EditorComponent = multiline ? Textarea : Input

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {schema.title || 'Text Input'}
          </CardTitle>
          {(showCount || maxLength) && (
            <div className="flex items-center gap-2">
              <Badge
                variant={isValidLength ? 'default' : 'destructive'}
                className="text-xs"
              >
                {characterCount}
                {maxLength && `/${maxLength}`}
              </Badge>
            </div>
          )}
        </div>
        {schema.description && (
          <p className="text-xs text-muted-foreground">
            {schema.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <Label htmlFor={`text-${schema.type}`} className="text-xs">
            {schema.title || 'Value'}
          </Label>
          <EditorComponent
            id={`text-${schema.type}`}
            value={currentValue}
            onChange={handleChange}
            disabled={disabled}
            placeholder={placeholder || schema.ui?.placeholder}
            onBlur={onBlur}
            onFocus={onFocus}
            maxLength={maxLength}
            className={monospace ? 'font-mono' : ''}
            rows={multiline ? 3 : undefined}
          />

          {/* 错误提示 */}
          {error && (
            <div className="text-xs text-destructive">
              {error}
            </div>
          )}

          {/* 长度验证提示 */}
          {!isValidLength && (
            <div className="text-xs text-destructive">
              {minLength !== undefined && currentValue.length < minLength &&
                `Minimum length is ${minLength} characters`
              }
              {maxLength !== undefined && currentValue.length > maxLength &&
                `Maximum length is ${maxLength} characters`
              }
            </div>
          )}

          {/* 帮助文本 */}
          {schema.ui?.help && (
            <div className="text-xs text-muted-foreground">
              {schema.ui?.help}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// 注册文本编辑器
RegisterEditor({
  type: 'text',
  name: 'Text Editor',
  description: 'Basic text input editor',
  supportedTypes: ['text', 'string'],
  category: 'basic',
  tags: ['input', 'text', 'string'],
})(TextEditor)

// 注册多行文本编辑器
RegisterEditor({
  type: 'textarea',
  name: 'Textarea Editor',
  description: 'Multi-line text input editor',
  supportedTypes: ['textarea', 'longtext'],
  category: 'basic',
  tags: ['input', 'textarea', 'multiline'],
})(function TextareaEditor(props: TextEditorProps) {
  return <TextEditor {...props} multiline={true} />
})

// 注册密码编辑器
RegisterEditor({
  type: 'password',
  name: 'Password Editor',
  description: 'Password input editor with masked input',
  supportedTypes: ['password'],
  category: 'basic',
  tags: ['input', 'password', 'secure'],
})(function PasswordEditor(props: TextEditorProps) {
  return (
    <TextEditor
      {...props}
      placeholder={props.placeholder || 'Enter password'}
    />
  )
})

// 注册代码编辑器
RegisterEditor({
  type: 'code',
  name: 'Code Editor',
  description: 'Monospace text editor for code input',
  supportedTypes: ['code', 'json', 'xml', 'yaml'],
  category: 'advanced',
  tags: ['input', 'code', 'monospace'],
})(function CodeEditor(props: TextEditorProps) {
  return (
    <TextEditor
      {...props}
      multiline={true}
      monospace={true}
      placeholder={props.placeholder || 'Enter code...'}
      showCount={true}
    />
  )
})

// 注册邮箱编辑器
RegisterEditor({
  type: 'email',
  name: 'Email Editor',
  description: 'Email input editor with validation',
  supportedTypes: ['email'],
  category: 'basic',
  tags: ['input', 'email', 'validation'],
})(function EmailEditor(props: TextEditorProps) {
  const [emailError, setEmailError] = React.useState<string>('')

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    props.onChange(value)

    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }, [props.onChange, validateEmail])

  return (
    <TextEditor
      {...props}
      onChange={handleChange}
      placeholder={props.placeholder || 'Enter email address'}
      error={props.error || emailError}
    />
  )
})

// 注册URL编辑器
RegisterEditor({
  type: 'url',
  name: 'URL Editor',
  description: 'URL input editor with validation',
  supportedTypes: ['url', 'link'],
  category: 'basic',
  tags: ['input', 'url', 'link', 'validation'],
})(function URLEditor(props: TextEditorProps) {
  const [urlError, setUrlError] = React.useState<string>('')

  const validateUrl = useCallback((url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }, [])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    props.onChange(value)

    if (value && !validateUrl(value)) {
      setUrlError('Please enter a valid URL')
    } else {
      setUrlError('')
    }
  }, [props.onChange, validateUrl])

  return (
    <TextEditor
      {...props}
      onChange={handleChange}
      placeholder={props.placeholder || 'https://example.com'}
      error={props.error || urlError}
    />
  )
})