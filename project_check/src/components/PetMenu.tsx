import { BookHeart, Presentation, Heart, Sliders, Globe, MessageSquare } from 'lucide-react';

interface PetMenuProps {
  companionName: string;
  onOpenMemories: () => void;
  onOpenStudio: () => void;
  onOpenLetter: () => void;
  onOpenAdmin: () => void;
  onOpenDeploy: () => void;
  onOpenHistory: () => void;
  memoryCount: number;
  messageCount: number;
  hasActiveTask: boolean;
}

export const PetMenu: React.FC<PetMenuProps> = ({
  companionName,
  onOpenMemories,
  onOpenStudio,
  onOpenLetter,
  onOpenAdmin,
  onOpenDeploy,
  onOpenHistory,
  memoryCount,
  messageCount,
  hasActiveTask,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full px-4 py-2.5 bg-[#14121c]/80 backdrop-blur-md border-b border-pink-500/10 flex items-center justify-between">
      {/* Brand & Companion Name */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
        <span className="font-serif-sc font-bold text-sm tracking-wide text-pink-100">
          予你
        </span>
        <span className="text-[11px] text-pink-300/70">
          · {companionName}
        </span>
      </div>

      {/* Discrete Navigation Icons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        <button
          onClick={onOpenStudio}
          className={`px-2 py-1 text-xs rounded-xl font-medium transition-all flex items-center gap-1 relative ${
            hasActiveTask
              ? 'bg-pink-600 text-white shadow-sm ring-2 ring-pink-400/50 animate-pulse'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          title="工作室 (PPT 制作)"
          aria-label="工作室"
        >
          <Presentation className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-[11px]">工作室</span>
          {hasActiveTask && (
            <span className="w-1.5 h-1.5 rounded-full bg-white absolute top-1 right-1" />
          )}
        </button>

        <button
          onClick={onOpenHistory}
          className="px-2 py-1 text-xs rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
          title="历史对话"
          aria-label="历史对话"
        >
          <MessageSquare className="w-3.5 h-3.5 text-pink-400" />
          <span className="text-[11px] hidden sm:inline">对话</span>
          {messageCount > 0 && (
            <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1 rounded-full font-mono">
              {messageCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenMemories}
          className="px-2 py-1 text-xs rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
          title="记忆宝盒"
          aria-label="记忆宝盒"
        >
          <BookHeart className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] hidden sm:inline">记忆</span>
          {memoryCount > 0 && (
            <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1 rounded-full font-mono">
              {memoryCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenLetter}
          className="px-2 py-1 text-xs rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1"
          title="专属心意寄语"
          aria-label="专属心意寄语"
        >
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-[11px] hidden sm:inline">心意</span>
        </button>

        <button
          onClick={onOpenDeploy}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="国内免翻部署指南"
          aria-label="国内免翻部署指南"
        >
          <Globe className="w-3.5 h-3.5 text-teal-400" />
        </button>

        <button
          onClick={onOpenAdmin}
          className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="创作者后台"
          aria-label="创作者后台"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
