"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle, Info, ShieldCheck, ShieldX, CheckCircle, XCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { TokenDetails } from "@/app/lib/ave-api-service"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RiskAssessmentProps {
  tokenDetails: TokenDetails | null
  enhancedData: any
  isLoading: boolean
  isLoadingEnhanced: boolean
  darkMode: boolean
}

export default function RiskAssessment({
  tokenDetails,
  enhancedData,
  isLoading,
  isLoadingEnhanced,
  darkMode
}: RiskAssessmentProps) {
  const [showDetail, setShowDetail] = useState(false)
  
  // 获取风险评分和风险等级
  const getRiskScore = () => {
    // 从增强数据中获取风险信息
    const riskData = enhancedData?.risk || {}
    const riskScore = 
      riskData.risk_score || 
      tokenDetails?.risk_score || 
      null
      
    return riskScore
  }
  
  // 获取风险等级
  const getRiskLevel = (score: number | null) => {
    if (score === null) return null
    
    if (score <= 15) return { level: "低风险", color: "text-green-500" }
    if (score <= 50) return { level: "中等风险", color: "text-yellow-500" }
    if (score <= 75) return { level: "高风险", color: "text-orange-500" }
    return { level: "极高风险", color: "text-red-500" }
  }
  
  // 获取税率信息简化版
  const hasTax = () => {
    const buyTax = tokenDetails?.buy_tax || 0;
    const sellTax = tokenDetails?.sell_tax || 0;
    
    return (buyTax > 0 || sellTax > 0);
  }

  const riskScore = getRiskScore();
  const riskLevel = getRiskLevel(riskScore);
  const taxExists = hasTax();
  
  // 获取风险列表
  const getRiskFactors = () => {
    const riskData = enhancedData?.risk || {}
    const factors = riskData.risk_factors || []
    
    return factors
  }
  
  const riskFactors = getRiskFactors()

  return (
    <Card className={cn(
      "p-4 mb-4 overflow-hidden transition-all duration-300",
      showDetail ? "max-h-[800px]" : "max-h-[160px]",
      darkMode ? "bg-gray-800 border-gray-700" : "bg-white"
    )}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-base font-medium">安全评估</h3>
        <button 
          onClick={() => setShowDetail(!showDetail)}
          className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
        >
          {showDetail ? "收起" : "展开"}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 风险评分 */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">风险评分</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    风险评分基于合约代码、流动性、市场行为等多方面因素评估
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {isLoading || isLoadingEnhanced ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <div className="flex items-center gap-2">
              {riskScore !== null ? (
                <>
                  <p className="text-xl font-bold">{riskScore}/100</p>
                  <span className={cn(
                    "text-sm", 
                    riskLevel?.color || "text-gray-500"
                  )}>
                    {riskLevel?.level || "未知"}
                  </span>
                </>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">暂无数据</p>
              )}
            </div>
          )}
        </div>
        
        {/* 税率信息 - 简化版 */}
        <div className="space-y-1">
          <div className="flex items-center gap-1">
            <p className="text-sm text-gray-500 dark:text-gray-400">交易税费</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    代币合约是否包含交易税费
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {isLoading || isLoadingEnhanced ? (
            <Skeleton className="h-7 w-28" />
          ) : (
            <div className="flex items-center gap-2">
              {taxExists ? (
                <div className="flex items-center text-red-500">
                  <XCircle className="h-4 w-4 mr-1" />
                  <span className="font-medium">有税费</span>
                </div>
              ) : (
                <div className="flex items-center text-green-500">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span className="font-medium">无税费</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* 风险因素详情 - 只在展开时显示 */}
      {showDetail && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <h4 className="font-medium mb-2">风险因素</h4>
          
          {isLoadingEnhanced ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : riskFactors.length > 0 ? (
            <ul className="space-y-2">
              {riskFactors.map((factor: any, index: number) => (
                <li key={index} className={cn(
                  "p-2 rounded-md flex items-start gap-2",
                  factor.severity === "high" 
                    ? "bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300" 
                    : factor.severity === "medium"
                      ? "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-300"
                      : "bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300"
                )}>
                  {factor.severity === "high" ? (
                    <ShieldX className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  ) : factor.severity === "medium" ? (
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <ShieldCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{factor.name}</p>
                    <p className="text-sm opacity-90">{factor.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              暂无风险数据或尚未加载
            </p>
          )}
        </div>
      )}
    </Card>
  )
} 