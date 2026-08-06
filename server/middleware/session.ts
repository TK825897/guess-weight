import { Request, Response, NextFunction } from 'express';
import { getDb } from '../db/init.js';

// 校验 userId 与调用方持有的 sessionId 是否匹配。
// 防止攻击者仅凭可枚举的 userId 读取他人数据或冒名提交猜测。
export function requireSession(req: Request, res: Response, next: NextFunction): void {
  const userId = Number(
    req.query.userId ?? req.body?.userId ?? req.params?.userId
  );
  const sessionId = (req.headers['x-session-id'] as string) ?? req.body?.sessionId;

  if (!userId || !sessionId) {
    res.status(401).json({ error: '缺少会话凭证' });
    return;
  }

  const db = getDb();
  const user = db.prepare('SELECT id, session_id FROM users WHERE id = ?').get(userId) as { id: number; session_id: string } | undefined;

  if (!user || user.session_id !== sessionId) {
    res.status(401).json({ error: '无效的会话凭证' });
    return;
  }

  next();
}