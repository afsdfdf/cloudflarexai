"use client"

import { useState } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle, Loader2, ChevronDown, ChevronUp, Shield, ShieldAlert, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { getExplorerUrl } from "@/app/components/utils/formatting"

interface RiskReportProps {
  riskReport: any
  isLoading: boolean
  darkMode: boolean
  onLoadRiskReport: () => void
}

export default function RiskReport({
  riskReport,
  isLoading,
  darkMode,
  onLoadRiskReport
}: RiskReportProps) {
  const [showAllFields, setShowAllFields] = useState(false)
  const [expandedDetails, setExpandedDetails] = useState<string | null>(null)
  
  // 切换展开/收起详情
  const toggleDetailExpand = (key: string) => {
    if (expandedDetails === key) {
      setExpandedDetails(null);
    } else {
      setExpandedDetails(key);
    }
  };
  
  // 获取风险等级
  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: "高风险", color: "text-red-500", bg: darkMode ? "bg-red-900/20" : "bg-red-50" };
    if (score >= 50) return { level: "中风险", color: "text-yellow-500", bg: darkMode ? "bg-yellow-900/20" : "bg-yellow-50" };
    if (score >= 30) return { level: "低风险", color: "text-blue-500", bg: darkMode ? "bg-blue-900/20" : "bg-blue-50" };
    return { level: "安全", color: "text-green-500", bg: darkMode ? "bg-green-900/20" : "bg-green-50" };
  };
  
  // 找出除了已展示字段外的其他字段
  const getAdditionalFields = () => {
    if (!riskReport) return [];
    
    // 已经显示的主要字段
    const displayedFields = [
      'token_name', 'token_symbol', 'risk_score', 'is_open_source',
      'buy_tax', 'sell_tax', 'is_honeypot', 'hidden_owner',
      'risk_reasons', 'update_time', 'creator_address', 'creator_percent',
      'creator_balance', 'owner', 'owner_balance', 'owner_percent',
      'has_mint_method', 'has_black_method', 'has_white_method', 
      'token', 'chain', 'decimal', 'status', 'msg', 'data_type'
    ];
    
    // 过滤掉null, 空数组和空对象值
    return Object.entries(riskReport)
      .filter(([key, value]) => {
        if (!displayedFields.includes(key)) {
          // 过滤掉空值
          if (value === null || value === undefined) return false;
          // 过滤掉空数组
          if (Array.isArray(value) && value.length === 0) return false;
          // 过滤掉空对象
          if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
          return true;
        }
        return false;
      })
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
  };
  
  // 格式化字段名称为中文
  const getChineseFieldName = (key: string): string => {
    const fieldMap: Record<string, string> = {
      'analysis_big_wallet': '大额钱包分析',
      'analysis_creator_gt_5percent': '创建者持有超5%',
      'analysis_lp_creator_gt_5percent': '创建者LP持有超5%',
      'analysis_lp_current_adequate': '当前LP充足',
      'analysis_lp_current_volume': '当前LP数量',
      'analysis_scam_wallet': '诈骗钱包',
      'anti_whale_modifiable': '反鲸鱼可修改',
      'approve_gas': '授权Gas费',
      'big_lp_without_any_lock': '大额LP无锁定',
      'burn_amount': '销毁数量',
      'buy_gas': '买入Gas费',
      'buy_tax': '买入税率',
      'can_take_back_ownership': '可收回所有权',
      'cannot_buy': '无法买入',
      'cannot_sell_all': '无法全部卖出',
      'creator_tx': '创建交易',
      'creator_address': '创建者地址',
      'creator_balance': '创建者余额',
      'creator_percent': '创建者比例',
      'dex': '交易所信息',
      'err_code': '错误代码',
      'err_msg': '错误信息',
      'external_call': '外部调用',
      'has_code': '有合约代码',
      'has_malicious_code': '含恶意代码',
      'has_mint_method': '含铸币功能',
      'has_black_method': '含黑名单',
      'has_white_method': '含白名单',
      'has_owner_removed_risk': '所有者移除风险',
      'holder_analysis': '持有人分析',
      'holders': '持有人数量',
      'honeypot_with_same_creator': '同创建者蜜罐',
      'is_anti_whale': '反鲸鱼机制',
      'is_honeypot': '蜜罐合约',
      'is_in_dex': '在交易所上线',
      'is_open_source': '开源代码',
      'is_proxy': '代理合约',
      'launchpad_token': '发射台代币',
      'lock_amount': '锁仓数量',
      'owner': '所有者',
      'owner_balance': '所有者余额',
      'owner_change_balance': '所有者余额变化',
      'owner_percent': '所有者比例',
      'pair_holders': '交易对持有人',
      'pair_holders_rank': '交易对持有排名',
      'pair_lock_percent': '交易对锁定比例',
      'pair_total': '交易对总量',
      'personal_slippage_modifiable': '个人滑点可修改',
      'platform': '平台',
      'previous_owner': '前任所有者',
      'query_count': '查询次数',
      'risk_score': '风险评分',
      'selfdestruct': '自毁功能',
      'sell_gas': '卖出Gas费',
      'sell_tax': '卖出税率',
      'slippage_modifiable': '滑点可修改',
      'token': '代币地址',
      'token_holders_rank': '代币持有排名',
      'token_lock_percent': '代币锁定比例',
      'token_name': '代币名称',
      'token_symbol': '代币符号',
      'total': '总供应量',
      'trading_cooldown': '交易冷却期',
      'transfer_pausable': '转账可暂停',
      'transfer_tax': '转账税',
      'version': '版本',
      'vote_against': '反对票',
      'vote_support': '支持票',
    };
    
    return fieldMap[key] || key.replace(/_/g, ' ');
  };

  // 格式化布尔值或0/1值为是/否
  const formatBooleanValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (value === true || value === 1 || value === "1" || value === "yes" || value === "true") return "是";
    if (value === false || value === 0 || value === "0" || value === "no" || value === "false") return "否";
    return String(value);
  };

  // 格式化字段值为可读文本
  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    
    // 处理布尔值和0/1值
    if (typeof value === "boolean" || value === 1 || value === 0 || value === "1" || value === "0") {
      return formatBooleanValue(value);
    }
    
    // 处理数组
    if (Array.isArray(value)) {
      if (value.length === 0) return "-";
      if (typeof value[0] === 'object') {
        return `[${value.length}项数据]`;
      }
      return value.join(", ");
    }
    
    // 处理对象
    if (typeof value === "object") {
      if (Object.keys(value).length === 0) return "-";
      return `{${Object.keys(value).length}个字段}`;
    }
    
    // 处理数字
    if (!isNaN(Number(value)) && typeof value !== 'string') {
      // 如果是很小的数字，使用科学计数法
      if (Math.abs(Number(value)) < 0.00001 && Number(value) !== 0) {
        return Number(value).toExponential(4);
      }
      // 如果是大数字并且有小数，保留4位小数
      if (Math.abs(Number(value)) >= 1000 && String(value).includes('.')) {
        return Number(Number(value).toFixed(4)).toLocaleString('zh-CN');
      }
      // 使用千分位格式化
      return Number(value).toLocaleString('zh-CN');
    }
    
    // 默认返回字符串
    return String(value);
  };

  // 渲染详细信息
  const renderDetailView = (key: string, data: any) => {
    if (Array.isArray(data)) {
      return (
        <div className={cn(
          "mt-2 p-2 rounded text-xs",
          darkMode ? "bg-gray-900" : "bg-gray-50"
        )}>
          {data.map((item, index) => {
            if (typeof item === 'object') {
              return (
                <div key={index} className={cn(
                  "mb-2 p-2 border rounded",
                  darkMode ? "border-gray-700" : "border-gray-200"
                )}>
                  {Object.entries(item).map(([itemKey, itemValue]) => (
                    <div key={itemKey} className="flex justify-between py-1 border-b border-dashed last:border-0">
                      <span className="font-medium">{getChineseFieldName(itemKey)}:</span>
                      <span className="font-mono">
                        {typeof itemValue === 'object' 
                          ? JSON.stringify(itemValue) 
                          : formatBooleanValue(itemValue)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            } else {
              return <div key={index}>{formatBooleanValue(item)}</div>;
            }
          })}
        </div>
      );
    }
    
    if (typeof data === 'object') {
      return (
        <div className={cn(
          "mt-2 p-2 rounded text-xs",
          darkMode ? "bg-gray-900" : "bg-gray-50"
        )}>
          {Object.entries(data).map(([dataKey, dataValue]) => (
            <div key={dataKey} className="flex justify-between py-1 border-b border-dashed last:border-0">
              <span className="font-medium">{getChineseFieldName(dataKey)}:</span>
              <span className="font-mono">{
                typeof dataValue === 'object'
                  ? JSON.stringify(dataValue)
                  : formatBooleanValue(dataValue)
              }</span>
            </div>
          ))}
        </div>
      );
    }
    
    return null;
  };

  // 获取风险评分对应的色阶
  const getRiskScoreGradient = (score: number) => {
    if (score >= 80) return darkMode ? "from-red-900 to-red-700" : "from-red-600 to-red-400";
    if (score >= 60) return darkMode ? "from-orange-900 to-orange-700" : "from-orange-600 to-orange-400";
    if (score >= 40) return darkMode ? "from-yellow-900 to-yellow-700" : "from-yellow-600 to-yellow-400";
    if (score >= 20) return darkMode ? "from-blue-900 to-blue-700" : "from-blue-600 to-blue-400";
    return darkMode ? "from-green-900 to-green-700" : "from-green-600 to-green-400";
  };
  
  // 渲染风险报告
  const renderRiskReport = () => {
    if (isLoading) {
      return (
        <div className="p-4 space-y-4">
          <Skeleton className={cn(
            "h-4 w-32 mb-2", 
            darkMode ? "bg-gray-800" : "bg-gray-200"
          )} />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className={cn(
                "h-16 w-full", 
                darkMode ? "bg-gray-800" : "bg-gray-200"
              )} />
            ))}
          </div>
          <Skeleton className={cn(
            "h-4 w-32 mb-2", 
            darkMode ? "bg-gray-800" : "bg-gray-200"
          )} />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className={cn(
                "h-16 w-full", 
                darkMode ? "bg-gray-800" : "bg-gray-200"
              )} />
            ))}
          </div>
        </div>
      );
    }

    if (!riskReport || Object.keys(riskReport).length === 0) {
      return (
        <div className="text-center p-8">
          <AlertCircle className={cn(
            "w-12 h-12 mx-auto mb-4",
            darkMode ? "text-gray-600" : "text-gray-400"
          )} />
          <p className={cn(
            "mb-6",
            darkMode ? "text-gray-400" : "text-gray-600"
          )}>点击按钮检测代币风险</p>
          <Button 
            size="lg" 
            className={cn(
              "px-6 py-4 transition-all",
              darkMode ? 
                "bg-blue-700 hover:bg-blue-600 text-white" : 
                "bg-blue-600 hover:bg-blue-500 text-white"
            )}
            onClick={onLoadRiskReport} 
          >
            开始风险检测
          </Button>
        </div>
      );
    }

    const additionalFields = getAdditionalFields();
    const riskScore = typeof riskReport.risk_score === 'number' ? riskReport.risk_score : parseInt(riskReport.risk_score || '0');
    const riskLevel = getRiskLevel(riskScore);
    const scoreGradient = getRiskScoreGradient(riskScore);
    
    // 检查关键风险指标
    const isRisky = riskScore >= 50 || 
                    riskReport.is_honeypot === 1 || 
                    riskReport.hidden_owner === "1" || 
                    riskReport.hidden_owner === 1;

    // 是否有DEX信息
    const hasDexInfo = Array.isArray(riskReport.dex) && riskReport.dex.length > 0;

    return (
      <div className="p-4">
        {/* 风险评分卡片 */}
        <div className={cn(
          "mb-4 rounded-md p-4 flex flex-col items-center justify-center",
          riskLevel.bg
        )}>
          <div className="flex items-center gap-2 mb-1">
            {riskScore >= 50 ? (
              <ShieldAlert className={cn("h-5 w-5", riskLevel.color)} />
            ) : (
              <Shield className={cn("h-5 w-5", riskLevel.color)} />
            )}
            <h3 className={cn("text-sm font-medium", riskLevel.color)}>
              {riskLevel.level}
            </h3>
          </div>
          
          <div className="w-full max-w-[140px] h-[140px] relative flex items-center justify-center my-2">
            <div className={cn(
              "w-full h-full rounded-full bg-gradient-to-br opacity-20",
              scoreGradient
            )}></div>
            <div className={cn(
              "absolute top-0 left-0 w-full h-full rounded-full bg-gradient-to-br opacity-30",
              scoreGradient
            )} style={{ clipPath: `inset(0 ${100 - riskScore}% 0 0)` }}></div>
            <div className="absolute flex flex-col items-center">
              <span className={cn("text-4xl font-bold", riskLevel.color)}>
                {riskScore}
              </span>
              <span className="text-xs text-muted-foreground">风险评分</span>
            </div>
          </div>
          
          {isRisky && (
            <div className={cn(
              "mt-2 text-xs rounded-full px-3 py-1 flex items-center gap-1",
              darkMode ? "bg-red-900/40 text-red-300" : "bg-red-100 text-red-700"
            )}>
              <AlertTriangle className="h-3 w-3" />
              <span>建议谨慎交易此代币</span>
            </div>
          )}
        </div>
        
        {/* 基本信息 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">基本信息</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">代币名称</div>
              <div className="text-xs">{riskReport.token_name || "未知"}</div>
            </div>
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">代币符号</div>
              <div className="text-xs">{riskReport.token_symbol || "未知"}</div>
            </div>
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">合约地址</div>
              <div className="text-xs font-mono flex items-center gap-1">
                <span className="truncate">{(riskReport.token || '').substring(0, 10)}...</span>
                {riskReport.token && riskReport.chain && (
                  <a 
                    href={getExplorerUrl(riskReport.token, riskReport.chain)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">是否开源</div>
              <div className={cn(
                "text-xs font-medium flex items-center gap-1",
                riskReport.is_open_source === "1" || riskReport.is_open_source === 1 
                  ? "text-green-500" 
                  : "text-red-500"
              )}>
                {riskReport.is_open_source === "1" || riskReport.is_open_source === 1 ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>是</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>否</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* 风险检测 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">安全检测</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">买入税</div>
              <div className={cn(
                "text-xs font-medium",
                parseFloat(riskReport.buy_tax || '0') > 10 ? "text-red-500" : 
                parseFloat(riskReport.buy_tax || '0') > 5 ? "text-yellow-500" : "text-green-500" 
              )}>
                {riskReport.buy_tax || "0"}%
              </div>
            </div>
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">卖出税</div>
              <div className={cn(
                "text-xs font-medium",
                parseFloat(riskReport.sell_tax || '0') > 10 ? "text-red-500" : 
                parseFloat(riskReport.sell_tax || '0') > 5 ? "text-yellow-500" : "text-green-500"
              )}>
                {riskReport.sell_tax || "0"}%
              </div>
            </div>
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">是否蜜罐</div>
              <div className={cn(
                "text-xs font-medium flex items-center gap-1",
                riskReport.is_honeypot === 1 ? "text-red-500" : 
                riskReport.is_honeypot === 0 ? "text-green-500" : "text-gray-500"
              )}>
                {riskReport.is_honeypot === 1 ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    <span>是</span>
                  </>
                ) : riskReport.is_honeypot === 0 ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>否</span>
                  </>
                ) : (
                  "未检测"
                )}
              </div>
            </div>
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">隐藏所有者</div>
              <div className={cn(
                "text-xs font-medium flex items-center gap-1",
                riskReport.hidden_owner === "1" || riskReport.hidden_owner === 1 ? "text-red-500" : "text-green-500"
              )}>
                {riskReport.hidden_owner === "1" || riskReport.hidden_owner === 1 ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    <span>是</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>否</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 扩展检测 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">扩展检测</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">铸币功能</div>
              <div className={cn(
                "text-xs font-medium flex items-center gap-1",
                riskReport.has_mint_method === 1 ? "text-red-500" : "text-green-500"
              )}>
                {riskReport.has_mint_method === 1 ? (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>有</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>无</span>
                  </>
                )}
              </div>
            </div>
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">黑名单功能</div>
              <div className={cn(
                "text-xs font-medium flex items-center gap-1",
                riskReport.has_black_method === 1 ? "text-yellow-500" : "text-green-500"
              )}>
                {riskReport.has_black_method === 1 ? (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>有</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>无</span>
                  </>
                )}
              </div>
            </div>
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">可暂停交易</div>
              <div className={cn(
                "text-xs font-medium flex items-center gap-1",
                riskReport.transfer_pausable === "1" || riskReport.transfer_pausable === 1 ? "text-red-500" : "text-green-500"
              )}>
                {riskReport.transfer_pausable === "1" || riskReport.transfer_pausable === 1 ? (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    <span>是</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>否</span>
                  </>
                )}
              </div>
            </div>
            <div className={cn(
              "p-2 rounded",
              darkMode ? "bg-gray-800" : "bg-gray-100"
            )}>
              <div className="text-[10px] text-muted-foreground">自毁功能</div>
              <div className={cn(
                "text-xs font-medium flex items-center gap-1",
                riskReport.selfdestruct === "1" || riskReport.selfdestruct === 1 ? "text-red-500" : "text-green-500"
              )}>
                {riskReport.selfdestruct === "1" || riskReport.selfdestruct === 1 ? (
                  <>
                    <AlertTriangle className="h-3 w-3" />
                    <span>有</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    <span>无</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 创建者信息 */}
        {riskReport.creator_address && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">创建者信息</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className={cn(
                "p-2 rounded",
                darkMode ? "bg-gray-800" : "bg-gray-100"
              )}>
                <div className="text-[10px] text-muted-foreground">创建者地址</div>
                <div className="text-xs font-mono flex items-center justify-between">
                  <span className="truncate">{riskReport.creator_address}</span>
                  {riskReport.creator_address && riskReport.chain && (
                    <a 
                      href={getExplorerUrl(riskReport.creator_address, riskReport.chain)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-600 ml-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
              {riskReport.creator_percent && (
                <div className={cn(
                  "p-2 rounded",
                  darkMode ? "bg-gray-800" : "bg-gray-100"
                )}>
                  <div className="text-[10px] text-muted-foreground">创建者持有比例</div>
                  <div className="text-xs flex justify-between items-center">
                    <div className={cn(
                      "font-medium",
                      parseFloat(riskReport.creator_percent) > 20 ? "text-red-500" : 
                      parseFloat(riskReport.creator_percent) > 10 ? "text-yellow-500" : "text-green-500"
                    )}>
                      {riskReport.creator_percent}%
                    </div>
                    {riskReport.creator_balance && (
                      <div className="text-xs text-muted-foreground">
                        {riskReport.creator_balance} 枚
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 流动性信息 */}
        {hasDexInfo && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">流动性信息</h3>
            <div className="space-y-2">
              {riskReport.dex.map((dexInfo: any, index: number) => (
                <div 
                  key={index}
                  className={cn(
                    "p-2 rounded border",
                    darkMode ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] text-muted-foreground">交易所</div>
                      <div className="text-xs font-medium">
                        {dexInfo.amm ? dexInfo.amm.toUpperCase() : "未知"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-muted-foreground">流动性池</div>
                      <div className="text-xs overflow-hidden text-ellipsis">
                        {dexInfo.name ? dexInfo.name : "未知"}
                      </div>
                    </div>
                    {dexInfo.liquidity && (
                      <div>
                        <div className="text-[10px] text-muted-foreground">流动性</div>
                        <div className="text-xs font-medium">
                          {parseFloat(dexInfo.liquidity).toFixed(4)}
                        </div>
                      </div>
                    )}
                    {dexInfo.pair && (
                      <div>
                        <div className="text-[10px] text-muted-foreground">交易对地址</div>
                        <div className="text-xs font-mono flex items-center">
                          <span className="truncate">{dexInfo.pair.substring(0, 6)}...</span>
                          {riskReport.chain && (
                            <a 
                              href={getExplorerUrl(dexInfo.pair, riskReport.chain)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-blue-500 hover:text-blue-600"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* 锁定信息 */}
            {riskReport.pair_lock_percent !== undefined && (
              <div className="mt-2 flex items-center gap-2">
                <div className={cn(
                  "text-xs rounded-full px-3 py-1",
                  parseFloat(riskReport.pair_lock_percent) > 80
                    ? darkMode ? "bg-green-900/20 text-green-400" : "bg-green-100 text-green-700"
                    : parseFloat(riskReport.pair_lock_percent) > 50
                    ? darkMode ? "bg-blue-900/20 text-blue-400" : "bg-blue-100 text-blue-700"
                    : darkMode ? "bg-red-900/20 text-red-400" : "bg-red-100 text-red-700"
                )}>
                  <span className="font-medium">
                    LP锁定率: {riskReport.pair_lock_percent || "0"}%
                  </span>
                </div>
                
                {riskReport.big_lp_without_any_lock === 1 && (
                  <div className={cn(
                    "text-xs rounded-full px-3 py-1 flex items-center gap-1",
                    darkMode ? "bg-red-900/20 text-red-400" : "bg-red-100 text-red-700"
                  )}>
                    <AlertTriangle className="h-3 w-3" />
                    <span>大额LP未锁定</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 风险提示 */}
        {riskReport.risk_reasons && riskReport.risk_reasons.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">风险提示</h3>
            <div className={cn(
              "p-3 rounded-md",
              darkMode ? "bg-red-900/20 text-red-300" : "bg-red-50 text-red-800"
            )}>
              <ul className="list-disc pl-4 text-xs space-y-1">
                {riskReport.risk_reasons.map((reason: string, index: number) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        
        {/* 附加信息 - 显示API返回的所有其他字段 */}
        {additionalFields.length > 0 && (
          <div className="mb-4">
            <button 
              onClick={() => setShowAllFields(!showAllFields)}
              className={cn(
                "flex items-center justify-between w-full text-sm font-medium mb-2",
                "hover:text-blue-500 transition-colors"
              )}
            >
              <span>附加信息 ({additionalFields.length})</span>
              {showAllFields ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            
            {showAllFields && (
              <div className="grid grid-cols-2 gap-2">
                {additionalFields.map(([key, value]) => {
                  // 如果值是对象或数组，添加一个展开/折叠按钮
                  const isExpandable = 
                    (typeof value === 'object' && value !== null && Object.keys(value).length > 0) || 
                    (Array.isArray(value) && value.length > 0);
                  
                  const isExpanded = expandedDetails === key;
                  
                  return (
                    <div 
                      key={key}
                      className={cn(
                        "p-2 rounded",
                        darkMode ? "bg-gray-800" : "bg-gray-100",
                        isExpanded ? "col-span-2" : ""
                      )}
                    >
                      <div className="text-[10px] text-muted-foreground break-all">
                        {getChineseFieldName(key)}
                      </div>
                      {isExpandable ? (
                        <div 
                          className={cn(
                            "text-xs font-mono cursor-pointer hover:text-blue-500 transition-colors",
                            "flex items-center gap-1"
                          )}
                          onClick={() => toggleDetailExpand(key)}
                        >
                          <span>{formatFieldValue(value)}</span>
                          {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </div>
                      ) : (
                        <div className="text-xs font-mono break-all">{formatFieldValue(value)}</div>
                      )}
                      
                      {/* 展开的详情视图 */}
                      {isExpanded && renderDetailView(key, value)}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 更新时间 */}
        {riskReport.update_time && (
          <div className="text-[10px] text-muted-foreground text-right">
            数据更新于: {new Date(riskReport.update_time * 1000).toLocaleString()}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium flex items-center">
          代币风险评估
          {isLoading && (
            <span className="ml-2 flex items-center opacity-80">
              <Loader2 className="h-3.5 w-3.5 animate-spin transition-all duration-300 ease-in-out" 
                style={{ 
                  color: darkMode ? 'rgba(59, 130, 246, 0.8)' : 'rgba(37, 99, 235, 0.8)' 
                }} 
              />
            </span>
          )}
        </h3>
        
        {riskReport && Object.keys(riskReport).length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLoadRiskReport}
            disabled={isLoading}
            className={cn(
              "h-7 px-2 text-xs transition-all duration-200",
              isLoading ? (darkMode ? "opacity-50" : "opacity-60") : "opacity-100"
            )}
          >
            更新报告
          </Button>
        )}
      </div>
      
      <div className={cn(
        "rounded-md overflow-hidden border transition-all duration-300",
        darkMode ? "border-gray-800" : "border-gray-200"
      )}>
        {renderRiskReport()}
      </div>
    </div>
  );
} 