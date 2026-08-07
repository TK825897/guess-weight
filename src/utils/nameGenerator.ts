import type { Language } from '../i18n';

const words: Record<Language, { adjectives: string[]; nouns: string[] }> = {
  zh: {
    adjectives: ['快乐', '勇敢', '聪明', '活泼', '幸运', '可爱', '优雅', '神秘', '闪耀', '梦幻', '阳光', '温柔'],
    nouns: ['小猫', '小狗', '兔子', '熊猫', '海豚', '松鼠', '狐狸', '企鹅', '老虎', '狮子', '小鹿', '小熊', '鲸鱼', '鲨鱼', '章鱼', '海龟', '水母', '海星', '螃蟹', '龙虾', '海马', '鹦鹉', '老鹰', '猫头鹰', '麻雀', '孔雀', '白鹭', '天鹅', '翠鸟', '啄木鸟', '喜鹊'],
  },
  en: {
    adjectives: ['Happy', 'Brave', 'Clever', 'Playful', 'Lucky', 'Gentle', 'Swift', 'Sunny', 'Shining', 'Dreamy', 'Mighty', 'Curious'],
    nouns: ['Cat', 'Dog', 'Rabbit', 'Panda', 'Dolphin', 'Squirrel', 'Fox', 'Penguin', 'Tiger', 'Lion', 'Deer', 'Bear', 'Whale', 'Shark', 'Octopus', 'Turtle', 'Jellyfish', 'Starfish', 'Crab', 'Lobster', 'Seahorse', 'Parrot', 'Eagle', 'Owl', 'Sparrow', 'Peacock', 'Heron', 'Swan', 'Kingfisher', 'Woodpecker', 'Magpie'],
  },
  ja: {
    adjectives: ['ハッピー', 'げんきな', 'やさしい', 'すばやい', 'ラッキー', 'かしこい', 'ゆうかんな', 'かがやく', 'おちゃめな', 'ふしぎな'],
    nouns: ['ネコ', 'イヌ', 'ウサギ', 'パンダ', 'イルカ', 'リス', 'キツネ', 'ペンギン', 'トラ', 'ライオン', 'シカ', 'クマ', 'クジラ', 'サメ', 'タコ', 'ウミガメ', 'クラゲ', 'ヒトデ', 'カニ', 'ロブスター', 'タツノオトシゴ', 'インコ', 'ワシ', 'フクロウ', 'スズメ', 'クジャク', 'サギ', 'ハクチョウ', 'カワセミ', 'キツツキ', 'カササギ'],
  },
};

export function generateRandomName(language: Language): string {
  const selected = words[language];
  const adjective = selected.adjectives[Math.floor(Math.random() * selected.adjectives.length)];
  const noun = selected.nouns[Math.floor(Math.random() * selected.nouns.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${adjective}${noun}${number}`;
}
