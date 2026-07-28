#!/bin/bash

# 猜重量游戏 - 服务器部署脚本
# 用法: bash deploy.sh

set -e

APP_DIR="/home/guess-weight"
REPO_URL="https://github.com/你的用户名/guess-weight.git"

echo "=== 1. 安装系统依赖 ==="
sudo apt update
sudo apt install -y git curl

# 安装 Node.js 20.x
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 安装 PM2
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi

echo "=== 2. 克隆/更新代码 ==="
if [ -d "$APP_DIR" ]; then
    cd $APP_DIR
    git pull
else
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

echo "=== 3. 安装依赖 ==="
npm install

echo "=== 4. 启动服务 ==="
pm2 delete guess-weight 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | grep "sudo" | bash

echo "=== 5. 开放端口 ==="
sudo ufw allow 3001
sudo ufw allow 80
sudo ufw allow 443

echo "=== 部署完成 ==="
echo "服务地址: http://你的服务器IP:3001"
echo "管理后台: http://你的服务器IP:3001/admin"
echo "管理员账号: admin / admin123"
