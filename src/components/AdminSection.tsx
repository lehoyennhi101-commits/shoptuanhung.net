import { Bell, Check, Eye, EyeOff, Lock, LogOut, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  AnnouncementRecord,
  CATEGORY_IMAGES,
  DeliveryMethod,
  formatHoursAgo,
  formatVnd,
  GarenaCardRecord,
  GarenaCardStatus,
  ItemCategory,
  MarketplaceItem,
  OrderRecord,
} from '../data/marketplaceData';

interface AdminSectionProps {
  isAdmin: boolean;
  adminUsername: string;
  items: MarketplaceItem[];
  orders: OrderRecord[];
  garenaCards: GarenaCardRecord[];
  announcements: AnnouncementRecord[];
  editingAnnouncement: AnnouncementRecord | null;
  walletBalance: number;
  onLoginSuccess: (username: string) => void;
  onLogout: () => void;
  onCreateItem: (newItem: MarketplaceItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAllItems: () => void;
  onAdjustBalance: (newBalance: number, reason: string) => void;
  onCompleteOrder: (orderCode: string) => void;
  onSetGarenaCardStatus: (cardId: string, status: Exclude<GarenaCardStatus, 'pending'>) => void;
  onSelectEditAnnouncement: (item: AnnouncementRecord | null) => void;
  onCreateAnnouncement: (title: string, content: string, hoursAgo: number) => void;
  onUpdateAnnouncement: (id: string, title: string, content: string, hoursAgo: number) => void;
  onDeleteAnnouncement: (id: string) => void;
}

const RARITY_OPTIONS = ['Phổ thông', 'Hiếm', 'Sử Thi', 'Huyền Thoại', 'Nâng cấp Lv.4'];

const ADMIN_CREDENTIAL_USER = 'TuanHungAdmin36';
const ADMIN_CREDENTIAL_PASS = 'mycarr';

export function AdminSection({
  isAdmin,
  adminUsername,
  items,
  orders,
  garenaCards,
  announcements,
  editingAnnouncement,
  walletBalance,
  onLoginSuccess,
  onLogout,
  onCreateItem,
  onDeleteItem,
  onClearAllItems,
  onAdjustBalance,
  onCompleteOrder,
  onSetGarenaCardStatus,
  onSelectEditAnnouncement,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
}: AdminSectionProps) {
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] =
    useState<Exclude<ItemCategory, 'all' | 'saved'>>('gun-skin');
  const [rarityLabel, setRarityLabel] = useState('Hiếm');
  const [priceStr, setPriceStr] = useState('120000');
  const [diamondStr, setDiamondStr] = useState('520');
  const [stockStr, setStockStr] = useState('5');
  const [deliveryMethod, setDeliveryMethod] =
    useState<DeliveryMethod>('Tặng quà Hộp thư');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [successTitle, setSuccessTitle] = useState('');

  const [adminBalanceInput, setAdminBalanceInput] = useState(String(walletBalance));
  const [balanceUpdatedMsg, setBalanceUpdatedMsg] = useState('');

  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annHoursAgoStr, setAnnHoursAgoStr] = useState('0');
  const [annError, setAnnError] = useState('');
  const [annFeedback, setAnnFeedback] = useState('');
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    setAdminBalanceInput(String(walletBalance));
  }, [walletBalance]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (editingAnnouncement) {
      setAnnTitle(editingAnnouncement.title);
      setAnnContent(editingAnnouncement.content);
      const currentHours = Math.max(
        0,
        Math.floor((Date.now() - editingAnnouncement.createdAtTimestamp) / 3600000)
      );
      setAnnHoursAgoStr(String(currentHours));
      setAnnError('');
    }
  }, [editingAnnouncement]);

  const categoryLabels: Record<Exclude<ItemCategory, 'all' | 'saved'>, string> = {
    'gun-skin': 'Skin Súng',
    outfit: 'Trang Phục',
    utility: 'Bom Keo & Pet',
    supply: 'Thẻ & Kim Cương',
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (
      loginUser.trim() === ADMIN_CREDENTIAL_USER &&
      loginPass === ADMIN_CREDENTIAL_PASS
    ) {
      setLoginError('');
      setLoginPass('');
      onLoginSuccess(ADMIN_CREDENTIAL_USER);
    } else {
      setLoginError('Tên đăng nhập hoặc mật khẩu Admin không chính xác.');
    }
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsedPrice = Number(priceStr);
    const parsedStock = Math.max(1, Math.min(999, Number(stockStr) || 1));
    const parsedDiamond = Number(diamondStr) || undefined;

    if (!title.trim()) {
      setFormError('Vui lòng nhập tên vật phẩm cần đăng bán.');
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice < 1000) {
      setFormError('Giá bán tối thiểu là 1.000₫.');
      return;
    }

    setFormError('');
    const newItem: MarketplaceItem = {
      id: `admin-${Date.now()}`,
      sku: `FF-ADM-${Math.floor(100 + Math.random() * 900)}`,
      category,
      categoryLabel: categoryLabels[category],
      rarityLabel,
      title: title.trim(),
      priceVnd: parsedPrice,
      diamondRef: parsedDiamond,
      sellerName: adminUsername,
      sellerUid: '0345265717',
      deliveryMethod,
      deliveryEta: '1 – 5 phút',
      stock: parsedStock,
      description:
        description.trim() ||
        'Vật phẩm chính thức do Quản trị viên phát hành trực tiếp lên hệ thống Shop Tuấn Hưng.',
      specs: [
        { label: 'Hình thức giao', value: deliveryMethod },
        { label: 'Phân hạng', value: rarityLabel },
        { label: 'Máy chủ áp dụng', value: 'Việt Nam (OB55)' },
      ],
      image: CATEGORY_IMAGES[category].src,
      imageAlt: `${title.trim()} — vật phẩm Free Fire chính thức`,
      isCommunityListing: false,
    };

    onCreateItem(newItem);
    setSuccessTitle(newItem.title);
    setTitle('');
    setDescription('');
  };

  const handleAdminBalanceUpdate = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number(adminBalanceInput);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onAdjustBalance(parsed, `Admin (${adminUsername}) chỉnh số dư`);
    setBalanceUpdatedMsg(`Đã cập nhật số dư thành ${formatVnd(parsed)}`);
    window.setTimeout(() => setBalanceUpdatedMsg(''), 2500);
  };

  const handleQuickAddBalance = (delta: number) => {
    const next = Math.max(0, walletBalance + delta);
    onAdjustBalance(next, `Admin (${adminUsername}) cộng thêm ${formatVnd(delta)}`);
    setBalanceUpdatedMsg(`Đã cộng ${formatVnd(delta)} · Số dư mới: ${formatVnd(next)}`);
    window.setTimeout(() => setBalanceUpdatedMsg(''), 2500);
  };

  const handleResetBalance = () => {
    onAdjustBalance(0, `Admin (${adminUsername}) đặt lại số dư về 0₫`);
    setBalanceUpdatedMsg('Đã đặt số dư về 0₫');
    window.setTimeout(() => setBalanceUpdatedMsg(''), 2500);
  };

  const handleAnnouncementSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanTitle = annTitle.trim();
    const cleanContent = annContent.trim();
    const parsedHours = Math.max(0, Math.floor(Number(annHoursAgoStr) || 0));

    if (!cleanTitle) {
      setAnnError('Vui lòng nhập tiêu đề thông báo.');
      return;
    }
    if (!cleanContent) {
      setAnnError('Vui lòng nhập nội dung thông báo.');
      return;
    }

    setAnnError('');
    if (editingAnnouncement) {
      onUpdateAnnouncement(editingAnnouncement.id, cleanTitle, cleanContent, parsedHours);
      setAnnFeedback(`Đã cập nhật thông báo "${cleanTitle}" (${parsedHours} giờ trước).`);
      onSelectEditAnnouncement(null);
    } else {
      onCreateAnnouncement(cleanTitle, cleanContent, parsedHours);
      setAnnFeedback(`Đã đăng thông báo "${cleanTitle}" (${parsedHours} giờ trước).`);
    }

    setAnnTitle('');
    setAnnContent('');
    setAnnHoursAgoStr('0');
    window.setTimeout(() => setAnnFeedback(''), 3500);
  };

  const handleCancelEditAnnouncement = () => {
    onSelectEditAnnouncement(null);
    setAnnTitle('');
    setAnnContent('');
    setAnnHoursAgoStr('0');
    setAnnError('');
  };

  if (!isAdmin) {
    return (
      <section id="admin" className="py-16 lg:py-24 bg-[#13161C] border-y border-[#262C38]">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#F59E0B]">
              <Lock className="w-4 h-4" />
              <span>Khu vực quản trị hệ thống</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F5F7] [text-wrap:balance]">
              02. Quyền Admin quản lý vật phẩm, Thông báo & Thẻ Garena
            </h2>
            <p className="text-sm sm:text-base leading-relaxed text-[#9BA3B0] max-w-lg">
              Khách truy cập chỉ có quyền xem thông báo, lưu vật phẩm yêu thích, nạp số dư và đặt
              mua hàng. Chức năng thêm/chỉnh thông báo, đăng bán đồ, chỉnh số dư và duyệt Thẻ
              Garena dành riêng cho Quản trị viên.
            </p>
          </div>

          <div className="lg:col-span-6 bg-[#191D26] border border-[#262C38] rounded-xl p-6 sm:p-8 max-w-lg w-full lg:ml-auto">
            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              <div>
                <h3 className="font-display text-xl font-bold text-[#F4F5F7]">
                  Đăng nhập Quyền Admin
                </h3>
                <p className="mt-1 text-xs text-[#9BA3B0]">
                  Nhập tài khoản quản trị để mở khóa công cụ quản lý kho đồ & duyệt thẻ.
                </p>
              </div>

              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                >
                  Tên đăng nhập Admin
                </label>
                <input
                  id="admin-username"
                  type="text"
                  autoComplete="username"
                  placeholder="Nhập tên Admin..."
                  value={loginUser}
                  onChange={(e) => setLoginUser(e.target.value)}
                  className="w-full h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Nhập mật khẩu..."
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-11 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((prev) => !prev)}
                    aria-label={showPass ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 inline-flex items-center justify-center text-[#9BA3B0] hover:text-[#F4F5F7] cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p role="alert" className="text-xs font-medium text-[#F87171]">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-5 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer"
              >
                Mở khóa Quyền Admin
              </button>
            </form>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="admin" className="py-16 lg:py-24 bg-[#13161C] border-y border-[#262C38]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 space-y-10">
        {/* Admin Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#262C38]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#34D399]">
              <ShieldCheck className="w-4 h-4" />
              <span>Đang hoạt động với quyền Admin · {adminUsername}</span>
            </div>
            <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F5F7]">
              02. Bảng điều khiển Admin
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearAllItems}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#F87171] bg-[#191D26] hover:bg-[#2A1619] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa toàn bộ kho ({items.length})</span>
              </button>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#F4F5F7] bg-[#191D26] hover:bg-[#232833] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Thoát quyền Admin</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Admin Item Creator */}
          <div className="lg:col-span-7 bg-[#191D26] border border-[#262C38] rounded-xl p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-[#F4F5F7] mb-5">
              Tạo & Đăng vật phẩm mới lên kho
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="admin-item-title"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Tên vật phẩm / Gói đồ
                  </label>
                  <input
                    id="admin-item-title"
                    type="text"
                    placeholder="Ví dụ: MP40 Mãng Xà Đỏ hoặc Gói 520 Kim Cương"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="admin-item-category"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Danh mục
                  </label>
                  <select
                    id="admin-item-category"
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value as Exclude<ItemCategory, 'all' | 'saved'>)
                    }
                    className="w-full h-11 px-3 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="gun-skin">Skin Súng</option>
                    <option value="outfit">Trang Phục</option>
                    <option value="utility">Bom Keo & Pet</option>
                    <option value="supply">Thẻ & Kim Cương</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-item-rarity"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Độ hiếm
                  </label>
                  <select
                    id="admin-item-rarity"
                    value={rarityLabel}
                    onChange={(e) => setRarityLabel(e.target.value)}
                    className="w-full h-11 px-3 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                  >
                    {RARITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="admin-item-price"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Giá bán (VNĐ)
                  </label>
                  <input
                    id="admin-item-price"
                    type="number"
                    min={1000}
                    step={1000}
                    value={priceStr}
                    onChange={(e) => setPriceStr(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm font-mono tabular-nums bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="admin-item-diamond"
                      className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                    >
                      Mức KC
                    </label>
                    <input
                      id="admin-item-diamond"
                      type="number"
                      min={0}
                      value={diamondStr}
                      onChange={(e) => setDiamondStr(e.target.value)}
                      className="w-full h-11 px-3 text-sm font-mono tabular-nums bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="admin-item-stock"
                      className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                    >
                      Tồn kho
                    </label>
                    <input
                      id="admin-item-stock"
                      type="number"
                      min={1}
                      max={999}
                      value={stockStr}
                      onChange={(e) => setStockStr(e.target.value)}
                      className="w-full h-11 px-3 text-sm font-mono tabular-nums bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="admin-item-delivery"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Phương thức giao đồ
                  </label>
                  <select
                    id="admin-item-delivery"
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                    className="w-full h-11 px-3 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                  >
                    <option value="Tặng quà Hộp thư">Tặng quà Hộp thư</option>
                    <option value="Mã Giftcode Garena">Mã Giftcode Garena</option>
                    <option value="Nạp trực tiếp UID">Nạp trực tiếp UID</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="admin-item-desc"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Mô tả vật phẩm
                  </label>
                  <textarea
                    id="admin-item-desc"
                    rows={2}
                    placeholder="Nhập thông tin chi tiết vật phẩm..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-[#F87171]">
                  {formError}
                </p>
              )}

              {successTitle && (
                <div className="flex items-center gap-2 p-3 bg-[#0B0D10] border border-[#262C38] rounded-md text-xs text-[#34D399]">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>
                    Admin đã đăng <strong className="text-[#F4F5F7]">{successTitle}</strong> lên
                    danh mục công khai!
                  </span>
                </div>
              )}

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Đăng vật phẩm lên Shop
                </button>
              </div>
            </form>
          </div>

          {/* Right: Admin Balance, Garena Card Review, Catalog & Order Queue */}
          <div className="lg:col-span-5 space-y-6">
            {/* Adjust Admin Wallet Balance */}
            <form
              onSubmit={handleAdminBalanceUpdate}
              className="bg-[#191D26] border border-[#262C38] rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-[#F4F5F7]">
                  Chỉnh Số dư cho Admin
                </h3>
                <span className="font-mono text-sm font-bold tabular-nums text-[#F59E0B]">
                  {formatVnd(walletBalance)}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[100000, 500000, 1000000, 5000000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleQuickAddBalance(preset)}
                    className="px-2.5 py-1.5 text-xs font-mono font-semibold text-[#F4F5F7] bg-[#0B0D10] hover:bg-[#F59E0B] hover:text-[#0B0D10] border border-[#262C38] rounded transition-colors cursor-pointer tabular-nums"
                  >
                    +{formatVnd(preset)}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleResetBalance}
                  className="px-2.5 py-1.5 text-xs font-medium text-[#F87171] bg-[#0B0D10] hover:bg-[#2A1619] border border-[#262C38] rounded transition-colors cursor-pointer"
                >
                  Đặt 0₫
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={adminBalanceInput}
                  onChange={(e) => setAdminBalanceInput(e.target.value)}
                  aria-label="Nhập số dư mới"
                  className="flex-1 h-10 px-3 text-sm font-mono tabular-nums bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                />
                <button
                  type="submit"
                  className="px-4 h-10 text-xs font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Đặt số dư
                </button>
              </div>
              {balanceUpdatedMsg && (
                <p className="text-xs text-[#34D399]">{balanceUpdatedMsg}</p>
              )}
            </form>

            {/* Garena Card Verification Queue (Thẻ đúng / Thẻ sai) */}
            <div className="bg-[#191D26] border border-[#262C38] rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-[#F4F5F7]">
                  Kiểm duyệt Thẻ Garena ({garenaCards.length})
                </h3>
              </div>

              {garenaCards.length === 0 ? (
                <p className="text-xs text-[#9BA3B0]">
                  Chưa có thẻ Garena nào được gửi. Người dùng có thể nhập Thẻ & Số seri tại mục
                  Nạp thẻ Garena hoặc trong Giỏ hàng.
                </p>
              ) : (
                <ul className="divide-y divide-[#262C38] max-h-72 overflow-y-auto text-xs">
                  {garenaCards.map((card) => (
                    <li key={card.id} className="py-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-mono font-semibold text-[#F4F5F7] truncate">
                            Thẻ: {card.cardCode}
                          </p>
                          <p className="font-mono text-[#9BA3B0] truncate">
                            Seri: {card.serialNumber} · {formatVnd(card.amountVnd)}
                          </p>
                        </div>
                        <span
                          className={`font-semibold shrink-0 ${
                            card.status === 'valid'
                              ? 'text-[#34D399]'
                              : card.status === 'invalid'
                                ? 'text-[#F87171]'
                                : 'text-[#F59E0B]'
                          }`}
                        >
                          {card.status === 'valid'
                            ? 'Thẻ đúng'
                            : card.status === 'invalid'
                              ? 'Thẻ sai'
                              : 'Chờ duyệt'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSetGarenaCardStatus(card.id, 'valid')}
                          className={`flex-1 py-1.5 px-2.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                            card.status === 'valid'
                              ? 'bg-[#34D399] border-[#34D399] text-[#0B0D10]'
                              : 'bg-[#0B0D10] border-[#262C38] text-[#34D399] hover:bg-[#34D399]/15'
                          }`}
                        >
                          Thẻ đúng
                        </button>
                        <button
                          type="button"
                          onClick={() => onSetGarenaCardStatus(card.id, 'invalid')}
                          className={`flex-1 py-1.5 px-2.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                            card.status === 'invalid'
                              ? 'bg-[#F87171] border-[#F87171] text-[#0B0D10]'
                              : 'bg-[#0B0D10] border-[#262C38] text-[#F87171] hover:bg-[#F87171]/15'
                          }`}
                        >
                          Thẻ sai
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick Catalog List for Deletion */}
            <div className="bg-[#191D26] border border-[#262C38] rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-base font-bold text-[#F4F5F7]">
                  Vật phẩm đang bán ({items.length})
                </h3>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-[#9BA3B0]">Kho hàng hiện đang trống.</p>
              ) : (
                <ul className="divide-y divide-[#262C38] max-h-52 overflow-y-auto text-xs">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[#F4F5F7] truncate">{item.title}</p>
                        <p className="text-[#9BA3B0] font-mono tabular-nums">
                          {formatVnd(item.priceVnd)} · Tồn {item.stock}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        aria-label={`Xóa ${item.title}`}
                        className="p-2 text-[#F87171] hover:bg-[#2A1619] rounded cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Order Approval Queue */}
            <div className="bg-[#191D26] border border-[#262C38] rounded-xl p-6 space-y-3">
              <h3 className="font-display text-base font-bold text-[#F4F5F7]">
                Đơn hàng chờ xử lý ({orders.length})
              </h3>
              {orders.length === 0 ? (
                <p className="text-xs text-[#9BA3B0]">Chưa có đơn hàng nào.</p>
              ) : (
                <ul className="divide-y divide-[#262C38] max-h-52 overflow-y-auto text-xs">
                  {orders.map((ord) => {
                    const isDone = ord.status.includes('Đã giao thành công');
                    return (
                      <li
                        key={ord.orderCode}
                        className="py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-mono font-semibold text-[#F4F5F7]">
                            #{ord.orderCode} · UID {ord.playerUid}
                          </p>
                          <p className="text-[#9BA3B0] truncate">{ord.status}</p>
                        </div>
                        {!isDone && (
                          <button
                            type="button"
                            onClick={() => onCompleteOrder(ord.orderCode)}
                            className="px-2.5 py-1.5 text-[11px] font-semibold text-[#0B0D10] bg-[#34D399] hover:bg-[#10B981] rounded cursor-pointer whitespace-nowrap shrink-0"
                          >
                            Duyệt giao
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Admin Announcements Manager (Thêm & Chỉnh sửa Thông Báo) */}
        <div
          id="admin-thong-bao"
          className="pt-8 border-t border-[#262C38] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <form
            onSubmit={handleAnnouncementSubmit}
            className="lg:col-span-6 bg-[#191D26] border border-[#262C38] rounded-xl p-6 sm:p-8 space-y-5"
            noValidate
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="font-display text-xl font-bold text-[#F4F5F7]">
                  {editingAnnouncement ? 'Chỉnh sửa Thông báo' : 'Thêm Thông báo mới'}
                </h3>
              </div>
              {editingAnnouncement && (
                <button
                  type="button"
                  onClick={handleCancelEditAnnouncement}
                  className="text-xs font-medium text-[#9BA3B0] hover:text-[#F4F5F7] underline cursor-pointer"
                >
                  Hủy sửa
                </button>
              )}
            </div>

            <div>
              <label
                htmlFor="admin-ann-title"
                className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
              >
                Tiêu đề thông báo
              </label>
              <input
                id="admin-ann-title"
                type="text"
                placeholder="Ví dụ: Bảo trì & mở bán skin OB55 mới"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-ann-hours"
                className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
              >
                Thời gian hiển thị (số giờ trước)
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {[0, 1, 2, 5, 12, 24].map((hrs) => {
                  const active = Number(annHoursAgoStr) === hrs;
                  return (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setAnnHoursAgoStr(String(hrs))}
                      className={`px-3 py-1.5 text-xs font-mono font-semibold rounded border transition-colors cursor-pointer tabular-nums ${
                        active
                          ? 'bg-[#F59E0B] border-[#F59E0B] text-[#0B0D10]'
                          : 'bg-[#0B0D10] border-[#262C38] text-[#CBD0D8] hover:border-[#434C5E]'
                      }`}
                    >
                      {hrs} giờ trước
                    </button>
                  );
                })}
              </div>
              <input
                id="admin-ann-hours"
                type="number"
                min={0}
                step={1}
                value={annHoursAgoStr}
                onChange={(e) => setAnnHoursAgoStr(e.target.value)}
                className="w-full h-11 px-3.5 text-sm font-mono tabular-nums bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <div>
              <label
                htmlFor="admin-ann-content"
                className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
              >
                Nội dung thông báo
              </label>
              <textarea
                id="admin-ann-content"
                rows={4}
                placeholder="Nhập nội dung thông báo gửi tới người chơi..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="w-full p-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            {annError && (
              <p role="alert" className="text-xs font-medium text-[#F87171]">
                {annError}
              </p>
            )}

            {annFeedback && (
              <div className="flex items-center gap-2 p-3 bg-[#0B0D10] border border-[#262C38] rounded-md text-xs text-[#34D399]">
                <Check className="w-4 h-4 shrink-0" />
                <span>{annFeedback}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              {editingAnnouncement && (
                <button
                  type="button"
                  onClick={handleCancelEditAnnouncement}
                  className="px-4 py-3 text-xs font-semibold text-[#F4F5F7] bg-[#0B0D10] hover:bg-[#232833] border border-[#262C38] rounded-md transition-colors cursor-pointer"
                >
                  Hủy
                </button>
              )}
              <button
                type="submit"
                className="px-6 py-3 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {editingAnnouncement ? 'Lưu thông báo' : 'Đăng thông báo'}
              </button>
            </div>
          </form>

          <div className="lg:col-span-6 bg-[#191D26] border border-[#262C38] rounded-xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display text-lg font-bold text-[#F4F5F7]">
                Danh sách Thông báo ({announcements.length})
              </h3>
              <a
                href="#thong-bao"
                className="text-xs font-medium text-[#F59E0B] hover:underline whitespace-nowrap"
              >
                Xem mục Thông báo
              </a>
            </div>

            {announcements.length === 0 ? (
              <p className="text-xs text-[#9BA3B0]">
                Chưa có thông báo nào. Hãy thêm thông báo mới ở biểu mẫu bên cạnh.
              </p>
            ) : (
              <ul className="divide-y divide-[#262C38] max-h-96 overflow-y-auto text-xs">
                {[...announcements]
                  .sort((a, b) => b.createdAtTimestamp - a.createdAtTimestamp)
                  .map((ann) => {
                    const isEditing = editingAnnouncement?.id === ann.id;
                    return (
                      <li key={ann.id} className="py-3.5 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2 text-[11px] text-[#9BA3B0]">
                              <span className="font-mono font-semibold text-[#F59E0B] tabular-nums">
                                {formatHoursAgo(ann.createdAtTimestamp, nowMs)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{ann.author}</span>
                            </div>
                            <p className="text-sm font-semibold text-[#F4F5F7] truncate">
                              {ann.title}
                            </p>
                            <p className="text-xs text-[#9BA3B0] line-clamp-2">{ann.content}</p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => onSelectEditAnnouncement(ann)}
                              aria-label={`Chỉnh sửa ${ann.title}`}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold rounded border transition-colors cursor-pointer ${
                                isEditing
                                  ? 'bg-[#F59E0B] border-[#F59E0B] text-[#0B0D10]'
                                  : 'bg-[#0B0D10] border-[#262C38] text-[#F4F5F7] hover:border-[#F59E0B]'
                              }`}
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Sửa</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteAnnouncement(ann.id)}
                              aria-label={`Xóa ${ann.title}`}
                              className="p-1.5 text-[#F87171] bg-[#0B0D10] hover:bg-[#2A1619] border border-[#262C38] rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
