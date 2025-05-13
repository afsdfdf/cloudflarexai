"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Toaster } from "@/components/ui/toaster"
import SplashScreen from './components/splash-screen'
import BottomNav from './components/BottomNav'
import TokenRankings from './components/token-rankings'
import SearchBar from './components/SearchBar/index'
import Banner from './components/Banner'
import EthereumProtection from './components/EthereumProtection'
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import { useThemedBanners } from "./components/DefaultBanners"

export default function CryptoTracker() {
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const [showSplash, setShowSplash] = useState(false)
  const banners = useThemedBanners()

  // 初始化时总是显示开屏
  useEffect(() => {
    // 每次刷新都显示开屏
    setShowSplash(true);
    
    // 2秒后自动关闭开屏
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    
    // 清理定时器
    return () => clearTimeout(timer);
  }, []);
  
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
      
      <div className="max-w-md mx-auto pb-16">
        {/* 搜索部分 - 使用SearchBar组件 */}
        <div className="p-4 pt-6 pb-2">
          <SearchBar 
            isDark={isDark} 
            showLogo={true}
            logoSize={40}
            simplified={true}
          />
        </div>
        
        {/* 横幅轮播组件 */}
        <div className="px-4 mb-4">
          <Banner 
            banners={banners}
            interval={6000}
            showArrows={true}
            showIndicators={true}
            className={cn(
              "subtle-shadow rounded-xl overflow-hidden",
              isDark ? "shadow-md" : "shadow-sm"
            )}
          />
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
        
        {/* 代币排行榜 */}
        <div className="px-4">
          <TokenRankings darkMode={isDark} mode="homepage" />
        </div>
        
        {/* 底部导航 */}
        <BottomNav currentTab="home" isDark={isDark} />
      </div>
      
      {/* 开屏页 */}
      {showSplash && <SplashScreen onFinished={() => setShowSplash(false)} />}
      
      {/* Toast通知组件 */}
      <Toaster />
    </div>
  )
}
