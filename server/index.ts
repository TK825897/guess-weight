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

const dataDir = join(process.cwd(), 'data');
const uploadsDir = join(process.cwd(), 'uploads');

if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

getDb();

app.use(cors());
app.use(express.json());

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
