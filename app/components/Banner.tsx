"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// 轮播图配置接口
export interface BannerItem {
  /** 图片地址 */
  imageUrl: string;
  /** 链接地址(可选) */
  link?: string;
  /** 标题(可选) */
  title?: string;
  /** 描述(可选) */
  description?: string;
}

interface BannerProps {
  /** 轮播图列表 */
  banners: BannerItem[];
  /** 自动轮播间隔时间(毫秒) */
  interval?: number;
  /** 高度 */
  height?: number;
  /** 是否显示箭头 */
  showArrows?: boolean;
  /** 是否显示指示器 */
  showIndicators?: boolean;
  /** 圆角大小 */
  borderRadius?: number;
  /** 自定义类名 */
  className?: string;
}

export default function Banner({
  banners,
  interval = 5000,
  height = 180,
  showArrows = true,
  showIndicators = true,
  borderRadius = 16,
  className
}: BannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // 切换到下一张图片
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    )
  }

  // 切换到上一张图片
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    )
  }

  // 切换到指定索引的图片
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // 处理自动轮播
  useEffect(() => {
    // 如果只有一张图片或暂停轮播，则不自动轮播
    if (banners.length <= 1 || isPaused) return
    
    // 设置定时器
    timerRef.current = setInterval(() => {
      nextSlide()
    }, interval)
    
    // 清理定时器
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [banners.length, interval, isPaused])

  // 如果没有轮播图，则不显示
  if (!banners || banners.length === 0) return null

  // 处理外部链接
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
    // 如果链接是以http或https开头，则在新标签页打开
    if (link.startsWith('http') || link.startsWith('https')) {
      // 不阻止默认行为，让浏览器正常处理
      return;
    }
    
    // 否则阻止默认行为，由Next.js的Link组件处理
    e.preventDefault();
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        className
      )}
      style={{ 
        position: 'relative',
        width: '100%',
        paddingBottom: '26.67%', // 15:4 比例 (4/15 = 0.2667)
        borderRadius: `${borderRadius}px`
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 轮播图容器 */}
      <div 
        className="flex transition-transform duration-500 absolute inset-0"
        style={{ 
          width: `${banners.length * 100}%`,
          transform: `translateX(-${currentIndex * (100 / banners.length)}%)`
        }}
      >
        {banners.map((banner, index) => (
          <div 
            key={index} 
            className="relative"
            style={{ width: `${100 / banners.length}%` }}
          >
            {banner.link ? (
              banner.link.startsWith('http') || banner.link.startsWith('https') ? (
                // 外部链接使用a标签
                <a 
                  href={banner.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="block w-full h-full"
                  onClick={(e) => handleLinkClick(e, banner.link!)}
                >
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || `Banner ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-cover"
                  />
                  
                  {/* 图片文本内容 */}
                  {(banner.title || banner.description) && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                      {banner.title && (
                        <h3 className="text-lg font-semibold">{banner.title}</h3>
                      )}
                      {banner.description && (
                        <p className="text-sm opacity-90">{banner.description}</p>
                      )}
                    </div>
                  )}
                </a>
              ) : (
                // 内部链接使用Next.js Link组件
                <Link href={banner.link} className="block w-full h-full">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title || `Banner ${index + 1}`}
                    fill
                    priority={index === 0}
                    className="object-cover"
                  />
                  
                  {/* 图片文本内容 */}
                  {(banner.title || banner.description) && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                      {banner.title && (
                        <h3 className="text-lg font-semibold">{banner.title}</h3>
                      )}
                      {banner.description && (
                        <p className="text-sm opacity-90">{banner.description}</p>
                      )}
                    </div>
                  )}
                </Link>
              )
            ) : (
              <div className="w-full h-full">
                <Image
                  src={banner.imageUrl}
                  alt={banner.title || `Banner ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                />
                
                {/* 图片文本内容 */}
                {(banner.title || banner.description) && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                    {banner.title && (
                      <h3 className="text-lg font-semibold">{banner.title}</h3>
                    )}
                    {banner.description && (
                      <p className="text-sm opacity-90">{banner.description}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 左右箭头 */}
      {showArrows && banners.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-10",
              "bg-black/30 text-white border-none hover:bg-black/50",
              "opacity-0 hover:opacity-100 transition-opacity"
            )}
            onClick={prevSlide}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full z-10",
              "bg-black/30 text-white border-none hover:bg-black/50",
              "opacity-0 hover:opacity-100 transition-opacity"
            )}
            onClick={nextSlide}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
      
      {/* 指示器 */}
      {showIndicators && banners.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentIndex 
                  ? "bg-white w-6" 
                  : "bg-white/50 hover:bg-white/80"
              )}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
} 