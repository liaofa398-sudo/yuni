import React from 'react';
import { X, Sparkles, User, Heart, MessageSquare, Feather } from 'lucide-react';
import type { CompanionConfig } from '../types.ts';

interface PersonaModalProps {
  config: CompanionConfig;
  isOpen: boolean;
  onClose: () => void;
  onEditInAdmin: () => void;
}

const AVATAR_URL = '/src/assets/images/companion_avatar_1792496884674.jpg';

export const PersonaModal: React.FC<PersonaModalProps> = ({
  config,
  isOpen,
  onClose,
  onEditInAdmin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#faf7f5] border border-[#ebdcd5] rounded-3xl max-w-md w-full shadow-xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs border border-[#ebdcd5] flex items-center justify-center text-[#7d6860] hover:text-[#3d2e29] hover:bg-white transition-colors"
          title="关闭手账"
          aria-label="关闭手账"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Profile Card Header */}
        <div className="p-6 bg-gradient-to-b from-[#f3e9e4] to-[#faf7f5] border-b border-[#ebdcd5] text-center space-y-3">
          <img
            src={AVATAR_URL}
            alt={config.name}
            referrerPolicy="no-referrer"
            className="w-20 h-20 rounded-full object-cover mx-auto shadow-md border-3 border-white ring-2 ring-rose-200"
          />
          <div>
            <span className="text-[10px] font-medium tracking-wider text-rose-700 bg-rose-100/80 px-2 py-0.5 rounded-full">
              专属陪伴人设档案
            </span>
            <h3 className="font-serif-sc font-bold text-xl text-[#3d2e29] mt-1.5">
              {config.name}
            </h3>
            <p className="text-xs text-[#8c766e]">
              你被称呼为「{config.userNickname}」· 关系：{config.relationship}
            </p>
          </div>
        </div>

        {/* Persona Details Body */}
        <div className="p-6 space-y-4 text-xs leading-relaxed">
          <div className="p-3.5 bg-white rounded-2xl border border-[#ebdcd5] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#4a3933]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>性格特征</span>
            </div>
            <p className="text-[#5c4942] pl-5">{config.personality}</p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#ebdcd5] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#4a3933]">
              <Feather className="w-3.5 h-3.5 text-rose-500" />
              <span>说话风格</span>
            </div>
            <p className="text-[#5c4942] pl-5">{config.speechStyle}</p>
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#ebdcd5] space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#4a3933]">
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>专属开场白</span>
            </div>
            <p className="text-[#5c4942] pl-5 font-serif-sc">{config.openingMessage}</p>
          </div>

          {config.customPrompt && (
            <div className="p-3.5 bg-white rounded-2xl border border-[#ebdcd5] space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-[#4a3933]">
                <Heart className="w-3.5 h-3.5 text-pink-500" />
                <span>特别寄语背景</span>
              </div>
              <p className="text-[#5c4942] pl-5">{config.customPrompt}</p>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-[11px] text-[#8c766e]">
            <span>想调整人设或关系设定？</span>
            <button
              onClick={() => {
                onClose();
                onEditInAdmin();
              }}
              className="text-rose-700 font-medium hover:underline"
            >
              前往创作者管理页修改 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
