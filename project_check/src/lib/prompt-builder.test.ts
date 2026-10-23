import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSystemPrompt, buildChatMessages, generatePreviewReply } from './prompt-builder.ts';
import type { CompanionConfig, MemoryItem } from '../types.ts';

const mockConfig: CompanionConfig = {
  name: '爱弥斯',
  userNickname: '爱弥斯',
  relationship: '守护者与知己',
  personality: '温柔细腻、体贴',
  speechStyle: '轻声细语',
  openingMessage: '见信如面，我是爱弥斯。',
  giftLetter: '送给最特别的你。',
  giftFrom: '关心你的人',
  giftTo: '爱弥斯',
  customPrompt: '喜欢在晚上道晚安。',
  accessCodeRequired: false,
  hasAccessCode: false,
  dailyMessageLimit: 60,
  model: 'deepseek-flash',
};

const mockMemories: MemoryItem[] = [
  {
    id: 'm1',
    category: 'preference',
    content: '喜好：草莓牛奶',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

test('buildSystemPrompt injects companion persona and long term memories', () => {
  const prompt = buildSystemPrompt(mockConfig, mockMemories);

  assert.ok(prompt.includes('爱弥斯'));
  assert.ok(prompt.includes('爱弥斯'));
  assert.ok(prompt.includes('守护者与知己'));
  assert.ok(prompt.includes('草莓牛奶'));
  assert.ok(prompt.includes('严禁每句话句末都抛出一个反问句'));
});

test('buildChatMessages structures prompt messages with history and user input', () => {
  const history = [
    { role: 'user' as const, content: '今天好冷呀' },
    { role: 'assistant' as const, content: '记得多披件外套，别着凉了' },
  ];

  const messages = buildChatMessages(mockConfig, mockMemories, history, '明天想去散步', 5);

  assert.equal(messages[0].role, 'system');
  assert.equal(messages.length, 4);
  assert.equal(messages[messages.length - 1].content, '明天想去散步');
});

test('generatePreviewReply produces affectionate response when API key is pending', () => {
  const replyTired = generatePreviewReply('今天工作好累啊', mockConfig, mockMemories);
  assert.ok(replyTired.includes('爱弥斯'));
  assert.ok(replyTired.includes('抱抱') || replyTired.includes('辛苦'));

  const replyLike = generatePreviewReply('我特别喜欢草莓蛋糕', mockConfig, mockMemories);
  assert.ok(replyLike.includes('爱弥斯') || replyLike.includes('记下来'));
});
