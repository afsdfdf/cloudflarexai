"use client"

import { useState, useEffect } from "react"
import { TokenDetails } from "@/app/lib/ave-api-service"
import { Activity } from "lucide-react"

import BasicInfo from "@/app/components/TokenDetailsCard/BasicInfo"
import PriceStats from "@/app/components/TokenDetailsCard/PriceStats"
import SocialLinks from "@/app/components/TokenDetailsCard/SocialLinks"
import RiskAssessment from "@/app/components/TokenDetailsCard/RiskAssessment"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TokenDetailsCardProps {
  tokenDetails: TokenDetails | null
  isLoading: boolean
  darkMode: boolean
  chain: string
  address: string
}

export default function TokenDetailsCard({ 
  tokenDetails, 
  isLoading, 
  darkMode,
  chain,
  address
}: TokenDetailsCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [enhancedData, setEnhancedData] = useState<any>(null)
  const [isLoadingEnhanced, setIsLoadingEnhanced] = useState(false)
  
  // 加载状态
  const [loadingStates, setLoadingStates] = useState({
    tokenDetails: false,
    transactions: false,
    holders: false,
    risk: false
  });

  // 增强数据请求成功标志
  const [dataLoadingSuccesses, setDataLoadingSuccesses] = useState({
    tokenDetails: false,
    transactions: false,
    holders: false,
    risk: false
  });
  
  // 确保即使请求失败也不会无限重试
  const [apiRequestAttempted, setApiRequestAttempted] = useState(false);

  // 用于实现延迟的工具函数
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 按优先级获取所有相关数据的函数
  const fetchAllTokenData = async () => {
    if (!address || !chain || apiRequestAttempted) return;
    
    setApiRequestAttempted(true);
    setIsLoadingEnhanced(true);
    
    try {
      // 并行请求所有数据，而不是串行请求
      setLoadingStates(prev => ({ 
        ...prev, 
        tokenDetails: true,
        transactions: true,
        holders: true
      }));
      
      // 构建所有请求
      const detailsPromise = fetch(`/api/token-details?address=${address}&chain=${chain}`);
      const txPromise = fetch(`/api/token-transactions?address=${address}&chain=${chain}&limit=20`);
      const holdersPromise = fetch(`/api/token-holders?address=${address}&chain=${chain}`);
      
      // 并行执行所有请求
      const [detailsResponse, txResponse, holdersResponse] = 
        await Promise.all([detailsPromise, txPromise, holdersPromise]);
      
      // 处理详情响应
      try {
        const detailsData = await detailsResponse.json();
        if (detailsData.success) {
          setEnhancedData(detailsData);
          setDataLoadingSuccesses(prev => ({ ...prev, tokenDetails: true }));
        }
      } catch (error) {
        console.error("Error processing token details:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, tokenDetails: false }));
      }
      
      // 处理交易响应
      try {
        const txData = await txResponse.json();
        if (txData.success) {
          setEnhancedData((prevData: any) => ({
            ...prevData,
            transactions: txData.transactions || []
          }));
          setDataLoadingSuccesses(prev => ({ ...prev, transactions: true }));
        }
      } catch (error) {
        console.error("Error processing transactions:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, transactions: false }));
      }
      
      // 处理持币人响应
      try {
        const holdersData = await holdersResponse.json();
        if (holdersData.success) {
          setEnhancedData((prevData: any) => ({
            ...prevData,
            holders: holdersData.holders || []
          }));
          setDataLoadingSuccesses(prev => ({ ...prev, holders: true }));
        }
      } catch (error) {
        console.error("Error processing holders:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, holders: false }));
      }
      
    } catch (error) {
      console.error("Error in parallel data fetching:", error);
    } finally {
      setIsLoadingEnhanced(false);
    }
  };

  // 重置所有状态，允许重新获取数据
  const resetAndRetry = () => {
    setApiRequestAttempted(false);
    setDataLoadingSuccesses({
      tokenDetails: false,
      transactions: false,
      holders: false,
      risk: false
    });
    setEnhancedData(null);
    fetchAllTokenData();
  };

  // 当组件展开时获取增强数据
  useEffect(() => {
    if (expanded && !enhancedData && !apiRequestAttempted) {
      fetchAllTokenData();
    }
  }, [expanded, address, chain, enhancedData, apiRequestAttempted]);

  // 渲染加载状态 - 使用平滑的过渡动画
  const renderLoadingStatus = () => {
    if (!expanded) return null;
    
    const anyLoading = Object.values(loadingStates).some(state => state);
    
    if (!anyLoading) return null;
    
    return (
      <div className={cn(
        "mt-4 transition-opacity duration-300 ease-in-out",
        darkMode ? "text-gray-400" : "text-gray-500"
      )}>
        <p className="flex items-center gap-2">
          <span className={cn(
            "inline-block h-2 w-2 rounded-full animate-pulse",
            darkMode ? "bg-blue-700" : "bg-blue-400"
          )}></span>
          <span className="text-sm">
            {loadingStates.tokenDetails && "加载基本信息..."}
            {loadingStates.transactions && "加载交易记录..."}
            {loadingStates.holders && "加载持币数据..."}
          </span>
        </p>
      </div>
    );
  };

  // 渲染重试按钮
  const renderRetryButton = () => {
    if (!expanded) return null;
    if (isLoadingEnhanced) return null;
    
    const anySuccess = Object.values(dataLoadingSuccesses).some(success => success);
    const allSuccess = Object.values(dataLoadingSuccesses).every(success => success);
    
    if (allSuccess) return null;
    
    if (apiRequestAttempted && !anySuccess) {
      return (
        <div className="mt-4 text-center">
          <p className={cn(
            "text-sm mb-2",
            darkMode ? "text-red-400" : "text-red-500"
          )}>数据加载失败</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={resetAndRetry}
            className={cn(
              darkMode ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-100 hover:bg-gray-200"
            )}
          >
            重试
          </Button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={cn(
      "rounded-lg overflow-hidden transition-all",
      darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900",
      "border border-gray-200 dark:border-gray-800",
    )}>
      <div className="p-4">
        <BasicInfo 
          tokenDetails={tokenDetails}
          isLoading={isLoading}
          darkMode={darkMode}
          chain={chain}
          address={address}
        />
        
        <PriceStats
          tokenDetails={tokenDetails}
          isLoading={isLoading}
          darkMode={darkMode}
        />
        
        <SocialLinks
          tokenDetails={tokenDetails}
          isLoading={isLoading}
          darkMode={darkMode}
        />
        
        {/* 收起/展开按钮 */}
        <div className="flex justify-center mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs w-full"
          >
            {expanded ? "收起详情" : "展开详情"}
          </Button>
        </div>
        
        {/* 展开后的详情部分 */}
        {expanded && (
          <div className="mt-4">
            <RiskAssessment
              tokenDetails={tokenDetails}
              enhancedData={enhancedData}
              isLoading={isLoading}
              isLoadingEnhanced={isLoadingEnhanced}
              darkMode={darkMode}
            />
            
            {renderLoadingStatus()}
            {renderRetryButton()}
          </div>
        )}
      </div>
    </div>
  )
} 