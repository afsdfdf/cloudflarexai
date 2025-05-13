import { NextResponse } from "next/server";

// 处理GET请求
export async function GET() {
  try {
    // 尝试从本地Python API获取数据
    const response = await fetch("http://localhost:5000/api/home", {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Cache-Control": "no-cache",
      },
      // 设置较短的超时时间，避免长时间等待
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      throw new Error(`API返回错误: ${response.status}`);
    }

    const data = await response.json();
    
    // 处理API返回的数据
    return NextResponse.json({
      success: true,
      data: {
        popularTokens: data.popular || [],
        trendingTokens: data.trending || [],
        newTokens: data.new || []
      }
    });
  } catch (error) {
    console.error('API Error:', error);
    
    // 返回空数据结构，前端会使用模拟数据
    return NextResponse.json({
      success: true,
      data: {
        popularTokens: [],
        trendingTokens: [],
        newTokens: []
      }
    });
  }
} 