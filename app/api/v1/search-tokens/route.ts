import { NextResponse } from 'next/server';
import { getCache, setCache } from '../../lib/cache';
import { searchTokens, getDummyTokens } from '../../lib/fetchers';
import { transformAveTokens } from '../../lib/transforms';
import { withErrorHandling, buildErrorResponse } from '../../lib/errors';
import { ApiResponse, TokenData } from '../../lib/types';

/**
 * 搜索代币
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const chain = searchParams.get('chain') || undefined;
    
    if (!keyword) {
      return NextResponse.json({
        success: false,
        error: '参数错误',
        message: '需要提供keyword参数',
        timestamp: Date.now()
      }, { status: 400 });
    }
    
    console.log(`API请求：search-tokens，keyword=${keyword}${chain ? ', chain=' + chain : ''}`);
    
    return await withErrorHandling(
      async () => {
        // 搜索结果较为动态，设置较短的缓存时间
        const cacheKey = `search_${keyword}${chain ? '_' + chain : ''}`;
        const cachedData = await getCache(cacheKey);
        
        if (cachedData) {
          console.log(`返回缓存的搜索结果，keyword=${keyword}`);
          return NextResponse.json(cachedData);
        }
        
        // 获取新数据
        console.log(`执行新搜索，keyword=${keyword}`);
        const response = await searchTokens(keyword, chain);
        
        // 检查响应格式
        if (response.status !== 1 || !response.data) {
          return NextResponse.json({
            success: false,
            error: '搜索失败',
            message: '搜索服务返回无效数据',
            timestamp: Date.now()
          }, { status: 500 });
        }
        
        // 转换数据
        const tokens = transformAveTokens(response);
        
        // 构建响应
        const result: ApiResponse<{ tokens: TokenData[], count: number, keyword: string }> = {
          success: true,
          data: {
            tokens,
            count: tokens.length,
            keyword
          },
          timestamp: Date.now()
        };
        
        // 更新缓存
        await setCache(cacheKey, result);
        
        return NextResponse.json(result);
      },
      // 错误处理 - 使用模拟数据
      async () => {
        const tokens = getDummyTokens(10).map(token => {
          token.name = `${keyword} ${token.name}`;
          token.symbol = `${token.symbol}${keyword.substring(0, 2).toUpperCase()}`;
          return token;
        });
        
        return {
          success: true,
          data: {
            tokens,
            count: tokens.length,
            keyword
          },
          timestamp: Date.now(),
          fallback: true
        };
      }
    );
  } catch (error) {
    console.error('search-tokens API错误:', error);
    return NextResponse.json(buildErrorResponse(error), { status: 500 });
  }
} 