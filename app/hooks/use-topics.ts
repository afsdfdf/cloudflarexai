'use client';

import { useState, useEffect } from 'react';
import { RankTopic, TopicsResponse, ApiResponse } from '@/app/types/token';
import { toast } from '@/components/ui/use-toast';

// 备用数据，当API请求失败时使用
const fallbackTopics: RankTopic[] = [
  {
    "id": "hot",
    "name_en": "Hot",
    "name_zh": "热门"
  },
  {
    "id": "new",
    "name_en": "New",
    "name_zh": "新币"
  },
  {
    "id": "meme",
    "name_en": "Meme",
    "name_zh": "Meme"
  }
];

/**
 * 主题获取Hook
 * @returns 主题数据、加载状态和错误信息
 */
export function useTopics() {
  const [topics, setTopics] = useState<RankTopic[]>(fallbackTopics);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 调用API获取主题
        const response = await fetch('/api/tokens?topic=topics', {
          next: { revalidate: 3600 } // 1小时缓存
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const result = await response.json() as ApiResponse<TopicsResponse>;
        
        if (result && result.success && result.data && result.data.topics) {
          setTopics(result.data.topics);
        } else {
          // 如果响应格式不正确，记录错误但使用备用数据
          console.error("Invalid API response format", result);
          setTopics(fallbackTopics);
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
        setError(error instanceof Error ? error.message : "Failed to fetch topics");
        // 失败时使用备用数据
        setTopics(fallbackTopics);
        
        // 显示错误通知，但不妨碍用户体验
        toast({
          title: "获取主题失败",
          description: "使用默认主题作为备用。",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, []);

  return {
    topics,
    isLoading,
    error
  };
} 