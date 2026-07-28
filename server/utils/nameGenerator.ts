const adjectives = [
  '快乐', '勇敢', '聪明', '活泼', '幸运', '调皮', '可爱', '机灵',
  '温柔', '威武', '优雅', '神秘', '飞翔', '奔跑', '闪耀', '梦幻',
  '阳光', '彩虹', '星辰', '微风', '蓝天', '碧海', '翠绿', '金黄'
];

const nouns = [
  '小猫', '小狗', '兔子', '熊猫', '海豚', '松鼠', '狐狸', '企鹅',
  '老虎', '狮子', '大象', '长颈鹿', '小鱼', '蝴蝶', '蜜蜂', '海星',
  '小龙虾', '小乌龟', '小海豹', '小鹦鹉', '小鹿', '小熊', '小猴', '小鹰'
];

export function generateRandomName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
}
