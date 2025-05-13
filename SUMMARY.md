# Cloudflare部署包总结

我们已经为XAI Finance准备了Cloudflare Pages部署所需的文件。以下是部署包的内容和使用说明。

## 部署包内容

部署包位于`cloudflare/deploy-package`目录，包含以下内容：

1. **workers-site/** - Cloudflare Workers脚本和配置
   - `index.js` - 主Worker脚本
   - `package.json` - Workers依赖

2. **public/** - 静态资源文件
   - 图片、字体和其他静态资源

3. **static/** - Next.js构建生成的静态文件
   - JavaScript、CSS和其他资源

4. **wrangler.toml** - Cloudflare Wrangler配置文件
   - 需要填写账户ID和环境变量

5. **README.md** - 部署指南

## 部署步骤

1. 配置`wrangler.toml`文件，填写以下信息：
   - `account_id` - Cloudflare账户ID
   - 环境变量如`NEXT_PUBLIC_APP_URL`和`AVE_API_KEY`

2. 创建KV命名空间：
   ```bash
   wrangler kv:namespace create ASSETS
   ```

3. 更新`wrangler.toml`中的KV命名空间ID

4. 发布到Cloudflare：
   ```bash
   cd cloudflare/deploy-package
   wrangler publish
   ```

## 可选：通过Cloudflare Dashboard部署

如果不想使用命令行，可以：

1. 登录Cloudflare Dashboard
2. 导航到Pages
3. 创建新项目并连接Git仓库
4. 配置构建设置：
   - 构建命令: `npm run build`
   - 输出目录: `.next`
   - 添加必要的环境变量

## 下一步

部署完成后，您需要：

1. 配置自定义域名（如需要）
2. 验证所有API功能是否正常工作
3. 检查页面路由和导航是否正常

如需任何帮助，请参考`README.md`中的详细指南或Cloudflare官方文档。 