import Database from 'better-sqlite3';
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

    // 管理员账号由部署脚本通过 ADMIN_USERNAME / ADMIN_PASSWORD_HASH 注入，
    // 不再内置默认密码。未配置时仅提示，不创建账号。
    const username = process.env.ADMIN_USERNAME || 'admin';
    const adminExists = db.prepare('SELECT id FROM admins WHERE username = ?').get(username);
    if (!adminExists) {
      const hash = process.env.ADMIN_PASSWORD_HASH;
      if (hash) {
        db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run(username, hash);
        console.log(`Admin created: ${username}`);
      } else {
        console.log('未配置 ADMIN_PASSWORD_HASH，暂不创建管理员账号');
      }
    }
  }
  return db;
}
