import type { AnimeCard } from '@cutlog/contracts';

type CatalogEntry = Omit<AnimeCard, 'average' | 'count'> & {
  description: string;
  aliases: string[];
};

export const catalog: CatalogEntry[] = [
  {
    slug: 'frieren',
    title: '장송의 프리렌',
    originalTitle: 'Frieren: Beyond Journey’s End',
    aliases: ['Sousou no Frieren', '葬送のフリーレン', '프리렌'],
    year: 2023,
    genres: ['판타지', '모험'],
    episodeCount: 28,
    cover: '/art/frieren.jpg',
    description: '마왕을 물리친 모험이 끝나고, 엘프 마법사 프리렌은 오래 살다 보니 미처 헤아리지 못했던 마음을 찾아 다시 길을 떠난다.',
  },
  {
    slug: 'dungeon-meshi',
    title: '던전밥',
    originalTitle: 'Delicious in Dungeon',
    aliases: ['Dungeon Meshi', 'ダンジョン飯'],
    year: 2024,
    genres: ['판타지', '모험'],
    episodeCount: 24,
    cover: '/art/dungeon.jpg',
    description: '동료를 구하기 위해 던전으로 돌아온 모험가들. 식량이 떨어진 그들은 눈앞의 몬스터를 요리하며 지하 깊은 곳으로 향한다.',
  },
  {
    slug: 'apothecary-diaries',
    title: '약사의 혼잣말',
    originalTitle: 'The Apothecary Diaries',
    aliases: ['Kusuriya no Hitorigoto', '薬屋のひとりごと'],
    year: 2023,
    genres: ['미스터리', '드라마'],
    episodeCount: 24,
    cover: '/art/apothecary.jpg',
    description: '궁에서 일하게 된 약사 마오마오는 약과 독에 관한 지식을 바탕으로 후궁에 얽힌 사건을 하나씩 풀어 간다.',
  },
  {
    slug: 'bocchi-the-rock',
    title: '봇치 더 록!',
    originalTitle: 'BOCCHI THE ROCK!',
    aliases: ['ぼっち・ざ・ろっく', '봇치더락'],
    year: 2022,
    genres: ['음악', '일상'],
    episodeCount: 12,
    cover: '/art/bocchi.jpg',
    description: '혼자 기타를 연습하던 고토 히토리는 결속 밴드에 합류하면서 동료를 만나고 무대 위에서 자신의 소리를 찾아간다.',
  },
  {
    slug: 'mob-psycho-100-ii',
    title: '모브사이코 100 II',
    originalTitle: 'Mob Psycho 100 II',
    aliases: ['モブサイコ100', '모브사이코 2기'],
    year: 2019,
    genres: ['액션', '코미디'],
    episodeCount: 13,
    cover: '/art/mob.jpg',
    description: '강력한 초능력을 지닌 중학생 모브는 사람들과 어울리며 능력만으로는 해결할 수 없는 문제들을 마주한다.',
  },
  {
    slug: 'violet-evergarden',
    title: '바이올렛 에버가든',
    originalTitle: 'Violet Evergarden',
    aliases: ['ヴァイオレット・エヴァーガーデン'],
    year: 2018,
    genres: ['드라마', '판타지'],
    episodeCount: 13,
    cover: '/art/violet.jpg',
    description: '전쟁이 끝난 뒤, 편지를 대신 써 주는 일을 시작한 바이올렛은 다양한 사람의 마음을 글로 옮기며 마지막으로 들은 말의 의미를 찾아간다.',
  },
];

export const sampleReviews = [
  ['frieren', 1, '여운수집가', 10, '모험이 끝난 자리에서 시작하는 이야기라니. 마지막까지 보고 나니 첫 장면이 다시 떠올랐다.'],
  ['frieren', 1, '필름조각', 9, '프리렌이 시간을 받아들이는 방식이 잔잔하게 전해졌다.'],
  ['frieren', 1, '우유푸딩', 10, '조용한 장면에서도 음악과 배경이 감정을 잘 전달한다.'],
  ['frieren', 0, '여운수집가', 10, '한 장면씩 오래 기억하고 싶은 작품.'],
  ['frieren', 0, '초록책갈피', 9, '인물들의 대사를 곱씹는 재미가 있었다.'],
  ['dungeon-meshi', 1, '마늘빵', 9, '설정 설명과 첫 요리가 자연스럽게 이어져서 바로 다음 편을 틀었다.'],
  ['dungeon-meshi', 0, '마늘빵', 9, '음식과 생태계가 이어지는 설정이 특히 좋았다.'],
  ['apothecary-diaries', 1, '달의약국', 9, '마오마오가 작은 단서를 알아차릴 때마다 같이 추리하는 기분이었다.'],
  ['apothecary-diaries', 0, '달의약국', 10, '마오마오가 사건을 바라보는 관점이 재미있다.'],
  ['bocchi-the-rock', 1, '네번째줄', 9, '연습실 장면만으로도 이 밴드를 계속 보고 싶어졌다.'],
  ['bocchi-the-rock', 0, '네번째줄', 9, '밴드 장면이 나올 때마다 연주에 집중하게 된다.'],
  ['mob-psycho-100-ii', 0, '필름조각', 9, '인물들의 변화가 액션만큼 기억에 남았다.'],
  ['violet-evergarden', 0, '초록책갈피', 9, '편지를 쓰는 사람과 받는 사람 양쪽이 마음에 남는다.'],
  ['violet-evergarden', 0, '필름조각', 10, '인물의 손짓과 표정만으로도 마음이 전해졌다.'],
] as const;
