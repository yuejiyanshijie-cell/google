# PURE - 极简社交平台

<div align="center">
  <img src="/public/icon.svg" alt="PURE Logo" width="120" height="120" />
  <p><em>在纯粹的白空间中，万物呈现出它们最本质的结构</em></p>
</div>

## 项目简介

PURE 是一个极简主义的社交分享平台，专注于纯粹的内容表达和优雅的视觉体验。

## 技术栈

- **前端框架**: React 19 + TypeScript
- **构建工具**: Vite 6
- **样式方案**: Tailwind CSS 4
- **动画库**: Motion (Framer Motion)
- **图标库**: Lucide React
- **搜索**: Fuse.js

## 快速开始

### 本地开发

**前置要求:**
- Node.js >= 20
- npm >= 10

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 API 密钥

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 查看应用。

### Docker 部署

```bash
# 使用部署脚本（推荐）
./deploy.sh          # Linux/Mac
deploy.bat           # Windows

# 或者手动部署
npm run build
docker-compose build
docker-compose up -d
```

应用将在 http://localhost 运行。

### 生产构建

```bash
# 构建静态文件
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
google/
├── src/
│   ├── components/      # React 组件
│   ├── App.tsx         # 主应用组件
│   ├── main.tsx        # 入口文件
│   ├── ErrorBoundary.tsx  # 错误边界
│   └── index.css       # 全局样式
├── public/             # 静态资源
│   ├── manifest.json   # PWA 配置
│   └── icon.svg        # 应用图标
├── dist/               # 构建输出
├── Dockerfile          # Docker 配置
├── nginx.conf          # Nginx 配置
├── docker-compose.yml  # Docker Compose 配置
└── vite.config.ts      # Vite 配置
```

## 功能特性

- **响应式设计**: 完美适配桌面端和移动端
- **PWA 支持**: 可安装为原生应用，支持离线访问
- **性能优化**: 代码分割、懒加载、资源缓存
- **错误处理**: 完善的错误边界和友好的错误提示
- **SEO 优化**: 完整的 meta 标签和 Open Graph 支持

## 环境变量

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `GEMINI_API_KEY` | Gemini API 密钥 | 是 |
| `PORT` | 服务端口 | 否 (默认 3000) |
| `NODE_ENV` | 运行环境 | 否 (默认 production) |

## 部署指南

### 阿里云 ECS 部署

1. 在服务器上安装 Docker 和 Docker Compose
2. 克隆项目代码
3. 配置环境变量
4. 运行部署脚本

```bash
git clone <your-repo-url>
cd google
cp .env.example .env.local
# 编辑 .env.local
./deploy.sh
```

### Nginx 直接部署

```bash
# 构建项目
npm run build

# 将 dist 目录复制到服务器
scp -r dist/* user@server:/var/www/html/

# 使用提供的 nginx.conf 配置
```

## 性能指标

- Lighthouse 评分: 95+
- 首屏加载: < 2s
- 交互就绪: < 1.5s
- Bundle 大小: < 200KB (gzip)

## 浏览器支持

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 许可证

SPDX-License-Identifier: Apache-2.0
