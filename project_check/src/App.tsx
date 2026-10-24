import {
  fetchCompanionConfig,
  fetchServerStatus,
  fetchMemories,
  fetchMessages,
  sendChatMessage,
  clearChatHistory,
  createMemory,
  updateMemory,
  deleteMemory,
  getStoredAccessCode,
} from './utils/api.ts';
import type {
  CompanionConfig,
  MemoryItem,
  ChatMessage,
  VisitorQuotaStatus,
  MemoryCategory,
  PetState,
  PPTResult,
} from './types.ts';
import { PetMenu } from './components/PetMenu.tsx';
import { PetStage } from './components/PetStage.tsx';
import { BottomInputBar } from './components/BottomInputBar.tsx';
import { StudioModal } from './components/StudioModal.tsx';
import { MemoryModal } from './components/MemoryModal.tsx';
import { GiftLetterModal } from './components/GiftLetterModal.tsx';
import { PersonaModal } from './components/PersonaModal.tsx';
import { AdminModal } from './components/AdminModal.tsx';
import { DeploymentGuideModal } from './components/DeploymentGuideModal.tsx';
import { AccessCodeModal } from './components/AccessCodeModal.tsx';
import { ChatHistoryModal } from './components/ChatHistoryModal.tsx';
import { analyzeUserIntent, executePPTAgentWorkflow } from './agent/agent-engine.ts';
import { AlertTriangle, History } from 'lucide-react';

const PROACTIVE_THOUGHTS = [
  '你还在嘛？悄悄探头看你一眼~',
  '刚刚在发呆……忽然想到你啦。',
  '……我有点无聊了，陪我说说话嘛。',
  '你今天好安静呀，是不是在忙重要的事？',
  '如果累了就靠着休息一会儿，爱弥斯一直都在哦。',
];

export default function App() {
  const [config, setConfig] = useState<CompanionConfig>({
    name: '爱弥斯',
    userNickname: '特别的你',
    relationship: '住在手机里的 AI 陪伴生命体',
    personality: '温柔细腻、体贴入微、亲近自然、偶尔有一点小俏皮与温软',
    speechStyle: '轻声细语，亲切真诚，像身边亲近的人轻声耳语，不官方、不套话，带有烟火气与情感温度',
    openingMessage: '见信如面。我是爱弥斯，受一位很在乎你的人所托，跨过山海来陪伴你。无论什么时候累了、想倾诉了，爱弥斯都会在这里静静听你说。今天过得还好吗？',
    giftLetter: '愿这个安静的小天地，能在你想倾诉或需要温度的每个时刻，给你最柔软的陪伴。\n\n无论白昼漫长，还是夜色渐深，都有一个声音为你温热地守候。愿你被世界温柔以待，岁岁皆安。',
    giftFrom: '在乎你的人',
    giftTo: '特别的你',
    customPrompt: '',
    accessCodeRequired: false,
    hasAccessCode: false,
    dailyMessageLimit: 60,
    model: 'deepseek-flash',
  });

  const [hasApiKey, setHasApiKey] = useState(false);
  const [quota, setQuota] = useState<VisitorQuotaStatus | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Desk Pet Local State
  const [petState, setPetState] = useState<PetState>({
    mood: 90,
    energy: 85,
    affection: 80,
    activity: 'idle',
    statusText: '今天心情不错',
    consecutivePokes: 0,
    lastInteractionTime: Date.now(),
  });

  const [currentBubbleText, setCurrentBubbleText] = useState<string>(
    '嗨！我是住在你手机里的爱弥斯~ 点击我可以和我互动，也可以让我帮你做 PPT 呢！'
  );

  // Agent PPT Studio State
  const [recentPPTs, setRecentPPTs] = useState<PPTResult[]>([]);
  const [activePPT, setActivePPT] = useState<PPTResult | undefined>(undefined);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Modals
  const [isMemoriesOpen, setIsMemoriesOpen] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isAccessCodeNeeded, setIsAccessCodeNeeded] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const lastProactiveTimeRef = useRef<number>(Date.now());
  const pokeResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial Data Fetch
  const loadData = async () => {
    try {
      const [cfg, status, mems, msgs] = await Promise.all([
        fetchCompanionConfig(),
        fetchServerStatus(),
        fetchMemories(),
        fetchMessages(),
      ]);

      setConfig(cfg);
      setHasApiKey(status.hasApiKey);
      setQuota(status.quota);
      setMemories(mems);
      setMessages(msgs);

      if (msgs.length > 0) {
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg.role === 'assistant') {
          setCurrentBubbleText(lastMsg.content);
        }
      }

      if (cfg.accessCodeRequired) {
        const stored = getStoredAccessCode();
        if (!stored) {
          setIsAccessCodeNeeded(true);
        }
      }
    } catch (err: any) {
      console.error('Initialization error:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Proactive Companionship Loop (When user stays idle for 40+ seconds)
  useEffect(() => {
    const idleCheckInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceInteraction = now - petState.lastInteractionTime;
      const timeSinceLastProactive = now - lastProactiveTimeRef.current;

      // Only speak proactively if user has been idle for >= 40s, not currently loading, and 60s cooldown passed
      if (
        timeSinceInteraction > 40000 &&
        timeSinceLastProactive > 60000 &&
        !isLoading &&
        petState.activity === 'idle'
      ) {
        const randomThought = PROACTIVE_THOUGHTS[Math.floor(Math.random() * PROACTIVE_THOUGHTS.length)];
        setCurrentBubbleText(randomThought);
        setPetState((prev) => ({
          ...prev,
          statusText: '刚刚在发呆……',
          activity: 'idle',
        }));
        lastProactiveTimeRef.current = now;
      }
    }, 10000);

    return () => clearInterval(idleCheckInterval);
  }, [petState.lastInteractionTime, isLoading, petState.activity]);

  // Handle Character Poke / Tap
  const handlePoke = () => {
    const now = Date.now();
    lastProactiveTimeRef.current = now;

    if (pokeResetTimerRef.current) {
      clearTimeout(pokeResetTimerRef.current);
    }

    const nextPokes = petState.consecutivePokes + 1;
    let nextActivity: PetState['activity'] = 'happy';
    let nextStatus = '被轻轻戳了一下~';

    if (nextPokes >= 3) {
      nextActivity = 'annoyed';
      nextStatus = '喂，别一直戳啦！';
    }

    setPetState((prev) => ({
      ...prev,
      consecutivePokes: nextPokes,
      lastInteractionTime: now,
      affection: Math.min(100, prev.affection + 1),
      activity: nextActivity,
      statusText: nextStatus,
    }));

    // Reset poke count after 2.5s of no clicks
    pokeResetTimerRef.current = setTimeout(() => {
      setPetState((prev) => ({
        ...prev,
        consecutivePokes: 0,
        activity: 'idle',
        statusText: prev.energy < 40 ? '有点困了……' : '今天心情不错',
      }));
    }, 2500);
  };

  // Main Send Handler (Dispatches between PPT Agent Tool & Chat)
  const handleSendMessage = async (text: string) => {
    setErrorMessage(null);
    setIsLoading(true);
    const now = Date.now();
    lastProactiveTimeRef.current = now;

    const accessCode = getStoredAccessCode();

    // 1. Analyze User Intent for Agent Tool invocation
    const intent = analyzeUserIntent(text);

    if (intent.isTask && intent.toolName === 'create_ppt' && intent.extractedArgs) {
      // Desk Pet Enters Working Mode!
      setPetState((prev) => ({
        ...prev,
        activity: 'working',
        statusText: '正在工坊制作 PPT……',
        lastInteractionTime: now,
      }));

      setCurrentBubbleText('好呀！主题收到啦，爱弥斯这就为你开工做 PPT，稍等我一下下哦~');

      try {
        const pptTask = await executePPTAgentWorkflow(intent.extractedArgs, (update) => {
          setCurrentBubbleText(update.stepText);
          if (update.phase === 'generating') {
            setPetState((prev) => ({ ...prev, statusText: '正在撰写逐页内容……' }));
          }
        });

        if (pptTask.pptResult) {
          const generatedPPT = pptTask.pptResult;
          setRecentPPTs((prev) => [generatedPPT, ...prev]);
          setActivePPT(generatedPPT);

          // Save assistant message with PPT card
          const botMsg: ChatMessage = {
            id: `msg_ppt_${Date.now()}`,
            role: 'assistant',
            content: `已为你制作好【${generatedPPT.topic}】演示文稿（共 ${generatedPPT.slideCount} 页）！可以点击气泡下方按钮进入工坊预览或下载课件哦~`,
            timestamp: Date.now(),
            agentTask: pptTask,
          };

          setMessages((prev) => [...prev, { id: `u_${now}`, role: 'user', content: text, timestamp: now }, botMsg]);
          setCurrentBubbleText(`大功告成！【${generatedPPT.topic}】PPT 已经做好了，快进入工坊看看吧~`);

          setPetState((prev) => ({
            ...prev,
            activity: 'happy',
            statusText: 'PPT 制作完成！',
            affection: Math.min(100, prev.affection + 3),
          }));
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'PPT 制作遇到了一点小麻烦');
        setCurrentBubbleText('呜呜，刚才制作幻灯片时卡壳了，请再试一次吧~');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. Regular Conversation via DeepSeek Server-Side proxy
    setPetState((prev) => ({
      ...prev,
      activity: 'thinking',
      statusText: '正在认真思考……',
      lastInteractionTime: now,
    }));

    try {
      const result = await sendChatMessage(text, accessCode);

      setMessages((prev) => [
        ...prev,
        { id: `u_${now}`, role: 'user', content: text, timestamp: now },
        result.message,
      ]);

      setCurrentBubbleText(result.message.content);

      setPetState((prev) => ({
        ...prev,
        activity: 'chatting',
        statusText: '和你聊天很开心',
        affection: Math.min(100, prev.affection + 1),
      }));

      if (quota) {
        setQuota({
          ...quota,
          todayCount: quota.todayCount + 1,
          remainingToday: result.remainingToday,
        });
      }

      // Check for newly extracted memories in background
      fetchMemories().then((newMems) => setMemories(newMems)).catch(() => {});
    } catch (err: any) {
      if (err.code === 'ACCESS_CODE_REQUIRED') {
        setIsAccessCodeNeeded(true);
        setErrorMessage('需要输入专属暗号才能开启与爱弥斯的对话哦~');
      } else {
        setErrorMessage(err.message || '发送失败，请稍后重试');
        setCurrentBubbleText('哎呀，网络好像打了个盹，刚才的话我没听清……');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearChatHistory();
      setMessages([]);
      setCurrentBubbleText('聊天记录已经清空啦，我们重新开始吧~');
    } catch (err: any) {
      setErrorMessage(err.message || '清空聊天记录失败');
    }
  };

  const handleAddMemory = async (category: MemoryCategory, content: string) => {
    const mem = await createMemory(category, content);
    setMemories((prev) => [mem, ...prev]);
  };

  const handleUpdateMemory = async (id: string, updates: { content?: string; category?: string }) => {
    const mem = await updateMemory(id, updates);
    setMemories((prev) => prev.map((m) => (m.id === id ? mem : m)));
  };

  const handleDeleteMemory = async (id: string) => {
    await deleteMemory(id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#110e19] text-slate-100 antialiased overflow-hidden select-none">
      {/* Top Menu Bar */}
      <PetMenu
        companionName={config.name}
        onOpenMemories={() => setIsMemoriesOpen(true)}
        onOpenStudio={() => setIsStudioOpen(true)}
        onOpenLetter={() => setIsLetterOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenDeploy={() => setIsDeployOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        memoryCount={memories.length}
        messageCount={messages.length}
        hasActiveTask={recentPPTs.length > 0}
      />

      {/* Global Error Alert Banner */}
      {errorMessage && (
        <div className="max-w-md mx-auto w-full px-4 pt-2 z-30">
          <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 text-rose-200 rounded-xl text-xs flex items-center justify-between backdrop-blur-md">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-rose-200 font-bold px-1"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Desk Pet Stage (Focal Area) */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full overflow-hidden">
        <PetStage
          state={petState}
          onPoke={handlePoke}
          bubbleText={currentBubbleText}
          isThinking={isLoading}
          activePPT={activePPT}
          onOpenStudio={() => setIsStudioOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          companionName={config.name}
        />
      </main>

      {/* Bottom Text Input Bar */}
      <BottomInputBar
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        companionName={config.name}
      />

      {/* Modals & Drawers */}
      <ChatHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        messages={messages}
        config={config}
        quota={quota}
        isLoading={isLoading}
        onSendMessage={handleSendMessage}
        onClearHistory={handleClearHistory}
      />

      <StudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        recentPPTs={recentPPTs}
        activePPT={activePPT}
      />

      <MemoryModal
        memories={memories}
        isOpen={isMemoriesOpen}
        onClose={() => setIsMemoriesOpen(false)}
        onAddMemory={handleAddMemory}
        onUpdateMemory={handleUpdateMemory}
        onDeleteMemory={handleDeleteMemory}
        companionName={config.name}
      />

      <GiftLetterModal
        config={config}
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
      />

      <PersonaModal
        config={config}
        isOpen={isPersonaOpen}
        onClose={() => setIsPersonaOpen(false)}
        onEditInAdmin={() => setIsAdminOpen(true)}
      />

      <DeploymentGuideModal
        isOpen={isDeployOpen}
        onClose={() => setIsDeployOpen(false)}
      />

      <AdminModal
        config={config}
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onConfigUpdated={(newCfg) => setConfig(newCfg)}
      />

      <AccessCodeModal
        isOpen={isAccessCodeNeeded}
        companionName={config.name}
        onSuccess={() => {
          setIsAccessCodeNeeded(false);
          loadData();
        }}
      />
    </div>
  );
}
