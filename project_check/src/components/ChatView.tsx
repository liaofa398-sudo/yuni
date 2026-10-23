import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, AlertCircle, Info, RefreshCw, Copy, Check } from 'lucide-react';
import type { ChatMessage, CompanionConfig, VisitorQuotaStatus } from '../types.ts';

interface ChatViewProps {
  config: CompanionConfig;
  messages: ChatMessage[];
  quota: VisitorQuotaStatus | null;
  hasApiKey: boolean;
  isLoading: boolean;
  onSendMessage: (text: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
  onOpenLetter: () => void;
  onOpenMemories: () => void;
}

const AVATAR_URL = '/src/assets/images/companion_avatar_1792496884674.jpg';

const QUICK_STARTERS = [
  '今天有点累，想听听你的声音',
  '想和你分享一件特别开心的事',
  '我平时最喜欢喝热牛奶和看夜空',
  '答应我，以后每天都要开开心心的',
  '今晚月色真美，送你一句晚安',
];

export const ChatView: React.FC<ChatViewProps> = ({
  config,
  messages,
  quota,
  hasApiKey,
  isLoading,
  onSendMessage,
  onClearHistory,
  onOpenLetter,
  onOpenMemories,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages, isLoading]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // Auto grow textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const copyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-53px)] max-w-2xl mx-auto w-full bg-[#faf7f5]">
      {/* Top Companion Status Banner */}
      <div className="px-4 py-2 border-b border-[#ebdcd5] bg-[#f5ede8]/60 flex items-center justify-between text-xs text-[#7d6860]">
        <div className="flex items-center gap-2">
          <img
            src={AVATAR_URL}
            alt={config.name}
            referrerPolicy="no-referrer"
            className="w-6 h-6 rounded-full object-cover border border-[#d8c3bc]"
          />
          <span className="font-medium text-[#4a3933]">{config.name}</span>
          <span>·</span>
          <span className="text-[#8c766e]">{config.relationship}</span>
        </div>

        <div className="flex items-center gap-2">
          {quota && (
            <span className="font-mono text-[#8c766e]">
              今日还可聊 {quota.remainingToday} 次
            </span>
          )}
          {messages.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-[#9c847b] hover:text-rose-600 p-1 rounded transition-colors"
              title="清空聊天记录"
              aria-label="清空聊天记录"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Free / Preview Mode Info Banner if API Key is not set */}
      {!hasApiKey && (
        <div className="mx-4 mt-2 p-2.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-2 text-xs text-amber-800">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">当前为本地温情体验模式</p>
            <p className="text-amber-700 mt-0.5">
              服务端尚未检测到 <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">DEEPSEEK_API_KEY</code>。
              你可以先随意体验交互，在环境变量配置密钥后即可接入 DeepSeek 官方大模型。
            </p>
          </div>
        </div>
      )}

      {/* Chat Messages Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Companion Welcome Card if no conversation yet */}
        {messages.length === 0 && (
          <div className="my-4 p-5 bg-white rounded-2xl border border-[#ebdcd5] shadow-xs text-center space-y-3">
            <div className="relative w-16 h-16 mx-auto">
              <img
                src={AVATAR_URL}
                alt={config.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full object-cover mx-auto shadow-sm border-2 border-white ring-2 ring-rose-100"
              />
              <div className="absolute -bottom-1 -right-1 bg-rose-500 text-white p-1 rounded-full text-[10px]">
                <Sparkles className="w-3 h-3" />
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="font-serif-sc font-bold text-base text-[#4a3933]">
                {config.name}
              </h3>
              <p className="text-xs text-[#8c766e]">
                为你专属定制的陪伴伙伴 · {config.relationship}
              </p>
            </div>

            <div className="p-3 bg-[#faf7f5] rounded-xl text-xs text-[#5c4942] leading-relaxed text-left border border-[#ebdcd5]/60 font-serif-sc">
              {config.openingMessage}
            </div>

            <div className="flex justify-center gap-2 pt-1 text-xs">
              <button
                onClick={onOpenLetter}
                className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors font-medium"
              >
                💌 查看专属心意寄语
              </button>
              <button
                onClick={onOpenMemories}
                className="px-3 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg transition-colors font-medium"
              >
                ✨ 查看记忆宝盒
              </button>
            </div>
          </div>
        )}

        {/* Messages List */}
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {!isUser && (
                <img
                  src={AVATAR_URL}
                  alt={config.name}
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#d8c3bc] mt-1"
                />
              )}

              <div
                className={`max-w-[82%] sm:max-w-[75%] rounded-2xl p-3.5 text-sm leading-relaxed relative group ${
                  isUser
                    ? 'bg-[#4a3933] text-white rounded-tr-xs'
                    : 'bg-white text-[#2d2825] border border-[#ebdcd5] rounded-tl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap break-words">{msg.content}</div>

                <div
                  className={`flex items-center justify-between gap-3 mt-1.5 text-[10px] ${
                    isUser ? 'text-white/60' : 'text-[#a38e86]'
                  }`}
                >
                  <span className="font-mono">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  <button
                    onClick={() => copyText(msg.id, msg.content)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-rose-500"
                    title="复制内容"
                    aria-label="复制内容"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading / Thinking State */}
        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <img
              src={AVATAR_URL}
              alt={config.name}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full object-cover shrink-0 border border-[#d8c3bc] animate-pulse"
            />
            <div className="bg-white border border-[#ebdcd5] rounded-2xl rounded-tl-xs p-3.5 text-xs text-[#7d6860] flex items-center gap-2 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
              <span>{config.name} 正在温热地组织语句...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Starters Carousel (Thumb Zone) */}
      <div className="px-4 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-t border-[#ebdcd5]/60 bg-[#faf7f5]">
        {QUICK_STARTERS.map((starter, i) => (
          <button
            key={i}
            onClick={() => {
              setInputText(starter);
              textareaRef.current?.focus();
            }}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-white hover:bg-rose-50 border border-[#ebdcd5] text-[#6b5851] rounded-full transition-colors shrink-0"
          >
            {starter}
          </button>
        ))}
      </div>

      {/* Bottom Input Area */}
      <div className="p-3 bg-white border-t border-[#ebdcd5] pb-safe">
        <div className="flex items-end gap-2 bg-[#faf7f5] border border-[#ebdcd5] focus-within:border-[#8c766e] rounded-2xl px-3 py-2 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`对${config.name}说点什么...（Enter 发送）`}
            maxLength={800}
            className="flex-1 bg-transparent resize-none text-sm text-[#2d2825] placeholder-[#a38e86] focus:outline-hidden max-h-28 leading-5"
          />

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-[#a38e86] font-mono">
              {inputText.length}/800
            </span>
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={`p-2 rounded-xl transition-all ${
                inputText.trim() && !isLoading
                  ? 'bg-[#4a3933] text-white hover:bg-rose-900 active:scale-95'
                  : 'bg-[#ebdcd5] text-[#a38e86] cursor-not-allowed'
              }`}
              title="发送消息"
              aria-label="发送消息"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full border border-[#ebdcd5] shadow-lg space-y-3">
            <h4 className="font-serif-sc font-bold text-base text-[#4a3933]">
              清空聊天记录？
            </h4>
            <p className="text-xs text-[#7d6860] leading-relaxed">
              确定要清空当前的聊天会话吗？已收进「记忆宝盒」的重要回忆仍会保留在服务端，不会丢失。
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-xs text-[#7d6860] hover:bg-[#faf7f5] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  setShowClearConfirm(false);
                  await onClearHistory();
                }}
                className="px-3 py-1.5 text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 rounded-lg transition-colors"
              >
                确认清空
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
