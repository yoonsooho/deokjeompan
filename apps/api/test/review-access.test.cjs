const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtemp, rm } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('../dist/main');

test('로그인한 회원은 해당 작품 퀴즈를 완료한 후에만 리뷰를 등록할 수 있다', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'cutlog-test-'));
  process.env.DATABASE_PATH = join(directory, 'test.sqlite');
  process.env.SEED_SAMPLE_REVIEWS = 'false';
  const app = await NestFactory.create(AppModule, { logger: false, abortOnError: false });
  t.after(async () => {
    await app.close();
    await rm(directory, { recursive: true, force: true });
  });
  app.setGlobalPrefix('api');
  await app.listen(0, '127.0.0.1');
  const url = await app.getUrl();
  let token;
  function request(path, body) {
    return fetch(url + '/api' + path, {
      method: body ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: 'Bearer ' + token }),
      },
      body: body && JSON.stringify(body),
    });
  }

  const registration = await request('/auth/register', {
    username: 'reader', nickname: '독자', password: 'test-password',
  });
  assert.equal(registration.status, 201);
  token = (await registration.json()).token;
  const review = { rating: 8, comment: '여운이 남는 이야기', spoiler: false };
  const path = '/anime/frieren';
  assert.equal((await request(path + '/reviews', review)).status, 403);

  const quizResponse = await request(path + '/quiz');
  assert.equal(quizResponse.status, 200);
  const quiz = await quizResponse.json();
  const attempt = await request(path + '/quiz/attempts', {
    quizVersion: quiz.quizVersion,
    choices: quiz.questions.map(q => ({ questionId: q.id, optionId: q.options[0].id })),
  });
  assert.equal(attempt.status, 200);
  assert.equal((await request(path + '/reviews', review)).status, 201);
  assert.equal((await request('/anime/dungeon-meshi/reviews', review)).status, 403);
});
