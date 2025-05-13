"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ArrowLeft, Wallet, AlertCircle, Check } from "lucide-react"
import Link from "next/link"
import BottomNav from "../../components/BottomNav"
import EthereumProtection from "../../components/EthereumProtection"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

export default function AddTokenPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { toast } = useToast()
  
  // 表单状态
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenSymbol, setTokenSymbol] = useState("")
  const [tokenDecimals, setTokenDecimals] = useState("18")
  const [tokenNetwork, setTokenNetwork] = useState("eth")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // 检查钱包状态
  const [hasWallet, setHasWallet] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)
  
  // Initialize browser detection
  useEffect(() => {
    setIsBrowser(true)
  }, [])
  
  // Check for wallet availability on mount
  useEffect(() => {
    if (isBrowser) {
      setHasWallet(!!window.ethereum)
      
      // Check if wallet is connected
      const checkConnection = async () => {
        if (window.ethereum) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' })
            setIsConnected(accounts && accounts.length > 0)
          } catch (error) {
            console.error("Failed to check wallet connection:", error)
          }
        }
      }
      
      checkConnection()
    }
  }, [isBrowser])
  
  // 表单验证
  const isFormValid = () => {
    return tokenAddress && tokenSymbol && tokenDecimals && tokenNetwork
  }
  
  // 处理添加代币
  const handleAddToken = async () => {
    if (!isBrowser || !window.ethereum) {
      toast({
        title: "未检测到以太坊钱包",
        description: "请先安装并连接MetaMask或其他以太坊钱包",
        variant: "destructive",
      })
      return
    }
    
    if (!isFormValid()) {
      toast({
        title: "表单不完整",
        description: "请填写所有必填字段",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // 尝试添加代币到钱包
      const wasAdded = await window.ethereum?.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: tokenSymbol,
            decimals: parseInt(tokenDecimals),
            // 可选图标
            image: '',
          },
        } as any,
      })
      
      if (wasAdded) {
        setIsSuccess(true)
        toast({
          title: "添加成功",
          description: `${tokenSymbol} 已添加到您的钱包`,
        })
        
        // 重置表单
        setTimeout(() => {
          setTokenAddress("")
          setTokenSymbol("")
          setTokenDecimals("18")
          setIsSuccess(false)
        }, 2000)
      } else {
        toast({
          title: "添加失败",
          description: "用户拒绝添加代币",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("添加代币错误:", error)
      toast({
        title: "添加失败",
        description: "无法添加代币到钱包",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // 网络选项
  const networks = [
    { id: "eth", name: "以太坊" },
    { id: "bsc", name: "BNB智能链" },
    { id: "polygon", name: "Polygon" },
    { id: "arbitrum", name: "Arbitrum" },
    { id: "optimism", name: "Optimism" },
    { id: "avalanche", name: "Avalanche" },
  ]

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
            <Link href="/wallet">
              <Button variant="ghost" size="icon" className="rounded-full mr-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">添加代币</h1>
          </div>
        </div>
        
        {/* 添加代币表单 */}
        <div className="p-4">
          <Card className={cn(
            "overflow-hidden p-6",
            isDark ? "bg-card/50 border-border/30" : "bg-card border-border/50"
          )}>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="network">网络</Label>
                <Select 
                  value={tokenNetwork} 
                  onValueChange={setTokenNetwork}
                >
                  <SelectTrigger id="network" className={cn(
                    isDark ? "bg-muted/40 border-muted/60" : "bg-background border-input"
                  )}>
                    <SelectValue placeholder="选择网络" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map(network => (
                      <SelectItem key={network.id} value={network.id}>
                        {network.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">代币合约地址</Label>
                <Input
                  id="address"
                  placeholder="0x..."
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  className={cn(
                    isDark ? "bg-muted/40 border-muted/60" : "bg-background border-input"
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="symbol">代币符号</Label>
                <Input
                  id="symbol"
                  placeholder="例如: ETH"
                  value={tokenSymbol}
                  onChange={(e) => setTokenSymbol(e.target.value)}
                  className={cn(
                    isDark ? "bg-muted/40 border-muted/60" : "bg-background border-input"
                  )}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="decimals">小数位数</Label>
                <Input
                  id="decimals"
                  type="number"
                  placeholder="18"
                  value={tokenDecimals}
                  onChange={(e) => setTokenDecimals(e.target.value)}
                  className={cn(
                    isDark ? "bg-muted/40 border-muted/60" : "bg-background border-input"
                  )}
                />
              </div>
              
              {isBrowser && !window.ethereum && (
                <div className={cn(
                  "p-3 rounded-lg text-sm flex items-start",
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
                className="w-full"
                disabled={isSubmitting || (isBrowser && !window.ethereum) || !isFormValid()}
                onClick={handleAddToken}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    处理中...
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    添加成功
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-4 w-4" />
                    添加到钱包
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
        
        {/* 说明信息 */}
        <div className="p-4">
          <Card className={cn(
            "overflow-hidden p-6",
            isDark ? "bg-card/50 border-border/30" : "bg-card border-border/50"
          )}>
            <h3 className="text-lg font-medium mb-3">如何添加代币</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>选择代币所在的区块链网络</li>
              <li>输入正确的代币合约地址</li>
              <li>确认代币符号和小数位数</li>
              <li>点击"添加到钱包"按钮</li>
              <li>在钱包弹窗中确认添加</li>
            </ol>
          </Card>
        </div>
      </div>
      
      {/* 底部导航 */}
      <BottomNav darkMode={isDark} />
      <Toaster />
    </div>
  )
} 