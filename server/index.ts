import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import { getDb } from './db/init.js';
import authRoutes from './routes/auth.js';
import imageRoutes from './routes/images.js';
import guessRoutes from './routes/guess.js';
import statsRoutes from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 白名单：默认仅允许本地开发与配置的正式域名，禁止任意来源跨域
const allowedOrigins = [
  'http://localhost:5173',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()) : []),
];

app.use(cors({
  origin(origin, callback) {
    // 无 Origin（如服务器内部请求、curl）直接放行
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 不设置跨域响应头，浏览器端拦截；服务器仍正常响应
      callback(null, false);
    }
  },
}));

const dataDir = join(process.cwd(), 'data');
const uploadsDir = join(process.cwd(), 'uploads');

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

getDb();

app.use(express.json());

// 上传目录仅按白名单扩展名服务，并设置安全响应头防止 MIME 嗅探
app.use('/uploads', (req, res, next) => {
  const ext = (req.path.split('.').pop() ?? '').toLowerCase();
  if (ext !== 'png' && ext !== 'jpg' && ext !== 'jpeg') {
    res.status(404).json({ error: 'not found' });
    return;
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'");
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Content-Type', ext === 'png' ? 'image/png' : 'image/jpeg');
  next();
});
app.use('/uploads', express.static(uploadsDir));

app.use('/api/auth', authRoutes);
app.use('/api/admin/images', imageRoutes);
app.use('/api', guessRoutes);
app.use('/api/stats', statsRoutes);

if (process.env.NODE_ENV === 'production') {
  const clientDist = join(process.cwd(), 'dist');
  if (existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get('/{*path}', (_req, res) => {
      res.sendFile(join(clientDist, 'index.html'));
    });
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
