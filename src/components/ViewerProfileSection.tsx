import { Check, Copy, Eye, EyeOff, LogOut, Mail, Shield, UserCheck } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { ViewerAccount } from '../data/marketplaceData';

interface ViewerProfileSectionProps {
  accounts: ViewerAccount[];
  currentAccount: ViewerAccount | null;
  onRegister: (
    username: string,
    password: string,
    optionalGmail: string
  ) => { ok: boolean; error?: string; account?: ViewerAccount };
  onLogin: (
    identifier: string,
    password: string
  ) => { ok: boolean; error?: string };
  onLogout: () => void;
  onLinkGmail: (gmail: string) => { ok: boolean; error?: string };
  onRenameUsername: (newName: string) => { ok: boolean; error?: string };
  onUpdatePassword: (newPassword: string) => { ok: boolean; error?: string };
}

export function ViewerProfileSection({
  accounts,
  currentAccount,
  onRegister,
  onLogin,
  onLogout,
  onLinkGmail,
  onRenameUsername,
  onUpdatePassword,
}: ViewerProfileSectionProps) {
  const [authTab, setAuthTab] = useState<'register' | 'login'>('register');

  // Register state
  const [regName, setRegName] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regGmail, setRegGmail] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);
  const [regError, setRegError] = useState('');

  // Login state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Profile management state
  const [gmailInput, setGmailInput] = useState('');
  const [gmailFeedback, setGmailFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [renameInput, setRenameInput] = useState('');
  const [renameFeedback, setRenameFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [passFeedback, setPassFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (currentAccount) {
      setGmailInput(currentAccount.gmail);
      setRenameInput(currentAccount.username);
    } else {
      setGmailInput('');
      setRenameInput('');
    }
    setGmailFeedback(null);
    setRenameFeedback(null);
    setPassFeedback(null);
  }, [currentAccount]);

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(true);
      window.setTimeout(() => setCopiedId(false), 1800);
    } catch {
      setCopiedId(false);
    }
  };

  const handleRegisterSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onRegister(regName, regPass, regGmail);
    if (!res.ok) {
      setRegError(res.error ?? 'Không thể tạo tài khoản.');
      return;
    }
    setRegError('');
    setRegName('');
    setRegPass('');
    setRegGmail('');
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onLogin(loginIdentifier, loginPass);
    if (!res.ok) {
      setLoginError(res.error ?? 'Đăng nhập thất bại.');
      return;
    }
    setLoginError('');
    setLoginIdentifier('');
    setLoginPass('');
  };

  const handleLinkGmailSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onLinkGmail(gmailInput);
    if (!res.ok) {
      setGmailFeedback({
        type: 'error',
        text: res.error ?? 'Không thể gắn Gmail.',
      });
      return;
    }
    setGmailFeedback({
      type: 'success',
      text: gmailInput.trim()
        ? `Đã gắn Gmail ${gmailInput.trim()} vào hồ sơ (không cần mật khẩu).`
        : 'Đã gỡ địa chỉ Gmail khỏi hồ sơ.',
    });
  };

  const handleUnlinkGmail = () => {
    setGmailInput('');
    const res = onLinkGmail('');
    if (res.ok) {
      setGmailFeedback({
        type: 'success',
        text: 'Đã gỡ địa chỉ Gmail khỏi hồ sơ.',
      });
    }
  };

  const handleRenameSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onRenameUsername(renameInput);
    if (!res.ok) {
      setRenameFeedback({
        type: 'error',
        text: res.error ?? 'Không thể đổi tên tài khoản.',
      });
      return;
    }
    setRenameFeedback({
      type: 'success',
      text: `Đã cập nhật tên tài khoản thành "${renameInput.trim()}".`,
    });
  };

  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = onUpdatePassword(newPasswordInput);
    if (!res.ok) {
      setPassFeedback({
        type: 'error',
        text: res.error ?? 'Không thể đổi mật khẩu.',
      });
      return;
    }
    setNewPasswordInput('');
    setPassFeedback({
      type: 'success',
      text: 'Đã cập nhật mật khẩu tài khoản mới.',
    });
  };

  return (
    <section id="ho-so" className="py-16 lg:py-24 bg-[#0B0D10] border-t border-[#262C38]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#262C38]">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-[#F59E0B]">
              Tài khoản thành viên · Mã định danh STH
            </p>
            <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F5F7] [text-wrap:balance]">
              Hồ sơ người xem
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#9BA3B0]">
              Tạo tài khoản riêng với tên không trùng lặp, mật khẩu bảo vệ và mã ID riêng định dạng{' '}
              <span className="font-mono text-[#F4F5F7]">STH-&#123;số id&#125;</span>. Bạn có thể
              gắn hoặc đổi Gmail trong hồ sơ bất kỳ lúc nào mà không cần mật khẩu.
            </p>
          </div>

          <div className="text-xs text-[#9BA3B0] font-mono tabular-nums shrink-0">
            {accounts.length} tài khoản đã đăng ký
          </div>
        </div>

        {!currentAccount ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Auth Form Card */}
            <div className="lg:col-span-7 bg-[#13161C] border border-[#262C38] rounded-xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center gap-1.5 p-1 bg-[#0B0D10] border border-[#262C38] rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setRegError('');
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    authTab === 'register'
                      ? 'bg-[#F59E0B] text-[#0B0D10]'
                      : 'text-[#9BA3B0] hover:text-[#F4F5F7]'
                  }`}
                >
                  Tạo hồ sơ mới
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setLoginError('');
                  }}
                  className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    authTab === 'login'
                      ? 'bg-[#F59E0B] text-[#0B0D10]'
                      : 'text-[#9BA3B0] hover:text-[#F4F5F7]'
                  }`}
                >
                  Đăng nhập hồ sơ
                </button>
              </div>

              {authTab === 'register' ? (
                <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="reg-username"
                      className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                    >
                      Tên tài khoản (duy nhất, không trùng nhau)
                    </label>
                    <input
                      id="reg-username"
                      type="text"
                      placeholder="Ví dụ: MinhKhoaFF"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="reg-password"
                      className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                    >
                      Mật khẩu tài khoản
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showRegPass ? 'text' : 'password'}
                        placeholder="Tối thiểu 4 ký tự..."
                        value={regPass}
                        onChange={(e) => setRegPass(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-11 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPass((p) => !p)}
                        aria-label={showRegPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center text-[#9BA3B0] hover:text-[#F4F5F7] cursor-pointer"
                      >
                        {showRegPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reg-gmail"
                      className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                    >
                      Gắn Gmail ngay (tùy chọn — không bắt buộc, có thể gắn sau không cần mật khẩu)
                    </label>
                    <input
                      id="reg-gmail"
                      type="email"
                      placeholder="tenban@gmail.com"
                      value={regGmail}
                      onChange={(e) => setRegGmail(e.target.value)}
                      className="w-full h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  {regError && (
                    <p role="alert" className="text-xs font-medium text-[#F87171]">
                      {regError}
                    </p>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-[#9BA3B0]">
                      ID cấp tự động theo mẫu{' '}
                      <span className="font-mono text-[#F59E0B]">STH-XXXXXX</span>
                    </span>
                    <button
                      type="submit"
                      className="px-6 py-3 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Tạo hồ sơ & Cấp ID
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                  <div>
                    <label
                      htmlFor="login-identifier"
                      className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                    >
                      Tên tài khoản hoặc ID (STH-...)
                    </label>
                    <input
                      id="login-identifier"
                      type="text"
                      placeholder="Nhập tên tài khoản hoặc STH-..."
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="w-full h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="login-password"
                      className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                    >
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showLoginPass ? 'text' : 'password'}
                        placeholder="Nhập mật khẩu tài khoản..."
                        value={loginPass}
                        onChange={(e) => setLoginPass(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-11 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPass((p) => !p)}
                        aria-label={showLoginPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center text-[#9BA3B0] hover:text-[#F4F5F7] cursor-pointer"
                      >
                        {showLoginPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {loginError && (
                    <p role="alert" className="text-xs font-medium text-[#F87171]">
                      {loginError}
                    </p>
                  )}

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Đăng nhập hồ sơ
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Right: Registered STH IDs Directory */}
            <div className="lg:col-span-5 bg-[#13161C] border border-[#262C38] rounded-xl p-6 sm:p-8 space-y-5">
              <div>
                <h3 className="font-display text-lg font-bold text-[#F4F5F7]">
                  Quy định định danh hồ sơ
                </h3>
                <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-[#9BA3B0]">
                  <li>• Mỗi tài khoản được cấp một mã ID riêng dạng STH-&#123;số id&#125; không trùng lặp.</li>
                  <li>• Tên tài khoản là duy nhất trên toàn hệ thống, không được đặt trùng tên người khác.</li>
                  <li>• Gắn hoặc thay đổi địa chỉ Gmail ngay trong hồ sơ mà không cần nhập mật khẩu.</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-[#262C38] space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-[#F4F5F7]">
                    Thành viên đã cấp mã ID
                  </p>
                  <span className="text-xs font-mono tabular-nums text-[#9BA3B0]">
                    {accounts.length} hồ sơ
                  </span>
                </div>

                {accounts.length === 0 ? (
                  <p className="text-xs text-[#9BA3B0]">
                    Chưa có hồ sơ nào được tạo. Hãy đăng ký ở biểu mẫu bên cạnh để nhận mã ID
                    STH đầu tiên.
                  </p>
                ) : (
                  <ul className="divide-y divide-[#262C38] max-h-56 overflow-y-auto text-xs">
                    {accounts.map((acc) => (
                      <li
                        key={acc.id}
                        className="py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[#F4F5F7] truncate">{acc.username}</p>
                          <p className="text-[#9BA3B0] tabular-nums">Ngày tạo: {acc.createdAt}</p>
                        </div>
                        <span className="font-mono font-semibold text-[#F59E0B] tabular-nums shrink-0">
                          {acc.id}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Profile Identity & Passwordless Gmail Link */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-[#13161C] border border-[#262C38] rounded-xl p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#262C38]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-[#191D26] border border-[#262C38] flex items-center justify-center text-[#F59E0B] shrink-0">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-[#9BA3B0]">Hồ sơ đang đăng nhập</p>
                      <h3 className="font-display text-2xl font-bold text-[#F4F5F7]">
                        {currentAccount.username}
                      </h3>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#F4F5F7] bg-[#191D26] hover:bg-[#232833] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-sm">
                  <div>
                    <dt className="text-xs text-[#9BA3B0]">ID tài khoản</dt>
                    <dd className="mt-1 flex items-center gap-2">
                      <span className="font-mono text-base font-bold tabular-nums text-[#F59E0B]">
                        {currentAccount.id}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyId(currentAccount.id)}
                        aria-label="Sao chép ID tài khoản"
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#CBD0D8] bg-[#191D26] hover:text-[#F4F5F7] border border-[#262C38] rounded cursor-pointer"
                      >
                        {copiedId ? (
                          <>
                            <Check className="w-3 h-3 text-[#34D399]" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Chép</span>
                          </>
                        )}
                      </button>
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-[#9BA3B0]">Gmail liên kết</dt>
                    <dd className="mt-1 font-medium text-[#F4F5F7] truncate">
                      {currentAccount.gmail || 'Chưa gắn Gmail'}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-xs text-[#9BA3B0]">Ngày tạo tài khoản</dt>
                    <dd className="mt-1 font-mono tabular-nums text-[#CBD0D8]">
                      {currentAccount.createdAt}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Passwordless Gmail Binding Form */}
              <form
                onSubmit={handleLinkGmailSubmit}
                className="bg-[#13161C] border border-[#262C38] rounded-xl p-6 sm:p-8 space-y-4"
                noValidate
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="font-display text-lg font-bold text-[#F4F5F7]">
                    Gắn Gmail vào hồ sơ (không cần mật khẩu)
                  </h3>
                </div>
                <p className="text-xs text-[#9BA3B0]">
                  Nhập địa chỉ Gmail bạn muốn gắn hoặc thay đổi trực tiếp tại đây mà không cần
                  nhập lại mật khẩu.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <label htmlFor="profile-gmail-input" className="sr-only">
                    Địa chỉ Gmail
                  </label>
                  <input
                    id="profile-gmail-input"
                    type="email"
                    placeholder="Ví dụ: nguyenvana@gmail.com"
                    value={gmailInput}
                    onChange={(e) => setGmailInput(e.target.value)}
                    className="flex-1 h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                  />
                  <button
                    type="submit"
                    className="px-5 h-11 text-xs font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {currentAccount.gmail ? 'Cập nhật Gmail' : 'Gắn Gmail'}
                  </button>
                  {currentAccount.gmail && (
                    <button
                      type="button"
                      onClick={handleUnlinkGmail}
                      className="px-4 h-11 text-xs font-semibold text-[#F87171] bg-[#0B0D10] hover:bg-[#2A1619] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                    >
                      Gỡ Gmail
                    </button>
                  )}
                </div>

                {gmailFeedback && (
                  <p
                    role="alert"
                    className={`text-xs font-medium ${
                      gmailFeedback.type === 'success' ? 'text-[#34D399]' : 'text-[#F87171]'
                    }`}
                  >
                    {gmailFeedback.text}
                  </p>
                )}
              </form>
            </div>

            {/* Right: Rename Unique Username & Change Password */}
            <div className="lg:col-span-5 space-y-6">
              <form
                onSubmit={handleRenameSubmit}
                className="bg-[#13161C] border border-[#262C38] rounded-xl p-6 space-y-4"
                noValidate
              >
                <h3 className="font-display text-base font-bold text-[#F4F5F7]">
                  Đổi tên tài khoản (không trùng lặp)
                </h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={renameInput}
                    onChange={(e) => setRenameInput(e.target.value)}
                    aria-label="Tên tài khoản mới"
                    placeholder="Nhập tên mới..."
                    className="flex-1 h-10 px-3 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                  />
                  <button
                    type="submit"
                    className="px-4 h-10 text-xs font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Đổi tên
                  </button>
                </div>
                {renameFeedback && (
                  <p
                    role="alert"
                    className={`text-xs font-medium ${
                      renameFeedback.type === 'success' ? 'text-[#34D399]' : 'text-[#F87171]'
                    }`}
                  >
                    {renameFeedback.text}
                  </p>
                )}
              </form>

              <form
                onSubmit={handlePasswordSubmit}
                className="bg-[#13161C] border border-[#262C38] rounded-xl p-6 space-y-4"
                noValidate
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="font-display text-base font-bold text-[#F4F5F7]">
                    Đổi mật khẩu tài khoản
                  </h3>
                </div>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    aria-label="Mật khẩu mới"
                    placeholder="Nhập mật khẩu mới (tối thiểu 4 ký tự)..."
                    className="w-full h-10 pl-3 pr-10 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass((p) => !p)}
                    aria-label={showNewPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center text-[#9BA3B0] hover:text-[#F4F5F7] cursor-pointer"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 text-xs font-semibold text-[#F4F5F7] bg-[#191D26] hover:bg-[#232833] border border-[#262C38] rounded-md transition-colors cursor-pointer"
                >
                  Cập nhật mật khẩu
                </button>
                {passFeedback && (
                  <p
                    role="alert"
                    className={`text-xs font-medium ${
                      passFeedback.type === 'success' ? 'text-[#34D399]' : 'text-[#F87171]'
                    }`}
                  >
                    {passFeedback.text}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
