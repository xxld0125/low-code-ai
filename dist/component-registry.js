"use strict";
/**
 * 组件注册系统核心类
 * 功能模块: 基础组件库 (004-basic-component-library)
 * 创建日期: 2025-10-29
 * 任务: T005 - 实现组件注册系统核心类
 *
 * 这个类提供了完整的组件注册、查询、管理功能，支持：
 * - 组件注册和注销
 * - 分类和标签管理
 * - 版本控制
 * - 依赖关系管理
 * - 验证和约束检查
 * - 搜索和过滤
 * - 缓存和性能优化
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRegistry = exports.ComponentRegistry = exports.DependencyType = exports.RegistryEventType = exports.SortField = void 0;
exports.getComponentRegistry = getComponentRegistry;
const types_1 = require("./types");
/**
 * 排序字段枚举
 */
var SortField;
(function (SortField) {
    SortField["NAME"] = "name";
    SortField["CREATED_AT"] = "createdAt";
    SortField["UPDATED_AT"] = "updatedAt";
    SortField["VERSION"] = "version";
    SortField["CATEGORY"] = "category";
    SortField["AUTHOR"] = "author";
})(SortField || (exports.SortField = SortField = {}));
/**
 * 注册表事件类型枚举
 */
var RegistryEventType;
(function (RegistryEventType) {
    RegistryEventType["COMPONENT_REGISTERED"] = "component_registered";
    RegistryEventType["COMPONENT_UPDATED"] = "component_updated";
    RegistryEventType["COMPONENT_UNREGISTERED"] = "component_unregistered";
    RegistryEventType["COMPONENT_ACTIVATED"] = "component_activated";
    RegistryEventType["COMPONENT_DEPRECATED"] = "component_deprecated";
})(RegistryEventType || (exports.RegistryEventType = RegistryEventType = {}));
/**
 * 依赖类型枚举
 */
var DependencyType;
(function (DependencyType) {
    DependencyType["REQUIRE"] = "require";
    DependencyType["RECOMMEND"] = "recommend";
    DependencyType["CONFLICT"] = "conflict";
})(DependencyType || (exports.DependencyType = DependencyType = {}));
/**
 * 组件注册表核心类
 * 负责管理所有组件的定义、注册、查询和验证
 */
class ComponentRegistry {
    constructor(config = {}) {
        this.components = new Map();
        this.categories = new Map();
        this.tags = new Map();
        this.authors = new Map();
        this.dependencies = new Map();
        this.cache = new Map();
        this.eventListeners = new Map();
        this.config = {
            enable_validation: true,
            strict_mode: false,
            cache_enabled: true,
            max_cache_size: 1000,
            auto_cleanup: true,
            version_check: true,
            ...config
        };
        // 初始化分类映射
        Object.values(types_1.ComponentCategory).forEach(category => {
            this.categories.set(category, new Set());
        });
        // 如果启用自动清理，设置定期清理
        if (this.config.auto_cleanup) {
            this.setupAutoCleanup();
        }
    }
    // ============================================================================
    // 组件注册和注销
    // ============================================================================
    /**
     * 注册新组件
     * @param component 组件定义
     * @returns 注册结果
     */
    async register(component) {
        try {
            // 验证组件定义
            const validationResult = this.validateComponent(component);
            if (!validationResult.valid && this.config.strict_mode) {
                return {
                    success: false,
                    errors: validationResult.errors
                };
            }
            // 检查ID冲突
            if (this.components.has(component.id)) {
                const error = {
                    code: 'DUPLICATE_ID',
                    message: `组件ID "${component.id}" 已存在`,
                    value: component.id
                };
                return {
                    success: false,
                    errors: [error]
                };
            }
            // 验证依赖关系
            const dependencyValidation = await this.validateDependencies(component);
            if (!dependencyValidation.valid && this.config.strict_mode) {
                return {
                    success: false,
                    errors: dependencyValidation.errors
                };
            }
            // 注册组件
            this.components.set(component.id, component);
            // 更新索引
            this.updateIndexes(component);
            // 清理缓存
            this.clearCache();
            // 触发事件
            this.emitEvent({
                type: RegistryEventType.COMPONENT_REGISTERED,
                component_id: component.id,
                timestamp: new Date(),
                data: component
            });
            return {
                success: true,
                component_id: component.id,
                warnings: validationResult.warnings
            };
        }
        catch (error) {
            return {
                success: false,
                errors: [{
                        code: 'REGISTRATION_ERROR',
                        message: error instanceof Error ? error.message : '注册过程中发生未知错误'
                    }]
            };
        }
    }
    /**
     * 注销组件
     * @param componentId 组件ID
     * @returns 是否成功注销
     */
    async unregister(componentId) {
        const component = this.components.get(componentId);
        if (!component) {
            return false;
        }
        // 检查是否有其他组件依赖此组件
        const dependents = this.findDependents(componentId);
        if (dependents.length > 0 && this.config.strict_mode) {
            throw new Error(`无法注销组件 "${componentId}"，以下组件依赖它: ${dependents.join(', ')}`);
        }
        // 移除组件
        this.components.delete(componentId);
        // 更新索引
        this.removeFromIndexes(component);
        // 清理缓存
        this.clearCache();
        // 触发事件
        this.emitEvent({
            type: RegistryEventType.COMPONENT_UNREGISTERED,
            component_id: componentId,
            timestamp: new Date(),
            data: component
        });
        return true;
    }
    /**
     * 更新组件定义
     * @param componentId 组件ID
     * @param updates 更新内容
     * @returns 更新结果
     */
    async update(componentId, updates) {
        const existing = this.components.get(componentId);
        if (!existing) {
            return {
                success: false,
                errors: [{
                        code: 'NOT_FOUND',
                        message: `组件 "${componentId}" 不存在`
                    }]
            };
        }
        // 创建更新后的组件定义
        const updated = {
            ...existing,
            ...updates,
            id: componentId, // 确保ID不被更改
            updatedAt: new Date()
        };
        // 验证更新后的定义
        const validationResult = this.validateComponent(updated);
        if (!validationResult.valid && this.config.strict_mode) {
            return {
                success: false,
                errors: validationResult.errors
            };
        }
        // 验证依赖关系
        const dependencyValidation = await this.validateDependencies(updated);
        if (!dependencyValidation.valid && this.config.strict_mode) {
            return {
                success: false,
                errors: dependencyValidation.errors
            };
        }
        // 更新组件
        this.components.set(componentId, updated);
        // 更新索引
        this.removeFromIndexes(existing);
        this.updateIndexes(updated);
        // 清理缓存
        this.clearCache();
        // 触发事件
        this.emitEvent({
            type: RegistryEventType.COMPONENT_UPDATED,
            component_id: componentId,
            timestamp: new Date(),
            data: { before: existing, after: updated }
        });
        return {
            success: true,
            component_id: componentId,
            warnings: validationResult.warnings
        };
    }
    // ============================================================================
    // 组件查询和搜索
    // ============================================================================
    /**
     * 根据ID获取组件定义
     * @param componentId 组件ID
     * @returns 组件定义或null
     */
    get(componentId) {
        return this.components.get(componentId) || null;
    }
    /**
     * 获取所有组件
     * @param filter 过滤条件
     * @param sort 排序条件
     * @returns 组件列表
     */
    list(filter, sort) {
        let components = Array.from(this.components.values());
        // 应用过滤
        if (filter) {
            components = this.applyFilter(components, filter);
        }
        // 应用排序
        if (sort) {
            components = this.applySort(components, sort);
        }
        return components;
    }
    /**
     * 按分类获取组件
     * @param category 组件分类
     * @returns 组件列表
     */
    getByCategory(category) {
        const componentIds = this.categories.get(category) || new Set();
        return Array.from(componentIds)
            .map(id => this.components.get(id))
            .filter((component) => component !== undefined);
    }
    /**
     * 按标签获取组件
     * @param tag 标签
     * @returns 组件列表
     */
    getByTag(tag) {
        const componentIds = this.tags.get(tag) || new Set();
        return Array.from(componentIds)
            .map(id => this.components.get(id))
            .filter((component) => component !== undefined);
    }
    /**
     * 按作者获取组件
     * @param author 作者
     * @returns 组件列表
     */
    getByAuthor(author) {
        const componentIds = this.authors.get(author) || new Set();
        return Array.from(componentIds)
            .map(id => this.components.get(id))
            .filter((component) => component !== undefined);
    }
    /**
     * 搜索组件
     * @param query 搜索关键词
     * @param fields 搜索字段
     * @returns 匹配的组件列表
     */
    search(query, fields = ['name', 'description', 'tags']) {
        if (!query.trim()) {
            return this.list();
        }
        const searchTerm = query.toLowerCase();
        return this.list().filter(component => {
            return fields.some(field => {
                const value = this.getNestedValue(component, field);
                if (Array.isArray(value)) {
                    return value.some(item => typeof item === 'string' && item.toLowerCase().includes(searchTerm));
                }
                return typeof value === 'string' && value.toLowerCase().includes(searchTerm);
            });
        });
    }
    /**
     * 获取组件统计信息
     * @returns 统计信息
     */
    getStats() {
        const components = Array.from(this.components.values());
        const categoryStats = {};
        const authorStats = {};
        // 初始化分类统计
        Object.values(types_1.ComponentCategory).forEach(category => {
            categoryStats[category] = 0;
        });
        // 统计数据
        components.forEach(component => {
            // 分类统计
            categoryStats[component.category]++;
            // 作者统计
            authorStats[component.author] = (authorStats[component.author] || 0) + 1;
        });
        // 最近更新时间
        const latestUpdated = components
            .map(c => c.updatedAt)
            .reduce((latest, current) => current > latest ? current : latest, new Date(0));
        return {
            total_components: components.length,
            active_components: components.filter(c => c.status === types_1.ComponentStatus.ACTIVE).length,
            deprecated_components: components.filter(c => c.status === types_1.ComponentStatus.DEPRECATED).length,
            categories: categoryStats,
            authors: authorStats,
            latest_updated: latestUpdated
        };
    }
    // ============================================================================
    // 验证和约束检查
    // ============================================================================
    /**
     * 验证组件定义
     * @param component 组件定义
     * @returns 验证结果
     */
    validateComponent(component) {
        const errors = [];
        const warnings = [];
        // 基础字段验证
        if (!component.id || component.id.trim() === '') {
            errors.push({
                code: 'REQUIRED_FIELD',
                message: '组件ID不能为空'
            });
        }
        if (!component.name || component.name.trim() === '') {
            errors.push({
                code: 'REQUIRED_FIELD',
                message: '组件名称不能为空'
            });
        }
        if (!component.description || component.description.trim() === '') {
            warnings.push({
                code: 'MISSING_DESCRIPTION',
                message: '建议提供组件描述'
            });
        }
        // ID格式验证
        if (component.id && !/^component-[a-z]+-[a-z0-9-]+$/.test(component.id)) {
            errors.push({
                code: 'INVALID_ID_FORMAT',
                message: '组件ID格式不正确，应为: "component-{category}-{name}"'
            });
        }
        // 版本号验证
        if (component.version && !/^\d+\.\d+\.\d+/.test(component.version)) {
            errors.push({
                code: 'INVALID_VERSION',
                message: '版本号格式不正确，应为语义化版本号 (如: 1.0.0)'
            });
        }
        // 路径验证
        if (!component.componentPath) {
            errors.push({
                code: 'REQUIRED_FIELD',
                message: '组件路径不能为空'
            });
        }
        // 属性模式验证
        if (!Array.isArray(component.propsSchema)) {
            errors.push({
                code: 'INVALID_TYPE',
                message: '属性模式必须是数组'
            });
        }
        else {
            // 验证每个属性模式
            component.propsSchema.forEach((prop, index) => {
                const propErrors = this.validatePropSchema(prop, `propsSchema[${index}]`);
                errors.push(...propErrors);
            });
        }
        // 验证默认属性与模式匹配
        if (component.defaultProps && component.propsSchema) {
            const defaultPropsErrors = this.validateDefaultProps(component.defaultProps, component.propsSchema);
            errors.push(...defaultPropsErrors);
        }
        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * 验证属性模式
     * @param prop 属性模式
     * @param path 属性路径
     * @returns 验证错误列表
     */
    validatePropSchema(prop, path) {
        const errors = [];
        if (!prop.id || prop.id.trim() === '') {
            errors.push({
                code: 'REQUIRED_FIELD',
                message: `${path}.id: 属性ID不能为空`
            });
        }
        if (!prop.name || prop.name.trim() === '') {
            errors.push({
                code: 'REQUIRED_FIELD',
                message: `${path}.name: 属性名称不能为空`
            });
        }
        if (!prop.label || prop.label.trim() === '') {
            errors.push({
                code: 'REQUIRED_FIELD',
                message: `${path}.label: 属性标签不能为空`
            });
        }
        if (!prop.editorConfig || !prop.editorConfig.widget) {
            errors.push({
                code: 'REQUIRED_FIELD',
                message: `${path}.editorConfig.widget: 必须指定编辑器控件类型`
            });
        }
        return errors;
    }
    /**
     * 验证默认属性
     * @param defaultProps 默认属性
     * @param propsSchema 属性模式
     * @returns 验证错误列表
     */
    validateDefaultProps(defaultProps, propsSchema) {
        const errors = [];
        // 检查必需属性是否都有默认值
        propsSchema.forEach(prop => {
            if (prop.required && !(prop.name in defaultProps)) {
                errors.push({
                    code: 'MISSING_REQUIRED_DEFAULT',
                    message: `必需属性 "${prop.name}" 缺少默认值`
                });
            }
        });
        return errors;
    }
    /**
     * 验证组件依赖关系
     * @param component 组件定义
     * @returns 验证结果
     */
    async validateDependencies(component) {
        const errors = [];
        const dependencies = this.extractDependencies(component);
        for (const dep of dependencies) {
            // 检查依赖的组件是否存在
            if (dep.type === DependencyType.REQUIRE && !this.components.has(dep.component_id)) {
                errors.push({
                    code: 'DEPENDENCY_NOT_FOUND',
                    message: `依赖的组件 "${dep.component_id}" 不存在`
                });
            }
            // 版本检查
            if (this.config.version_check && dep.version) {
                const dependency = this.components.get(dep.component_id);
                if (dependency && !this.isVersionCompatible(dependency.version, dep.version)) {
                    errors.push({
                        code: 'VERSION_INCOMPATIBLE',
                        message: `依赖组件 "${dep.component_id}" 版本不兼容，需要: ${dep.version}，实际: ${dependency.version}`
                    });
                }
            }
        }
        return {
            valid: errors.length === 0,
            errors
        };
    }
    // ============================================================================
    // 依赖关系管理
    // ============================================================================
    /**
     * 提取组件依赖关系
     * @param component 组件定义
     * @returns 依赖关系列表
     */
    extractDependencies(component) {
        const dependencies = [];
        // 从约束中提取依赖
        if (component.constraints.allowedParentTypes) {
            component.constraints.allowedParentTypes.forEach(type => {
                dependencies.push({
                    component_id: type,
                    type: DependencyType.REQUIRE,
                    optional: false
                });
            });
        }
        if (component.constraints.allowedChildTypes) {
            component.constraints.allowedChildTypes.forEach(type => {
                dependencies.push({
                    component_id: type,
                    type: DependencyType.REQUIRE,
                    optional: false
                });
            });
        }
        // 从属性模式中提取依赖
        component.propsSchema.forEach(prop => {
            if (prop.dependencies) {
                prop.dependencies.forEach(dep => {
                    dependencies.push({
                        component_id: dep.sourceProperty,
                        type: DependencyType.REQUIRE,
                        optional: true
                    });
                });
            }
        });
        return dependencies;
    }
    /**
     * 查找依赖于指定组件的其他组件
     * @param componentId 组件ID
     * @returns 依赖此组件的组件ID列表
     */
    findDependents(componentId) {
        const dependents = [];
        const componentIds = Array.from(this.components.keys());
        for (const id of componentIds) {
            if (id === componentId)
                continue;
            const component = this.components.get(id);
            if (component) {
                const dependencies = this.extractDependencies(component);
                if (dependencies.some(dep => dep.component_id === componentId)) {
                    dependents.push(id);
                }
            }
        }
        return dependents;
    }
    /**
     * 检查版本兼容性
     * @param actualVersion 实际版本
     * @param requiredVersion 需要的版本
     * @returns 是否兼容
     */
    isVersionCompatible(actualVersion, requiredVersion) {
        // 简单的版本比较实现
        // 在实际应用中，可能需要更复杂的语义化版本比较
        const actual = actualVersion.split('.').map(Number);
        const required = requiredVersion.split('.').map(Number);
        for (let i = 0; i < Math.max(actual.length, required.length); i++) {
            const a = actual[i] || 0;
            const r = required[i] || 0;
            if (a > r)
                return true;
            if (a < r)
                return false;
        }
        return true;
    }
    // ============================================================================
    // 索引管理
    // ============================================================================
    /**
     * 更新索引
     * @param component 组件定义
     */
    updateIndexes(component) {
        // 更新分类索引
        const categorySet = this.categories.get(component.category);
        if (categorySet) {
            categorySet.add(component.id);
        }
        // 更新标签索引
        component.tags.forEach(tag => {
            if (!this.tags.has(tag)) {
                this.tags.set(tag, new Set());
            }
            this.tags.get(tag).add(component.id);
        });
        // 更新作者索引
        if (!this.authors.has(component.author)) {
            this.authors.set(component.author, new Set());
        }
        this.authors.get(component.author).add(component.id);
        // 更新依赖索引
        const dependencies = this.extractDependencies(component);
        if (dependencies.length > 0) {
            this.dependencies.set(component.id, new Set(dependencies));
        }
    }
    /**
     * 从索引中移除组件
     * @param component 组件定义
     */
    removeFromIndexes(component) {
        // 从分类索引移除
        const categorySet = this.categories.get(component.category);
        if (categorySet) {
            categorySet.delete(component.id);
        }
        // 从标签索引移除
        component.tags.forEach(tag => {
            const tagSet = this.tags.get(tag);
            if (tagSet) {
                tagSet.delete(component.id);
                if (tagSet.size === 0) {
                    this.tags.delete(tag);
                }
            }
        });
        // 从作者索引移除
        const authorSet = this.authors.get(component.author);
        if (authorSet) {
            authorSet.delete(component.id);
            if (authorSet.size === 0) {
                this.authors.delete(component.author);
            }
        }
        // 从依赖索引移除
        this.dependencies.delete(component.id);
    }
    // ============================================================================
    // 过滤和排序
    // ============================================================================
    /**
     * 应用过滤条件
     * @param components 组件列表
     * @param filter 过滤条件
     * @returns 过滤后的组件列表
     */
    applyFilter(components, filter) {
        return components.filter(component => {
            // 分类过滤
            if (filter.category && filter.category.length > 0) {
                if (!filter.category.includes(component.category)) {
                    return false;
                }
            }
            // 标签过滤
            if (filter.tags && filter.tags.length > 0) {
                const hasAllTags = filter.tags.every(tag => component.tags.includes(tag));
                if (!hasAllTags) {
                    return false;
                }
            }
            // 状态过滤
            if (filter.status && filter.status.length > 0) {
                if (!filter.status.includes(component.status)) {
                    return false;
                }
            }
            // 作者过滤
            if (filter.author && filter.author.length > 0) {
                if (!filter.author.includes(component.author)) {
                    return false;
                }
            }
            // 搜索关键词过滤
            if (filter.search && filter.search.trim()) {
                const searchTerm = filter.search.toLowerCase();
                const searchableText = [
                    component.name,
                    component.description,
                    ...component.tags,
                    component.author
                ].join(' ').toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            // 日期范围过滤
            if (filter.date_range) {
                const { start, end } = filter.date_range;
                if (start && component.createdAt < start) {
                    return false;
                }
                if (end && component.createdAt > end) {
                    return false;
                }
            }
            return true;
        });
    }
    /**
     * 应用排序
     * @param components 组件列表
     * @param sort 排序条件
     * @returns 排序后的组件列表
     */
    applySort(components, sort) {
        return [...components].sort((a, b) => {
            let aValue = this.getNestedValue(a, sort.field);
            let bValue = this.getNestedValue(b, sort.field);
            // 处理日期类型
            if (aValue instanceof Date)
                aValue = aValue.getTime();
            if (bValue instanceof Date)
                bValue = bValue.getTime();
            // 处理字符串比较
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            let result = 0;
            if (aValue < bValue)
                result = -1;
            if (aValue > bValue)
                result = 1;
            return sort.order === 'desc' ? -result : result;
        });
    }
    /**
     * 获取嵌套对象值
     * @param obj 对象
     * @param path 属性路径
     * @returns 属性值
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    }
    // ============================================================================
    // 事件系统
    // ============================================================================
    /**
     * 添加事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    addEventListener(eventType, listener) {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, new Set());
        }
        this.eventListeners.get(eventType).add(listener);
    }
    /**
     * 移除事件监听器
     * @param eventType 事件类型
     * @param listener 监听器函数
     */
    removeEventListener(eventType, listener) {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.delete(listener);
            if (listeners.size === 0) {
                this.eventListeners.delete(eventType);
            }
        }
    }
    /**
     * 触发事件
     * @param event 事件对象
     */
    emitEvent(event) {
        const listeners = this.eventListeners.get(event.type);
        if (listeners) {
            listeners.forEach(listener => {
                try {
                    listener(event);
                }
                catch (error) {
                    console.error(`事件监听器执行失败:`, error);
                }
            });
        }
    }
    // ============================================================================
    // 缓存管理
    // ============================================================================
    /**
     * 清理缓存
     */
    clearCache() {
        this.cache.clear();
    }
    /**
     * 设置自动清理
     */
    setupAutoCleanup() {
        // 每5分钟清理一次缓存
        setInterval(() => {
            if (this.cache.size > this.config.max_cache_size) {
                this.clearCache();
            }
        }, 5 * 60 * 1000);
    }
    // ============================================================================
    // 工具方法
    // ============================================================================
    /**
     * 检查组件是否存在
     * @param componentId 组件ID
     * @returns 是否存在
     */
    has(componentId) {
        return this.components.has(componentId);
    }
    /**
     * 获取所有分类
     * @returns 分类列表
     */
    getCategories() {
        return Object.values(types_1.ComponentCategory);
    }
    /**
     * 获取所有标签
     * @returns 标签列表
     */
    getTags() {
        return Array.from(this.tags.keys());
    }
    /**
     * 获取所有作者
     * @returns 作者列表
     */
    getAuthors() {
        return Array.from(this.authors.keys());
    }
    /**
     * 获取注册表大小
     * @returns 组件数量
     */
    size() {
        return this.components.size;
    }
    /**
     * 清空注册表
     */
    clear() {
        this.components.clear();
        this.categories.forEach(set => set.clear());
        this.tags.clear();
        this.authors.clear();
        this.dependencies.clear();
        this.clearCache();
    }
    /**
     * 导出组件定义
     * @param componentIds 组件ID列表（可选）
     * @returns 组件定义数据
     */
    export(componentIds) {
        const result = {};
        if (componentIds) {
            componentIds.forEach(id => {
                const component = this.components.get(id);
                if (component) {
                    result[id] = { ...component };
                }
            });
        }
        else {
            this.components.forEach((component, id) => {
                result[id] = { ...component };
            });
        }
        return result;
    }
    /**
     * 导入组件定义
     * @param components 组件定义数据
     * @param overwrite 是否覆盖现有组件
     * @returns 导入结果
     */
    async import(components, overwrite = false) {
        const results = [];
        for (const [id, component] of Object.entries(components)) {
            if (!overwrite && this.has(id)) {
                results.push({
                    success: false,
                    errors: [{
                            code: 'DUPLICATE_ID',
                            message: `组件 "${id}" 已存在`
                        }]
                });
                continue;
            }
            const result = await this.register(component);
            results.push(result);
        }
        return results;
    }
}
exports.ComponentRegistry = ComponentRegistry;
// ============================================================================
// 单例模式 - 全局组件注册表实例
// ============================================================================
/**
 * 全局组件注册表实例
 * 提供单例模式的组件注册表，方便在整个应用中使用
 */
class GlobalComponentRegistry {
    static getInstance(config) {
        if (!this.instance) {
            this.instance = new ComponentRegistry(config);
        }
        return this.instance;
    }
    static reset() {
        this.instance = null;
    }
}
GlobalComponentRegistry.instance = null;
/**
 * 获取全局组件注册表实例
 * @param config 配置选项（仅在第一次调用时生效）
 * @returns 组件注册表实例
 */
function getComponentRegistry(config) {
    return GlobalComponentRegistry.getInstance(config);
}
// ============================================================================
// 导出默认实例
// ============================================================================
exports.defaultRegistry = getComponentRegistry();
