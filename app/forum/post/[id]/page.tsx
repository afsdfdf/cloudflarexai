"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, Send, ThumbsUp, MessageCircle, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import BottomNav from "../../../components/BottomNav"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

// 帖子详情页的类型
interface PostDetail {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
}

// 简化的帖子类型（与forum/page.tsx中一致）
interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
}

// 模拟帖子详情数据
const MOCK_POST_DETAILS: Record<string, PostDetail> = {
  "1": {
    id: "1",
    author: "crypto_fan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto_fan",
    content: "刚刚看了XAI最新的发展路线图，感觉很有潜力！大家怎么看？",
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    likes: 15,
    comments: [
      {
        id: "c1",
        author: "blockchain_dev",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blockchain_dev",
        content: "同意！特别是他们的扩容方案非常创新，很期待接下来的发展。",
        timestamp: new Date(Date.now() - 1000 * 60 * 25),
        likes: 4
      },
      {
        id: "c2",
        author: "token_trader",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=token_trader",
        content: "我觉得技术是好的，但是他们的营销策略还需要加强。",
        timestamp: new Date(Date.now() - 1000 * 60 * 20),
        likes: 2
      },
      {
        id: "c3",
        author: "crypto_newbie",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=crypto_newbie",
        content: "能分享一下路线图的链接吗？我想了解更多。",
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        likes: 1
      }
    ]
  },
  "2": {
    id: "2",
    author: "blockchain_dev",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=blockchain_dev",
    content: "有人了解最近的Layer 2解决方案吗？想知道哪个在交易速度和费用方面表现最好。",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    likes: 8,
    comments: [
      {
        id: "c4",
        author: "eth_maxi",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=eth_maxi",
        content: "Optimism和Arbitrum都不错，但个人偏向Optimism的安全设计。",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        likes: 5
      },
      {
        id: "c5",
        author: "zk_fan",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=zk_fan",
        content: "你应该看看zkSync，我认为zk-rollups是未来的趋势。",
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        likes: 3
      }
    ]
  },
  "3": {
    id: "3",
    author: "token_trader",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=token_trader",
    content: "今天市场波动很大啊，大家都在关注哪些币？",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    likes: 21,
    comments: [
      {
        id: "c6",
        author: "btc_holder",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=btc_holder",
        content: "依然是比特币，稳定才是王道。",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
        likes: 7
      },
      {
        id: "c7",
        author: "defi_degen",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=defi_degen",
        content: "我在关注一些新的DeFi项目，收益率还不错。",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
        likes: 4
      },
      {
        id: "c8",
        author: "nft_collector",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=nft_collector",
        content: "我觉得NFT市场最近有回暖的迹象，值得关注。",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        likes: 2
      }
    ]
  }
};

export default function PostDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const [post, setPost] = useState<PostDetail | null>(null)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 从localStorage加载所有帖子
  const loadForumPosts = (): Post[] => {
    try {
      const savedPosts = localStorage.getItem('forumPosts')
      if (savedPosts) {
        return JSON.parse(savedPosts, (key, value) => {
          if (key === 'timestamp') {
            return new Date(value)
          }
          return value
        })
      }
    } catch (error) {
      console.error('加载帖子数据失败:', error)
    }
    return []
  }
  
  // 从localStorage加载帖子详情
  const loadPostDetails = (postId: string): PostDetail | null => {
    try {
      const savedPostDetails = localStorage.getItem(`post_${postId}`)
      if (savedPostDetails) {
        return JSON.parse(savedPostDetails, (key, value) => {
          if (key === 'timestamp') {
            return new Date(value)
          }
          return value
        })
      }
    } catch (error) {
      console.error(`加载帖子详情失败 (ID: ${postId}):`, error)
    }
    return null
  }
  
  // 保存帖子详情到localStorage
  const savePostDetails = (postDetail: PostDetail) => {
    try {
      localStorage.setItem(`post_${postDetail.id}`, JSON.stringify(postDetail))
      
      // 同时更新主帖子列表中的点赞数和评论数
      const allPosts = loadForumPosts()
      const updatedPosts = allPosts.map(p => {
        if (p.id === postDetail.id) {
          return {
            ...p,
            likes: postDetail.likes,
            comments: postDetail.comments.length
          }
        }
        return p
      })
      
      localStorage.setItem('forumPosts', JSON.stringify(updatedPosts))
    } catch (error) {
      console.error('保存帖子详情失败:', error)
    }
  }
  
  useEffect(() => {
    // 从localStorage加载帖子详情
    const savedPostDetail = loadPostDetails(params.id)
    
    if (savedPostDetail) {
      // 如果有保存的详情数据，直接使用
      setPost(savedPostDetail)
    } else {
      // 否则尝试从帖子列表中获取基本信息
      const allPosts = loadForumPosts()
      const basicPost = allPosts.find(p => p.id === params.id)
      
      if (basicPost) {
        // 如果找到了基本帖子信息，创建一个新的详情对象
        const newPostDetail: PostDetail = {
          ...basicPost,
          comments: [] // 初始化空评论列表
        }
        setPost(newPostDetail)
        // 保存这个新创建的详情数据
        savePostDetails(newPostDetail)
      } else {
        // 如果在localStorage中找不到，尝试使用模拟数据
        const mockPostDetail = MOCK_POST_DETAILS[params.id]
        if (mockPostDetail) {
          setPost(mockPostDetail)
          // 保存模拟数据到localStorage作为初始数据
          savePostDetails(mockPostDetail)
        }
      }
    }
  }, [params.id])
  
  // 添加评论
  const handleAddComment = () => {
    if (!newComment.trim()) {
      alert("评论不能为空，请输入评论内容");
      return;
    }
    
    setIsSubmitting(true);
    
    // 模拟添加评论过程
    setTimeout(() => {
      if (post) {
        const newCommentObj: Comment = {
          id: `c${Date.now()}`,
          author: "current_user", // 实际应用中应从用户会话中获取
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=current_user",
          content: newComment,
          timestamp: new Date(),
          likes: 0
        }
        
        const updatedPost = {
          ...post,
          comments: [...post.comments, newCommentObj]
        }
        
        setPost(updatedPost)
        
        // 保存到localStorage
        savePostDetails(updatedPost)
        
        setNewComment("")
        setIsSubmitting(false)
        
        alert("评论发布成功！");
      }
    }, 800)
  }
  
  // 点赞功能
  const handleLikePost = () => {
    if (post) {
      const updatedPost = {
        ...post,
        likes: post.likes + 1
      }
      
      setPost(updatedPost)
      
      // 保存到localStorage
      savePostDetails(updatedPost)
    }
  }
  
  const handleLikeComment = (commentId: string) => {
    if (post) {
      const updatedPost = {
        ...post,
        comments: post.comments.map(comment => {
          if (comment.id === commentId) {
            return { ...comment, likes: comment.likes + 1 }
          }
          return comment
        })
      }
      
      setPost(updatedPost)
      
      // 保存到localStorage
      savePostDetails(updatedPost)
    }
  }

  const handleDeletePost = () => {
    if (!post) return;
    
    if (confirm("确定要删除这篇帖子吗？此操作不可恢复。")) {
      // 从localStorage中删除帖子详情
      localStorage.removeItem(`post_${post.id}`);
      
      // 从帖子列表中移除
      const allPosts = loadForumPosts();
      const updatedPosts = allPosts.filter(p => p.id !== post.id);
      localStorage.setItem('forumPosts', JSON.stringify(updatedPosts));
      
      // 返回到论坛主页
      router.push('/forum');
    }
  }

  if (!post) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        isDark ? "bg-[#0b101a] text-white" : "bg-white text-black"
      )}>
        <div className="text-center">
          <h2 className="text-xl font-bold">帖子不存在</h2>
          <p className="text-gray-500 mt-2">无法找到该帖子或已被删除</p>
          <Link href="/forum">
            <button className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md">
              返回聊天广场
            </button>
          </Link>
        </div>
      </div>
    )
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
            <Link href="/forum">
              <button 
                className="rounded-full p-2 mr-2 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="返回聊天广场"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-xl font-bold">帖子详情</h1>
          </div>
          <button
            onClick={handleDeletePost}
            className="text-red-500 hover:text-red-600 text-sm px-2 py-1 rounded-md"
          >
            删除
          </button>
        </div>
        
        {/* 帖子详情 */}
        <div className="p-4">
          <div className={cn(
            "rounded-lg border overflow-hidden",
            isDark ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"
          )}>
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
              
              <div className="py-2 text-lg">
                {post.content}
              </div>
              
              <div className="pt-3 flex items-center border-t mt-2 border-gray-200 dark:border-gray-700">
                <button 
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm flex items-center px-3 py-1 rounded-md"
                  onClick={handleLikePost}
                  aria-label={`点赞，当前点赞数 ${post.likes}`}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{post.likes}</span>
                </button>
                
                <div className="flex items-center ml-3 text-gray-500">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  <span>{post.comments.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* 评论输入框 */}
        <div className="px-4">
          <div className={cn(
            "rounded-lg border overflow-hidden",
            isDark ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"
          )}>
            <div className="p-4">
              <textarea
                placeholder="添加评论..."
                className={cn(
                  "w-full resize-none min-h-[80px] p-3 rounded-md",
                  isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-black"
                )}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end mt-3">
                <button 
                  onClick={handleAddComment}
                  disabled={isSubmitting || !newComment.trim()}
                  className={cn(
                    "px-4 py-2 rounded-md flex items-center",
                    isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white",
                    (isSubmitting || !newComment.trim()) && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      发送中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      发送评论
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* 评论列表 */}
        <div className="p-4">
          <h2 className="text-lg font-medium mb-3 px-1">评论 ({post.comments.length})</h2>
          <div className="space-y-3">
            {post.comments.map((comment) => (
              <div 
                key={comment.id} 
                className={cn(
                  "rounded-lg border overflow-hidden",
                  isDark ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"
                )}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3 mb-2">
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      <Image 
                        src={comment.avatar} 
                        alt={comment.author}
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{comment.author}</div>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {format(new Date(comment.timestamp), 'yyyy-MM-dd HH:mm')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-1 pl-11">
                    {comment.content}
                  </div>
                  
                  <div className="pt-2 flex items-center pl-11">
                    <button 
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-sm flex items-center px-2 py-1 rounded-md"
                      onClick={() => handleLikeComment(comment.id)}
                      aria-label={`点赞评论，当前点赞数 ${comment.likes}`}
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      <span>{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {post.comments.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                暂无评论，来发表第一条评论吧！
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 底部导航 */}
      <BottomNav darkMode={isDark} />
    </div>
  )
} 