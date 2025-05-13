import React, { useMemo, useState, memo } from "react";
import { useRouter } from "next/navigation";
import { TokenRanking } from "@/app/types/token";
import TokenRow from "./token-row";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatUpdatedTime } from "@/app/lib/formatters";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface TokensTableProps {
  tokens: TokenRanking[];
  currentPage: number;
  darkMode: boolean;
  itemsPerPage?: number;
  onRefresh?: () => void;
  lastUpdated?: Date | null;
}

// 刷新按钮组件
const RefreshButton = memo(({ 
  onRefresh, 
  isRefreshing, 
  lastUpdated, 
  isDark 
}: { 
  onRefresh: () => void; 
  isRefreshing: boolean; 
  lastUpdated?: Date | null; 
  isDark: boolean;
}) => {
  return (
    <div className={cn(
      "flex items-center justify-end mt-4 text-xs",
      isDark ? "text-muted-foreground" : "text-muted-foreground/80"
    )}>
      {lastUpdated && (
        <span className="mr-2">
          最后更新: {formatUpdatedTime(lastUpdated)}
        </span>
      )}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        disabled={isRefreshing}
        className={cn(
          "px-3 h-7 rounded-full gap-1 transition-all",
          isDark 
            ? "border-muted hover:bg-muted hover:border-muted/80" 
            : "border-border hover:bg-secondary hover:border-muted/50",
          isRefreshing ? "opacity-80" : ""
        )}
      >
        <RefreshCw className={cn(
          "h-3.5 w-3.5",
          isRefreshing ? "animate-spin" : ""
        )} />
        {isRefreshing ? "刷新中..." : "刷新"}
      </Button>
    </div>
  );
});

RefreshButton.displayName = 'RefreshButton';

// 表头组件
const TableHeader = memo(({ isDark }: { isDark: boolean }) => {
  return (
    <div className={cn(
      "grid grid-cols-12 gap-2 py-3 px-4 text-xs font-medium mb-3 rounded-lg",
      "backdrop-blur-sm sticky top-0 z-10",
      isDark 
        ? "text-primary-foreground bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/10" 
        : "text-primary/90 bg-gradient-to-r from-primary/5 to-transparent border border-primary/10"
    )}>
      <div className="col-span-6 flex items-center">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70 mr-2"></span>
        代币/链池
      </div>
      <div className="col-span-3 flex items-center">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70 mr-2"></span>
        价格
      </div>
      <div className="col-span-3 flex items-center justify-end">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary/70 mr-2"></span>
        24h涨幅
      </div>
    </div>
  );
});

TableHeader.displayName = 'TableHeader';

// 空状态组件
const EmptyState = memo(({ isDark }: { isDark: boolean }) => {
  return (
    <div className={cn(
      "text-center py-12 rounded-lg",
      "border border-dashed",
      isDark 
        ? "text-muted-foreground bg-muted/5 border-muted/30" 
        : "text-muted-foreground/80 bg-secondary/20 border-muted/20"
    )}>
      <div className="text-base font-medium">没有找到代币数据</div>
      <div className="text-xs text-muted-foreground mt-1">请尝试其他筛选条件或刷新页面</div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

/**
 * 代币表格组件
 */
function TokensTable({
  tokens,
  currentPage,
  darkMode,
  itemsPerPage = 50,
  onRefresh,
  lastUpdated
}: TokensTableProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark" || darkMode;

  // 计算当前页面的代币
  const currentPageTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tokens.slice(startIndex, startIndex + itemsPerPage);
  }, [tokens, currentPage, itemsPerPage]);

  // 处理代币点击
  const handleTokenClick = (token: TokenRanking) => {
    router.push(`/token/${token.chain}/${token.token}`);
  };
  
  // 处理刷新点击
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      // 添加短暂延迟以改善用户体验
      setTimeout(() => {
        setIsRefreshing(false);
      }, 800);
    }
  };

  return (
    <div className="w-full">
      {/* 表头 */}
      <TableHeader isDark={isDark} />

      {/* 代币行 */}
      <div className={cn(
        "space-y-1 pb-1",
        "relative",
        isDark 
          ? "before:absolute before:inset-x-0 before:top-0 before:h-10 before:bg-gradient-to-b before:from-card before:to-transparent before:z-0 before:pointer-events-none" 
          : "before:absolute before:inset-x-0 before:top-0 before:h-10 before:bg-gradient-to-b before:from-card before:to-transparent before:z-0 before:pointer-events-none"
      )}>
        {currentPageTokens.map((token, index) => (
          <TokenRow
            key={`${token.chain}-${token.token}`}
            token={token}
            index={(currentPage - 1) * itemsPerPage + index}
            darkMode={isDark}
            onClick={handleTokenClick}
          />
        ))}

        {/* 空状态 */}
        {currentPageTokens.length === 0 && <EmptyState isDark={isDark} />}
      </div>
      
      {/* 刷新按钮和最后更新时间 */}
      {onRefresh && (
        <RefreshButton 
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
          isDark={isDark}
        />
      )}
    </div>
  );
}

export default memo(TokensTable); 