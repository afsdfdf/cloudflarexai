import { NextResponse } from 'next/server';
import { AVE_API_KEY } from '../../api/lib/constants';
import { executeWithRateLimit } from '../../api/lib/rate-limiter';

/**
 * GET 处理程序
 * 获取代币持有者前100
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');
  
  console.log(`[token-holders] 开始获取持币排名 ${chain}:${address}`);
  
  // 参数验证
  if (!address || !chain) {
    return NextResponse.json({
      success: false,
      error: "Missing required parameters: address and chain"
    }, { status: 400 });
  }
  
  try {
    // 使用速率限制器执行API请求
    return await executeWithRateLimit(
      'holders',
      2000, // 持有者数据优先级低，延迟较长
      async () => {
        // 尝试多种API URL格式
        const apiFormats = [
          {
            url: `https://prod.ave-api.com/v2/tokens/top100/${address}-${chain}`,
            description: '主要API格式'
          },
          {
            url: `https://prod.ave-api.com/v2/tokens/holders?token=${address}&chain=${chain}`,
            description: '备用URL格式1'
          },
          {
            url: `https://prod.ave-api.com/v2/token/${chain}/holders/${address}`,
            description: '备用URL格式2'
          }
        ];
        
        let lastError = null;
        let holdersData = null;
        
        // 依次尝试每种API格式
        for (const format of apiFormats) {
          try {
            console.log(`[token-holders] 尝试${format.description}: ${format.url}`);
            
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
              console.log(`[token-holders] ${format.description}请求失败，状态码: ${response.status}`);
              continue; // 尝试下一个格式
            }
            
            const data = await response.json();
            console.log(`[token-holders] ${format.description}响应: `, JSON.stringify(data).substring(0, 200) + '...');
            
            // 尝试从不同格式的响应中获取持有者数据
            if (data.status === 1 && data.data) {
              // 标准格式
              holdersData = data.data;
              console.log(`[token-holders] 从标准格式提取了${holdersData.length}个持有者`);
              break;
            } else if (data.holders) {
              // 另一种可能的格式
              holdersData = data.holders;
              console.log(`[token-holders] 从holders字段提取了${holdersData.length}个持有者`);
              break;
            } else if (Array.isArray(data)) {
              // 直接返回数组的格式
              holdersData = data;
              console.log(`[token-holders] 从数组提取了${holdersData.length}个持有者`);
              break;
            } else if (data.data && Array.isArray(data.data)) {
              // data字段包含数组
              holdersData = data.data;
              console.log(`[token-holders] 从data数组提取了${holdersData.length}个持有者`);
              break;
            } else {
              console.log(`[token-holders] ${format.description}响应格式无法识别`);
            }
          } catch (error) {
            console.error(`[token-holders] ${format.description}请求出错:`, error);
            lastError = error;
          }
        }
        
        // 如果没有找到有效数据，返回空数组
        if (!holdersData) {
          console.log('[token-holders] 所有API格式均未返回有效数据，返回空数组');
          return NextResponse.json({
            success: true,
            holders: []
          });
        }
        
        // 确保返回的是数组
        if (!Array.isArray(holdersData)) {
          console.error('[token-holders] API返回的持币数据不是数组格式:', holdersData);
          return NextResponse.json({
            success: true,
            holders: []
          });
        }
        
        // 处理持有者数据，确保包含必要字段
        const processedHolders = processHolders(holdersData);
        
        console.log(`[token-holders] 返回${processedHolders.length}个持有者数据`);
        
        return NextResponse.json({
          success: true,
          holders: processedHolders
        });
      }
    );
  } catch (error) {
    console.error('[token-holders] 获取持币排名失败:', error);
    
    // 返回空数组而不是错误响应
    return NextResponse.json({
      success: true,
      holders: []
    });
  }
}

/**
 * 处理持有者数据
 * 确保每个持有者都有必要字段
 */
function processHolders(holders: any[]): any[] {
  if (!Array.isArray(holders) || holders.length === 0) {
    return [];
  }
  
  console.log(`[token-holders] 处理${holders.length}个持有者数据`);
  
  // 计算总持有量 - 确保正确解析数字格式
  const totalQuantity = holders.reduce((sum, holder) => {
    // 处理字符串或数字格式，支持多种可能的字段名称
    const quantityRaw = holder.quantity || holder.balance || holder.amount_cur || holder.amount || 0;
    const quantity = typeof quantityRaw === 'string' 
      ? parseFloat(quantityRaw.replace(/,/g, '')) 
      : parseFloat(String(quantityRaw));
    
    return sum + (isNaN(quantity) ? 0 : quantity);
  }, 0);
  
  console.log(`[token-holders] 总持有量计算结果: ${totalQuantity}`);
  
  // 如果总量为0，无法计算百分比
  if (totalQuantity === 0) {
    console.warn('[token-holders] 总持有量为0，将返回零百分比');
    return holders.map(holder => ({
      ...holder,
      quantity: holder.quantity || holder.balance || holder.amount_cur || holder.amount || '0',
      percent: '0',
      address: holder.address || '0x0000000000000000000000000000000000000000'
    }));
  }
  
  // 为每个持有者计算百分比并确保必要字段存在
  return holders.map((holder, index) => {
    // 处理和标准化数量字段
    const quantityRaw = holder.quantity || holder.balance || holder.amount_cur || holder.amount || 0;
    const quantity = typeof quantityRaw === 'string' 
      ? parseFloat(quantityRaw.replace(/,/g, '')) 
      : parseFloat(String(quantityRaw));
    
    // 确保必要字段存在
    const normalizedHolder = {
      ...holder,
      address: holder.address || `Unknown-${index}`,
      quantity: isNaN(quantity) ? '0' : String(quantity),
      is_contract: holder.is_contract === 1 || holder.is_contract === true,
      mark: holder.mark || holder.tag || null
    };
    
    // 计算百分比
    let percentValue: number;
    
    // 如果已经有percent字段且格式正确，则使用它
    if (normalizedHolder.percent && !isNaN(parseFloat(normalizedHolder.percent))) {
      percentValue = parseFloat(normalizedHolder.percent);
    }
    // 如果有percentage字段，使用它
    else if (normalizedHolder.percentage && !isNaN(parseFloat(normalizedHolder.percentage))) {
      percentValue = parseFloat(normalizedHolder.percentage);
    }
    // 否则计算百分比
    else {
      percentValue = !isNaN(quantity) ? (quantity / totalQuantity * 100) : 0;
    }
    
    return {
      ...normalizedHolder,
      percent: percentValue.toFixed(2)
    };
  });
} 