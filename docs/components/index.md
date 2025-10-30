# 组件库索引

## 快速导航

### [📖 组件库总览](./README.md)

查看组件库的概述、快速开始和最佳实践。

### 🔧 基础组件

基础组件用于构建用户界面和收集用户输入。

| 组件                        | 描述       | 状态 |
| --------------------------- | ---------- | ---- |
| [Button](./basic/Button.md) | 按钮组件   | ✅   |
| Input                       | 输入框组件 | 📝   |
| Textarea                    | 文本域组件 | 📝   |
| Select                      | 选择器组件 | 📝   |
| Checkbox                    | 复选框组件 | 📝   |
| Radio                       | 单选框组件 | 📝   |

### 🎨 展示组件

展示组件用于显示内容和信息。

| 组件    | 描述     | 状态 |
| ------- | -------- | ---- |
| Text    | 文本组件 | 📝   |
| Heading | 标题组件 | 📝   |
| Image   | 图片组件 | 📝   |
| Card    | 卡片组件 | 📝   |
| Badge   | 徽章组件 | 📝   |

### 📐 布局组件

布局组件用于组织页面结构和响应式设计。

| 组件      | 描述       | 状态 |
| --------- | ---------- | ---- |
| Container | 容器组件   | 📝   |
| Row       | 行组件     | 📝   |
| Col       | 列组件     | 📝   |
| Divider   | 分割线组件 | 📝   |
| Spacer    | 间距组件   | 📝   |

### 🛠️ 编辑器组件

编辑器组件用于配置组件属性、样式和验证规则。

| 组件             | 描述       | 状态 |
| ---------------- | ---------- | ---- |
| PropertyEditor   | 属性编辑器 | ✅   |
| StyleEditor      | 样式编辑器 | ✅   |
| ValidationEditor | 验证编辑器 | ✅   |

## 组件状态说明

- ✅ **已完成**: 组件已实现并通过测试
- 📝 **计划中**: 组件正在开发中
- 🚧 **开发中**: 组件正在进行测试
- ❌ **待开发**: 组件尚未开始开发

## 按类别统计

| 类别       | 组件数量 | 已完成 | 开发中 | 待开发 |
| ---------- | -------- | ------ | ------ | ------ |
| 基础组件   | 6        | 1      | 5      | 0      |
| 展示组件   | 5        | 0      | 5      | 0      |
| 布局组件   | 5        | 0      | 5      | 0      |
| 编辑器组件 | 3        | 3      | 0      | 0      |
| **总计**   | **19**   | **4**  | **15** | **0**  |

## 开发优先级

### P1 - 高优先级

- ✅ Button (已完成)
- 📝 Input (表单输入的核心组件)
- 📝 Textarea (多行文本输入)
- 📝 Select (选择输入)

### P2 - 中优先级

- 📝 Checkbox (复选选择)
- 📝 Radio (单选选择)
- 📝 Text (基础文本显示)
- 📝 Heading (标题文本)
- 📝 Image (图片显示)

### P3 - 低优先级

- 📝 Card (卡片容器)
- 📝 Badge (标记显示)
- 📝 Container (布局容器)
- 📝 Row/Col (栅格布局)
- 📝 Divider/Spacer (分割和间距)

## 快速参考

### 基础组件使用模式

```typescript
// 表单组件组合
<form>
  <Input placeholder="用户名" />
  <Input type="password" placeholder="密码" />
  <Checkbox label="记住我" />
  <Button text="登录" variant="primary" />
</form>

// 展示组件组合
<Card>
  <Heading level={2} content="文章标题" />
  <Text content="文章内容..." />
  <Badge text="新" variant="primary" />
  <Button text="阅读更多" />
</Card>

// 布局组件组合
<Container maxWidth="lg">
  <Row>
    <Col span={8}>
      <Text content="主要内容" />
    </Col>
    <Col span={4}>
      <Text content="侧边栏" />
    </Col>
  </Row>
</Container>
```

### 编辑器使用模式

```typescript
// 属性编辑器
<PropertyEditor
  componentType="button"
  componentId="btn-123"
  properties={buttonProps}
  onPropertyChange={handlePropertyChange}
/>

// 样式编辑器
<StyleEditor
  componentDefinition={buttonDef}
  componentStyles={buttonStyles}
  onStyleChange={handleStyleChange}
/>

// 验证编辑器
<ValidationEditor
  componentType="input"
  propertyName="email"
  propertyType="email"
  validationRules={emailRules}
  onValidationRulesChange={handleValidationChange}
/>
```

## 贡献指南

### 文档贡献

- 为新组件创建文档
- 更新现有组件文档
- 改进文档结构和内容

### 组件开发

1. 查看组件开发规范
2. 创建组件目录结构
3. 实现组件功能
4. 编写单元测试
5. 添加组件文档
6. 更新索引文档

### 提交流程

1. Fork 项目仓库
2. 创建功能分支
3. 提交代码更改
4. 创建Pull Request
5. 代码审查
6. 合并到主分支

## 技术支持

如需技术支持或遇到问题，请：

1. 查看相关组件文档
2. 检查已知问题列表
3. 提交Issue描述问题
4. 联系开发团队

## 版本信息

- **当前版本**: 1.0.0
- **发布日期**: 2025-10-30
- **更新频率**: 根据需求定期更新

## 许可证

本项目采用 MIT 许可证，详情请查看项目根目录的 LICENSE 文件。
