"use client"

import { useState, useEffect, useRef, useMemo, memo } from "react"
import { Card } from "@/components/ui/card"
import { useTopics } from "@/app/hooks/use-topics"
import { useTokensByTopic } from "@/app/hooks/use-tokens"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

// 导入子组件
import TopicSelector from "./tokens/topic-selector"
import TokensTable from "./tokens/tokens-table"
import Pagination from "./tokens/pagination"
import LoadingState from "./tokens/loading-state"

interface TokenRankingsProps {
  darkMode: boolean;
  mode?: 'homepage' | 'market';
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  itemsPerPage?: number;
}

// 使用React.memo优化子组件渲染
const MemoizedTokensTable = memo(TokensTable);
const MemoizedTopicSelector = memo(TopicSelector);
const MemoizedPagination = memo(Pagination);

/**
 * 代币排行组件
 */
export default function TokenRankings({ 
  darkMode, 
  mode = 'homepage', 
  scrollRef,
  itemsPerPage = 50
}: TokenRankingsProps) {
  // 使用next-themes获取当前主题
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  // 状态管理
  const [activeTopicId, setActiveTopicId] = useState<string>("hot")
  const [currentPage, setCurrentPage] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const internalScrollRef = useRef<HTMLDivElement>(null)
  
  // 使用传入的scrollRef或内部创建的ref
  const finalScrollRef = scrollRef || internalScrollRef
  
  // 处理左右滚动箭头点击
  const scrollTopics = (direction: 'left' | 'right') => {
    if (!finalScrollRef.current) return;
    
    const scrollAmount = 200; // 每次滚动的像素
    const currentScroll = finalScrollRef.current.scrollLeft;
    
    finalScrollRef.current.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };
  
  // 使用自定义Hook获取数据
  const { 
    topics, 
    isLoading: isTopicsLoading, 
    error: topicsError 
  } = useTopics()
  
  const { 
    tokens, 
    isLoading: isTokensLoading, 
    error: tokensError,
    refresh,
    lastUpdated,
    usingFallback
  } = useTokensByTopic(activeTopicId)

  // 组合加载状态和错误
  const isLoading = isTopicsLoading || isTokensLoading
  const error = topicsError || tokensError

  // 处理主题切换
  const handleTopicChange = (topicId: string) => {
    if (topicId === activeTopicId) return;
    
    setIsTransitioning(true);
    setActiveTopicId(topicId);
    
    // 简单的过渡效果
    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
    
    setCurrentPage(1); // 切换主题时重置到第一页
  }

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }
  
  // 使用useMemo优化当前页显示的代币列表
  const currentPageTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return tokens.slice(startIndex, endIndex);
  }, [tokens, currentPage, itemsPerPage]);

  // 加载状态
  if (isLoading && tokens.length === 0) {
    return <LoadingState />
  }

  // 错误状态
  if (error && tokens.length === 0) {
    return (
      <Card className={cn(
        "p-6 border border-border animate-fade-in",
        isDark ? "bg-card shadow-md" : "bg-card shadow-sm"
      )}>
        <div className="flex flex-col items-center justify-center text-center gap-2">
          <AlertCircle className="h-8 w-8 text-destructive animate-pulse-subtle" />
          <div className="text-destructive font-medium">加载失败</div>
          <div className="text-sm text-muted-foreground mb-4">
            {error}
          </div>
          <Button 
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 rounded-full px-4 hover-scale",
              isDark ? "border-destructive/30 hover:bg-destructive/10" : "border-destructive/30 hover:bg-destructive/5"
            )}
            onClick={() => refresh()}
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
        </div>
      </Card>
    )
  }

  // 正常渲染
  return (
    <Card className={cn(
      "p-4 border border-border overflow-hidden animate-fade-in subtle-shadow",
      isDark 
        ? "bg-card" 
        : "bg-card"
    )}>
      {usingFallback && (
        <Alert className={cn(
          "mb-4 border rounded-lg",
          isDark 
            ? "bg-warning/10 border-warning/20" 
            : "bg-warning/10 border-warning/20"
        )}>
          <AlertCircle className={cn(
            "h-4 w-4", 
            isDark ? "text-warning" : "text-warning"
          )} />
          <AlertDescription className={isDark ? "text-warning/90" : "text-warning/90"}>
            数据获取失败，当前显示的是备用数据。您可以尝试刷新页面或稍后再试。
          </AlertDescription>
        </Alert>
      )}
      
      <div className="relative mb-2">
        {/* 添加滚动箭头 */}
        <div className="absolute right-0 top-1 z-10 flex space-x-2">
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "h-6 w-6 rounded-full opacity-80 hover-scale",
              isDark 
                ? "bg-muted/40 border-muted/50 hover:bg-muted/60" 
                : "bg-secondary/80 border-border/50 hover:bg-muted/60"
            )}
            onClick={() => scrollTopics('left')}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon" 
            className={cn(
              "h-6 w-6 rounded-full opacity-80 hover-scale",
              isDark 
                ? "bg-muted/40 border-muted/50 hover:bg-muted/60" 
                : "bg-secondary/80 border-border/50 hover:bg-muted/60"
            )}
            onClick={() => scrollTopics('right')}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
        
        <MemoizedTopicSelector 
          topics={topics} 
          activeTopic={activeTopicId}
          onTopicChange={handleTopicChange}
          mode={mode}
          scrollRef={finalScrollRef}
        />
      </div>
      
      <div className={cn(
        isTransitioning ? "opacity-70" : "opacity-100",
        "transition-opacity duration-300"
      )}>
        <MemoizedTokensTable 
          tokens={currentPageTokens}
          currentPage={currentPage}
          darkMode={isDark} 
          itemsPerPage={itemsPerPage}
          onRefresh={refresh}
          lastUpdated={lastUpdated}
        />
      </div>
      
      <MemoizedPagination 
        currentPage={currentPage}
        totalItems={tokens.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
      />
    </Card>
  )
}