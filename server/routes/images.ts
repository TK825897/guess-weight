import { Router } from 'express';
import multer from 'multer';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { getDb } from '../db/init.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const storage = multer.diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 jpg 和 png 格式'));
    }
  }
});

router.get('/', authMiddleware, (_req, res) => {
  const db = getDb();
  const images = db.prepare('SELECT * FROM images ORDER BY created_at DESC').all();
  res.json(images);
});

router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: '请上传图片' });
    return;
  }

  const { correct_weight } = req.body;
  if (!correct_weight || isNaN(Number(correct_weight))) {
    res.status(400).json({ error: '请输入正确的重量数值' });
    return;
  }

  const db = getDb();
  const result = db.prepare('INSERT INTO images (image_path, correct_weight) VALUES (?, ?)')
    .run(req.file.filename, Number(correct_weight));

  res.json({
    id: result.lastInsertRowid,
    image_path: req.file.filename,
    correct_weight: Number(correct_weight)
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

  const filePath = join(process.cwd(), 'uploads', image.image_path);
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }

  db.prepare('DELETE FROM guesses WHERE image_id = ?').run(id);
  db.prepare('DELETE FROM images WHERE id = ?').run(id);

  res.json({ success: true });
});

export default router;
