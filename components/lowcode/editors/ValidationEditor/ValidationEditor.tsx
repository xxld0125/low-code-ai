/**
 * 验证编辑器组件
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-30
 */

import React, { useState, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

// 验证规则定义
interface ValidationRule {
  id: string
  type: ValidationRuleType
  name: string
  label: string
  description?: string
  enabled: boolean
  params: Record<string, unknown>
  errorMessage?: string
}

export type ValidationRuleType =
  | 'required'
  | 'min_length'
  | 'max_length'
  | 'min_value'
  | 'max_value'
  | 'pattern'
  | 'email'
  | 'url'
  | 'custom'

// 验证规则模板
const VALIDATION_RULE_TEMPLATES: Record<
  ValidationRuleType,
  Omit<ValidationRule, 'id' | 'enabled'>
> = {
  required: {
    type: 'required',
    name: 'required',
    label: '必填',
    description: '此字段不能为空',
    params: {},
    errorMessage: '此字段为必填项',
  },
  min_length: {
    type: 'min_length',
    name: 'min_length',
    label: '最小长度',
    description: '设置文本的最小字符数',
    params: { min: 1 },
    errorMessage: '至少需要输入 {min} 个字符',
  },
  max_length: {
    type: 'max_length',
    name: 'max_length',
    label: '最大长度',
    description: '设置文本的最大字符数',
    params: { max: 100 },
    errorMessage: '最多只能输入 {max} 个字符',
  },
  min_value: {
    type: 'min_value',
    name: 'min_value',
    label: '最小值',
    description: '设置数值的最小值',
    params: { min: 0 },
    errorMessage: '值不能小于 {min}',
  },
  max_value: {
    type: 'max_value',
    name: 'max_value',
    label: '最大值',
    description: '设置数值的最大值',
    params: { max: 100 },
    errorMessage: '值不能大于 {max}',
  },
  pattern: {
    type: 'pattern',
    name: 'pattern',
    label: '正则表达式',
    description: '使用正则表达式验证输入格式',
    params: { pattern: '' },
    errorMessage: '输入格式不正确',
  },
  email: {
    type: 'email',
    name: 'email',
    label: '邮箱格式',
    description: '验证输入是否为有效的邮箱地址',
    params: {},
    errorMessage: '请输入有效的邮箱地址',
  },
  url: {
    type: 'url',
    name: 'url',
    label: 'URL格式',
    description: '验证输入是否为有效的URL地址',
    params: {},
    errorMessage: '请输入有效的URL地址',
  },
  custom: {
    type: 'custom',
    name: 'custom',
    label: '自定义验证',
    description: '使用自定义函数进行验证',
    params: { function: '' },
    errorMessage: '验证失败',
  },
}

interface ValidationEditorProps {
  // 组件信息
  componentType: string
  propertyName: string
  propertyType: 'string' | 'number' | 'email' | 'url'

  // 验证规则
  validationRules: ValidationRule[]

  // 事件处理
  onValidationRulesChange: (rules: ValidationRule[]) => void

  // 状态
  disabled?: boolean
  readonly?: boolean

  // 配置选项
  showAdvanced?: boolean
}

export const ValidationEditor: React.FC<ValidationEditorProps> = ({
  componentType,
  propertyName,
  propertyType,
  validationRules,
  onValidationRulesChange,
  disabled = false,
  readonly = false,
  showAdvanced = false,
}) => {
  // 内部状态
  const [rules, setRules] = useState<ValidationRule[]>(validationRules)
  const [activeTab, setActiveTab] = useState('basic')

  // 根据属性类型获取可用的验证规则
  const availableRules = useMemo(() => {
    const allRules = Object.entries(VALIDATION_RULE_TEMPLATES) as [
      ValidationRuleType,
      (typeof VALIDATION_RULE_TEMPLATES)[ValidationRuleType],
    ][]

    return allRules
      .filter(([type, template]) => {
        switch (type) {
          case 'required':
            return true // 所有类型都支持必填验证
          case 'min_length':
          case 'max_length':
          case 'pattern':
            return propertyType === 'string'
          case 'min_value':
          case 'max_value':
            return propertyType === 'number'
          case 'email':
            return propertyType === 'email' || propertyType === 'string'
          case 'url':
            return propertyType === 'url' || propertyType === 'string'
          case 'custom':
            return showAdvanced // 自定义验证仅高级模式显示
          default:
            return false
        }
      })
      .map(([type, template]) => ({
        ...template,
        type,
        id: `${propertyName}-${type}`,
      }))
  }, [propertyType, propertyName, showAdvanced])

  // 基础规则和高级规则分类
  const { basicRules, advancedRules } = useMemo(() => {
    const basic: typeof availableRules = []
    const advanced: typeof availableRules = []

    availableRules.forEach(rule => {
      if (rule.type === 'custom' || rule.type === 'pattern') {
        advanced.push(rule)
      } else {
        basic.push(rule)
      }
    })

    return { basicRules: basic, advancedRules: advanced }
  }, [availableRules])

  // 添加验证规则
  const addValidationRule = useCallback(
    (ruleType: ValidationRuleType) => {
      const template = VALIDATION_RULE_TEMPLATES[ruleType]
      const newRule: ValidationRule = {
        ...template,
        id: `${propertyName}-${ruleType}-${Date.now()}`,
        enabled: true,
      }

      const updatedRules = [...rules, newRule]
      setRules(updatedRules)
      onValidationRulesChange(updatedRules)
    },
    [propertyName, rules, onValidationRulesChange]
  )

  // 删除验证规则
  const removeValidationRule = useCallback(
    (ruleId: string) => {
      const updatedRules = rules.filter(rule => rule.id !== ruleId)
      setRules(updatedRules)
      onValidationRulesChange(updatedRules)
    },
    [rules, onValidationRulesChange]
  )

  // 更新验证规则
  const updateValidationRule = useCallback(
    (ruleId: string, updates: Partial<ValidationRule>) => {
      const updatedRules = rules.map(rule => (rule.id === ruleId ? { ...rule, ...updates } : rule))
      setRules(updatedRules)
      onValidationRulesChange(updatedRules)
    },
    [rules, onValidationRulesChange]
  )

  // 切换规则启用状态
  const toggleRuleEnabled = useCallback(
    (ruleId: string) => {
      const rule = rules.find(r => r.id === ruleId)
      if (rule) {
        updateValidationRule(ruleId, { enabled: !rule.enabled })
      }
    },
    [rules, updateValidationRule]
  )

  // 渲染规则参数编辑器
  const renderRuleParams = useCallback(
    (rule: ValidationRule) => {
      if (readonly) {
        return <div className="text-sm text-muted-foreground">{JSON.stringify(rule.params)}</div>
      }

      switch (rule.type) {
        case 'min_length':
        case 'max_length':
          return (
            <Input
              type="number"
              value={String(rule.params.min || rule.params.max || '')}
              onChange={e => {
                const value = parseInt(e.target.value) || 0
                updateValidationRule(rule.id, {
                  params: { [rule.type === 'min_length' ? 'min' : 'max']: value },
                })
              }}
              min="0"
              placeholder="输入长度"
              disabled={disabled}
            />
          )

        case 'min_value':
        case 'max_value':
          return (
            <Input
              type="number"
              value={String(rule.params.min || rule.params.max || '')}
              onChange={e => {
                const value = parseFloat(e.target.value) || 0
                updateValidationRule(rule.id, {
                  params: { [rule.type === 'min_value' ? 'min' : 'max']: value },
                })
              }}
              placeholder="输入数值"
              disabled={disabled}
            />
          )

        case 'pattern':
          return (
            <Textarea
              value={String(rule.params.pattern || '')}
              onChange={e => {
                updateValidationRule(rule.id, {
                  params: { pattern: e.target.value },
                })
              }}
              placeholder="输入正则表达式"
              disabled={disabled}
              rows={2}
            />
          )

        case 'custom':
          return (
            <Textarea
              value={String(rule.params.function || '')}
              onChange={e => {
                updateValidationRule(rule.id, {
                  params: { function: e.target.value },
                })
              }}
              placeholder="输入自定义验证函数"
              disabled={disabled}
              rows={4}
            />
          )

        default:
          return null
      }
    },
    [readonly, disabled, updateValidationRule]
  )

  // 渲染单个验证规则
  const renderValidationRule = useCallback(
    (rule: ValidationRule) => {
      const isEnabled = rules.find(r => r.id === rule.id)?.enabled ?? false

      return (
        <Card key={rule.id} className={cn(!isEnabled && 'opacity-60')}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={isEnabled}
                  onCheckedChange={() => toggleRuleEnabled(rule.id)}
                  disabled={disabled || readonly}
                />
                <Label className="text-sm font-medium">{rule.label}</Label>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeValidationRule(rule.id)}
                disabled={disabled || readonly}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                ×
              </Button>
            </div>
            {rule.description && (
              <p className="text-xs text-muted-foreground">{rule.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 错误消息 */}
            <div>
              <Label className="text-xs font-medium">错误消息</Label>
              <Input
                value={rule.errorMessage || ''}
                onChange={e => updateValidationRule(rule.id, { errorMessage: e.target.value })}
                placeholder="验证失败时显示的错误消息"
                disabled={disabled || readonly}
                className="mt-1"
              />
            </div>

            {/* 规则参数 */}
            {renderRuleParams(rule)}
          </CardContent>
        </Card>
      )
    },
    [
      rules,
      disabled,
      readonly,
      toggleRuleEnabled,
      removeValidationRule,
      updateValidationRule,
      renderRuleParams,
    ]
  )

  // 获取可添加的规则类型
  const getAddableRuleTypes = useCallback(
    (rules: typeof availableRules) => {
      return rules.filter(template => {
        // 检查是否已经存在相同类型的规则
        return !validationRules.some(rule => rule.type === template.type)
      })
    },
    [validationRules]
  )

  return (
    <div className="validation-editor space-y-4">
      {/* 头部信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">验证规则</h3>
          <p className="text-xs text-muted-foreground">
            {componentType}.{propertyName} ({propertyType})
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {validationRules.filter(r => r.enabled).length} 个激活规则
        </Badge>
      </div>

      {/* 验证规则列表 */}
      {validationRules.length > 0 ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">基础验证</TabsTrigger>
            <TabsTrigger value="advanced">高级验证</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4 space-y-3">
            {validationRules
              .filter(rule => basicRules.some(br => br.type === rule.type))
              .map(renderValidationRule)}

            {/* 添加基础规则 */}
            {getAddableRuleTypes(basicRules).length > 0 && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Select
                      onValueChange={value => addValidationRule(value as ValidationRuleType)}
                      disabled={disabled || readonly}
                    >
                      <SelectTrigger className="mx-auto w-48">
                        <SelectValue placeholder="添加验证规则" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAddableRuleTypes(basicRules).map(rule => (
                          <SelectItem key={rule.type} value={rule.type}>
                            {rule.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="advanced" className="mt-4 space-y-3">
            {validationRules
              .filter(rule => advancedRules.some(ar => ar.type === rule.type))
              .map(renderValidationRule)}

            {/* 添加高级规则 */}
            {getAddableRuleTypes(advancedRules).length > 0 && (
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Select
                      onValueChange={value => addValidationRule(value as ValidationRuleType)}
                      disabled={disabled || readonly}
                    >
                      <SelectTrigger className="mx-auto w-48">
                        <SelectValue placeholder="添加高级验证规则" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAddableRuleTypes(advancedRules).map(rule => (
                          <SelectItem key={rule.type} value={rule.type}>
                            {rule.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        /* 空状态 */
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="text-center text-sm text-muted-foreground">
              <p className="mb-4">暂无验证规则</p>
              <Select
                onValueChange={value => addValidationRule(value as ValidationRuleType)}
                disabled={disabled || readonly}
              >
                <SelectTrigger className="mx-auto w-48">
                  <SelectValue placeholder="添加第一个验证规则" />
                </SelectTrigger>
                <SelectContent>
                  {getAddableRuleTypes(availableRules).map(rule => (
                    <SelectItem key={rule.type} value={rule.type}>
                      {rule.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 使用说明 */}
      <Alert>
        <AlertDescription className="text-xs">
          <strong>提示：</strong>
          验证规则将按照添加顺序依次执行。可以通过开关控制规则的启用状态。
          自定义验证函数接收输入值作为参数，返回布尔值表示验证是否通过。
        </AlertDescription>
      </Alert>
    </div>
  )
}
