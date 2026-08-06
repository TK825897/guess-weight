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

# 项目依赖要求 Node.js 22 及以上；低版本统一升级到 22.x LTS
if command -v node &> /dev/null; then
  NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
  if [ "$NODE_MAJOR" -lt 22 ]; then
    echo "Node.js 版本过低 ($(node -v))，升级到 22.x LTS"
    curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    echo "Node.js 版本符合要求 ($(node -v))"
  fi
else
  echo "安装 Node.js 22.x LTS"
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# 防止仓库或包管理器异常导致仍使用旧版本
NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 22 ]; then
  echo "错误: Node.js 22 及以上版本安装失败，当前版本为 $(node -v)" >&2
  exit 1
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

echo "=== 3. 确保 JWT_SECRET ==="
# .env 已被 gitignore，密钥不会入库；不存在则生成强随机密钥
if [ -f "$APP_DIR/.env" ] && grep -q "JWT_SECRET" "$APP_DIR/.env"; then
  echo "JWT_SECRET 已存在，复用"
else
  SECRET=$(node -e "console.log(require('crypto').randomBytes(48).toString('base64'))")
  {
    echo "# 由部署脚本自动生成，勿提交到 git"
    echo "JWT_SECRET=$SECRET"
  } >> "$APP_DIR/.env"
  chmod 600 "$APP_DIR/.env"
  echo "已生成新的 JWT_SECRET 并保存到 .env"
fi

# CORS 白名单：允许的跨域来源，多个用逗号分隔（正式域名 + 本地开发）
if [ -f "$APP_DIR/.env" ] && grep -q "CORS_ORIGIN" "$APP_DIR/.env"; then
  echo "CORS_ORIGIN 已存在，复用"
elif [ -n "$CORS_ORIGIN" ]; then
  printf 'CORS_ORIGIN=%s\n' "$CORS_ORIGIN" >> "$APP_DIR/.env"
  echo "已写入 CORS_ORIGIN"
else
  # 未显式指定时，将正式域名加入白名单（含 https 与 http 两种形式）
  {
    echo "CORS_ORIGIN=https://$DOMAIN,http://$DOMAIN"
  } >> "$APP_DIR/.env"
  echo "已默认允许 https://$DOMAIN 与 http://$DOMAIN 跨域"
fi

echo "=== 4. 安装依赖 ==="
npm install

echo "=== 5. 配置管理员账号 ==="
# 仅当数据库中尚不存在管理员时提示设置；密码以 bcrypt 哈希形式存入 .env，绝不入库或入 git
ADMIN_EXISTS=$(cd "$APP_DIR" && node -e "
const Database = require('better-sqlite3');
const { existsSync } = require('fs');
try {
  if (!existsSync('data/guess-weight.db')) { process.stdout.write('no'); process.exit(0); }
  const db = new Database('data/guess-weight.db', { readonly: true });
  const row = db.prepare('SELECT id FROM admins LIMIT 1').get();
  process.stdout.write(row ? 'yes' : 'no');
} catch { process.stdout.write('no'); }
" 2>/dev/null || echo no)

if [ "$ADMIN_EXISTS" = "yes" ]; then
  echo "检测到已有管理员账号，跳过设置"
else
  ADMIN_USERNAME="${ADMIN_USERNAME:-}"
  if [ -z "$ADMIN_USERNAME" ]; then
    read -p "设置管理员用户名 (回车默认 admin): " ADMIN_USERNAME
    ADMIN_USERNAME="${ADMIN_USERNAME:-admin}"
  fi

  while true; do
    read -s -p "设置管理员密码 (至少8位): " ADMIN_PASSWORD
    echo
    read -s -p "再次输入确认: " ADMIN_PASSWORD2
    echo
    if [ -z "$ADMIN_PASSWORD" ] || [ "${#ADMIN_PASSWORD}" -lt 8 ]; then
      echo "密码至少需要 8 个字符，请重试"
    elif [ "$ADMIN_PASSWORD" != "$ADMIN_PASSWORD2" ]; then
      echo "两次输入不一致，请重试"
    else
      break
    fi
  done

  ADMIN_PASSWORD_HASH=$(cd "$APP_DIR" && ADMIN_PASSWORD="$ADMIN_PASSWORD" node -e "const b = require('bcryptjs'); console.log(b.hashSync(process.env.ADMIN_PASSWORD, 10))")
  unset ADMIN_PASSWORD ADMIN_PASSWORD2

  printf 'ADMIN_USERNAME=%s\nADMIN_PASSWORD_HASH=%s\n' "$ADMIN_USERNAME" "$ADMIN_PASSWORD_HASH" >> "$APP_DIR/.env"
  chmod 600 "$APP_DIR/.env"
  echo "管理员账号已配置: $ADMIN_USERNAME"
fi

echo "=== 6. 构建 ==="
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

echo "=== 7. 启动服务 ==="
pm2 delete guess-weight 2>/dev/null || true
pm2 start "$APP_DIR/ecosystem.config.cjs"
pm2 save
pm2 startup systemd -u "$(whoami)" --hp "$HOME" 2>/dev/null | sudo bash || true

echo "=== 8. 配置 Nginx ==="
sudo sed "s/server_name [^;]*;/server_name $DOMAIN;/" "$APP_DIR/nginx.conf" \
  | sudo tee /etc/nginx/sites-available/guess-weight > /dev/null
sudo ln -sf /etc/nginx/sites-available/guess-weight /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "=== 9. 开放端口 ==="
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
echo ""
echo "下一步（如未配置 HTTPS）："
echo "  sudo certbot --nginx -d $DOMAIN"
