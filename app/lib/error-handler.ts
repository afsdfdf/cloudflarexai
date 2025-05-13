/**
 * 全局错误处理工具
 * 提供一个统一的错误处理机制，避免不必要的控制台错误
 */

// 初始化错误处理
export function initErrorHandler() {
  // 仅在客户端运行
  if (typeof window === 'undefined') return;

  // 保存原始console方法
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  // 安全地将任何值转换为字符串
  const safeStringify = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value);
      } catch (e) {
        return Object.prototype.toString.call(value);
      }
    }
    
    return String(value);
  };

  // 是否为开发环境
  const isDev = process.env.NODE_ENV === 'development';

  // 需要过滤的错误消息列表
  const errorsToFilter = [
    'Cannot redefine property: ethereum',
    '[object Object]',
    'ChunkLoadError',
    'Loading chunk',
  ];

  // 开发环境下需要显示但可以抑制警告级别的错误 
  const developmentWarningErrors = [
    'Failed to load resource',
    'NetworkError',
  ];

  // 处理控制台错误
  console.error = function(...args) {
    // 检查错误是否是我们想要过滤的
    const errorString = safeStringify(args[0]);
    
    // 始终过滤的错误
    if (errorsToFilter.some(error => errorString.includes(error))) {
      if (isDev) {
        // 开发环境下显示简短提示，但不是完整错误
        originalConsoleWarn.call(console, '[已过滤错误]', errorString.slice(0, 100) + (errorString.length > 100 ? '...' : ''));
      }
      return;
    }
    
    // 开发环境下降级为警告的错误
    if (isDev && developmentWarningErrors.some(error => errorString.includes(error))) {
      originalConsoleWarn.call(console, '[降级为警告]', ...args);
      return;
    }
    
    // 其他错误正常显示
    originalConsoleError.apply(console, args);
  };

  // 添加全局未捕获错误处理
  const errorHandler = (event: ErrorEvent) => {
    const errorMsg = event.error ? event.error.toString() : event.message;
    
    // 检查错误消息是否包含我们要过滤的字符串
    if (errorMsg && errorsToFilter.some(error => errorMsg.includes(error))) {
      // 阻止错误显示在控制台
      event.preventDefault();
      return false;
    }
    
    // 开发环境下特殊处理某些错误
    if (isDev && errorMsg && developmentWarningErrors.some(error => errorMsg.includes(error))) {
      if (!event.defaultPrevented) {
        originalConsoleWarn.call(console, '[捕获的错误]', errorMsg);
      }
      event.preventDefault();
      return false;
    }
    
    // 其他错误正常处理
    return true;
  };

  // 添加全局未处理的Promise拒绝处理
  const rejectionHandler = (event: PromiseRejectionEvent) => {
    const reasonMsg = safeStringify(event.reason);
    
    // 检查错误消息是否包含我们要过滤的字符串
    if (reasonMsg && errorsToFilter.some(error => reasonMsg.includes(error))) {
      // 阻止错误显示在控制台
      event.preventDefault();
      return false;
    }
    
    // 开发环境下特殊处理某些错误
    if (isDev && reasonMsg && developmentWarningErrors.some(error => reasonMsg.includes(error))) {
      if (!event.defaultPrevented) {
        originalConsoleWarn.call(console, '[未处理的Promise拒绝]', reasonMsg);
      }
      event.preventDefault();
      return false;
    }
    
    // 其他拒绝正常处理
    return true;
  };

  window.addEventListener('error', errorHandler, true);
  window.addEventListener('unhandledrejection', rejectionHandler, true);
  
  // 返回一个清理函数，以便在需要时移除事件监听器
  return () => {
    window.removeEventListener('error', errorHandler, true);
    window.removeEventListener('unhandledrejection', rejectionHandler, true);
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  };
} 