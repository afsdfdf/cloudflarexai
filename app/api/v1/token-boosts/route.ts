import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '../../lib/cache';
import { fetchTokenBoosts } from '../../lib/fetchers';
import { transformDexScreenerTokens } from '../../lib/transforms';
import { withApiMiddleware, setCorsHeaders } from '../../lib/middleware';
import { TokenData } from '../../lib/types';

/**
 * 获取热门代币提升数据
 * GET /api/v1/token-boosts
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return await withApiMiddleware(
    async () => {
      // 检查缓存
      const cacheKey = 'token_boosts';
      const cachedData = await getCache(cacheKey);
      
      if (cachedData) {
        console.log('返回缓存的token-boosts数据');
        return cachedData.data;
      }
      
      // 获取新数据
      console.log('获取最新token-boosts数据');
      const response = await fetchTokenBoosts();
      
      // 转换数据
      const tokens = transformDexScreenerTokens(response);
      
      // 构建结果对象
      const result = {
        tokens,
        count: tokens.length
      };
      
      // 更新缓存
      await setCache(cacheKey, {
        success: true,
        data: result,
        timestamp: Date.now()
      });
      
      return result;
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