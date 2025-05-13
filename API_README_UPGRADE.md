# XAI Finance API 后端升级说明

## 升级内容

我们已经将XAI Finance的API后端从Python Flask迁移到了JavaScript (Next.js API Routes)，并进行了重大改进：

1. **架构现代化**：使用了Next.js API Routes的服务器端渲染能力，更好地与前端技术栈集成
2. **统一API**：创建了统一的v1版本API，保持了向后兼容性，同时提高了一致性
3. **增强缓存**：实现了多层缓存策略（内存+文件系统），提高响应速度与降低外部API调用
4. **错误处理**：改进了错误处理机制，更好的错误响应和失败回退策略
5. **数据转换**：更强大的数据转换和格式化功能，提高了数据一致性
6. **类型安全**：使用TypeScript，提供更好的开发体验和减少运行时错误
7. **可配置性**：通过环境变量对缓存时间等进行精细控制
8. **完整文档**：提供了详细的API文档和使用说明

## 主要API端点

新API提供以下主要端点：

- `/api/v1/token-boosts` - 获取热门代币列表
- `/api/v1/home` - 获取首页综合数据
- `/api/v1/tokens` - 根据主题获取代币列表
- `/api/v1/token-details` - 获取代币详情
- `/api/v1/search-tokens` - 搜索代币
- `/api/v1/health` - 健康检查
- `/api/v1/cache/status` - 缓存状态检查
- `/api/v1/cache/refresh` - 手动刷新缓存
- `/api/v1/cron` - 定时任务触发

## 配置和部署

### 环境变量

项目使用以下环境变量，可在`.env.local`文件中配置：

```
# API密钥
AVE_API_KEY=your_ave_api_key_here

# 缓存配置（单位：毫秒）
CACHE_TTL_TOKEN_BOOSTS=900000      # 15分钟
CACHE_TTL_HOME_DATA=1200000        # 20分钟
CACHE_TTL_AVE_DATA=1800000         # 30分钟
CACHE_TTL_TOKEN_DETAILS=3600000    # 1小时
CACHE_TTL_TOKEN_KLINE=60000        # 1分钟
CACHE_TTL_SEARCH_RESULTS=300000    # 5分钟
CACHE_TTL_TOPICS=86400000          # 24小时

# 定时任务API密钥
CRON_API_KEY=your_cron_api_key_here

# 缓存刷新密钥
CACHE_REFRESH_SECRET=your_refresh_secret_here

# 日志级别 (debug, info, warn, error)
LOG_LEVEL=info
```

### 定时任务设置

为保持数据新鲜度，推荐设置外部CRON服务每15分钟调用一次`/api/v1/cron`端点，确保缓存定期更新：

```bash
# crontab示例 - 每15分钟执行一次
*/15 * * * * curl -X POST https://your-domain.com/api/v1/cron -H "x-api-key: your_cron_api_key"
```

对于使用Vercel的部署，可以使用Vercel Cron Jobs功能来设置定时任务。

## 文件结构

新的JavaScript后端使用以下文件结构：

```
app/
  api/
    v1/ 
      token-boosts/
        route.ts
      home/
        route.ts
      tokens/
        route.ts
      token-details/
        route.ts
      token-kline/
        route.ts
      search-tokens/
        route.ts
      health/
        route.ts
      cache/
        status/
          route.ts
        refresh/
          route.ts
      cron/
        route.ts
    lib/
      cache.ts       # 缓存管理
      errors.ts      # 错误处理
      fetchers.ts    # 数据获取
      transforms.ts  # 数据转换
      constants.ts   # 常量定义
      types.ts       # 类型定义
    README.md        # API文档
```

## 后续优化建议

1. **缓存优化**：考虑使用Redis等分布式缓存，提高多实例部署的效率
2. **监控系统**：添加API调用次数、响应时间等关键指标的监控
3. **限流机制**：实现请求限流，防止API被滥用
4. **更多API功能**：根据需求拓展更多API功能，如历史数据、用户数据等
5. **微服务化**：进一步拆分为独立的微服务，提高可维护性和可扩展性

## 结论

新的JavaScript API后端提供了更好的性能、可维护性和扩展性，与前端技术栈更好地集成，同时保持了与旧API的兼容性。通过模块化设计和完善的缓存机制，能够更好地应对高流量和频繁更新的需求。 