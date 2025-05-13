import { NextRequest, NextResponse } from 'next/server';
import { getCacheStatus } from '../../lib/cache';
import { withApiMiddleware, setCorsHeaders } from '../../lib/middleware';

/**
 * 健康检查
 * GET /api/v1/health
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return await withApiMiddleware(
    async () => {
      // 获取缓存状态
      const cacheStatus = await getCacheStatus();
      
      // 返回健康状态
      return {
        status: 'healthy',
        cache: cacheStatus,
        version: '1.0.0',
        backend: 'js'
      };
    },
    req
  );
}

/**
 * 处理OPTIONS请求（CORS预检）
 */
export async function OPTIONS(req: NextRequest): Promise<NextResponse> {
  const res = new NextResponse(null, { status: 204 });
  return setCorsHeaders(res);
} 