import { TokenData, TokenDetail, HomeData } from './types';

/**
 * 转换DexScreener代币数据为标准格式
 */
export function transformDexScreenerTokens(data: any): TokenData[] {
  if (!data || !data.data || !Array.isArray(data.data)) {
    return [];
  }
  
  return data.data.map((token: any) => ({
    token: token.address || '',
    chain: token.chain || 'ethereum',
    symbol: token.symbol || 'Unknown',
    name: token.name || token.symbol || 'Unknown Token',
    logo_url: token.logo || '',
    current_price_usd: typeof token.price?.usd === 'number' ? token.price.usd : 0,
    price_change_24h: 0, // DexScreener API 不提供此数据
    tx_volume_u_24h: 0,  // DexScreener API 不提供此数据
    holders: 0           // DexScreener API 不提供此数据
  }));
}

/**
 * 转换Ave.ai代币数据为标准格式
 */
export function transformAveTokens(data: any): TokenData[] {
  if (!data || !data.data || !Array.isArray(data.data)) {
    return [];
  }
  
  return data.data.map((token: any) => {
    // 尝试从appendix解析额外信息
    let tokenName = token.symbol || '';
    let description = '';
    let website = '';
    let twitter = '';
    let telegram = '';
    
    try {
      if (token.appendix) {
        const appendixData = JSON.parse(token.appendix);
        if (appendixData.tokenName) {
          tokenName = appendixData.tokenName;
        }
        if (appendixData.description) {
          description = appendixData.description;
        }
        if (appendixData.website) {
          website = appendixData.website;
        }
        if (appendixData.twitter) {
          twitter = appendixData.twitter;
        }
        if (appendixData.telegram) {
          telegram = appendixData.telegram;
        }
      }
    } catch (e) {
      console.error('解析appendix数据时出错:', e);
    }

    return {
      token: token.token || '',
      chain: token.chain || '',
      symbol: token.symbol || '',
      name: tokenName || token.name || token.symbol || 'Unknown Token',
      logo_url: token.logo_url || '',
      current_price_usd: parseFloat(token.current_price_usd) || 0,
      price_change_24h: parseFloat(token.price_change_24h) || 0,
      tx_volume_u_24h: parseFloat(token.tx_volume_u_24h) || 0,
      holders: parseInt(token.holders) || 0,
      market_cap: token.market_cap || '0',
      fdv: token.fdv || '0',
      risk_score: token.risk_score || '0',
      risk_level: parseInt(token.risk_level) || 0,
      burn_amount: token.burn_amount || '0',
      other_amount: token.other_amount || '0',
      decimal: parseInt(token.decimal) || 18,
      total: token.total || '0',
      locked_percent: token.locked_percent || '0',
      appendix: token.appendix,
      description,
      website,
      twitter,
      telegram,
      created_at: parseInt(token.created_at) || 0,
      tx_count_24h: parseInt(token.tx_count_24h) || 0
    };
  });
}

/**
 * 转换Ave.ai代币详情为标准格式
 */
export function transformAveTokenDetail(data: any): TokenDetail | null {
  if (!data || !data.status || data.status !== 1 || !data.data || !data.data.token) {
    return null;
  }
  
  const token = data.data.token;
  const pairs = data.data.pairs || [];
  
  // 基本信息同transformAveTokens
  const tokenData = transformAveTokens({ 
    data: [token] 
  })[0];
  
  // 添加交易对数据
  return {
    ...tokenData,
    pairs: pairs.map((pair: any) => ({
      exchange: pair.exchange || '',
      pair_address: pair.pair_address || '',
      reserve0: pair.reserve0 || '0',
      reserve1: pair.reserve1 || '0',
      token0_price_eth: pair.token0_price_eth || '0',
      token0_price_usd: pair.token0_price_usd || '0',
      token1_price_eth: pair.token1_price_eth || '0',
      token1_price_usd: pair.token1_price_usd || '0',
      price_change: pair.price_change || '0',
      price_change_24h: pair.price_change_24h || '0',
      volume_u: pair.volume_u || '0',
      low_u: pair.low_u || '0',
      high_u: pair.high_u || '0'
    }))
  };
}

/**
 * 准备主页数据
 */
export function prepareHomeData(tokens: TokenData[]): HomeData {
  // 趋势代币（取前10个）
  const trending = tokens.slice(0, 10);
  
  // 按价格排序获取高价值代币
  const popular = [...tokens]
    .sort((a, b) => b.current_price_usd - a.current_price_usd)
    .slice(0, 15);
  
  // 使用最后的代币作为"新"代币
  const newTokens = tokens.slice(-20);
  
  return {
    tokens,
    count: tokens.length,
    trending,
    popular,
    new: newTokens,
    success: true,
    timestamp: Date.now(),
    source: 'js_api'
  };
} 