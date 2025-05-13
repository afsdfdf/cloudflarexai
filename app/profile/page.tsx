"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ArrowLeft, Moon, Sun, LogOut, Settings, User, BellRing, Key, Shield, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import BottomNav from "../components/BottomNav"
import EthereumProtection from "../components/EthereumProtection"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import LogoBase64 from "../components/LogoBase64"

export default function ProfilePage() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  const { toast } = useToast()

  // 模拟用户数据
  const userInfo = {
    name: "用户1234",
    avatar: "/logo.png",
    joinDate: "2023-05-15"
  }

  // 切换主题
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  // 模拟退出登录
  const handleLogout = () => {
    toast({
      title: "退出登录",
      description: "您已成功退出登录",
    })
  }

  return (
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-[#0b101a] text-white" : "bg-white text-foreground"
    )}>
      <EthereumProtection />
      
      <div className="max-w-md mx-auto">
        {/* 用户资料卡片 */}
        <div className="p-4 pt-6">
          <Card className={cn(
            "p-6 rounded-xl", 
            isDark ? "bg-card/50 border-border/30" : "bg-card border-border/50"
          )}>
            <div className="flex items-center space-x-4">
              <div className={cn(
                "relative w-16 h-16 rounded-full overflow-hidden border-2",
                isDark ? "border-primary/30" : "border-primary/20"
              )}>
                <LogoBase64 width={64} height={64} className="w-full h-full" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{userInfo.name}</h2>
                <p className={cn(
                  "text-sm",
                  isDark ? "text-muted-foreground" : "text-muted-foreground/80"
                )}>加入时间: {userInfo.joinDate}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Button 
                variant="outline"
                className={cn(
                  "flex items-center justify-center gap-2",
                  isDark ? "bg-muted/30 hover:bg-muted/50" : "bg-muted/20 hover:bg-muted/30"
                )}
              >
                <User className="w-4 h-4" />
                <span>编辑资料</span>
              </Button>
              <Button
                variant="outline"
                className={cn(
                  "flex items-center justify-center gap-2",
                  isDark ? "bg-muted/30 hover:bg-muted/50" : "bg-muted/20 hover:bg-muted/30"
                )}
              >
                <Settings className="w-4 h-4" />
                <span>设置</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* 常用功能 */}
        <div className="p-4 pt-0">
          <h3 className={cn(
            "text-lg font-medium mb-2 px-1",
            isDark ? "text-foreground/90" : "text-foreground/80"
          )}>常用功能</h3>
          <Card className={cn(
            "rounded-xl overflow-hidden",
            isDark ? "bg-card/50 border-border/30" : "bg-card border-border/50"
          )}>
            <div className={cn(
              "p-3 flex items-center justify-between cursor-pointer",
              isDark ? "hover:bg-muted/30" : "hover:bg-muted/20"
            )}>
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                  isDark ? "bg-primary/20" : "bg-primary/10"
                )}>
                  <Shield className={cn("w-4 h-4", isDark ? "text-primary/90" : "text-primary")} />
                </div>
                <span>安全中心</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <Separator className={isDark ? "bg-border/20" : "bg-border/30"} />

            <div className={cn(
              "p-3 flex items-center justify-between cursor-pointer",
              isDark ? "hover:bg-muted/30" : "hover:bg-muted/20"
            )}>
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                  isDark ? "bg-primary/20" : "bg-primary/10"
                )}>
                  <BellRing className={cn("w-4 h-4", isDark ? "text-primary/90" : "text-primary")} />
                </div>
                <span>通知设置</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <Separator className={isDark ? "bg-border/20" : "bg-border/30"} />

            <div className={cn(
              "p-3 flex items-center justify-between cursor-pointer",
              isDark ? "hover:bg-muted/30" : "hover:bg-muted/20"
            )}>
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                  isDark ? "bg-primary/20" : "bg-primary/10"
                )}>
                  <Key className={cn("w-4 h-4", isDark ? "text-primary/90" : "text-primary")} />
                </div>
                <span>密码修改</span>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </div>

        {/* 应用设置 */}
        <div className="p-4 pt-0">
          <h3 className={cn(
            "text-lg font-medium mb-2 px-1",
            isDark ? "text-foreground/90" : "text-foreground/80"
          )}>应用设置</h3>
          <Card className={cn(
            "rounded-xl overflow-hidden",
            isDark ? "bg-card/50 border-border/30" : "bg-card border-border/50"
          )}>
            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                  isDark ? "bg-primary/20" : "bg-primary/10"
                )}>
                  <Sun className={cn("w-4 h-4", isDark ? "text-primary/90" : "text-primary")} />
                </div>
                <span>深色模式</span>
              </div>
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
              />
            </div>
            
            <Separator className={isDark ? "bg-border/20" : "bg-border/30"} />

            <div className="p-3 flex items-center justify-between">
              <div className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center mr-3",
                  isDark ? "bg-primary/20" : "bg-primary/10"
                )}>
                  <BellRing className={cn("w-4 h-4", isDark ? "text-primary/90" : "text-primary")} />
                </div>
                <span>推送通知</span>
              </div>
              <Switch defaultChecked />
            </div>
          </Card>
        </div>

        {/* 退出登录 */}
        <div className="p-4 pt-0">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </div>
      </div>
      
      {/* 底部导航 */}
      <BottomNav darkMode={isDark} />
      <Toaster />
    </div>
  );
} 