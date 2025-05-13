"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

interface SplashScreenProps {
  onComplete?: () => void;
  onFinished?: () => void;
}

export default function SplashScreen({ onComplete, onFinished }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // 设置 1.5 秒后开始淡出
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 1500)

    // 设置 2 秒后完成过场动画
    const completeTimer = setTimeout(() => {
      // 优先使用onFinished，兼容onComplete
      if (onFinished) {
        onFinished();
      } else if (onComplete) {
        onComplete();
      }
    }, 2000)

    // 清理定时器
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(completeTimer)
    }
  }, [onComplete, onFinished])

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{
        backgroundImage: "url('/kp.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        width: "100vw",
        height: "100vh"
      }}
    >
      {/* XAI FINANCE 标题 */}
      <div className="absolute top-10 left-0 right-0 text-center">
        <h1 className="text-3xl font-bold text-white shadow-lg">XAI FINANCE</h1>
      </div>
      
      {/* 底部加载进度条 */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center">
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-loadingBar"></div>
        </div>
      </div>
    </div>
  )
} 