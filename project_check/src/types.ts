export type MemoryCategory = 'preference' | 'important_date' | 'promise' | 'life_detail' | 'emotion';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type PetActivity = 'idle' | 'chatting' | 'thinking' | 'happy' | 'sleepy' | 'annoyed' | 'working';

export interface PetState {
  mood: number; // 0 - 100
  energy: number; // 0 - 100
  affection: number; // 0 - 100
  activity: PetActivity;
  statusText: string;
  consecutivePokes: number;
  lastInteractionTime: number;
}

export type ToolRiskLevel = 'L0' | 'L1' | 'L2' | 'L3' | 'L4';

export interface SlideData {
  slideNumber: number;
  title: string;
  subtitle?: string;
  points: string[];
  notes?: string;
  layout?: 'cover' | 'bullets' | 'split' | 'summary';
}

export interface PPTResult {
  id: string;
  topic: string;
  style: 'formal' | 'lively' | 'creative';
  slideCount: number;
  slides: SlideData[];
  createdAt: number;
}

export interface AgentTask {
  taskId: string;
  type: 'create_ppt';
  status: 'planning' | 'generating' | 'completed' | 'failed';
  currentStepText: string;
  pptResult?: PPTResult;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isSimulated?: boolean;
  agentTask?: AgentTask;
}

export interface CompanionConfig {
  name: string;
  userNickname: string;
  relationship: string;
  personality: string;
  speechStyle: string;
  openingMessage: string;
  giftLetter: string;
  giftFrom: string;
  giftTo: string;
  customPrompt: string;
  accessCodeRequired: boolean;
  hasAccessCode: boolean;
  dailyMessageLimit: number;
  model: string;
}

export interface VisitorQuotaStatus {
  todayCount: number;
  dailyLimit: number;
  remainingToday: number;
  resetHoursRemaining: number;
}

export interface ServerStatusResponse {
  ok: boolean;
  hasApiKey: boolean;
  adminConfigured?: boolean;
  model: string;
  accessCodeRequired: boolean;
  quota: VisitorQuotaStatus;
  serverTime: number;
}
