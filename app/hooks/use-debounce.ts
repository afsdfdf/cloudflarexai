import { useState, useEffect } from 'react';

/**
 * 防抖Hook - 用于延迟处理快速变化的值
 * @param value 需要防抖的值
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置定时器以在指定的延迟后更新值
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 如果值在延迟期间改变，则清除上一个定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
} 