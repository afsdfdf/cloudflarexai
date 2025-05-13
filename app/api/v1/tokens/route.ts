import { NextResponse } from 'next/server';
import { getCache, setCache } from '../../lib/cache';
import { fetchRankTopics, fetchTokensByTopic, getDummyTopics, getDummyTokens } from '../../lib/fetchers';
import { transformAveTokens } from '../../lib/transforms';
import { withErrorHandling, buildErrorResponse } from '../../lib/errors';
import { ApiResponse, RankTopic, TokenData } from '../../lib/types';

/**
 * 获取代币数据
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic') || 'hot';
    
    console.log(`API请求：tokens，主题=${topic}`);
    
    return await withErrorHandling(async () => {
      // 如果请求的是主题列表
      if (topic === 'topics') {
        return await getTopics();
      }
      
      // 否则根据主题获取代币
      return await getTokensByTopic(topic);
    });
  } catch (error) {
    console.error('tokens API错误:', error);
    return NextResponse.json(buildErrorResponse(error), { status: 500 });
  }
}

/**
 * 获取所有主题
 */
async function getTopics(): Promise<NextResponse> {
  const cacheKey = 'topics';
  const cachedData = await getCache(cacheKey);
  
  if (cachedData) {
    console.log('返回缓存的主题数据');
    return NextResponse.json(cachedData);
  }
  
  console.log('获取最新主题数据');
  try {
    const response = await fetchRankTopics();
    
    if (response.status === 1 && response.data && Array.isArray(response.data)) {
      const topics = response.data;
      
      const result: ApiResponse<{ topics: RankTopic[] }> = {
        success: true,
        data: { topics },
        timestamp: Date.now()
      };
      
      await setCache(cacheKey, result);
      return NextResponse.json(result);
    } else {
      throw new Error('Ave API响应格式无效');
    }
  } catch (error) {
    console.error('获取主题失败，使用测试数据:', error);
    
    // 使用测试数据
    const topics = getDummyTopics();
    
    const result: ApiResponse<{ topics: RankTopic[] }> = {
      success: true,
      data: { topics },
      timestamp: Date.now()
    };
    
    await setCache(cacheKey, result);
    return NextResponse.json(result);
  }
}

/**
 * 根据主题获取代币
 */
async function getTokensByTopic(topic: string): Promise<NextResponse> {
  const cacheKey = `tokens_${topic}`;
  const cachedData = await getCache(cacheKey);
  
  if (cachedData) {
    console.log(`返回缓存的主题${topic}代币数据`);
    return NextResponse.json(cachedData);
  }
  
  console.log(`获取最新主题${topic}代币数据`);
  try {
    const response = await fetchTokensByTopic(topic);
    
    if (response.status === 1 && response.data && Array.isArray(response.data)) {
      const tokens = transformAveTokens(response);
      
      const result: ApiResponse<{ tokens: TokenData[], count: number }> = {
        success: true,
        data: { 
          tokens,
          count: tokens.length
        },
        timestamp: Date.now()
      };
      
      await setCache(cacheKey, result);
      return NextResponse.json(result);
    } else {
      throw new Error('Ave API响应格式无效');
    }
  } catch (error) {
    console.error(`获取主题${topic}代币失败，使用测试数据:`, error);
    
    // 使用测试数据
    const tokens = getDummyTokens();
    
    const result: ApiResponse<{ tokens: TokenData[], count: number }> = {
      success: true,
      data: { 
        tokens,
        count: tokens.length
      },
      timestamp: Date.now()
    };
    
    await setCache(cacheKey, result);
    return NextResponse.json(result);
  }
} 