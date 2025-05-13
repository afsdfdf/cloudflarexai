import { Chart, KLineData } from 'klinecharts'

/**
 * 优化图表显示，设置合适的可见范围和蜡烛宽度
 * @param chart 图表实例
 * @param interval 时间间隔
 * @param data K线数据
 */
export function optimizeChartDisplay(chart: Chart, interval: string, data: KLineData[]): void {
  if (!chart || !data || data.length === 0) return;
  
  // 根据时间间隔设置合适的蜡烛宽度
  const candleWidthMap: Record<string, number> = {
    '1m': 3,
    '5m': 4,
    '15m': 5,
    '1h': 6,
    '4h': 8,
    '1d': 10,
    '1w': 12
  };
  
  const defaultWidth = 8;
  const width = candleWidthMap[interval] || defaultWidth;
  
  // 设置蜡烛宽度
  setCustomBarWidth(chart, width);
  
  // 适配可见范围：显示近期数据但保留足够历史
  const dataLength = data.length;
  
  // 计算合适的右空白
  const rightRatio = 0.08;
  chart.setRightSpace(Math.ceil(chart.getOffsetRightSpace() * rightRatio));
  
  // 根据不同时间间隔设置不同的可见范围
  let visibleRange = Math.min(dataLength, 60);
  
  if (interval === '1d' || interval === '1w') {
    visibleRange = Math.min(dataLength, 90);
  } else if (interval === '1h' || interval === '4h') {
    visibleRange = Math.min(dataLength, 120);
  } else {
    visibleRange = Math.min(dataLength, 180);
  }
  
  // 设置可见范围
  if (visibleRange < dataLength) {
    chart.setVisibleRange({ from: dataLength - visibleRange, to: dataLength - 1 });
  }
}

/**
 * 设置自定义蜡烛宽度
 * @param chart 图表实例
 * @param width 宽度
 */
export function setCustomBarWidth(chart: Chart, width: number): void {
  chart.setBarSpace(width);
}

/**
 * 获取价格小数位数
 * @param price 价格
 * @returns 小数位数
 */
export function getPriceDecimalPlaces(price: number): number {
  if (price === 0) return 2;
  
  if (price < 0.00001) return 8;
  if (price < 0.0001) return 7;
  if (price < 0.001) return 6;
  if (price < 0.01) return 5;
  if (price < 0.1) return 4;
  if (price < 1) return 3;
  if (price < 1000) return 2;
  
  return 2;
}

/**
 * 根据时间间隔更新蜡烛宽度
 * @param chart 图表实例
 * @param interval 时间间隔
 */
export function updateCandleWidthForInterval(chart: Chart, interval: string): void {
  const candleWidthMap: Record<string, number> = {
    '1m': 3,
    '5m': 4,
    '15m': 5,
    '1h': 6,
    '4h': 8,
    '1d': 10,
    '1w': 12
  };
  
  const width = candleWidthMap[interval] || 6;
  setCustomBarWidth(chart, width);
}

/**
 * 设置图表技术指标
 * @param chart 图表实例
 * @param mainIndicator 主图指标
 * @param subIndicator 副图指标
 */
export function setupIndicators(chart: Chart, mainIndicator?: string, subIndicator?: string): void {
  // 设置主图指标
  if (mainIndicator) {
    chart.createIndicator(mainIndicator, false, { id: 'main-indicator' });
  }
  
  // 设置副图指标
  if (subIndicator) {
    // 先清除现有的副图指标
    chart.getIndicatorByPaneId('sub-indicator')?.forEach(name => {
      chart.removeIndicator('sub-indicator', name);
    });
    
    // 增加新的副图指标
    chart.createIndicator(
      subIndicator, 
      true, 
      { 
        id: 'sub-indicator',
        height: 80,
      }
    );
  }
} 