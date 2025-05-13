/**
 * API中间件模块
 * 提供请求处理、响应格式化和安全功能
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from './types';
import { buildErrorResponse, ApiError } from './errors';

// IP地址速率限制记录
const ipRateLimits: Record<string, { count: number, timestamp: number }> = {};

// 清除过期IP限制的定时器
setInterval(() => {
  const now = Date.now();
  for (const ip in ipRateLimits) {
    // 清除10分钟前的记录
    if (now - ipRateLimits[ip].timestamp > 10 * 60 * 1000) {
      delete ipRateLimits[ip];
    }
  }
}, 60 * 1000); // 每分钟运行一次

/**
 * 速率限制检查
 * 
 * @param req 请求对象
 * @param maxRequests 时间窗口内允许的最大请求数
 * @param windowSizeMs 时间窗口大小（毫秒）
 * @returns 如果超出限制返回错误响应，否则返回null
 */
export function checkRateLimit(
  req: NextRequest,
  maxRequests: number = 100,
  windowSizeMs: number = 60 * 1000
): NextResponse | null {
  // 获取客户端IP
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  // 初始化或更新IP记录
  if (!ipRateLimits[ip] || now - ipRateLimits[ip].timestamp > windowSizeMs) {
    ipRateLimits[ip] = { count: 1, timestamp: now };
    return null;
  }
  
  // 增加计数
  ipRateLimits[ip].count++;
  
  // 检查是否超过限制
  if (ipRateLimits[ip].count > maxRequests) {
    return NextResponse.json(
      buildErrorResponse({
        message: '请求过于频繁，请稍后再试',
        statusCode: 429
      }),
      { status: 429 }
    );
  }
  
  return null;
}

/**
 * 格式化API响应
 * 
 * @param data 响应数据
 * @returns 格式化后的API响应
 */
export function formatApiResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: Date.now()
  };
}

/**
 * API请求处理包装器
 * 
 * @param handler API处理函数
 * @param req 请求对象
 * @returns 处理后的响应
 */
export async function withApiMiddleware<T>(
  handler: () => Promise<T>,
  req: NextRequest
): Promise<NextResponse> {
  // 检查速率限制
  const rateLimitResponse = checkRateLimit(req);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }
  
  try {
    // 执行处理函数
    const result = await handler();
    
    // 格式化响应
    const formattedResponse = formatApiResponse(result);
    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('API处理器错误:', error);
    const statusCode = error instanceof ApiError ? error.statusCode : 500;
    return NextResponse.json(
      buildErrorResponse(error), 
      { status: statusCode }
    );
  }
}

/**
 * API密钥验证
 * 
 * @param req 请求对象
 * @param apiKeyHeaderName API密钥头名称
 * @param validApiKey 有效的API密钥
 * @returns 如果验证失败返回错误响应，否则返回null
 */
export function validateApiKey(
  req: NextRequest,
  apiKeyHeaderName: string = 'x-api-key',
  validApiKey: string = process.env.API_KEY || ''
): NextResponse | null {
  const apiKey = req.headers.get(apiKeyHeaderName);
  
  if (!apiKey || apiKey !== validApiKey) {
    return NextResponse.json(
      buildErrorResponse({
        message: 'API密钥无效',
        statusCode: 401
      }),
      { status: 401 }
    );
  }
  
  return null;
}

/**
 * CORS头设置
 * 
 * @param res 响应对象
 * @param allowedOrigins 允许的源列表
 * @returns 设置了CORS头的响应
 */
export function setCorsHeaders(
  res: NextResponse,
  allowedOrigins: string[] = ['*']
): NextResponse {
  // 设置CORS头
  res.headers.set('Access-Control-Allow-Origin', allowedOrigins.join(', '));
  res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.headers.set('Access-Control-Max-Age', '86400');
  
  return res;
} 