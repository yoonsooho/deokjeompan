import { BadRequestException, Body, ConflictException, Controller, Get, Headers, HttpCode, NotFoundException, Param, Post } from '@nestjs/common';
import { createHash, randomInt } from 'node:crypto';
import type { AnimeQuiz, QuizFeedback, QuizQuestion, QuizResult } from '@cutlog/contracts';
import { AccountsService } from './accounts.service';
import { badgeFromScore, BadgesService } from './badges.service';
import { catalog } from './catalog';
import { quizContent } from './quiz-content';

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = randomInt(index + 1);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function findQuiz(slug: string) {
  const work = catalog.find((entry) => entry.slug === slug);
  const content = quizContent[slug];
  if (!work || !content) throw new NotFoundException('작품 퀴즈를 찾을 수 없어요.');

  const { title, cover } = work;
  const quizVersion = hash(JSON.stringify(content));
  const questions = content.map(([prompt, answer, wrong], index) => {
    const id = `q${index + 1}`;
    const optionId = (label: string) => hash(`${slug}/${id}/${label}`);
    return {
      id,
      prompt,
      options: [answer, ...wrong].map((label) => ({ id: optionId(label), label })),
      correctOptionId: optionId(answer),
    };
  });
  return { anime: { slug, title, cover }, quizVersion, questions };
}

@Controller('anime/:slug/quiz')
export class QuizController {
  constructor(private readonly accounts: AccountsService, private readonly badges: BadgesService) {}

  @Get()
  questions(@Param('slug') slug: string, @Headers('authorization') authorization?: string): AnimeQuiz {
    const account = this.accounts.requireAccount(authorization);
    const quiz = findQuiz(slug);
    const questions: QuizQuestion[] = shuffle(quiz.questions).map(({ id, prompt, options }) => ({
      id, prompt, options: shuffle(options),
    }));
    return {
      quizVersion: quiz.quizVersion,
      anime: quiz.anime,
      questions,
      bestBadge: this.badges.get(account.id, slug),
    };
  }

  @Post('attempts')
  @HttpCode(200)
  grade(
    @Param('slug') slug: string,
    @Headers('authorization') authorization: string | undefined,
    @Body() body: unknown,
  ): QuizResult {
    const account = this.accounts.requireAccount(authorization);
    const quiz = findQuiz(slug);
    const fields = typeof body === 'object' && body !== null ? body as Record<string, unknown> : {};
    if (typeof fields.quizVersion !== 'string') throw new BadRequestException('퀴즈 정보가 올바르지 않아요.');
    if (fields.quizVersion !== quiz.quizVersion) throw new ConflictException('문제가 바뀌었어요. 새로고침해서 다시 시작해 주세요.');
    if (!Array.isArray(fields.choices) || fields.choices.length !== quiz.questions.length) {
      throw new BadRequestException('모든 문제의 답을 골라 주세요.');
    }

    const choices = new Map<string, string>();
    for (const item of fields.choices) {
      if (typeof item?.questionId !== 'string' || typeof item?.optionId !== 'string' || choices.has(item.questionId)) {
        throw new BadRequestException('중복된 답이나 올바르지 않은 선택이 있어요.');
      }
      choices.set(item.questionId, item.optionId);
    }

    let score = 0;
    const feedback: QuizFeedback[] = quiz.questions.map(({ id, options, correctOptionId }) => {
      const optionId = choices.get(id);
      if (!optionId || !options.some((option) => option.id === optionId)) {
        throw new BadRequestException('문제에 있는 보기에서 답을 골라 주세요.');
      }
      if (optionId === correctOptionId) score++;
      return { questionId: id, optionId, correctOptionId };
    });
    const total = quiz.questions.length;
    return {
      badge: badgeFromScore(score, total),
      bestBadge: this.badges.award(account.id, slug, score, total),
      feedback,
    };
  }
}
