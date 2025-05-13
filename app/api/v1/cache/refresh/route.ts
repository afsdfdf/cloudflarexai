import { NextResponse } from 'next/server';
import { getCache, clearMemoryCache, setCache } from '../../../lib/cache';
import { 
  fetchTokenBoosts, 
  fetchRankTopics, 
  fetchTokensByTopic
} from '../../../lib/fetchers';
import { 
  transformDexScreenerTokens, 
  transformAveTokens, 
  prepareHomeData
} from '../../../lib/transforms';

/**
 * 刷新缓存
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 可选：添加安全验证
    const authHeader = request.headers.get('authorization');
    if (process.env.CACHE_REFRESH_SECRET && 
        (!authHeader || authHeader !== `Bearer ${process.env.CACHE_REFRESH_SECRET}`)) {
      return NextResponse.json({
        success: false,
        error: '未授权',
        message: '刷新缓存需要有效的认证',
        timestamp: Date.now()
      }, { status: 401 });
    }
    
    // 从请求中获取要刷新的缓存类型
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    console.log(`刷新缓存请求: ${type || 'all'}`);
    
    // 根据请求刷新特定缓存或所有缓存
    if (type) {
      await refreshSpecificCache(type);
    } else {
      await refreshAllCaches();
    }
    
    return NextResponse.json({
      success: true,
      message: `缓存刷新成功: ${type || 'all'}`,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('缓存刷新API错误:', error);
    
    return NextResponse.json({
      success: false,
      error: '缓存刷新失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: Date.now()
    }, { status: 500 });
  }
}

/**
 * 刷新特定类型的缓存
 */
async function refreshSpecificCache(type: string): Promise<void> {
  switch (type) {
    case 'token_boosts':
      await refreshTokenBoostsCache();
      break;
    case 'home_data':
      await refreshHomeDataCache();
      break;
    case 'topics':
      await refreshTopicsCache();
      break;
    default:
      throw new Error(`未知的缓存类型: ${type}`);
  }
}

/**
 * 刷新所有缓存
 */
async function refreshAllCaches(): Promise<void> {
  // 并行刷新所有缓存
  await Promise.all([
    refreshTokenBoostsCache(),
    refreshHomeDataCache(),
    refreshTopicsCache()
  ]);
}

/**
 * 刷新token_boosts缓存
 */
async function refreshTokenBoostsCache(): Promise<void> {
  console.log('刷新token_boosts缓存');
  
  // 清除现有缓存
  clearMemoryCache('token_boosts');
  
  // 获取新数据
  const response = await fetchTokenBoosts();
  const tokens = transformDexScreenerTokens(response);
  
  // 更新缓存
  await setCache('token_boosts', {
    success: true,
    data: {
      tokens,
      count: tokens.length
    },
    timestamp: Date.now()
  });
  
  console.log(`token_boosts缓存已更新，共${tokens.length}个代币`);
}

/**
 * 刷新home_data缓存
 */
async function refreshHomeDataCache(): Promise<void> {
  console.log('刷新home_data缓存');
  
  // 清除现有缓存
  clearMemoryCache('home_data');
  
  // 尝试获取Ave数据
  let tokens = [];
  
  try {
    const response = await fetchTokensByTopic('hot');
    tokens = transformAveTokens(response);
  } catch (error) {
    console.error('从Ave.ai获取数据失败，尝试DexScreener:', error);
    
    // 如果Ave失败，使用token_boosts数据
    const cachedTokenBoosts = await getCache('token_boosts');
    if (cachedTokenBoosts?.data?.tokens) {
      tokens = cachedTokenBoosts.data.tokens;
    } else {
      const response = await fetchTokenBoosts();
      tokens = transformDexScreenerTokens(response);
    }
  }
  
  // 准备主页数据
  const homeData = prepareHomeData(tokens);
  
  // 更新缓存
  await setCache('home_data', homeData);
  
  console.log(`home_data缓存已更新，共${tokens.length}个代币`);
}

/**
 * 刷新topics缓存
 */
async function refreshTopicsCache(): Promise<void> {
  console.log('刷新topics缓存');
  
  // 清除现有缓存
  clearMemoryCache('topics');
  
  // 获取新数据
  const response = await fetchRankTopics();
  
  // 更新缓存
  await setCache('topics', {
    success: true,
    data: {
      topics: response.data
    },
    timestamp: Date.now()
  });
  
  console.log('topics缓存已更新');
} 