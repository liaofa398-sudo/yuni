import React, { useState } from 'react';
import { X, Globe, ShieldAlert, CheckCircle, Server, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyCode = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const dockerfileSnippet = `# 「予你」AI 陪伴项目 - 轻量独立 Docker 部署
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src ./src
RUN npm install -g tsx

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 启动命令
CMD ["tsx", "server.ts"]`;

  const dockerRunSnippet = `# 1. 运行容器命令（替换为你的 DeepSeek API Key）
docker run -d -p 3000:3000 \\
  --name yuni-companion \\
  -e DEEPSEEK_API_KEY="sk-你的DeepSeek密钥" \\
  -e ADMIN_PASSWORD="你的管理密码" \\
  -v $(pwd)/data:/app/data \\
  yuni-companion:latest`;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#faf7f5] border border-[#ebdcd5] rounded-3xl max-w-2xl w-full shadow-xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#ebdcd5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-teal-700" />
            <div>
              <h3 className="font-serif-sc font-bold text-base text-[#4a3933]">
                中国大陆免翻访问与独立部署指南
              </h3>
              <p className="text-[11px] text-[#8c766e]">
                零 Google 依赖 · 纯国产 DeepSeek 直连 · 专为手机访问优化
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#faf7f5] border border-[#ebdcd5] flex items-center justify-center text-[#7d6860] hover:text-[#3d2e29]"
            title="关闭指南"
            aria-label="关闭指南"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-[#4a3933] leading-relaxed">
          {/* Key Notice */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-emerald-900">架构已完全脱离任何 Google 服务依赖</p>
              <p className="text-emerald-800 text-[11px]">
                本项目不使用 Firebase、Google Workspace 或任何被屏蔽的外部接口。
                聊天直连 DeepSeek 官方 API（<code>https://api.deepseek.com</code>），该接口在大陆境内外均可直连。
                持久化数据保存在服务端的轻量 JSON 存储中，无需付费云数据库。
              </p>
            </div>
          </div>

          {/* Warning on common free overseas hosting */}
          <div className="p-4 bg-white border border-[#ebdcd5] rounded-2xl space-y-2.5">
            <h4 className="font-bold text-sm text-[#4a3933] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>常见免费托管平台在大陆的访问实情分析</span>
            </h4>
            <div className="space-y-2 text-[11px] text-[#5c4942]">
              <div className="p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl">
                <span className="font-bold text-rose-800">❌ Vercel 免费默认域名 (*.vercel.app)：</span>
                <p className="mt-0.5 text-rose-700">
                  在中国大陆受到 DNS 污染，大部分国内移动/电信网络<strong>无法直接打开</strong>，除非用户挂代理或你绑定了未被墙的自定义备案域名。
                </p>
              </div>

              <div className="p-2.5 bg-rose-50/70 border border-rose-200/80 rounded-xl">
                <span className="font-bold text-rose-800">❌ Cloudflare Workers / Pages 默认域名 (*.workers.dev)：</span>
                <p className="mt-0.5 text-rose-700">
                  其默认分配的二级域名在国内基本被屏蔽阻断，手机原生浏览器常提示无法解析。
                </p>
              </div>

              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl">
                <span className="font-bold text-emerald-800">✅ 推荐的大陆免翻、稳定访问方案：</span>
                <ul className="mt-1 list-disc list-inside space-y-1 text-emerald-900">
                  <li>
                    <strong>方案一（最佳推荐·百份百流畅）：国内大厂轻量云服务器</strong>（腾讯云 / 阿里云轻量应用服务器），新人活动或首年通常仅需 30~60 元人民币，使用 Docker 一键运行，全国秒开，无任何网络阻碍。
                  </li>
                  <li>
                    <strong>方案二（零成本海外容器 + 自定义域名）：Zeabur / Koyeb / Render</strong>，搭配一个国内未被阻断的个性化域名解析，接收者手机点击即可直达。
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* DeepSeek API billing explanation */}
          <div className="p-4 bg-white border border-[#ebdcd5] rounded-2xl space-y-2">
            <h4 className="font-bold text-sm text-[#4a3933]">
              DeepSeek API 官方计费说明与防刷保护
            </h4>
            <div className="text-[11px] text-[#5c4942] space-y-1.5">
              <p>
                1. <strong>极低费用</strong>：DeepSeek 是目前性价比最高的中文大模型，百万 Token 仅需 1~2 元人民币。充值 10 元足够伴侣或朋友每天聊天聊满大半年。
              </p>
              <p>
                2. <strong>防刷屏保护</strong>：本项目已在服务端设置了<strong>每分钟 15 次限制</strong>、<strong>单访客每天最多 60 条</strong>，以及<strong>礼物开启暗号</strong>。未经你允许的陌生人无法大量消耗你的 API 余额。
              </p>
              <p>
                3. <strong>检查余额</strong>：请定期访问{' '}
                <a
                  href="https://platform.deepseek.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 underline font-medium"
                >
                  DeepSeek 开放平台控制台
                </a>
                ，在「用量统计」中查看每日调用量。
              </p>
            </div>
          </div>

          {/* Dockerfile & Run Instructions */}
          <div className="p-4 bg-white border border-[#ebdcd5] rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#4a3933] flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-700" />
                <span>独立 Dockerfile 配置与一键运行</span>
              </h4>
              <button
                onClick={() => copyCode('dockerfile', dockerfileSnippet)}
                className="px-2.5 py-1 text-[11px] bg-[#faf7f5] hover:bg-[#ebdcd5] border border-[#d8c3bc] rounded-lg transition-colors flex items-center gap-1"
              >
                {copiedSection === 'dockerfile' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>复制代码</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[10px] font-mono leading-relaxed">
              {dockerfileSnippet}
            </pre>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] font-medium text-[#4a3933]">运行启动命令：</span>
              <button
                onClick={() => copyCode('dockerrun', dockerRunSnippet)}
                className="px-2.5 py-1 text-[11px] bg-[#faf7f5] hover:bg-[#ebdcd5] border border-[#d8c3bc] rounded-lg transition-colors flex items-center gap-1"
              >
                {copiedSection === 'dockerrun' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>已复制</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>复制命令</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl overflow-x-auto text-[10px] font-mono leading-relaxed">
              {dockerRunSnippet}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-[#ebdcd5] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#4a3933] text-white rounded-xl text-xs font-medium hover:bg-[#3d2e29]"
          >
            我已知晓
          </button>
        </div>
      </div>
    </div>
  );
};
