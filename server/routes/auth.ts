import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/init.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: '请输入用户名和密码' });
    return;
  }

  const db = getDb();
  const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username) as any;

  if (!admin) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  const valid = bcrypt.compareSync(password, admin.password_hash);
  if (!valid) {
    res.status(401).json({ error: '用户名或密码错误' });
    return;
  }

  const token = generateToken({ id: admin.id, username: admin.username });
  res.json({ token, username: admin.username });
});

router.post('/change-password', authMiddleware, (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(400).json({ error: '请填写旧密码和新密码' });
    return;
  }

  if (newPassword.length < 6) {
    res.status(400).json({ error: '新密码至少需要6个字符' });
    return;
  }

  const db = getDb();
  const admin = db.prepare('SELECT * FROM admins WHERE id = ?').get(req.admin!.id) as any;

  if (!admin) {
    res.status(404).json({ error: '管理员不存在' });
    return;
  }

  if (!bcrypt.compareSync(oldPassword, admin.password_hash)) {
    res.status(401).json({ error: '旧密码错误' });
    return;
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE admins SET password_hash = ? WHERE id = ?').run(hash, req.admin!.id);

  res.json({ success: true, message: '密码修改成功' });
});

export default router;
