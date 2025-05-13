import { DeepPartial, Styles } from 'klinecharts'

// 暗色主题配置
export const DARK_THEME: DeepPartial<Styles> = {
  grid: {
    horizontal: { color: '#292929' },
    vertical: { color: '#292929' }
  },
  candle: {
    bar: {
      upColor: '#0ecb81',
      downColor: '#f6465d',
      noChangeColor: '#888888',
    },
    tooltip: { 
      show: true,
      custom: [] // Empty array to remove all text labels
    } as any,
    priceMark: {
      high: { show: true },
      low: { show: true },
      last: { show: true }
    }
  },
  xAxis: {
    axisLine: { color: '#292929' },
    tickLine: { show: true },
    tickText: { show: true, size: 11 }
  },
  yAxis: {
    axisLine: { color: '#292929' },
    tickLine: { show: true },
    tickText: { show: true, size: 11 }
  },
  indicator: {
    text: { show: true, size: 11 },
    line: { colors: ['#FF9600', '#9D65C9', '#2196F3'] },
    tooltip: {
      show: true,
      custom: [] // Empty array to remove all text labels
    } as any
  }
}

// 亮色主题配置
export const LIGHT_THEME: DeepPartial<Styles> = {
  grid: {
    horizontal: { color: '#EDEDED' },
    vertical: { color: '#EDEDED' }
  },
  candle: {
    bar: {
      upColor: '#26A69A',
      downColor: '#EF5350',
      noChangeColor: '#888888',
    },
    tooltip: { 
      show: true,
      custom: [] // Empty array to remove all text labels
    } as any,
    priceMark: {
      high: { show: true },
      low: { show: true },
      last: { show: true }
    }
  },
  xAxis: {
    axisLine: { color: '#EDEDED' },
    tickLine: { show: true },
    tickText: { show: true, size: 11 }
  },
  yAxis: {
    axisLine: { color: '#EDEDED' },
    tickLine: { show: true },
    tickText: { show: true, size: 11 }
  },
  indicator: {
    text: { show: true, size: 11 },
    line: { colors: ['#FF9600', '#9D65C9', '#2196F3'] },
    tooltip: {
      show: true,
      custom: [] // Empty array to remove all text labels
    } as any
  }
} 