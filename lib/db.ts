// 简单的内存数据库实现
interface SearchRecord {
  chain: string;
  address: string;
  count: number;
  lastSearched: Date;
}

class SearchDB {
  private searchRecords: Map<string, SearchRecord> = new Map();

  // 记录搜索
  recordSearch(chain: string, address: string): void {
    const key = `${chain}:${address}`;
    const existing = this.searchRecords.get(key);

    if (existing) {
      existing.count += 1;
      existing.lastSearched = new Date();
    } else {
      this.searchRecords.set(key, {
        chain,
        address,
        count: 1,
        lastSearched: new Date(),
      });
    }
  }

  // 获取所有搜索记录，按搜索次数排序
  getAllSearchRecords(): SearchRecord[] {
    return Array.from(this.searchRecords.values()).sort((a, b) => b.count - a.count);
  }

  // 获取特定代币的搜索次数
  getSearchCount(chain: string, address: string): number {
    const key = `${chain}:${address}`;
    return this.searchRecords.get(key)?.count || 0;
  }
}

// 导出单例实例
export const searchDB = new SearchDB(); 