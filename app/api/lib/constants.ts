import { join } from 'path';
import { CacheKey } from './types';

// API密钥 - 从环境变量中读取，如果未设置则使用备用密钥
export const AVE_API_KEY = process.env.AVE_API_KEY || "NMUuJmYHJB6d91bIpgLqpuLLKYVws82lj0PeDP3UEb19FoyWFJUVGLsgE95XTEmA";

// 确保API密钥已设置
if (!process.env.AVE_API_KEY) {
  console.warn('警告: AVE_API_KEY环境变量未设置，使用备用API密钥');
}

// 缓存目录路径
export const CACHE_DIR = join(process.cwd(), 'cache');

// 外部API地址
export const API_ENDPOINTS = {
  AVE_TOKENS_SEARCH: 'https://prod.ave-api.com/v2/tokens',
  AVE_TOKEN_PRICE: 'https://prod.ave-api.com/v2/tokens/price',
  AVE_RANK_TOPICS: 'https://prod.ave-api.com/v2/ranks/topics',
  AVE_RANK_BY_TOPIC: 'https://prod.ave-api.com/v2/ranks',
  AVE_TOKEN_DETAILS: 'https://prod.ave-api.com/v2/tokens',
  DEXSCREENER_TOKEN_BOOSTS: 'https://api.dexscreener.com/token-boosts/top/v1',
};

// 默认缓存时间（毫秒）
export const DEFAULT_CACHE_TTL = 3600000; // 1小时

// 各类型缓存的过期时间（毫秒）
export const CACHE_TTL_MAP: Record<CacheKey, number> = {
  token_boosts: process.env.CACHE_TTL_TOKEN_BOOSTS ? parseInt(process.env.CACHE_TTL_TOKEN_BOOSTS) : 900000,    // 15分钟
  home_data: process.env.CACHE_TTL_HOME_DATA ? parseInt(process.env.CACHE_TTL_HOME_DATA) : 1200000,      // 20分钟
  ave_data: process.env.CACHE_TTL_AVE_DATA ? parseInt(process.env.CACHE_TTL_AVE_DATA) : 1800000,       // 30分钟
  token_details: process.env.CACHE_TTL_TOKEN_DETAILS ? parseInt(process.env.CACHE_TTL_TOKEN_DETAILS) : 3600000,  // 1小时
  token_kline: process.env.CACHE_TTL_TOKEN_KLINE ? parseInt(process.env.CACHE_TTL_TOKEN_KLINE) : 60000,      // 1分钟
  search_results: process.env.CACHE_TTL_SEARCH_RESULTS ? parseInt(process.env.CACHE_TTL_SEARCH_RESULTS) : 300000,  // 5分钟
  topics: process.env.CACHE_TTL_TOPICS ? parseInt(process.env.CACHE_TTL_TOPICS) : 86400000,        // 24小时
};

// 请求重试配置
export const FETCH_RETRY_CONFIG = {
  retries: 3,
  initialBackoff: 1000, // 1秒
  maxBackoff: 10000,    // 10秒
};

// Fallback数据响应时间
export const FALLBACK_RESPONSE_TIME = 5000; // 5秒

// 日志级别
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';