import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMemoriesFromText, deduplicateMemories } from './memory-extractor.ts';

test('extracts user food and general preferences', () => {
  const text = '爱弥斯，我特别喜欢吃草莓蛋糕，也很喜欢夏天的夜晚。';
  const candidates = extractMemoriesFromText(text);

  assert.ok(candidates.length >= 1);
  assert.equal(candidates[0].category, 'preference');
  assert.ok(candidates[0].content.includes('草莓蛋糕'));
});

test('extracts user dislike preferences', () => {
  const text = '其实我很讨厌香菜和下雨天鞋子湿掉。';
  const candidates = extractMemoriesFromText(text);

  assert.ok(candidates.length >= 1);
  assert.equal(candidates[0].category, 'preference');
  assert.ok(candidates[0].content.includes('香菜'));
});

test('extracts birthdays and anniversary dates', () => {
  const text = '我的生日是10月24日，别忘了哦！';
  const candidates = extractMemoriesFromText(text);

  assert.ok(candidates.length >= 1);
  assert.equal(candidates[0].category, 'important_date');
  assert.ok(candidates[0].content.includes('10月24日'));
});

test('extracts agreements and promises', () => {
  const text = '我们约定以后每年都要一起去看一次海。';
  const candidates = extractMemoriesFromText(text);

  assert.ok(candidates.length >= 1);
  assert.equal(candidates[0].category, 'promise');
  assert.ok(candidates[0].content.includes('去看一次海'));
});

test('deduplicates against existing stored memories', () => {
  const extracted = [
    { category: 'preference' as const, content: '喜好：草莓蛋糕' },
    { category: 'life_detail' as const, content: '名字/称呼：爱弥斯' },
  ];
  const existing = [
    { content: '喜好：草莓蛋糕' },
  ];

  const unique = deduplicateMemories(extracted, existing);
  assert.equal(unique.length, 1);
  assert.equal(unique[0].content, '名字/称呼：爱弥斯');
});
