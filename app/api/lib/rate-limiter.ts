/**
 * API请求速率限制工具
 * 帮助控制对外部API的请求速率，避免触发速率限制
 */

// 延迟函数
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 请求计数器接口
interface RequestCounter {
  lastRequestTime: number;
  count: number;
}

// 为不同的API端点维护请求计数器
const requestCounters: Record<string, RequestCounter> = {
  kline: { lastRequestTime: 0, count: 0 },
  tokenDetails: { lastRequestTime: 0, count: 0 },
  transactions: { lastRequestTime: 0, count: 0 },
  holders: { lastRequestTime: 0, count: 0 },
  risk: { lastRequestTime: 0, count: 0 }
};

// 端点的默认延迟配置（毫秒）
const DEFAULT_ENDPOINT_DELAYS: Record<string, number> = {
  kline: 500,        // K线数据优先级最高，延迟最短
  tokenDetails: 1000, // 代币详情第二优先
  transactions: 1500, // 交易数据第三优先
  holders: 2000,      // 持币数据第四优先
  risk: 2500          // 风险数据最后
};

/**
 * 使用速率限制执行API请求函数
 * @param endpoint 端点名称，用于识别不同的API请求类型
 * @param minDelay 最小延迟时间（毫秒）
 * @param fn 要执行的函数
 * @returns 函数的执行结果
 */
export async function executeWithRateLimit<T>(
  endpoint: keyof typeof requestCounters,
  minDelay: number = DEFAULT_ENDPOINT_DELAYS[endpoint] || 1000,
  fn: () => Promise<T>
): Promise<T> {
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
    if (error instanceof Error && (
      error.message.includes('429') || 
      error.message.toLowerCase().includes('rate limit')
    )) {
      console.log(`${endpoint} 遇到速率限制，等待2秒后重试`);
      await sleep(2000);
      counter.lastRequestTime = Date.now(); // 更新上次请求时间
      
      // 再次尝试执行
      try {
        return await fn();
      } catch (retryError) {
        console.error(`${endpoint} 重试失败:`, retryError);
        throw retryError;
      }
    }
    throw error;
  }
}

/**
 * 按优先级顺序执行多个API请求
 * @param requests 请求对象数组，每个对象包含端点名称和请求函数
 * @returns 所有请求的结果数组
 */
export async function executeRequestsInSequence<T>(
  requests: Array<{
    endpoint: keyof typeof requestCounters;
    fn: () => Promise<T>;
    minDelay?: number;
  }>
): Promise<T[]> {
  const results: T[] = [];
  
  for (const request of requests) {
    try {
      const result = await executeWithRateLimit(
        request.endpoint, 
        request.minDelay || DEFAULT_ENDPOINT_DELAYS[request.endpoint], 
        request.fn
      );
      results.push(result);
    } catch (error) {
      console.error(`Error executing ${request.endpoint} request:`, error);
      results.push(null as unknown as T);
    }
  }
  
  return results;
}

/**
 * 检查缓存并返回，如果未命中则执行函数并缓存结果
 * @param cache 缓存对象
 * @param key 缓存键
 * @param ttl 缓存生存时间（毫秒）
 * @param fn 如果缓存未命中要执行的函数
 * @returns 缓存的值或函数执行结果
 */
export async function getFromCacheOrExecute<T>(
  cache: Record<string, { data: T, timestamp: number }>,
  key: string,
  ttl: number,
  fn: () => Promise<T>
): Promise<T> {
  // 检查缓存
  const cachedItem = cache[key];
  if (cachedItem && Date.now() - cachedItem.timestamp < ttl) {
    console.log(`Cache hit for key: ${key}`);
    return cachedItem.data;
  }
  
  // 缓存未命中，执行函数
  try {
    const data = await fn();
    
    // 更新缓存
    cache[key] = {
      data,
      timestamp: Date.now()
    };
    
    return data;
  } catch (error) {
    // 如果出错但有过期缓存，仍然使用过期缓存
    if (cachedItem) {
      console.log(`Error occurred, using stale cache for: ${key}`);
      return cachedItem.data;
    }
    throw error;
  }
} 