/**
 * 组件注册系统类型定义
 * 功能模块: 基础组件库 (004-basic-component-library) - T006任务
 * 创建日期: 2025-10-29
 * 描述: 属性定义和验证系统的核心类型定义
 */
/**
 * 组件分类枚举
 */
export declare enum ComponentCategory {
    BASIC = "basic",// 基础组件 (Button, Input等)
    DISPLAY = "display",// 展示组件 (Text, Image等)
    LAYOUT = "layout",// 布局组件 (Container, Grid等)
    FORM = "form",// 表单组件 (FormField, FormSection等)
    ADVANCED = "advanced",// 高级组件
    CUSTOM = "custom"
}
/**
 * 属性类型枚举
 */
export declare enum PropType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    COLOR = "color",
    DATE = "date",
    TIME = "time",
    URL = "url",
    EMAIL = "email",
    SELECT = "select",
    MULTI_SELECT = "multi_select",
    RADIO = "radio",
    CHECKBOX = "checkbox",
    ARRAY = "array",
    OBJECT = "object",
    JSON = "json",
    SIZE = "size",
    SPACING = "spacing",
    BORDER = "border",
    SHADOW = "shadow",
    RESPONSIVE_SIZE = "responsive_size",
    RESPONSIVE_SPACING = "responsive_spacing"
}
/**
 * 属性类别枚举
 */
export declare enum PropCategory {
    BASIC = "basic",// 基础属性
    STYLE = "style",// 样式属性
    LAYOUT = "layout",// 布局属性
    EVENT = "event",// 事件属性
    ADVANCED = "advanced"
}
/**
 * 组件状态枚举
 */
export declare enum ComponentStatus {
    DRAFT = "draft",// 草稿
    ACTIVE = "active",// 激活
    DEPRECATED = "deprecated",// 废弃
    ARCHIVED = "archived"
}
/**
 * 断点枚举
 */
export declare enum Breakpoint {
    XS = "xs",// 超小屏幕
    SM = "sm",// 小屏幕
    MD = "md",// 中等屏幕
    LG = "lg",// 大屏幕
    XL = "xl",// 超大屏幕
    XXL = "xxl"
}
/**
 * 属性选项定义
 */
export interface PropOption {
    value: any;
    label: string;
    description?: string;
    icon?: string;
    disabled?: boolean;
    group?: string;
}
/**
 * 属性约束定义
 */
export interface PropConstraints {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    patternMessage?: string;
    min?: number;
    max?: number;
    step?: number;
    precision?: number;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
    requiredKeys?: string[];
    allowedKeys?: string[];
    customValidator?: string;
    constraintMessage?: string;
}
/**
 * 显示提示定义
 */
export interface DisplayHint {
    type: 'condition' | 'dependency' | 'format' | 'layout';
    condition?: string;
    format?: string;
    layout?: 'inline' | 'block' | 'grid';
    width?: string | number;
    height?: string | number;
}
/**
 * 验证规则定义
 */
export interface ValidationRule {
    name: string;
    type: 'required' | 'type' | 'format' | 'range' | 'custom';
    condition?: string;
    message: string;
    severity?: 'error' | 'warning' | 'info';
    async?: boolean;
}
/**
 * 编辑器配置定义
 */
export interface EditorConfig {
    widget: 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'color' | 'date' | 'time' | 'slider' | 'switch' | 'file' | 'custom';
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    label?: string;
    description?: string;
    helpText?: string;
    tooltip?: string;
    options?: PropOption[];
    optionGroups?: {
        [group: string]: string;
    };
    width?: string | number;
    height?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
    maxLength?: number;
    type?: string;
    min?: number | string;
    max?: number | string;
    customWidget?: string;
    widgetProps?: Record<string, any>;
    format?: string;
    parse?: string;
    showWhen?: string;
    hideWhen?: string;
    enableWhen?: string;
    disableWhen?: string;
}
/**
 * 属性依赖关系定义
 */
export interface PropertyDependency {
    type: 'value' | 'visibility' | 'enablement' | 'validation';
    sourceProperty: string;
    condition: DependencyCondition;
    action: DependencyAction;
}
/**
 * 依赖条件定义
 */
export interface DependencyCondition {
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in' | 'contains' | 'not_contains' | 'regex' | 'custom';
    value: any;
    customFunction?: string;
}
/**
 * 依赖动作定义
 */
export interface DependencyAction {
    type: 'show' | 'hide' | 'enable' | 'disable' | 'set_value' | 'clear_value' | 'add_validation' | 'remove_validation' | 'update_options';
    value?: any;
    options?: PropOption[];
    validation?: ValidationRule[];
}
/**
 * 组件样式配置
 */
export interface ComponentStyles {
    display?: CSSDisplayProperty;
    position?: CSSPositionProperty;
    visibility?: CSSVisibilityProperty;
    opacity?: number;
    zIndex?: number;
    width?: string | number;
    height?: string | number;
    minWidth?: string | number;
    minHeight?: string | number;
    maxWidth?: string | number;
    maxHeight?: string | number;
    margin?: SpacingValue;
    padding?: SpacingValue;
    flex?: FlexProperties;
    grid?: GridProperties;
    color?: string;
    backgroundColor?: string;
    fontSize?: string | number;
    fontWeight?: string | number;
    fontFamily?: string;
    lineHeight?: string | number;
    textAlign?: CSSTextAlignProperty;
    textDecoration?: CSSTextDecorationProperty;
    border?: BorderProperties;
    borderRadius?: BorderRadiusValue;
    boxShadow?: string;
    transform?: TransformProperties;
    transition?: TransitionProperties;
    customCSS?: string;
    responsive?: Record<Breakpoint, Partial<ComponentStyles>>;
}
/**
 * 间距值定义
 */
export interface SpacingValue {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
    all?: string | number;
    x?: string | number;
    y?: string | number;
}
/**
 * 弹性属性定义
 */
export interface FlexProperties {
    direction?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
    justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
    alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
    alignContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'stretch';
    grow?: number;
    shrink?: number;
    basis?: string | number;
    order?: number;
    alignSelf?: 'auto' | 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
}
/**
 * 网格属性定义
 */
export interface GridProperties {
    templateColumns?: string;
    templateRows?: string;
    templateAreas?: string;
    columnGap?: string | number;
    rowGap?: string | number;
    gap?: string | number;
    justifyContent?: 'start' | 'end' | 'center' | 'stretch';
    alignContent?: 'start' | 'end' | 'center' | 'stretch' | 'space-around' | 'space-between' | 'space-evenly';
    placeItems?: 'start' | 'end' | 'center' | 'stretch';
    gridArea?: string;
    gridColumn?: string;
    gridRow?: string;
}
/**
 * 边框属性定义
 */
export interface BorderProperties {
    width?: string | number;
    style?: 'none' | 'hidden' | 'dotted' | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
    color?: string;
    radius?: BorderRadiusValue;
    top?: {
        width?: string | number;
        style?: string;
        color?: string;
    };
    right?: {
        width?: string | number;
        style?: string;
        color?: string;
    };
    bottom?: {
        width?: string | number;
        style?: string;
        color?: string;
    };
    left?: {
        width?: string | number;
        style?: string;
        color?: string;
    };
}
/**
 * 圆角值定义
 */
export interface BorderRadiusValue {
    topLeft?: string | number;
    topRight?: string | number;
    bottomRight?: string | number;
    bottomLeft?: string | number;
    all?: string | number;
}
/**
 * 变换属性定义
 */
export interface TransformProperties {
    translate?: string;
    rotate?: string;
    scale?: string;
    skew?: string;
    matrix?: string;
    origin?: string;
}
/**
 * 过渡属性定义
 */
export interface TransitionProperties {
    property?: string;
    duration?: string;
    timingFunction?: string;
    delay?: string;
}
/**
 * 属性模式定义
 * 这是组件属性系统的核心接口
 */
export interface PropSchema {
    id: string;
    componentId: string;
    name: string;
    type: PropType;
    label: string;
    description?: string;
    required: boolean;
    defaultValue?: any;
    group: string;
    category: PropCategory;
    order: number;
    displayHints?: DisplayHint[];
    options?: PropOption[];
    constraints?: PropConstraints;
    validation?: ValidationRule[];
    editorConfig: EditorConfig;
    responsive: boolean;
    breakpoints?: Breakpoint[];
    dependencies?: PropertyDependency[];
    createdAt: Date;
    updatedAt: Date;
}
/**
 * 组件定义接口
 */
export interface ComponentDefinition {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    category: ComponentCategory;
    subcategory?: string;
    tags: string[];
    componentPath: string;
    previewPath: string;
    iconPath: string;
    propsSchema: PropSchema[];
    defaultProps: Record<string, any>;
    defaultStyles: ComponentStyles;
    constraints: ComponentConstraints;
    validationRules: ValidationRule[];
    status: ComponentStatus;
    deprecated?: boolean;
    deprecatedReason?: string;
    deprecatedAlternative?: string;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    updatedBy: string;
}
/**
 * 组件约束定义
 */
export interface ComponentConstraints {
    canHaveChildren?: boolean;
    maxChildren?: number;
    allowedParentTypes?: string[];
    allowedChildTypes?: string[];
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    aspectRatio?: number;
    canDrag?: boolean;
    canResize?: boolean;
    canRotate?: boolean;
    lockAspectRatio?: boolean;
    canDelete?: boolean;
    canCopy?: boolean;
    canEdit?: boolean;
}
type CSSDisplayProperty = 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'none' | 'contents';
type CSSPositionProperty = 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
type CSSVisibilityProperty = 'visible' | 'hidden' | 'collapse';
type CSSTextAlignProperty = 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';
type CSSTextDecorationProperty = 'none' | 'underline' | 'overline' | 'line-through' | 'blink';
/**
 * 属性验证结果
 */
export interface PropValidationResult {
    valid: boolean;
    value: any;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
/**
 * 验证错误定义
 */
export interface ValidationError {
    code: string;
    message: string;
    path?: string;
    value?: any;
    constraint?: string;
}
/**
 * 验证警告定义
 */
export interface ValidationWarning {
    code: string;
    message: string;
    path?: string;
    value?: any;
}
/**
 * 响应式值定义
 */
export interface ResponsiveValue<T> {
    [Breakpoint.XS]?: T;
    [Breakpoint.SM]?: T;
    [Breakpoint.MD]?: T;
    [Breakpoint.LG]?: T;
    [Breakpoint.XL]?: T;
    [Breakpoint.XXL]?: T;
}
/**
 * 响应式属性配置
 */
export interface ResponsivePropConfig {
    baseValue: any;
    breakpointValues: ResponsiveValue<any>;
    breakpoints: Breakpoint[];
}
/**
 * 深度部分类型
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
/**
 * 属性值类型映射
 */
export type PropValueMap = {
    [PropType.STRING]: string;
    [PropType.NUMBER]: number;
    [PropType.BOOLEAN]: boolean;
    [PropType.COLOR]: string;
    [PropType.DATE]: string;
    [PropType.TIME]: string;
    [PropType.URL]: string;
    [PropType.EMAIL]: string;
    [PropType.SELECT]: any;
    [PropType.MULTI_SELECT]: any[];
    [PropType.RADIO]: any;
    [PropType.CHECKBOX]: boolean;
    [PropType.ARRAY]: any[];
    [PropType.OBJECT]: Record<string, any>;
    [PropType.JSON]: any;
    [PropType.SIZE]: string | number;
    [PropType.SPACING]: SpacingValue;
    [PropType.BORDER]: BorderProperties;
    [PropType.SHADOW]: string;
    [PropType.RESPONSIVE_SIZE]: ResponsiveValue<string | number>;
    [PropType.RESPONSIVE_SPACING]: ResponsiveValue<SpacingValue>;
};
/**
 * 根据属性类型获取对应的值类型
 */
export type GetPropValueType<T extends PropType> = PropValueMap[T];
/**
 * 属性编辑器组件类型
 */
export type PropEditorComponent<T = any> = React.ComponentType<{
    value: T;
    onChange: (value: T) => void;
    schema: PropSchema;
    disabled?: boolean;
    error?: string;
}>;
export {};
