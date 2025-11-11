-- 数据表设计器迁移
-- 创建日期: 2025-11-11
-- 功能: 为数据模型设计器创建数据表

-- 创建数据表定义表
CREATE TABLE IF NOT EXISTS data_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  table_name VARCHAR(255) NOT NULL,

  -- 表结构定义
  fields JSONB NOT NULL DEFAULT '[]',
  relationships JSONB NOT NULL DEFAULT '[]',
  constraints JSONB NOT NULL DEFAULT '{}',
  indexes JSONB NOT NULL DEFAULT '[]',

  -- 状态
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),

  -- 系统字段
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),

  -- 版本控制
  version INTEGER NOT NULL DEFAULT 1,

  -- 元数据
  config JSONB NOT NULL DEFAULT '{}',

  -- 约束
  CONSTRAINT data_tables_unique_table_name UNIQUE(table_name),
  CONSTRAINT data_tables_version_positive CHECK (version > 0)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_data_tables_project_id ON data_tables(project_id);
CREATE INDEX IF NOT EXISTS idx_data_tables_status ON data_tables(status);
CREATE INDEX IF NOT EXISTS idx_data_tables_table_name ON data_tables(table_name);
CREATE INDEX IF NOT EXISTS idx_data_tables_created_at ON data_tables(created_at DESC);

-- 启用RLS
ALTER TABLE data_tables ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略
-- 用户可以查看自己项目的数据表
CREATE POLICY "Users can view own project data tables" ON data_tables
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  );

-- 用户可以创建自己项目的数据表
CREATE POLICY "Users can create own project data tables" ON data_tables
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  );

-- 用户可以更新自己项目的数据表
CREATE POLICY "Users can update own project data tables" ON data_tables
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  );

-- 用户可以删除自己项目的数据表
CREATE POLICY "Users can delete own project data tables" ON data_tables
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects
      WHERE user_id = auth.uid()
    )
  );

-- 创建更新时间触发器
CREATE TRIGGER update_data_tables_updated_at
    BEFORE UPDATE ON data_tables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();