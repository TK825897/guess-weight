#!/bin/bash

# 猜重量游戏 - 服务器部署脚本
# 用法: bash deploy.sh

set -e

APP_DIR="/home/guess-weight"
REPO_URL="https://github.com/你的用户名/guess-weight.git"
DOMAIN="guess-weight.entaku.space"

echo "=== 1. 安装系统依赖 ==="
sudo apt update
sudo apt install -y git curl nginx

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

echo "=== 4. 构建前端 ==="
npm run build

echo "=== 5. 启动服务 ==="
pm2 delete guess-weight 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup | grep "sudo" | bash

echo "=== 6. 配置 Nginx ==="
sudo cp nginx.conf /etc/nginx/sites-available/guess-weight
sudo ln -sf /etc/nginx/sites-available/guess-weight /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "=== 7. 开放端口 ==="
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22

echo "=== 部署完成 ==="
echo "域名: http://$DOMAIN"
echo "管理后台: http://$DOMAIN/admin"
echo "管理员账号: admin / admin123"
echo ""
echo "下一步："
echo "1. 在域名管理面板添加 A 记录: guess-weight.entaku.space → 你的服务器IP"
echo "2. 运行 'sudo certbot --nginx -d $DOMAIN' 申请 HTTPS 证书"
