/**
 * Code Quality Metrics and Technical Debt Assessment
 * Provides tools for measuring and improving code quality in the project management feature
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

export interface CodeMetrics {
  totalLines: number
  codeLines: number
  commentLines: number
  emptyLines: number
  functions: number
  classes: number
  fileCount: number
  averageFileLines: number
  maxFileLines: number
  minFileLines: number
}

export interface ComplexityMetrics {
  cyclomaticComplexity: number
  cognitiveComplexity: number
  nestingDepth: number
  duplicateCodeRatio: number
  functionLengthAverage: number
  parameterCountAverage: number
}

export interface QualityMetrics {
  maintainabilityIndex: number
  technicalDebtRatio: number
  testCoverage: number
  typeScriptCoverage: number
  errorHandlingCoverage: number
  documentationCoverage: number
}

export interface FileAnalysis {
  path: string
  lines: number
  functions: number
  classes: number
  complexity: number
  hasTests: boolean
  hasDocumentation: boolean
  hasErrorHandling: boolean
  isTypeScript: boolean
  issues: QualityIssue[]
}

export interface QualityIssue {
  type: 'complexity' | 'duplication' | 'naming' | 'security' | 'performance' | 'maintainability'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  line?: number
  suggestion?: string
}

export class CodeQualityAnalyzer {
  private projectPath: string

  constructor(projectPath: string = '/Users/xulingfeng/low-code-ai') {
    this.projectPath = projectPath
  }

  /**
   * Analyze the entire project management feature
   */
  async analyzeProjectManagementFeature(): Promise<{
    metrics: CodeMetrics
    complexity: ComplexityMetrics
    quality: QualityMetrics
    files: FileAnalysis[]
    summary: {
      overallGrade: string
      strengths: string[]
      improvements: string[]
      technicalDebtHours: number
    }
  }> {
    const files = this.getProjectFiles()
    const fileAnalyses = await Promise.all(files.map(file => this.analyzeFile(file)))

    const metrics = this.calculateCodeMetrics(fileAnalyses)
    const complexity = this.calculateComplexityMetrics(fileAnalyses)
    const quality = this.calculateQualityMetrics(fileAnalyses)
    const summary = this.generateSummary(metrics, complexity, quality, fileAnalyses)

    return {
      metrics,
      complexity,
      quality,
      files: fileAnalyses,
      summary,
    }
  }

  /**
   * Get all project management related files
   */
  private getProjectFiles(): string[] {
    const projectDirs = [
      '/components/projects',
      '/app/protected/projects',
      '/lib/projects',
      '/types/projects',
      '/tests/projects',
      '/specs/001-project-management',
    ]

    const files: string[] = []

    projectDirs.forEach(dir => {
      const fullPath = join(this.projectPath, dir)
      if (this.directoryExists(fullPath)) {
        files.push(...this.getAllFiles(fullPath, ['.ts', '.tsx', '.js', '.jsx', '.md']))
      }
    })

    return files.map(file => file.replace(this.projectPath, ''))
  }

  /**
   * Analyze a single file
   */
  private async analyzeFile(filePath: string): Promise<FileAnalysis> {
    const fullPath = join(this.projectPath, filePath)
    const content = readFileSync(fullPath, 'utf-8')

    const analysis: FileAnalysis = {
      path: filePath,
      lines: content.split('\n').length,
      functions: this.countFunctions(content),
      classes: this.countClasses(content),
      complexity: this.calculateFileComplexity(content),
      hasTests: this.hasTests(filePath, content),
      hasDocumentation: this.hasDocumentation(content),
      hasErrorHandling: this.hasErrorHandling(content),
      isTypeScript: ['.ts', '.tsx'].includes(extname(filePath)),
      issues: this.detectIssues(content, filePath),
    }

    return analysis
  }

  /**
   * Count functions in a file
   */
  private countFunctions(content: string): number {
    const patterns = [
      /function\s+\w+/g,
      /const\s+\w+\s*=\s*\(/g,
      /const\s+\w+\s*=\s*async\s*\(/g,
      /export\s+function\s+\w+/g,
      /export\s+const\s+\w+\s*=\s*\(/g,
      /\w+\s*:\s*\([^)]*\)\s*=>/g,
      /^\s*\w+\s*\([^)]*\)\s*{/gm,
    ]

    let count = 0
    patterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) count += matches.length
    })

    return count
  }

  /**
   * Count classes in a file
   */
  private countClasses(content: string): number {
    const classPattern = /(?:class|interface|type)\s+\w+/g
    const matches = content.match(classPattern)
    return matches ? matches.length : 0
  }

  /**
   * Calculate file complexity (simplified cyclomatic complexity)
   */
  private calculateFileComplexity(content: string): number {
    const complexityPatterns = [
      /if\s*\(/g,
      /else\s+if\s*\(/g,
      /while\s*\(/g,
      /for\s*\(/g,
      /switch\s*\(/g,
      /case\s+[^:]+:/g,
      /catch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?[^:]*:/g,
    ]

    let complexity = 1 // Base complexity
    complexityPatterns.forEach(pattern => {
      const matches = content.match(pattern)
      if (matches) complexity += matches.length
    })

    return complexity
  }

  /**
   * Check if file has tests
   */
  private hasTests(filePath: string, content: string): boolean {
    const isTestFile = filePath.includes('.test.') || filePath.includes('.spec.')
    const hasTestKeywords = /(test|describe|it|expect)\s*\(/.test(content)
    return isTestFile || hasTestKeywords
  }

  /**
   * Check if file has documentation
   */
  private hasDocumentation(content: string): boolean {
    const docPatterns = [
      /\/\*\*[\s\S]*?\*\//g, // JSDoc blocks
      /\/\/\s*@[a-zA-Z]+/g, // JSDoc tags
      /#.*\n/g, // Markdown headers
      /^\s*\/\/.*$/gm, // Single line comments
    ]

    return docPatterns.some(pattern => pattern.test(content))
  }

  /**
   * Check if file has error handling
   */
  private hasErrorHandling(content: string): boolean {
    const errorPatterns = [
      /try\s*{/g,
      /catch\s*\(/g,
      /throw\s+new\s+Error/g,
      /console\.error/g,
      /\.catch\(/g,
    ]

    return errorPatterns.some(pattern => pattern.test(content))
  }

  /**
   * Detect quality issues in code
   */
  private detectIssues(content: string, filePath: string): QualityIssue[] {
    const issues: QualityIssue[] = []

    // Large file issue
    const lines = content.split('\n').length
    if (lines > 300) {
      issues.push({
        type: 'maintainability',
        severity: 'medium',
        message: `File is too large (${lines} lines)`,
        suggestion: 'Consider splitting this file into smaller modules',
      })
    }

    // Complex function issue
    const functions = content.match(/(?:function|const)\s+\w+[^{]*\{[\s\S]*?^}/gm) || []
    functions.forEach((func, index) => {
      const funcLines = func.split('\n').length
      if (funcLines > 50) {
        issues.push({
          type: 'complexity',
          severity: 'high',
          message: `Function ${index + 1} is too complex (${funcLines} lines)`,
          suggestion: 'Consider breaking this function into smaller pieces',
        })
      }
    })

    // Missing error handling
    if (
      filePath.includes('.ts') &&
      !this.hasErrorHandling(content) &&
      this.countFunctions(content) > 0
    ) {
      issues.push({
        type: 'maintainability',
        severity: 'medium',
        message: 'Functions without error handling',
        suggestion: 'Add try-catch blocks for error handling',
      })
    }

    // Security issues
    if (content.includes('eval(') || content.includes('innerHTML')) {
      issues.push({
        type: 'security',
        severity: 'critical',
        message: 'Potentially unsafe code detected',
        suggestion: 'Avoid eval() and innerHTML for security reasons',
      })
    }

    // TypeScript issues
    if (filePath.includes('.ts') && content.includes('any')) {
      issues.push({
        type: 'maintainability',
        severity: 'low',
        message: 'Usage of any type detected',
        suggestion: 'Use specific types instead of any for better type safety',
      })
    }

    return issues
  }

  /**
   * Calculate overall code metrics
   */
  private calculateCodeMetrics(files: FileAnalysis[]): CodeMetrics {
    const totalLines = files.reduce((sum, file) => sum + file.lines, 0)
    const codeLines = files.reduce((sum, file) => sum + file.functions * 10, 0) // Estimate
    const totalFunctions = files.reduce((sum, file) => sum + file.functions, 0)
    const totalClasses = files.reduce((sum, file) => sum + file.classes, 0)

    return {
      totalLines,
      codeLines,
      commentLines: totalLines - codeLines,
      emptyLines: Math.floor(totalLines * 0.1),
      functions: totalFunctions,
      classes: totalClasses,
      fileCount: files.length,
      averageFileLines: totalLines / files.length,
      maxFileLines: Math.max(...files.map(f => f.lines)),
      minFileLines: Math.min(...files.map(f => f.lines)),
    }
  }

  /**
   * Calculate complexity metrics
   */
  private calculateComplexityMetrics(files: FileAnalysis[]): ComplexityMetrics {
    const totalComplexity = files.reduce((sum, file) => sum + file.complexity, 0)
    const totalFunctions = files.reduce((sum, file) => sum + file.functions, 0)

    return {
      cyclomaticComplexity: totalComplexity / files.length,
      cognitiveComplexity: totalComplexity / Math.max(totalFunctions, 1),
      nestingDepth: 3, // Estimate
      duplicateCodeRatio: 0.1, // Estimate
      functionLengthAverage: 15, // Estimate
      parameterCountAverage: 2.5, // Estimate
    }
  }

  /**
   * Calculate quality metrics
   */
  private calculateQualityMetrics(files: FileAnalysis[]): QualityMetrics {
    const filesWithTests = files.filter(f => f.hasTests).length
    const filesWithDoc = files.filter(f => f.hasDocumentation).length
    const filesWithErrorHandling = files.filter(f => f.hasErrorHandling).length
    const tsFiles = files.filter(f => f.isTypeScript).length

    const totalIssues = files.reduce((sum, file) => sum + file.issues.length, 0)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _criticalIssues = files.reduce(
      (sum, file) => sum + file.issues.filter(i => i.severity === 'critical').length,
      0
    )

    return {
      maintainabilityIndex: Math.max(0, 100 - (totalIssues / files.length) * 10),
      technicalDebtRatio: (totalIssues / (files.length * 10)) * 100,
      testCoverage: (filesWithTests / files.length) * 100,
      typeScriptCoverage: (tsFiles / files.length) * 100,
      errorHandlingCoverage: (filesWithErrorHandling / files.length) * 100,
      documentationCoverage: (filesWithDoc / files.length) * 100,
    }
  }

  /**
   * Generate summary and recommendations
   */
  private generateSummary(
    metrics: CodeMetrics,
    complexity: ComplexityMetrics,
    quality: QualityMetrics,
    files: FileAnalysis[]
  ): {
    overallGrade: string
    strengths: string[]
    improvements: string[]
    technicalDebtHours: number
  } {
    const overallGrade = this.calculateGrade(quality)
    const strengths = this.identifyStrengths(metrics, complexity, quality, files)
    const improvements = this.identifyImprovements(metrics, complexity, quality, files)
    const technicalDebtHours = this.estimateTechnicalDebtHours(files)

    return {
      overallGrade,
      strengths,
      improvements,
      technicalDebtHours,
    }
  }

  /**
   * Calculate overall grade
   */
  private calculateGrade(quality: QualityMetrics): string {
    const score =
      quality.maintainabilityIndex * 0.3 +
      quality.testCoverage * 0.2 +
      quality.typeScriptCoverage * 0.2 +
      quality.errorHandlingCoverage * 0.2 +
      quality.documentationCoverage * 0.1

    if (score >= 90) return 'A'
    if (score >= 80) return 'B'
    if (score >= 70) return 'C'
    if (score >= 60) return 'D'
    return 'F'
  }

  /**
   * Identify strengths
   */
  private identifyStrengths(
    metrics: CodeMetrics,
    complexity: ComplexityMetrics,
    quality: QualityMetrics,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _files: FileAnalysis[]
  ): string[] {
    const strengths: string[] = []

    if (quality.typeScriptCoverage >= 90) {
      strengths.push('Excellent TypeScript adoption')
    }

    if (quality.errorHandlingCoverage >= 80) {
      strengths.push('Good error handling coverage')
    }

    if (quality.documentationCoverage >= 70) {
      strengths.push('Well-documented codebase')
    }

    if (metrics.averageFileLines < 200) {
      strengths.push('Reasonable file sizes')
    }

    if (complexity.cyclomaticComplexity < 10) {
      strengths.push('Low complexity code')
    }

    if (strengths.length === 0) {
      strengths.push('Codebase is functional and operational')
    }

    return strengths
  }

  /**
   * Identify areas for improvement
   */
  private identifyImprovements(
    metrics: CodeMetrics,
    complexity: ComplexityMetrics,
    quality: QualityMetrics,
    files: FileAnalysis[]
  ): string[] {
    const improvements: string[] = []

    if (quality.testCoverage < 50) {
      improvements.push('Increase test coverage')
    }

    if (quality.errorHandlingCoverage < 70) {
      improvements.push('Improve error handling')
    }

    if (quality.documentationCoverage < 60) {
      improvements.push('Add more documentation')
    }

    if (metrics.averageFileLines > 250) {
      improvements.push('Break down large files')
    }

    if (complexity.cyclomaticComplexity > 15) {
      improvements.push('Reduce code complexity')
    }

    const criticalIssues = files.reduce(
      (sum, file) => sum + file.issues.filter(i => i.severity === 'critical').length,
      0
    )

    if (criticalIssues > 0) {
      improvements.push('Address critical security and quality issues')
    }

    return improvements
  }

  /**
   * Estimate technical debt in hours
   */
  private estimateTechnicalDebtHours(files: FileAnalysis[]): number {
    let totalHours = 0

    files.forEach(file => {
      file.issues.forEach(issue => {
        switch (issue.severity) {
          case 'critical':
            totalHours += 8
            break
          case 'high':
            totalHours += 4
            break
          case 'medium':
            totalHours += 2
            break
          case 'low':
            totalHours += 1
            break
        }
      })
    })

    return totalHours
  }

  /**
   * Helper method to check if directory exists
   */
  private directoryExists(path: string): boolean {
    try {
      return statSync(path).isDirectory()
    } catch {
      return false
    }
  }

  /**
   * Get all files with specified extensions
   */
  private getAllFiles(dirPath: string, extensions: string[]): string[] {
    const files: string[] = []

    function traverse(currentPath: string): void {
      const items = readdirSync(currentPath)

      for (const item of items) {
        const fullPath = join(currentPath, item)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          traverse(fullPath)
        } else if (extensions.includes(extname(fullPath))) {
          files.push(fullPath)
        }
      }
    }

    traverse(dirPath)
    return files
  }
}

/**
 * Generate code quality report
 */
export async function generateCodeQualityReport(): Promise<void> {
  const analyzer = new CodeQualityAnalyzer()
  const report = await analyzer.analyzeProjectManagementFeature()

  console.log('🔍 Code Quality Report for Project Management Feature')
  console.log('='.repeat(60))

  console.log('\n📊 Overall Grade:', report.summary.overallGrade)
  console.log('📋 Technical Debt:', report.summary.technicalDebtHours, 'hours')

  console.log('\n✅ Strengths:')
  report.summary.strengths.forEach(strength => {
    console.log(`  • ${strength}`)
  })

  console.log('\n🔧 Improvements Needed:')
  report.summary.improvements.forEach(improvement => {
    console.log(`  • ${improvement}`)
  })

  console.log('\n📈 Quality Metrics:')
  console.log(`  • Maintainability Index: ${report.quality.maintainabilityIndex.toFixed(1)}%`)
  console.log(`  • Test Coverage: ${report.quality.testCoverage.toFixed(1)}%`)
  console.log(`  • TypeScript Coverage: ${report.quality.typeScriptCoverage.toFixed(1)}%`)
  console.log(`  • Error Handling Coverage: ${report.quality.errorHandlingCoverage.toFixed(1)}%`)
  console.log(`  • Documentation Coverage: ${report.quality.documentationCoverage.toFixed(1)}%`)

  console.log('\n📁 Code Metrics:')
  console.log(`  • Total Files: ${report.metrics.fileCount}`)
  console.log(`  • Total Lines: ${report.metrics.totalLines}`)
  console.log(`  • Total Functions: ${report.metrics.functions}`)
  console.log(`  • Average File Size: ${report.metrics.averageFileLines.toFixed(0)} lines`)

  console.log('\n🧩 Complexity Metrics:')
  console.log(`  • Cyclomatic Complexity: ${report.complexity.cyclomaticComplexity.toFixed(1)}`)
  console.log(`  • Cognitive Complexity: ${report.complexity.cognitiveComplexity.toFixed(1)}`)

  // Show critical issues
  const criticalIssues = report.files.flatMap(f => f.issues).filter(i => i.severity === 'critical')

  if (criticalIssues.length > 0) {
    console.log('\n🚨 Critical Issues:')
    criticalIssues.forEach(issue => {
      console.log(`  • ${issue.message}`)
      if (issue.suggestion) {
        console.log(`    → ${issue.suggestion}`)
      }
    })
  }

  console.log('\n' + '='.repeat(60))
}
