"use client"

import { useTheme } from "next-themes"
import { BannerItem } from "./Banner"
import { cn } from "@/lib/utils"

/**
 * 生成渐变背景的临时横幅组件
 * 注意：这只是临时解决方案，最终应替换为实际图片
 */
export function generateDefaultBanners(): BannerItem[] {
  return [
    {
      imageUrl: "/hf/hf.png",
      link: "https://t.me/xai_2024chinese",
      title: "加入XAI官方社区",
      description: "与社区成员一起探讨XAI的最新动态"
    },
    {
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1500' height='400' viewBox='0 0 1500 400'%3E%3Crect width='1500' height='400' fill='%23042f2e'/%3E%3Cpath d='M0 0L1500 400M1500 0L0 400' stroke='%2310b981' stroke-width='3' stroke-opacity='0.2'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='36' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle'%3E发现新机会%3C/text%3E%3C/svg%3E",
      link: "/discover",
      title: "发现新机会",
      description: "最新上线的代币和潜力项目"
    },
    {
      imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1500' height='400' viewBox='0 0 1500 400'%3E%3Crect width='1500' height='400' fill='%23581c87'/%3E%3Cpath d='M0 0L1500 400M1500 0L0 400' stroke='%23a855f7' stroke-width='3' stroke-opacity='0.2'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='36' fill='%23ffffff' text-anchor='middle' dominant-baseline='middle'%3E参与社区讨论%3C/text%3E%3C/svg%3E",
      link: "/forum",
      title: "参与社区讨论",
      description: "与其他投资者交流加密货币投资心得"
    }
  ];
}

/**
 * 为不同主题提供不同样式的横幅
 */
export function useThemedBanners(): BannerItem[] {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  // 特定的第一个横幅（Telegram链接）
  const telegramBanner = {
    imageUrl: "/hf/hf.png",
    link: "https://t.me/xai_2024chinese",
    title: "加入XAI官方社区",
    description: "与社区成员一起探讨XAI的最新动态"
  };
  
  // 根据主题选择不同的横幅样式
  if (isDark) {
    const darkBanners = generateDefaultBanners();
    // 确保第一个是Telegram横幅
    darkBanners[0] = telegramBanner;
    return darkBanners;
  } else {
    // 浅色主题横幅
    return [
      telegramBanner,
      {
        imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1500' height='400' viewBox='0 0 1500 400'%3E%3Crect width='1500' height='400' fill='%23ecfdf5'/%3E%3Cpath d='M0 0L1500 400M1500 0L0 400' stroke='%2310b981' stroke-width='3' stroke-opacity='0.2'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='36' fill='%230f172a' text-anchor='middle' dominant-baseline='middle'%3E发现新机会%3C/text%3E%3C/svg%3E",
        link: "/discover",
        title: "发现新机会",
        description: "最新上线的代币和潜力项目"
      },
      {
        imageUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1500' height='400' viewBox='0 0 1500 400'%3E%3Crect width='1500' height='400' fill='%23faf5ff'/%3E%3Cpath d='M0 0L1500 400M1500 0L0 400' stroke='%23a855f7' stroke-width='3' stroke-opacity='0.2'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='36' fill='%230f172a' text-anchor='middle' dominant-baseline='middle'%3E参与社区讨论%3C/text%3E%3C/svg%3E",
        link: "/forum",
        title: "参与社区讨论",
        description: "与其他投资者交流加密货币投资心得"
      }
    ];
  }
} 