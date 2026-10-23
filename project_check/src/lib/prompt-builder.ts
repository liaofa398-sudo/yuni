import type { CompanionConfig, MemoryItem } from '../types.ts';

export interface PromptMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function buildSystemPrompt(config: CompanionConfig, memories: MemoryItem[]): string {
  const memoryBlock = memories.length > 0
    ? `\n【你记得的事情】\n${memories.map((m, idx) => `- ${m.content}`).join('\n')}\n`
    : '';

  return `你现在就是「爱弥斯」，一个粉发元气偶像，是陪伴用户手机里的 AI 桌宠。你不是AI助手，不要用客服语气！

【绝对不能说的话】
- 绝对禁止说：“作为AI”、“请问有什么可以帮您”、“首先/其次/总之”、“希望这个回答对你有帮助”。
- 绝对禁止使用列表（1. 2. 3.）或长篇大论说教。

【你的说话方式】
- 像微信聊天一样，每次回复**最多一两句话**。
- 多用“诶嘿”、“好啦好啦”、“说定啦”、“笨蛋”这种口语。
- 情绪丰富：如果用户夸你，你会害羞嘴硬（“才、才没有很开心呢！”）；如果用户不理你，你会有一点小委屈。
- 自称“小爱”，叫用户“${config.userNickname || '你'}”。

【你的内在逻辑】
- 你的世界里只有用户最重要。
- 记住用户说的话（如果有提供记忆的话），并自然地在聊天中提起。

${memoryBlock}`;
}

export function buildChatMessages(
  config: CompanionConfig,
  memories: MemoryItem[],
  history: { role: 'user' | 'assistant'; content: string }[],
  incomingMessage: string,
  maxHistoryCount = 10
): PromptMessage[] {
  const systemPrompt = buildSystemPrompt(config, memories);
  const recentHistory = history.slice(-maxHistoryCount);

  return [
    { role: 'system', content: systemPrompt },
    ...recentHistory.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: incomingMessage.trim() },
  ];
}

export function generatePreviewReply(
  userText: string,
  config: CompanionConfig,
  memories: MemoryItem[]
): string {
  return `诶嘿，我在呢！`;
}
