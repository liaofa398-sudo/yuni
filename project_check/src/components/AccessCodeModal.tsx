import React, { useState } from 'react';
import { KeyRound, Sparkles } from 'lucide-react';
import { verifyAccessCode, setStoredAccessCode } from '../utils/api.ts';

interface AccessCodeModalProps {
  isOpen: boolean;
  companionName: string;
  onSuccess: () => void;
}

export const AccessCodeModal: React.FC<AccessCodeModalProps> = ({
  isOpen,
  companionName,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setLoading(true);

    try {
      await verifyAccessCode(code.trim());
      setStoredAccessCode(code.trim());
      onSuccess();
    } catch (err: any) {
      setError(err.message || '暗号不对哦，请询问赠送这份礼物的 TA~');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#faf7f5] border border-[#ebdcd5] rounded-3xl max-w-sm w-full p-6 text-center shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
          <KeyRound className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="font-serif-sc font-bold text-lg text-[#4a3933]">
            开启专属礼物
          </h3>
          <p className="text-xs text-[#7d6860]">
            {companionName} 正在等待专属口令。请输入送礼人留给你的心意暗号：
          </p>
        </div>

        {error && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="输入心意暗号..."
            autoFocus
            className="w-full p-2.5 bg-white border border-[#ebdcd5] rounded-xl text-center text-sm font-medium text-[#4a3933] tracking-widest focus:border-rose-400 focus:outline-hidden"
          />

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-2.5 bg-[#4a3933] text-white rounded-xl text-xs font-medium hover:bg-rose-950 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{loading ? '正在验证...' : '开启与爱弥斯的相遇'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
