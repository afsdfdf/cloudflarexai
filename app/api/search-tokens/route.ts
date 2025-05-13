import { NextResponse } from 'next/server';
import { AVE_API_KEY } from '../lib/constants';

// 缓存数据结构
interface CacheItem {
  data: any;
  timestamp: number;
}

// 缓存对象，用于存储搜索结果
const cache: Record<string, CacheItem> = {};

// 缓存有效期（5分钟，单位为毫秒）
const CACHE_TTL = 5 * 60 * 1000;

// 检查缓存是否有效
function isCacheValid(cacheKey: string): boolean {
  if (!cache[cacheKey]) return false;
  const now = Date.now();
  return now - cache[cacheKey].timestamp < CACHE_TTL;
}

export async function GET(request: Request) {
  console.log("Search tokens API route called:", request.url);
  
  // 获取查询参数
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('keyword');
  const chain = searchParams.get('chain');
  
  if (!keyword) {
    return NextResponse.json({ 
      success: false, 
      error: "Missing required parameter: keyword" 
    }, { status: 400 });
  }
  
  console.log(`Searching tokens with keyword: ${keyword}, chain: ${chain || 'all'}`);
  
  try {
    // 构建缓存键 - 包含关键词和可选的链参数
    const cacheKey = `search_tokens_${keyword.toLowerCase()}_${chain || 'all'}`;
    
    // 检查缓存是否有效
    if (isCacheValid(cacheKey)) {
      console.log("Returning cached search results");
      return NextResponse.json(cache[cacheKey].data, { status: 200 });
    }
    
    console.log("Fetching fresh search results from Ave.ai API");
    
    // 验证API密钥是否存在
    if (!AVE_API_KEY) {
      console.error("API key not configured");
      return NextResponse.json({ 
        success: false, 
        error: "API key not configured", 
        message: "请配置有效的API密钥" 
      }, { status: 500 });
    }
    
    // 构建API请求URL
    let apiUrl = `https://prod.ave-api.com/v2/tokens?keyword=${encodeURIComponent(keyword)}`;
    if (chain) {
      apiUrl = `${apiUrl}&chain=${encodeURIComponent(chain)}`;
    }
    
    // 发送请求到Ave.ai API
    const response = await fetch(apiUrl, {
      headers: {
        "Accept": "*/*",
        "X-API-KEY": AVE_API_KEY
      },
      cache: 'no-store',
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      // 处理不同的错误情况
      if (response.status === 403) {
        return NextResponse.json({ 
          success: false, 
          error: "API authentication failed", 
          message: "API鉴权失败，请检查API密钥" 
        }, { status: 403 });
      } else if (response.status === 429) {
        return NextResponse.json({ 
          success: false, 
          error: "API rate limit exceeded", 
          message: "API请求频率超限，请稍后再试" 
        }, { status: 429 });
      } else if (response.status === 400) {
        return NextResponse.json({ 
          success: false, 
          error: "Invalid request parameters", 
          message: "请求参数无效，请检查搜索关键词" 
        }, { status: 400 });
      }
      
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status !== 1 || !data.data) {
      console.log("No search results found or invalid API response");
      const result = {
        success: true,
        tokens: [],
        count: 0,
        message: "No tokens found matching your search",
        keyword,
        chain: chain || 'all'
      };
      
      // 更新缓存
      cache[cacheKey] = {
        data: result,
        timestamp: Date.now()
      };
      
      return NextResponse.json(result, { status: 200 });
    }
    
    // 格式化搜索结果
    const tokens = data.data.map((token: any) => {
      // 解析appendix中的额外信息
      let appendixData: any = {};
      if (token.appendix) {
        try {
          appendixData = JSON.parse(token.appendix);
        } catch (e) {
          console.error('Error parsing appendix data:', e);
        }
      }
      
      return {
        token: token.token || "",
        chain: token.chain || "",
        symbol: token.symbol || "",
        name: token.name || (appendixData?.tokenName) || token.symbol || "Unknown Token",
        logo_url: token.logo_url || "",
        current_price_usd: parseFloat(token.current_price_usd) || 0,
        price_change_24h: parseFloat(token.price_change_24h) || 0,
        tx_volume_u_24h: parseFloat(token.tx_volume_u_24h) || 0,
        holders: parseInt(token.holders) || 0,
        market_cap: token.market_cap || "0",
        risk_score: token.risk_score || 0
      };
    });
    
    // 准备返回数据
    const result = {
      success: true,
      tokens,
      count: tokens.length,
      keyword,
      chain: chain || 'all'
    };
    
    // 更新缓存
    cache[cacheKey] = {
      data: result,
      timestamp: Date.now()
    };
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error("Error in search API route handler:", error);
    
    // 提供更详细的错误信息
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    let status = 500;
    let userMessage = "无法搜索代币，请稍后再试";
    
    // 根据错误类型提供不同的状态码和消息
    if (errorMessage.includes("timeout") || errorMessage.includes("超时")) {
      status = 504;
      userMessage = "搜索请求超时，请稍后再试";
    } else if (errorMessage.includes("fetch")) {
      status = 502;
      userMessage = "无法连接到数据源，请检查网络连接";
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Failed to search tokens",
      message: userMessage,
      details: errorMessage
    }, { status });
  }
} 