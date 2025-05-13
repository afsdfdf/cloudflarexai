# XAI Finance Web App

一个基于Next.js的Web3金融应用，提供加密货币行情跟踪、K线分析和Web3应用发现等功能。

## 特点

- 🌙 支持深色/浅色模式
- 📊 加密货币价格和趋势追踪
- 📈 实时K线图和市场分析
- 👤 用户个人资料管理
- 🔍 Web3应用发现和热门排名
- �� 响应式设计，适合移动端使用
- 🔄 Next.js API Routes提供实时代币数据

## 主要页面

- 首页：热门代币、搜索、最新行情
- 市场页：详细价格图表和交易数据
- K线页：专业图表分析工具
- 发现页：Web3应用分类和热门排行
- 用户个人页：账户设置和管理

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui组件库
- Next.js API Routes
- Vercel部署

## 安装和运行

1. 克隆项目仓库：

```bash
git clone https://github.com/你的用户名/xai2.git
cd xai2
```

2. 安装依赖：

```bash
npm install
# 或
pnpm install
```

3. 运行开发服务器：

```bash
npm run dev
# 或
pnpm dev
```

4. 打开浏览器访问：http://localhost:3000

## 构建生产版本

```bash
npm run build
npm start
# 或
pnpm build
pnpm start
```

## 部署

该项目可以部署到Vercel或其他支持Next.js的平台。

## Vercel部署

本项目可以轻松部署到Vercel平台。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2F你的用户名%2Fxai2)

### 部署步骤

1. 将代码推送到GitHub仓库
2. 在Vercel上导入项目
3. 选择GitHub仓库
4. 配置部署选项
   - 构建命令: `pnpm run build`
   - 输出目录: `.next`
   - 安装命令: `pnpm install`
5. 设置环境变量
   - `NEXT_PUBLIC_APP_URL`: 应用URL
   - `AVE_API_KEY`: Ave.ai API密钥
   - 其他环境变量请参考`.env.example`
6. 点击部署

## 环境变量

创建一个`.env.local`文件，并设置以下环境变量：

```
NEXT_PUBLIC_APP_URL="https://你的域名.vercel.app"
AVE_API_KEY="your_api_key_here"
# 更多环境变量请参考.env.example
```

## API接口

项目使用内置的Next.js API Routes获取代币数据。详细API文档请查看 [API_README.md](API_README.md)。

## API 标准化

作为优化计划的一部分，我们已经实现了API标准化，提供了一致的响应格式和错误处理：

### 标准响应格式

所有API端点都返回统一的响应格式：

```typescript
interface ApiResponse<T> {
  success: boolean;    // 请求是否成功
  data?: T;            // 响应数据（成功时）
  error?: string;      // 错误类型（失败时）
  message?: string;    // 错误信息（失败时）
  timestamp: number;   // 响应时间戳
}
```

### API安全性增强

- 实现了请求频率限制，防止API滥用
- 添加了CORS头支持，增强跨域安全
- 添加了API密钥验证，保护敏感端点

### 主要API端点

所有API端点已经迁移到`/api/v1/`路径下，详细文档可以在[API v1文档](app/api/v1/README.md)中找到。

### 缓存优化

- 实现了双层缓存（内存 + 文件）
- 添加了智能缓存失效策略
- 提供了缓存状态监控和管理

## 即将进行的工作

以下是后续计划中的工作：

1. **性能优化**
   - 实现虚拟列表，优化长列表渲染
   - 优化图片加载和处理
   - 优化JavaScript性能

2. **用户体验提升**
   - 添加骨架屏和占位符
   - 优化加载状态和错误提示
   - 添加过渡动画和微交互

3. **国际化支持**
   - 提取所有硬编码文本
   - 添加多语言支持
   - 支持RTL布局

4. **测试框架**
   - 添加单元测试和集成测试
   - 实现自动化测试流程
   - 确保代码质量和稳定性

## 贡献指南

1. Fork本仓库
2. 创建特性分支: `git checkout -b my-new-feature`
3. 提交更改: `git commit -am 'Add some feature'`
4. 推送到分支: `git push origin my-new-feature`
5. 提交Pull Request

## 许可证

MIT

## 最近更新

- 修复了Logo显示问题，优化了用户界面体验
- 更新了图片加载方式，提高了应用稳定性