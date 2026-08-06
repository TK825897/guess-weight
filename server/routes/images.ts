import { Router } from 'express';
import multer from 'multer';
import { join } from 'path';
import { existsSync, unlinkSync, writeFileSync, mkdirSync } from 'fs';
import { getDb } from '../db/init.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const uploadsDir = join(process.cwd(), 'uploads');

// 扩展名白名单：与魔数校验双重确认，防止伪装图片的可执行文件上传
const EXTENSION_WHITELIST = new Set(['jpg', 'jpeg', 'png']);

function isImageMagic(buf: Buffer): { ok: boolean; ext: string | null } {
  // JPEG: FF D8 FF
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return { ok: true, ext: 'jpg' };
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf.length >= 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) {
    return { ok: true, ext: 'png' };
  }
  return { ok: false, ext: null };
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const name = file.originalname.toLowerCase();
    const dotIndex = name.lastIndexOf('.');
    const ext = dotIndex !== -1 ? name.slice(dotIndex + 1) : '';
    const allowedMime = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!EXTENSION_WHITELIST.has(ext)) {
      cb(new Error('仅支持 jpg 和 png 格式'));
      return;
    }
    if (!allowedMime.includes(file.mimetype)) {
      cb(new Error('仅支持 jpg 和 png 格式'));
      return;
    }
    cb(null, true);
  }
});

router.get('/', authMiddleware, (_req, res) => {
  const db = getDb();
  const images = db.prepare('SELECT * FROM images ORDER BY created_at DESC').all();
  res.json(images);
});

router.post('/', authMiddleware, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      res.status(400).json({ error: err.message || '上传失败' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: '请上传图片' });
      return;
    }

    const { correct_weight } = req.body;
    if (!correct_weight || isNaN(Number(correct_weight))) {
      res.status(400).json({ error: '请输入正确的重量数值' });
      return;
    }

    // 魔数校验：验证文件头确为真实图片内容
    const magic = isImageMagic(req.file.buffer);
    if (!magic.ok) {
      res.status(400).json({ error: '文件内容不是有效的图片' });
      return;
    }

    if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${magic.ext}`;
    writeFileSync(join(uploadsDir, filename), req.file.buffer);

    const db = getDb();
    const result = db.prepare('INSERT INTO images (image_path, correct_weight) VALUES (?, ?)')
      .run(filename, Number(correct_weight));

    res.json({
      id: result.lastInsertRowid,
      image_path: filename,
      correct_weight: Number(correct_weight)
    });
  });
});

router.delete('/:id', authMiddleware, (req, res) => {
  const { id } = req.params;
  const db = getDb();

  const image = db.prepare('SELECT * FROM images WHERE id = ?').get(id) as any;
  if (!image) {
    res.status(404).json({ error: '图片不存在' });
    return;
  }

  const filePath = join(uploadsDir, image.image_path);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }

  db.prepare('DELETE FROM guesses WHERE image_id = ?').run(id);
  db.prepare('DELETE FROM images WHERE id = ?').run(id);

  res.json({ success: true });
});

export default router;
