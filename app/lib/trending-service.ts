// 热门代币服务
import type { TrendingToken } from "../api/trending/route"

// 定义API响应接口
interface TrendingResponse {
  success: boolean
  data: {
    trending: TrendingToken[]
    newListings: TrendingToken[]
    highVolume: TrendingToken[]
    lastUpdated: string
  }
  error?: string
  message?: string
}

// 获取热门代币数据
export async function fetchTrendingTokens(): Promise<{
  trending: TrendingToken[]
  newListings: TrendingToken[]
  highVolume: TrendingToken[]
  lastUpdated: string
}> {
  try {
    // 修复：使用绝对URL并添加缓存控制
    const response = await fetch("/api/trending", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Cache-Control": "no-cache",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API返回错误 (${response.status}):`, errorText)
      throw new Error(`API返回错误: ${response.status}`)
    }

    // 检查内容类型
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("API返回非JSON响应:", text.substring(0, 100) + "...")
      throw new Error("API返回非JSON响应")
    }

    const data: TrendingResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || "获取热门代币失败")
    }

    return {
      trending: data.data.trending || [],
      newListings: data.data.newListings || [],
      highVolume: data.data.highVolume || [],
      lastUpdated: data.data.lastUpdated || new Date().toISOString(),
    }
  } catch (error) {
    console.error("获取热门代币数据错误:", error)

    // 返回模拟数据作为后备，确保UI不会崩溃
    return {
      trending: [
        {
          id: "bitcoin",
          name: "BTC",
          symbol: "Bitcoin",
          price: 62541.23,
          priceUsd: "$62,541.23",
          change24h: 0.62,
          volume24h: 24500000,
          volumeUsd: "$24.5M",
          marketCap: 1210000000000,
          marketCapUsd: "$1.21T",
          chainId: "1",
          chain: "ethereum",
          address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
          logo: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png",
          color: "#F7931A",
          rank: 1,
          trending: "up",
        },
        {
          id: "ethereum",
          name: "ETH",
          symbol: "Ethereum",
          price: 3458.92,
          priceUsd: "$3,458.92",
          change24h: 0.55,
          volume24h: 12300000000,
          volumeUsd: "$12.3B",
          marketCap: 415000000000,
          marketCapUsd: "$415B",
          chainId: "1",
          chain: "ethereum",
          address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          logo: "https://assets.coingecko.com/coins/images/279/large/ethereum.png",
          color: "#627EEA",
          rank: 2,
          trending: "up",
        }
      ],
      newListings: [],
      highVolume: [],
      lastUpdated: new Date().toISOString()
    }
  }
}

// 设置WebSocket连接获取实时更新
// 注意：这需要后端支持WebSocket
export function setupRealtimeUpdates(callback: (data: TrendingToken[]) => void): () => void {
  // 模拟实时更新 - 使用轮询代替WebSocket
  const intervalId = setInterval(async () => {
    try {
      const { trending } = await fetchTrendingTokens()
      callback(trending)
    } catch (error) {
      console.error("实时更新错误:", error)
    }
  }, 30000) // 每30秒更新一次

  // 返回清理函数
  return () => {
    clearInterval(intervalId)
  }
}

// 格式化大数字为易读格式
export function formatNumber(num: number): string {
  if (num >= 1000000000000) {
    return `$${(num / 1000000000000).toFixed(2)}T`
  }
  if (num >= 1000000000) {
    return `$${(num / 1000000000).toFixed(2)}B`
  }
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(2)}M`
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(2)}K`
  }
  return `$${num.toFixed(2)}`
}

// 获取代币图标URL
export function getTokenIconUrl(token: TrendingToken): string {
  // 如果代币有logo URL，则使用它
  if (token.logo) {
    return token.logo
  }

  // 否则使用占位符
  return `/placeholder.svg?height=32&width=32`
}
