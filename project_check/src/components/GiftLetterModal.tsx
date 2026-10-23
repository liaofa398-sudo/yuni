import React from 'react';
import { X, Heart, Sparkles } from 'lucide-react';
import type { CompanionConfig } from '../types.ts';

interface GiftLetterModalProps {
  config: CompanionConfig;
  isOpen: boolean;
  onClose: () => void;
}

const LETTER_HERO_URL = '/src/assets/images/gift_letter_hero_1792496885581.jpg';

export const GiftLetterModal: React.FC<GiftLetterModalProps> = ({ config, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#fcfaf7] border border-[#e3d1c8] rounded-3xl max-w-lg w-full shadow-xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs border border-[#ebdcd5] flex items-center justify-center text-[#7d6860] hover:text-[#3d2e29] hover:bg-white transition-colors"
          title="关闭寄语"
          aria-label="关闭寄语"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero Banner Artwork */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-rose-50">
          <img
            src={LETTER_HERO_URL}
            alt="心意信笺"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fcfaf7] via-transparent to-black/20" />
          <div className="absolute bottom-3 left-6">
            <span className="text-[11px] font-medium tracking-widest text-[#7d6860] uppercase">
              Exclusive Gift Letter
            </span>
            <h2 className="font-serif-sc font-bold text-xl sm:text-2xl text-[#3d2e29]">
              专属心意寄语
            </h2>
          </div>
        </div>

        {/* Parchment Letter Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Header To */}
          <div className="border-b border-[#ebdcd5] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              <span className="font-serif-sc font-bold text-base text-[#4a3933]">
                致：{config.giftTo || config.userNickname || '特别的你'}
              </span>
            </div>
            <span className="text-xs text-[#8c766e]">纸短情长 · 见字如晤</span>
          </div>

          {/* Letter Content */}
          <div className="font-serif-sc text-sm sm:text-base leading-relaxed text-[#4a3933] whitespace-pre-wrap space-y-4">
            {config.giftLetter}
          </div>

          {/* Signature / From */}
          <div className="pt-4 border-t border-[#ebdcd5] flex items-center justify-between">
            <div className="text-xs text-[#8c766e] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>伴随你左右的陪伴者：{config.name}</span>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#8c766e] block">寄语人</span>
              <span className="font-serif-sc font-bold text-sm text-[#4a3933]">
                {config.giftFrom || '在乎你的人'}
              </span>
            </div>
          </div>

          {/* Close Action */}
          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#4a3933] text-white rounded-xl text-xs font-medium hover:bg-[#3d2e29] transition-colors shadow-xs"
            >
              收下心意，开始聊天
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
