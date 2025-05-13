"use client"

import { Card } from "@/components/ui/card"
import { ChevronUp, ChevronDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenDetails } from "@/app/lib/ave-api-service"
import { cn } from "@/lib/utils"

interface PriceStatsProps {
  tokenDetails: TokenDetails | null
  isLoading: boolean
  darkMode: boolean
}

export default function PriceStats({ 
  tokenDetails, 
  isLoading, 
  darkMode 
}: PriceStatsProps) {
  
  // 格式化大数字显示为K, M, B, T后缀
  const formatNumber = (num: number) => {
    if (num === undefined || num === null) return "N/A"
    if (num === 0) return "0"

    const suffixes = ["", "K", "M", "B", "T"]
    const magnitude = Math.floor(Math.log10(num) / 3)
    const suffix = suffixes[Math.min(magnitude, suffixes.length - 1)]
    const scaledNum = num / Math.pow(10, magnitude * 3)
    
    return scaledNum.toFixed(1) + suffix
  }

  // 格式化价格，处理小数点
  const formatPrice = (price: number) => {
    if (price === undefined || price === null) return "N/A"
    if (price === 0) return "$0.00"
    
    if (price < 0.01) {
      return "$" + price.toFixed(8)
    }
    
    return "$" + price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // 格式化百分比变化
  const formatPercentage = (percent: number) => {
    if (percent === undefined || percent === null) return "N/A"
    return (percent > 0 ? "+" : "") + percent.toFixed(2) + "%"
  }

  return (
    <Card className={cn(
      "p-4 mb-4",
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
    )}>
      <div className="grid grid-cols-2 gap-4">
        {/* 价格信息 */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">价格</p>
          {isLoading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <p className="text-xl font-bold">
              {formatPrice(tokenDetails?.price || 0)}
            </p>
          )}
          
          {isLoading ? (
            <Skeleton className="h-5 w-16" />
          ) : (
            <div className={cn(
              "flex items-center text-sm",
              (tokenDetails?.priceChange || 0) > 0 
                ? "text-green-500" 
                : (tokenDetails?.priceChange || 0) < 0 
                  ? "text-red-500" 
                  : "text-gray-500"
            )}>
              {(tokenDetails?.priceChange || 0) > 0 ? (
                <ChevronUp className="h-4 w-4 mr-1" />
              ) : (tokenDetails?.priceChange || 0) < 0 ? (
                <ChevronDown className="h-4 w-4 mr-1" />
              ) : null}
              {formatPercentage(tokenDetails?.priceChange || 0)}
            </div>
          )}
        </div>
        
        {/* 市值信息 */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">市值</p>
          {isLoading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <p className="text-xl font-bold">
              ${formatNumber(tokenDetails?.marketCap || 0)}
            </p>
          )}
          
          {isLoading ? (
            <Skeleton className="h-5 w-32" />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              LP: ${formatNumber(tokenDetails?.lpAmount || 0)}
            </p>
          )}
        </div>
        
        {/* 交易量信息 */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">24h交易量</p>
          {isLoading ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <p className="text-xl font-bold">
              ${formatNumber(tokenDetails?.volume24h || 0)}
            </p>
          )}
        </div>
        
        {/* 持有者信息 */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500 dark:text-gray-400">持有者</p>
          {isLoading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="text-xl font-bold">
              {formatNumber(tokenDetails?.holders || 0)}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
} 