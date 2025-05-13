"use client"

import { useState } from 'react'
import { ExternalLink, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { formatAddress, formatAmount, formatPercent, getExplorerUrl } from "@/app/components/utils/formatting"

interface HoldersListProps {
  holders: any[]
  isLoading: boolean
  darkMode: boolean
  chain: string
  onRefresh: () => void
}

export default function HoldersList({
  holders,
  isLoading,
  darkMode,
  chain,
  onRefresh
}: HoldersListProps) {
  // 渲染持币人列表
  const renderHoldersList = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      );
    }

    if (holders.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className={cn(
            "mb-4 text-sm",
            darkMode ? "text-gray-400" : "text-gray-600"
          )}>
            点击按钮加载持币排名数据
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className={cn(
              "mx-auto flex items-center gap-1 px-4 py-2",
              darkMode ? "border-blue-800 bg-blue-900/20 text-blue-400 hover:bg-blue-800/30" 
                      : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
            )}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            获取持币排名
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {/* 表头 */}
        <div className={cn(
          "grid grid-cols-4 text-xs py-2 px-3 font-medium",
          "border-b dark:border-gray-800",
          darkMode ? "text-gray-400" : "text-gray-500"
        )}>
          <div>持币人</div>
          <div className="text-center">数量</div>
          <div className="text-center">持有比例</div>
          <div className="text-right">操作</div>
        </div>

        {/* 列表项 */}
        {holders.map((holder, index) => {
          // 取值时考虑不同的字段名可能性
          const address = holder.address || holder.wallet || '';
          const quantity = holder.quantity || holder.balance || '0';
          // 百分比兼容两种格式：0.05或5%
          const percent = holder.percent || '0';
          
          return (
            <div 
              key={address || index}
              className={cn(
                "grid grid-cols-4 text-sm py-2 px-3 items-center",
                index % 2 === 0 
                  ? darkMode ? "bg-gray-800/30" : "bg-gray-50/80" 
                  : ""
              )}
            >
              <div className="font-mono text-xs overflow-hidden text-ellipsis">
                {formatAddress(address)}
              </div>
              <div className="text-center">
                {formatAmount(quantity)}
              </div>
              <div className="text-center">
                {formatPercent(percent)}
              </div>
              <div className="text-right">
                <a 
                  href={getExplorerUrl(address, chain)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex items-center justify-center w-7 h-7 rounded-full",
                    "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  )}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium flex items-center">
          持币分布
          {isLoading && (
            <Loader2 className="ml-2 h-3.5 w-3.5 animate-spin text-blue-500" />
          )}
        </h3>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
          className="h-7 px-2 text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          刷新
        </Button>
      </div>
      
      <div className={cn(
        "rounded-md overflow-hidden border",
        darkMode ? "border-gray-800" : "border-gray-200"
      )}>
        {renderHoldersList()}
      </div>
    </div>
  );
} 