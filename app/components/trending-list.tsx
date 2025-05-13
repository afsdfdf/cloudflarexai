'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { TrendingToken } from '../api/trending/route'

export default function TrendingList() {
  const [tokens, setTokens] = useState<TrendingToken[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await fetch('/api/trending')
        const data = await response.json()
        setTokens(data.trending)
      } catch (error) {
        console.error('Error fetching trending tokens:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
    // 每5分钟更新一次数据
    const interval = setInterval(fetchTrending, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-[#1A1B1E]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">热门代币</h2>
        <button className="text-sm text-blue-400">查看所有</button>
      </div>
      
      {tokens.map((token) => (
        <div 
          key={token.id}
          className="flex items-center justify-between p-4 rounded-lg bg-[#25262A] hover:bg-[#2C2D31] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8">
              <Image
                src={token.logo || `/placeholder.svg?height=32&width=32`}
                alt={token.name}
                fill
                className="rounded-full"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{token.name}</span>
                <span className="text-xs text-gray-400">#{token.rank}</span>
              </div>
              <span className="text-sm text-gray-400">{token.symbol}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-white">{token.priceUsd}</div>
            <div className={`text-sm ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {token.change24h >= 0 ? '+' : ''}{token.change24h}%
            </div>
          </div>
          
          <div className="hidden md:block text-right">
            <div className="text-sm text-gray-400">24h Vol</div>
            <div className="text-white">{token.volumeUsd}</div>
          </div>
          
          <div className="hidden md:block text-right">
            <div className="text-sm text-gray-400">MCap</div>
            <div className="text-white">{token.marketCapUsd}</div>
          </div>
          
          <div className="hidden md:block text-right">
            <div className="text-sm text-gray-400">Chain</div>
            <div className="text-white capitalize">{token.chain}</div>
          </div>
        </div>
      ))}
    </div>
  )
} 