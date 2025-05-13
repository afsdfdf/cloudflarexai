"use client"

import { forwardRef } from "react"
import Image from "next/image"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { TokenPrice } from "@/app/types/token"

interface SearchResultsProps {
  results: TokenPrice[]
  isSearching: boolean
  isDark: boolean
  searchValue: string
  onSelectToken: (token: TokenPrice) => void
  showLogo: boolean
  logoSize: number
}

// 搜索结果组件
const SearchResults = forwardRef<HTMLDivElement, SearchResultsProps>(
  ({ results, isSearching, isDark, searchValue, onSelectToken, showLogo, logoSize }, ref) => {
    // 没有搜索结果的渲染函数
    const renderNoResults = () => {
      if (!searchValue.trim()) return null;
      
      return (
        <div className="p-6 text-center">
          <div className="text-muted-foreground mb-1">未找到相关代币</div>
          <div className="text-xs text-muted-foreground/70">
            请尝试其他关键词或代币地址
          </div>
        </div>
      );
    };

    // 搜索中的渲染函数
    const renderSearching = () => (
      <div className="p-4 text-center text-sm">
        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full inline-block mr-2"></div>
        搜索中...
      </div>
    );

    // 渲染搜索结果列表项
    const renderResultItem = (token: TokenPrice, index: number) => (
      <div
        key={`${token.token}-${index}`}
        className={cn(
          "p-3 flex items-center gap-3 text-sm cursor-pointer transition-colors",
          "border-b last:border-0",
          isDark 
            ? "border-border/30 hover:bg-muted/50" 
            : "border-border/20 hover:bg-secondary/70",
        )}
        onClick={() => onSelectToken(token)}
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden bg-muted flex-shrink-0 shadow-sm">
          {token.logo_url && token.logo_url.trim() !== '' ? (
            <Image
              src={token.logo_url}
              alt={token.symbol || 'Token'}
              fill
              className="object-cover transition-transform hover:scale-110"
              style={{ transition: "transform 0.2s ease" }}
              onError={(e) => {
                // Replace with placeholder image on error
                (e.target as HTMLImageElement).src = "/images/token-placeholder.png";
              }}
            />
          ) : (
            <div className={cn(
              "w-full h-full flex items-center justify-center text-xs font-medium text-white",
              `bg-gradient-to-br ${
                index % 5 === 0 ? "from-pink-500 to-rose-500" :
                index % 5 === 1 ? "from-blue-500 to-indigo-500" :
                index % 5 === 2 ? "from-green-500 to-emerald-500" :
                index % 5 === 3 ? "from-amber-500 to-orange-500" :
                "from-purple-500 to-fuchsia-500"
              }`
            )}>
              {token.symbol?.charAt(0) || '?'}
            </div>
          )}
        </div>
        <div className="flex-grow">
          <div className="font-medium">{token.symbol}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[120px]">
            {token.name} • {token.chain.toUpperCase()}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs font-medium">
            ${typeof token.current_price_usd === 'string' 
              ? parseFloat(token.current_price_usd).toFixed(6) 
              : (token.current_price_usd || 0).toFixed(6)}
          </div>
          {token.price_change_24h && (
            <div className={cn(
              "text-xs px-2 py-0.5 rounded-full mt-1 inline-block",
              parseFloat(String(token.price_change_24h)) >= 0 
                ? 'text-emerald-500 bg-emerald-500/10' 
                : 'text-rose-500 bg-rose-500/10'
            )}>
              {parseFloat(String(token.price_change_24h)) >= 0 ? '+' : ''}
              {parseFloat(String(token.price_change_24h)).toFixed(2)}%
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div 
        ref={ref} 
        className={cn(
          "absolute left-0 right-0 mt-1 max-h-96 overflow-y-auto rounded-md shadow-lg z-50 animate-fade-in",
          isDark 
            ? "bg-card border border-border/70" 
            : "bg-card border border-border/40"
        )}
        style={{ marginLeft: showLogo ? `${logoSize + 12}px` : '0' }}
      >
        {isSearching ? (
          renderSearching()
        ) : results.length > 0 ? (
          results.map(renderResultItem)
        ) : (
          renderNoResults()
        )}
      </div>
    );
  }
);

SearchResults.displayName = "SearchResults";

export default SearchResults; 