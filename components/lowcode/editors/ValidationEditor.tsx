/**
 * 验证编辑器组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-31
 * 用途: 配置表单字段的验证规则
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import {
  Plus,
  Trash2,
  Settings,
  AlertCircle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  Copy,
  Download,
  Upload
} from 'lucide-react'

// 导入验证相关类型和工具
import {
  ValidationRule,
  ValidationResult,
  FieldDefinition
} from '@/lib/lowcode/types/editor'
import { VALIDATION_PRESETS } from '@/lib/lowcode/validation/validation-presets'

// 本地类型定义
interface ValidationRuleConfig extends ValidationRule {
  id: string
  enabled: boolean
  errorMessage?: string
  description?: string
}

interface ValidationEditorProps {
  // 字段信息
  field: FieldDefinition

  // 当前验证规则
  rules?: ValidationRuleConfig[]

  // 验证预设
  presets?: Record<string, ValidationRule[]>

  // 事件处理
  onRulesChange?: (rules: ValidationRuleConfig[]) => void
  onValidationChange?: (result: ValidationResult) => void

  // 配置选项
  config?: {
    showPresets?: boolean
    showTestArea?: boolean
    showAdvanced?: boolean
    allowCustomRules?: boolean
    enableRealTimeValidation?: boolean
  }

  // 状态
  loading?: boolean
  disabled?: boolean
  readonly?: boolean

  // 样式
  className?: string
}

// 验证规则类型选项
const VALIDATION_RULE_TYPES = [
  { value: 'required', label: '必填验证', icon: '⚠️' },
  { value: 'minLength', label: '最小长度', icon: '📏' },
  { value: 'maxLength', label: '最大长度', icon: '📏' },
  { value: 'min', label: '最小值', icon: '🔢' },
  { value: 'max', label: '最大值', icon: '🔢' },
  { value: 'pattern', label: '正则表达式', icon: '🔍' },
  { value: 'email', label: '邮箱格式', icon: '📧' },
  { value: 'phone', label: '手机号码', icon: '📱' },
  { value: 'url', label: 'URL格式', icon: '🔗' },
  { value: 'idCard', label: '身份证号', icon: '🆔' },
  { value: 'custom', label: '自定义函数', icon: '⚙️' },
]

// 预定义的错误消息模板
const ERROR_MESSAGE_TEMPLATES: Record<string, string> = {
  required: '此字段为必填项',
  minLength: '最少需要 {{min}} 个字符',
  maxLength: '最多允许 {{max}} 个字符',
  min: '值不能小于 {{min}}',
  max: '值不能大于 {{max}}',
  pattern: '格式不正确',
  email: '请输入有效的邮箱地址',
  phone: '请输入有效的手机号码',
  url: '请输入有效的URL地址',
  idCard: '请输入有效的身份证号码',
  custom: '验证失败',
}

export const ValidationEditor: React.FC<ValidationEditorProps> = ({
  field,
  rules: initialRules = [],
  presets = VALIDATION_PRESETS,
  onRulesChange,
  onValidationChange,
  config = {},
  loading = false,
  disabled = false,
  readonly = false,
  className,
}) => {
  // 配置选项
  const {
    showPresets = true,
    showTestArea = true,
    showAdvanced = false,
    allowCustomRules = true,
    enableRealTimeValidation = true,
  } = config

  // 状态管理
  const [rules, setRules] = useState<ValidationRuleConfig[]>(initialRules)
  const [testValue, setTestValue] = useState('')
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [showRuleBuilder, setShowRuleBuilder] = useState(false)
  const [editingRule, setEditingRule] = useState<ValidationRuleConfig | null>(null)
  const [activeTab, setActiveTab] = useState('rules')

  // 过滤适用于当前字段类型的规则类型
  const applicableRuleTypes = useMemo(() => {
    return VALIDATION_RULE_TYPES.filter(ruleType => {
      switch (field.type) {
        case 'string':
        case 'textarea':
          return ['required', 'minLength', 'maxLength', 'pattern', 'email', 'phone', 'url', 'idCard', 'custom'].includes(ruleType.value)
        case 'number':
          return ['required', 'min', 'max', 'custom'].includes(ruleType.value)
        case 'select':
        case 'radio':
          return ['required', 'custom'].includes(ruleType.value)
        case 'checkbox':
          return ['custom'].includes(ruleType.value)
        default:
          return ['required', 'custom'].includes(ruleType.value)
      }
    })
  }, [field.type])

  // 获取可用的预设
  const availablePresets = useMemo(() => {
    const fieldPresets: Record<string, { label: string; description: string; rules: ValidationRuleConfig[] }> = {}

    // 添加通用预设
    if (field.type === 'string' || field.type === 'textarea') {
      fieldPresets.username = {
        label: '用户名',
        description: '用户名验证规则',
        rules: [
          {
            id: 'required',
            type: 'required',
            enabled: true,
            errorMessage: ERROR_MESSAGE_TEMPLATES.required,
          },
          {
            id: 'minLength',
            type: 'minLength',
            value: 3,
            enabled: true,
            errorMessage: ERROR_MESSAGE_TEMPLATES.minLength.replace('{{min}}', '3'),
          },
          {
            id: 'maxLength',
            type: 'maxLength',
            value: 20,
            enabled: true,
            errorMessage: ERROR_MESSAGE_TEMPLATES.maxLength.replace('{{max}}', '20'),
          },
          {
            id: 'pattern',
            type: 'pattern',
            value: '^[a-zA-Z0-9_]+$',
            enabled: true,
            errorMessage: '只能包含字母、数字和下划线',
          },
        ],
      }

      fieldPresets.password = {
        label: '密码',
        description: '密码验证规则',
        rules: [
          {
            id: 'required',
            type: 'required',
            enabled: true,
            errorMessage: ERROR_MESSAGE_TEMPLATES.required,
          },
          {
            id: 'minLength',
            type: 'minLength',
            value: 8,
            enabled: true,
            errorMessage: '密码至少需要8个字符',
          },
          {
            id: 'pattern',
            type: 'pattern',
            value: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)[a-zA-Z\\d@$!%*?&]{8,}$',
            enabled: true,
            errorMessage: '密码必须包含大小写字母和数字',
          },
        ],
      }

      fieldPresets.email = {
        label: '邮箱',
        description: '邮箱格式验证',
        rules: [
          {
            id: 'required',
            type: 'required',
            enabled: true,
            errorMessage: ERROR_MESSAGE_TEMPLATES.required,
          },
          {
            id: 'email',
            type: 'email',
            enabled: true,
            errorMessage: ERROR_MESSAGE_TEMPLATES.email,
          },
        ],
      }
    }

    if (field.type === 'number') {
      fieldPresets.age = {
        label: '年龄',
        description: '年龄验证规则',
        rules: [
          {
            id: 'required',
            type: 'required',
            enabled: true,
            errorMessage: ERROR_MESSAGE_TEMPLATES.required,
          },
          {
            id: 'min',
            type: 'min',
            value: 0,
            enabled: true,
            errorMessage: '年龄不能小于0',
          },
          {
            id: 'max',
            type: 'max',
            value: 150,
            enabled: true,
            errorMessage: '年龄不能大于150',
          },
        ],
      }
    }

    return fieldPresets
  }, [field.type])

  // 添加验证规则
  const addRule = useCallback((ruleType: string) => {
    const ruleTypeConfig = VALIDATION_RULE_TYPES.find(rt => rt.value === ruleType)
    if (!ruleTypeConfig) return

    const newRule: ValidationRuleConfig = {
      id: `${ruleType}_${Date.now()}`,
      type: ruleType as any,
      enabled: true,
      errorMessage: ERROR_MESSAGE_TEMPLATES[ruleType] || ERROR_MESSAGE_TEMPLATES.custom,
      description: ruleTypeConfig.label,
    }

    const updatedRules = [...rules, newRule]
    setRules(updatedRules)
    onRulesChange?.(updatedRules)
  }, [rules, onRulesChange])

  // 更新规则
  const updateRule = useCallback((ruleId: string, updates: Partial<ValidationRuleConfig>) => {
    const updatedRules = rules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    )
    setRules(updatedRules)
    onRulesChange?.(updatedRules)
  }, [rules, onRulesChange])

  // 删除规则
  const removeRule = useCallback((ruleId: string) => {
    const updatedRules = rules.filter(rule => rule.id !== ruleId)
    setRules(updatedRules)
    onRulesChange?.(updatedRules)
  }, [rules, onRulesChange])

  // 应用预设
  const applyPreset = useCallback((presetKey: string) => {
    const preset = availablePresets[presetKey]
    if (!preset) return

    setRules(preset.rules)
    onRulesChange?.(preset.rules)
  }, [availablePresets, onRulesChange])

  // 测试验证
  const testValidation = useCallback(() => {
    // 这里应该调用实际的验证逻辑
    // 简化实现，仅用于演示
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    }

    // 测试必填规则
    const requiredRule = rules.find(rule => rule.enabled && rule.type === 'required')
    if (requiredRule && (!testValue || testValue.trim() === '')) {
      result.isValid = false
      result.errors.push(requiredRule.errorMessage || '此字段为必填项')
    }

    // 测试长度规则
    const minLengthRule = rules.find(rule => rule.enabled && rule.type === 'minLength')
    if (minLengthRule && testValue.length < (minLengthRule.value || 0)) {
      result.isValid = false
      result.errors.push(
        minLengthRule.errorMessage?.replace('{{min}}', String(minLengthRule.value)) ||
        `长度不能小于${minLengthRule.value}`
      )
    }

    const maxLengthRule = rules.find(rule => rule.enabled && rule.type === 'maxLength')
    if (maxLengthRule && testValue.length > (maxLengthRule.value || Infinity)) {
      result.isValid = false
      result.errors.push(
        maxLengthRule.errorMessage?.replace('{{max}}', String(maxLengthRule.value)) ||
        `长度不能大于${maxLengthRule.value}`
      )
    }

    setValidationResult(result)
    onValidationChange?.(result)
  }, [rules, testValue, onValidationChange])

  // 重置验证规则
  const resetRules = useCallback(() => {
    setRules([])
    setValidationResult(null)
    onRulesChange?.([])
  }, [onRulesChange])

  // 导出验证规则
  const exportRules = useCallback(() => {
    const exportData = {
      field: field.key,
      rules: rules.map(({ id, ...rule }) => rule),
      metadata: {
        exportTime: new Date().toISOString(),
        fieldType: field.type,
        version: '1.0.0',
      },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${field.key}-validation-rules.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [field, rules])

  // 复制验证规则
  const copyRules = useCallback(() => {
    const rulesJson = JSON.stringify(rules.map(({ id, ...rule }) => rule), null, 2)
    navigator.clipboard.writeText(rulesJson)
  }, [rules])

  // 渲染规则编辑器
  const renderRuleEditor = (rule: ValidationRuleConfig) => {
    const ruleTypeConfig = VALIDATION_RULE_TYPES.find(rt => rt.value === rule.type)

    return (
      <Card key={rule.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{ruleTypeConfig?.icon}</span>
              <CardTitle className="text-sm">{ruleTypeConfig?.label || rule.type}</CardTitle>
              <Switch
                checked={rule.enabled}
                onCheckedChange={(enabled) => updateRule(rule.id, { enabled })}
                disabled={disabled || readonly}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingRule(rule)}
                disabled={disabled || readonly}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeRule(rule.id)}
                disabled={disabled || readonly}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* 规则参数配置 */}
          {(rule.type === 'minLength' || rule.type === 'maxLength') && (
            <div className="flex items-center gap-2">
              <Label className="text-sm min-w-20">
                {rule.type === 'minLength' ? '最小长度' : '最大长度'}:
              </Label>
              <Input
                type="number"
                value={rule.value || ''}
                onChange={(e) => updateRule(rule.id, { value: parseInt(e.target.value) || 0 })}
                placeholder="请输入长度"
                disabled={disabled || readonly}
                className="flex-1"
              />
            </div>
          )}

          {(rule.type === 'min' || rule.type === 'max') && (
            <div className="flex items-center gap-2">
              <Label className="text-sm min-w-20">
                {rule.type === 'min' ? '最小值' : '最大值'}:
              </Label>
              <Input
                type="number"
                value={rule.value || ''}
                onChange={(e) => updateRule(rule.id, { value: parseInt(e.target.value) || 0 })}
                placeholder="请输入数值"
                disabled={disabled || readonly}
                className="flex-1"
              />
            </div>
          )}

          {rule.type === 'pattern' && (
            <div className="space-y-2">
              <Label className="text-sm">正则表达式:</Label>
              <Input
                value={rule.value || ''}
                onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                placeholder="请输入正则表达式"
                disabled={disabled || readonly}
              />
            </div>
          )}

          {/* 错误消息配置 */}
          <div className="space-y-2">
            <Label className="text-sm">错误消息:</Label>
            <Input
              value={rule.errorMessage || ''}
              onChange={(e) => updateRule(rule.id, { errorMessage: e.target.value })}
              placeholder="请输入错误提示消息"
              disabled={disabled || readonly}
            />
          </div>

          {/* 描述信息 */}
          <div className="space-y-2">
            <Label className="text-sm">描述信息:</Label>
            <Textarea
              value={rule.description || ''}
              onChange={(e) => updateRule(rule.id, { description: e.target.value })}
              placeholder="请输入规则描述"
              disabled={disabled || readonly}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="text-sm text-muted-foreground">加载验证编辑器...</div>
      </div>
    )
  }

  return (
    <div className={cn('validation-editor flex flex-col h-full', className)}>
      {/* 头部工具栏 */}
      <div className="flex items-center justify-between border-b bg-background p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">验证规则配置</span>
          <Badge variant="outline" className="text-xs">
            {field.label}
          </Badge>
          {rules.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {rules.filter(r => r.enabled).length}/{rules.length} 已启用
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetRules}
            disabled={disabled || readonly}
            className="text-xs"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            重置
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={copyRules}
            disabled={disabled || readonly || rules.length === 0}
            className="text-xs"
          >
            <Copy className="h-4 w-4 mr-1" />
            复制
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportRules}
            disabled={disabled || readonly || rules.length === 0}
            className="text-xs"
          >
            <Download className="h-4 w-4 mr-1" />
            导出
          </Button>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 m-4">
            <TabsTrigger value="rules">验证规则</TabsTrigger>
            {showPresets && <TabsTrigger value="presets">预设模板</TabsTrigger>}
            {showTestArea && <TabsTrigger value="test">测试验证</TabsTrigger>}
          </TabsList>

          {/* 验证规则标签页 */}
          <TabsContent value="rules" className="p-4 pt-0">
            <div className="space-y-4">
              {/* 添加规则按钮 */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">添加验证规则</span>
                <Select
                  onValueChange={addRule}
                  disabled={disabled || readonly}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="选择验证规则类型" />
                  </SelectTrigger>
                  <SelectContent>
                    {applicableRuleTypes.map(ruleType => (
                      <SelectItem key={ruleType.value} value={ruleType.value}>
                        <div className="flex items-center gap-2">
                          <span>{ruleType.icon}</span>
                          <span>{ruleType.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 规则列表 */}
              <ScrollArea className="h-[400px]">
                {rules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <span className="text-sm">暂无验证规则</span>
                    <span className="text-xs">请添加验证规则以开始配置</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {rules.map(renderRuleEditor)}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* 预设模板标签页 */}
          {showPresets && (
            <TabsContent value="presets" className="p-4 pt-0">
              <div className="space-y-4">
                <div className="text-sm font-medium">选择预设模板</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(availablePresets).map(([key, preset]) => (
                    <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">{preset.label}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {preset.rules.length} 条规则
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => applyPreset(key)}
                            disabled={disabled || readonly}
                          >
                            应用
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          )}

          {/* 测试验证标签页 */}
          {showTestArea && (
            <TabsContent value="test" className="p-4 pt-0">
              <div className="space-y-4">
                <div className="text-sm font-medium">测试验证规则</div>

                {/* 测试输入 */}
                <div className="space-y-2">
                  <Label className="text-sm">测试值:</Label>
                  <Input
                    value={testValue}
                    onChange={(e) => setTestValue(e.target.value)}
                    placeholder="请输入测试值"
                    disabled={disabled || readonly}
                  />
                </div>

                {/* 测试按钮 */}
                <Button
                  onClick={testValidation}
                  disabled={disabled || readonly || !testValue}
                >
                  开始验证
                </Button>

                {/* 验证结果 */}
                {validationResult && (
                  <Alert variant={validationResult.isValid ? 'default' : 'destructive'}>
                    <div className="flex items-center gap-2">
                      {validationResult.isValid ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>
                        {validationResult.isValid ? '验证通过' : '验证失败'}
                      </AlertDescription>
                    </div>

                    {!validationResult.isValid && validationResult.errors.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-1">错误信息:</div>
                        <ul className="text-sm space-y-1">
                          {validationResult.errors.map((error, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-destructive rounded-full" />
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {validationResult.warnings && validationResult.warnings.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-1">警告信息:</div>
                        <ul className="text-sm space-y-1">
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-yellow-500 rounded-full" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Alert>
                )}

                {rules.length === 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      请先添加验证规则，然后可以在此测试验证效果
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export default ValidationEditor