/**
 * 页面设计器生产环境部署配置
 * 功能模块: 基础页面设计器 (003-page-designer)
 * 创建日期: 2025-10-28
 * 作用: 提供生产环境部署的配置和优化
 */

// 部署环境类型
export type DeploymentEnvironment = 'development' | 'staging' | 'production'

// 部署配置
export interface DeploymentConfig {
  environment: DeploymentEnvironment
  apiBaseUrl: string
  cdnBaseUrl: string
  enableAnalytics: boolean
  enableErrorReporting: boolean
  enablePerformanceMonitoring: boolean
  enableServiceWorker: boolean
  enableCompression: boolean
  enableCaching: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
  maxConcurrentUsers: number
  rateLimiting: {
    enabled: boolean
    windowMs: number
    maxRequests: number
  }
  security: {
    enableCSRF: boolean
    enableXSS: boolean
    enableCSP: boolean
    enableHSTS: boolean
  }
  performance: {
    enableBundleOptimization: boolean
    enableImageOptimization: boolean
    enableLazyLoading: boolean
    enablePrefetch: boolean
  }
}

// 环境配置映射
export const ENVIRONMENT_CONFIGS: Record<DeploymentEnvironment, DeploymentConfig> = {
  development: {
    environment: 'development',
    apiBaseUrl: 'http://localhost:3000/api',
    cdnBaseUrl: '',
    enableAnalytics: false,
    enableErrorReporting: false,
    enablePerformanceMonitoring: true,
    enableServiceWorker: false,
    enableCompression: false,
    enableCaching: false,
    logLevel: 'debug',
    maxConcurrentUsers: 10,
    rateLimiting: {
      enabled: false,
      windowMs: 15 * 60 * 1000, // 15分钟
      maxRequests: 1000,
    },
    security: {
      enableCSRF: false,
      enableXSS: true,
      enableCSP: false,
      enableHSTS: false,
    },
    performance: {
      enableBundleOptimization: false,
      enableImageOptimization: false,
      enableLazyLoading: true,
      enablePrefetch: false,
    },
  },

  staging: {
    environment: 'staging',
    apiBaseUrl: 'https://staging-api.example.com',
    cdnBaseUrl: 'https://staging-cdn.example.com',
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableServiceWorker: true,
    enableCompression: true,
    enableCaching: true,
    logLevel: 'info',
    maxConcurrentUsers: 100,
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15分钟
      maxRequests: 500,
    },
    security: {
      enableCSRF: true,
      enableXSS: true,
      enableCSP: true,
      enableHSTS: false,
    },
    performance: {
      enableBundleOptimization: true,
      enableImageOptimization: true,
      enableLazyLoading: true,
      enablePrefetch: true,
    },
  },

  production: {
    environment: 'production',
    apiBaseUrl: 'https://api.example.com',
    cdnBaseUrl: 'https://cdn.example.com',
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableServiceWorker: true,
    enableCompression: true,
    enableCaching: true,
    logLevel: 'warn',
    maxConcurrentUsers: 1000,
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15分钟
      maxRequests: 100,
    },
    security: {
      enableCSRF: true,
      enableXSS: true,
      enableCSP: true,
      enableHSTS: true,
    },
    performance: {
      enableBundleOptimization: true,
      enableImageOptimization: true,
      enableLazyLoading: true,
      enablePrefetch: true,
    },
  },
}

/**
 * 部署配置管理器
 */
export class DeploymentConfigManager {
  private config: DeploymentConfig
  private environment: DeploymentEnvironment

  constructor(environment: DeploymentEnvironment = 'development') {
    this.environment = environment
    this.config = { ...ENVIRONMENT_CONFIGS[environment] }
  }

  /**
   * 获取当前配置
   */
  public getConfig(): DeploymentConfig {
    return { ...this.config }
  }

  /**
   * 获取环境变量配置
   */
  public getEnvironmentConfig(): Partial<DeploymentConfig> {
    return {
      apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || this.config.apiBaseUrl,
      cdnBaseUrl: process.env.NEXT_PUBLIC_CDN_URL || this.config.cdnBaseUrl,
      enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
      enableErrorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
      enablePerformanceMonitoring: process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING === 'true',
    }
  }

  /**
   * 更新配置
   */
  public updateConfig(updates: Partial<DeploymentConfig>): void {
    this.config = { ...this.config, ...updates }
  }

  /**
   * 切换环境
   */
  public switchEnvironment(environment: DeploymentEnvironment): void {
    this.environment = environment
    this.config = { ...ENVIRONMENT_CONFIGS[environment] }
  }

  /**
   * 验证配置
   */
  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!this.config.apiBaseUrl) {
      errors.push('API Base URL is required')
    }

    if (this.config.environment === 'production' && !this.config.security.enableCSRF) {
      errors.push('Security features must be enabled in production')
    }

    if (this.config.maxConcurrentUsers <= 0) {
      errors.push('Max concurrent users must be greater than 0')
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * 生成环境配置文件
   */
  public generateEnvironmentFile(): string {
    const env = this.config.environment.toUpperCase()

    return `
# ${env} Environment Configuration
NEXT_PUBLIC_APP_ENV=${this.config.environment}
NEXT_PUBLIC_API_URL=${this.config.apiBaseUrl}
NEXT_PUBLIC_CDN_URL=${this.config.cdnBaseUrl}
NEXT_PUBLIC_ENABLE_ANALYTICS=${this.config.enableAnalytics}
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=${this.config.enableErrorReporting}
NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING=${this.config.enablePerformanceMonitoring}
NEXT_PUBLIC_MAX_CONCURRENT_USERS=${this.config.maxConcurrentUsers}
`
  }

  /**
   * 生成Docker配置
   */
  public generateDockerConfig(): string {
    return `
# Dockerfile for Page Designer
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Environment variables
ARG NEXT_PUBLIC_APP_ENV=${this.config.environment}
ARG NEXT_PUBLIC_API_URL=${this.config.apiBaseUrl}
ARG NEXT_PUBLIC_CDN_URL=${this.config.cdnBaseUrl}

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
`
  }

  /**
   * 生成Nginx配置
   */
  public generateNginxConfig(): string {
    return `
# Nginx configuration for Page Designer
server {
    listen 80;
    server_name your-domain.com;

    # Redirect to HTTPS in production
    ${this.config.environment === 'production' ? 'return 301 https://$server_name$request_uri;' : ''}

    ${
      this.config.security.enableHSTS
        ? `
    # HSTS headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    `
        : ''
    }

    # Gzip compression
    ${
      this.config.enableCompression
        ? `
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    `
        : ''
    }

    # Cache settings
    ${
      this.config.enableCaching
        ? `
    # Static assets cache
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Cache-Status "HIT";
    }

    # API cache
    location /api/ {
        proxy_cache api_cache;
        proxy_cache_valid 200 5m;
        add_header X-Cache-Status $upstream_cache_status;
    }
    `
        : ''
    }

    # Security headers
    ${
      this.config.security.enableXSS
        ? `
    add_header X-XSS-Protection "1; mode=block" always;
    `
        : ''
    }

    ${
      this.config.security.enableCSP
        ? `
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;
    `
        : ''
    }

    # Rate limiting
    ${
      this.config.rateLimiting.enabled
        ? `
    limit_req_zone $binary_remote_addr zone=api:10m rate=${this.config.rateLimiting.maxRequests}r/m;

    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://localhost:3000;
    }
    `
        : ''
    }

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# HTTPS configuration for production
${
  this.config.environment === 'production'
    ? `
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Include other configurations from HTTP server
    include /etc/nginx/conf.d/page-designer-common.conf;
}
`
    : ''
}
`
  }

  /**
   * 生成部署脚本
   */
  public generateDeploymentScript(): string {
    return `#!/bin/bash

# Page Designer Deployment Script
# Environment: ${this.config.environment}

set -e

echo "Starting deployment to ${this.config.environment}..."

# Build the application
echo "Building application..."
npm run build

# Run tests
echo "Running tests..."
npm test

# Run performance tests
echo "Running performance tests..."
npm run test:performance

# Generate deployment artifacts
echo "Generating deployment artifacts..."
mkdir -p dist
cp -r .next dist/
cp -r public dist/
cp package.json dist/
cp Dockerfile dist/

# Deploy to ${this.config.environment}
if [ "${this.config.environment}" = "production" ]; then
    echo "Deploying to production..."
    # Production deployment commands
    docker build -t page-designer:${this.config.environment} .
    docker push your-registry/page-designer:${this.config.environment}
    # Update production environment
elif [ "${this.config.environment}" = "staging" ]; then
    echo "Deploying to staging..."
    # Staging deployment commands
    docker build -t page-designer:${this.config.environment} .
    docker push your-registry/page-designer:${this.config.environment}
    # Update staging environment
else
    echo "Starting development server..."
    npm run dev
fi

echo "Deployment completed successfully!"

# Health check
echo "Running health check..."
curl -f http://localhost:3000/api/health || exit 1

echo "Application is healthy and running!"
`
  }
}

/**
 * 部署健康检查器
 */
export class DeploymentHealthChecker {
  private config: DeploymentConfig

  constructor(config: DeploymentConfig) {
    this.config = config
  }

  /**
   * 运行健康检查
   */
  public async runHealthCheck(): Promise<{
    status: 'healthy' | 'unhealthy' | 'degraded'
    checks: Array<{
      name: string
      status: 'pass' | 'fail' | 'warn'
      message: string
      responseTime?: number
    }>
  }> {
    const checks: Array<{
      name: string
      status: 'pass' | 'fail' | 'warn'
      message: string
      responseTime?: number
    }> = []

    // API健康检查
    try {
      const startTime = performance.now()
      const response = await fetch(`${this.config.apiBaseUrl}/health`)
      const responseTime = performance.now() - startTime

      checks.push({
        name: 'API Health',
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? 'API is responding' : 'API is not responding',
        responseTime: Math.round(responseTime),
      })
    } catch (error) {
      checks.push({
        name: 'API Health',
        status: 'fail',
        message: 'API connection failed',
      })
    }

    // 数据库连接检查
    try {
      const startTime = performance.now()
      const response = await fetch(`${this.config.apiBaseUrl}/health/database`)
      const responseTime = performance.now() - startTime

      checks.push({
        name: 'Database Connection',
        status: response.ok ? 'pass' : 'fail',
        message: response.ok ? 'Database is connected' : 'Database connection failed',
        responseTime: Math.round(responseTime),
      })
    } catch (error) {
      checks.push({
        name: 'Database Connection',
        status: 'fail',
        message: 'Database connection failed',
      })
    }

    // 缓存服务检查
    try {
      const startTime = performance.now()
      const response = await fetch(`${this.config.apiBaseUrl}/health/cache`)
      const responseTime = performance.now() - startTime

      checks.push({
        name: 'Cache Service',
        status: response.ok ? 'pass' : 'warn',
        message: response.ok ? 'Cache is working' : 'Cache service degraded',
        responseTime: Math.round(responseTime),
      })
    } catch (error) {
      checks.push({
        name: 'Cache Service',
        status: 'warn',
        message: 'Cache service unavailable',
      })
    }

    // 计算总体状态
    const failedChecks = checks.filter(c => c.status === 'fail')
    const warningChecks = checks.filter(c => c.status === 'warn')

    let status: 'healthy' | 'unhealthy' | 'degraded'
    if (failedChecks.length === 0) {
      status = warningChecks.length === 0 ? 'healthy' : 'degraded'
    } else {
      status = 'unhealthy'
    }

    return { status, checks }
  }

  /**
   * 启动健康检查监控
   */
  public startHealthMonitoring(intervalMs: number = 30000): void {
    setInterval(async () => {
      const health = await this.runHealthCheck()

      if (health.status === 'unhealthy') {
        console.error('Application health check failed:', health.checks)
        // 发送告警
        this.sendAlert('Application is unhealthy', health.checks)
      } else if (health.status === 'degraded') {
        console.warn('Application performance degraded:', health.checks)
      }
    }, intervalMs)
  }

  /**
   * 发送告警
   */
  private sendAlert(message: string, checks: any[]): void {
    // 这里可以集成告警系统
    console.error('ALERT:', message, checks)
  }
}

// 创建全局实例
export const deploymentConfigManager = new DeploymentConfigManager(
  (process.env.NODE_ENV as DeploymentEnvironment) || 'development'
)

export default deploymentConfigManager
