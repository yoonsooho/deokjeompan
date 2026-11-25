import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { AccountsService } from './accounts.service';
import { AuthController } from './auth.controller';
import { BadgesService } from './badges.service';
import { CutlogDatabase } from './database';
import { AnimeController } from './anime.controller';
import { QuizController } from './quiz.controller';
import { ReviewsService } from './reviews.service';

@Module({
  controllers: [AnimeController, AuthController, QuizController],
  providers: [CutlogDatabase, AccountsService, BadgesService, ReviewsService],
})
export class AppModule {}

async function bootstrap() {
  if (existsSync('.env')) loadEnvFile();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  const port = Number(process.env.PORT ?? 4000);
  const host = process.env.API_HOST || '127.0.0.1';
  await app.listen(port, host);
  console.log(`Cutlog API listening on http://${host}:${port}/api`);
}

if (require.main === module) {
  bootstrap().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
