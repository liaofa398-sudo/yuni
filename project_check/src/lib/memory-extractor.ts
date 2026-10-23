import type { MemoryCategory } from '../types.ts';

export interface ExtractedMemoryCandidate {
  category: MemoryCategory;
  content: string;
}

export function extractMemoriesFromText(text: string): ExtractedMemoryCandidate[] {
  if (!text || text.trim().length < 2) return [];

  const candidates: ExtractedMemoryCandidate[] = [];
  const clean = text.trim();

  // 1. Preference / Likes / Dislikes
  const likeMatches = clean.match(/(?:我(?:很|最|超级|特别)?喜欢|我(?:平时|特别)?爱吃|我超爱|我倾向于)([^，。！？\n]+)/);
  if (likeMatches && likeMatches[1]?.trim().length > 1) {
    candidates.push({
      category: 'preference',
      content: `喜好：${likeMatches[1].trim()}`,
    });
  }

  const dislikeMatches = clean.match(/(?:我(?:很|最|特别)?讨厌|我不喜欢|我受不了|我抗拒)([^，。！？\n]+)/);
  if (dislikeMatches && dislikeMatches[1]?.trim().length > 1) {
    candidates.push({
      category: 'preference',
      content: `不喜：${dislikeMatches[1].trim()}`,
    });
  }

  // 2. Important dates / Anniversaries / Birthdays
  const birthdayMatches = clean.match(/(?:我(?:的)?生日(?:是|在)?|生日是)([^，。！？\n]+)/);
  if (birthdayMatches && birthdayMatches[1]?.trim().length > 1) {
    candidates.push({
      category: 'important_date',
      content: `生日：${birthdayMatches[1].trim()}`,
    });
  }

  const anniversaryMatches = clean.match(/(?:纪念日(?:是)?|我们的纪念日|约定在)([^，。！？\n]+)/);
  if (anniversaryMatches && anniversaryMatches[1]?.trim().length > 1) {
    candidates.push({
      category: 'important_date',
      content: `重要日子：${anniversaryMatches[1].trim()}`,
    });
  }

  // 3. Promises & Agreements
  const promiseMatches = clean.match(/(?:我们约定|答应我|拉勾|说好了|以后要一起)([^，。！？\n]+)/);
  if (promiseMatches && promiseMatches[1]?.trim().length > 1) {
    candidates.push({
      category: 'promise',
      content: `约定：${promiseMatches[1].trim()}`,
    });
  }

  // 4. Life details (pets, occupations, location, nickname)
  const nameMatches = clean.match(/(?:我叫|我的名字(?:是|叫)|叫我)([^，。！？\n]+)/);
  if (nameMatches && nameMatches[1]?.trim().length > 1) {
    candidates.push({
      category: 'life_detail',
      content: `名字/称呼：${nameMatches[1].trim()}`,
    });
  }

  const petMatches = clean.match(/(?:我养了(?:一只|个)?|家里有只)([^，。！？\n]+)/);
  if (petMatches && petMatches[1]?.trim().length > 1) {
    candidates.push({
      category: 'life_detail',
      content: `宠物：${petMatches[1].trim()}`,
    });
  }

  // 5. Emotion / Mental state
  const emotionMatches = clean.match(/(?:最近(?:感到|觉得)?|今天觉得|这几天)(压力很大|特别难过|好累|心情很低落|特别开心|超有成就感)/);
  if (emotionMatches && emotionMatches[1]?.trim().length > 1) {
    candidates.push({
      category: 'emotion',
      content: `近期心境：${emotionMatches[1].trim()}`,
    });
  }

  return candidates;
}

export function deduplicateMemories(
  newCandidates: ExtractedMemoryCandidate[],
  existingMemories: { content: string }[]
): ExtractedMemoryCandidate[] {
  const existingSet = new Set(existingMemories.map((m) => m.content.trim().toLowerCase()));
  return newCandidates.filter((c) => !existingSet.has(c.content.trim().toLowerCase()));
}
