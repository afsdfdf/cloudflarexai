/**
 * API错误处理模块
 */

// API错误类
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

// 构建错误响应
export function buildErrorResponse(error: any) {
  console.error('API错误:', error);
  
  if (error instanceof ApiError) {
    return {
      success: false,
      error: 'API请求失败',
      message: error.message,
      status: error.statusCode,
      timestamp: Date.now()
    };
  }
  
  return {
    success: false,
    error: '内部服务器错误',
    message: error instanceof Error ? error.message : '未知错误',
    status: 500,
    timestamp: Date.now()
  };
}

// API请求错误处理包装器
export async function withErrorHandling<T>(
  handler: () => Promise<T>,
  cacheProvider?: () => Promise<T | null>
): Promise<T> {
  try {
    return await handler();
  } catch (error) {
    console.error('API处理器错误:', error);
    
    // 如果提供了缓存提供器，尝试使用缓存
    if (cacheProvider) {
      try {
        const cachedData = await cacheProvider();
        if (cachedData) {
          console.log('发生错误后返回过期缓存');
          return {
            ...cachedData,
            stale: true,
            stale_reason: error instanceof Error ? error.message : '未知错误'
          } as unknown as T;
        }
      } catch (cacheError) {
        console.error('访问缓存时出错:', cacheError);
      }
    }
    
    throw error;
  }
} 