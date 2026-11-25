import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

@Injectable()
export class CutlogDatabase implements OnModuleDestroy {
  readonly connection: DatabaseSync;

  constructor() {
    const path = resolve(process.env.DATABASE_PATH || './data/cutlog.sqlite');
    mkdirSync(dirname(path), { recursive: true });
    this.connection = new DatabaseSync(path);
    this.connection.exec(`
      PRAGMA busy_timeout = 5000;
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        nickname TEXT NOT NULL,
        nickname_key TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        password_salt TEXT NOT NULL
      ) STRICT;
      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        expires_at INTEGER NOT NULL
      ) STRICT;
      CREATE INDEX IF NOT EXISTS sessions_expires_at ON sessions(expires_at);
      CREATE TABLE IF NOT EXISTS quiz_badges (
        account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
        anime_slug TEXT NOT NULL,
        score INTEGER NOT NULL,
        total INTEGER NOT NULL CHECK (total > 0 AND score BETWEEN 0 AND total),
        earned_at TEXT NOT NULL,
        PRIMARY KEY (account_id, anime_slug)
      ) STRICT;
    `);
  }

  onModuleDestroy() {
    this.connection.close();
  }
}
