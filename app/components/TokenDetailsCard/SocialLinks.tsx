"use client"

import { Globe, Twitter, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton" 
import { TokenDetails } from "@/app/lib/ave-api-service"
import { cn } from "@/lib/utils"

interface SocialLinksProps {
  tokenDetails: TokenDetails | null
  isLoading: boolean
  darkMode: boolean
}

export default function SocialLinks({
  tokenDetails,
  isLoading,
  darkMode
}: SocialLinksProps) {
  return (
    <div className="mt-3 mb-4">
      <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
        项目链接
      </h3>
      
      {isLoading ? (
        <div className="flex gap-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-20" />
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tokenDetails?.website && (
            <a 
              href={tokenDetails.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm",
                "border border-gray-200 dark:border-gray-700",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-colors"
              )}
            >
              <Globe className="h-4 w-4" />
              网站
            </a>
          )}
          
          {tokenDetails?.twitter && (
            <a 
              href={tokenDetails.twitter.startsWith('http') 
                ? tokenDetails.twitter 
                : `https://twitter.com/${tokenDetails.twitter.replace('@', '')}`
              } 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm",
                "border border-gray-200 dark:border-gray-700",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-colors"
              )}
            >
              <Twitter className="h-4 w-4" />
              Twitter
            </a>
          )}
          
          {tokenDetails?.telegram && (
            <a 
              href={tokenDetails.telegram.startsWith('http') 
                ? tokenDetails.telegram 
                : `https://t.me/${tokenDetails.telegram.replace('@', '')}`
              } 
              target="_blank" 
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm",
                "border border-gray-200 dark:border-gray-700",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "transition-colors"
              )}
            >
              <Send className="h-4 w-4" />
              Telegram
            </a>
          )}
          
          {!tokenDetails?.website && !tokenDetails?.twitter && !tokenDetails?.telegram && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              无可用链接
            </span>
          )}
        </div>
      )}
    </div>
  )
} 