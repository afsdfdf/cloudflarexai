/**
 * 通用格式化工具函数
 */

/**
 * 格式化地址为缩写形式
 * @param address 完整地址
 * @param prefix 前缀长度，默认为6
 * @param suffix 后缀长度，默认为4
 * @returns 格式化后的地址
 */
export const formatAddress = (
  address: string,
  prefix: number = 6,
  suffix: number = 4
): string => {
  if (!address) return "";
  if (address.length <= prefix + suffix + 3) return address;
  return address.slice(0, prefix) + "..." + address.slice(-suffix);
};

/**
 * 格式化数量，自动选择合适的小数位数和单位
 * @param amount 数量
 * @param decimals 小数位数，默认为18
 * @returns 格式化后的数量
 */
export const formatAmount = (
  amount: string | number,
  decimals: number = 18
): string => {
  try {
    // 处理字符串格式，移除逗号等格式化字符
    const cleanAmount = typeof amount === 'string' 
      ? amount.replace(/,/g, '') 
      : String(amount);
    
    const num = parseFloat(cleanAmount);
    
    if (isNaN(num)) return "0";
    
    // 对于非常大的数字使用缩写
    if (num >= 1e12) return (num / 1e12).toFixed(2) + 'T';
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    
    // 根据数值大小调整小数位数
    if (num === 0) return "0";
    
    // 科学计数法情况处理得更友好
    if (num < 0.0000001) {
      const expStr = num.toExponential(6);
      return expStr.replace('e-', 'E-');
    }
    
    if (num < 0.0001) return num.toFixed(8);
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    
    return num.toLocaleString(undefined, { 
      maximumFractionDigits: 4,
      minimumFractionDigits: 0
    });
  } catch (error) {
    console.error("格式化数量失败:", error);
    return String(amount);
  }
};

/**
 * 格式化美元价值
 * @param value 美元价值
 * @returns 格式化后的美元价值
 */
export const formatUsdValue = (value: string | number): string => {
  try {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return "$0.00";
    if (num < 0.01) return "<$0.01";
    return "$" + num.toLocaleString(undefined, { 
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    });
  } catch (error) {
    return "$0.00";
  }
};

/**
 * 格式化百分比
 * @param percent 百分比值
 * @param digits 小数位数，默认为2
 * @returns 格式化后的百分比
 */
export const formatPercent = (
  percent: string | number, 
  digits: number = 2
): string => {
  try {
    // 如果已经是包含%的字符串形式，直接返回
    if (typeof percent === 'string' && percent.includes('%')) {
      return percent;
    }
    
    const num = typeof percent === 'string' ? parseFloat(percent) : percent;
    if (isNaN(num)) return "0.00%";
    
    // 如果是小数形式（如0.05），转为百分比格式
    if (num < 1 && num > -1 && !String(percent).includes('%')) {
      return (num * 100).toFixed(digits) + '%';
    }
    
    return num.toFixed(digits) + '%';
  } catch (error) {
    return "0.00%";
  }
};

/**
 * 获取区块浏览器URL
 * @param address 地址
 * @param chain 链名称
 * @returns 完整的区块浏览器URL
 */
export const getExplorerUrl = (address: string, chain: string): string => {
  const baseUrls: {[key: string]: string} = {
    ethereum: "https://etherscan.io/address/",
    eth: "https://etherscan.io/address/",
    bsc: "https://bscscan.com/address/",
    polygon: "https://polygonscan.com/address/",
    arbitrum: "https://arbiscan.io/address/",
    optimism: "https://optimistic.etherscan.io/address/",
    avalanche: "https://snowtrace.io/address/",
    solana: "https://solscan.io/address/",
    base: "https://basescan.org/address/"
  };
  
  return (baseUrls[chain.toLowerCase()] || "https://etherscan.io/address/") + address;
}; 