"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Moon, Sun, ChevronLeft, ChevronRight, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { OptimizedImage } from "@/app/components/ui/optimized-image"
import BottomNav from "@/app/components/BottomNav"
import TokenRankings from "@/app/components/token-rankings"
import EthereumProtection from "../components/EthereumProtection"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { searchTokens } from "@/app/lib/ave-api-service"
import Image from "next/image"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import SearchBar from "@/app/components/SearchBar"
import Link from "next/link"

export default function MarketPage() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const topicsScrollRef = useRef<HTMLDivElement>(null)

  // 修改滚动函数，只支持向右滑动
  const scrollTopics = (direction: 'right') => {
    if (!topicsScrollRef.current) return;
    
    const scrollAmount = 200; // 每次滚动的像素
    const currentScroll = topicsScrollRef.current.scrollLeft;
    
    topicsScrollRef.current.scrollTo({
      left: currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };

  // 处理选择代币
  const handleTokenSelect = (token: any) => {
    // 导航到代币详情页面
    if (token && token.chain && token.token) {
      router.push(`/token/${token.chain}/${token.token}`);
    }
  };

  // 切换主题
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-[#0b101a] text-white" : "bg-white text-foreground"
    )}>
      <EthereumProtection />
      <div className="max-w-md mx-auto">
        {/* 搜索部分 */}
        <div className="p-4 pb-2 pt-6">
          <SearchBar 
            isDark={isDark} 
            showLogo={true}
            logoSize={40}
            simplified={true}
            onResultSelect={handleTokenSelect}
            placeholder="搜索代币名称或合约地址 (例如: eth:0x123...)"
          />
        </div>

        {/* 代币主题模块 */}
        <div className="p-4 pt-0 relative">
          {/* 修改为单个滑动按钮 */}
          <div className="absolute right-4 top-1 z-20">
            <Button 
              variant="outline" 
              className={cn(
                "h-7 pl-2 pr-2 rounded-full opacity-80 flex items-center gap-1 text-xs",
                isDark 
                  ? "bg-muted border-border hover:bg-muted/80" 
                  : "bg-secondary border-border hover:bg-muted"
              )}
              onClick={() => scrollTopics('right')}
            >
              滑动 <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
          
          {/* 主题内容与排行榜 */}
          <TokenRankings darkMode={isDark} mode="market" scrollRef={topicsScrollRef} />
        </div>

        {/* 主题开关 */}
        <div className="absolute top-6 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 底部导航 */}
        <BottomNav darkMode={isDark} />
      </div>
      <Toaster />
    </div>
  )
} 