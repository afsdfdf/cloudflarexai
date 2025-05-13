/**
 * 日志处理工具
 * 
 * 提供安全的日志记录功能，避免在控制台中显示"[object Object]"错误。
 * 当对象被直接传递给console.log时，可能显示为"[object Object]"，
 * 这个工具可以确保对象被正确地格式化和显示。
 */

/**
 * 安全地记录对象到控制台
 * @param obj 需要记录的对象
 * @param label 可选的标签
 */
export function safeLogObject(obj: any, label?: string): void {
  try {
    // 检查是否是开发环境
    if (process.env.NODE_ENV !== 'production') {
      if (label) {
        console.log(`${label}:`, JSON.stringify(obj, null, 2));
      } else {
        console.log(JSON.stringify(obj, null, 2));
      }
    }
  } catch (error) {
    // 如果JSON.stringify失败(可能由于循环引用)，使用替代方法
    console.log(label ? `${label} (无法序列化):` : '无法序列化对象:', obj);
  }
}

/**
 * 安全地记录错误到控制台
 * @param error 需要记录的错误
 * @param context 错误上下文
 */
export function safeLogError(error: any, context?: string): void {
  try {
    // 创建一个简化的错误对象，避免循环引用
    const errorObj = {
      message: error?.message || (typeof error === 'string' ? error : '未知错误'),
      // 不再包含整个stack属性，只使用简单字符串
      context: context || '未指定'
    };
    
    // 不再尝试展开整个error对象，这可能导致循环引用
    
    // 在开发环境中记录详细信息
    if (process.env.NODE_ENV !== 'production') {
      console.error(`错误 [${context || 'unknown'}]:`, errorObj.message);
    } else {
      // 在生产环境中记录简化信息
      console.error(`错误 [${context || 'unknown'}]:`, errorObj.message);
    }
  } catch (loggingError) {
    // 使用最基本的方式记录错误，确保不会导致新的异常
    try {
      console.warn('记录错误时出现异常 - 原始错误信息:', 
        (error && typeof error.message === 'string') ? error.message : '无法获取错误信息');
    } catch (_) {
      // 完全放弃，不再尝试记录
    }
  }
}

/**
 * 安装全局错误处理器，用于捕获和过滤常见错误，如[object Object]和ethereum相关错误
 */
export function installGlobalErrorHandlers(): () => void {
  try {
    // 保存原始console方法
    const originalConsoleError = console.error;
    const originalConsoleLog = console.log;
    
    // 替换console.error，避免显示特定错误
    console.error = function(...args) {
      try {
        const errorString = String(args[0] || '');
        
        // 过滤掉特定错误
        if (
          errorString.includes('[object Object]') ||
          errorString.includes('ethereum') ||
          errorString.includes('Cannot redefine property')
        ) {
          return;
        }
        
        originalConsoleError.apply(console, args);
      } catch (e) {
        // 如果处理错误时出错，回退到原始error方法
        try {
          originalConsoleError.call(console, args[0]);
        } catch (_) {
          // 完全放弃
        }
      }
    };
    
    // 改进console.log处理
    console.log = function(...args) {
      try {
        // 如果只有一个参数且是对象，使用更好的格式化
        if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
          try {
            originalConsoleLog.call(console, typeof args[0].toString === 'function' ? 
              args[0].toString() : JSON.stringify(args[0], null, 2));
          } catch (e) {
            // 如果对象不能被序列化，使用简单描述
            originalConsoleLog.call(console, '[不可序列化对象]');
          }
          return;
        }
        
        originalConsoleLog.apply(console, args);
      } catch (e) {
        // 如果出错，尝试一个更简单的方法
        try {
          originalConsoleLog.call(console, '[日志错误]');
        } catch (_) {
          // 完全放弃
        }
      }
    };
    
    // 添加全局错误事件处理器
    const handleGlobalError = (event: ErrorEvent) => {
      try {
        const errorMsg = event.message || '';
        if (
          errorMsg.includes('[object Object]') ||
          errorMsg.includes('ethereum') ||
          errorMsg.includes('Cannot redefine property')
        ) {
          event.preventDefault();
          return false;
        }
      } catch (_) {
        // 忽略处理错误的错误
      }
      return true;
    };
    
    // 处理未捕获的Promise错误
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      try {
        const errorMsg = String(event.reason || '');
        if (
          errorMsg.includes('[object Object]') ||
          errorMsg.includes('ethereum') ||
          errorMsg.includes('Cannot redefine property')
        ) {
          event.preventDefault();
          return false;
        }
      } catch (_) {
        // 忽略处理错误的错误
      }
      return true;
    };
    
    // 添加事件监听器
    window.addEventListener('error', handleGlobalError, true);
    window.addEventListener('unhandledrejection', handleUnhandledRejection, true);
    
    // 返回清理函数
    return () => {
      try {
        window.removeEventListener('error', handleGlobalError, true);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection, true);
        console.error = originalConsoleError;
        console.log = originalConsoleLog;
      } catch (_) {
        // 忽略清理过程中的任何错误
      }
    };
  } catch (e) {
    // 如果整个设置过程失败，返回空的清理函数
    return () => {};
  }
}

export default {
  safeLogObject,
  safeLogError,
  installGlobalErrorHandlers
}; 