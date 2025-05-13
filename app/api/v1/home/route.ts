import { NextRequest, NextResponse } from 'next/server';
import { getCache, setCache } from '../../lib/cache';
import { fetchTokensByTopic, fetchTokenBoosts, getDummyTokens } from '../../lib/fetchers';
import { transformAveTokens, transformDexScreenerTokens, prepareHomeData } from '../../lib/transforms';
import { withApiMiddleware, setCorsHeaders } from '../../lib/middleware';
import { ApiError } from '../../lib/errors';

/**
 * 获取首页综合数据
 * GET /api/v1/home
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  return await withApiMiddleware(
    async () => {
      // 检查缓存
      const cacheKey = 'home_data';
      const cachedData = await getCache(cacheKey);
      
      if (cachedData) {
        console.log('返回缓存的home数据');
        return cachedData.data;
      }
      
      // 获取新数据
      console.log('获取最新home数据');
      let tokens = [];
      
      try {
        // 优先尝试获取Ave.ai热门代币
        const response = await fetchTokensByTopic('hot');
        if (response.status === 1 && response.data && Array.isArray(response.data)) {
          tokens = transformAveTokens(response);
          console.log(`从Ave.ai获取到${tokens.length}个代币`);
        } else {
          throw new Error('Ave API响应格式无效');
        }
      } catch (error) {
        console.error('从Ave.ai获取代币失败，尝试DexScreener:', error);
        
        try {
          // 如果Ave.ai失败，尝试使用DexScreener
          const dexResponse = await fetchTokenBoosts();
          tokens = transformDexScreenerTokens(dexResponse);
          console.log(`从DexScreener获取到${tokens.length}个代币`);
        } catch (dexError) {
          console.error('从DexScreener获取代币失败，使用测试数据:', dexError);
          
          // 都失败时使用测试数据
          tokens = getDummyTokens();
          console.log(`使用${tokens.length}个测试代币数据`);
          
          // 如果在生产环境，记录为错误但仍返回测试数据
          if (process.env.NODE_ENV === 'production') {
            console.error('警告：在生产环境中使用测试数据');
          }
        }
      }
      
      // 验证数据有效性
      if (!tokens || tokens.length === 0) {
        throw new ApiError('无法获取代币数据', 500);
      }
      
      // 准备主页数据
      const result = prepareHomeData(tokens);
      
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