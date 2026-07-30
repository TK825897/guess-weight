#!/bin/bash
# 猜重量游戏 - 服务器部署脚本
# 用法: bash deploy.sh

set -e

APP_DIR="$(dirname "$(readlink -f "$0")")"
REPO_URL="https://github.com/TK825897/guess-weight.git"

# 获取域名：优先用命令行参数，否则交互输入
if [ $# -ge 1 ]; then
  DOMAIN="$1"
else
  read -p "请输入域名 (如 example.com): " DOMAIN
  while [ -z "$DOMAIN" ]; do
    read -p "域名不能为空，请输入: " DOMAIN
  done
fi
echo "域名: $DOMAIN"
echo ""

echo "=== 1. 安装系统依赖 ==="
sudo apt update
sudo apt install -y git curl nginx

# 安装 Node.js 20.x（如果版本低于 18）
if command -v node &> /dev/null; then
  NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
  if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "Node.js 版本过低 ($(node -v))，升级到 20.x"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  fi
else
  echo "安装 Node.js 20.x"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# 安装 PM2
if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

echo "=== 2. 克隆/更新代码 ==="
if [ -d "$APP_DIR/.git" ]; then
  cd "$APP_DIR"
  git pull
else
  rm -rf "$APP_DIR" 2>/dev/null || true
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
fi

echo "=== 3. 安装依赖 ==="
npm install

echo "=== 4. 构建 ==="
npm run build
npm run build:server

# 将正确的路径写入 ecosystem.config.cjs
cat > "$APP_DIR/ecosystem.config.cjs" << 'ECOSYSTEM'
module.exports = {
  apps: [
    {
      name: 'guess-weight',
      script: './dist-server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_memory_restart: '256M',
      watch: false,
      autorestart: true,
      max_restarts: 10,
    },
  ],
};
ECOSYSTEM

echo "=== 5. 启动服务 ==="
pm2 delete guess-weight 2>/dev/null || true
pm2 start "$APP_DIR/ecosystem.config.cjs"
pm2 save
pm2 startup systemd -u "$(whoami)" --hp "$HOME" 2>/dev/null | sudo bash || true

echo "=== 6. 配置 Nginx ==="
sudo sed "s/server_name [^;]*;/server_name $DOMAIN;/" "$APP_DIR/nginx.conf" \
  | sudo tee /etc/nginx/sites-available/guess-weight > /dev/null
sudo ln -sf /etc/nginx/sites-available/guess-weight /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "=== 7. 开放端口 ==="
if command -v ufw &> /dev/null; then
  sudo ufw allow 80
  sudo ufw allow 443
  sudo ufw allow 22
else
  echo "ufw 未安装，跳过端口配置"
fi

echo "=== 部署完成 ==="
echo "域名: http://$DOMAIN"
echo "管理后台: http://$DOMAIN/admin"
echo "管理员账号: admin / admin123"
echo ""
echo "下一步（如未配置 HTTPS）："
echo "  sudo certbot --nginx -d $DOMAIN"
