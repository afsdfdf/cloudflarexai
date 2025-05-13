import React from "react";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Smile, ChartBar, Coins, Rocket, Zap, Flame } from "lucide-react";
import { RankTopic } from "@/app/types/token";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface TopicSelectorProps {
  topics: RankTopic[];
  activeTopic: string;
  onTopicChange: (topicId: string) => void;
  mode?: 'homepage' | 'market'; // 新增模式属性，用于区分首页和市场页面
  scrollRef?: React.RefObject<HTMLDivElement | null>; // 滚动引用，用于外部控制滚动
}

/**
 * 主题选择器组件
 */
export default function TopicSelector({ 
  topics, 
  activeTopic, 
  onTopicChange,
  mode = 'market', // 默认为市场模式，显示所有主题
  scrollRef
}: TopicSelectorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  // 找到活动主题的索引
  const activeIndex = topics.findIndex(topic => topic.id === activeTopic);
  
  // 获取主题对应的图标和颜色
  const getTopicIcon = (topicId: string) => {
    switch (topicId) {
      case 'hot':
        return <Flame className="h-4 w-4 mr-1.5" />;
      case 'new':
        return <Zap className="h-4 w-4 mr-1.5" />;
      case 'meme':
        return <Smile className="h-4 w-4 mr-1.5" />;
      case 'defi':
        return <ChartBar className="h-4 w-4 mr-1.5" />;
      case 'nft':
        return <Coins className="h-4 w-4 mr-1.5" />;
      case 'ai':
        return <Rocket className="h-4 w-4 mr-1.5" />;
      default:
        return <TrendingUp className="h-4 w-4 mr-1.5" />;
    }
  };
  
  // 获取主题对应的风格
  const getTopicStyle = (topicId: string, isActive: boolean) => {
    if (!isActive) return {};
    
    // 根据主题设置不同的渐变背景色
    switch (topicId) {
      case 'hot':
        return {
          background: isDark 
            ? 'linear-gradient(45deg, rgba(239,68,68,0.8), rgba(217,70,239,0.8))'
            : 'linear-gradient(45deg, rgba(239,68,68,0.9), rgba(217,70,239,0.9))',
          boxShadow: isDark 
            ? '0 2px 10px rgba(239,68,68,0.2)' 
            : '0 2px 8px rgba(239,68,68,0.25)'
        };
      case 'new':
        return {
          background: isDark 
            ? 'linear-gradient(45deg, rgba(59,130,246,0.8), rgba(16,185,129,0.8))'
            : 'linear-gradient(45deg, rgba(59,130,246,0.9), rgba(16,185,129,0.9))',
          boxShadow: isDark 
            ? '0 2px 10px rgba(59,130,246,0.2)' 
            : '0 2px 8px rgba(59,130,246,0.25)'
        };
      case 'meme':
        return {
          background: isDark 
            ? 'linear-gradient(45deg, rgba(245,158,11,0.8), rgba(249,115,22,0.8))'
            : 'linear-gradient(45deg, rgba(245,158,11,0.9), rgba(249,115,22,0.9))',
          boxShadow: isDark 
            ? '0 2px 10px rgba(245,158,11,0.2)' 
            : '0 2px 8px rgba(245,158,11,0.25)'
        };
      case 'defi':
        return {
          background: isDark 
            ? 'linear-gradient(45deg, rgba(16,185,129,0.8), rgba(5,150,105,0.8))'
            : 'linear-gradient(45deg, rgba(16,185,129,0.9), rgba(5,150,105,0.9))',
          boxShadow: isDark 
            ? '0 2px 10px rgba(16,185,129,0.2)' 
            : '0 2px 8px rgba(16,185,129,0.25)'
        };
      case 'nft':
        return {
          background: isDark 
            ? 'linear-gradient(45deg, rgba(124,58,237,0.8), rgba(139,92,246,0.8))'
            : 'linear-gradient(45deg, rgba(124,58,237,0.9), rgba(139,92,246,0.9))',
          boxShadow: isDark 
            ? '0 2px 10px rgba(124,58,237,0.2)' 
            : '0 2px 8px rgba(124,58,237,0.25)'
        };
      case 'ai':
        return {
          background: isDark 
            ? 'linear-gradient(45deg, rgba(79,70,229,0.8), rgba(45,212,191,0.8))'
            : 'linear-gradient(45deg, rgba(79,70,229,0.9), rgba(45,212,191,0.9))',
          boxShadow: isDark 
            ? '0 2px 10px rgba(79,70,229,0.2)' 
            : '0 2px 8px rgba(79,70,229,0.25)'
        };
      default:
        return {
          background: isDark 
            ? 'linear-gradient(45deg, rgba(59,130,246,0.8), rgba(16,185,129,0.8))'
            : 'linear-gradient(45deg, rgba(59,130,246,0.9), rgba(16,185,129,0.9))',
          boxShadow: isDark 
            ? '0 2px 10px rgba(59,130,246,0.2)' 
            : '0 2px 8px rgba(59,130,246,0.25)'
        };
    }
  };

  // 根据模式过滤主题
  const filteredTopics = mode === 'homepage' 
    ? topics.filter(topic => ['hot', 'meme', 'new', 'bsc', 'solana'].includes(topic.id))
    : topics;

  // 使用横向滚动布局
  return (
    <div 
      className="mb-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide"
      ref={scrollRef}
    >
      <div className="flex space-x-2 min-w-max py-1">
        {filteredTopics.map((topic) => {
          const isActive = topic.id === activeTopic;
          const topicStyle = getTopicStyle(topic.id, isActive);
          
          return (
            <Button
              key={topic.id}
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onTopicChange(topic.id)}
              className={cn(
                "flex items-center whitespace-nowrap flex-shrink-0 rounded-full px-3 transition-all",
                "h-8 font-medium",
                isActive
                  ? 'text-white border-none'
                  : isDark 
                    ? 'bg-muted/40 border-muted/60 hover:bg-muted/80 text-foreground hover:border-muted/90'
                    : 'bg-secondary/80 border-border/60 hover:bg-muted/60 text-foreground hover:border-muted/90'
              )}
              style={topicStyle}
            >
              {getTopicIcon(topic.id)}
              <span className="text-sm">{topic.name_zh}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
} 