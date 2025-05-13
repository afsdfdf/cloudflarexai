"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Copy, Check, ExternalLink } from "lucide-react"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TokenDetails } from "@/app/lib/ave-api-service"

interface BasicInfoProps {
  tokenDetails: TokenDetails | null
  isLoading: boolean
  darkMode: boolean
  chain: string
  address: string
}

export default function BasicInfo({ 
  tokenDetails, 
  isLoading, 
  darkMode,
  chain,
  address
}: BasicInfoProps) {
  const [copied, setCopied] = useState(false)

  // 复制地址
  const copyAddress = () => {
    if (tokenDetails?.address) {
      navigator.clipboard.writeText(tokenDetails.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // 获取区块浏览器URL
  const getExplorerUrl = () => {
    const explorers: Record<string, string> = {
      'eth': 'https://etherscan.io/token/',
      'bsc': 'https://bscscan.com/token/',
      'polygon': 'https://polygonscan.com/token/',
      'arbitrum': 'https://arbiscan.io/token/',
      'optimism': 'https://optimistic.etherscan.io/token/',
      'avalanche': 'https://snowtrace.io/token/',
      'base': 'https://basescan.org/token/',
    }
    
    return `${explorers[chain] || explorers['eth']}${address}`
  }

  // 获取代币Logo
  const getTokenLogo = () => {
    const logo = tokenDetails?.logo || tokenDetails?.tokenInfo?.logo_url
    if (!logo) return '/placeholder-token.png'
    return logo
  }

  return (
    <div className="flex flex-col gap-3 mb-4">
      {/* 代币Logo和名称 */}
      <div className="flex items-center gap-3">
        {isLoading ? (
          <Skeleton className="h-12 w-12 rounded-full" />
        ) : (
          <div className="relative h-12 w-12 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
            <Image
              src={getTokenLogo()}
              alt={tokenDetails?.symbol || "Token"}
              fill
              className="object-cover"
            />
          </div>
        )}
        
        <div className="flex-1">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold flex items-center gap-2">
                {tokenDetails?.name || "Unknown Token"}
                {tokenDetails?.verified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className="text-xs bg-green-500 text-white px-1 py-0.5 rounded">已验证</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>此代币合约已验证</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {tokenDetails?.symbol || "???"} • {chain?.toUpperCase()}
              </p>
            </>
          )}
        </div>
      </div>
      
      {/* 代币地址 */}
      <div className="flex items-center justify-between p-3 rounded-md bg-gray-50 dark:bg-gray-800/50">
        {isLoading ? (
          <Skeleton className="h-5 w-48" />
        ) : (
          <>
            <div className="text-sm font-mono text-gray-600 dark:text-gray-300 truncate flex-1 mr-2">
              {tokenDetails?.address?.substring(0, 8)}...{tokenDetails?.address?.substring(tokenDetails?.address.length - 6)}
            </div>
            <div className="flex gap-2">
              <button 
                onClick={copyAddress}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
              <a 
                href={getExplorerUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 