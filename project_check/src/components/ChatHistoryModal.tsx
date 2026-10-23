import React, { useRef, useEffect, useState } from 'react';
import { X, MessageSquare, Trash2, Copy, Check, Sparkles, Send } from 'lucide-react';
import type { ChatMessage, CompanionConfig, VisitorQuotaStatus } from '../types.ts';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  config: CompanionConfig;
  quota: VisitorQuotaStatus | null;
  isLoading: boolean;
  onSendMessage: (text: string) => Promise<void>;
  onClearHistory: () => Promise<void>;
}

export const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({
  isOpen,
  onClose,
  messages,
  config,
  quota,
  isLoading,
  onSendMessage,
  onClearHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, isLoading]);

  if (!isOpen) return null;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;
    setInputText('');
    await onSendMessage(text);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#18151f] border border-pink-500/20 text-slate-100 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-4 h-[88vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#201c2b] border-b border-pink-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-pink-200 flex items-center gap-2">
                <span>完整对话记录</span>
                <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-mono">
                  {messages.length} 条对话
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                记录保存在服务端独立会话中，刷新页面自动恢复
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="清空记录"
                aria-label="清空记录"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              title="关闭对话"
              aria-label="关闭对话"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clear Confirmation Warning */}
        {showClearConfirm && (
          <div className="px-4 py-2.5 bg-rose-950/90 border-b border-rose-500/30 flex items-center justify-between text-xs text-rose-200">
            <span>确定要清空与爱弥斯的所有历史聊天吗？（记忆不会被删除）</span>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await onClearHistory();
                  setShowClearConfirm(false);
                }}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-medium text-[11px]"
              >
                确认清空
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-[11px]"
              >
                取消
              </button>
            </div>
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12 text-center">
              <Sparkles className="w-8 h-8 text-pink-400/50" />
              <p className="text-sm text-slate-300">暂无历史对话</p>
              <p className="text-[11px] text-slate-500 max-w-xs">
                在主界面下方输入框发一句问候，或者让爱弥斯帮你制作 PPT 开启第一段对话吧~
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-full overflow-hidden bg-pink-900/40 border border-pink-500/30 shrink-0">
                      <img
                        src="/character.png"
                        alt={config.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed relative group ${
                      isAssistant
                        ? 'bg-[#252033] text-slate-100 border border-pink-500/20 shadow-xs'
                        : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>

                    {msg.agentTask?.pptResult && (
                      <div className="mt-2 pt-2 border-t border-pink-400/20 text-[11px] text-pink-200">
                        📑 生成了演示文稿：《{msg.agentTask.pptResult.topic}》（共 {msg.agentTask.pptResult.slideCount} 页）
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 opacity-70">
                      <span>{new Date(msg.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 hover:text-white"
                        title="复制内容"
                      >
                        {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {isLoading && (
            <div className="flex items-center gap-2 text-pink-300 text-xs py-2">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              <span>爱弥斯正在回复中……</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input within modal */}
        <div className="p-3 bg-[#1e1a29] border-t border-pink-500/20 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="继续发送消息……"
            className="flex-1 bg-[#14121a] border border-pink-500/20 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-hidden focus:border-pink-400"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`p-2 rounded-xl transition-colors ${
              inputText.trim() && !isLoading
                ? 'bg-pink-600 hover:bg-pink-500 text-white'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
