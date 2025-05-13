"use client"

import { Card } from "@/components/ui/card"
import Image from "next/image"

interface TokenData {
  name: string
  symbol: string
  address: string
  logo?: string
  price?: number
  chain?: string
}

interface TokenBoostCardProps {
  token: TokenData
  darkMode: boolean
  onClick: () => void
}

export function TokenBoostCard({ token, darkMode, onClick }: TokenBoostCardProps) {
  // Default logo if not available
  const logoUrl = token.logo || "https://cryptologos.cc/logos/ethereum-eth-logo.png"
  
  // Format price with commas and fixed decimal places
  const formatPrice = (price: number | undefined) => {
    if (!price) return "N/A"
    return price < 0.01 
      ? "$" + price.toFixed(6)
      : "$" + price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  // Truncate long addresses
  const formatAddress = (address: string) => {
    if (!address) return "N/A"
    return address.length > 10 ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : address
  }

  // Calculate price change color and percentage (mocked for now)
  const priceChange = token.symbol === "TRUMP" ? -8.75 : (Math.random() * 10000).toFixed(2); 
  const isPriceUp = Number(priceChange) >= 0;

  return (
    <Card
      className={`p-2 ${darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"} 
        hover:shadow-md transition-all duration-200 cursor-pointer`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full overflow-hidden bg-gray-800">
            {logoUrl && (
              <Image 
                src={logoUrl} 
                alt={token.name || token.symbol} 
                fill 
                className="object-cover"
                onError={(e) => {
                  // Fallback to default logo on error
                  (e.target as HTMLImageElement).src = "https://cryptologos.cc/logos/ethereum-eth-logo.png"
                }}
              />
            )}
          </div>

          <div>
            <p className="font-medium text-sm">{token.symbol || "Unknown"}</p>
            <p className="text-xs text-gray-400">{formatAddress(token.address)}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="font-medium text-sm">{formatPrice(token.price)}</p>
          <p className={`text-xs ${isPriceUp ? "text-green-500" : "text-red-500"}`}>
            {isPriceUp ? "+" : ""}{priceChange}%
          </p>
        </div>
      </div>

      <div className="flex justify-between mt-1 text-xs text-gray-400">
        <div className="flex items-center">
          <p className="text-gray-400">24h交易量</p>
          <p className="ml-1 text-foreground">${(Math.random() * 100).toFixed(1)}M</p>
        </div>
        <div className="flex items-center">
          <p className="text-gray-400">持有者</p>
          <p className="ml-1 text-foreground">{(Math.random() * 1000).toFixed(1)}K</p>
        </div>
        <div className="text-right uppercase">
          <p className="text-foreground">{token.chain || "Unknown"}</p>
        </div>
      </div>
    </Card>
  )
} 