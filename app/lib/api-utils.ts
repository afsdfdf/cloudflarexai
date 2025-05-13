/**
 * API工具函数 - 提供通用请求处理、错误处理和超时机制
 */

interface ApiRequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  retryCondition?: (error: ApiError) => boolean;
  shouldRetryOnServerError?: boolean;
  next?: { revalidate?: number };
}

/**
 * API请求错误类
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data: any;

  constructor(message: string, status: number, statusText: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

/**
 * 通用API请求函数
 * @param endpoint API端点
 * @param options 请求选项
 * @returns 请求响应数据
 */
export async function apiRequest<T = any>(
  endpoint: string, 
  options: ApiRequestOptions = {}
): Promise<T> {
  const { 
    timeout = 15000, 
    retries = 0, 
    retryDelay = 1000,
    retryCondition,
    shouldRetryOnServerError = true,
    ...fetchOptions 
  } = options;

  let currentAttempt = 0;
  const maxAttempts = retries + 1;

  while (currentAttempt < maxAttempts) {
    // 创建AbortController用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // 构建完整URL
      let url: string;
      if (endpoint.startsWith('http')) {
        url = endpoint;
      } else {
        // 检查是否在服务器端
        const isServer = typeof window === 'undefined';
        
        if (isServer) {
          // 服务器端，使用绝对URL
          if (endpoint.startsWith('/')) {
            const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
            url = new URL(endpoint, baseAppUrl).toString();
          } else {
            url = endpoint;
          }
        } else {
          // 客户端，使用window.location.origin
          url = new URL(endpoint, window.location.origin).toString();
        }
      }
      
      console.log('API请求URL:', url);
      
      // 请求开始时间戳
      const startTime = Date.now();
      
      // 发起请求
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        }
      });

      // 清除超时
      clearTimeout(timeoutId);
      
      // 请求结束时间戳
      const endTime = Date.now();
      const requestDuration = endTime - startTime;
      
      // 记录慢请求 (>2秒)
      if (requestDuration > 2000) {
        console.warn(`慢请求: ${url} 耗时 ${requestDuration}ms`);
      }

      // 获取响应数据
      let data: any;
      try {
        data = await response.json();
      } catch (e) {
        // 如果不是有效的JSON，创建一个通用错误对象
        data = { error: 'Invalid JSON response' };
      }

      // 检查响应状态
      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `请求失败，状态码: ${response.status}`;
        throw new ApiError(
          errorMessage,
          response.status,
          response.statusText,
          data
        );
      }

      return data as T;
    } catch (error: any) {
      // 清除超时
      clearTimeout(timeoutId);

      // 处理中止错误
      if (error.name === 'AbortError') {
        throw new ApiError('请求超时', 408, 'Request Timeout');
      }

      // 超过重试次数，直接抛出错误
      currentAttempt++;
      if (currentAttempt >= maxAttempts) {
        if (error instanceof ApiError) {
          throw error;
        }
        
        // 处理其他错误
        throw new ApiError(
          error.message || '未知错误',
          500,
          'Internal Error'
        );
      }
      
      // 检查是否应该重试
      const shouldRetry = retryCondition 
        ? retryCondition(error instanceof ApiError ? error : new ApiError(error.message, 500, 'Error'))
        : (
          shouldRetryOnServerError && 
          error instanceof ApiError && 
          error.status >= 500
        );
      
      if (!shouldRetry) {
        throw error;
      }
      
      // 使用指数退避策略
      const delay = Math.min(
        retryDelay * Math.pow(1.5, currentAttempt - 1), 
        10000
      );
      
      console.log(`请求失败，${delay}ms后重试 (${currentAttempt}/${maxAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      // 继续循环尝试下一次请求
    }
  }

  // 这行代码正常不会执行，因为循环内部会返回结果或抛出错误
  throw new ApiError('请求失败，达到最大重试次数', 500, 'Maximum Retries Exceeded');
}

/**
 * 用户友好的错误消息映射
 */
export const errorMessages: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请登录',
  403: '无访问权限',
  404: '未找到请求的资源',
  408: '请求超时，请稍后再试',
  429: '请求过于频繁，请稍后再试',
  500: '服务器错误，请稍后再试',
  502: '网关错误，请稍后再试',
  503: '服务不可用，请稍后再试',
  504: '网关超时，请稍后再试'
};

/**
 * 获取用户友好的错误消息
 * @param error 错误对象
 * @returns 用户友好的错误消息
 */
export function getUserFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return errorMessages[error.status] || error.message;
  }
  
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return '网络连接错误，请检查您的网络连接';
    }
    return error.message;
  }
  
  return '发生未知错误，请稍后再试';
}

/**
 * 构建带参数的URL
 * @param baseUrl 基础URL
 * @param params 参数对象
 * @returns 完整URL
 */
export function buildUrl(baseUrl: string, params: Record<string, string | number | boolean | undefined>): string {
  // 检查是否在服务器端
  const isServer = typeof window === 'undefined';
  
  // 创建URL对象
  let url: URL;
  
  if (isServer) {
    // 服务器端，使用绝对URL
    if (baseUrl.startsWith('/')) {
      // 在服务器端，使用环境变量或默认值作为基础URL
      const baseAppUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      url = new URL(baseUrl, baseAppUrl);
    } else {
      url = new URL(baseUrl);
    }
  } else {
    // 客户端，使用window.location.origin
    url = new URL(baseUrl, window.location.origin);
  }
  
  // 添加参数
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.append(key, String(value));
    }
  });
  
  // 在服务器端，返回完整URL以保证访问正确的端点
  return url.toString();
} 