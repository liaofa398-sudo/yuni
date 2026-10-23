import React, { useState } from 'react';
import { X, Lock, Check, Key, Shield, HelpCircle, Save, ExternalLink } from 'lucide-react';
import type { CompanionConfig } from '../types.ts';
import { loginAdmin, updateAdminConfig, setStoredAdminToken, getStoredAdminToken } from '../utils/api.ts';

interface AdminModalProps {
  config: CompanionConfig;
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: (newConfig: CompanionConfig) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  config,
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(getStoredAdminToken()));
  const [authError, setAuthError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CompanionConfig>({ ...config });
  const [accessPasscodeInput, setAccessPasscodeInput] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await loginAdmin(passwordInput);
      setStoredAdminToken(res.token);
      setIsAuthenticated(true);
      setFormData({ ...config });
    } catch (err: any) {
      setAuthError(err.message || '管理密码错误');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess(false);
    setIsSaving(true);
    try {
      const res = await updateAdminConfig({
        config: formData,
        accessPasscode: accessPasscodeInput,
        newAdminPassword: newAdminPassword.trim() || undefined,
      });
      onConfigUpdated(res.config);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || '保存设置失败');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setStoredAdminToken(null);
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#faf7f5] border border-[#ebdcd5] rounded-3xl max-w-xl w-full shadow-xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 my-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-white border-b border-[#ebdcd5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-700" />
            <div>
              <h3 className="font-serif-sc font-bold text-base text-[#4a3933]">
                创作者专属管理后台
              </h3>
              <p className="text-[11px] text-[#8c766e]">
                定制陪伴人设、专属寄语、安全暗号与防刷限额
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#faf7f5] border border-[#ebdcd5] flex items-center justify-center text-[#7d6860] hover:text-[#3d2e29]"
            title="关闭后台"
            aria-label="关闭后台"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs text-[#4a3933]">
          {!isAuthenticated ? (
            /* Login view */
            <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto py-6">
              <div className="text-center space-y-1">
                <Lock className="w-8 h-8 mx-auto text-[#8c766e]" />
                <h4 className="font-serif-sc font-bold text-sm text-[#4a3933]">
                  请输入管理员密码
                </h4>
                <p className="text-[11px] text-[#8c766e]">
                  管理密码必须通过服务端环境变量 <code className="bg-amber-100 text-amber-900 px-1 py-0.5 rounded font-mono">ADMIN_PASSWORD</code> 安全配置。未配置时管理员入口将处于安全锁定状态。
                </p>
              </div>

              {authError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-center">
                  {authError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-medium text-[#4a3933]">管理密码</label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="输入环境变量配置的 ADMIN_PASSWORD"
                  className="w-full p-2.5 bg-white border border-[#ebdcd5] rounded-xl focus:border-[#4a3933] focus:outline-hidden"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#4a3933] text-white rounded-xl font-medium hover:bg-rose-950 transition-colors"
              >
                解锁管理后台
              </button>
            </form>
          ) : (
            /* Authenticated Configuration Form */
            <form onSubmit={handleSave} className="space-y-5">
              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>设置已成功保存！人设与规则已即时生效。</span>
                </div>
              )}

              {saveError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  {saveError}
                </div>
              )}

              {/* DeepSeek API & Cost Box */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-950 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-sky-600" />
                    <span>DeepSeek API 官方计费与余额须知</span>
                  </span>
                  <a
                    href="https://platform.deepseek.com/usage"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 hover:text-sky-900 flex items-center gap-1 text-[11px] underline"
                  >
                    <span>官方用量平台</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed">
                  DeepSeek 官方 API 采用极低费率计费（百万 Token 仅约 1~2 元人民币）。
                  为保证你的账户安全，API Key <strong>仅保存在服务端环境变量中</strong>，前端代码和链接中绝不泄露。
                </p>
              </div>

              {/* Section 1: Companion Identity */}
              <div className="space-y-3 p-4 bg-white border border-[#ebdcd5] rounded-2xl">
                <h4 className="font-serif-sc font-bold text-sm text-[#4a3933] border-b border-[#ebdcd5] pb-2">
                  一、陪伴者基本设定
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[#4a3933]">陪伴者名字</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      maxLength={16}
                      className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden"
                      placeholder="爱弥斯"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-[#4a3933]">对TA的专属称呼</label>
                    <input
                      type="text"
                      value={formData.userNickname}
                      onChange={(e) => setFormData({ ...formData, userNickname: e.target.value })}
                      maxLength={16}
                      className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden"
                      placeholder="特别的你 / 爱弥斯"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#4a3933]">关系设定</label>
                  <input
                    type="text"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    maxLength={32}
                    className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden"
                    placeholder="温柔的知己与专属陪伴伙伴"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#4a3933]">性格特征</label>
                  <textarea
                    rows={2}
                    value={formData.personality}
                    onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                    maxLength={300}
                    className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden"
                    placeholder="温柔细腻、体贴入微、亲近自然、偶尔有一点小俏皮与温软"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#4a3933]">说话风格与习惯</label>
                  <textarea
                    rows={2}
                    value={formData.speechStyle}
                    onChange={(e) => setFormData({ ...formData, speechStyle: e.target.value })}
                    maxLength={300}
                    className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden"
                    placeholder="轻声细语，亲切真诚，像身边亲近的人耳语..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#4a3933]">专属初见开场白</label>
                  <textarea
                    rows={3}
                    value={formData.openingMessage}
                    onChange={(e) => setFormData({ ...formData, openingMessage: e.target.value })}
                    maxLength={500}
                    className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden font-serif-sc"
                    placeholder="见信如面。我是爱弥斯..."
                  />
                </div>
              </div>

              {/* Section 2: Gift Letter */}
              <div className="space-y-3 p-4 bg-white border border-[#ebdcd5] rounded-2xl">
                <h4 className="font-serif-sc font-bold text-sm text-[#4a3933] border-b border-[#ebdcd5] pb-2">
                  二、专属礼物寄语信笺
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-[#4a3933]">寄信人署名</label>
                    <input
                      type="text"
                      value={formData.giftFrom}
                      onChange={(e) => setFormData({ ...formData, giftFrom: e.target.value })}
                      placeholder="在乎你的人"
                      className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-[#4a3933]">收信人称谓</label>
                    <input
                      type="text"
                      value={formData.giftTo}
                      onChange={(e) => setFormData({ ...formData, giftTo: e.target.value })}
                      placeholder="特别的你"
                      className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#4a3933]">信笺正文</label>
                  <textarea
                    rows={4}
                    value={formData.giftLetter}
                    onChange={(e) => setFormData({ ...formData, giftLetter: e.target.value })}
                    maxLength={1000}
                    className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden font-serif-sc"
                  />
                </div>
              </div>

              {/* Section 3: Safety, Quotas & Passcodes */}
              <div className="space-y-3 p-4 bg-white border border-[#ebdcd5] rounded-2xl">
                <h4 className="font-serif-sc font-bold text-sm text-[#4a3933] border-b border-[#ebdcd5] pb-2">
                  三、费用保护与访问控制
                </h4>

                <div className="space-y-1">
                  <label className="font-medium text-[#4a3933]">
                    礼物开启暗号（可选）
                  </label>
                  <input
                    type="text"
                    value={accessPasscodeInput}
                    onChange={(e) => setAccessPasscodeInput(e.target.value)}
                    placeholder="留空表示公开访问；输入暗号如 0520 则只有持暗号者可对话"
                    className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden"
                  />
                  <span className="text-[10px] text-[#8c766e]">
                    设置暗号后，只有在打开链接时输入正确暗号的人才能消耗 API 额度。
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-[#4a3933]">
                    单访客每日消息上限 (防刷消耗)
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={200}
                    value={formData.dailyMessageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, dailyMessageLimit: parseInt(e.target.value, 10) || 60 })
                    }
                    className="w-full p-2 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-[#8c766e]">
                    默认 60 条/天。即使有人频繁刷屏，也会被服务端截断并锁定。
                  </span>
                </div>

                <div className="p-3 bg-[#faf7f5] border border-[#ebdcd5] rounded-xl space-y-1">
                  <div className="font-medium text-[#4a3933] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#8c766e]" />
                    <span>管理密码安全策略</span>
                  </div>
                  <p className="text-[10px] text-[#8c766e] leading-relaxed">
                    管理员密码由服务端环境变量 <code>ADMIN_PASSWORD</code> 严格管控，避免任何默认弱口令。如需修改，请在部署平台或服务器环境变量中变更。
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 text-xs text-[#8c766e] hover:text-[#4a3933] transition-colors"
                >
                  退出登录
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-[#4a3933] text-white rounded-xl font-medium hover:bg-rose-950 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? '保存中...' : '保存所有设置'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
