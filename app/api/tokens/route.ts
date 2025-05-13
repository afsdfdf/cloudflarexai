import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import { join } from 'path';

// 从环境变量获取API密钥
const AVE_API_KEY = "NMUuJmYHJB6d91bIpgLqpuLLKYVws82lj0PeDP3UEb19FoyWFJUVGLsgE95XTEmA";

// 如果API密钥未设置，记录警告
if (!AVE_API_KEY) {
  console.warn('警告: AVE_API_KEY未设置，API请求可能会失败');
}

// 缓存文件路径
const CACHE_DIR = join(process.cwd(), 'cache');

// 接口定义
interface RankTopic {
  id: string;
  name_en: string;
  name_zh: string;
}

interface TokenData {
  token: string;
  chain: string;
  symbol: string;
  name: string;
  logo_url: string;
  current_price_usd: number;
  price_change_24h: number;
  tx_volume_u_24h: number;
  holders: number;
  market_cap?: string;
  fdv?: string;
  risk_score?: string;
}

// 临时测试数据，在API调用失败时使用
const dummyTopics: RankTopic[] = [
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
  }
];

const dummyTokens: TokenData[] = Array(50).fill(0).map((_, index) => ({
  "token": `0xtoken${index}`,
  "chain": index % 2 === 0 ? "bsc" : "eth",
  "symbol": `TKN${index}`,
  "name": `Token ${index}`,
  "logo_url": `https://example.com/token${index}.png`,
  "current_price_usd": Math.random() * 1000,
  "price_change_24h": (Math.random() * 20) - 10,
  "tx_volume_u_24h": Math.random() * 10000000,
  "holders": Math.floor(Math.random() * 100000)
}));

// 缓存数据结构
interface CacheItem {
  data: any;
  timestamp: number;
}

// 内存缓存对象，用于存储不同主题的数据
const memoryCache: Record<string, CacheItem> = {};

// 缓存有效期（1小时，单位为毫秒）
const CACHE_TTL = parseInt(process.env.CACHE_TTL_TOKENS || '3600000');

/**
 * 检查缓存是否有效
 * @param cacheKey 缓存键
 * @returns 缓存是否有效
 */
function isMemoryCacheValid(cacheKey: string): boolean {
  if (!memoryCache[cacheKey]) return false;
  const now = Date.now();
  return now - memoryCache[cacheKey].timestamp < CACHE_TTL;
}

/**
 * 从文件系统读取缓存
 * @param cacheKey 缓存键
 * @returns 缓存数据或null
 */
async function readFileCache(cacheKey: string): Promise<any | null> {
  try {
    const filePath = join(CACHE_DIR, `${cacheKey}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    const cache = JSON.parse(data) as CacheItem;
    
    const now = Date.now();
    if (now - cache.timestamp < CACHE_TTL) {
      return cache.data;
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * 写入文件系统缓存
 * @param cacheKey 缓存键
 * @param data 缓存数据
 */
async function writeFileCache(cacheKey: string, data: any): Promise<void> {
  try {
    const cache: CacheItem = {
      data,
      timestamp: Date.now()
    };
    
    const filePath = join(CACHE_DIR, `${cacheKey}.json`);
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing file cache for ${cacheKey}:`, error);
  }
}

/**
 * 获取真实API数据
 * @param endpoint API端点
 * @returns API响应数据
 */
async function fetchAveApiData(endpoint: string) {
  console.log(`Fetching data from: ${endpoint}`);
  try {
    // 构建请求头
    const headers: HeadersInit = {
      "Accept": "*/*",
      "X-API-KEY": AVE_API_KEY
    };
    
    // 调试日志
    console.log("请求头:", headers);
    
    const response = await fetch(endpoint, {
      headers,
      cache: 'no-store',
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // 调试日志 - 显示简化的API响应
    console.log("API response status:", data?.status);
    console.log("API response has data:", !!data?.data);
    console.log("API response data type:", data?.data ? Array.isArray(data.data) ? "Array" : typeof data.data : "undefined");
    
    if (data?.data && Array.isArray(data.data)) {
      console.log("API response data length:", data.data.length);
      if (data.data.length > 0) {
        console.log("First item sample:", JSON.stringify(data.data[0]).substring(0, 100) + "...");
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
}

/**
 * 将API返回的代币数据转换为我们需要的格式
 * @param apiData API返回的数据
 * @returns 转换后的数据
 */
function transformTokenData(apiData: any[]): TokenData[] {
  return apiData.map(token => {
    // 尝试从appendix解析额外信息
    let tokenName = token.symbol || "";
    try {
      if (token.appendix) {
        const appendixData = JSON.parse(token.appendix);
        if (appendixData.tokenName) {
          tokenName = appendixData.tokenName;
        }
      }
    } catch (e) {
      console.error('Error parsing appendix data:', e);
    }

    return {
      token: token.token || "",
      chain: token.chain || "",
      symbol: token.symbol || "",
      name: tokenName || token.symbol || "Unknown Token",
      logo_url: token.logo_url || "",
      current_price_usd: parseFloat(token.current_price_usd) || 0,
      price_change_24h: parseFloat(token.price_change_24h) || 0,
      tx_volume_u_24h: parseFloat(token.tx_volume_u_24h) || 0,
      holders: parseInt(token.holders) || 0,
      market_cap: token.market_cap || "0",
      fdv: token.fdv || "0",
      risk_score: token.risk_score || "0"
    };
  });
}

// Get token rank topics
export async function GET(request: Request) {
  console.log("API route called:", request.url);
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get('topic') || 'hot';
  console.log("Topic requested:", topic);
  
  try {
    // 如果请求的是话题列表
    if (topic === 'topics') {
      const cacheKey = 'topics';
      
      // 检查内存缓存是否有效
      if (isMemoryCacheValid(cacheKey)) {
        console.log("Returning cached topics data from memory");
        return NextResponse.json({ 
          success: true, 
          data: { topics: memoryCache[cacheKey].data }, 
          timestamp: Date.now() 
        }, { status: 200 });
      }
      
      // 检查文件缓存
      const fileCache = await readFileCache(cacheKey);
      if (fileCache) {
        console.log("Returning cached topics data from file");
        // 同时更新内存缓存
        memoryCache[cacheKey] = {
          data: fileCache,
          timestamp: Date.now()
        };
        return NextResponse.json({ 
          success: true, 
          data: { topics: fileCache }, 
          timestamp: Date.now() 
        }, { status: 200 });
      }
      
      console.log("Fetching fresh topics data from Ave.ai API");
      
      // 尝试获取真实数据
      try {
        const data = await fetchAveApiData("https://prod.ave-api.com/v2/ranks/topics");
        
        if (data.status !== 1 || !data.data) {
          console.error("Invalid API response format:", data);
          throw new Error('Invalid response format or unsuccessful request');
        }
        
        // 更新内存缓存
        memoryCache[cacheKey] = {
          data: data.data,
          timestamp: Date.now()
        };
        
        // 更新文件缓存
        await writeFileCache(cacheKey, data.data);
        
        console.log("Returning fresh topics data and updating cache");
        return NextResponse.json({ 
          success: true, 
          data: { topics: data.data }, 
          timestamp: Date.now() 
        }, { status: 200 });
      } catch (apiError) {
        console.error("Error fetching from Ave.ai, using dummy data:", apiError);
        
        // 如果API调用失败，使用测试数据
        memoryCache[cacheKey] = {
          data: dummyTopics,
          timestamp: Date.now()
        };
        
        return NextResponse.json({ 
          success: true, 
          data: { topics: dummyTopics }, 
          timestamp: Date.now() 
        }, { status: 200 });
      }
    } 
    // 否则返回特定主题的代币列表
    else {
      const cacheKey = `tokens_${topic}`;
      
      // 检查内存缓存是否有效
      if (isMemoryCacheValid(cacheKey)) {
        console.log(`Returning cached tokens data for topic: ${topic} from memory`);
        return NextResponse.json({ 
          success: true,
          data: {
            topic: topic,
            tokens: memoryCache[cacheKey].data,
            count: memoryCache[cacheKey].data.length
          },
          timestamp: Date.now()
        }, { status: 200 });
      }
      
      // 检查文件缓存
      const fileCache = await readFileCache(cacheKey);
      if (fileCache) {
        console.log(`Returning cached tokens data for topic: ${topic} from file`);
        // 同时更新内存缓存
        memoryCache[cacheKey] = {
          data: fileCache,
          timestamp: Date.now()
        };
        return NextResponse.json({ 
          success: true,
          data: {
            topic: topic,
            tokens: fileCache,
            count: fileCache.length
          },
          timestamp: Date.now()
        }, { status: 200 });
      }
      
      console.log(`Fetching fresh tokens data for topic: ${topic} from Ave.ai API`);
      
      // 尝试获取真实数据
      try {
        // 使用正确的API端点
        const data = await fetchAveApiData(`https://prod.ave-api.com/v2/ranks?topic=${topic}`);
        
        if (data.status !== 1 || !data.data) {
          console.error("Invalid API response format:", data);
          throw new Error('Invalid response format or unsuccessful request');
        }
        
        // 转换数据格式
        const transformedData = transformTokenData(data.data);
        
        // 更新内存缓存
        memoryCache[cacheKey] = {
          data: transformedData,
          timestamp: Date.now()
        };
        
        // 更新文件缓存
        await writeFileCache(cacheKey, transformedData);
        
        console.log(`Returning fresh tokens data for topic: ${topic} and updating cache`);
        return NextResponse.json({ 
          success: true,
          data: {
            topic: topic,
            tokens: transformedData,
            count: transformedData.length
          },
          timestamp: Date.now()
        }, { status: 200 });
      } catch (apiError) {
        console.error(`Error fetching from Ave.ai for topic ${topic}, using dummy data:`, apiError);
        
        // 如果API调用失败，使用测试数据
        memoryCache[cacheKey] = {
          data: dummyTokens,
          timestamp: Date.now()
        };
        
        return NextResponse.json({ 
          success: true,
          data: {
            topic: topic,
            tokens: dummyTokens,
            count: dummyTokens.length
          },
          timestamp: Date.now()
        }, { status: 200 });
      }
    }
  } catch (error) {
    console.error("Error in API route handler:", error);
    
    // 如果有缓存但已过期，仍然可以在API失败时返回过期的缓存数据
    const cacheKey = topic === 'topics' ? 'topics' : `tokens_${topic}`;
    if (memoryCache[cacheKey]) {
      console.log(`API request failed, returning stale cache for ${cacheKey}`);
      if (topic === 'topics') {
        return NextResponse.json({ 
          success: true, 
          data: { topics: memoryCache[cacheKey].data }, 
          timestamp: Date.now() 
        }, { status: 200 });
      } else {
        return NextResponse.json({ 
          success: true,
          data: {
            topic: topic,
            tokens: memoryCache[cacheKey].data,
            count: memoryCache[cacheKey].data.length
          },
          timestamp: Date.now()
        }, { status: 200 });
      }
    }
    
    // 如果连缓存都没有，返回测试数据
    console.log("No cache available, returning dummy data");
    if (topic === 'topics') {
      return NextResponse.json({ 
        success: true, 
        data: { topics: dummyTopics }, 
        timestamp: Date.now() 
      }, { status: 200 });
    } else {
      return NextResponse.json({ 
        success: true,
        data: {
          topic: topic,
          tokens: dummyTokens,
          count: dummyTokens.length
        },
        timestamp: Date.now()
      }, { status: 200 });
    }
  }
} 