import { Router } from 'express';
import { getDb } from '../db/init.js';
import { requireSession } from '../middleware/session.js';

const router = Router();

router.get('/:userId', requireSession, (req, res) => {
  const { userId } = req.params;

  const db = getDb();

  const totalImages = db.prepare('SELECT COUNT(*) as count FROM images').get() as any;

  const guessedCount = db.prepare(
    'SELECT COUNT(DISTINCT image_id) as count FROM guesses WHERE user_id = ?'
  ).get(userId) as any;

  const userStats = db.prepare(`
    SELECT AVG(MAX(0, MIN(100, 100 - error_rate))) as avg_accuracy
    FROM guesses
    WHERE user_id = ?
  `).get(userId) as any;

  const allUserStats = db.prepare(`
    SELECT
      user_id,
      AVG(MAX(0, MIN(100, 100 - error_rate))) as avg_accuracy,
      COUNT(*) as guess_count
    FROM guesses
    GROUP BY user_id
    HAVING guess_count >= 1
    ORDER BY avg_accuracy DESC
  `).all() as any[];

  const currentUserIndex = allUserStats.findIndex(s => s.user_id === Number(userId));
  const rank = currentUserIndex >= 0 ? currentUserIndex + 1 : allUserStats.length + 1;

  const userName = db.prepare('SELECT name FROM users WHERE id = ?').get(userId) as any;

  res.json({
    total_images: totalImages.count,
    guessed_count: guessedCount.count,
    avg_accuracy: userStats?.avg_accuracy ? Number(userStats.avg_accuracy.toFixed(2)) : 0,
    rank,
    total_players: allUserStats.length,
    name: userName?.name || '未知用户'
  });
});

router.get('/leaderboard/top', (_req, res) => {
  const db = getDb();

  const top = db.prepare(`
    SELECT
      u.name,
      AVG(MAX(0, MIN(100, 100 - g.error_rate))) as avg_accuracy,
      COUNT(*) as guess_count
    FROM guesses g
    JOIN users u ON g.user_id = u.id
    GROUP BY g.user_id
    HAVING guess_count >= 1
    ORDER BY avg_accuracy DESC
    LIMIT 10
  `).all();

  res.json(top);
});

export default router;
