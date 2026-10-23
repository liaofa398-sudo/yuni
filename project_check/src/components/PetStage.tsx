import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Presentation, Heart, Zap, MessageSquare } from 'lucide-react';
import type { PetState, PPTResult } from '../types.ts';
import { ttsService } from '../services/tts.ts';

interface PetStageProps {
  state: PetState;
  onPoke: () => void;
  bubbleText: string;
  isThinking: boolean;
  activePPT?: PPTResult;
  onOpenStudio: () => void;
  onOpenHistory?: () => void;
  companionName: string;
}

const POKE_QUOTES = [
  '戳我干嘛……',
  '嗯？找我有事吗？',
  '又来啦？我一直在呢。',
  '嘿嘿，抓住我的小尾巴啦~',
  '在呢在呢，随时准备听你说！',
];

const ANNOYED_QUOTES = [
  '喂喂，别一直连续戳啦！',
  '你很闲嘛？快去做正事啦~',
  '……真的很喜欢戳我呀？',
  '再戳我要装睡不理你啦！(气鼓鼓)',
];

export const PetStage: React.FC<PetStageProps> = ({
  state,
  onPoke,
  bubbleText,
  isThinking,
  activePPT,
  onOpenStudio,
  onOpenHistory,
  companionName,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPoking, setIsPoking] = useState(false);
  const [currentThought, setCurrentThought] = useState<string>(
    bubbleText || '今天心情不错，随时来和我聊聊吧~'
  );

  // Drag interaction state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasMovedRef = useRef(false);

  useEffect(() => {
    if (bubbleText) {
      setCurrentThought(bubbleText);
    }
  }, [bubbleText]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = { x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    // Limit drag radius
    const dist = Math.sqrt(newX * newX + newY * newY);
    if (dist > 5) {
      hasMovedRef.current = true;
    }
    const clampedX = Math.max(-80, Math.min(80, newX));
    const clampedY = Math.max(-80, Math.min(80, newY));
    setDragOffset({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);

    // If it was a click/tap (not a significant drag), trigger poke
    if (!hasMovedRef.current) {
      handleCharacterPoke();
    }

    // Spring back to center
    setDragOffset({ x: 0, y: 0 });
  };

  const handleCharacterPoke = () => {
    setIsPoking(true);
    setTimeout(() => setIsPoking(false), 450);

    onPoke();

    if (state.consecutivePokes >= 3) {
      const q = ANNOYED_QUOTES[Math.floor(Math.random() * ANNOYED_QUOTES.length)];
      setCurrentThought(q);
    } else {
      const q = POKE_QUOTES[Math.floor(Math.random() * POKE_QUOTES.length)];
      setCurrentThought(q);
    }
  };

  const handlePlayTTS = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingAudio) {
      ttsService.stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      ttsService.speak(
        currentThought,
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  return (
    <div className="relative w-full flex-1 flex flex-col items-center justify-center select-none overflow-hidden py-4">
      {/* Background Ambient Particles & Soft Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="w-80 h-80 rounded-full bg-pink-500/10 blur-3xl animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-48 h-48 rounded-full bg-sky-500/10 blur-2xl" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl" />

        {/* Floating Stars */}
        <span className="absolute top-12 left-16 text-pink-300/40 text-xs animate-bounce">✦</span>
        <span className="absolute top-24 right-20 text-cyan-300/40 text-sm animate-ping">✧</span>
        <span className="absolute bottom-28 left-20 text-indigo-300/40 text-xs">✦</span>
      </div>

      {/* Floating Speech / Thought Bubble */}
      <div
        key={currentThought}
        className="pet-bubble relative z-20 max-w-[280px] sm:max-w-xs mb-3 px-4 py-3 bg-[#241e33]/90 backdrop-blur-md border border-pink-400/30 rounded-2xl shadow-xl text-slate-100 text-xs leading-relaxed"
      >
        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-1.5 text-pink-300 font-medium pb-1 mb-1 border-b border-pink-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
            <span>{companionName} 正在思考并组织回复……</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <span className="whitespace-pre-wrap font-sans text-slate-100">{currentThought}</span>

          <div className="flex items-center gap-1 shrink-0">
            {onOpenHistory && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenHistory();
                }}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-pink-300 transition-colors"
                title="展开完整对话记录"
                aria-label="展开完整对话记录"
              >
                <MessageSquare className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handlePlayTTS}
              className={`p-1 rounded-lg transition-colors shrink-0 ${
                isPlayingAudio
                  ? 'bg-pink-500 text-white animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-pink-300'
              }`}
              title="朗读这句话"
              aria-label="朗读这句话"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* If PPT was generated, display an interactive shortcut button */}
        {activePPT && (
          <div className="mt-2.5 pt-2 border-t border-pink-500/20 flex items-center justify-between">
            <span className="text-[10px] text-pink-300 font-medium truncate max-w-[150px]">
              📑 {activePPT.topic}
            </span>
            <button
              onClick={onOpenStudio}
              className="px-2 py-1 bg-pink-600 hover:bg-pink-500 text-white text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-transform active:scale-95 shadow-xs"
            >
              <Presentation className="w-3 h-3" />
              <span>进入工坊查看</span>
            </button>
          </div>
        )}

        {/* Speech bubble pointy arrow */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#241e33]" />
      </div>

      {/* Main Character Body (Interactive & Draggable with Spring Return) */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        }}
        className={`relative z-10 cursor-pointer touch-none flex flex-col items-center select-none ${
          isPoking ? 'pet-poking' : isDragging ? '' : 'pet-floating'
        }`}
      >
        {/* Soft shadow below pet */}
        <div className="absolute -bottom-4 w-44 h-8 bg-black/40 blur-md rounded-full pointer-events-none" />

        {/* The Uploaded Chibi Character PNG Asset */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 drop-shadow-[0_12px_24px_rgba(244,114,182,0.25)]">
          <img
            src="/character.png"
            alt={companionName}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain pointer-events-none select-none transition-transform"
          />

          {/* Poke heart effect */}
          {isPoking && (
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 text-pink-400 pointer-events-none animate-bounce">
              <Heart className="w-8 h-8 fill-pink-400" />
            </div>
          )}
        </div>
      </div>

      {/* Compact Status Badge (Mood / State / Energy) */}
      <div className="relative z-10 mt-2 flex items-center gap-2">
        <div className="px-3 py-1 bg-[#201a2e]/80 border border-pink-500/20 rounded-full flex items-center gap-1.5 text-[11px] text-pink-200/90 shadow-md backdrop-blur-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>{state.statusText}</span>
        </div>

        {/* Status gauges */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
          <span title="好感度" className="flex items-center gap-0.5 text-pink-300">
            <Heart className="w-2.5 h-2.5 fill-pink-400" />
            <span>{state.affection}</span>
          </span>
          <span className="text-slate-600">·</span>
          <span title="活力" className="flex items-center gap-0.5 text-amber-300">
            <Zap className="w-2.5 h-2.5 fill-amber-400" />
            <span>{state.energy}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
