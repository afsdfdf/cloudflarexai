import { BannerItem } from "../components/Banner";
import { generateDefaultBanners } from "../components/DefaultBanners";

/**
 * 默认横幅配置
 */
export const DEFAULT_BANNERS: BannerItem[] = generateDefaultBanners();

/**
 * 获取当前环境下的横幅配置
 */
export function getBanners(): BannerItem[] {
  // 这里可以根据不同环境或条件返回不同的横幅配置
  // 例如，可以从API获取，或者根据用户偏好过滤
  
  return DEFAULT_BANNERS;
} 