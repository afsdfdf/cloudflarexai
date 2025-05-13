import { NextResponse } from 'next/server';
import { AVE_API_KEY } from '../../api/lib/constants';

/**
 * GET 处理程序
 * 获取代币合约风险检测报告
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');
  
  console.log(`Fetching contract risk detection for ${chain}:${address}`);
  
  // 参数验证
  if (!address || !chain) {
    return NextResponse.json({
      success: false,
      error: "Missing required parameters: address and chain"
    }, { status: 400 });
  }
  
  try {
    // 构建token-id
    const tokenId = `${address}-${chain}`;
    
    // 构建API URL
    const url = `https://prod.ave-api.com/v2/contracts/${tokenId}`;
    
    console.log(`Fetching from API: ${url}`);
    
    // 调用Ave.ai API
    const response = await fetch(url, {
      headers: {
        'Accept': '*/*',
        'X-API-KEY': AVE_API_KEY
      },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      return NextResponse.json({
        success: true, // 返回成功状态但空对象
        risk: {}
      });
    }
    
    const data = await response.json();
    console.log('API Response data:', JSON.stringify(data).substring(0, 200) + '...');
    
    // 检查API响应格式
    if (!data || data.status !== 1) {
      console.error('Invalid API response format:', data);
      return NextResponse.json({
        success: true,
        risk: {}
      });
    }
    
    // 处理数据并返回
    const responseData = data.data || {};
    
    console.log('Risk data fields:', Object.keys(responseData).join(', '));
    
    return NextResponse.json({
      success: true,
      risk: responseData
    });
    
  } catch (error) {
    console.error('Error fetching contract risk:', error);
    
    // 返回空对象而不是错误响应
    return NextResponse.json({
      success: true,
      risk: {}
    });
  }
} 