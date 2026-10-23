import React, { useState, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface BottomInputBarProps {
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  companionName: string;
}

const QUICK_PROMPTS = [
  '帮我做个关于人工智能发展的PPT',
  '今天有点累，想听听你的声音',
  '你平时都在手机里忙什么呀？',
  '答应我以后每天都要开开心心的',
];

export const BottomInputBar: React.FC<BottomInputBarProps> = ({
  onSendMessage,
  isLoading,
  companionName,
}) => {
  const [inputText, setInputText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 100)}px`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] w-full bg-[#16131f]/95 border-t border-pink-500/20 px-3 pt-2 pb-safe shrink-0 backdrop-blur-md">
      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-2 px-1">
        {QUICK_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => {
              setInputText(prompt);
              textareaRef.current?.focus();
            }}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 bg-slate-800/80 hover:bg-pink-950/60 border border-slate-700/60 hover:border-pink-500/40 text-pink-200/90 rounded-full transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input container */}
      <div className="flex items-end gap-2 bg-[#1f1a2b] border border-pink-500/20 focus-within:border-pink-400 rounded-2xl px-3 py-2 transition-colors shadow-inner">
        <textarea
          ref={textareaRef}
          rows={1}
          value={inputText}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={`和她说点什么……（例如：帮我做个AI发展史的PPT）`}
          maxLength={800}
          className="flex-1 bg-transparent resize-none text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-hidden max-h-24 leading-5"
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`p-2 rounded-xl transition-all ${
              inputText.trim() && !isLoading
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
            title="发送"
            aria-label="发送"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
