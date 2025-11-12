-- 创建组件属性表
CREATE TABLE IF NOT EXISTS component_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  property_key VARCHAR(255) NOT NULL,
  property_value JSONB,
  property_type VARCHAR(50) NOT NULL DEFAULT 'string',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- 约束
  CONSTRAINT component_properties_unique_key UNIQUE(component_id, property_key)
);

-- 创建事件处理器表
CREATE TABLE IF NOT EXISTS component_event_handlers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  handler_config JSONB NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- 索引
  INDEX idx_component_event_handlers_component_id (component_id),
  INDEX idx_component_event_handlers_event_type (event_type)
);

-- 创建组件样式表
CREATE TABLE IF NOT EXISTS component_styles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  style_property VARCHAR(255) NOT NULL,
  style_value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- 约束
  CONSTRAINT component_styles_unique_property UNIQUE(component_id, style_property)
);

-- 创建属性配置历史表
CREATE TABLE IF NOT EXISTS property_config_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_id UUID NOT NULL REFERENCES components(id) ON DELETE CASCADE,
  properties_snapshot JSONB NOT NULL,
  event_handlers_snapshot JSONB,
  styles_snapshot JSONB,
  operation_type VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete'
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),

  -- 索引
  INDEX idx_property_config_history_component_id (component_id),
  INDEX idx_property_config_history_created_at (created_at)
);

-- 创建属性验证规则表
CREATE TABLE IF NOT EXISTS property_validation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_type VARCHAR(100) NOT NULL,
  property_key VARCHAR(255) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  rule_params JSONB,
  error_message TEXT,
  required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 约束
  CONSTRAINT validation_rules_unique_key UNIQUE(component_type, property_key, rule_type)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_component_properties_component_id ON component_properties(component_id);
CREATE INDEX IF NOT EXISTS idx_component_properties_key ON component_properties(property_key);
CREATE INDEX IF NOT EXISTS idx_component_properties_updated_at ON component_properties(updated_at);

-- 创建RLS策略
ALTER TABLE component_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_event_handlers ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_styles ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_config_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_validation_rules ENABLE ROW LEVEL SECURITY;

-- 组件属性RLS策略
CREATE POLICY "Users can view their component properties" ON component_properties
  FOR SELECT USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM projects p
      JOIN components c ON c.project_id = p.id
      WHERE c.id = component_properties.component_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their component properties" ON component_properties
  FOR INSERT WITH CHECK (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM projects p
      JOIN components c ON c.project_id = p.id
      WHERE c.id = component_properties.component_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their component properties" ON component_properties
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM projects p
      JOIN components c ON c.project_id = p.id
      WHERE c.id = component_properties.component_id
      AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their component properties" ON component_properties
  FOR DELETE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM projects p
      JOIN components c ON c.project_id = p.id
      WHERE c.id = component_properties.component_id
      AND p.owner_id = auth.uid()
    )
  );

-- 创建触发器函数以更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_component_properties_updated_at
  BEFORE UPDATE ON component_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_event_handlers_updated_at
  BEFORE UPDATE ON component_event_handlers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_styles_updated_at
  BEFORE UPDATE ON component_styles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_validation_rules_updated_at
  BEFORE UPDATE ON property_validation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();