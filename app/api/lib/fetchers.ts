import { API_ENDPOINTS, AVE_API_KEY, FETCH_RETRY_CONFIG } from './constants';
import { ApiError } from './errors';

// 带重试的 fetch 函数
export async function fetchWithRetry(url: string, options: RequestInit = {}, retryConfig = FETCH_RETRY_CONFIG) {
  let retries = retryConfig.retries;
  let backoff = retryConfig.initialBackoff;
  
  while (retries >= 0) {
    try {
      const headers = {
        ...options.headers,
        'Accept': '*/*',
      };
      
      // 只有在请求Ave API时添加API Key
      if (url.includes('ave-api.com')) {
        (headers as any)['X-API-KEY'] = AVE_API_KEY;
      }
      
      const response = await fetch(url, {
        ...options,
        headers,
        next: { revalidate: 0 }, // 禁用Next.js缓存
      });
      
      if (!response.ok) {
        throw new ApiError(`API请求失败，状态码 ${response.status}`, response.status);
      }
      
      return await response.json();
    } catch (error) {
      if (retries === 0) throw error;
      
      console.warn(`请求失败，正在重试 (剩余${retries}次):`, error);
      
      // 等待重试
      await new Promise(resolve => setTimeout(resolve, backoff));
      
      // 更新重试参数
      retries--;
      backoff = Math.min(backoff * 2, retryConfig.maxBackoff);
    }
  }
  
  // 不会执行到这里，因为最后一次尝试失败会抛出异常
  throw new Error('请求失败，已达到最大重试次数');
}

// 获取代币提升数据
export async function fetchTokenBoosts() {
  console.log('从DexScreener获取代币提升数据');
  return fetchWithRetry(API_ENDPOINTS.DEXSCREENER_TOKEN_BOOSTS);
}

// 获取排名主题
export async function fetchRankTopics() {
  console.log('从Ave.ai获取排名主题');
  return fetchWithRetry(API_ENDPOINTS.AVE_RANK_TOPICS);
}

// 按主题获取代币排名
export async function fetchTokensByTopic(topic: string) {
  console.log(`从Ave.ai获取主题 ${topic} 的代币列表`);
  return fetchWithRetry(`${API_ENDPOINTS.AVE_RANK_BY_TOPIC}?topic=${encodeURIComponent(topic)}`);
}

// 搜索代币
export async function searchTokens(keyword: string, chain?: string) {
  console.log(`使用关键词 "${keyword}" 搜索代币`);
  let url = `${API_ENDPOINTS.AVE_TOKENS_SEARCH}?keyword=${encodeURIComponent(keyword)}`;
  if (chain) url += `&chain=${chain}`;
  return fetchWithRetry(url);
}

// 获取代币详情
export async function fetchTokenDetails(tokenId: string) {
  console.log(`获取代币 ${tokenId} 的详情`);
  return fetchWithRetry(`${API_ENDPOINTS.AVE_TOKEN_DETAILS}/${encodeURIComponent(tokenId)}`);
}

// 获取代币价格
export async function fetchTokenPrices(tokenIds: string[]) {
  console.log(`获取 ${tokenIds.length} 个代币的价格`);
  return fetchWithRetry(API_ENDPOINTS.AVE_TOKEN_PRICE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token_ids: tokenIds }),
  });
}

// 生成测试数据 - 代币列表
export function getDummyTokens(count = 50) {
  return Array(count).fill(0).map((_, index) => ({
    token: `0xtoken${index}`,
    chain: index % 2 === 0 ? 'bsc' : 'eth',
    symbol: `TKN${index}`,
    name: `Token ${index}`,
    logo_url: `https://example.com/token${index}.png`,
    current_price_usd: Math.random() * 1000,
    price_change_24h: (Math.random() * 20) - 10,
    tx_volume_u_24h: Math.random() * 10000000,
    holders: Math.floor(Math.random() * 100000)
  }));
}

// 生成测试数据 - 主题列表
export function getDummyTopics() {
  return [
    {
      "id": "hot",
      "name_en": "Hot",
      "name_zh": "热门"
    },
    {
      "id": "new",
      "name_en": "New",
      "name_zh": "新币"
    },
    {
      "id": "meme",
      "name_en": "Meme",
      "name_zh": "Meme"
    },
    {
      "id": "defi",
      "name_en": "DeFi",
      "name_zh": "DeFi"
    },
    {
      "id": "metaverse",
      "name_en": "Metaverse",
      "name_zh": "元宇宙"
    }
  ];
} 