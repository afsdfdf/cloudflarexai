"use client"

import { useState } from "react"
import { Search, TrendingUp, Zap, Download, ExternalLink, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BottomNav from "../components/BottomNav"
import EthereumProtection from "../components/EthereumProtection"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

// Web3 应用数据
const web3Apps = {
  dex: [
    {
      id: "uniswap",
      name: "Uniswap",
      description: "去中心化交易协议",
      logo: "/web3/uniswap.png",
      url: "https://app.uniswap.org",
      chain: ["ethereum", "polygon", "arbitrum", "optimism"],
      color: "#FF007A",
      heat: 98,
      downloads: "1200万+"
    },
    {
      id: "pancakeswap",
      name: "PancakeSwap",
      description: "BSC上领先的DEX",
      logo: "/web3/pancakeswap.png",
      url: "https://pancakeswap.finance",
      chain: ["bsc", "ethereum", "polygon"],
      color: "#1FC7D4",
      heat: 92,
      downloads: "850万+"
    },
    {
      id: "curve",
      name: "Curve",
      description: "稳定币交易平台",
      logo: "/web3/curve.png",
      url: "https://curve.fi",
      chain: ["ethereum", "polygon", "arbitrum", "optimism"],
      color: "#A5A4CE",
      heat: 85,
      downloads: "420万+"
    },
    {
      id: "sushiswap",
      name: "SushiSwap",
      description: "多链去中心化交易所",
      logo: "/web3/sushi.png",
      url: "https://www.sushi.com",
      chain: ["ethereum", "polygon", "arbitrum", "optimism", "bsc"],
      color: "#FA52A0",
      heat: 82,
      downloads: "380万+"
    },
    {
      id: "raydium",
      name: "Raydium",
      description: "Solana自动做市商",
      logo: "/web3/raydium.png",
      url: "https://raydium.io",
      chain: ["solana"],
      color: "#2D46B9",
      heat: 79,
      downloads: "280万+"
    },
    {
      id: "traderjoe",
      name: "Trader Joe",
      description: "Avalanche上的DEX",
      logo: "/web3/traderjoe.png",
      url: "https://traderjoexyz.com",
      chain: ["avalanche", "ethereum", "arbitrum"],
      color: "#FF6B4A",
      heat: 74,
      downloads: "240万+"
    },
    {
      id: "dydx",
      name: "dYdX",
      description: "去中心化衍生品交易",
      logo: "/web3/dydx.png",
      url: "https://dydx.exchange",
      chain: ["ethereum"],
      color: "#6966FF",
      heat: 81,
      downloads: "320万+"
    },
    {
      id: "gmx",
      name: "GMX",
      description: "永续交易平台",
      logo: "/web3/gmx.png",
      url: "https://gmx.io",
      chain: ["arbitrum", "avalanche"],
      color: "#1E99A0",
      heat: 77,
      downloads: "260万+"
    }
  ],
  lending: [
    {
      id: "aave",
      name: "Aave",
      description: "去中心化借贷协议",
      logo: "/web3/aave.png",
      url: "https://app.aave.com",
      chain: ["ethereum", "polygon", "arbitrum", "optimism"],
      color: "#B6509E",
      heat: 90,
      downloads: "720万+"
    },
    {
      id: "compound",
      name: "Compound",
      description: "算法货币市场",
      logo: "/web3/compound.png",
      url: "https://app.compound.finance",
      chain: ["ethereum"],
      color: "#00D395",
      heat: 86,
      downloads: "450万+"
    },
    {
      id: "makerdao",
      name: "MakerDAO",
      description: "DAI稳定币发行平台",
      logo: "/web3/maker.png",
      url: "https://oasis.app",
      chain: ["ethereum"],
      color: "#1AAB9B",
      heat: 84,
      downloads: "410万+"
    },
    {
      id: "lido",
      name: "Lido",
      description: "流动性质押服务",
      logo: "/web3/lido.png",
      url: "https://lido.fi",
      chain: ["ethereum", "solana", "polygon"],
      color: "#00A3FF",
      heat: 89,
      downloads: "680万+"
    },
    {
      id: "alchemix",
      name: "Alchemix",
      description: "自偿还贷款",
      logo: "/web3/alchemix.png",
      url: "https://alchemix.fi",
      chain: ["ethereum"],
      color: "#2C6ACE",
      heat: 71,
      downloads: "180万+"
    },
    {
      id: "euler",
      name: "Euler",
      description: "可定制货币市场",
      logo: "/web3/euler.png",
      url: "https://euler.finance",
      chain: ["ethereum"],
      color: "#1A4DE3",
      heat: 69,
      downloads: "160万+"
    },
    {
      id: "venus",
      name: "Venus",
      description: "BSC货币市场",
      logo: "/web3/venus.png",
      url: "https://venus.io",
      chain: ["bsc"],
      color: "#FFC670",
      heat: 76,
      downloads: "250万+"
    }
  ],
  nft: [
    {
      id: "opensea",
      name: "OpenSea",
      description: "最大的NFT交易市场",
      logo: "/web3/opensea.png",
      url: "https://opensea.io",
      chain: ["ethereum", "polygon", "solana"],
      color: "#2081E2",
      heat: 94,
      downloads: "950万+"
    },
    {
      id: "blur",
      name: "Blur",
      description: "专业NFT交易平台",
      logo: "/web3/blur.png",
      url: "https://blur.io",
      chain: ["ethereum"],
      color: "#FF5E00",
      heat: 85,
      downloads: "420万+"
    },
    {
      id: "magiceden",
      name: "Magic Eden",
      description: "多链NFT市场",
      logo: "/web3/magiceden.png",
      url: "https://magiceden.io",
      chain: ["solana", "ethereum", "polygon"],
      color: "#E42575",
      heat: 83,
      downloads: "380万+"
    },
    {
      id: "foundation",
      name: "Foundation",
      description: "创意型NFT平台",
      logo: "/web3/foundation.png",
      url: "https://foundation.app",
      chain: ["ethereum"],
      color: "#000000",
      heat: 72,
      downloads: "180万+"
    },
    {
      id: "sudoswap",
      name: "Sudoswap",
      description: "NFT流动性协议",
      logo: "/web3/sudoswap.png",
      url: "https://sudoswap.xyz",
      chain: ["ethereum"],
      color: "#4A4A4A",
      heat: 68,
      downloads: "150万+"
    },
    {
      id: "element",
      name: "Element",
      description: "NFT抵押市场",
      logo: "/web3/element.png",
      url: "https://element.market",
      chain: ["ethereum", "bsc"],
      color: "#4775E7",
      heat: 70,
      downloads: "170万+"
    }
  ],
  gaming: [
    {
      id: "axieinfinity",
      name: "Axie Infinity",
      description: "NFT游戏平台",
      logo: "/web3/axie.png",
      url: "https://axieinfinity.com",
      chain: ["ronin"],
      color: "#29B6AF",
      heat: 87,
      downloads: "580万+"
    },
    {
      id: "sandbox",
      name: "The Sandbox",
      description: "元宇宙游戏平台",
      logo: "/web3/sandbox.png",
      url: "https://www.sandbox.game",
      chain: ["ethereum"],
      color: "#3065DE",
      heat: 82,
      downloads: "340万+"
    },
    {
      id: "stepn",
      name: "STEPN",
      description: "移动健身赚钱应用",
      logo: "/web3/stepn.png",
      url: "https://stepn.com",
      chain: ["solana", "bsc"],
      color: "#82E8BB",
      heat: 78,
      downloads: "280万+"
    },
    {
      id: "illuvium",
      name: "Illuvium",
      description: "开放世界RPG游戏",
      logo: "/web3/illuvium.png",
      url: "https://illuvium.io",
      chain: ["ethereum"],
      color: "#FF2D55",
      heat: 75,
      downloads: "230万+"
    },
    {
      id: "gala",
      name: "Gala Games",
      description: "区块链游戏平台",
      logo: "/web3/gala.png",
      url: "https://gala.games",
      chain: ["ethereum", "bsc"],
      color: "#FFD633",
      heat: 73,
      downloads: "220万+"
    },
    {
      id: "splinterlands",
      name: "Splinterlands",
      description: "NFT卡牌游戏",
      logo: "/web3/splinterlands.png",
      url: "https://splinterlands.com",
      chain: ["hive", "wax"],
      color: "#FA8728",
      heat: 71,
      downloads: "180万+"
    },
    {
      id: "bigtime",
      name: "Big Time",
      description: "多人动作RPG",
      logo: "/web3/bigtime.png",
      url: "https://bigtime.gg",
      chain: ["ethereum"],
      color: "#6037FF",
      heat: 76,
      downloads: "240万+"
    }
  ],
  infra: [
    {
      id: "metamask",
      name: "MetaMask",
      description: "以太坊钱包与浏览器",
      logo: "/web3/metamask.png",
      url: "https://metamask.io",
      chain: ["ethereum", "polygon", "arbitrum", "optimism"],
      color: "#F6851B",
      heat: 99,
      downloads: "3000万+"
    },
    {
      id: "phantom",
      name: "Phantom",
      description: "Solana钱包",
      logo: "/web3/phantom.png",
      url: "https://phantom.app",
      chain: ["solana", "ethereum"],
      color: "#AB9FF2",
      heat: 93,
      downloads: "800万+"
    },
    {
      id: "wallet_connect",
      name: "WalletConnect",
      description: "钱包连接协议",
      logo: "/web3/walletconnect.png",
      url: "https://walletconnect.com",
      chain: ["ethereum", "polygon", "arbitrum", "optimism", "solana"],
      color: "#3B99FC",
      heat: 91,
      downloads: "750万+"
    },
    {
      id: "chainlink",
      name: "Chainlink",
      description: "区块链预言机网络",
      logo: "/web3/chainlink.png",
      url: "https://chain.link",
      chain: ["ethereum", "polygon", "arbitrum", "optimism", "bsc"],
      color: "#375BD2",
      heat: 88,
      downloads: "600万+"
    },
    {
      id: "the_graph",
      name: "The Graph",
      description: "区块链索引协议",
      logo: "/web3/thegraph.png",
      url: "https://thegraph.com",
      chain: ["ethereum", "polygon", "arbitrum", "optimism"],
      color: "#6747ED",
      heat: 81,
      downloads: "320万+"
    }
  ]
}

// 前30个热门应用
const getTopApps = (count = 30) => {
  // 合并所有分类的应用并按热度排序
  const allApps = Object.values(web3Apps).flat();
  return allApps.sort((a, b) => b.heat - a.heat).slice(0, count);
};

// 分类对应的颜色和图标
const categoryStyles = {
  hot: { bgColor: "bg-gradient-to-r from-pink-500/20 to-rose-500/20", textColor: "text-rose-500", borderColor: "border-rose-500/30" },
  dex: { bgColor: "bg-gradient-to-r from-blue-500/20 to-indigo-500/20", textColor: "text-blue-500", borderColor: "border-blue-500/30" },
  lending: { bgColor: "bg-gradient-to-r from-purple-500/20 to-violet-500/20", textColor: "text-purple-500", borderColor: "border-purple-500/30" },
  nft: { bgColor: "bg-gradient-to-r from-amber-500/20 to-orange-500/20", textColor: "text-amber-500", borderColor: "border-amber-500/30" },
  gaming: { bgColor: "bg-gradient-to-r from-green-500/20 to-emerald-500/20", textColor: "text-green-500", borderColor: "border-green-500/30" },
  infra: { bgColor: "bg-gradient-to-r from-cyan-500/20 to-teal-500/20", textColor: "text-cyan-500", borderColor: "border-cyan-500/30" }
};

interface ChainBadgeProps {
  chain: string
}

// 链标识组件
function ChainBadge({ chain }: ChainBadgeProps) {
  const chainColors: Record<string, string> = {
    ethereum: "#627EEA",
    polygon: "#8247E5",
    arbitrum: "#28A0F0",
    optimism: "#FF0420",
    bsc: "#F0B90B",
    solana: "#14F195",
    ronin: "#1A1E25",
    avalanche: "#E84142",
    hive: "#E31337",
    wax: "#F89022"
  }

  const chainName: Record<string, string> = {
    ethereum: "ETH",
    polygon: "MATIC",
    arbitrum: "ARB",
    optimism: "OP",
    bsc: "BSC",
    solana: "SOL",
    ronin: "RON",
    avalanche: "AVAX",
    hive: "HIVE",
    wax: "WAX"
  }

  return (
    <span 
      className="inline-flex items-center px-2 py-0.5 text-xs rounded-full"
      style={{ 
        backgroundColor: `${chainColors[chain]}20`, 
        color: chainColors[chain],
        border: `1px solid ${chainColors[chain]}30`
      }}
    >
      {chainName[chain]}
    </span>
  )
}

export default function DiscoverPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const [category, setCategory] = useState("hot")
  const [searchQuery, setSearchQuery] = useState("")
  const topApps = getTopApps(30);

  // 处理应用点击
  const handleAppClick = (url: string) => {
    window.open(url, "_blank")
  }

  // 筛选应用
  const getFilteredApps = () => {
    if (category === "hot") {
      return topApps.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return web3Apps[category as keyof typeof web3Apps]?.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }

  const filteredApps = getFilteredApps();
  const currentCategoryStyle = categoryStyles[category as keyof typeof categoryStyles];

  return (
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-[#0b101a] text-white" : "bg-gray-50 text-gray-900"
    )}>
      <EthereumProtection />
      
      {/* Banner */}
      <div className="relative w-full h-32 overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600">
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-2xl font-bold text-white">发现应用</h1>
        </div>
      </div>
      
      <div className="max-w-md mx-auto pb-20 px-3">
        {/* 分类选项卡 - 水平滚动 */}
        <div className="mt-4 mb-3">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setCategory("hot")}
              className={cn(
                "flex items-center space-x-1 py-1.5 px-4 rounded-full whitespace-nowrap text-sm",
                category === "hot" 
                  ? "bg-rose-500 text-white font-medium" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300" 
                    : "bg-white text-gray-700 border border-gray-200"
              )}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>热门</span>
            </button>
            
            <button
              onClick={() => setCategory("dex")}
              className={cn(
                "py-1.5 px-4 rounded-full whitespace-nowrap text-sm",
                category === "dex" 
                  ? "bg-blue-500 text-white font-medium" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300" 
                    : "bg-white text-gray-700 border border-gray-200"
              )}
            >
              交易所
            </button>
            
            <button
              onClick={() => setCategory("lending")}
              className={cn(
                "py-1.5 px-4 rounded-full whitespace-nowrap text-sm",
                category === "lending" 
                  ? "bg-purple-500 text-white font-medium" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300" 
                    : "bg-white text-gray-700 border border-gray-200"
              )}
            >
              借贷
            </button>
            
            <button
              onClick={() => setCategory("nft")}
              className={cn(
                "py-1.5 px-4 rounded-full whitespace-nowrap text-sm",
                category === "nft" 
                  ? "bg-amber-500 text-white font-medium" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300" 
                    : "bg-white text-gray-700 border border-gray-200"
              )}
            >
              NFT
            </button>
            
            <button
              onClick={() => setCategory("gaming")}
              className={cn(
                "py-1.5 px-4 rounded-full whitespace-nowrap text-sm",
                category === "gaming" 
                  ? "bg-green-500 text-white font-medium" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300" 
                    : "bg-white text-gray-700 border border-gray-200"
              )}
            >
              游戏
            </button>
            
            <button
              onClick={() => setCategory("infra")}
              className={cn(
                "py-1.5 px-4 rounded-full whitespace-nowrap text-sm",
                category === "infra" 
                  ? "bg-cyan-500 text-white font-medium" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300" 
                    : "bg-white text-gray-700 border border-gray-200"
              )}
            >
              基础设施
            </button>
          </div>
        </div>
        
        {/* 搜索框 */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="搜索Web3应用..."
              className={cn(
                "pl-10 pr-4 py-2 rounded-full shadow-sm",
                "transition-all duration-200 border-opacity-80",
                "focus:ring-2 focus:ring-primary/30 focus:border-primary/60",
                isDark 
                  ? "bg-gray-800/90 border-gray-700/80 text-white" 
                  : "bg-white border-gray-200 text-gray-900"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 应用列表 */}
        <div className="space-y-2.5">
          {filteredApps.map((app) => (
            <div 
              key={app.id}
              className={cn(
                "flex items-center p-3 rounded-xl cursor-pointer transition-all",
                "shadow-sm hover:shadow border",
                isDark 
                  ? "bg-gray-800/70 border-gray-700/60 hover:bg-gray-800" 
                  : "bg-white border-gray-200/80 hover:border-gray-300"
              )}
              onClick={() => handleAppClick(app.url)}
            >
              <div className="relative flex-shrink-0 w-12 h-12 rounded-full overflow-hidden shadow-sm mr-3" style={{ backgroundColor: `${app.color}20` }}>
                <div className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: app.color }}>
                  {app.name.charAt(0)}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold truncate">{app.name}</h3>
                  <div className={cn(
                    "text-xs px-1.5 py-0.5 rounded-md flex items-center",
                    currentCategoryStyle.textColor,
                    currentCategoryStyle.bgColor
                  )}>
                    <Zap className="w-3 h-3 mr-0.5" />
                    <span>{app.heat}</span>
                  </div>
                </div>
                
                <p className="text-xs text-gray-400 truncate mt-0.5">{app.description}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap gap-1">
                    {app.chain.slice(0, 3).map((c) => (
                      <ChainBadge key={c} chain={c} />
                    ))}
                    {app.chain.length > 3 && (
                      <span className="inline-flex items-center px-1.5 text-xs text-gray-400">
                        +{app.chain.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className="text-xs text-gray-400 flex items-center">
                    <Download className="w-3 h-3 mr-1" />
                    {app.downloads}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 无搜索结果 */}
        {filteredApps.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-400">没有找到与 "{searchQuery}" 相关的应用</p>
          </div>
        )}
      </div>
      
      {/* 底部导航栏 */}
      <BottomNav darkMode={isDark} />
    </div>
  )
} 