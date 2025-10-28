-- 创建页面设计器存储过程
-- 创建日期: 2025-10-28
-- 功能: 页面设计器的事务性存储过程

-- 创建带根组件的页面设计存储过程
CREATE OR REPLACE FUNCTION create_page_design_with_root(
  p_user_id UUID,
  p_name VARCHAR(255),
  p_description TEXT DEFAULT NULL,
  p_config JSONB DEFAULT '{}',
  p_tags TEXT[] DEFAULT '{}'
)
RETURNS TABLE (
  page_design_id UUID,
  root_component_id UUID,
  name VARCHAR(255),
  description TEXT,
  config JSONB,
  component_tree JSONB,
  tags TEXT[],
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  version INTEGER,
  status VARCHAR(20)
) AS $$
DECLARE
  v_page_design_id UUID;
  v_root_component_id UUID;
  v_component_tree JSONB;
BEGIN
  -- 开始事务
  -- 创建页面设计（先使用临时UUID）
  INSERT INTO page_designs (
    user_id,
    name,
    description,
    config,
    tags,
    root_component_id,
    component_tree
  ) VALUES (
    p_user_id,
    p_name,
    p_description,
    p_config,
    p_tags,
    gen_random_uuid(), -- 临时UUID，稍后更新
    '{}' -- 临时空组件树，稍后更新
  ) RETURNING id INTO v_page_design_id;

  -- 创建根组件
  INSERT INTO component_instances (
    page_design_id,
    component_type,
    position,
    props,
    styles,
    layout_props,
    meta
  ) VALUES (
    v_page_design_id,
    'container',
    '{"z_index": 0, "order": 0}',
    '{"direction": "column", "padding": 16, "gap": 16}',
    '{"width": "100%", "minHeight": "100vh", "padding": 16}',
    '{"container": {"direction": "column", "wrap": false, "justify": "start", "align": "stretch", "gap": 16}}',
    '{"locked": false, "hidden": false, "custom_name": "根容器"}'
  ) RETURNING id INTO v_root_component_id;

  -- 构建组件树
  v_component_tree := jsonb_build_object(
    'version', '1.0',
    'root_id', v_root_component_id,
    'components', jsonb_build_object(
      v_root_component_id::text, jsonb_build_object(
        'id', v_root_component_id,
        'page_design_id', v_page_design_id,
        'component_type', 'container',
        'position', '{"z_index": 0, "order": 0}',
        'props', '{"direction": "column", "padding": 16, "gap": 16}',
        'styles', '{"width": "100%", "minHeight": "100vh", "padding": 16}',
        'layout_props', '{"container": {"direction": "column", "wrap": false, "justify": "start", "align": "stretch", "gap": 16}}',
        'meta', '{"locked": false, "hidden": false, "custom_name": "根容器"}'
      )
    ),
    'hierarchy', jsonb_build_array(
      jsonb_build_object(
        'component_id', v_root_component_id,
        'parent_id', NULL,
        'children', '[]'::jsonb,
        'depth', 0,
        'path', '0'
      )
    )
  );

  -- 更新页面设计的根组件ID和组件树
  UPDATE page_designs
  SET
    root_component_id = v_root_component_id,
    component_tree = v_component_tree
  WHERE id = v_page_design_id;

  -- 返回创建的页面设计数据
  RETURN QUERY
  SELECT
    pd.id,
    pd.root_component_id,
    pd.name,
    pd.description,
    pd.config,
    pd.component_tree,
    pd.tags,
    pd.created_at,
    pd.updated_at,
    pd.version,
    pd.status
  FROM page_designs pd
  WHERE pd.id = v_page_design_id;

END;
$$ LANGUAGE plpgsql;

-- 添加注释
COMMENT ON FUNCTION create_page_design_with_root IS '创建带根组件的页面设计，确保数据一致性';