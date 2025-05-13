import { NextResponse } from 'next/server';
import { KLineData } from 'klinecharts';
import { AVE_API_KEY } from '../../api/lib/constants';

// 缓存K线数据，减少API调用
const klineCache: Record<string, { data: KLineData[], timestamp: number }> = {};
const CACHE_TTL = 10 * 60 * 1000; // 增加到10分钟缓存，减少API调用

// 为各种API端点维护全局请求计数
interface RequestCounter {
  lastRequestTime: number;
  count: number;
}

const requestCounters: Record<string, RequestCounter> = {
  kline: { lastRequestTime: 0, count: 0 },
  tokenDetails: { lastRequestTime: 0, count: 0 },
  transactions: { lastRequestTime: 0, count: 0 },
  holders: { lastRequestTime: 0, count: 0 },
  risk: { lastRequestTime: 0, count: 0 }
};

// 延迟函数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 检查并执行速率限制
async function executeWithRateLimit(
  endpoint: string, 
  minDelay: number = 1000, 
  fn: () => Promise<any>
): Promise<any> {
  const counter = requestCounters[endpoint];
  const now = Date.now();
  const timeSinceLastRequest = now - counter.lastRequestTime;
  
  // 如果距离上次请求时间不足minDelay，则等待
  if (counter.lastRequestTime > 0 && timeSinceLastRequest < minDelay) {
    const waitTime = minDelay - timeSinceLastRequest;
    console.log(`API率限制: ${endpoint} 等待 ${waitTime}ms`);
    await sleep(waitTime);
  }
  
  // 更新计数器
  counter.lastRequestTime = Date.now();
  counter.count++;
  
  try {
    return await fn();
  } catch (error) {
    // 如果是429错误，等待更长时间后重试
    if (error instanceof Error && error.message.includes('429')) {
      console.log(`${endpoint} 遇到速率限制，等待2秒后重试`);
      await sleep(2000);
      counter.lastRequestTime = Date.now(); // 更新上次请求时间
      return await fn();
    }
    throw error;
  }
}

// 直接从Ave.ai API获取K线数据的函数
async function fetchAveKlineData(address: string, chain: string, interval: string, limit: number): Promise<KLineData[]> {
  return executeWithRateLimit('kline', 500, async () => {
    try {
      // 格式化token_id
      const tokenId = `${address}-${chain}`;
      
      // 处理时间间隔参数
      const intervalMap: { [key: string]: number } = {
        '1m': 1,
        '5m': 5,
        '15m': 15,
        '30m': 30,
        '1h': 60,
        '2h': 120,
        '4h': 240,
        '1d': 1440,
        '3d': 4320,
        '1w': 10080,
        '1M': 43200,
        '1y': 525600
      };
      
      const intervalValue = intervalMap[interval] || 1440; // 默认日K
      
      // 检查缓存
      const cacheKey = `${tokenId}-${intervalValue}-${limit}`;
      const cachedData = klineCache[cacheKey];
      
      if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
        console.log(`使用缓存的K线数据: ${cacheKey}`);
        return cachedData.data;
      }
      
      // 直接构建URL
      const url = `https://prod.ave-api.com/v2/klines/token/${tokenId}?interval=${intervalValue}&size=${limit}`;
      
      console.log(`直接从Ave.ai获取K线数据: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Accept': '*/*',
          'X-API-KEY': AVE_API_KEY
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('429 Rate limit exceeded');
        }
        throw new Error(`API请求失败，状态码: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 1 || !data.data || !data.data.points) {
        throw new Error('无效的API响应格式');
      }
      
      // 处理API返回的K线数据
      const klinePoints = data.data.points;
      
      const klineData = klinePoints.map((point: any) => ({
        timestamp: point.time * 1000, // 转换为毫秒时间戳
        open: parseFloat(point.open),
        high: parseFloat(point.high),
        low: parseFloat(point.low),
        close: parseFloat(point.close),
        volume: parseFloat(point.volume)
      }));
      
      // 更新缓存
      klineCache[cacheKey] = {
        data: klineData,
        timestamp: Date.now()
      };
      
      return klineData;
    } catch (error) {
      console.error('从Ave.ai获取K线数据失败:', error);
      throw error;
    }
  });
}

// 生成模拟K线数据的函数 - 仅作为备用
function generateMockKlineData(interval: string, limit: number): KLineData[] {
  const now = Math.floor(Date.now() / 1000);
  const basePrice = 0.007354;
  const volatility = 0.005;
  
  // 根据不同时间间隔设置不同的时间增量
  let timeIncrement: number;
  switch(interval) {
    case '1m': timeIncrement = 60; break;
    case '5m': timeIncrement = 300; break;
    case '15m': timeIncrement = 900; break;
    case '1h': timeIncrement = 3600; break;
    case '4h': timeIncrement = 14400; break;
    case '1d': timeIncrement = 86400; break;
    case '1w': timeIncrement = 604800; break;
    default: timeIncrement = 3600;
  }
  
  return Array(limit).fill(0).map((_, index) => {
    const timeOffset = (limit - index) * timeIncrement;
    const timestamp = (now - timeOffset) * 1000; // 毫秒时间戳
    
    const randomFactor = 0.5 - Math.random();
    const priceChange = basePrice * volatility * randomFactor;
    
    const open = basePrice + priceChange * (index - 1) / limit;
    const close = basePrice + priceChange * index / limit;
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = 100 + Math.random() * 2000;
    
    return {
      timestamp,
      open,
      high,
      low,
      close,
      volume
    };
  });
}

/**
 * GET 处理程序
 * 获取代币K线数据
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');
  const interval = searchParams.get('interval') || '1h';
  const limit = parseInt(searchParams.get('limit') || '100', 10);

  if (!address || !chain) {
    return NextResponse.json(
      { error: 'Missing required parameters: address and chain' },
      { status: 400 }
    );
  }

  try {
    // 直接从Ave.ai API获取数据
    let klineData: KLineData[] = [];
    
    try {
      klineData = await fetchAveKlineData(address, chain, interval, limit);
      console.log(`成功从Ave.ai获取到${klineData.length}条K线数据`);
    } catch (apiError) {
      // 如果是速率限制错误，尝试使用缓存
      console.error('获取K线数据失败，使用备用数据:', apiError);
      
      // 尝试使用旧缓存数据（即使已过期）
      const cacheKey = `${address}-${chain}-${interval}-${limit}`;
      if (klineCache[cacheKey]) {
        console.log('使用过期的缓存数据');
        klineData = klineCache[cacheKey].data;
      } else {
        console.log('没有可用的缓存数据，使用模拟数据');
        klineData = generateMockKlineData(interval, limit);
      }
    }
    
    return NextResponse.json({
      success: true,
      klines: klineData
    });
  } catch (error) {
    console.error('处理K线数据错误:', error);
    
    // 确保即使发生错误也返回模拟数据
    const mockData = generateMockKlineData(interval, limit);
    
    return NextResponse.json({
      success: true,
      klines: mockData,
      error_info: error instanceof Error ? error.message : 'Failed to fetch kline data',
      is_mock_data: true
    });
  }
} 