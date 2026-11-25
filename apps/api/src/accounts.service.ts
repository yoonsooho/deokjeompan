import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import type { Account, AccountSession } from '@cutlog/contracts';
import { CutlogDatabase } from './database';

interface AccountRow extends Account {
  password_hash: string;
  password_salt: string;
}

const sessionLifetime = 30 * 24 * 60 * 60 * 1000;
const dummySalt = randomBytes(16);
const authFailure = '아이디 또는 비밀번호를 확인해 주세요.';

function passwordHash(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 }, (error, hash) => {
      if (error) reject(error);
      else resolve(hash);
    });
  });
}

function sessionHash(authorization: string | undefined) {
  const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(authorization ?? '');
  return match ? createHash('sha256').update(match[1]).digest('hex') : null;
}

function credentials(value: unknown) {
  const fields = typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
  const username = typeof fields.username === 'string' ? fields.username.trim().toLowerCase() : '';
  const password = typeof fields.password === 'string' ? fields.password : '';
  const nickname = typeof fields.nickname === 'string' ? fields.nickname.trim().normalize('NFKC') : '';
  return { username, password, nickname };
}

function toAccount({ id, username, nickname }: Account): Account {
  return { id, username, nickname };
}

@Injectable()
export class AccountsService {
  constructor(private readonly storage: CutlogDatabase) {}

  async register(value: unknown): Promise<AccountSession> {
    const { username, password, nickname } = credentials(value);
    if (!/^[a-z0-9_]{3,24}$/.test(username)) {
      throw new BadRequestException('아이디는 영문, 숫자, 밑줄로 3~24자 입력해 주세요.');
    }
    if (nickname.length < 2 || nickname.length > 20 || /[\p{Cc}\p{Cf}]/u.test(nickname)) {
      throw new BadRequestException('닉네임을 2~20자로 입력해 주세요.');
    }
    if (password.length < 9 || password.length > 128) {
      throw new BadRequestException('비밀번호를 9~128자로 입력해 주세요.');
    }

    const id = randomUUID();
    const salt = randomBytes(16);
    const hash = await passwordHash(password, salt);
    const database = this.storage.connection;

    database.exec('BEGIN IMMEDIATE');
    try {
      const inserted = database.prepare(`
        INSERT INTO accounts (id, username, nickname, nickname_key, password_hash, password_salt)
        VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING RETURNING id
      `).get(id, username, nickname, nickname.toLowerCase(), hash.toString('hex'), salt.toString('hex'));
      if (!inserted) throw new ConflictException('이미 사용 중인 아이디 또는 닉네임이에요.');

      const session = this.createSession({ id, username, nickname });
      database.exec('COMMIT');
      return session;
    } catch (error) {
      database.exec('ROLLBACK');
      throw error;
    }
  }

  async login(value: unknown): Promise<AccountSession> {
    const { username, password } = credentials(value);
    if (!/^[a-z0-9_]{3,24}$/.test(username) || !password || password.length > 128) {
      throw new UnauthorizedException(authFailure);
    }

    const account = this.storage.connection.prepare('SELECT * FROM accounts WHERE username = ?')
      .get(username) as unknown as AccountRow | undefined;
    const salt = account ? Buffer.from(account.password_salt, 'hex') : dummySalt;
    const hash = await passwordHash(password, salt);
    const expected = account ? Buffer.from(account.password_hash, 'hex') : Buffer.alloc(hash.length);
    if (!timingSafeEqual(hash, expected) || !account) throw new UnauthorizedException(authFailure);
    return this.createSession(toAccount(account));
  }

  requireAccount(authorization: string | undefined): Account {
    const tokenHash = sessionHash(authorization);
    const account = tokenHash && this.storage.connection.prepare(`
      SELECT accounts.id, accounts.username, accounts.nickname FROM sessions
      JOIN accounts ON accounts.id = sessions.account_id
      WHERE sessions.token_hash = ? AND sessions.expires_at > ?
    `).get(tokenHash, Date.now()) as Account | undefined;
    if (!account) throw new UnauthorizedException('로그인이 필요해요.');
    return account;
  }

  logout(authorization: string | undefined) {
    const tokenHash = sessionHash(authorization);
    if (tokenHash) this.storage.connection.prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
  }

  private createSession(account: Account): AccountSession {
    const token = randomBytes(32).toString('base64url');
    const now = Date.now();
    const expiresAt = now + sessionLifetime;
    const database = this.storage.connection;
    database.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(now);
    database.prepare('INSERT INTO sessions (token_hash, account_id, expires_at) VALUES (?, ?, ?)')
      .run(createHash('sha256').update(token).digest('hex'), account.id, expiresAt);
    return { account, token, expiresAt };
  }
}
