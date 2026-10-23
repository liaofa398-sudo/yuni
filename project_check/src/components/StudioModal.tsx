import React, { useState } from 'react';
import { X, Presentation, Download, ChevronLeft, ChevronRight, FileText, Sparkles, Check, Eye } from 'lucide-react';
import type { PPTResult, SlideData } from '../types.ts';

interface StudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentPPTs: PPTResult[];
  activePPT?: PPTResult;
}

export const StudioModal: React.FC<StudioModalProps> = ({
  isOpen,
  onClose,
  recentPPTs,
  activePPT: initialActivePPT,
}) => {
  const [selectedPPT, setSelectedPPT] = useState<PPTResult | undefined>(
    initialActivePPT || recentPPTs[0]
  );
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [copiedJSON, setCopiedJSON] = useState(false);

  // Sync if initialActivePPT changes
  React.useEffect(() => {
    if (initialActivePPT) {
      setSelectedPPT(initialActivePPT);
      setCurrentSlideIndex(0);
    } else if (recentPPTs.length > 0 && !selectedPPT) {
      setSelectedPPT(recentPPTs[0]);
    }
  }, [initialActivePPT, recentPPTs]);

  if (!isOpen) return null;

  const currentSlide: SlideData | undefined = selectedPPT?.slides[currentSlideIndex];

  const handleDownloadJSON = () => {
    if (!selectedPPT) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(selectedPPT, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${selectedPPT.topic}_演示文稿.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadHTMLSlides = () => {
    if (!selectedPPT) return;
    const htmlContent = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${selectedPPT.topic} - 演示文稿</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
    .slide { max-width: 900px; margin: 40px auto; background: #1e293b; border-radius: 16px; padding: 48px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); page-break-after: always; }
    h1 { color: #f472b6; font-size: 2.2rem; margin-top: 0; }
    h2 { color: #94a3b8; font-size: 1.1rem; font-weight: normal; margin-bottom: 24px; }
    ul { font-size: 1.2rem; line-height: 2; padding-left: 24px; }
    li { margin-bottom: 12px; }
    .footer { margin-top: 40px; font-size: 0.9rem; color: #64748b; border-top: 1px solid #334155; padding-top: 12px; display: flex; justify-content: space-between; }
    .notes { background: #0f172a; border-left: 4px solid #f472b6; padding: 12px 16px; margin-top: 24px; font-size: 0.95rem; color: #cbd5e1; border-radius: 4px; }
  </style>
</head>
<body>
  ${selectedPPT.slides
    .map(
      (s) => `
    <div class="slide">
      <h1>${s.title}</h1>
      ${s.subtitle ? `<h2>${s.subtitle}</h2>` : ''}
      <ul>
        ${s.points.map((p) => `<li>${p}</li>`).join('')}
      </ul>
      ${s.notes ? `<div class="notes"><strong>演讲旁白：</strong>${s.notes}</div>` : ''}
      <div class="footer">
        <span>主题：${selectedPPT.topic}</span>
        <span>第 ${s.slideNumber} / ${selectedPPT.slides.length} 页</span>
      </div>
    </div>
  `
    )
    .join('')}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', `${selectedPPT.topic}_可直接演示课件.html`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#18151f] border border-pink-500/20 text-slate-100 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-4 max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#201c2b] border-b border-pink-500/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/10 text-pink-400">
              <Presentation className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-pink-200 flex items-center gap-2">
                <span>爱弥斯的工作室 · PPT 制作工坊</span>
                <span className="text-[10px] bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full font-mono">
                  Agent L1
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                AI 桌宠首项落地能力：自主规划、逐页撰写与演示导出
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            title="关闭工作室"
            aria-label="关闭工作室"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* PPT Selector if multiple exist */}
          {recentPPTs.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {recentPPTs.map((ppt) => (
                <button
                  key={ppt.id}
                  onClick={() => {
                    setSelectedPPT(ppt);
                    setCurrentSlideIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    selectedPPT?.id === ppt.id
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Presentation className="w-3.5 h-3.5" />
                  <span>{ppt.topic}</span>
                </button>
              ))}
            </div>
          )}

          {selectedPPT && currentSlide ? (
            <div className="space-y-3">
              {/* Slide Preview Card */}
              <div className="bg-gradient-to-br from-[#231e30] to-[#1a1724] border border-pink-500/30 rounded-2xl p-5 sm:p-6 shadow-inner relative min-h-[220px] flex flex-col justify-between">
                {/* Slide indicator badge */}
                <div className="flex items-center justify-between text-[11px] text-pink-300/80 pb-2 border-b border-pink-500/10">
                  <span className="font-mono">
                    第 {currentSlide.slideNumber} / {selectedPPT.slides.length} 页
                  </span>
                  <span className="capitalize text-slate-400">
                    风格：{selectedPPT.style === 'formal' ? '严谨商务' : '灵动活力'}
                  </span>
                </div>

                {/* Slide Content */}
                <div className="py-4 space-y-3">
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {currentSlide.title}
                  </h4>
                  {currentSlide.subtitle && (
                    <p className="text-xs text-pink-300/90 font-medium">
                      {currentSlide.subtitle}
                    </p>
                  )}

                  <ul className="space-y-2 pt-1">
                    {currentSlide.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-200 text-xs sm:text-sm leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 shrink-0" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Speaker notes */}
                  {currentSlide.notes && (
                    <div className="mt-3 p-2.5 bg-black/30 rounded-xl border-l-2 border-pink-400 text-[11px] text-slate-300 leading-relaxed">
                      <span className="text-pink-300 font-semibold mr-1">演讲旁白：</span>
                      {currentSlide.notes}
                    </div>
                  )}
                </div>

                {/* Bottom Navigation for slides */}
                <div className="flex items-center justify-between pt-2 border-t border-pink-500/10">
                  <button
                    disabled={currentSlideIndex === 0}
                    onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 transition-colors flex items-center gap-1 text-xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>上一页</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {selectedPPT.slides.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentSlideIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          i === currentSlideIndex ? 'w-5 bg-pink-400' : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        title={`切换到第 ${i + 1} 页`}
                        aria-label={`第 ${i + 1} 页`}
                      />
                    ))}
                  </div>

                  <button
                    disabled={currentSlideIndex === selectedPPT.slides.length - 1}
                    onClick={() => setCurrentSlideIndex((prev) => Math.min(selectedPPT.slides.length - 1, prev + 1))}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 transition-colors flex items-center gap-1 text-xs"
                  >
                    <span>下一页</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Actions & Export */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="text-[11px] text-slate-400">
                  主题：【{selectedPPT.topic}】· 共 {selectedPPT.slides.length} 页
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadHTMLSlides}
                    className="px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载网页课件 (.html)</span>
                  </button>

                  <button
                    onClick={handleDownloadJSON}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors flex items-center gap-1.5 text-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>导出数据 (.json)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#201c2b] rounded-2xl border border-pink-500/10 space-y-2">
              <Presentation className="w-10 h-10 mx-auto text-pink-400/60" />
              <p className="text-sm text-slate-200 font-medium">工坊里还没有制作好的 PPT 呢~</p>
              <p className="text-slate-400 text-xs">
                在桌宠主界面对爱弥斯说：“帮我做一份关于人工智能发展的 PPT”，她就会为你开工制作啦！
              </p>
            </div>
          )}

          {/* Future Expansion Roadmap Cards */}
          <div className="pt-2 space-y-2">
            <h5 className="font-semibold text-xs text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>未来工坊技能解锁规划</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1 opacity-70">
                <span className="text-pink-300 font-medium">📄 Word 文档草拟</span>
                <p className="text-[10px] text-slate-400">长文排版、合同结构与备忘录生成（学习中）</p>
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1 opacity-70">
                <span className="text-teal-300 font-medium">📊 Excel 数据报表</span>
                <p className="text-[10px] text-slate-400">表格规划、财务测算模型与公式整理（学习中）</p>
              </div>
              <div className="p-3 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-1 opacity-70">
                <span className="text-purple-300 font-medium">🎮 桌面小游戏互动</span>
                <p className="text-[10px] text-slate-400">解闷猜拳、心意骰子与趣味互动（学习中）</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
