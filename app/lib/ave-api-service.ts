// Ave.ai API服务
import { apiRequest, buildUrl } from './api-utils';
import { TokenPrice } from '@/app/types/token';

// API密钥配置 - 生产环境从环境变量获取
const AVE_API_KEY = process.env.AVE_API_KEY || "";

export interface TokenDetails {
  tokenInfo: TokenPrice;
  price: number;
  priceChange: number;
  volume24h: number;
  marketCap: number;
  totalSupply: number;
  holders: number;
  lpAmount: number;
  lockPercent: number;
  // 直接字段（与API返回匹配）
  name?: string;
  symbol?: string;
  address?: string;
  logo?: string;
  chain?: string;
  // 扩展字段
  website?: string;
  twitter?: string;
  telegram?: string;
  created_at?: number;
  buy_tax?: number;
  sell_tax?: number;
  circulating_supply?: number;
  ath?: number;
  risk_score?: string | number;
  verified?: boolean;
}

export interface KLineData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// API响应接口定义
export interface SearchTokensResponse {
  success: boolean;
  tokens: TokenPrice[];
  count: number;
  keyword?: string;
  chain?: string;
  error?: string;
  message?: string;
}

export interface TokenDetailsResponse {
  success: boolean;
  symbol: string;
  name: string;
  address: string;
  logo: string;
  price: number;
  priceChange: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
  totalSupply: number;
  holders: number;
  lpAmount: number;
  lockPercent: number;
  chain: string;
  error?: string;
  message?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  created_at?: number;
  buy_tax?: number;
  sell_tax?: number;
  circulating_supply?: number;
  ath?: number;
  risk_score?: number;
  verified?: boolean;
}

export interface TokenKlineResponse {
  success: boolean;
  klineData: {
    time: number;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }[];
  error?: string;
  message?: string;
}

/**
 * 搜索代币
 * @param keyword 搜索关键词
 * @param chain 可选的链名称
 */
export async function searchTokens(keyword: string, chain?: string): Promise<TokenPrice[]> {
  const params: Record<string, string | undefined> = {
    keyword,
    chain
  };
  
  const url = buildUrl('/api/search-tokens', params);
  console.log('Searching tokens with URL:', url);
  
  try {
    const response = await apiRequest<SearchTokensResponse>(url, {
      timeout: 10000,
      retries: 1
    });
    
    if (!response.success) {
      throw new Error(response.error || '搜索请求失败');
    }
    
    return response.tokens || [];
  } catch (error) {
    console.error('搜索代币错误:', error);
    // 重新抛出错误，让调用者处理
    throw error;
  }
}

/**
 * 获取代币详情
 * @param address 代币地址
 * @param chain 区块链名称
 */
export async function getTokenDetails(address: string, chain: string): Promise<TokenDetails | null> {
  try {
    const params = {
      address: encodeURIComponent(address),
      chain: encodeURIComponent(chain)
    };
    
    // 使用新的API路由获取增强详情
    const url = buildUrl('/api/token-details', params);
    
    const response = await apiRequest<TokenDetailsResponse>(url, {
      timeout: 15000,
      next: { revalidate: 60 } // 缓存一分钟
    });
    
    console.log(`[getTokenDetails] 原始API响应:`, response);
    
    if (!response.success) {
      throw new Error(response.error || '获取代币详情失败');
    }
    
    // 确保我们正确处理logo字段
    const logoUrl = response.logo || '';
    console.log(`[getTokenDetails] API返回的Logo URL: ${logoUrl}`);

    // 打印重要字段信息
    console.log(`[getTokenDetails] 代币名称: ${response.name || 'N/A'}`);
    console.log(`[getTokenDetails] 代币符号: ${response.symbol || 'N/A'}`);
    console.log(`[getTokenDetails] 持有人数量: ${response.holders || 0}`);
    console.log(`[getTokenDetails] 总供应量: ${response.totalSupply || 0}`);
    
    // 创建TokenDetails对象
    const tokenDetails: TokenDetails = {
      tokenInfo: {
        symbol: response.symbol || '',
        name: response.name || '',
        token: response.address || address, // 使用token而不是address
        logo_url: logoUrl,
        current_price_usd: response.price || 0,
        price_change_24h: response.priceChange24h || 0,
        tx_volume_u_24h: response.volume24h || 0,
        holders: response.holders || 0,
        chain: response.chain || chain,
        // 兼容字段
        price: response.price || 0,
        priceChange24h: response.priceChange24h || 0,
        volume24h: response.volume24h || 0,
        marketCap: response.marketCap || 0,
      },
      // 基本指标
      price: response.price || 0,
      priceChange: response.priceChange || 0,
      volume24h: response.volume24h || 0,
      marketCap: response.marketCap || 0,
      totalSupply: response.totalSupply || 0,
      holders: response.holders || 0,
      lpAmount: response.lpAmount || 0,
      lockPercent: response.lockPercent || 0,
      // 直接字段（与API返回匹配）
      name: response.name || '',
      symbol: response.symbol || '',
      address: response.address || address,
      logo: logoUrl,
      chain: response.chain || chain,
      // 扩展字段
      website: response.website || undefined,
      twitter: response.twitter || undefined,
      telegram: response.telegram || undefined,
      created_at: response.created_at || undefined,
      buy_tax: response.buy_tax || 0,
      sell_tax: response.sell_tax || 0,
      circulating_supply: response.circulating_supply || 0,
      ath: response.ath || 0,
      risk_score: response.risk_score || undefined,
      verified: response.verified || false
    };
    
    console.log('[getTokenDetails] 处理后的代币详情:', tokenDetails);
    return tokenDetails;
    
  } catch (error) {
    console.error('[getTokenDetails] 获取代币详情错误:', error);
    throw error;
  }
}

/**
 * 获取代币K线数据
 * @param address 代币地址
 * @param chain 区块链名称
 * @param interval 时间间隔 (1m, 5m, 15m, 30m, 1h, 4h, 1d, etc.)
 * @param limit 获取的数据点数量
 */
export async function getTokenKlineData(
  address: string, 
  chain: string, 
  interval: string = '1d',
  limit: number = 100
): Promise<KLineData[]> {
  try {
    const params = {
      address: encodeURIComponent(address),
      chain: encodeURIComponent(chain),
      interval: encodeURIComponent(interval),
      limit: String(limit)
    };
    
    const url = buildUrl('/api/token-kline', params);
    
    const response = await apiRequest<TokenKlineResponse>(url, {
      timeout: 15000,
      next: { revalidate: 60 } // 缓存一分钟
    });
    
    if (!response.success) {
      throw new Error(response.error || '获取K线数据失败');
    }
    
    return response.klineData.map(item => ({
      timestamp: item.time * 1000, // Convert to milliseconds for klinecharts
      open: parseFloat(item.open),
      high: parseFloat(item.high),
      low: parseFloat(item.low),
      close: parseFloat(item.close),
      volume: parseFloat(item.volume),
    }));
  } catch (error) {
    console.error('获取K线数据错误:', error);
    return [];
  }
}

/**
 * 获取代币持有者排名前100
 * @param address 代币地址
 * @param chain 区块链名称
 */
export async function getTokenTopHolders(
  address: string, 
  chain: string
): Promise<any[]> {
  try {
    console.log(`[getTokenTopHolders] 开始请求 address=${address}, chain=${chain}`);
    
    const params = {
      address: encodeURIComponent(address),
      chain: encodeURIComponent(chain)
    };
    
    const url = buildUrl('/api/token-holders', params);
    console.log(`[getTokenTopHolders] 请求URL: ${url}`);
    
    const response = await apiRequest<any>(url, {
      timeout: 15000,
      next: { revalidate: 60 } // 缓存一分钟
    });
    
    console.log(`[getTokenTopHolders] API响应: `, JSON.stringify(response).substring(0, 200) + '...');
    
    if (!response.success) {
      console.error(`[getTokenTopHolders] API返回错误: ${response.error || '未知错误'}`);
      return [];
    }
    
    // 处理不同格式的API响应
    let holders = [];
    if (Array.isArray(response.holders)) {
      console.log(`[getTokenTopHolders] 使用holders数组字段, 长度=${response.holders.length}`);
      holders = response.holders;
    } else if (Array.isArray(response.data)) {
      console.log(`[getTokenTopHolders] 使用data数组字段, 长度=${response.data.length}`);
      holders = response.data;
    } else if (Array.isArray(response)) {
      console.log(`[getTokenTopHolders] 响应本身是数组, 长度=${response.length}`);
      holders = response;
    } else {
      console.error(`[getTokenTopHolders] 未找到期望的持币人数据字段`);
      console.log(`[getTokenTopHolders] 响应结构:`, Object.keys(response));
      return [];
    }
    
    // 验证和输出数据结构
    if (holders.length > 0) {
      console.log(`[getTokenTopHolders] 第一个持币人样本:`, JSON.stringify(holders[0]));
    }
    
    return holders;
  } catch (error) {
    console.error(`[getTokenTopHolders] 发生错误:`, error);
    return [];
  }
}

/**
 * 获取代币合约风险报告
 * @param address 代币地址
 * @param chain 区块链名称
 */
export async function getTokenRiskReport(
  address: string, 
  chain: string
): Promise<any> {
  try {
    console.log(`[getTokenRiskReport] 开始请求风险报告: address=${address}, chain=${chain}`);
    
    const params = {
      address: encodeURIComponent(address),
      chain: encodeURIComponent(chain)
    };
    
    const url = buildUrl('/api/token-risk', params);
    console.log(`[getTokenRiskReport] 请求URL: ${url}`);
    
    const response = await apiRequest<any>(url, {
      timeout: 15000,
      next: { revalidate: 3600 } // 缓存1小时
    });
    
    console.log(`[getTokenRiskReport] 原始API响应:`, JSON.stringify(response).substring(0, 200) + '...');
    
    // 处理不同格式的API响应
    let riskData;
    
    // 标准API格式: {status: 1, data: {...}}
    if (response.status === 1 && response.data) {
      console.log(`[getTokenRiskReport] 检测到标准格式API响应, 使用 data 字段`);
      riskData = response.data;
    } 
    // 旧格式: {success: true, risk: {...}}
    else if (response.success && response.risk) {
      console.log(`[getTokenRiskReport] 检测到旧格式API响应, 使用 risk 字段`);
      riskData = response.risk;
    }
    // 可能的直接风险数据对象
    else if (typeof response === 'object' && response !== null && !response.error && !response.msg) {
      console.log(`[getTokenRiskReport] 使用整个响应对象作为风险数据`);
      riskData = response;
    }
    else {
      console.error(`[getTokenRiskReport] API返回错误:`, 
        response.error || response.msg || '未能识别API返回格式');
      return null;
    }
    
    if (!riskData) {
      console.error(`[getTokenRiskReport] 无法从响应中提取风险数据`, response);
      return null;
    }
    
    console.log(`[getTokenRiskReport] 风险报告字段:`, Object.keys(riskData).slice(0, 10).join(', ') + '...');
    
    // 提取风险原因为数组格式
    if (!riskData.risk_reasons) {
      const reasons = [];
      
      // 根据风险指标生成风险原因
      if (riskData.is_honeypot === 1) reasons.push("代币为蜜罐合约，可能无法出售");
      if (riskData.hidden_owner === "1" || riskData.hidden_owner === 1) reasons.push("代币存在隐藏所有者");
      if (riskData.has_mint_method === 1) reasons.push("合约包含铸币功能，可能导致通货膨胀");
      if (riskData.has_black_method === 1) reasons.push("合约包含黑名单功能");
      if (riskData.has_white_method === 1) reasons.push("合约包含白名单功能");
      if (riskData.analysis_big_wallet === "1" || riskData.analysis_big_wallet === 1) reasons.push("存在大额持仓钱包");
      if (parseFloat(riskData.creator_percent) > 10) reasons.push(`创建者持有较高份额: ${riskData.creator_percent}%`);
      if (riskData.selfdestruct === "1" || riskData.selfdestruct === 1) reasons.push("合约包含自毁功能");
      if (riskData.big_lp_without_any_lock === 1) reasons.push("大额流动性池未锁定");
      if (riskData.transfer_pausable === "1" || riskData.transfer_pausable === 1) reasons.push("转账功能可被暂停");
      if (riskData.cannot_sell_all === "1" || riskData.cannot_sell_all === 1) reasons.push("无法全部卖出代币");
      if (riskData.can_take_back_ownership === "1" || riskData.can_take_back_ownership === 1) reasons.push("合约可重新获取所有权");
      
      // 如果风险评分高但没有具体原因
      if (riskData.risk_score > 50 && reasons.length === 0) {
        reasons.push("代币风险评分较高，建议谨慎交易");
      }
      
      if (reasons.length > 0) {
        riskData.risk_reasons = reasons;
      }
    }
    
    return riskData;
  } catch (error) {
    console.error('[getTokenRiskReport] 获取合约风险报告错误:', error);
    return null;
  }
} 