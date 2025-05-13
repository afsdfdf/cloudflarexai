const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 定义路径
const rootDir = path.resolve(__dirname, '..');
const buildDir = path.join(rootDir, '.next');
const staticDir = path.join(buildDir, 'static');
const publicDir = path.join(rootDir, 'public');
const cloudflareDir = path.join(rootDir, 'cloudflare');
const workerSiteDir = path.join(cloudflareDir, 'workers-site');
const deployPackageDir = path.join(cloudflareDir, 'deploy-package');

// 确保目录存在
if (!fs.existsSync(deployPackageDir)) {
  fs.mkdirSync(deployPackageDir, { recursive: true });
}

// 复制构建文件
console.log('复制构建文件...');
try {
  // 复制静态资源
  execSync(`xcopy "${staticDir}" "${path.join(deployPackageDir, 'static')}" /E /I /H /Y`);
  
  // 复制公共资源
  execSync(`xcopy "${publicDir}" "${path.join(deployPackageDir, 'public')}" /E /I /H /Y`);
  
  // 复制workers文件
  execSync(`xcopy "${workerSiteDir}" "${path.join(deployPackageDir, 'workers-site')}" /E /I /H /Y`);
  
  // 复制wrangler配置
  fs.copyFileSync(
    path.join(cloudflareDir, 'wrangler.toml'),
    path.join(deployPackageDir, 'wrangler.toml')
  );
  
  // 复制README
  fs.copyFileSync(
    path.join(cloudflareDir, 'README.md'),
    path.join(deployPackageDir, 'README.md')
  );
  
  console.log('部署包已准备好，位置：', deployPackageDir);
  console.log('使用以下命令部署：');
  console.log('cd', path.relative(rootDir, deployPackageDir));
  console.log('wrangler publish');
} catch (error) {
  console.error('准备部署文件时出错：', error);
} 