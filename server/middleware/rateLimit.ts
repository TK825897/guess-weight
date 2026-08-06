import { Request, Response, NextFunction } from 'express';

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// 简单的内存滑动窗口限流：按 key（默认 IP）限制时间窗内请求次数
export function rateLimit(options: { windowMs: number; max: number }) {
  const { windowMs, max } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.path}:${req.ip ?? req.socket.remoteAddress ?? 'unknown'}`;
    const now = Date.now();

    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    bucket.count += 1;
    if (bucket.count > max) {
      const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({ error: '请求过于频繁，请稍后再试' });
      return;
    }

    next();
  };
}