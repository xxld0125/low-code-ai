-- 页面设计器数据库表结构迁移
-- 创建日期: 2025-10-27
-- 功能: 基础页面设计器 (003-page-designer)

-- 创建页面设计表
CREATE TABLE IF NOT EXISTS page_designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 页面配置 (JSONB)
  config JSONB NOT NULL DEFAULT '{}',

  -- 组件树结构
  root_component_id UUID NOT NULL,
  component_tree JSONB NOT NULL DEFAULT '{}',

  -- 系统字段
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  thumbnail_url TEXT,

  -- 协作字段
  shared_with UUID[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',

  -- 约束
  CONSTRAINT page_designs_name_user_unique UNIQUE(name, user_id),
  CONSTRAINT page_designs_version_positive CHECK (version > 0)
);

-- 创建组件实例表
CREATE TABLE IF NOT EXISTS component_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_design_id UUID NOT NULL REFERENCES page_designs(id) ON DELETE CASCADE,
  component_type VARCHAR(50) NOT NULL,
  parent_id UUID REFERENCES component_instances(id) ON DELETE CASCADE,

  -- 层级和位置
  position JSONB NOT NULL DEFAULT '{"z_index": 0, "order": 0}',

  -- 组件属性
  props JSONB NOT NULL DEFAULT '{}',
  styles JSONB NOT NULL DEFAULT '{}',
  events JSONB NOT NULL DEFAULT '{}',

  -- 响应式配置
  responsive JSONB NOT NULL DEFAULT '{}',

  -- 布局属性
  layout_props JSONB,

  -- 系统字段
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  version INTEGER NOT NULL DEFAULT 1,

  -- 元数据
  meta JSONB NOT NULL DEFAULT '{"locked": false, "hidden": false}',

  -- 约束
  CONSTRAINT component_instances_valid_type CHECK (
    component_type IN (
      'button', 'input', 'text', 'image', 'link', 'heading', 'paragraph', 'divider', 'spacer',
      'container', 'row', 'col',
      'form', 'textarea', 'select', 'checkbox', 'radio',
      'navbar', 'sidebar', 'breadcrumb', 'tabs',
      'list', 'table', 'card', 'grid'
    )
  ),
  CONSTRAINT component_instances_version_positive CHECK (version > 0),
  CONSTRAINT component_instances_order_positive CHECK ((position->>'order')::integer >= 0)
);

-- 创建设计历史表
CREATE TABLE IF NOT EXISTS design_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_design_id UUID NOT NULL REFERENCES page_designs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 操作信息
  action VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,

  -- 状态快照
  before_state JSONB NOT NULL,
  after_state JSONB NOT NULL,

  -- 影响的组件
  affected_components UUID[] DEFAULT '{}',

  -- 系统字段
  created_at TIMESTAMPTZ DEFAULT NOW(),
  session_id UUID,

  -- 约束
  CONSTRAINT design_history_valid_action CHECK (
    action IN (
      'create_component', 'update_component', 'delete_component',
      'move_component', 'copy_component', 'paste_component',
      'undo', 'redo', 'batch_operation'
    )
  )
);

-- 创建索引 - page_designs表
CREATE INDEX IF NOT EXISTS idx_page_designs_user_id ON page_designs(user_id);
CREATE INDEX IF NOT EXISTS idx_page_designs_status ON page_designs(status);
CREATE INDEX IF NOT EXISTS idx_page_designs_created_at ON page_designs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_designs_tags ON page_designs USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_page_designs_shared_with ON page_designs USING GIN(shared_with);

-- 创建索引 - component_instances表
CREATE INDEX IF NOT EXISTS idx_component_instances_page_design_id ON component_instances(page_design_id);
CREATE INDEX IF NOT EXISTS idx_component_instances_parent_id ON component_instances(parent_id);
CREATE INDEX IF NOT EXISTS idx_component_instances_type ON component_instances(component_type);
CREATE INDEX IF NOT EXISTS idx_component_instances_position ON component_instances USING GIN(position);

-- 创建索引 - design_history表
CREATE INDEX IF NOT EXISTS idx_design_history_page_design_id ON design_history(page_design_id);
CREATE INDEX IF NOT EXISTS idx_design_history_user_id ON design_history(user_id);
CREATE INDEX IF NOT EXISTS idx_design_history_created_at ON design_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_design_history_session_id ON design_history(session_id);

-- 启用RLS (Row Level Security)
ALTER TABLE page_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_history ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略 - page_designs表
-- 用户可以查看自己的页面设计
CREATE POLICY "Users can view own page designs" ON page_designs
  FOR SELECT USING (auth.uid() = user_id);

-- 用户可以查看被共享的页面设计
CREATE POLICY "Users can view shared page designs" ON page_designs
  FOR SELECT USING (auth.uid() = ANY(shared_with));

-- 用户可以创建自己的页面设计
CREATE POLICY "Users can create own page designs" ON page_designs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的页面设计
CREATE POLICY "Users can update own page designs" ON page_designs
  FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的页面设计
CREATE POLICY "Users can delete own page designs" ON page_designs
  FOR DELETE USING (auth.uid() = user_id);

-- 创建RLS策略 - component_instances表
-- 通过页面设计控制访问权限
CREATE POLICY "Component access via page design" ON component_instances
  FOR ALL USING (
    page_design_id IN (
      SELECT id FROM page_designs
      WHERE auth.uid() = user_id OR auth.uid() = ANY(shared_with)
    )
  );

-- 创建RLS策略 - design_history表
-- 通过页面设计控制访问权限
CREATE POLICY "History access via page design" ON design_history
  FOR ALL USING (
    page_design_id IN (
      SELECT id FROM page_designs
      WHERE auth.uid() = user_id OR auth.uid() = ANY(shared_with)
    )
  );

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器 - 自动更新updated_at字段
CREATE TRIGGER update_page_designs_updated_at
    BEFORE UPDATE ON page_designs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_instances_updated_at
    BEFORE UPDATE ON component_instances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();