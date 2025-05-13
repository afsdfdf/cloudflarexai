"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import ChartWrapper from "@/app/components/ChartWrapper"
import BottomNav from "@/app/components/BottomNav"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTokenDetails, TokenDetails, searchTokens } from "@/app/lib/ave-api-service"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import TokenDetailsCard from "@/app/components/TokenDetailsCard"
import SearchBar from "@/app/components/SearchBar"
import Link from "next/link"
import TokenTransactions from "@/app/components/TokenTransactions"

export default function TokenDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
  const [klineInterval, setKlineInterval] = useState("1h")
  const [blockchain, setBlockchain] = useState("")
  const [address, setAddress] = useState("")
  const [klineDataLoaded, setKlineDataLoaded] = useState(false)
  
  // 代币详情状态
  const [tokenDetails, setTokenDetails] = useState<TokenDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [currentTokenLogo, setCurrentTokenLogo] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("...")
  const [tokenName, setTokenName] = useState("")
  const [tokenPrice, setTokenPrice] = useState(0)
  const [priceChange, setPriceChange] = useState(0)
  
  // 副图tab状态 - 扩展更多指标选项
  const subIndicators = [
    { key: "VOL", label: "成交量" },
    { key: "MACD", label: "MACD" },
    { key: "KDJ", label: "KDJ" },
    { key: "RSI", label: "RSI" },
  ];
  const [selectedSubIndicator, setSelectedSubIndicator] = useState("VOL");
  
  // 时间周期选项 - 按照币安风格添加更多时间区间
  const timeframes = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"]

  // 时间框架对应的K线间隔
  const timeframeMap: Record<string, string> = {
    "1m": "1m",
    "5m": "5m",
    "15m": "15m",
    "1h": "1h",
    "4h": "4h",
    "1d": "1d",
    "1w": "1w"
  }

  // 时间框架改变时更新K线间隔
  useEffect(() => {
    setKlineInterval(timeframeMap[selectedTimeframe] || "1h")
  }, [selectedTimeframe])

  // 初始化区块链和地址
  useEffect(() => {
    if (params.blockchain && params.address) {
      setBlockchain(params.blockchain as string)
      setAddress(params.address as string)
      
      // 尝试立即获取基本代币信息作为快速显示
      const quickTokenLookup = async () => {
        try {
          const results = await searchTokens(params.address as string);
          if (results && results.length > 0) {
            // 找到匹配当前链的代币
            const token = results.find(t => 
              t.token.toLowerCase() === (params.address as string).toLowerCase() && 
              t.chain === params.blockchain
            ) || results[0];
            
            setTokenSymbol(token.symbol || "...");
            setTokenName(token.name || "");
            if (token.logo_url) {
              setCurrentTokenLogo(token.logo_url);
            }
          }
        } catch (error) {
          console.error("快速查询代币失败:", error);
        }
      };
      
      quickTokenLookup();
    }
  }, [params])
  
  // 通知K线数据已加载完成的函数
  const handleKlineDataLoaded = () => {
    setKlineDataLoaded(true)
  }

  // 当K线数据加载完成后，延迟1秒加载代币详情
  useEffect(() => {
    if (klineDataLoaded && blockchain && address) {
      const timer = setTimeout(() => {
        fetchTokenDetails()
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [klineDataLoaded, blockchain, address])
  
  // 加载代币详情
    const fetchTokenDetails = async () => {
      if (blockchain && address) {
        setIsLoadingDetails(true)
        try {
          const details = await getTokenDetails(address, blockchain)
          
          console.log("获取到的代币详情:", details);
          setTokenDetails(details)
          
          // 直接使用API返回的数据，确保各个字段被正确设置
          if (details) {
            // 设置代币符号和名称
            const symbol = details.tokenInfo?.symbol || "";
            const name = details.tokenInfo?.name || "";
            
            if (symbol) {
              setTokenSymbol(symbol);
            }
            if (name) {
              setTokenName(name);
            }
            
            // 设置价格和价格变化
            if (details.price !== undefined) {
              setTokenPrice(details.price);
            }
            if (details.priceChange !== undefined) {
              setPriceChange(details.priceChange);
            }
            
            // 依次尝试不同的可能字段
            const logoUrl = 
              details.tokenInfo?.logo_url || 
              (details.tokenInfo as any)?.logo || 
              '';
            
            if (logoUrl && logoUrl.trim() !== '') {
              setCurrentTokenLogo(logoUrl);
              console.log("设置代币Logo URL:", logoUrl);
            }
          }
        } catch (error) {
          console.error("获取代币详情失败:", error)
          toast({
            title: "获取详情失败",
            description: "无法加载代币详情，请稍后再试",
            variant: "destructive",
          })
        } finally {
          setIsLoadingDetails(false)
        }
      }
    }
    
  // 当地址或链改变时，重置K线数据加载状态
  useEffect(() => {
    if (blockchain && address) {
      setKlineDataLoaded(false)
    }
  }, [blockchain, address])

  // 处理代币搜索结果选择
  const handleTokenSelect = (token: any) => {
    // 导航到新的代币详情页面
    if (token && token.chain && token.token) {
      router.push(`/token/${token.chain}/${token.token}`);
    }
  };

  // 切换主题
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // 格式化价格 - 使用更多小数位显示小额代币
  const formatPrice = (price: number) => {
    if (!price) return "$0.00";
    
    // 根据价格大小调整显示的小数位数
    if (price < 0.000001) return `$${price.toExponential(4)}`;
    if (price < 0.0001) return `$${price.toFixed(8)}`;
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(5)}`;
    if (price < 1000) return `$${price.toFixed(4)}`;
    
    return `$${price.toLocaleString(undefined, {maximumFractionDigits: 2})}`;
  };

  // 格式化价格变化
  const formatPriceChange = (change: number) => {
    if (!change) return "0%";
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  return (
    <div className={cn(
      "min-h-screen",
      isDark ? "bg-[#0b101a] text-white" : "bg-white text-foreground"
    )}>
      {/* 顶部搜索栏 */}
      <div className={cn(
        "sticky top-0 z-40 border-b p-2 backdrop-blur-md",
        isDark ? "bg-card/80 border-border/20" : "bg-card/70 border-border/10"
      )}>
        <div className="flex items-center gap-2 max-w-md mx-auto px-2">
          {/* 返回按钮 */}
          <Link href="/market" className="flex-shrink-0">
            <Button 
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full w-8 h-8",
                isDark ? "text-white/70 hover:text-white" : "text-black/70 hover:text-black"
              )}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          {/* 代币信息 - 减小文字尺寸并增强数据显示 */}
          <div className="flex items-center gap-1 mr-2">
            <div className="relative w-5 h-5 rounded-full overflow-hidden bg-muted flex-shrink-0">
              {currentTokenLogo ? (
                <Image 
                  src={currentTokenLogo} 
                  alt={tokenSymbol} 
                  width={20} 
                  height={20}
                  className="object-cover"
                  onError={() => setCurrentTokenLogo("/images/token-placeholder.png")} 
                />
              ) : (
                <div className={cn(
                  "w-full h-full flex items-center justify-center text-[7px] font-medium text-white",
                  "bg-gradient-to-br from-blue-500 to-indigo-500"
                )}>
                  {tokenSymbol?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="text-[9px] leading-none">
              <div className="font-medium">{tokenSymbol}</div>
              <div className="flex items-center gap-0.5 mt-0.5">
                <span className={cn(
                  "text-[7px]",
                  priceChange >= 0 ? "text-green-500" : "text-red-500"
                )}>
                  {formatPriceChange(priceChange)}
                </span>
                <span className="text-[7px] opacity-70">
                  {formatPrice(tokenPrice)}
                </span>
              </div>
            </div>
          </div>
          
          {/* 搜索栏 */}
          <div className="w-full">
            <SearchBar 
              isDark={isDark}
              showLogo={false}
              simplified={true}
              onResultSelect={handleTokenSelect}
              placeholder="搜索其他代币..."
            />
          </div>
          
          {/* 主题开关 */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-8 h-8 flex-shrink-0"
            onClick={toggleTheme}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="max-w-md mx-auto pb-16">
        <div className="px-3 pt-2">
          {/* 代币详情卡片 */}
          <TokenDetailsCard 
            tokenDetails={tokenDetails} 
            isLoading={isLoadingDetails} 
            darkMode={isDark}
            chain={blockchain}
            address={address}
          />
          
          {/* K线图组件 */}
          <div className="flex-1 flex flex-col relative overflow-hidden rounded-lg border border-border/40 mb-2 mt-2">
            {/* 顶部时间范围选择器 - 减小尺寸 */}
            <div className={cn(
              "py-1 px-1 flex justify-center border-b",
              isDark ? "border-gray-800" : "border-gray-200"
            )}>
              <div className="flex gap-0.5 overflow-x-auto hide-scrollbar">
                {timeframes.map(time => (
                  <button 
                    key={time}
                    className={cn(
                      "px-2 py-0.5 text-xs rounded-md transition-colors",
                      selectedTimeframe === time 
                        ? isDark 
                          ? "bg-blue-600 text-white" 
                          : "bg-blue-500 text-white"
                        : isDark 
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    onClick={() => setSelectedTimeframe(time)}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 主图区域 - 增加高度显示更多数据 */}
            <div className="chart-wrapper" style={{ height: 'calc(100vw * 1.1)', maxHeight: '600px' }}>
              <ChartWrapper 
                key={`chart-${selectedSubIndicator}`}
                darkMode={isDark} 
                tokenAddress={address}
                tokenChain={blockchain}
                interval={klineInterval}
                subIndicator={selectedSubIndicator}
                onDataLoaded={handleKlineDataLoaded}
              />
            </div>
            
            {/* 副图切换按钮区域 - 调整样式以匹配图示 */}
            <div className={cn(
              "py-0.75 px-2 flex justify-center border-t",
              isDark ? "bg-gray-900 border-gray-800" : "bg-gray-50 border-gray-200"
            )}>
              <div className="flex gap-2 flex-wrap justify-center">
                {subIndicators.map(ind => (
                  <button
                    key={ind.key}
                    className={cn(
                      "px-3 py-1 rounded-md transition-colors text-xs",
                      selectedSubIndicator === ind.key
                        ? isDark
                          ? "bg-blue-600 text-white"
                          : "bg-blue-500 text-white"
                        : isDark
                          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    onClick={() => setSelectedSubIndicator(ind.key)}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        
          {/* 添加交易历史、持币排名和风险检测组件 */}
          <TokenTransactions 
            tokenAddress={address}
            chain={blockchain}
            darkMode={isDark}
          />
        </div>
      </div>
      
      {/* 底部统一导航栏 */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <BottomNav darkMode={isDark} />
      </div>
      
      <Toaster />
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* 确保图表高度正确 */
        .chart-wrapper {
          display: flex;
          flex-direction: column;
        }
        
        .chart-wrapper > div {
          flex: 1;
          min-height: 0;
        }
      `}</style>
    </div>
  )
}
