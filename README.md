# 컷로그 (Cutlog)

애니 작품과 회차를 찾아보고, 본 직후 1~10점 평점과 감상을 남기는 애니 리뷰 사이트입니다. 작품별 퀴즈를 완료하면 리뷰를 작성하고 퀴즈 뱃지를 모을 수 있습니다.

## 로컬 실행

Node.js 24.12 이상과 npm을 사용합니다. nvm을 쓰는 경우 프로젝트 루트에서 `nvm use`로 버전을 전환할 수 있습니다.

```bash
npm ci
npm run dev
```

- 웹 앱은 [127.0.0.1:3100](http://127.0.0.1:3100)에서 열립니다.
- API 상태는 [127.0.0.1:4000/api/health](http://127.0.0.1:4000/api/health)에서 확인할 수 있습니다.
- `npm run dev:web`과 `npm run dev:api`로 각각 실행할 수 있습니다. 두 프로세스가 모두 실행 중이어야 웹에서 데이터를 확인할 수 있습니다.
- 프로덕션 빌드는 `npm run build`, 빌드 결과를 가동할 때는 `npm start`, 타입 검사는 `npm run typecheck`를 사용합니다.

## 모노레포

| 경로 | 역할 |
| --- | --- |
| `apps/web` | Next.js App Router. 작품 검색, 장르 필터, 평점순 목록, 작품·회차 상세, 감상 작성 UI, 회원가입·로그인, 작품 퀴즈, 내 뱃지 |
| `apps/api` | NestJS REST API. 작품 카탈로그, 평점 집계, 리뷰 작성 권한, 계정·세션, 퀴즈 출제·채점과 뱃지 저장 |
| `packages/contracts` | 양쪽에서 쓰는 TypeScript 응답 타입 |

Next.js 서버가 `API_URL`을 사용해 NestJS에 요청합니다. 환경을 바꾸려면 `apps/web/.env.example`을 `apps/web/.env.local`로, `apps/api/.env.example`을 `apps/api/.env`로 복사해 수정합니다. HTTPS 환경에서 운영할 때는 웹의 `SITE_URL`을 HTTPS 주소로 지정해 세션 쿠키를 Secure로 설정합니다.

## 데이터

카탈로그에는 예시 작품 6개가 들어 있습니다. 작품 정보와 이미지는 [AniList](https://anilist.co/)를 사용했습니다. 예시 감상에는 샘플 표시가 붙으며 초기 평점에 포함됩니다. 빈 데이터로 시작하려면 새 `DATABASE_PATH`를 지정하고 `SEED_SAMPLE_REVIEWS=false`를 설정합니다.

SQLite 파일은 기본적으로 `apps/api/data/cutlog.sqlite`에 저장됩니다. 첫 실행에 생성되며 서버를 재시작해도 감상이 보존됩니다. 같은 계정으로 같은 작품 또는 회차에 다시 저장하면 기존 평가가 갱신됩니다. 작품과 회차 평점은 별도로 집계되며, 스포일러로 표시한 감상은 방문자가 펼쳐 볼 수 있습니다.

## 리뷰 작성과 뱃지

1. 아이디, 닉네임, 비밀번호로 가입하거나 로그인합니다. 가입 비밀번호는 9~128자입니다.
2. 리뷰를 남길 작품의 퀴즈 5문제를 모두 풀고 결과를 확인합니다. 해당 작품과 그 회차의 리뷰 폼이 열립니다.
3. 정답 수에 따라 참여(0개), 브론즈(1~2개), 실버(3~4개), 골드(5개) 뱃지를 받습니다. 다시 풀어 점수를 올리면 그 작품의 최고 뱃지가 갱신됩니다.
4. 리뷰의 닉네임 옆에는 해당 작품의 최고 뱃지가 표시됩니다. 상단 **내 뱃지**에서 모은 작품별 뱃지를 볼 수 있습니다.

기존 게스트와 샘플 감상은 계속 조회할 수 있습니다. 새 리뷰는 로그인 계정에 연결됩니다. 계정·세션·뱃지도 같은 SQLite 파일에 저장됩니다.

문제는 제작사와 공식 배급사의 작품 소개 및 캐릭터 자료를 바탕으로 작성했습니다.

- [장송의 프리렌](https://madhouse.co.jp/english/works/tv_frieren-anime/) · [던전밥](https://www.netflix.com/tudum/articles/delicious-in-dungeon-release-date-news) · [약사의 혼잣말](https://www.ntv.co.jp/english/pc/2023/10/The-Apothecary-Diaries.html)
- [봇치 더 록!](https://www.aniplus-asia.com/show/bocchi-the-rock/) · [모브사이코 100 II](https://mobpsycho100.com/2nd/) · [바이올렛 에버가든](https://www.kyotoanimation.co.jp/en/works/violet/)

## API

| 메서드 | 경로 | 기능 |
| --- | --- | --- |
| GET | `/api/health` | 상태 확인 |
| GET | `/api/anime?q=&genre=&sort=rating` | 작품 검색, 장르 필터, 평점순 정렬 |
| GET | `/api/anime/:slug` | 작품 정보, 회차별 평점, 작품 감상 |
| GET | `/api/anime/:slug/episodes/:episode` | 회차 정보와 감상 |
| GET | `/api/reviews/recent` | 최근 감상 |
| POST | `/api/anime/:slug/reviews` | 작품 평점·감상 저장 |
| POST | `/api/anime/:slug/episodes/:episode/reviews` | 회차 평점·감상 저장 |
| POST | `/api/auth/register` · `/api/auth/login` · `/api/auth/logout` | 계정 생성, 세션 시작·종료 |
| GET | `/api/auth/me` · `/api/auth/badges` | 내 계정과 작품별 뱃지 |
| GET | `/api/anime/:slug/quiz` | 작품의 문제와 내 최고 뱃지 |
| POST | `/api/anime/:slug/quiz/attempts` | 제출한 답안 전체를 채점하고 최고 기록 저장 |

Next.js는 로그인 세션 쿠키를 읽어 보호된 API에 Bearer 헤더를 보냅니다. 리뷰의 JSON 본문에는 `rating`(정수 1~10), `comment`, `spoiler`만 전달하고 작성자는 API에서 세션의 계정으로 결정합니다. 퀴즈는 `quizVersion`과 `choices`(각 `questionId`, `optionId`)를 제출합니다.
