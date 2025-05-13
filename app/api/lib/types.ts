/**
 * API类型定义文件
 */

// 缓存键类型
export type CacheKey = 
  | 'token_boosts'
  | 'home_data'
  | 'ave_data'
  | 'token_details'
  | 'token_kline'
  | 'search_results'
  | 'topics';

// 缓存项接口
export interface CacheItem {
  data: any;
  timestamp: number;
}

// 代币数据接口
export interface TokenData {
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
  risk_level?: number;
  burn_amount?: string;
  other_amount?: string;
  decimal?: number;
  total?: string;
  locked_percent?: string;
  appendix?: string;
}

// 排名主题接口
export interface RankTopic {
  id: string;
  name_en: string;
  name_zh: string;
}

// 代币详情接口
export interface TokenDetail extends TokenData {
  pairs?: TokenPair[];
  description?: string;
  website?: string;
  twitter?: string;
  telegram?: string;
  created_at?: number;
  tx_count_24h?: number;
}

// 代币交易对接口
export interface TokenPair {
  exchange?: string;
  pair_address?: string;
  reserve0?: string;
  reserve1?: string;
  token0_price_eth?: string;
  token0_price_usd?: string;
  token1_price_eth?: string;
  token1_price_usd?: string;
  price_change?: string;
  price_change_24h?: string;
  volume_u?: string;
  low_u?: string;
  high_u?: string;
}

// K线数据点接口
export interface KLineDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: number;
  stale?: boolean;
  stale_reason?: string;
}

// 主页数据接口
export interface HomeData {
  tokens: TokenData[];
  count: number;
  trending: TokenData[];
  popular: TokenData[];
  new: TokenData[];
  success: boolean;
  timestamp: number;
  source: string;
}

// 缓存状态接口
export interface CacheStatus {
  valid: boolean;
  age: number;
} 