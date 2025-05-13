"use client"

import { useState } from "react"
import { ArrowLeft, Send } from "lucide-react"
import Link from "next/link"
import BottomNav from "../../components/BottomNav"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { useRouter } from "next/navigation"

// 帖子类型定义
interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
}

export default function NewPostPage() {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const [postContent, setPostContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // 从localStorage加载帖子
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
  
  // 保存帖子到localStorage
  const saveForumPosts = (posts: Post[]) => {
    try {
      localStorage.setItem('forumPosts', JSON.stringify(posts))
    } catch (error) {
      console.error('保存帖子数据失败:', error)
    }
  }
  
  // 发布新帖子
  const handleSubmit = () => {
    if (!postContent.trim()) {
      alert("内容不能为空，请输入帖子内容");
      return;
    }
    
    setIsSubmitting(true);
    
    // 创建新帖子对象
    const newPost: Post = {
      id: Date.now().toString(),
      author: "current_user", // 实际应用中应从用户会话中获取
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=current_user",
      content: postContent,
      timestamp: new Date(),
      likes: 0,
      comments: 0
    }
    
    // 获取现有帖子
    const existingPosts = loadForumPosts()
    
    // 添加新帖子到列表开头
    const updatedPosts = [newPost, ...existingPosts]
    
    // 保存到localStorage
    saveForumPosts(updatedPosts)
    
    // 模拟发布过程
    setTimeout(() => {
      setIsSubmitting(false);
      
      alert("发布成功！");
      
      // 发布成功后跳转到论坛首页
      router.push('/forum');
    }, 800)
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
            <h1 className="text-xl font-bold">发布新帖</h1>
          </div>
        </div>
        
        {/* 发帖表单 */}
        <div className="p-4">
          <div className={cn(
            "rounded-lg border overflow-hidden p-6",
            isDark ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"
          )}>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="post-content" className="block text-sm font-medium">帖子内容</label>
                  <textarea
                    id="post-content"
                    placeholder="分享您的想法、问题或见解..."
                    className={cn(
                      "w-full resize-none min-h-[200px] p-3 rounded-md",
                      isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-gray-50 border-gray-200 text-black"
                    )}
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                  />
                </div>
                
                <button 
                  type="submit"
                  className={cn(
                    "w-full px-4 py-2 rounded-md flex items-center justify-center",
                    isDark ? "bg-blue-600 text-white" : "bg-blue-500 text-white",
                    (isSubmitting || !postContent.trim()) && "opacity-50 cursor-not-allowed"
                  )}
                  disabled={isSubmitting || !postContent.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      发布中...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      发布帖子
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        {/* 发帖指南 */}
        <div className="p-4">
          <div className={cn(
            "rounded-lg border overflow-hidden p-6",
            isDark ? "bg-gray-900/50 border-gray-700" : "bg-white border-gray-200"
          )}>
            <h3 className="text-lg font-medium mb-3">发帖指南</h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-500">
              <li>请保持文明礼貌，尊重他人</li>
              <li>避免发布敏感信息，如私钥、助记词等</li>
              <li>提问时尽量描述清楚您的问题</li>
              <li>分享信息时请注明来源</li>
              <li>有价值的讨论将获得更多社区关注</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* 底部导航 */}
      <BottomNav darkMode={isDark} />
    </div>
  )
} 