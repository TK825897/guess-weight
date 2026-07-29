import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';

let db: Database.Database;

export function getDb(): Database.Database {
  if (!db) {
    const dbPath = join(process.cwd(), 'data', 'guess-weight.db');

    db = new Database(dbPath);

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const schema = readFileSync(join(import.meta.dirname, 'schema.sql'), 'utf-8');
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
