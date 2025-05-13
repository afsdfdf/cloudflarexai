import { NextResponse } from 'next/server';
import { AVE_API_KEY } from '../../api/lib/constants';
import { executeWithRateLimit } from '../../api/lib/rate-limiter';

/**
 * GET handler
 * Fetch token details from Ave.ai API
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');
  
  console.log(`[token-details] 开始获取代币详情 ${chain}:${address}`);
  
  // Validate parameters
  if (!address || !chain) {
    return NextResponse.json({
      success: false,
      error: "Missing required parameters: address and chain"
    }, { status: 400 });
  }
  
  // 尝试多种API URL格式
  const apiFormats = [
    {
      url: `https://prod.ave-api.com/v2/tokens/${address}-${chain}`,
      description: '主要API格式'
    },
    {
      url: `https://prod.ave-api.com/v2/tokens?token=${address}&chain=${chain}`,
      description: '备用URL格式1'
    },
    {
      url: `https://prod.ave-api.com/v2/token/${chain}/${address}`,
      description: '备用URL格式2'
    }
  ];
  
  let lastError = null;
  let apiResponseData = null;
  
  try {
    // 使用速率限制器执行API请求
    for (const format of apiFormats) {
      try {
        console.log(`[token-details] 尝试${format.description}: ${format.url}`);
        
        const response = await fetch(format.url, {
          headers: {
            'Accept': '*/*',
            'X-API-KEY': AVE_API_KEY
          },
          cache: 'no-store',
          // 增加超时以避免长时间等待
          signal: AbortSignal.timeout(10000)
        });
        
        if (!response.ok) {
          console.log(`[token-details] ${format.description}请求失败，状态码: ${response.status}`);
          
          // 特别处理速率限制错误
          if (response.status === 429) {
            console.log(`[token-details] 遇到速率限制，等待5秒`);
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
          
          continue; // 尝试下一个格式
        }
        
        const data = await response.json();
        console.log(`[token-details] ${format.description}响应: `, JSON.stringify(data).substring(0, 200) + '...');
        
        // 检查响应格式并处理不同的响应结构
        let tokenData = null;
        
        if (data.data && data.data.token) {
          // 新格式 - 从示例API响应中看到的结构
          tokenData = data.data.token;
          console.log(`[token-details] 使用新的响应格式 data.data.token`);
        } else if (data.data) {
          // 标准格式
          tokenData = data.data;
          console.log(`[token-details] 使用标准响应格式 data.data`);
        } else if (data.token) {
          // 另一种可能的格式
          tokenData = data.token;
          console.log(`[token-details] 使用直接响应格式 data.token`);
        } else if (data.success && data.symbol) {
          // 直接包含字段的格式
          tokenData = data;
          console.log(`[token-details] 使用包含所有字段的响应格式`);
        } else if (data.status === 1 && data.data) {
          // 带status字段的格式
          if (data.data.token) {
            tokenData = data.data.token;
            console.log(`[token-details] 使用status响应格式的token字段`);
          } else {
            tokenData = data.data;
            console.log(`[token-details] 使用status响应格式的data字段`);
          }
        } else {
          console.log(`[token-details] ${format.description}响应格式无法识别`, data);
          continue;
        }
        
        if (!tokenData) {
          console.log(`[token-details] ${format.description}未能提取有效的代币数据`);
          continue;
        }
        
        // 保存API响应数据并退出循环
        apiResponseData = tokenData;
        break;
      } catch (error) {
        console.error(`[token-details] ${format.description}请求出错:`, error);
        lastError = error;
      }
    }
    
    // 所有格式尝试后还没有数据，抛出错误
    if (!apiResponseData) {
      throw lastError || new Error('所有API格式尝试均失败');
    }
    
    // 确保必要字段存在，处理真实的API数据
    const processedData = {
      success: true,
      symbol: apiResponseData.symbol || 'N/A',
      name: apiResponseData.name || 'Unknown',
      address: apiResponseData.token || address,
      logo: apiResponseData.logo_url || '',
      chain: apiResponseData.chain || chain,
      // 按照API响应格式匹配字段
      price: parseFloat(apiResponseData.current_price_usd) || 0,
      priceChange: parseFloat(apiResponseData.price_change_1d) || 0,
      priceChange24h: parseFloat(apiResponseData.price_change_24h) || 0,
      volume24h: parseFloat(apiResponseData.tx_volume_u_24h) || 0,
      marketCap: parseFloat(apiResponseData.market_cap) || 0,
      totalSupply: parseFloat(apiResponseData.total) || 0,
      holders: parseInt(apiResponseData.holders) || 0,
      // 额外字段
      website: apiResponseData.appendix ? extractFromAppendix(apiResponseData.appendix, 'website') : '',
      twitter: apiResponseData.appendix ? extractFromAppendix(apiResponseData.appendix, 'twitter') : '',
      telegram: apiResponseData.appendix ? extractFromAppendix(apiResponseData.appendix, 'telegram') : '',
      created_at: apiResponseData.created_at || 0,
      risk_score: apiResponseData.risk_score || 0,
      risk_level: apiResponseData.risk_level || 0,
      launch_at: apiResponseData.launch_at || 0,
      buy_tx: parseFloat(apiResponseData.buy_tx) || 0,
      sell_tx: parseFloat(apiResponseData.sell_tx) || 0,
      locked_percent: parseFloat(apiResponseData.locked_percent) || 0,
      burn_amount: parseFloat(apiResponseData.burn_amount) || 0,
    };
    
    console.log(`[token-details] 成功获取代币详情，返回处理后的数据`);
    console.log(JSON.stringify(processedData).substring(0, 200) + '...');
    
    // 返回成功的响应
    return NextResponse.json(processedData);
  } catch (error) {
    console.error('[token-details] 获取代币详情失败:', error);
    
    // 返回错误响应，不返回模拟数据
    return NextResponse.json({
      success: false,
      error: '获取代币详情失败',
      message: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
}

/**
 * 从appendix JSON字符串中提取特定字段
 */
function extractFromAppendix(appendixStr: string, field: string): string {
  try {
    const appendix = JSON.parse(appendixStr);
    return appendix[field] || '';
  } catch (e) {
    console.error('解析appendix字段失败:', e);
    return '';
  }
} 