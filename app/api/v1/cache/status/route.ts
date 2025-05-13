import { NextResponse } from 'next/server';
import { getCacheStatus } from '../../../lib/cache';

/**
 * 获取缓存状态
 */
export async function GET(): Promise<NextResponse> {
  try {
    // 获取缓存状态
    const cacheStatus = await getCacheStatus();
    
    // 构建响应
    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      cache: cacheStatus
    });
  } catch (error) {
    console.error('缓存状态API错误:', error);
    
    return NextResponse.json({
      success: false,
      error: '获取缓存状态失败',
      message: error instanceof Error ? error.message : '未知错误',
      timestamp: Date.now()
    }, { status: 500 });
  }
} 