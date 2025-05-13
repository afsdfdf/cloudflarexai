# Token Rankings 组件重构计划

经检查，`app/components/token-rankings.tsx`是一个大型组件(15KB, 431行)，需要进行重构拆分以提高可维护性、可重用性和性能。以下是重构计划：

## 1. 组件拆分

将大型组件拆分为多个较小的、功能单一的组件：

### 1.1 主要组件

```
TokenRankings (主容器)
├── TopicSelector (主题选择器)
├── TokensTable (代币表格)
│   └── TokenRow (代币行)
├── Pagination (分页控件)
└── LoadingState (加载状态)
```

### 1.2 各组件职责

1. **TokenRankings**: 主容器组件，负责状态管理和API调用协调
2. **TopicSelector**: 显示和处理主题(hot, new, meme等)的选择
3. **TokensTable**: 代币数据表格，处理整体表格布局
4. **TokenRow**: 单个代币行，处理点击事件和数据显示
5. **Pagination**: 分页控件，处理页码变化
6. **LoadingState**: 加载和错误状态显示

## 2. 状态管理优化

### 2.1 提取API调用逻辑

将API调用逻辑移到自定义hook中：
- `useTopics` - 获取主题列表
- `useTokensByTopic` - 根据主题获取代币列表

### 2.2 错误处理优化

- 创建统一的错误处理机制
- 实现友好的错误UI
- 添加重试机制

### 2.3 去除硬编码值

- 将AVE_API_KEY移到环境变量中
- 将常量配置提取到单独的配置文件

## 3. 性能优化

### 3.1 减少不必要的渲染

- 使用`React.memo`来包装纯展示组件
- 使用`useMemo`和`useCallback`优化计算和回调函数
- 实现虚拟列表以提高长列表性能

### 3.2 优化图片加载

- 实现图片懒加载
- 添加图片占位符
- 优化图片错误处理

## 4. 数据处理优化

### 4.1 类型安全

- 定义详细的TypeScript接口，减少any使用
- 移动接口定义到单独的types文件

### 4.2 数据格式化

- 将格式化功能(formatPrice, formatVolume等)提取到工具函数

## 5. UI优化

### 5.1 骨架屏

- 添加骨架屏加载状态，提升用户体验

### 5.2 响应式优化

- 改进移动端UI表现
- 为不同设备尺寸优化显示内容

## 6. 实施步骤

### 步骤1: 提取类型和工具函数

1. 创建`app/types/token.ts`文件，包含所有代币相关的类型定义
2. 创建`app/lib/formatters.ts`文件，包含所有格式化功能

### 步骤2: 创建自定义Hook

1. 创建`app/hooks/use-topics.ts`和`app/hooks/use-tokens.ts`
2. 将API调用逻辑移到这些hook中

### 步骤3: 创建子组件

1. 创建`app/components/tokens/topic-selector.tsx`
2. 创建`app/components/tokens/tokens-table.tsx`
3. 创建`app/components/tokens/token-row.tsx`
4. 创建`app/components/tokens/pagination.tsx`
5. 创建`app/components/tokens/loading-state.tsx`

### 步骤4: 重构主组件

1. 使用新创建的组件和hook重构主`TokenRankings`组件
2. 移除旧的内联逻辑
3. 整合新的状态管理方案

### 步骤5: 添加优化

1. 实现虚拟列表和懒加载
2. 添加骨架屏
3. 优化响应式设计

## 7. 重构后的组件结构示例

```tsx
// app/components/token-rankings.tsx
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useTopics } from "@/app/hooks/use-topics"
import { useTokensByTopic } from "@/app/hooks/use-tokens"
import { TokenRanking, RankTopic } from "@/app/types/token"

import TopicSelector from "./tokens/topic-selector"
import TokensTable from "./tokens/tokens-table"
import Pagination from "./tokens/pagination"
import LoadingState from "./tokens/loading-state"

export default function TokenRankings({ darkMode }: { darkMode: boolean }) {
  const [activeTopicId, setActiveTopicId] = useState<string>("hot")
  const [currentPage, setCurrentPage] = useState(1)
  
  const { 
    topics, 
    isLoading: isTopicsLoading, 
    error: topicsError 
  } = useTopics()
  
  const { 
    tokens, 
    isLoading: isTokensLoading, 
    error: tokensError,
    refresh 
  } = useTokensByTopic(activeTopicId)

  const handleTopicChange = (topicId: string) => {
    setActiveTopicId(topicId)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const isLoading = isTopicsLoading || isTokensLoading
  const error = topicsError || tokensError

  if (isLoading) {
    return <LoadingState />
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Card className="p-4">
      <TopicSelector 
        topics={topics} 
        activeTopic={activeTopicId}
        onTopicChange={handleTopicChange} 
      />
      
      <TokensTable 
        tokens={tokens} 
        currentPage={currentPage}
        darkMode={darkMode} 
      />
      
      <Pagination 
        currentPage={currentPage}
        totalItems={tokens.length}
        itemsPerPage={50}
        onPageChange={handlePageChange}
      />
    </Card>
  )
}
```

通过这一系列重构，我们将大幅降低组件复杂度，提高代码可维护性和性能，同时为未来功能扩展打下坚实基础。 