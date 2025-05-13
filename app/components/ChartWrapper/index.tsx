"use client"

import { useEffect, useRef, useState } from "react"
import { init, dispose, Chart, KLineData } from 'klinecharts'
import { DARK_THEME, LIGHT_THEME } from './themes'
import { generateMockData } from './mockData'
import { getPriceDecimalPlaces, updateCandleWidthForInterval } from './chartUtils'

interface ChartWrapperProps {
  darkMode: boolean
  tokenAddress?: string
  tokenChain?: string
  interval?: string
  subIndicator?: string
  onDataLoaded?: () => void
}

export default function ChartWrapper({ 
  darkMode, 
  tokenAddress = "0xtoken", 
  tokenChain = "eth",
  interval = "1h",
  subIndicator = "VOL",
  onDataLoaded
}: ChartWrapperProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [klineData, setKlineData] = useState<KLineData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [priceRange, setPriceRange] = useState<{min: number, max: number} | null>(null)

  // 获取K线数据
  const fetchKlineData = async () => {
    // Validate input parameters
    if (!tokenAddress || !tokenChain || tokenAddress === "0xtoken") {
      console.log("使用模拟数据 - 缺少地址或链信息");
      // 使用模拟数据
      const mockData = generateMockData(100);
      setKlineData(mockData);
      if (chartInstance.current) {
        chartInstance.current.applyNewData(mockData);
      }
      
      // 通知数据已加载
      if (onDataLoaded) {
        onDataLoaded();
      }
      
      return;
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // 获取数据点数量，为每个时间区间设置合适的数据点
      const pointsMap: Record<string, number> = {
        '1m': 240,
        '5m': 240,
        '15m': 192,
        '1h': 168,
        '4h': 168,
        '1d': 120,
        '1w': 104
      };
      
      const points = pointsMap[interval] || 120;
      
      try {
        // 使用API获取数据
        console.log(`请求K线数据: ${tokenAddress} ${tokenChain} ${interval}`);
        const response = await fetch(`/api/token-kline?address=${encodeURIComponent(tokenAddress)}&chain=${encodeURIComponent(tokenChain)}&interval=${interval}&limit=${points}`, {
          // 增加超时时间
          signal: AbortSignal.timeout(10000) // 10秒超时
        });
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.success && data.klines && data.klines.length > 0) {
          console.log(`成功获取K线数据: ${data.klines.length}条`);
          
          // 转换数据为KLineChart需要的格式
          const formattedData: KLineData[] = data.klines.map((item: any) => {
            // 确保timestamp是毫秒格式
            let timestamp = item.timestamp;
            if (timestamp < 10000000000) { // 如果是秒级时间戳，转换为毫秒
              timestamp = timestamp * 1000;
            }
            
            return {
              timestamp,
              open: parseFloat(item.open),
              high: parseFloat(item.high),
              low: parseFloat(item.low),
              close: parseFloat(item.close),
              volume: parseFloat(item.volume || 0)
            };
          });
          
          // 分析价格范围
          if (formattedData.length > 0) {
            const prices = formattedData.map(item => item.close);
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange({ min: minPrice, max: maxPrice });
            
            // 设置精度
            if (chartInstance.current) {
              const precision = getPriceDecimalPlaces(minPrice);
              chartInstance.current.setPriceVolumePrecision(precision, 0);
            }
          }
          
          setKlineData(formattedData);
          
          // 更新图表
          if (chartInstance.current) {
            chartInstance.current.applyNewData(formattedData);
            // 根据时间间隔设置蜡烛宽度
            updateCandleWidthForInterval(chartInstance.current, interval);
          }
          
          // 通知数据已加载
          if (onDataLoaded) {
            onDataLoaded();
          }
        } else {
          throw new Error("Invalid data format or empty data");
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          setError("请求超时，请稍后再试");
        } else {
          console.error("获取K线数据失败:", error);
          setError("无法获取K线数据");
          
          // 重试或使用模拟数据
          if (retryCount < 2) {
            setRetryCount(prev => prev + 1);
            setTimeout(() => fetchKlineData(), 1000);
          } else {
            // 最终重试失败，使用模拟数据
            const mockData = generateMockData(100);
            setKlineData(mockData);
            if (chartInstance.current) {
              chartInstance.current.applyNewData(mockData);
            }
            
            // 即使使用模拟数据，也通知数据已加载
            if (onDataLoaded) {
              onDataLoaded();
            }
          }
        }
      }
    } catch (error) {
      console.error("处理K线数据时出错:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 初始化图表
  useEffect(() => {
    if (chartRef.current) {
      // 初始化图表
      chartInstance.current = init(chartRef.current);
      
      // 应用主题
      chartInstance.current.applyStyles(darkMode ? DARK_THEME : LIGHT_THEME);
      
      // 设置技术指标
      const mainIndicator = "MA"; // 默认显示移动平均线
      // 副图指标
      if (subIndicator && subIndicator !== "VOL") {
        chartInstance.current.createIndicator(subIndicator, true, {
          id: 'sub-pane',
          height: 80
        });
      }
      
      // 设置基本移动平均线指标
      chartInstance.current.createIndicator('MA', false, {
        id: 'candle_pane'
      });
      
      // 获取数据
      fetchKlineData();
      
      // 清理函数
      return () => {
        if (chartInstance.current) {
          dispose(chartRef.current!);
          chartInstance.current = null;
        }
      };
    }
  }, []);
  
  // 当暗色模式改变时更新主题
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.applyStyles(darkMode ? DARK_THEME : LIGHT_THEME);
    }
  }, [darkMode]);
  
  // 当时间间隔变化时更新数据
  useEffect(() => {
    if (chartInstance.current) {
      fetchKlineData();
    }
  }, [interval, tokenAddress, tokenChain]);
  
  // 当副图指标变化时更新
  useEffect(() => {
    if (chartInstance.current) {
      // 清除所有副图
      const panes = chartInstance.current.getAllPanes();
      panes.forEach(pane => {
        if (pane.id !== 'candle_pane') {
          chartInstance.current?.removePane(pane.id);
        }
      });
      
      // 重新创建副图
      if (subIndicator !== "VOL") {
        chartInstance.current.createIndicator(subIndicator, true, {
          id: 'sub-pane',
          height: 80
        });
      } else {
        // VOL是默认的，所以我们创建VOL指标
        chartInstance.current.createIndicator('VOL', true, {
          id: 'sub-pane',
          height: 80
        });
      }
    }
  }, [subIndicator]);

  return (
    <div 
      ref={chartRef} 
      className="w-full h-full"
      style={{ 
        backgroundColor: darkMode ? '#131722' : '#ffffff',
        borderRadius: '4px',
        overflow: 'hidden',
        height: '100%'
      }}
    />
  )
} 