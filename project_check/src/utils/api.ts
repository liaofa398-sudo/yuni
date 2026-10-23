import type {
  CompanionConfig,
  MemoryItem,
  ChatMessage,
  ServerStatusResponse,
} from '../types.ts';

function getVisitorId(): string {
  if (typeof window === 'undefined') return 'visitor_ssr';
  let id = localStorage.getItem('yuni_visitor_id');
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem('yuni_visitor_id', id);
  }
  return id;
}

export function getStoredAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('yuni_admin_token');
}

export function setStoredAdminToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('yuni_admin_token', token);
  } else {
    localStorage.removeItem('yuni_admin_token');
  }
}

export function getStoredAccessCode(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('yuni_access_code') || '';
}

export function setStoredAccessCode(code: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('yuni_access_code', code);
}

const headers = (extra: Record<string, string> = {}) => {
  const visitorId = getVisitorId();
  const adminToken = getStoredAdminToken();
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Visitor-Id': visitorId,
    ...extra,
  };
  if (adminToken) {
    h['X-Admin-Token'] = adminToken;
  }
  return h;
};

export async function fetchServerStatus(): Promise<ServerStatusResponse> {
  const res = await fetch('/api/status', {
    headers: headers(),
  });
  if (!res.ok) throw new Error('无法连接到服务');
  return res.json();
}

export async function fetchCompanionConfig(): Promise<CompanionConfig & { hasApiKey: boolean }> {
  const res = await fetch('/api/companion/config', {
    headers: headers(),
  });
  if (!res.ok) throw new Error('获取人设信息失败');
  return res.json();
}

export async function verifyAccessCode(code: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/companion/verify-access', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '暗号验证未通过');
  return data;
}

export async function loginAdmin(password: string): Promise<{ success: boolean; token: string }> {
  const res = await fetch('/api/companion/admin/login', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '管理密码错误');
  return data;
}

export async function updateAdminConfig(payload: {
  config?: Partial<CompanionConfig>;
  accessPasscode?: string;
  newAdminPassword?: string;
}): Promise<{ success: boolean; message: string; config: CompanionConfig }> {
  const res = await fetch('/api/companion/admin/update-config', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '更新设置失败');
  return data;
}

export async function fetchMemories(): Promise<MemoryItem[]> {
  const res = await fetch('/api/companion/memories', {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '获取记忆失败');
  return data.memories || [];
}

export async function createMemory(category: string, content: string): Promise<MemoryItem> {
  const res = await fetch('/api/companion/memories', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ category, content }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '保存记忆失败');
  return data.memory;
}

export async function updateMemory(id: string, updates: { content?: string; category?: string }): Promise<MemoryItem> {
  const res = await fetch(`/api/companion/memories/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '修改记忆失败');
  return data.memory;
}

export async function deleteMemory(id: string): Promise<void> {
  const res = await fetch(`/api/companion/memories/${id}`, {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '删除记忆失败');
}

export async function fetchMessages(): Promise<ChatMessage[]> {
  const res = await fetch('/api/companion/messages', {
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '获取聊天历史失败');
  return data.messages || [];
}

export async function clearChatHistory(): Promise<void> {
  const res = await fetch('/api/companion/messages', {
    method: 'DELETE',
    headers: headers(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || '清空聊天记录失败');
}

export async function sendChatMessage(
  message: string,
  accessCode?: string
): Promise<{
  message: ChatMessage;
  remainingToday: number;
  isSimulated?: boolean;
  notice?: string;
}> {
  const res = await fetch('/api/companion/chat', {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ message, accessCode }),
  });
  const data = await res.json();
  if (!res.ok) {
    const error: any = new Error(data.message || '发送失败');
    error.code = data.code;
    error.remainingToday = data.remainingToday;
    error.waitSeconds = data.waitSeconds;
    throw error;
  }
  return data;
}
