"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Wallet, ArrowLeft, ExternalLink, Copy, ChevronRight, Plus, AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import BottomNav from "../components/BottomNav"
import EthereumProtection from "../components/EthereumProtection"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export default function WalletPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { toast } = useToast()
  
  // 钱包连接状态
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<string | null>(null)
  const [balance, setBalance] = useState<string>("0")
  const [isConnecting, setIsConnecting] = useState(false)

  // 检查是否有MetaMask或其他以太坊钱包
  const [hasWallet, setHasWallet] = useState(false)

  useEffect(() => {
    // 检查浏览器是否支持以太坊
    const checkEthereumProvider = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        setHasWallet(true)
        
        // 检查是否已连接
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' })
          if (accounts && accounts.length > 0) {
            handleAccountsChanged(accounts)
          }
        } catch (error) {
          console.error("获取账户失败:", error)
        }
      }
    }
    
    checkEthereumProvider()
  }, [])

  // 处理账户变更
  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false)
      setAccount(null)
      setBalance("0")
      return
    }
    
    setIsConnected(true)
    setAccount(accounts[0])
    
    // 获取当前链ID
    try {
      const chainId = await window.ethereum?.request({ method: 'eth_chainId' })
      setChainId(chainId || null)
    } catch (error) {
      console.error("获取链ID失败:", error)
    }
    
    // 获取余额
    try {
      if (window.ethereum) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [accounts[0], 'latest']
        })
        
        // 将余额从wei转换为ETH
        const ethBalance = parseInt(balance, 16) / 1e18
        setBalance(ethBalance.toFixed(4))
      }
    } catch (error) {
      console.error("获取余额失败:", error)
    }
  }

  // 连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "未检测到以太坊钱包",
        description: "请安装MetaMask或其他以太坊钱包扩展",
        variant: "destructive",
      })
      return
    }
    
    setIsConnecting(true)
    
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      handleAccountsChanged(accounts)
      
      // 添加账户变更监听器
      window.ethereum.on('accountsChanged', handleAccountsChanged)
      
      toast({
        title: "钱包已连接",
        description: "您的钱包已成功连接",
      })
    } catch (error) {
      console.error("连接钱包失败:", error)
      toast({
        title: "连接失败",
        description: "无法连接到您的钱包",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  // 断开钱包连接
  const disconnectWallet = () => {
    setIsConnected(false)
    setAccount(null)
    setChainId(null)
    setBalance("0")
    
    // 移除监听器
    if (window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    }
    
    toast({
      title: "钱包已断开",
      description: "您的钱包已断开连接",
    })
  }

  // 复制地址到剪贴板
  const copyAddressToClipboard = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      toast({
        title: "已复制",
        description: "地址已复制到剪贴板",
      })
    }
  }

  // 格式化地址显示
  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // 获取区块链名称
  const getChainName = (chainId: string | null) => {
    if (!chainId) return "未知网络"
    
    const chains: Record<string, string> = {
      "0x1": "以太坊主网",
      "0x5": "Goerli测试网",
      "0x89": "Polygon",
      "0xa86a": "Avalanche",
      "0xa": "Optimism",
      "0xa4b1": "Arbitrum One",
      "0x38": "BNB智能链",
      "0xfa": "Fantom"
    }
    
    return chains[chainId] || "未知网络"
  }

  return (
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-[#0b101a] text-white" : "bg-white text-foreground"
    )}>
      <EthereumProtection />
      
      <div className="max-w-md mx-auto pb-16">
        {/* 页面标题 */}
        <div className={cn(
          "sticky top-0 z-10 flex items-center justify-between p-4 border-b",
          isDark ? "bg-[#0b101a] border-border/20" : "bg-white border-border/10"
        )}>
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="icon" className="rounded-full mr-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">我的钱包</h1>
          </div>
        </div>
        
        {/* 钱包卡片 */}
        <div className="p-4">
          <Card className={cn(
            "overflow-hidden",
            isDark ? "bg-card/50 border-border/30" : "bg-card border-border/50"
          )}>
            {!isConnected ? (
              <CardContent className="p-6">
                <div className="text-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full mx-auto flex items-center justify-center",
                    isDark ? "bg-primary/20" : "bg-primary/10"
                  )}>
                    <Wallet className={cn("w-8 h-8", isDark ? "text-primary/90" : "text-primary")} />
                  </div>
                  <h2 className="mt-4 text-xl font-bold">连接钱包</h2>
                  <p className={cn(
                    "mt-2 text-sm",
                    isDark ? "text-muted-foreground" : "text-muted-foreground/80"
                  )}>
                    连接您的以太坊钱包以查看您的资产
                  </p>
                  
                  {!hasWallet && (
                    <div className={cn(
                      "mt-4 p-3 rounded-lg text-sm flex items-start",
                      isDark ? "bg-yellow-500/10 text-yellow-300" : "bg-yellow-50 text-yellow-800"
                    )}>
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        未检测到钱包扩展。请安装 
                        <a 
                          href="https://metamask.io/download/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          MetaMask
                        </a> 
                        或其他以太坊钱包扩展。
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    className="mt-5 w-full"
                    disabled={isConnecting || !hasWallet}
                    onClick={connectWallet}
                  >
                    {isConnecting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        连接中...
                      </>
                    ) : "连接钱包"}
                  </Button>
                </div>
              </CardContent>
            ) : (
              <div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle>钱包信息</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-100/10"
                      onClick={disconnectWallet}
                    >
                      断开连接
                    </Button>
                  </div>
                  <CardDescription>
                    {getChainName(chainId)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          isDark ? "bg-primary/20" : "bg-primary/10"
                        )}>
                          <Wallet className={cn("w-5 h-5", isDark ? "text-primary/90" : "text-primary")} />
                        </div>
                        <div>
                          <div className="text-sm font-medium">账户地址</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            {formatAddress(account || "")}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 ml-1" 
                              onClick={copyAddressToClipboard}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <a 
                        href={`https://etherscan.io/address/${account}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                    
                    <Separator className={isDark ? "bg-border/20" : "bg-border/30"} />
                    
                    <div className="pt-2">
                      <div className="text-sm text-muted-foreground">余额</div>
                      <div className="text-3xl font-bold mt-1">{balance} ETH</div>
                    </div>
                  </div>
                </CardContent>
              </div>
            )}
          </Card>
        </div>
        
        {/* 相关功能 */}
        <div className="p-4">
          <h2 className={cn(
            "text-lg font-medium mb-2 px-1",
            isDark ? "text-foreground/90" : "text-foreground/80"
          )}>功能</h2>
          <Card className={cn(
            "overflow-hidden",
            isDark ? "bg-card/50 border-border/30" : "bg-card border-border/50"
          )}>
            <Link href="/wallet/add-token" className={cn(
              "p-3 flex items-center justify-between cursor-pointer",
              isDark ? "hover:bg-muted/30" : "hover:bg-muted/20"
            )}>
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                  isDark ? "bg-primary/20" : "bg-primary/10"
                )}>
                  <Plus className={cn("w-4 h-4", isDark ? "text-primary/90" : "text-primary")} />
                </div>
                <span>添加代币</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
            
            <Separator className={isDark ? "bg-border/20" : "bg-border/30"} />

            <Link href="/trade" className={cn(
              "p-3 flex items-center justify-between cursor-pointer",
              isDark ? "hover:bg-muted/30" : "hover:bg-muted/20"
            )}>
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                  isDark ? "bg-primary/20" : "bg-primary/10"
                )}>
                  <svg className={cn("w-4 h-4", isDark ? "text-primary/90" : "text-primary")} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 10v4h10v-4" />
                    <path d="M12 14v4" />
                    <path d="M12 6v4" />
                  </svg>
                </div>
                <span>交易</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </Card>
        </div>
      </div>
      
      {/* 底部导航 */}
      <BottomNav darkMode={isDark} />
      <Toaster />
    </div>
  )
} 