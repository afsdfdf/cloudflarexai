"use client"

import { useState, useEffect } from "react"
import { MessageSquare, Send, ThumbsUp, MessageCircle, Clock, Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import BottomNav from "../components/BottomNav"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { format } from "date-fns"

// Mock data for posts
const MOCK_POSTS = [
  {
    id: "1",
    author: "crypto_fan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto_fan",
    content: "刚刚看了XAI最新的发展路线图，感觉很有潜力！大家怎么看？",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 15,
    comments: 5
  },
  {
    id: "2",
    author: "blockchain_dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blockchain_dev",
    content: "有人了解最近的Layer 2解决方案吗？想知道哪个在交易速度和费用方面表现最好。",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 8,
    comments: 12
  },
  {
    id: "3",
    author: "token_trader",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=token_trader",
    content: "今天市场波动很大啊，大家都在关注哪些币？",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    likes: 21,
    comments: 18
  }
];

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
}

export default function ForumPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const [posts, setPosts] = useState<Post[]>([])
  
  // 在组件挂载时从localStorage加载帖子数据
  useEffect(() => {
    // 获取保存的帖子数据
    const savedPosts = localStorage.getItem('forumPosts')
    
    if (savedPosts) {
      try {
        // 解析保存的数据，并将字符串日期转回Date对象
        const parsedPosts = JSON.parse(savedPosts, (key, value) => {
          if (key === 'timestamp') {
            return new Date(value)
          }
          return value
        })
        setPosts(parsedPosts)
      } catch (error) {
        console.error('解析保存的帖子数据失败:', error)
        // 如果解析失败，使用默认数据
        setPosts(MOCK_POSTS)
      }
    } else {
      // 如果没有保存的数据，使用默认数据
      setPosts(MOCK_POSTS)
    }
  }, [])
  
  // 保存帖子到localStorage
  const savePosts = (updatedPosts: Post[]) => {
    try {
      localStorage.setItem('forumPosts', JSON.stringify(updatedPosts))
    } catch (error) {
      console.error('保存帖子到localStorage失败:', error)
    }
  }
  
  // 点赞功能
  const handleLike = (postId: string) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, likes: post.likes + 1 }
      }
      return post
    })
    
    setPosts(updatedPosts)
    
    // 保存到localStorage
    savePosts(updatedPosts)
  }

  return (
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-[#0b101a] text-white" : "bg-white text-black"
    )}>
      <div className="max-w-md mx-auto pb-16">
        {/* 页面标题 */}
        <div className={cn(
          "sticky top-0 z-10 flex items-center justify-between p-4 border-b",
          isDark ? "bg-[#0b101a] border-gray-800" : "bg-white border-gray-200"
        )}>
          <div className="flex items-center">
            <h1 className="text-xl font-bold">聊天广场</h1>
          </div>
          <Link href="/forum/new">
            <button 
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="发布新帖子"
            >
              <Plus className="w-5 h-5" />
            </button>
          </Link>
        </div>
        
        {/* 快速发帖入口 */}
        <div className="p-4">
          <Link href="/forum/new" className="block">
            <div className={cn(
              "rounded-lg border overflow-hidden p-4 flex items-center",
              isDark ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"
            )}>
              <div className="flex-1 text-gray-500">
                有什么想法？点击发布新帖子...
              </div>
              <button 
                className={cn(
                  "ml-3 px-4 py-2 rounded-md flex items-center",
                  isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white"
                )}
              >
                <Send className="mr-2 h-4 w-4" />
                发布
              </button>
            </div>
          </Link>
        </div>
        
        {/* 帖子列表 */}
        <div className="p-4 space-y-4">
          {posts.map((post) => (
            <div 
              key={post.id} 
              className={cn(
                "rounded-lg border overflow-hidden",
                isDark ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"
              )}
            >
              <div className="p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="h-10 w-10 rounded-full overflow-hidden">
                    <Image 
                      src={post.avatar} 
                      alt={post.author}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-medium">{post.author}</div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(post.timestamp), 'yyyy-MM-dd HH:mm')}
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  {post.content}
                </div>
                
                <div className="pt-3 flex items-center border-t mt-2 border-gray-200 dark:border-gray-700">
                  <button 
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm flex items-center px-3 py-1 rounded-md"
                    onClick={() => handleLike(post.id)}
                    aria-label={`点赞，当前点赞数 ${post.likes}`}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    {post.likes}
                  </button>
                  
                  <Link href={`/forum/post/${post.id}`}>
                    <button 
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm flex items-center px-3 py-1 rounded-md"
                      aria-label={`查看评论，共 ${post.comments} 条评论`}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              暂无帖子，来发布第一条帖子吧！
            </div>
          )}
        </div>
      </div>
      
      {/* 底部导航 */}
      <BottomNav darkMode={isDark} />
    </div>
  )
} 