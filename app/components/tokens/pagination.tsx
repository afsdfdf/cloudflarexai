import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

// 分页项类型
type PaginationItem = number | "left-dots" | "right-dots";

/**
 * 分页组件
 */
export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange
}: PaginationProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // 计算总页数
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // 如果总页数小于2，不显示分页
  if (totalPages < 2) return null;
  
  // 计算要显示哪些页码按钮
  const getPaginationItems = (): PaginationItem[] => {
    const items: PaginationItem[] = [];
    const maxPagesShown = 5; // 最多显示的页码数
    
    // 如果总页数小于最大显示数，显示所有页码
    if (totalPages <= maxPagesShown) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
      return items;
    }
    
    // 否则使用省略号
    const leftSiblingIndex = Math.max(currentPage - 1, 1);
    const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
    
    const showLeftDots = leftSiblingIndex > 2;
    const showRightDots = rightSiblingIndex < totalPages - 1;
    
    // 总是显示第一页和最后一页
    if (showLeftDots && showRightDots) {
      // 中间页码
      return [1, "left-dots", leftSiblingIndex, currentPage, rightSiblingIndex, "right-dots", totalPages];
    } else if (showLeftDots && !showRightDots) {
      // 靠近最后一页
      return [1, "left-dots", ...Array.from({length: 4}, (_, i) => totalPages - 3 + i)];
    } else if (!showLeftDots && showRightDots) {
      // 靠近第一页
      return [...Array.from({length: 4}, (_, i) => i + 1), "right-dots", totalPages];
    }
    
    return items;
  };
  
  const paginationItems = getPaginationItems();
  
  // 渲染页码按钮
  const renderPageButton = (page: PaginationItem, index: number) => {
    // 判断是否为省略号
    if (page === "left-dots" || page === "right-dots") {
      return (
        <div 
          key={`dots-${index}`}
          className={cn(
            "flex items-center justify-center w-8 h-8",
            isDark ? "text-muted-foreground" : "text-muted-foreground"
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </div>
      );
    }
    
    // 数字页码按钮
    const isActive = currentPage === page;
    
    return (
      <Button
        key={`page-${page}`}
        variant={isActive ? "default" : "outline"}
        size="icon"
        className={cn(
          "w-8 h-8 text-xs rounded-full",
          "transition-all duration-200",
          isActive
            ? isDark 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            : isDark 
                ? "bg-muted/30 border-muted/50 hover:bg-muted/50 text-foreground"
                : "bg-secondary/70 border-border/40 hover:bg-muted/30 text-foreground"
        )}
        onClick={() => onPageChange(page as number)}
      >
        {page}
      </Button>
    );
  };
  
  return (
    <div className="flex items-center justify-center mt-4 space-x-1">
      {/* 上一页按钮 */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full",
          isDark 
            ? "bg-muted/30 border-muted/50 hover:bg-muted/50" 
            : "bg-secondary/70 border-border/40 hover:bg-muted/30",
          currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover-scale"
        )}
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {/* 页码按钮 */}
      <div className="flex items-center space-x-1">
        {paginationItems.map((page, index) => renderPageButton(page, index))}
      </div>
      
      {/* 下一页按钮 */}
      <Button
        variant="outline"
        size="icon"
        className={cn(
          "h-8 w-8 rounded-full",
          isDark 
            ? "bg-muted/30 border-muted/50 hover:bg-muted/50" 
            : "bg-secondary/70 border-border/40 hover:bg-muted/30",
          currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover-scale"
        )}
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
} 