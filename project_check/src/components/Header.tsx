import React from 'react';
import { Heart, BookHeart, Sparkles, Sliders, Send, Globe } from 'lucide-react';

interface HeaderProps {
  companionName: string;
  activeTab: 'chat' | 'letter' | 'memories' | 'persona' | 'deploy';
  setActiveTab: (tab: 'chat' | 'letter' | 'memories' | 'persona' | 'deploy') => void;
  onOpenAdmin: () => void;
  memoryCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  companionName,
  activeTab,
  setActiveTab,
  onOpenAdmin,
  memoryCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#faf7f5]/90 backdrop-blur-md border-b border-[#ebdcd5] px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('chat')}
            className="flex items-center gap-1.5 text-left group"
          >
            <span className="font-serif-sc text-xl font-bold tracking-tight text-[#4a3933] group-hover:text-rose-700 transition-colors">
              予你
            </span>
            <span className="text-xs text-[#8c766e] hidden sm:inline">
              · {companionName}
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-2">
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'chat'
                ? 'bg-[#ebdcd5] text-[#3d2e29]'
                : 'text-[#7d6860] hover:text-[#3d2e29] hover:bg-[#f3e9e4]'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>陪伴</span>
          </button>

          <button
            onClick={() => setActiveTab('letter')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'letter'
                ? 'bg-[#ebdcd5] text-[#3d2e29]'
                : 'text-[#7d6860] hover:text-[#3d2e29] hover:bg-[#f3e9e4]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>心意寄语</span>
          </button>

          <button
            onClick={() => setActiveTab('memories')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'memories'
                ? 'bg-[#ebdcd5] text-[#3d2e29]'
                : 'text-[#7d6860] hover:text-[#3d2e29] hover:bg-[#f3e9e4]'
            }`}
          >
            <BookHeart className="w-3.5 h-3.5 text-amber-600" />
            <span>记忆宝盒</span>
            {memoryCount > 0 && (
              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded-full font-mono">
                {memoryCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('persona')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'persona'
                ? 'bg-[#ebdcd5] text-[#3d2e29]'
                : 'text-[#7d6860] hover:text-[#3d2e29] hover:bg-[#f3e9e4]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>人设手账</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === 'deploy'
                ? 'bg-[#ebdcd5] text-[#3d2e29]'
                : 'text-[#7d6860] hover:text-[#3d2e29] hover:bg-[#f3e9e4]'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>国内免翻部署</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('deploy')}
            className="md:hidden p-2 text-[#7d6860] hover:text-[#3d2e29] hover:bg-[#f3e9e4] rounded-lg transition-colors"
            title="国内免翻部署指南"
            aria-label="部署指南"
          >
            <Globe className="w-4 h-4 text-teal-600" />
          </button>

          <button
            onClick={onOpenAdmin}
            className="px-3 py-1.5 text-xs font-medium text-[#4a3933] bg-[#ebdcd5]/70 hover:bg-[#ebdcd5] border border-[#d8c3bc] rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">创作者设置</span>
          </button>
        </div>
      </div>
    </header>
  );
};
