import { promises as fs } from 'fs';
import { join } from 'path';
import { 
  CACHE_DIR, 
  CACHE_TTL_MAP,
  DEFAULT_CACHE_TTL 
} from './constants';
import { CacheKey, CacheItem, CacheStatus } from './types';

// 创建缓存目录（如果不存在）
async function ensureCacheDir() {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    console.error('确保缓存目录存在时出错:', error);
  }
}

// 确保启动时缓存目录存在
ensureCacheDir();

// 内存缓存
const memoryCache: Record<string, CacheItem> = {};

// 获取缓存有效期
export function getCacheTTL(cacheKey: CacheKey): number {
  return CACHE_TTL_MAP[cacheKey] || DEFAULT_CACHE_TTL;
}

// 检查缓存是否有效
export function isMemoryCacheValid(cacheKey: string): boolean {
  if (!memoryCache[cacheKey]) return false;
  const now = Date.now();
  return now - memoryCache[cacheKey].timestamp < getCacheTTL(cacheKey as CacheKey);
}

// 从内存获取缓存
export function getMemoryCache(cacheKey: string): any | null {
  if (isMemoryCacheValid(cacheKey)) {
    return memoryCache[cacheKey].data;
  }
  return null;
}

// 设置内存缓存
export function setMemoryCache(cacheKey: string, data: any): void {
  memoryCache[cacheKey] = {
    data,
    timestamp: Date.now()
  };
}

// 从文件系统读取缓存
export async function readFileCache(cacheKey: string): Promise<any | null> {
  try {
    const filePath = join(CACHE_DIR, `${cacheKey}.json`);
    const data = await fs.readFile(filePath, 'utf-8');
    const cache = JSON.parse(data) as CacheItem;
    
    const now = Date.now();
    if (now - cache.timestamp < getCacheTTL(cacheKey as CacheKey)) {
      return cache.data;
    }
    
    return null;
  } catch (error) {
    console.error(`读取文件缓存 ${cacheKey} 时出错:`, error);
    return null;
  }
}

// 写入文件系统缓存
export async function writeFileCache(cacheKey: string, data: any): Promise<void> {
  try {
    const cache: CacheItem = {
      data,
      timestamp: Date.now()
    };
    
    const filePath = join(CACHE_DIR, `${cacheKey}.json`);
    await ensureCacheDir();
    await fs.writeFile(filePath, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (error) {
    console.error(`写入文件缓存 ${cacheKey} 时出错:`, error);
  }
}

// 获取缓存（先检查内存，再检查文件）
export async function getCache(cacheKey: string): Promise<any | null> {
  // 先检查内存缓存
  const memCache = getMemoryCache(cacheKey);
  if (memCache) return memCache;
  
  // 再检查文件缓存
  const fileCache = await readFileCache(cacheKey);
  if (fileCache) {
    // 更新内存缓存
    setMemoryCache(cacheKey, fileCache);
    return fileCache;
  }
  
  return null;
}

// 设置缓存（同时更新内存和文件）
export async function setCache(cacheKey: string, data: any): Promise<void> {
  setMemoryCache(cacheKey, data);
  await writeFileCache(cacheKey, data);
}

// 全部缓存状态
export async function getCacheStatus(): Promise<Record<string, CacheStatus>> {
  const now = Date.now();
  const status: Record<string, CacheStatus> = {};
  
  for (const key in CACHE_TTL_MAP) {
    const cacheKey = key as CacheKey;
    const cache = memoryCache[cacheKey];
    
    if (cache) {
      const age = now - cache.timestamp;
      status[cacheKey] = {
        valid: age < getCacheTTL(cacheKey),
        age: Math.floor(age / 1000) // 转换为秒
      };
    } else {
      status[cacheKey] = {
        valid: false,
        age: -1
      };
    }
  }
  
  return status;
}

// 清除缓存
export function clearMemoryCache(cacheKey?: string): void {
  if (cacheKey) {
    delete memoryCache[cacheKey];
  } else {
    Object.keys(memoryCache).forEach(key => {
      delete memoryCache[key];
    });
  }
}

// 后台更新缓存的函数
export async function updateCacheInBackground(cacheKey: CacheKey, updateFunction: () => Promise<any>): Promise<boolean> {
  try {
    console.log(`正在后台更新 ${cacheKey} 缓存`);
    const data = await updateFunction();
    await setCache(cacheKey, data);
    console.log(`${cacheKey} 缓存更新成功`);
    return true;
  } catch (error) {
    console.error(`更新 ${cacheKey} 缓存时出错:`, error);
    return false;
  }
} 