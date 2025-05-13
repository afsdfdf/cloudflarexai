"use client"

import { useRef, useEffect } from "react"

type ReferrerPolicy = 
  | "no-referrer" 
  | "no-referrer-when-downgrade" 
  | "origin" 
  | "origin-when-cross-origin" 
  | "same-origin" 
  | "strict-origin" 
  | "strict-origin-when-cross-origin" 
  | "unsafe-url"

interface SafeIframeProps {
  src: string
  title: string
  className?: string
  height?: string | number
  width?: string | number
  allowFullScreen?: boolean
  sandbox?: string
  onLoad?: () => void
  referrerPolicy?: ReferrerPolicy
  loading?: "eager" | "lazy"
  style?: React.CSSProperties
}

/**
 * 安全的iframe组件，防止以太坊对象冲突
 * 
 * 这个组件拦截可能导致与MetaMask等钱包冲突的iframe消息
 * 还提供额外的安全设置，如沙箱、引用策略等
 */
export default function SafeIframe({
  src,
  title,
  className = "",
  height = "100%",
  width = "100%",
  allowFullScreen = false,
  sandbox = "allow-scripts allow-same-origin allow-popups allow-forms",
  referrerPolicy = "no-referrer",
  loading = "lazy",
  style,
  onLoad,
}: SafeIframeProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    
    // 添加消息事件监听器，过滤可能导致冲突的消息
    const handleMessage = (event: MessageEvent) => {
      // 如果是从iframe发出的消息，并且包含ethereum相关内容，则阻止传播
      if (iframe.contentWindow === event.source && 
          event.data && 
          typeof event.data === 'object' && 
          (event.data.type === 'ethereum' || 
           event.data.ethereum || 
           (event.data.method && typeof event.data.method === 'string' && event.data.method.includes('eth_')))) {
        event.stopImmediatePropagation()
        return false
      }
      return true
    }
    
    // 捕获阶段注册事件处理，确保我们可以在其他处理程序之前拦截
    window.addEventListener('message', handleMessage, true)
    
    return () => {
      window.removeEventListener('message', handleMessage, true)
    }
  }, [])
  
  // 处理iframe加载完成后的回调
  const handleLoad = () => {
    if (onLoad) {
      onLoad()
    }
    
    // 尝试隔离iframe中的以太坊对象
    try {
      const iframe = iframeRef.current
      if (iframe && iframe.contentWindow) {
        // 这里可以添加额外的隔离代码
      }
    } catch (error) {
      // 忽略任何错误，确保不会影响用户体验
    }
  }
  
  return (
    <iframe
      ref={iframeRef}
      src={src}
      title={title}
      className={className}
      height={height}
      width={width}
      sandbox={sandbox}
      referrerPolicy={referrerPolicy}
      loading={loading}
      style={style}
      allowFullScreen={allowFullScreen}
      onLoad={handleLoad}
    />
  )
} 