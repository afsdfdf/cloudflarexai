import { KLineData } from 'klinecharts'

/**
 * 生成模拟K线数据
 * @param count 数据点数量
 * @returns 模拟K线数据数组
 */
export function generateMockData(count: number = 100): KLineData[] {
  const now = Math.floor(Date.now() / 1000);
  const basePrice = 0.007354;
  const volatility = 0.005;
  
  return Array(count).fill(0).map((_, index) => {
    const timeOffset = (count - index) * 3600;
    const timestamp = (now - timeOffset) * 1000; // 毫秒时间戳

    const randomFactor = 0.5 - Math.random();
    const priceChange = basePrice * volatility * randomFactor;
    const open = basePrice + priceChange * (index - 1) / count;
    const close = basePrice + priceChange * index / count;
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = 100 + Math.random() * 2000;

    return {
      timestamp,
      open,
      high,
      low,
      close,
      volume
    };
  });
} 