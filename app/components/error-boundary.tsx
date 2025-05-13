"use client"

import React, { ErrorInfo } from "react"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

/**
 * 错误边界组件
 * 用于捕获和处理组件树中的 JavaScript 错误
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新 state 使下一次渲染显示降级UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // 过滤已知错误，只记录未知错误
    if (
      error.message.includes("ethereum") || 
      error.message.includes("[object Object]")
    ) {
      // 已知错误，不处理
      return;
    }
    
    // 记录未捕获的错误
    console.error("Error boundary caught error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // 如果提供了自定义的fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      // 默认的错误UI
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
          <div className="text-center p-6 max-w-sm mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-4">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
              页面出错了
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              应用发生了一个错误，请刷新页面或返回首页重试。
            </p>
            <div className="pt-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                返回首页
              </button>
              <button
                onClick={() => window.location.reload()}
                className="ml-2 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                刷新页面
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary 