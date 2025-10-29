"use strict";
/**
 * 组件注册系统类型定义
 * 功能模块: 基础组件库 (004-basic-component-library) - T006任务
 * 创建日期: 2025-10-29
 * 描述: 属性定义和验证系统的核心类型定义
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Breakpoint = exports.ComponentStatus = exports.PropCategory = exports.PropType = exports.ComponentCategory = void 0;
// ============================================================================
// 基础枚举类型
// ============================================================================
/**
 * 组件分类枚举
 */
var ComponentCategory;
(function (ComponentCategory) {
    ComponentCategory["BASIC"] = "basic";
    ComponentCategory["DISPLAY"] = "display";
    ComponentCategory["LAYOUT"] = "layout";
    ComponentCategory["FORM"] = "form";
    ComponentCategory["ADVANCED"] = "advanced";
    ComponentCategory["CUSTOM"] = "custom";
})(ComponentCategory || (exports.ComponentCategory = ComponentCategory = {}));
/**
 * 属性类型枚举
 */
var PropType;
(function (PropType) {
    // 基础类型
    PropType["STRING"] = "string";
    PropType["NUMBER"] = "number";
    PropType["BOOLEAN"] = "boolean";
    // 特殊类型
    PropType["COLOR"] = "color";
    PropType["DATE"] = "date";
    PropType["TIME"] = "time";
    PropType["URL"] = "url";
    PropType["EMAIL"] = "email";
    // 选择类型
    PropType["SELECT"] = "select";
    PropType["MULTI_SELECT"] = "multi_select";
    PropType["RADIO"] = "radio";
    PropType["CHECKBOX"] = "checkbox";
    // 复杂类型
    PropType["ARRAY"] = "array";
    PropType["OBJECT"] = "object";
    PropType["JSON"] = "json";
    // 样式类型
    PropType["SIZE"] = "size";
    PropType["SPACING"] = "spacing";
    PropType["BORDER"] = "border";
    PropType["SHADOW"] = "shadow";
    // 响应式类型
    PropType["RESPONSIVE_SIZE"] = "responsive_size";
    PropType["RESPONSIVE_SPACING"] = "responsive_spacing";
})(PropType || (exports.PropType = PropType = {}));
/**
 * 属性类别枚举
 */
var PropCategory;
(function (PropCategory) {
    PropCategory["BASIC"] = "basic";
    PropCategory["STYLE"] = "style";
    PropCategory["LAYOUT"] = "layout";
    PropCategory["EVENT"] = "event";
    PropCategory["ADVANCED"] = "advanced";
})(PropCategory || (exports.PropCategory = PropCategory = {}));
/**
 * 组件状态枚举
 */
var ComponentStatus;
(function (ComponentStatus) {
    ComponentStatus["DRAFT"] = "draft";
    ComponentStatus["ACTIVE"] = "active";
    ComponentStatus["DEPRECATED"] = "deprecated";
    ComponentStatus["ARCHIVED"] = "archived";
})(ComponentStatus || (exports.ComponentStatus = ComponentStatus = {}));
/**
 * 断点枚举
 */
var Breakpoint;
(function (Breakpoint) {
    Breakpoint["XS"] = "xs";
    Breakpoint["SM"] = "sm";
    Breakpoint["MD"] = "md";
    Breakpoint["LG"] = "lg";
    Breakpoint["XL"] = "xl";
    Breakpoint["XXL"] = "xxl";
})(Breakpoint || (exports.Breakpoint = Breakpoint = {}));
