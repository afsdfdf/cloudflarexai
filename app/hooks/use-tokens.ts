'use client';

import { useState, useEffect, useCallback } from 'react';
import { TokenRanking, TokensResponse, ApiResponse } from '@/app/types/token';
import { toast } from '@/components/ui/use-toast';
import { useApiData, clearAllApiCache } from './use-api-data';
import { searchTokens } from '@/app/lib/ave-api-service';

// 备用数据，当API请求失败时使用
const fallbackTokens: TokenRanking[] = [
  {
    "token": "0xa5957e0e2565dc93880da7be32abcbdf55788888",
    "chain": "bsc",
    "symbol": "ATM",
    "name": "ATM Token",
    "logo_url": "https://www.logofacade.com/token_icon_request/65ffb2a20a9e59af22dae8a5_1711256226.png",
    "current_price_usd": 0.000010993584854389429,
    "price_change_24h": -76.53,
    "tx_volume_u_24h": 13385053.845136339,
    "holders": 14304
  },
  {
    "token": "0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc",
    "chain": "eth",
    "symbol": "BTC",
    "name": "Bitcoin",
    "logo_url": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
    "current_price_usd": 66000.5,
    "price_change_24h": 2.3,
    "tx_volume_u_24h": 25000000,
    "holders": 1000000
  }
];

/**
 * 按主题获取代币数据的自定义Hook
 * @param topicId 主题ID
 * @returns 代币数据、加载状态、错误信息和刷新函数
 */
export function useTokensByTopic(topicId: string) {
  const [usingFallback, setUsingFallback] = useState(false);
  
  // 构建缓存键
  const cacheKey = `tokens_${topicId}`;
  
  // 获取代币数据的函数
  const fetchTokens = useCallback(async () => {
    try {
      // 构建URL，添加请求参数
      const url = `/api/tokens?topic=${topicId}`;
      
      const response = await fetch(url, { 
        next: { revalidate: 300 } // 5分钟缓存 
      });
      
      if (!response.ok) {
        throw new Error(`API请求失败，状态码: ${response.status}`);
      }
      
      const result = await response.json() as ApiResponse<TokensResponse>;
      
      if (result && result.success && result.data && Array.isArray(result.data.tokens)) {
        return result.data.tokens;
      } else {
        // 如果响应格式不正确
        console.error("API返回数据格式无效:", result);
        throw new Error("API返回数据格式无效");
      }
    } catch (error) {
      console.error("获取代币数据失败:", error);
      // 抛出错误，由useApiData处理
      throw error;
    }
  }, [topicId]);

  // 使用优化后的API数据Hook
  const { 
    data: tokensData, 
    isLoading, 
    error,
    refresh,
    lastUpdated
  } = useApiData<TokenRanking[]>(
    fetchTokens,
    cacheKey,
    {
      cacheDuration: 5 * 60 * 1000, // 5分钟缓存
      autoFetch: true,
      maxRetries: 2,
      dependencies: [topicId]
    }
  );
  
  // 安全的代币数据 - 当为null时使用空数组
  const tokens = tokensData || [];

  // 处理备用数据
  useEffect(() => {
    if (error && tokens.length === 0) {
      // 使用备用数据并显示通知
      setUsingFallback(true);
      toast({
        title: "获取数据失败",
        description: "使用备用数据作为替代",
        variant: "destructive",
      });
    } else if (!isLoading && !error && tokens.length > 0) {
      setUsingFallback(false);
    }
  }, [error, isLoading, tokens]);

  // 返回备用数据或API数据
  return {
    tokens: tokens.length > 0 ? tokens : (error ? fallbackTokens : []),
    isLoading,
    error: error ? error.message : null,
    refresh,
    lastUpdated,
    usingFallback
  };
} 