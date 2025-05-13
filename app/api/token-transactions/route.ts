import { NextResponse } from 'next/server';
import { AVE_API_KEY } from '../../api/lib/constants';
import { executeWithRateLimit } from '../../api/lib/rate-limiter';

/**
 * GET 处理程序
 * 获取代币交易历史数据
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const chain = searchParams.get('chain');
  const limit = searchParams.get('limit') || '20';
  const to_time = searchParams.get('to_time') || '';
  
  console.log(`Fetching token transactions for ${chain}:${address}, limit: ${limit}`);
  
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
      'transactions',
      1500, // 交易数据优先级较低，延迟较长
      async () => {
        // 尝试各种不同的格式获取交易数据
        const results = await tryMultipleApiFormats(address, chain, limit, to_time);
        if (results) {
          return results;
        }
        
        // 如果所有尝试都失败，返回空数据
        console.log('All API formats failed, returning empty transactions array');
        return NextResponse.json({
          success: true,
          transactions: []
        });
      }
    );
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    
    // 返回空数组而不是错误响应
    return NextResponse.json({
      success: true,
      transactions: []
    });
  }
}

/**
 * 尝试多种API格式获取交易数据
 */
async function tryMultipleApiFormats(address: string, chain: string, limit: string, to_time: string) {
  // 规范化链名称 (确保小写)
  const normalizedChain = chain.toLowerCase();
  // 规范化代币地址 (确保小写)
  const normalizedAddress = address.toLowerCase();
  
  // 准备不同格式的PairID
  const pairFormats = [
    // 按照API文档的格式
    { name: 'Standard pair format', id: `${normalizedAddress}-${normalizedChain}` },
    // FourMeme格式
    { name: 'FourMeme format', id: `${normalizedAddress}_fo-${normalizedChain}` },
    // 没有链名称的格式
    { name: 'Address only format', id: normalizedAddress },
    // 反转格式
    { name: 'Reversed format', id: `${normalizedChain}-${normalizedAddress}` },
  ];
  
  // 构建参数
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit);
        if (to_time) params.append('to_time', to_time);
  const queryParams = params.toString();
        
  console.log(`Attempting multiple pair ID formats for address=${address}, chain=${chain}`);
        
  // 尝试每种格式
  for (const format of pairFormats) {
    const url = `https://prod.ave-api.com/v2/txs/${format.id}?${queryParams}`;
    console.log(`Trying ${format.name}: ${url}`);
        
    try {
        const response = await fetch(url, {
          headers: {
            'Accept': '*/*',
            'X-API-KEY': AVE_API_KEY
          },
          cache: 'no-store'
        });
        
        if (!response.ok) {
        console.log(`${format.name} failed with status ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      console.log(`${format.name} response structure:`, Object.keys(data));
      
      if (data && data.status === 1 && data.data && data.data.txs) {
        const txsData = data.data.txs;
        console.log(`${format.name} returned ${txsData.length} transactions`);
        
        if (txsData.length > 0) {
          // 记录一个成功的交易数据示例，用于调试
          console.log(`Example transaction:`, JSON.stringify(txsData[0]).substring(0, 500));
          
          // 处理每个交易记录，转换为应用需要的格式
          const formattedTxs = txsData.map((tx: any) => {
            // 根据买入/卖出操作标记is_buy
            // 判断目标代币是否是用户请求的代币
            const isBuyingToken = tx.to_token_address && 
                                 tx.to_token_address.toLowerCase() === normalizedAddress;
            
            return {
              tx_hash: tx.tx_hash,
              timestamp: tx.tx_time,
              from_addr: tx.wallet_address || tx.sender_address,
              to_addr: tx.recipient_address || "",
              is_buy: isBuyingToken,
              token_amount: isBuyingToken ? tx.to_token_amount : tx.from_token_amount,
              token_symbol: isBuyingToken ? tx.to_token_symbol : tx.from_token_symbol,
              eth_amount: isBuyingToken ? tx.from_token_amount : tx.to_token_amount,
              main_token_symbol: isBuyingToken ? tx.from_token_symbol : tx.to_token_symbol,
              usd_amount: tx.amount_usd,
              // 额外字段
              block_number: tx.block_number,
              amm: tx.amm,
              chain: tx.chain
            };
          });
          
          console.log(`Successfully processed ${formattedTxs.length} transactions using ${format.name}`);
          
          return NextResponse.json({
            success: true,
            transactions: formattedTxs
          });
        }
      }
    } catch (error) {
      console.error(`Error with ${format.name}:`, error);
    }
  }
  
  // 如果所有新格式都失败，尝试旧版API
  return await tryLegacyAPI(address, chain, limit, to_time);
}

/**
 * 尝试使用旧版API格式获取交易记录
 */
async function tryLegacyAPI(address: string, chain: string, limit: string, to_time: string) {
  try {
    console.log('Trying legacy API format...');
    
    // 尝试两种不同的旧API格式
    const legacyUrls = [
      `https://prod.ave-api.com/v2/transactions/latest?token=${address}&chain=${chain}&limit=${limit}${to_time ? `&to_time=${to_time}` : ''}`,
      `https://prod.ave-api.com/v2/tokens/txs?token=${address}&chain=${chain}&limit=${limit}${to_time ? `&to_time=${to_time}` : ''}`
    ];
    
    for (const [index, legacyUrl] of legacyUrls.entries()) {
      console.log(`Fetching from legacy API format ${index + 1}: ${legacyUrl}`);
            
      try {
        const legacyResponse = await fetch(legacyUrl, {
              headers: {
                'Accept': '*/*',
                'X-API-KEY': AVE_API_KEY
              },
              cache: 'no-store'
            });
            
        if (!legacyResponse.ok) {
          console.log(`Legacy API format ${index + 1} failed with status ${legacyResponse.status}`);
          continue;
            }
            
        const legacyData = await legacyResponse.json();
        console.log(`Legacy API format ${index + 1} response structure:`, Object.keys(legacyData));
        
        const result = await processLegacyResponse(legacyData);
        const resultData = await result.json();
        
        if (resultData.transactions && resultData.transactions.length > 0) {
          console.log(`Legacy API format ${index + 1} returned ${resultData.transactions.length} transactions`);
          return result;
        }
      } catch (error) {
        console.error(`Error with legacy API format ${index + 1}:`, error);
      }
    }
    
    console.error('All legacy API formats failed');
    return null;
  } catch (error) {
    console.error('Legacy API request failed:', error);
    return null;
  }
}

/**
 * 处理旧版API响应格式
 */
async function processLegacyResponse(data: any) {
  console.log('Processing legacy response format');
  
        if (!data) {
          console.error('Invalid API response format:', data);
          return NextResponse.json({
            success: true,
            transactions: []
          });
        }
        
        // 尝试获取transactions数据
        let transactions = [];
        if (data.status === 1 && data.data) {
    if (Array.isArray(data.data)) {
          transactions = data.data;
    } else if (data.data.txs && Array.isArray(data.data.txs)) {
      transactions = data.data.txs;
    }
  } else if (data.transactions && Array.isArray(data.transactions)) {
          transactions = data.transactions;
        } else if (Array.isArray(data)) {
          transactions = data;
        }
        
        // 确保返回的是数组
        if (!Array.isArray(transactions)) {
    console.error('API返回的数据不是数组格式:', typeof transactions);
          return NextResponse.json({
            success: true,
            transactions: []
          });
        }
        
  // 记录一个成功的交易数据示例，用于调试
  if (transactions.length > 0) {
    console.log(`Example legacy transaction:`, JSON.stringify(transactions[0]).substring(0, 500));
  }
  
  console.log(`Returning ${transactions.length} transactions from legacy format`);
        
        return NextResponse.json({
          success: true,
          transactions: transactions
        });
} 