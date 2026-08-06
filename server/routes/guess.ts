import { Router } from 'express';
import { getDb } from '../db/init.js';
import { generateRandomName } from '../utils/nameGenerator.js';

const router = Router();

router.post('/start', (req, res) => {
  const { name, language } = req.body;
  const userName = name || generateRandomName(language);
  const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const db = getDb();

  let existingUser = null;
  if (name) {
    existingUser = db.prepare('SELECT * FROM users WHERE name = ?').get(name) as any;
  }

  if (existingUser) {
    res.json({
      userId: existingUser.id,
      name: existingUser.name,
      sessionId: existingUser.session_id
    });
    return;
  }

  const result = db.prepare('INSERT INTO users (name, session_id) VALUES (?, ?)')
    .run(userName, sessionId);

  res.json({
    userId: result.lastInsertRowid,
    name: userName,
    sessionId
  });
});

router.get('/random', (req, res) => {
  const userId = req.query.userId as string;

  if (!userId) {
    res.status(400).json({ error: '缺少用户ID' });
    return;
  }

  const db = getDb();

  const totalImages = db.prepare('SELECT COUNT(*) as count FROM images').get() as any;
  if (totalImages.count === 0) {
    res.status(404).json({ error: '暂无图片可猜' });
    return;
  }

  const randomImage = db.prepare(`
    SELECT i.* FROM images i
    WHERE i.id NOT IN (
      SELECT g.image_id FROM guesses g WHERE g.user_id = ?
    )
    ORDER BY RANDOM()
    LIMIT 1
  `).get(userId) as any;

  if (!randomImage) {
    res.json({ allGuessed: true, message: '恭喜！你已猜完所有图片' });
    return;
  }

  res.json({
    id: randomImage.id,
    image_path: `/uploads/${randomImage.image_path}`,
    allGuessed: false
  });
});

router.post('/guess', (req, res) => {
  const { userId, imageId, guessed_weight } = req.body;

  if (!userId || !imageId || guessed_weight === undefined) {
    res.status(400).json({ error: '缺少必要参数' });
    return;
  }

  const db = getDb();

  const image = db.prepare('SELECT * FROM images WHERE id = ?').get(imageId) as any;
  if (!image) {
    res.status(404).json({ error: '图片不存在' });
    return;
  }

  const alreadyGuessed = db.prepare(
    'SELECT id FROM guesses WHERE user_id = ? AND image_id = ?'
  ).get(userId, imageId);

  if (alreadyGuessed) {
    res.status(400).json({ error: '你已经猜过这张图片了' });
    return;
  }

  const correctWeight = image.correct_weight;
  const errorRate = Math.min(100, Math.abs(guessed_weight - correctWeight) / correctWeight * 100);
  const accuracy = Math.max(0, 100 - errorRate);

  db.prepare('INSERT INTO guesses (user_id, image_id, guessed_weight, error_rate) VALUES (?, ?, ?, ?)')
    .run(userId, imageId, guessed_weight, errorRate);

  const allGuessesForImage = db.prepare(
    'SELECT error_rate FROM guesses WHERE image_id = ?'
  ).all(imageId) as any[];

  const betterCount = allGuessesForImage.filter(g => g.error_rate < errorRate).length;
  const rank = betterCount + 1;
  const totalGuessers = allGuessesForImage.length;
  const betterPercentage = Math.round((1 - betterCount / totalGuessers) * 100);

  res.json({
    correct_weight: correctWeight,
    guessed_weight,
    difference: Math.abs(guessed_weight - correctWeight),
    direction: guessed_weight > correctWeight ? '大了' : guessed_weight < correctWeight ? '小了' : '完全正确！',
    error_rate: Number(errorRate.toFixed(2)),
    accuracy: Number(accuracy.toFixed(2)),
    rank,
    total_guessers: totalGuessers,
    better_percentage: betterPercentage
  });
});

export default router;
