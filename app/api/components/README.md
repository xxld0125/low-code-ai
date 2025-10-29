# 基础组件库 API

这是低代码平台基础组件库的RESTful API接口文档。提供了完整的组件管理功能，包括组件的增删改查、属性管理等。

## API 基础信息

- **基础路径**: `/api/components`
- **API版本**: v1.0.0
- **数据格式**: JSON
- **字符编码**: UTF-8
- **认证方式**: Bearer Token (JWT)

## 通用响应格式

### 成功响应

```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": { ... }
  }
}
```

## 通用错误代码

| 错误代码                   | HTTP状态码 | 描述                 |
| -------------------------- | ---------- | -------------------- |
| `UNAUTHORIZED`             | 401        | 未授权访问，需要登录 |
| `FORBIDDEN`                | 403        | 权限不足             |
| `NOT_FOUND`                | 404        | 资源不存在           |
| `VALIDATION_ERROR`         | 400        | 请求参数验证失败     |
| `COMPONENT_NOT_FOUND`      | 404        | 组件不存在           |
| `COMPONENT_ALREADY_EXISTS` | 409        | 组件已存在           |
| `PROP_ALREADY_EXISTS`      | 409        | 属性已存在           |
| `COMPONENT_IN_USE`         | 409        | 组件正在使用中       |
| `INTERNAL_SERVER_ERROR`    | 500        | 服务器内部错误       |

## API 端点

### 1. 组件管理

#### 1.1 获取组件列表

**端点**: `GET /api/components`

**描述**: 获取所有可用的组件定义，支持分类过滤和搜索

**查询参数**:

- `category` (可选): 组件分类
  - 可选值: `basic`, `display`, `layout`, `form`, `advanced`, `custom`
- `status` (可选): 组件状态，默认 `active`
  - 可选值: `draft`, `active`, `deprecated`, `archived`
- `search` (可选): 搜索关键词（搜索名称、描述、标签）
- `page` (可选): 页码，默认 `1`
- `limit` (可选): 每页数量，默认 `20`，最大 `100`

**示例请求**:

```bash
GET /api/components?category=basic&status=active&page=1&limit=20
GET /api/components?search=button&page=1&limit=10
```

**成功响应**:

```json
{
  "success": true,
  "data": {
    "components": [
      {
        "id": "component-basic-button",
        "name": "Button",
        "description": "可点击的按钮组件",
        "version": "1.0.0",
        "author": "dev@lowcode-ai.com",
        "category": "basic",
        "subcategory": "form",
        "tags": ["button", "click", "form"],
        "component_path": "/components/lowcode/basic/Button",
        "preview_path": "/components/lowcode/basic/Button/Preview",
        "icon_path": "/components/lowcode/basic/Button/Icon",
        "props_schema": [...],
        "default_props": {
          "text": "Click me",
          "variant": "default"
        },
        "default_styles": {...},
        "constraints": {...},
        "validation_rules": [],
        "status": "active",
        "deprecated": false,
        "created_at": "2025-10-28T10:00:00Z",
        "updated_at": "2025-10-28T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "per_page": 20,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### 1.2 创建新组件

**端点**: `POST /api/components`

**描述**: 创建一个新的组件定义

**请求体**:

```json
{
  "name": "Button",
  "description": "可点击的按钮组件",
  "category": "basic",
  "subcategory": "form",
  "tags": ["button", "click", "form"],
  "component_path": "/components/lowcode/basic/Button",
  "preview_path": "/components/lowcode/basic/Button/Preview",
  "icon_path": "/components/lowcode/basic/Button/Icon",
  "props_schema": [...],
  "default_props": {
    "text": "Click me",
    "variant": "default"
  },
  "default_styles": {...}
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "component-basic-button",
    "name": "Button",
    ...
  }
}
```

#### 1.3 获取组件详情

**端点**: `GET /api/components/{id}`

**描述**: 根据组件ID获取组件的详细信息

**路径参数**:

- `id`: 组件唯一标识

**示例请求**:

```bash
GET /api/components/component-basic-button
```

**成功响应**:

```json
{
  "success": true,
  "data": {
    "id": "component-basic-button",
    "name": "Button",
    "description": "可点击的按钮组件",
    ...
  }
}
```

#### 1.4 更新组件

**端点**: `PUT /api/components/{id}`

**描述**: 更新现有组件的定义和配置

**路径参数**:

- `id`: 组件唯一标识

**请求体**:

```json
{
  "name": "Updated Button",
  "description": "更新后的按钮组件",
  "tags": ["button", "click", "form", "updated"],
  "status": "active"
}
```

**成功响应**:

```json
{
  "success": true,
  "data": {
    "id": "component-basic-button",
    "name": "Updated Button",
    ...
  }
}
```

#### 1.5 删除组件

**端点**: `DELETE /api/components/{id}`

**描述**: 删除指定的组件定义（软删除，标记为archived）

**路径参数**:

- `id`: 组件唯一标识

**成功响应**:

```json
{
  "success": true,
  "message": "组件\"Button\"删除成功"
}
```

### 2. 属性管理

#### 2.1 获取组件属性定义

**端点**: `GET /api/components/{id}/props`

**描述**: 获取指定组件的所有属性定义

**路径参数**:

- `id`: 组件唯一标识

**查询参数**:

- `group` (可选): 属性分组过滤
  - 可选值: `basic`, `style`, `layout`, `advanced`

**示例请求**:

```bash
GET /api/components/component-basic-button/props?group=basic
GET /api/components/component-basic-button/props
```

**成功响应**:

```json
{
  "success": true,
  "data": [
    {
      "id": "prop-component-basic-button-text",
      "name": "text",
      "type": "string",
      "label": "按钮文字",
      "description": "按钮上显示的文字内容",
      "required": true,
      "default_value": "Click me",
      "group": "basic",
      "category": "content",
      "order": 1,
      "options": [],
      "validation": [],
      "editor_config": {
        "type": "text",
        "placeholder": "请输入按钮文字"
      },
      "responsive": false,
      "dependencies": []
    }
  ]
}
```

#### 2.2 添加组件属性

**端点**: `POST /api/components/{id}/props`

**描述**: 为指定组件添加新的属性定义

**路径参数**:

- `id`: 组件唯一标识

**请求体**:

```json
{
  "name": "customClass",
  "type": "string",
  "label": "自定义类名",
  "description": "组件的自定义CSS类名",
  "required": false,
  "group": "advanced",
  "editor_config": {
    "type": "text",
    "placeholder": "请输入CSS类名"
  }
}
```

**成功响应** (201):

```json
{
  "success": true,
  "data": {
    "id": "prop-component-basic-button-customclass",
    "name": "customClass",
    "type": "string",
    ...
  },
  "message": "属性\"自定义类名\"添加成功"
}
```

## 使用示例

### JavaScript/TypeScript 示例

```typescript
// 获取组件列表
async function getComponents(category?: string) {
  const params = new URLSearchParams()
  if (category) params.append('category', category)

  const response = await fetch(`/api/components?${params}`)
  const result = await response.json()

  if (result.success) {
    return result.data.components
  } else {
    throw new Error(result.error.message)
  }
}

// 创建组件
async function createComponent(componentData: any) {
  const response = await fetch('/api/components', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(componentData),
  })

  const result = await response.json()

  if (result.success) {
    return result.data
  } else {
    throw new Error(result.error.message)
  }
}

// 获取组件详情
async function getComponent(id: string) {
  const response = await fetch(`/api/components/${id}`)
  const result = await response.json()

  if (result.success) {
    return result.data
  } else {
    throw new Error(result.error.message)
  }
}

// 添加组件属性
async function addComponentProperty(componentId: string, propData: any) {
  const response = await fetch(`/api/components/${componentId}/props`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(propData),
  })

  const result = await response.json()

  if (result.success) {
    return result.data
  } else {
    throw new Error(result.error.message)
  }
}
```

### cURL 示例

```bash
# 获取所有基础组件
curl -X GET "http://localhost:3000/api/components?category=basic&status=active"

# 获取组件详情
curl -X GET "http://localhost:3000/api/components/component-basic-button"

# 创建新组件
curl -X POST "http://localhost:3000/api/components" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "CustomButton",
    "description": "自定义按钮组件",
    "category": "basic",
    "component_path": "/components/lowcode/basic/CustomButton",
    "preview_path": "/components/lowcode/basic/CustomButton/Preview",
    "icon_path": "/components/lowcode/basic/CustomButton/Icon"
  }'

# 添加组件属性
curl -X POST "http://localhost:3000/api/components/component-basic-button/props" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "size",
    "type": "select",
    "label": "按钮大小",
    "description": "选择按钮的大小",
    "required": true,
    "options": [
      {"value": "small", "label": "小"},
      {"value": "medium", "label": "中"},
      {"value": "large", "label": "大"}
    ]
  }'
```

## 错误处理

API 使用标准的HTTP状态码和统一的错误响应格式。客户端应该检查响应的 `success` 字段来判断请求是否成功。

### 常见错误处理示例

```typescript
async function handleApiCall() {
  try {
    const response = await fetch('/api/components')
    const result = await response.json()

    if (!result.success) {
      // 根据错误代码进行不同处理
      switch (result.error.code) {
        case 'UNAUTHORIZED':
          // 跳转到登录页面
          redirectToLogin()
          break
        case 'VALIDATION_ERROR':
          // 显示验证错误信息
          showValidationError(result.error.details)
          break
        case 'COMPONENT_NOT_FOUND':
          // 显示组件不存在错误
          showNotFoundError(result.error.message)
          break
        default:
          // 显示通用错误信息
          showGenericError(result.error.message)
      }
      return
    }

    // 处理成功响应
    handleSuccessResponse(result.data)
  } catch (error) {
    // 处理网络错误等
    console.error('API调用失败:', error)
    showNetworkError()
  }
}
```

## 安全考虑

1. **认证**: 所有写操作API都需要用户认证
2. **授权**: 用户只能访问有权限的组件
3. **输入验证**: 所有输入参数都经过严格验证
4. **速率限制**: 实施请求速率限制防止滥用
5. **XSS防护**: 所有字符串输出都经过清理
6. **CSRF防护**: 使用CSRF令牌保护跨站请求

## 版本控制

当前API版本为 v1.0.0。未来可能会有向后兼容的版本更新，版本信息会在响应头中提供。

## 数据模型

详细的API数据模型定义请参考 `types.ts` 文件中的TypeScript类型定义。
