# XAI Finance API v1 文档

XAI Finance API v1 是统一的加密货币数据 API，提供各种加密货币的行情、交易和分析数据。

## 共通响应格式

所有 API 端点均返回统一格式的 JSON 响应：

```typescript
interface ApiResponse<T> {
  success: boolean;    // 请求是否成功
  data?: T;            // 响应数据（成功时）
  error?: string;      // 错误类型（失败时）
  message?: string;    // 错误信息（失败时）
  timestamp: number;   // 响应时间戳
  stale?: boolean;     // 是否为过期数据
  stale_reason?: string; // 过期原因
}
```

### 成功响应示例

```json
{
  "success": true,
  "data": {
    "key": "value"
  },
  "timestamp": 1688453894562
}
```

### 错误响应示例

```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "找不到指定资源",
  "timestamp": 1688453894562,
  "status": 404
}
```

## 速率限制

API 实施了速率限制以防止滥用，默认限制为：
- 每分钟 100 个请求（按 IP 地址计算）

超过限制将收到 429 状态码响应：

```json
{
  "success": false,
  "error": "RATE_LIMITED",
  "message": "请求过于频繁，请稍后再试",
  "status": 429,
  "timestamp": 1688453894562
}
```

## 可用端点

### 1. 健康检查

**GET /api/v1/health**

检查 API 服务健康状态。

**响应示例：**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "cache": {
      "token_boosts": {
        "valid": true,
        "age": 120
      }
    },
    "version": "1.0.0",
    "backend": "js"
  },
  "timestamp": 1688453894562
}
```

### 2. 代币提升数据

**GET /api/v1/token-boosts**

获取热门代币提升数据。

**响应示例：**

```json
{
  "success": true,
  "data": {
    "tokens": [
      {
        "token": "0x1234...",
        "chain": "ethereum",
        "symbol": "XYZ",
        "name": "XYZ Token",
        "logo_url": "https://example.com/logo.png",
        "current_price_usd": 1.23,
        "price_change_24h": 5.67,
        "tx_volume_u_24h": 1000000,
        "holders": 5000
      }
    ],
    "count": 1
  },
  "timestamp": 1688453894562
}
```

### 3. 首页数据

**GET /api/v1/home**

获取首页综合数据，包括热门、高价值和新代币。

**响应示例：**

```json
{
  "success": true,
  "data": {
    "tokens": ["代币数据..."],
    "count": 50,
    "trending": ["趋势代币..."],
    "popular": ["高价值代币..."],
    "new": ["新代币..."]
  },
  "timestamp": 1688453894562
}
```

### 4. 代币数据

**GET /api/v1/tokens?topic=hot**

根据主题获取代币列表。

**参数：**

- `topic` - 主题 ID（hot, new, meme 等）

**响应示例：**

```json
{
  "success": true,
  "data": {
    "tokens": ["代币数据..."],
    "count": 10,
    "topic": "hot"
  },
  "timestamp": 1688453894562
}
```

**GET /api/v1/tokens?topic=topics**

获取所有可用主题。

**响应示例：**

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
  "timestamp": 1688453894562
}
```

### 5. 代币详情

**GET /api/v1/token-details?tokenId=0x123-ethereum**

获取指定代币的详细信息。

**参数：**

- `tokenId` - 代币 ID（格式：{token}-{chain}）

**响应示例：**

```json
{
  "success": true,
  "data": {
    "token": {
      "token": "0x123...",
      "chain": "ethereum",
      "symbol": "XYZ",
      "pairs": ["交易对信息..."]
    }
  },
  "timestamp": 1688453894562
}
```

### 6. 搜索代币

**GET /api/v1/search-tokens?keyword=bitcoin&chain=ethereum**

搜索代币。

**参数：**

- `keyword` - 搜索关键词
- `chain` - 区块链网络（可选）

**响应示例：**

```json
{
  "success": true,
  "data": {
    "tokens": ["搜索结果..."],
    "count": 10,
    "keyword": "bitcoin"
  },
  "timestamp": 1688453894562
}
```

### 7. 代币K线数据

**GET /api/v1/token-kline?tokenId=0x123-ethereum&timeframe=1d**

获取代币历史价格数据。

**参数：**

- `tokenId` - 代币 ID（格式：{token}-{chain}）
- `timeframe` - 时间周期（1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w）

**响应示例：**

```json
{
  "success": true,
  "data": {
    "points": [
      {
        "time": 1688367494562,
        "open": 1.23,
        "high": 1.25,
        "low": 1.20,
        "close": 1.22,
        "volume": 10000
      }
    ],
    "timeframe": "1d",
    "token_id": "0x123-ethereum"
  },
  "timestamp": 1688453894562
}
```

### 8. 缓存管理

**GET /api/v1/cache/status**

获取缓存状态（需要API密钥）。

**请求头：**

- `x-api-key` - API密钥

**响应示例：**

```json
{
  "success": true,
  "data": {
    "token_boosts": {
      "valid": true,
      "age": 120
    },
    "home_data": {
      "valid": true,
      "age": 300
    }
  },
  "timestamp": 1688453894562
}
```

**POST /api/v1/cache/refresh**

刷新缓存（需要API密钥）。

**请求头：**

- `x-api-key` - API密钥

**参数：**

- `type` - 缓存类型（可选，不提供则刷新所有缓存）

**响应示例：**

```json
{
  "success": true,
  "data": {
    "refreshed": ["token_boosts", "home_data"],
    "status": "完成"
  },
  "timestamp": 1688453894562
}
```

## 错误代码

| 状态码 | 错误类型 | 描述 |
|--------|----------|------|
| 400 | BAD_REQUEST | 请求参数错误 |
| 401 | UNAUTHORIZED | 未授权访问 |
| 403 | FORBIDDEN | 禁止访问 |
| 404 | NOT_FOUND | 资源未找到 |
| 429 | RATE_LIMITED | 请求速率超限 |
| 500 | INTERNAL_ERROR | 内部服务器错误 |
| 503 | SERVICE_UNAVAILABLE | 服务不可用 |

## 版本控制

当前 API 版本为 v1，访问路径以 `/api/v1/` 开头。未来版本更新会以不同的版本前缀发布，确保向后兼容性。 