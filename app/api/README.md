# XAI Finance API 文档

这是 XAI Finance 应用的 JavaScript API 后端，使用 Next.js API 路由实现。该后端提供了加密货币数据的获取、缓存和处理功能。

## API 端点

### 1. 代币提升 (Token Boosts)

**GET /api/v1/token-boosts**

返回热门代币列表，数据来源于 DexScreener。

```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "token": "0x1234...",
        "chain": "ethereum",
        "symbol": "TKN",
        "name": "Token Name",
        "logo_url": "https://example.com/logo.png",
        "current_price_usd": 1.23,
        "price_change_24h": 5.67,
        "tx_volume_u_24h": 1000000,
        "holders": 5000
      }
    ],
    "count": 1
  },
  "timestamp": 1624312345678
}
```

### 2. 首页数据 (Home Data)

**GET /api/v1/home**

返回综合首页数据，包括热门、高价值和新代币。

```json
{
  "tokens": ["代币数据..."],
  "count": 50,
  "trending": ["趋势代币..."],
  "popular": ["高价值代币..."],
  "new": ["新代币..."],
  "success": true,
  "timestamp": 1624312345678,
  "source": "js_api"
}
```

### 3. 代币数据 (Tokens)

**GET /api/v1/tokens?topic=hot**

根据主题返回代币列表。可用主题有：hot, new, meme 等。

**GET /api/v1/tokens?topic=topics**

返回所有可用主题。

```json
{
  "success": true,
  "data": {
    "topics": [
      {
        "id": "hot",
        "name_en": "Hot",
        "name_zh": "热门"
      },
      {
        "id": "new",
        "name_en": "New",
        "name_zh": "新币"
      }
    ]
  },
  "timestamp": 1624312345678
}
```

### 4. 代币详情 (Token Details)

**GET /api/v1/token-details?tokenId=0x123-ethereum**

返回指定代币的详细信息。tokenId 格式为 `{token}-{chain}`。

```json
{
  "success": true,
  "data": {
    "token": {
      "token": "0x123...",
      "chain": "ethereum",
      "symbol": "TKN",
      "pairs": [
        "交易对信息..."
      ]
    }
  },
  "timestamp": 1624312345678
}
```

### 5. 搜索代币 (Search Tokens)

**GET /api/v1/search-tokens?keyword=bitcoin&chain=ethereum**

搜索代币，可选指定链。

```json
{
  "success": true,
  "data": {
    "tokens": ["搜索结果..."],
    "count": 10,
    "keyword": "bitcoin"
  },
  "timestamp": 1624312345678
}
```

### 6. 健康检查 (Health)

**GET /api/v1/health**

检查 API 服务健康状态。

```json
{
  "status": "healthy",
  "timestamp": 1624312345678,
  "cache": {
    "token_boosts": {
      "valid": true,
      "age": 120
    }
  },
  "version": "1.0.0",
  "backend": "js"
}
```

### 7. 缓存管理

**GET /api/v1/cache/status**

返回所有缓存的状态。

**POST /api/v1/cache/refresh?type=token_boosts**

刷新指定类型的缓存。不提供 type 参数则刷新所有缓存。

需要在请求头中提供授权：`Authorization: Bearer {CACHE_REFRESH_SECRET}`

## 缓存机制

API 使用内存缓存和文件缓存的双层缓存机制，减少对外部 API 的请求次数，提高响应速度。每种数据类型有不同的缓存过期时间，可通过环境变量配置。

## 定时任务

使用 `/api/v1/cron` 端点触发定时缓存刷新。可以通过外部 CRON 服务定期调用此端点来保持数据新鲜度。

需要在请求头中提供 API 密钥：`x-api-key: {CRON_API_KEY}`

## 环境变量

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