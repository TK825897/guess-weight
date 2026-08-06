# 猜重量游戏

网页版重量猜测游戏——用户观看图片后猜测物品重量（kg），系统根据误差率计算准确率并排名。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 19, React Router 7, Tailwind CSS 4, Vite 8 |
| 后端 | Express 5, better-sqlite3, JWT, Multer, bcryptjs |
| 部署 | PM2, Nginx, Certbot (HTTPS) |

## 本地开发

```bash
# 安装依赖
npm install

# 启动前端开发服务器（端口 5173，代理 API 到 3001）
npm run dev

# 启动后端开发服务器（端口 3001）
npm run dev:server
```

## 在新服务器部署

### 前置条件

- Ubuntu 22.04+ 服务器
- 域名 DNS 已指向服务器 IP
- SSH 登录到服务器

### 一键部署

```bash
# 克隆仓库
git clone https://github.com/TK825897/guess-weight.git /home/ubuntu/guess-weight
cd /home/ubuntu/guess-weight

# 运行部署脚本（交互输入域名）
bash deploy.sh

# 或直接传入域名（静默模式）
bash deploy.sh your-domain.com
```

部署脚本会自动执行：
1. 安装系统依赖（git, curl, nginx）
2. 安装/升级 Node.js 20.x
3. 安装 PM2 进程管理
4. 安装项目 npm 依赖
5. 构建前端（`npm run build`）和服务端（`npm run build:server`）
6. 配置 PM2 并启动服务（端口 3001）
7. 配置 Nginx 反向代理
8. 开放防火墙端口（80, 443）

### 配置 HTTPS（推荐）

```bash
sudo certbot --nginx -d your-domain.com
```

### 管理员账号

首次部署时，部署脚本会交互式要求设置管理员用户名和密码（密码至少 8 位），并以 bcrypt 哈希形式保存在服务器本地 `.env` 文件中（已 gitignore，不会提交到仓库）。不再存在默认密码。

如果数据库中已存在管理员账号，部署脚本会自动跳过设置。

## 项目结构

```
guess-weight/
├── src/                # 前端源码
│   ├── pages/
│   │   ├── Game.tsx    # 游戏主页面
│   │   └── Admin.tsx   # 管理后台
│   ├── components/     # UI 组件
│   ├── api/index.ts    # API 客户端
│   └── App.tsx         # 路由配置
├── server/             # 后端源码
│   ├── index.ts        # Express 入口
│   ├── routes/         # API 路由
│   ├── db/             # SQLite 初始化与 Schema
│   ├── middleware/      # JWT 认证
│   └── utils/          # 名称生成器
├── deploy.sh           # 部署脚本
├── nginx.conf          # Nginx 配置模板
└── ecosystem.config.cjs # PM2 配置
```

## API 接口

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/start` | 开始游戏（创建/获取用户） |
| GET | `/api/random?userId=` | 获取随机未猜图片 |
| POST | `/api/guess` | 提交重量猜测 |
| GET | `/api/stats/:userId` | 用户统计 |
| GET | `/api/stats/leaderboard/top` | 排行榜 TOP 10 |
| POST | `/api/auth/login` | 管理员登录 |
| GET | `/api/admin/images` | 图片列表（需认证） |
| POST | `/api/admin/images` | 上传图片（需认证） |
| DELETE | `/api/admin/images/:id` | 删除图片（需认证） |
