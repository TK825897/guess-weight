import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

let db: Database.Database;

function getSchemaPath(): string {
  // In compiled JS: __dirname = dist-server/db/
  // schema.sql is in server/db/ and needs to be copied to dist-server/db/
  const compiledPath = join(__dirname, 'schema.sql');
  if (existsSync(compiledPath)) return compiledPath;

  // Fallback: try source path (for tsx dev mode)
  const sourcePath = join(__dirname, '..', 'server', 'db', 'schema.sql');
  if (existsSync(sourcePath)) return sourcePath;

  throw new Error('schema.sql not found');
}

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = join(process.cwd(), 'data', 'guess-weight.db');

    db = new Database(dbPath);

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const schema = readFileSync(getSchemaPath(), 'utf-8');
    db.exec(schema);

    const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get('admin');
    if (!adminExists) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hash);
      console.log('Default admin created: admin / admin123');
    }
  }
  return db;
}
