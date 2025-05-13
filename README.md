# Cloudflare Pages 部署指南

本指南将帮助您将XAI Finance应用部署到Cloudflare Pages。

## 前提条件

1. Cloudflare账户
2. 安装了Node.js和npm
3. 安装了Wrangler CLI (`npm install -g @cloudflare/wrangler`)

## 部署步骤

### 1. 配置wrangler.toml

编辑`wrangler.toml`文件，填写以下信息：

- `account_id`: 您的Cloudflare账户ID
- `zone_id`: 如果您要使用自定义域名，则需要填写域名的Zone ID
- `route`: 如果使用自定义域名，设置为`example.com/*`
- 环境变量:
  - `NEXT_PUBLIC_APP_URL`: 应用的完整URL
  - `AVE_API_KEY`: Ave.ai API密钥

### 2. 创建KV命名空间

```bash
wrangler kv:namespace create ASSETS
```

复制输出的ID，并更新`wrangler.toml`中的`kv_namespaces.id`值。

### 3. 构建应用

确保您已经构建了应用：

```bash
npm run build
```

### 4. 发布到Cloudflare

```bash
cd cloudflare
wrangler publish
```

## 直接通过Cloudflare Dashboard部署

如果您不想使用Wrangler CLI，可以通过Cloudflare Dashboard部署：

1. 登录Cloudflare Dashboard
2. 导航到Pages
3. 创建新项目
4. 连接您的Git存储库
5. 在构建设置中：
   - 构建命令: `npm run build`
   - 输出目录: `.next`
   - Node.js版本: 18或更高
6. 添加环境变量:
   - `NEXT_PUBLIC_APP_URL`
   - `AVE_API_KEY`
7. 保存并部署

## 注意事项

- API路由在Cloudflare Pages上需要设置为Edge Functions
- 某些Next.js功能可能需要额外配置
- 确保所有API端点都兼容Cloudflare Workers环境

## 排错指南

如果部署后遇到问题：

1. 检查Cloudflare的函数日志
2. 确认环境变量是否正确设置
3. 验证KV命名空间是否已正确配置

如需更多帮助，请参考[Cloudflare Pages文档](https://developers.cloudflare.com/pages/)。 