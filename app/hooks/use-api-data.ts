'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getUserFriendlyErrorMessage } from '@/app/lib/api-utils';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  error: Error | null;
}

// 全局缓存对象
const API_CACHE: Record<string, CacheItem<any>> = {};

// 缓存时间配置（单位：毫秒）
const CACHE_CONFIG = {
  DEFAULT: 5 * 60 * 1000, // 默认5分钟
  SHORT: 60 * 1000,       // 短期缓存1分钟
  MEDIUM: 10 * 60 * 1000, // 中期缓存10分钟
  LONG: 30 * 60 * 1000,   // 长期缓存30分钟
}

interface UseApiDataOptions {
  /** 缓存时间（毫秒） */
  cacheDuration?: number;
  /** 是否在组件挂载时自动获取数据 */
  autoFetch?: boolean;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** a最大重试次数 */
  maxRetries?: number;
  /** 重试延迟（毫秒） */
  retryDelay?: number;
  /** 请求依赖项，当依赖项变化时重新获取数据 */
  dependencies?: any[];
}

/**
 * 通用API数据Hook，提供缓存、自动重试和错误处理
 * @param fetcher 数据获取函数
 * @param cacheKey 缓存键
 * @param options 选项
 * @returns 数据、加载状态、错误和刷新函数
 */
export function useApiData<T>(
  fetcher: () => Promise<T>,
  cacheKey: string,
  options: UseApiDataOptions = {}
) {
  // 提取和设置默认选项
  const { 
    cacheDuration = CACHE_CONFIG.DEFAULT,
    autoFetch = true,
    timeout = 15000,
    maxRetries = 2,
    retryDelay = 1000,
    dependencies = [],
  } = options;

  // 状态
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // 中止控制器
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // 检查缓存是否有效
  const isCacheValid = useCallback((key: string): boolean => {
    if (!API_CACHE[key]) return false;
    return (Date.now() - API_CACHE[key].timestamp) < cacheDuration;
  }, [cacheDuration]);

  // 获取数据的主函数
  const fetchData = useCallback(async (forceRefresh = false): Promise<void> => {
    // 如果请求正在进行中，中止之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 创建新的中止控制器
    abortControllerRef.current = new AbortController();
    
    try {
      // 如果不是强制刷新且缓存有效，使用缓存数据
      if (!forceRefresh && isCacheValid(cacheKey)) {
        const cachedItem = API_CACHE[cacheKey];
        setData(cachedItem.data);
        setError(cachedItem.error);
        setLastUpdated(new Date(cachedItem.timestamp));
        return;
      }
      
      // 开始加载
      setIsLoading(true);
      setError(null);
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      }, timeout);
      
      // 重试机制
      let retryCount = 0;
      let result: T | null = null;
      let lastError: Error | null = null;
      
      // 重试逻辑
      while (retryCount <= maxRetries) {
        try {
          result = await fetcher();
          lastError = null;
          break;
        } catch (err) {
          lastError = err instanceof Error 
            ? err 
            : new Error(String(err));
          
          // 如果是中止错误，不重试
          if (lastError.name === 'AbortError') {
            throw lastError;
          }
          
          retryCount++;
          
          // 如果还有重试次数，等待后重试
          if (retryCount <= maxRetries) {
            // 指数退避延迟
            const delay = retryDelay * Math.pow(1.5, retryCount - 1);
            console.log(`API请求失败，${delay}ms后重试 (${retryCount}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      
      // 清除超时
      clearTimeout(timeoutId);
      
      // 如果最后仍然失败
      if (lastError) {
        throw lastError;
      }
      
      // 更新状态和缓存
      setData(result);
      setLastUpdated(new Date());
      
      // 更新缓存
      API_CACHE[cacheKey] = {
        data: result,
        timestamp: Date.now(),
        error: null
      };
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      // 如果不是中止错误，更新错误状态
      if (error.name !== 'AbortError') {
        console.error(`API请求错误 (${cacheKey}):`, error);
        setError(error);
        
        // 缓存错误（短时间，防止频繁重试相同失败请求）
        API_CACHE[cacheKey] = {
          data: data,  // 保留旧数据
          timestamp: Date.now() - cacheDuration + 30000, // 30秒后过期
          error: error
        };
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [cacheKey, data, fetcher, isCacheValid, maxRetries, retryDelay, timeout]);

  // 强制刷新数据
  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // 当依赖项变化时获取数据
  useEffect(() => {
    // 如果设置了自动获取，或者依赖项变化且不是初次渲染
    if (autoFetch || dependencies.length > 0) {
      fetchData(false);
    }
    
    return () => {
      // 组件卸载时中止请求
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, autoFetch, ...dependencies]);

  // 清理函数：清除特定缓存
  const clearCache = useCallback(() => {
    delete API_CACHE[cacheKey];
  }, [cacheKey]);

  return {
    data,
    isLoading,
    error,
    refresh,
    lastUpdated,
    clearCache,
  };
}

// 工具函数：清除所有API缓存
export function clearAllApiCache() {
  Object.keys(API_CACHE).forEach(key => {
    delete API_CACHE[key];
  });
}

// 工具函数：设置特定缓存项
export function setApiCache<T>(key: string, data: T) {
  API_CACHE[key] = {
    data,
    timestamp: Date.now(),
    error: null
  };
}

/**
 * 分页数据获取Hook
 * @param fetchFn 获取数据的函数，接收页码和每页条数
 * @param options 配置选项
 * @returns 分页数据、加载状态、错误和分页控制函数
 */
export function usePaginatedData<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  options: {
    initialPage?: number;
    pageSize?: number;
    deps?: any[];
  } = {}
) {
  const {
    initialPage = 1,
    pageSize = 10,
    deps = [],
  } = options;

  const [page, setPage] = useState(initialPage);
  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取数据
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn(page, pageSize);
      setData(result.data);
      setTotal(result.total);
    } catch (err) {
      console.error('Error fetching paginated data:', err);
      setError(getUserFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, page, pageSize]);

  // 翻页
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // 下一页
  const nextPage = useCallback(() => {
    setPage(p => Math.min(p + 1, Math.ceil(total / pageSize)));
  }, [total, pageSize]);

  // 上一页
  const prevPage = useCallback(() => {
    setPage(p => Math.max(p - 1, 1));
  }, []);

  // 依赖项变化或组件挂载时获取数据
  useEffect(() => {
    fetchData();
  }, [page, pageSize, ...deps, fetchData]);

  return {
    data,
    isLoading,
    error,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
    goToPage,
    nextPage,
    prevPage,
    refresh: fetchData,
  };
} 