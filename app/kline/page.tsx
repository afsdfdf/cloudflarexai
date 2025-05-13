"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, Search, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import BottomNav from "../components/BottomNav"
import { searchTokens } from "@/app/lib/ave-api-service"
import Script from "next/script"
import SafeIframe from "../components/SafeIframe"
import EthereumProtection from "../components/EthereumProtection"

// 自定义样式，隐藏DexScreener标志
const hideDexScreenerStyles = `
  /* 隐藏iframe底部的DEX SCREENER标志 */
  iframe {
    overflow: hidden;
    margin-bottom: -35px !important;
    height: calc(100% + 35px) !important;
  }
  
  /* 确保iframe容器隐藏溢出内容 */
  .iframe-container {
    overflow: hidden;
  }
`;

export default function KLinePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(true)
  const [selectedPair, setSelectedPair] = useState("SOLANA/PAIR")
  const [pairAddress, setPairAddress] = useState("")
  const [blockchain, setBlockchain] = useState("solana")
  const [tokenLogo, setTokenLogo] = useState("/placeholder-token.png")
  const [searchValue, setSearchValue] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const searchResultsRef = useRef<HTMLDivElement>(null)

  // 解析URL参数
  useEffect(() => {
    const blockchainParam = searchParams.get("blockchain")
    const addressParam = searchParams.get("address")
    
    if (blockchainParam) {
      setBlockchain(blockchainParam)
    }
    
    if (addressParam) {
      setPairAddress(addressParam)
      // 获取代币详细信息
      const fetchTokenInfo = async () => {
        try {
          const results = await searchTokens(addressParam);
          if (results && results.length > 0) {
            const token = results.find(t => t.token === addressParam && t.chain === blockchainParam) || results[0];
            setSelectedPair(`${token.symbol}/PAIR`);
            if (token.logo_url) {
              setTokenLogo(token.logo_url);
            }
          }
        } catch (error) {
          console.error("Error fetching token info:", error);
          setSelectedPair(`${blockchainParam?.toUpperCase() || 'TOKEN'}/PAIR`);
        }
      };
      fetchTokenInfo();
    }
  }, [searchParams])

  // 处理点击外部关闭搜索结果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showResults]);

  // 搜索代币
  const handleSearch = async () => {
    if (!searchValue.trim()) return;
    
    setIsSearching(true);
    setShowResults(true);
    
    // 检查是否是以太坊地址格式
    const isEthereumAddress = /^0x[a-fA-F0-9]{40}$/.test(searchValue.trim());
    // 检查是否是Solana地址格式
    const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(searchValue.trim());
    
    try {
      // 无论是否是合约地址，都先尝试通过API搜索
      const results = await searchTokens(searchValue);
      setSearchResults(results);
      
      // 如果API搜索没有结果，但输入是合约地址格式，则尝试直接跳转
      if (results.length === 0 && (isEthereumAddress || isSolanaAddress)) {
        const chain = isSolanaAddress ? 'solana' : 'ethereum';
        const address = searchValue.trim();
        
        // 关闭结果框
        setShowResults(false);
        
        // 导航到代币K线图
        router.push(`/kline?blockchain=${chain}&address=${address}`);
      }
    } catch (error) {
      console.error("搜索错误:", error);
      setSearchResults([]);
      
      // 如果API搜索失败但是输入是合约地址格式，仍然尝试直接跳转
      if (isEthereumAddress || isSolanaAddress) {
        const chain = isSolanaAddress ? 'solana' : 'ethereum';
        const address = searchValue.trim();
        setShowResults(false);
        router.push(`/kline?blockchain=${chain}&address=${address}`);
      }
    } finally {
      setIsSearching(false);
    }
  }

  // 处理选择代币
  const handleTokenSelect = (token: any) => {
    setShowResults(false);
    
    // 更新当前视图中的代币信息
    setSelectedPair(`${token.symbol}/PAIR`);
    
    if (token.logo_url) {
      setTokenLogo(token.logo_url);
    } else {
      setTokenLogo("/placeholder-token.png");
    }
    
    // 导航到代币K线图
    router.push(`/kline?blockchain=${token.chain}&address=${token.token}`);
  }

  // 处理搜索框键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  // 图表源选项 - 优化参数以更好地显示蜡烛图
  const getChartSource = () => {
    if (pairAddress && blockchain) {
      // 如果有地址和区块链参数，使用它们
      return `https://dexscreener.com/${blockchain}/${pairAddress}?embed=1&chartLeftToolbar=1&chartTradesTable=1&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=1&chartType=candles&interval=1D&hideExchange=1&hideLogo=1&footerOff=1`
    } else {
      // 使用默认的Solana图表
      return `https://dexscreener.com/solana/73tF8uN3zMdMJBFNr213JNqavguyEnLNTYCxlARMuYg2?embed=1&chartLeftToolbar=1&chartTradesTable=1&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=1&chartType=candles&interval=1D&hideExchange=1&hideLogo=1&footerOff=1`
    }
  }

  // 格式化区块链名称
  const formatBlockchainName = (chain: string) => {
    const chainMap: Record<string, string> = {
      solana: "Solana",
      bsc: "BNB Chain",
      ethereum: "Ethereum",
      polygon: "Polygon",
      avalanche: "Avalanche",
      arbitrum: "Arbitrum",
      optimism: "Optimism",
      base: "Base",
    }
    return chainMap[chain.toLowerCase()] || chain
  }

  return (
    <div className="min-h-screen bg-[#0b101a] text-white">
      {/* 隐藏DEX SCREENER标志的自定义样式 */}
      <style jsx>{hideDexScreenerStyles}</style>
      
      {/* 保护ethereum对象 */}
      <EthereumProtection />
      
      <div className="mx-auto max-w-full pb-16">
        {/* 简化的顶部导航栏 - 只有LOGO和搜索框 */}
        <div className="flex items-center justify-between p-3 bg-[#11161f] border-b border-gray-800">
          {/* 左侧Logo区域 */}
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
              <Image 
                src={tokenLogo} 
                alt="Token Logo" 
                width={32} 
                height={32} 
                className="object-cover"
                onError={() => setTokenLogo("/placeholder-token.png")}
              />
            </div>
              <div>
              <h1 className="text-sm font-bold">K线分析</h1>
              <p className="text-xs text-gray-400">{selectedPair} • {formatBlockchainName(blockchain)}</p>
            </div>
          </div>
          
          {/* 右侧搜索框 */}
          <div className="relative">
            <div className="flex items-center">
              <Input
                type="text"
                placeholder="搜索代币地址或符号..."
                className="w-56 h-9 text-xs rounded-md bg-gray-800 border-gray-700 text-white"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowResults(true)}
              />
            <Button 
              variant="ghost" 
              size="icon" 
                className="h-9 w-9 ml-1 text-gray-400 hover:text-white" 
                onClick={handleSearch}
            >
                <Search className="w-4 h-4" />
            </Button>
          </div>
            
            {showResults && (
              <div 
                ref={searchResultsRef} 
                className="absolute right-0 mt-1 w-80 max-h-60 overflow-y-auto rounded-md shadow-lg z-50 bg-gray-900 border border-gray-800"
              >
                {isSearching ? (
                  <div className="p-3 text-center text-sm">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full inline-block mr-2"></div>
                    搜索中...
            </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((token, index) => (
                    <div
                      key={index}
                      className="p-3 flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-800 border-b border-gray-800"
                      onClick={() => handleTokenSelect(token)}
                    >
                      <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex-shrink-0">
                        {token.logo_url ? (
                          <Image
                            src={token.logo_url}
                            alt={token.symbol}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-900 flex items-center justify-center text-xs">
                            {token.symbol?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="font-medium">{token.symbol}</div>
                        <div className="text-xs text-gray-400">{token.name} • {token.chain.toUpperCase()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs">
                          ${typeof token.current_price_usd === 'string' 
                            ? parseFloat(token.current_price_usd).toFixed(6) 
                            : (token.current_price_usd || 0).toFixed(6)}
                        </div>
                        {token.price_change_24h && (
                          <div className={`text-xs ${parseFloat(String(token.price_change_24h)) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {parseFloat(String(token.price_change_24h)) >= 0 ? '+' : ''}
                            {parseFloat(String(token.price_change_24h)).toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : searchValue.trim() ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    未找到相关代币
                  </div>
                ) : null}
              </div>
            )}
          </div>
            </div>

        {/* K线图显示区域 */}
        <div className="w-full bg-[#11161f]">
          <div style={{ height: "calc(100vh - 116px)" }} className="relative">
            <div className="w-full h-full overflow-hidden iframe-container">
              <SafeIframe
                src={getChartSource()}
                title={`${selectedPair} Chart`}
                className="w-full h-full border-0"
              />
          </div>
        </div>
      </div>
      
        {/* 底部导航 */}
      <BottomNav darkMode={darkMode} />
      </div>
    </div>
  )
} 