import { NextResponse } from 'next/server';
import { getCache, setCache } from '../../lib/cache';
import { fetchTokenDetails } from '../../lib/fetchers';
import { transformAveTokenDetail } from '../../lib/transforms';
import { withErrorHandling, buildErrorResponse } from '../../lib/errors';
import { ApiResponse, TokenDetail } from '../../lib/types';

/**
 * 获取代币详情
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('tokenId');
    
    if (!tokenId) {
      return NextResponse.json({
        success: false,
        error: '参数错误',
        message: '需要提供tokenId参数',
        timestamp: Date.now()
      }, { status: 400 });
    }
    
    console.log(`API请求：token-details，tokenId=${tokenId}`);
    
    return await withErrorHandling(
      async () => {
        // 检查缓存
        const cacheKey = `token_details_${tokenId}`;
        const cachedData = await getCache(cacheKey);
        
        if (cachedData) {
          console.log(`返回缓存的代币详情，tokenId=${tokenId}`);
          return NextResponse.json(cachedData);
        }
        
        // 获取新数据
        console.log(`获取最新代币详情，tokenId=${tokenId}`);
        const response = await fetchTokenDetails(tokenId);
        
        // 转换数据
        const tokenDetail = transformAveTokenDetail(response);
        
        if (!tokenDetail) {
          return NextResponse.json({
            success: false,
            error: '代币未找到',
            message: `未找到ID为${tokenId}的代币详情`,
            timestamp: Date.now()
          }, { status: 404 });
        }
        
        // 构建响应
        const result: ApiResponse<{ token: TokenDetail }> = {
          success: true,
          data: {
            token: tokenDetail
          },
          timestamp: Date.now()
        };
        
        // 更新缓存
        await setCache(cacheKey, result);
        
        return NextResponse.json(result);
      },
      // 缓存提供器，用于错误时返回旧数据
      async () => getCache(`token_details_${tokenId}`)
    );
  } catch (error) {
    console.error('token-details API错误:', error);
    return NextResponse.json(buildErrorResponse(error), { status: 500 });
  }
} 