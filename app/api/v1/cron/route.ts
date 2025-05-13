import { NextResponse } from 'next/server';
import { updateCacheInBackground } from '../../lib/cache';
import { 
  fetchTokenBoosts, 
  fetchRankTopics,
  fetchTokensByTopic
} from '../../lib/fetchers';
import { 
  transformDexScreenerTokens,
  transformAveTokens, 
  prepareHomeData 
} from '../../lib/transforms';

/**
 * 定时任务触发API
 * 该API可被外部CRON服务调用以定期刷新缓存
 */
export async function POST(request: Request): Promise<NextResponse> {
  // 验证API密钥
  const apiKey = request.headers.get('x-api-key');
  const cronApiKey = process.env.CRON_API_KEY || '';
  
  if (!apiKey || apiKey !== cronApiKey) {
    return NextResponse.json({ 
      success: false, 
      error: '未授权', 
      message: '无效的API密钥'
    }, { status: 401 });
  }
  
  try {
    // 并行启动所有更新任务
    const tasks = [
      updateCacheInBackground('token_boosts', refreshTokenBoostsCache),
      updateCacheInBackground('ave_data', refreshAveDataCache),
      updateCacheInBackground('home_data', refreshHomeDataCache),
      updateCacheInBackground('topics', refreshTopicsCache),
    ];
    
    // 等待所有任务完成
    const results = await Promise.allSettled(tasks);
    
    // 计算更新结果
    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const failed = results.filter(r => r.status === 'rejected' || !r.value).length;
    
    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      cache_updates: {
        succeeded,
        failed,
        total: tasks.length
      }
    });
  } catch (error) {
    console.error('定时任务执行错误:', error);
    return NextResponse.json({
      success: false,
      error: '缓存刷新失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: Date.now()
    }, { status: 500 });
  }
}

// 缓存刷新函数
async function refreshTokenBoostsCache() {
  const response = await fetchTokenBoosts();
  const tokens = transformDexScreenerTokens(response);
  return {
    success: true,
    data: {
      tokens,
      count: tokens.length
    },
    timestamp: Date.now()
  };
}

async function refreshAveDataCache() {
  const response = await fetchTokensByTopic('hot');
  const tokens = transformAveTokens(response);
  return {
    success: true,
    data: {
      tokens,
      count: tokens.length
    },
    timestamp: Date.now()
  };
}

async function refreshHomeDataCache() {
  let tokens = [];
  
  // 尝试获取Ave数据
  try {
    const response = await fetchTokensByTopic('hot');
    tokens = transformAveTokens(response);
  } catch (error) {
    // 如果Ave失败，使用token_boosts数据
    const tokenBoostsResponse = await fetchTokenBoosts();
    tokens = transformDexScreenerTokens(tokenBoostsResponse);
  }
  
  return prepareHomeData(tokens);
}

async function refreshTopicsCache() {
  const response = await fetchRankTopics();
  return {
    success: true,
    data: {
      topics: response.data
    },
    timestamp: Date.now()
  };
} 