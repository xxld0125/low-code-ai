# 组件属性配置面板

这个目录包含FlowBase低代码平台的组件属性配置面板功能实现。

## 目录结构

```
components/designer/PropertiesPanel/
├── PropertiesPanel.tsx              # 主属性面板组件
├── components/                      # 属性面板子组件
│   ├── PropertyForm.tsx            # 动态属性表单
│   ├── PropertyEditor.tsx          # 属性编辑器
│   ├── TextPropertyEditor.tsx      # 文本属性编辑器
│   ├── BooleanPropertyEditor.tsx   # 布尔属性编辑器
│   ├── ColorPropertyEditor.tsx     # 颜色属性编辑器
│   ├── SizePropertyEditor.tsx      # 尺寸属性编辑器
│   ├── SpacingPropertyEditor.tsx   # 间距属性编辑器
│   ├── StyleConfig.tsx             # 样式配置
│   ├── EventConfig.tsx             # 事件配置
│   ├── EventHandler.tsx            # 事件处理器
│   └── EventActionConfig.tsx       # 事件动作配置
lib/designer/
├── form-generator.ts               # 动态表单生成引擎
├── preview-manager.ts              # 实时预览管理
├── validation/                     # 验证引擎
│   ├── index.ts                    # 验证入口
│   ├── validators.ts               # 验证器
│   └── rules.ts                    # 验证规则
├── event-engine.ts                 # 事件执行引擎
├── event-validation.ts             # 事件验证
├── style-presets.ts                # 样式预设
├── style-utils.ts                  # 样式工具
├── custom-editors/                 # 自定义编辑器
├── history/                        # 撤销重做管理
│   ├── index.ts                    # 历史管理入口
│   └── history-store.ts            # 历史状态管理
└── property-templates.ts           # 属性模板
stores/property-store/
├── index.ts                        # 属性状态管理入口
├── property-store.ts               # 属性配置store
└── selectors.ts                    # 状态选择器
types/designer/
├── index.ts                        # 设计器类型入口
├── property-config.ts              # 属性配置类型
├── component-props.ts              # 组件属性类型
└── validation.ts                   # 验证类型
hooks/
└── usePropertyEditor.ts            # 属性编辑器Hook
tests/
├── components/designer/            # 组件测试
│   ├── PropertiesPanel.test.tsx
│   └── components/                 # 子组件测试
├── setup/                          # 测试设置
│   └── designer-setup.ts
└── mocks/                          # 测试Mock
    └── fileMock.js
```

## 核心功能

1. **基础属性配置**: 文本内容、占位符、必填设置
2. **样式配置**: 尺寸、颜色、边距、对齐方式
3. **事件绑定**: 点击事件、提交事件
4. **实时预览**: 配置即时生效
5. **撤销重做**: 完整的历史管理
6. **属性验证**: 多层验证机制

## 技术特性

- TypeScript严格模式，类型安全
- Zustand + Immer状态管理
- shadcn/ui组件库集成
- 虚拟化性能优化
- 完整的测试覆盖

## 性能指标

- 属性面板交互响应时间: <100ms
- 画布组件渲染时间: <200ms
- 支持同时配置组件数量: 1000个