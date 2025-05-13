"use client"

import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart } from "lucide-react"
import { cn } from "@/lib/utils"
import { getTokenTopHolders, getTokenRiskReport } from "@/app/lib/ave-api-service"
import { useRouter } from "next/navigation"
import HoldersList from './HoldersList'
import RiskReport from '@/app/components/TokenTransactions/RiskReport'

interface TokenTransactionsProps {
  tokenAddress: string
  chain: string
  darkMode: boolean
}

export default function TokenTransactions({ 
  tokenAddress, 
  chain,
  darkMode 
}: TokenTransactionsProps) {
  const router = useRouter()
  const [holders, setHolders] = useState<any[]>([])
  const [riskReport, setRiskReport] = useState<any>(null)
  const [isLoadingHolders, setIsLoadingHolders] = useState(false)
  const [isLoadingRisk, setIsLoadingRisk] = useState(false)
  const [activeTab, setActiveTab] = useState("holders")

  // 导航到K线图页面
  const navigateToKline = () => {
    router.push(`/kline?address=${tokenAddress}&chain=${chain}`)
  }

  // 加载持币排名数据
  const loadHolders = async (retry = false) => {
    if (!tokenAddress || !chain) return;
    
    if (retry) {
      console.log('正在重试加载持币排名...');
    }
    
    setIsLoadingHolders(true);
    try {
      console.log(`正在加载持币排名: tokenAddress=${tokenAddress}, chain=${chain}`);
      
      const data = await getTokenTopHolders(tokenAddress, chain);
      console.log('API返回的持币数据:', data ? `长度 ${Array.isArray(data) ? data.length : '非数组'}` : 'null');
      
      // 确保data是数组
      if (!Array.isArray(data)) {
        console.error("API返回的持币数据不是数组:", data);
        setHolders([]);
        return;
      }
      
      setHolders(data);
    } catch (error) {
      console.error("加载持币排名失败:", error);
      
      // 如果是第一次失败，尝试重试一次
      if (!retry) {
        console.log("尝试重新加载持币排名...");
        setTimeout(() => loadHolders(true), 2000);
        return;
      }
      
      setHolders([]);
    } finally {
      setIsLoadingHolders(false);
    }
  };

  // 加载风险报告
  const loadRiskReport = async () => {
    if (!tokenAddress || !chain) return;
    
    setIsLoadingRisk(true);
    try {
      console.log(`正在加载风险报告: tokenAddress=${tokenAddress}, chain=${chain}`);
      
      const data = await getTokenRiskReport(tokenAddress, chain);
      console.log('API返回的风险数据:', data ? `字段数 ${Object.keys(data || {}).length}` : 'null');
      
      if (data) {
        console.log('风险报告字段列表:', Object.keys(data));
        // 打印一些关键风险指标
        if (data.risk_score) console.log('风险评分:', data.risk_score);
        if (data.buy_tax) console.log('买入税率:', data.buy_tax);
        if (data.sell_tax) console.log('卖出税率:', data.sell_tax);
        if (data.is_honeypot) console.log('是否蜜罐:', data.is_honeypot);
        if (data.risk_reasons) console.log('风险原因:', data.risk_reasons);
      } else {
        console.error("API返回的风险数据为空");
        setRiskReport({});
        return;
      }
      
      setRiskReport(data);
    } catch (error) {
      console.error("加载风险报告失败:", error);
      setRiskReport({});
    } finally {
      setIsLoadingRisk(false);
    }
  };

  // 当地址或链改变时，重新加载数据
  useEffect(() => {
    if (tokenAddress && chain) {
      // 不自动加载持币排名，改为手动加载
      // loadHolders();
    }
  }, [tokenAddress, chain]);

  // 当切换到不同标签页时，按需加载数据
  useEffect(() => {
    if (activeTab === "holders") {
      // 不自动加载持币排名，改为手动加载
      // loadHolders();
    } 
    // 移除风险自动加载逻辑，改为按钮触发
  }, [activeTab]);

  return (
    <Card className={cn(
      "w-full overflow-hidden border mt-2",
      darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
    )}>
      <Tabs 
        defaultValue="holders" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <div className={cn(
          "border-b",
          darkMode ? "border-gray-800" : "border-gray-200"
        )}>
          <div className="flex justify-between items-center px-3 py-2">
            <TabsList className={cn(
              "rounded-none bg-transparent border-b",
              darkMode ? "border-gray-800" : "border-gray-200"
            )}>
              <TabsTrigger
                value="holders"
                className={cn(
                  "text-xs py-2 data-[state=active]:border-b-2 data-[state=active]:rounded-none",
                  darkMode ? "data-[state=active]:border-blue-500 text-gray-300" : "data-[state=active]:border-blue-600 text-gray-700"
                )}
              >
                持币排名
              </TabsTrigger>
              <TabsTrigger
                value="risk"
                className={cn(
                  "text-xs py-2 data-[state=active]:border-b-2 data-[state=active]:rounded-none",
                  darkMode ? "data-[state=active]:border-blue-500 text-gray-300" : "data-[state=active]:border-blue-600 text-gray-700"
                )}
              >
                风险检测
              </TabsTrigger>
            </TabsList>
            
            <Button
              size="sm"
              variant="outline"
              className={cn(
                "h-8 px-2 gap-1",
                darkMode ? "bg-blue-900/30 hover:bg-blue-800/40 text-blue-400" : "bg-blue-50 hover:bg-blue-100 text-blue-700"
              )}
              onClick={navigateToKline}
            >
              <LineChart className="h-4 w-4" />
              <span>详细K线图</span>
            </Button>
          </div>
        </div>

        {/* 持币排名标签页 */}
        <TabsContent value="holders" className="p-3">
          <HoldersList 
            holders={holders} 
            isLoading={isLoadingHolders} 
            darkMode={darkMode} 
            chain={chain}
            onRefresh={loadHolders}
          />
        </TabsContent>

        {/* 风险检测标签页 */}
        <TabsContent value="risk" className="p-3">
          <RiskReport 
            riskReport={riskReport}
            isLoading={isLoadingRisk}
            darkMode={darkMode}
            onLoadRiskReport={loadRiskReport}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
} 