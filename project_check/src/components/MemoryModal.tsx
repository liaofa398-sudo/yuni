import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, Sparkles, BookHeart, ShieldCheck } from 'lucide-react';
import type { MemoryItem, MemoryCategory } from '../types.ts';

interface MemoryModalProps {
  memories: MemoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onAddMemory: (category: MemoryCategory, content: string) => Promise<void>;
  onUpdateMemory: (id: string, updates: { content?: string; category?: string }) => Promise<void>;
  onDeleteMemory: (id: string) => Promise<void>;
  companionName: string;
}

const MEMORY_CHEST_URL = '/src/assets/images/memory_chest_art_1792496885146.jpg';

const CATEGORY_MAP: Record<MemoryCategory, { label: string; color: string }> = {
  preference: { label: '喜好习惯', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  important_date: { label: '重要日子', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  promise: { label: '彼此约定', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  life_detail: { label: '生活细节', color: 'bg-teal-50 text-teal-700 border-teal-200' },
  emotion: { label: '近期心境', color: 'bg-blue-50 text-blue-700 border-blue-200' },
};

export const MemoryModal: React.FC<MemoryModalProps> = ({
  memories,
  isOpen,
  onClose,
  onAddMemory,
  onUpdateMemory,
  onDeleteMemory,
  companionName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState<MemoryCategory>('preference');
  const [newContent, setNewContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const filteredMemories = memories.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  const handleCreate = async () => {
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onAddMemory(newCategory, newContent.trim());
      setNewContent('');
      setIsAdding(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingContent.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateMemory(id, { content: editingContent.trim() });
      setEditingId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#faf7f5] border border-[#ebdcd5] rounded-3xl max-w-lg w-full shadow-xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-6 max-h-[90vh] flex flex-col">
        {/* Header with image */}
        <div className="relative h-36 sm:h-40 w-full overflow-hidden shrink-0 bg-amber-50">
          <img
            src={MEMORY_CHEST_URL}
            alt="记忆宝盒"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#faf7f5] via-black/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/80 backdrop-blur-xs border border-[#ebdcd5] flex items-center justify-center text-[#7d6860] hover:text-[#3d2e29] hover:bg-white transition-colors"
            title="关闭宝盒"
            aria-label="关闭宝盒"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-6">
            <span className="text-[10px] font-medium tracking-wider text-[#6b5851] uppercase">
              Long-term Memory Chest
            </span>
            <h2 className="font-serif-sc font-bold text-xl sm:text-2xl text-[#3d2e29] flex items-center gap-2">
              <span>记忆宝盒</span>
              <span className="text-xs font-sans font-normal text-[#8c766e]">
                (已收录 {memories.length} 桩记忆)
              </span>
            </h2>
          </div>
        </div>

        {/* Safe Storage Notice */}
        <div className="px-6 pt-3 shrink-0">
          <div className="p-2.5 bg-white/70 border border-[#ebdcd5] rounded-xl flex items-center gap-2 text-[11px] text-[#7d6860]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              已启用服务端隔离持久化。聊天中你分享的细节会被{companionName}自动记下并在后续互动中自然提及。
            </span>
          </div>
        </div>

        {/* Filter categories */}
        <div className="px-6 pt-3 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2.5 py-1 text-xs rounded-lg transition-colors shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-[#4a3933] text-white'
                : 'bg-white text-[#7d6860] border border-[#ebdcd5] hover:bg-[#f5ede8]'
            }`}
          >
            全部 ({memories.length})
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, value]) => {
            const count = memories.filter((m) => m.category === key).length;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-2.5 py-1 text-xs rounded-lg transition-colors shrink-0 ${
                  selectedCategory === key
                    ? 'bg-[#4a3933] text-white'
                    : 'bg-white text-[#7d6860] border border-[#ebdcd5] hover:bg-[#f5ede8]'
                }`}
              >
                {value.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        {/* Memories Content List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
          {/* Add Memory Form */}
          {isAdding ? (
            <div className="p-3.5 bg-white rounded-2xl border border-rose-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#4a3933]">添加新记忆</span>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as MemoryCategory)}
                  className="text-xs bg-[#faf7f5] border border-[#ebdcd5] rounded-lg px-2 py-1 text-[#4a3933] focus:outline-hidden"
                >
                  {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="例如：我喜欢在下雨天喝茉莉花茶；我的生日是每年四月初六..."
                rows={2}
                maxLength={200}
                className="w-full text-xs p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl text-[#2d2825] focus:outline-hidden"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-2.5 py-1 text-xs text-[#7d6860] hover:bg-[#faf7f5] rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newContent.trim() || isSubmitting}
                  className="px-3 py-1 text-xs bg-[#4a3933] text-white rounded-lg hover:bg-rose-900 transition-colors disabled:opacity-50"
                >
                  保存进宝盒
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2 bg-white hover:bg-rose-50/50 border border-dashed border-[#d8c3bc] hover:border-rose-300 rounded-xl text-xs text-[#7d6860] hover:text-rose-700 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>手动收录一条重要记忆</span>
            </button>
          )}

          {/* Empty state */}
          {filteredMemories.length === 0 && (
            <div className="py-8 text-center text-xs text-[#9c847b] space-y-1">
              <BookHeart className="w-6 h-6 mx-auto text-[#d8c3bc]" />
              <p>这个分类下暂无记忆</p>
              <p className="text-[10px]">在聊天里告诉{companionName}，就会自动为你收录哦</p>
            </div>
          )}

          {/* Memories Cards */}
          {filteredMemories.map((mem) => {
            const isEditing = editingId === mem.id;
            const catInfo = CATEGORY_MAP[mem.category] || CATEGORY_MAP.life_detail;

            return (
              <div
                key={mem.id}
                className="p-3 bg-white border border-[#ebdcd5] rounded-xl shadow-2xs space-y-1.5 group hover:border-[#d8c3bc] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${catInfo.color}`}
                  >
                    {catInfo.label}
                  </span>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!isEditing && (
                      <button
                        onClick={() => {
                          setEditingId(mem.id);
                          setEditingContent(mem.content);
                        }}
                        className="p-1 text-[#8c766e] hover:text-[#4a3933] rounded"
                        title="编辑记忆"
                        aria-label="编辑记忆"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="p-1 text-[#8c766e] hover:text-rose-600 rounded"
                      title="删除记忆"
                      aria-label="删除记忆"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      maxLength={200}
                      className="w-full text-xs p-1.5 bg-[#faf7f5] border border-[#ebdcd5] rounded-lg text-[#2d2825] focus:outline-hidden"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-2 py-0.5 text-xs text-[#7d6860] hover:bg-[#faf7f5] rounded"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleSaveEdit(mem.id)}
                        disabled={isSubmitting}
                        className="px-2.5 py-0.5 text-xs bg-[#4a3933] text-white rounded hover:bg-rose-900"
                      >
                        保存
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#3d2e29] leading-relaxed">
                    {mem.content}
                  </p>
                )}

                <div className="text-[10px] text-[#a38e86] font-mono pt-0.5">
                  {new Date(mem.createdAt).toLocaleDateString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
