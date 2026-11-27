import {
  ArrowDownRight,
  Bookmark,
  Check,
  Lock,
  Phone,
  Search,
  ShoppingBag,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AdminSection } from './components/AdminSection';
import { BottomDock } from './components/BottomDock';
import { BrandLogo } from './components/BrandLogo';
import { CartDrawer } from './components/CartDrawer';
import { Header } from './components/Header';
import { NotificationsSection } from './components/NotificationsSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ResilientImage } from './components/ResilientImage';
import { ToolsSection } from './components/ToolsSection';
import { TransferSection } from './components/TransferSection';
import { ViewerProfileSection } from './components/ViewerProfileSection';
import {
  AnnouncementRecord,
  BANK_TRANSFER_INFO,
  CartItem,
  formatVnd,
  GarenaCardRecord,
  GarenaCardStatus,
  generateUniqueAccountId,
  hashAccountPassword,
  HERO_BANNER,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ITEMS,
  ItemCategory,
  MarketplaceItem,
  OrderRecord,
  TransferRecord,
  ViewerAccount,
  WalletTransaction,
} from './data/marketplaceData';

const STORAGE_ITEMS_KEY = 'booyah_market_user_items_v2';
const STORAGE_ORDERS_KEY = 'booyah_market_orders_v2';
const STORAGE_TRANSFERS_KEY = 'booyah_market_transfers_v1';
const STORAGE_GARENA_KEY = 'booyah_market_garena_cards_v1';
const STORAGE_ANNOUNCEMENTS_KEY = 'booyah_market_announcements_v1';
const STORAGE_VIEWER_ACCOUNTS_KEY = 'booyah_market_viewer_accounts_v1';
const STORAGE_VIEWER_SESSION_KEY = 'booyah_market_viewer_session_v1';
const STORAGE_CART_KEY = 'booyah_market_cart_v2';
const STORAGE_SAVED_KEY = 'booyah_market_saved_v1';
const STORAGE_BALANCE_KEY = 'booyah_market_balance_v1';
const STORAGE_WALLET_HISTORY_KEY = 'booyah_market_wallet_history_v1';
const STORAGE_ADMIN_KEY = 'booyah_market_admin_user_v1';

const CATEGORY_TABS: { id: ItemCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'gun-skin', label: 'Skin Súng' },
  { id: 'outfit', label: 'Trang Phục' },
  { id: 'utility', label: 'Bom Keo & Pet' },
  { id: 'supply', label: 'Thẻ & Kim Cương' },
  { id: 'saved', label: 'Đã lưu' },
];

type SortOrder = 'default' | 'price-asc' | 'price-desc';

export default function App() {
  const [adminUsername, setAdminUsername] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_ADMIN_KEY) ?? '';
    } catch {
      return '';
    }
  });
  const isAdmin = adminUsername === 'TuanHungAdmin36';

  const [catalogItems, setCatalogItems] = useState<MarketplaceItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ITEMS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ORDERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [transfers, setTransfers] = useState<TransferRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_TRANSFERS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [garenaCards, setGarenaCards] = useState<GarenaCardRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_GARENA_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SAVED_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [walletBalance, setWalletBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_BALANCE_KEY);
      const parsed = saved ? Number(saved) : 0;
      return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    } catch {
      return 0;
    }
  });

  const [walletHistory, setWalletHistory] = useState<WalletTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WALLET_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_ANNOUNCEMENTS_KEY);
      return saved !== null ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementRecord | null>(null);

  const [viewerAccounts, setViewerAccounts] = useState<ViewerAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VIEWER_ACCOUNTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentViewerId, setCurrentViewerId] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_VIEWER_SESSION_KEY) ?? '';
    } catch {
      return '';
    }
  });

  const currentViewerAccount = useMemo(
    () => viewerAccounts.find((acc) => acc.id === currentViewerId) ?? null,
    [viewerAccounts, currentViewerId]
  );

  const [activeCategory, setActiveCategory] = useState<ItemCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceItem | null>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);
  const [topUpPrefill, setTopUpPrefill] = useState<number | null>(null);

  const [lookupInput, setLookupInput] = useState('');
  const [lookupResult, setLookupResult] = useState<OrderRecord | null>(null);
  const [lookupSearched, setLookupSearched] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('kho-vat-pham');

  useEffect(() => {
    const sectionIds = ['thong-bao', 'kho-vat-pham', 'admin', 'chuyen-khoan', 'ho-so'];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      { rootMargin: '-25% 0px -45% 0px', threshold: [0.1, 0.25, 0.5] }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    try {
      if (adminUsername) {
        localStorage.setItem(STORAGE_ADMIN_KEY, adminUsername);
      } else {
        localStorage.removeItem(STORAGE_ADMIN_KEY);
      }
    } catch {
      // Ignore storage error
    }
  }, [adminUsername]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(catalogItems));
    } catch {
      // Ignore storage error
    }
  }, [catalogItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage error
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TRANSFERS_KEY, JSON.stringify(transfers));
    } catch {
      // Ignore storage error
    }
  }, [transfers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_GARENA_KEY, JSON.stringify(garenaCards));
    } catch {
      // Ignore storage error
    }
  }, [garenaCards]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cart));
    } catch {
      // Ignore storage error
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage error
    }
  }, [savedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BALANCE_KEY, String(walletBalance));
    } catch {
      // Ignore storage error
    }
  }, [walletBalance]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WALLET_HISTORY_KEY, JSON.stringify(walletHistory));
    } catch {
      // Ignore storage error
    }
  }, [walletHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ANNOUNCEMENTS_KEY, JSON.stringify(announcements));
    } catch {
      // Ignore storage error
    }
  }, [announcements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VIEWER_ACCOUNTS_KEY, JSON.stringify(viewerAccounts));
    } catch {
      // Ignore storage error
    }
  }, [viewerAccounts]);

  useEffect(() => {
    try {
      if (currentViewerId) {
        localStorage.setItem(STORAGE_VIEWER_SESSION_KEY, currentViewerId);
      } else {
        localStorage.removeItem(STORAGE_VIEWER_SESSION_KEY);
      }
    } catch {
      // Ignore storage error
    }
  }, [currentViewerId]);

  const allItems = useMemo(() => {
    return [...catalogItems, ...INITIAL_ITEMS];
  }, [catalogItems]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = allItems.filter((item) => {
      if (activeCategory === 'saved' && !savedIds.includes(item.id)) return false;
      if (
        activeCategory !== 'all' &&
        activeCategory !== 'saved' &&
        item.category !== activeCategory
      ) {
        return false;
      }
      if (!query) return true;
      return (
        item.title.toLowerCase().includes(query) ||
        item.categoryLabel.toLowerCase().includes(query) ||
        item.sellerName.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query)
      );
    });

    if (sortOrder === 'price-asc') {
      return [...list].sort((a, b) => a.priceVnd - b.priceVnd);
    }
    if (sortOrder === 'price-desc') {
      return [...list].sort((a, b) => b.priceVnd - a.priceVnd);
    }
    return list;
  }, [allItems, activeCategory, savedIds, searchQuery, sortOrder]);

  const totalCartCount = useMemo(
    () => cart.reduce((sum, entry) => sum + entry.quantity, 0),
    [cart]
  );

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddToCart = (item: MarketplaceItem, qty = 1, openDrawer = false) => {
    setCart((prev) => {
      const existing = prev.find((e) => e.item.id === item.id);
      if (existing) {
        return prev.map((e) =>
          e.item.id === item.id
            ? { ...e, quantity: Math.min(item.stock, e.quantity + qty) }
            : e
        );
      }
      return [...prev, { item, quantity: qty }];
    });

    setRecentlyAddedId(item.id);
    window.setTimeout(() => {
      setRecentlyAddedId((curr) => (curr === item.id ? null : curr));
    }, 1400);

    if (openDrawer) {
      setCartDrawerOpen(true);
    }
  };

  const handleUpdateCartQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((entry) => {
          if (entry.item.id !== id) return entry;
          const nextQty = entry.quantity + delta;
          if (nextQty <= 0) return null;
          return { ...entry, quantity: Math.min(entry.item.stock, nextQty) };
        })
        .filter((entry): entry is CartItem => entry !== null)
    );
  };

  const handleRemoveCartItem = (id: string) => {
    setCart((prev) => prev.filter((entry) => entry.item.id !== id));
  };

  const handleCheckoutSuccess = (
    order: OrderRecord,
    paidWithBalance: boolean,
    garenaCard?: { cardCode: string; serialNumber: string }
  ) => {
    if (paidWithBalance) {
      const nextBalance = Math.max(0, walletBalance - order.totalVnd);
      setWalletBalance(nextBalance);
      const tx: WalletTransaction = {
        id: `TX-${Date.now()}`,
        createdAt: order.createdAt,
        type: 'purchase',
        label: `Thanh toán đơn #${order.orderCode}`,
        amountDelta: -order.totalVnd,
        balanceAfter: nextBalance,
      };
      setWalletHistory((prev) => [tx, ...prev]);
    }

    if (garenaCard) {
      const newCard: GarenaCardRecord = {
        id: `GRN-${Date.now()}`,
        createdAt: order.createdAt,
        amountVnd: order.totalVnd,
        cardCode: garenaCard.cardCode,
        serialNumber: garenaCard.serialNumber,
        source: 'checkout',
        orderCode: order.orderCode,
        status: 'pending',
        credited: false,
      };
      setGarenaCards((prev) => [newCard, ...prev]);
    }

    setOrders((prev) => [order, ...prev]);
    setCart([]);
    setLookupInput(order.orderCode);
    setLookupResult(order);
    setLookupSearched(true);
  };

  const handleCreateItemAdmin = (newItem: MarketplaceItem) => {
    if (!isAdmin) return;
    setCatalogItems((prev) => [newItem, ...prev]);
    setActiveCategory('all');
  };

  const handleDeleteItemAdmin = (id: string) => {
    if (!isAdmin) return;
    setCatalogItems((prev) => prev.filter((item) => item.id !== id));
    setCart((prev) => prev.filter((entry) => entry.item.id !== id));
    setSavedIds((prev) => prev.filter((savedId) => savedId !== id));
  };

  const handleClearAllItemsAdmin = () => {
    if (!isAdmin) return;
    setCatalogItems([]);
    setCart([]);
    setSavedIds([]);
  };

  const handleAdjustBalanceAdmin = (newBalance: number, reason: string) => {
    if (!isAdmin) return;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const createdAt = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} · ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
    const delta = newBalance - walletBalance;
    setWalletBalance(newBalance);
    const tx: WalletTransaction = {
      id: `ADM-${Date.now()}`,
      createdAt,
      type: delta >= 0 ? 'topup' : 'withdraw',
      label: reason,
      amountDelta: delta,
      balanceAfter: newBalance,
    };
    setWalletHistory((prev) => [tx, ...prev]);
  };

  const handleCompleteOrderAdmin = (orderCode: string) => {
    if (!isAdmin) return;
    setOrders((prev) =>
      prev.map((o) =>
        o.orderCode === orderCode ? { ...o, status: 'Đã giao thành công vào UID' } : o
      )
    );
    if (lookupResult?.orderCode === orderCode) {
      setLookupResult((prev) =>
        prev ? { ...prev, status: 'Đã giao thành công vào UID' } : null
      );
    }
  };

  const handleSetGarenaCardStatusAdmin = (
    cardId: string,
    status: Exclude<GarenaCardStatus, 'pending'>
  ) => {
    if (!isAdmin) return;
    const targetCard = garenaCards.find((c) => c.id === cardId);
    if (!targetCard) return;

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const timestamp = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} · ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;

    let nextCredited = targetCard.credited;

    if (targetCard.source === 'topup') {
      if (status === 'valid' && !targetCard.credited) {
        const nextBalance = walletBalance + targetCard.amountVnd;
        setWalletBalance(nextBalance);
        setWalletHistory((prev) => [
          {
            id: `GRN-OK-${Date.now()}`,
            createdAt: timestamp,
            type: 'topup',
            label: `Thẻ Garena đúng (${targetCard.id})`,
            amountDelta: targetCard.amountVnd,
            balanceAfter: nextBalance,
          },
          ...prev,
        ]);
        nextCredited = true;
      } else if (status === 'invalid' && targetCard.credited) {
        const nextBalance = Math.max(0, walletBalance - targetCard.amountVnd);
        setWalletBalance(nextBalance);
        setWalletHistory((prev) => [
          {
            id: `GRN-REV-${Date.now()}`,
            createdAt: timestamp,
            type: 'withdraw',
            label: `Thu hồi do Thẻ sai (${targetCard.id})`,
            amountDelta: -targetCard.amountVnd,
            balanceAfter: nextBalance,
          },
          ...prev,
        ]);
        nextCredited = false;
      }
    } else if (targetCard.source === 'checkout' && targetCard.orderCode) {
      const nextOrderStatus =
        status === 'valid'
          ? 'Thẻ Garena đúng · Đang giao vật phẩm vào UID'
          : 'Thẻ Garena sai · Đơn hàng bị từ chối';
      setOrders((prev) =>
        prev.map((o) =>
          o.orderCode === targetCard.orderCode ? { ...o, status: nextOrderStatus } : o
        )
      );
      if (lookupResult?.orderCode === targetCard.orderCode) {
        setLookupResult((prev) => (prev ? { ...prev, status: nextOrderStatus } : null));
      }
    }

    setGarenaCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, status, credited: nextCredited } : c))
    );
  };

  const handleCreateAnnouncementAdmin = (
    title: string,
    content: string,
    hoursAgo: number
  ) => {
    if (!isAdmin) return;
    const cleanHours = Math.max(0, Math.floor(hoursAgo));
    const newAnn: AnnouncementRecord = {
      id: `ann-${Date.now()}`,
      title,
      content,
      author: adminUsername,
      createdAtTimestamp: Date.now() - cleanHours * 3600000,
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  const handleUpdateAnnouncementAdmin = (
    id: string,
    title: string,
    content: string,
    hoursAgo: number
  ) => {
    if (!isAdmin) return;
    const cleanHours = Math.max(0, Math.floor(hoursAgo));
    setAnnouncements((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              title,
              content,
              createdAtTimestamp: Date.now() - cleanHours * 3600000,
            }
          : item
      )
    );
  };

  const handleDeleteAnnouncementAdmin = (id: string) => {
    if (!isAdmin) return;
    setAnnouncements((prev) => prev.filter((item) => item.id !== id));
    if (editingAnnouncement?.id === id) {
      setEditingAnnouncement(null);
    }
  };

  const handleEditAnnouncementFromFeed = (item: AnnouncementRecord) => {
    if (!isAdmin) return;
    setEditingAnnouncement(item);
    const el = document.getElementById('admin-thong-bao');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isValidGmailFormat = (email: string) => /^[^\s@]+@gmail\.com$/i.test(email.trim());

  const handleRegisterViewer = (
    username: string,
    password: string,
    optionalGmail: string
  ): { ok: boolean; error?: string; account?: ViewerAccount } => {
    const cleanName = username.trim();
    const cleanGmail = optionalGmail.trim();

    if (cleanName.length < 3) {
      return { ok: false, error: 'Tên tài khoản cần ít nhất 3 ký tự.' };
    }
    if (cleanName.toLowerCase() === 'tuanhungadmin36') {
      return { ok: false, error: 'Tên tài khoản này thuộc quyền quản trị. Vui lòng chọn tên khác.' };
    }
    const nameExists = viewerAccounts.some(
      (acc) => acc.username.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (nameExists) {
      return {
        ok: false,
        error: `Tên tài khoản "${cleanName}" đã tồn tại. Tên tài khoản không được trùng nhau.`,
      };
    }
    if (password.length < 4) {
      return { ok: false, error: 'Mật khẩu cần ít nhất 4 ký tự.' };
    }
    if (cleanGmail && !isValidGmailFormat(cleanGmail)) {
      return { ok: false, error: 'Vui lòng nhập Gmail đúng định dạng @gmail.com.' };
    }

    const newId = generateUniqueAccountId(viewerAccounts);
    const salt = `${newId}-${Date.now()}`;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const createdAt = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;

    const newAccount: ViewerAccount = {
      id: newId,
      username: cleanName,
      gmail: cleanGmail,
      passwordSalt: salt,
      passwordHash: hashAccountPassword(password, salt),
      createdAt,
    };

    setViewerAccounts((prev) => [newAccount, ...prev]);
    setCurrentViewerId(newAccount.id);
    return { ok: true, account: newAccount };
  };

  const handleLoginViewer = (
    identifier: string,
    password: string
  ): { ok: boolean; error?: string } => {
    const cleanId = identifier.trim();
    if (!cleanId || !password) {
      return { ok: false, error: 'Vui lòng nhập đầy đủ tên tài khoản (hoặc ID) và mật khẩu.' };
    }
    const found = viewerAccounts.find(
      (acc) =>
        acc.username.toLowerCase() === cleanId.toLowerCase() ||
        acc.id.toUpperCase() === cleanId.toUpperCase()
    );
    if (!found) {
      return { ok: false, error: 'Không tìm thấy tài khoản phù hợp.' };
    }
    const computedHash = hashAccountPassword(password, found.passwordSalt);
    if (computedHash !== found.passwordHash) {
      return { ok: false, error: 'Mật khẩu không chính xác.' };
    }
    setCurrentViewerId(found.id);
    return { ok: true };
  };

  const handleLogoutViewer = () => {
    setCurrentViewerId('');
  };

  const handleLinkViewerGmail = (gmail: string): { ok: boolean; error?: string } => {
    if (!currentViewerAccount) {
      return { ok: false, error: 'Vui lòng đăng nhập hồ sơ trước.' };
    }
    const cleanGmail = gmail.trim();
    if (cleanGmail && !isValidGmailFormat(cleanGmail)) {
      return { ok: false, error: 'Vui lòng nhập địa chỉ Gmail hợp lệ (kết thúc bằng @gmail.com).' };
    }
    setViewerAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentViewerAccount.id ? { ...acc, gmail: cleanGmail } : acc
      )
    );
    return { ok: true };
  };

  const handleRenameViewer = (newName: string): { ok: boolean; error?: string } => {
    if (!currentViewerAccount) {
      return { ok: false, error: 'Vui lòng đăng nhập hồ sơ trước.' };
    }
    const cleanName = newName.trim();
    if (cleanName.length < 3) {
      return { ok: false, error: 'Tên tài khoản cần ít nhất 3 ký tự.' };
    }
    if (cleanName.toLowerCase() === 'tuanhungadmin36') {
      return { ok: false, error: 'Tên tài khoản này không hợp lệ.' };
    }
    const duplicate = viewerAccounts.some(
      (acc) =>
        acc.id !== currentViewerAccount.id &&
        acc.username.trim().toLowerCase() === cleanName.toLowerCase()
    );
    if (duplicate) {
      return {
        ok: false,
        error: `Tên "${cleanName}" đã được sử dụng. Tên không được trùng nhau.`,
      };
    }
    setViewerAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentViewerAccount.id ? { ...acc, username: cleanName } : acc
      )
    );
    return { ok: true };
  };

  const handleUpdateViewerPassword = (newPassword: string): { ok: boolean; error?: string } => {
    if (!currentViewerAccount) {
      return { ok: false, error: 'Vui lòng đăng nhập hồ sơ trước.' };
    }
    if (newPassword.length < 4) {
      return { ok: false, error: 'Mật khẩu mới cần ít nhất 4 ký tự.' };
    }
    const nextSalt = `${currentViewerAccount.id}-${Date.now()}`;
    const nextHash = hashAccountPassword(newPassword, nextSalt);
    setViewerAccounts((prev) =>
      prev.map((acc) =>
        acc.id === currentViewerAccount.id
          ? { ...acc, passwordSalt: nextSalt, passwordHash: nextHash }
          : acc
      )
    );
    return { ok: true };
  };

  const handleSubmitGarenaCard = (card: GarenaCardRecord) => {
    setGarenaCards((prev) => [card, ...prev]);
  };

  const handleRecordTransfer = (record: TransferRecord) => {
    setTransfers((prev) => [record, ...prev]);
    if (record.purpose === 'topup') {
      const nextBalance = walletBalance + record.amountVnd;
      setWalletBalance(nextBalance);
      const tx: WalletTransaction = {
        id: `TX-${Date.now()}`,
        createdAt: record.createdAt,
        type: 'topup',
        label: `Nạp ZaloPay (${record.id})`,
        amountDelta: record.amountVnd,
        balanceAfter: nextBalance,
      };
      setWalletHistory((prev) => [tx, ...prev]);
    }
  };

  const handleWithdrawBalance = (amount: number, targetAccount: string): boolean => {
    const cleanAmount = Math.floor(amount);
    if (!Number.isFinite(cleanAmount) || cleanAmount < 10000 || cleanAmount > walletBalance) {
      return false;
    }
    const fee = Math.round(cleanAmount * 0.1);
    const netReceived = cleanAmount - fee;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const createdAt = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} · ${pad(
      now.getHours()
    )}:${pad(now.getMinutes())}`;
    const nextBalance = walletBalance - cleanAmount;
    setWalletBalance(nextBalance);
    const tx: WalletTransaction = {
      id: `WD-${Date.now()}`,
      createdAt,
      type: 'withdraw',
      label: `Rút ${formatVnd(cleanAmount)} về ${targetAccount} (Chiết khấu 10%: -${formatVnd(fee)} · Thực nhận ${formatVnd(netReceived)})`,
      amountDelta: -cleanAmount,
      balanceAfter: nextBalance,
    };
    setWalletHistory((prev) => [tx, ...prev]);
    return true;
  };

  const handleGoToTopUp = (missingAmount: number) => {
    setTopUpPrefill(Math.max(10000, missingAmount));
    const el = document.getElementById('chuyen-khoan');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOrderLookup = (e: FormEvent) => {
    e.preventDefault();
    const cleaned = lookupInput.trim().toUpperCase();
    const found = orders.find((o) => o.orderCode.toUpperCase() === cleaned) ?? null;
    setLookupResult(found);
    setLookupSearched(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F4F5F7] flex flex-col pb-14">
      <Header
        cartCount={totalCartCount}
        isAdmin={isAdmin}
        onOpenCart={() => setCartDrawerOpen(true)}
      />

      <main className="flex-1">
        {/* STOREFRONT HERO SPLIT */}
        <section className="relative overflow-hidden pt-8 sm:pt-12 lg:pt-14 pb-10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_50%_at_80%_10%,rgba(245,158,11,0.09),transparent_65%)]"
          />
          <div className="relative max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              <div className="lg:col-span-5 flex flex-col justify-between py-2">
                <div>
                  <p className="text-xs font-medium text-[#F59E0B]">
                    Phiên bản OB55 · Cửa hàng vật phẩm chính thức
                  </p>
                  <h1 className="mt-4 font-display text-[clamp(2.25rem,4vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-[#F4F5F7] [text-wrap:balance]">
                    Mua vật phẩm Free Fire & Thanh toán qua Ví số dư.
                  </h1>
                  <p className="mt-5 text-sm sm:text-base leading-relaxed text-[#9BA3B0] max-w-lg">
                    Chọn mua skin súng, trang phục, bom keo, thẻ đổi tên do Admin kiểm duyệt và
                    phát hành. Hỗ trợ nạp Số dư qua ZaloPay ({BANK_TRANSFER_INFO.accountName})
                    hoặc Nạp thẻ Garena.
                  </p>
                </div>

                <div className="mt-8 lg:mt-10 flex flex-wrap items-center gap-3.5">
                  <a
                    href="#kho-vat-pham"
                    className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md shadow-[0_6px_20px_rgba(245,158,11,0.2)] transition-all duration-150 whitespace-nowrap shrink-0"
                  >
                    Xem kho vật phẩm
                  </a>
                  <a
                    href="#chuyen-khoan"
                    className="inline-flex items-center gap-1.5 px-5 py-3 text-sm font-semibold text-[#F4F5F7] bg-[#191D26] hover:bg-[#232833] border border-[#2D3544] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0"
                  >
                    <span>Nạp Số dư & Thẻ Garena</span>
                    <ArrowDownRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="relative w-full h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[440px] rounded-xl overflow-hidden border border-[#2D3544] shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
                  <ResilientImage
                    src={HERO_BANNER.image}
                    alt={HERO_BANNER.alt}
                    fallbackTitle="Kho Trang Bị Free Fire"
                    className="w-full h-full"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0D10]/90 via-[#0B0D10]/20 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#CBD0D8]">
                      <span className="font-mono font-semibold text-[#F59E0B]">OB55</span>
                      <span aria-hidden="true">·</span>
                      <span>Kho trang bị chính thức</span>
                      <span aria-hidden="true">·</span>
                      <span>Giao nhanh qua UID</span>
                    </div>
                    <span className="font-mono text-xs text-[#9BA3B0] tabular-nums">
                      ZaloPay {BANK_TRANSFER_INFO.accountNumber}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 4-Column Operational Utility Strip */}
            <div className="mt-10 bg-[#13161C]/60 border border-[#262C38] rounded-xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#262C38] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="p-4 sm:p-5">
                <p className="text-xs text-[#9BA3B0]">Số dư tài khoản</p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold tabular-nums text-[#F59E0B]">
                    {formatVnd(walletBalance)}
                  </span>
                  <a
                    href="#chuyen-khoan"
                    className="text-xs font-medium text-[#CBD0D8] hover:text-[#F59E0B] underline"
                  >
                    Nạp thêm
                  </a>
                </div>
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-xs text-[#9BA3B0]">Kho hàng hiện tại</p>
                <p className="mt-1 text-sm font-semibold tabular-nums text-[#F4F5F7]">
                  {allItems.length} vật phẩm đang mở bán
                </p>
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-xs text-[#9BA3B0]">Số điện thoại · ZaloPay</p>
                <p className="mt-1 text-sm font-mono font-semibold tabular-nums text-[#F4F5F7]">
                  {BANK_TRANSFER_INFO.accountNumber}
                </p>
              </div>
              <div className="p-4 sm:p-5">
                <p className="text-xs text-[#9BA3B0]">Chủ tài khoản quản lý</p>
                <p className="mt-1 text-sm font-semibold text-[#F4F5F7]">
                  {BANK_TRANSFER_INFO.accountName}
                </p>
              </div>
            </div>

            {/* Prominent Brand Emblem Logo Placed Right Below the Phone Row */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-6 py-5 px-5 sm:px-8 bg-[#13161C] border border-[#262C38] rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <BrandLogo variant="prominent" />
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-xs text-[#9BA3B0]">
                <div className="flex items-center gap-2 pr-1">
                  <Phone className="w-4 h-4 text-[#F59E0B]" />
                  <span>
                    Hotline & ZaloPay:{' '}
                    <strong className="font-mono text-[#F4F5F7] tabular-nums">
                      {BANK_TRANSFER_INFO.accountNumber}
                    </strong>
                  </span>
                </div>
                <a
                  href="#ho-so"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#F4F5F7] bg-[#191D26] hover:bg-[#232833] border border-[#262C38] hover:border-[#3A4354] rounded-md transition-colors whitespace-nowrap"
                >
                  <span>
                    {currentViewerAccount
                      ? `${currentViewerAccount.username} · ${currentViewerAccount.id}`
                      : 'Hồ sơ người xem'}
                  </span>
                </a>
                <a
                  href="#admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#F4F5F7] bg-[#191D26] hover:bg-[#232833] border border-[#262C38] hover:border-[#3A4354] rounded-md transition-colors whitespace-nowrap"
                >
                  <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>{isAdmin ? 'Mở Bảng Admin' : 'Đăng nhập Quyền Admin'}</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ANNOUNCEMENTS SECTION */}
        <NotificationsSection
          announcements={announcements}
          isAdmin={isAdmin}
          onEditInAdmin={handleEditAnnouncementFromFeed}
          onDeleteAnnouncement={handleDeleteAnnouncementAdmin}
        />

        {/* SECTION 01: PRODUCT CATALOG */}
        <section id="kho-vat-pham" className="py-12 lg:py-16">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#262C38]">
              <div>
                <p className="text-xs font-medium text-[#9BA3B0]">
                  Danh mục vật phẩm chính thức
                </p>
                <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F5F7]">
                  01. Kho vật phẩm Free Fire
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[#9BA3B0] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên đồ, skin, thẻ..."
                    aria-label="Tìm kiếm vật phẩm"
                    className="w-full h-10 pl-10 pr-3.5 text-sm bg-[#13161C] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <select
                  aria-label="Sắp xếp theo giá"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="h-10 px-3 text-sm bg-[#13161C] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                >
                  <option value="default">Mặc định</option>
                  <option value="price-asc">Giá thấp đến cao</option>
                  <option value="price-desc">Giá cao đến thấp</option>
                </select>
              </div>
            </div>

            <div
              role="tablist"
              aria-label="Lọc theo loại vật phẩm"
              className="mt-6 flex flex-wrap items-center gap-1.5 p-1 bg-[#13161C] border border-[#262C38] rounded-lg w-fit"
            >
              {CATEGORY_TABS.map((tab) => {
                const isActive = activeCategory === tab.id;
                const count =
                  tab.id === 'saved'
                    ? savedIds.length
                    : tab.id === 'all'
                      ? allItems.length
                      : undefined;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                      isActive
                        ? 'bg-[#F59E0B] text-[#0B0D10]'
                        : 'text-[#9BA3B0] hover:text-[#F4F5F7]'
                    }`}
                  >
                    {tab.label}
                    {count !== undefined ? ` (${count})` : ''}
                  </button>
                );
              })}
            </div>

            {filteredItems.length === 0 ? (
              <div className="mt-8 py-16 px-6 bg-[#13161C] border border-[#262C38] rounded-xl text-center space-y-4">
                <p className="font-display text-xl font-bold text-[#F4F5F7]">
                  {allItems.length === 0
                    ? 'Danh mục vật phẩm đang trống'
                    : 'Không tìm thấy vật phẩm phù hợp'}
                </p>
                <p className="text-sm text-[#9BA3B0] max-w-md mx-auto leading-relaxed">
                  {allItems.length === 0
                    ? 'Chỉ Quản trị viên có quyền thêm và đăng bán vật phẩm vào kho hàng. Trong lúc chờ cập nhật, bạn có thể nạp Số dư qua ZaloPay hoặc Thẻ Garena bên dưới.'
                    : 'Thử đổi từ khóa tìm kiếm hoặc chọn lại tab Tất cả.'}
                </p>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                  {allItems.length === 0 ? (
                    <>
                      <a
                        href="#chuyen-khoan"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors"
                      >
                        <span>Nạp Số dư & Thẻ Garena</span>
                      </a>
                      <a
                        href="#admin"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#F4F5F7] bg-[#191D26] hover:bg-[#232833] border border-[#262C38] rounded-md transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{isAdmin ? 'Thêm đồ trong Admin' : 'Đăng nhập Admin'}</span>
                      </a>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory('all');
                        setSearchQuery('');
                      }}
                      className="px-4 py-2 text-xs font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md cursor-pointer"
                    >
                      Xem tất cả vật phẩm
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => {
                  const isAdded = recentlyAddedId === item.id;
                  const isSaved = savedIds.includes(item.id);
                  return (
                    <article
                      key={item.id}
                      className="group bg-[#191D26] border border-[#262C38] hover:border-[#434C5E] rounded-xl overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(item)}
                        className="text-left flex-1 flex flex-col cursor-pointer focus-visible:outline-2 focus-visible:outline-[#F59E0B]"
                      >
                        <div className="w-full aspect-[4/3] bg-[#0B0D10] overflow-hidden">
                          <ResilientImage
                            src={item.image}
                            alt={item.imageAlt}
                            fallbackTitle={item.title}
                            className="w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 text-xs text-[#9BA3B0]">
                              <span className="uppercase tracking-wide font-medium">
                                {item.categoryLabel}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{item.rarityLabel}</span>
                            </div>

                            <h3 className="mt-2 text-base font-semibold text-[#F4F5F7] group-hover:text-[#F59E0B] transition-colors line-clamp-2">
                              {item.title}
                            </h3>
                          </div>

                          <div className="mt-4 pt-3 border-t border-[#262C38] flex items-center justify-between gap-3 text-xs text-[#9BA3B0]">
                            <span className="truncate">
                              {item.sellerName} · {item.deliveryMethod}
                            </span>
                            <span className="tabular-nums shrink-0">Còn {item.stock}</span>
                          </div>
                        </div>
                      </button>

                      <div className="px-5 pb-5 pt-1 flex items-center justify-between gap-3">
                        <div>
                          <span className="font-mono text-lg font-semibold tabular-nums text-[#F59E0B]">
                            {formatVnd(item.priceVnd)}
                          </span>
                          {item.diamondRef && (
                            <span className="block font-mono text-[11px] tabular-nums text-[#9BA3B0]">
                              ~ {item.diamondRef} KC
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleSave(item.id)}
                            aria-label={isSaved ? 'Bỏ lưu' : 'Lưu vật phẩm'}
                            className={`w-9 h-9 inline-flex items-center justify-center rounded-md border transition-colors cursor-pointer ${
                              isSaved
                                ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B]'
                                : 'bg-[#0B0D10] border-[#262C38] text-[#9BA3B0] hover:text-[#F4F5F7]'
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddToCart(item, 1, false)}
                            className={`inline-flex items-center gap-1.5 px-3.5 h-9 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                              isAdded
                                ? 'bg-[#34D399] text-[#0B0D10]'
                                : 'bg-[#0B0D10] hover:bg-[#F59E0B] text-[#F4F5F7] hover:text-[#0B0D10] border border-[#262C38] hover:border-[#F59E0B]'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Đã thêm</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-3.5 h-3.5" />
                                <span>Thêm giỏ</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 02: ADMIN-ONLY CATALOG, BALANCE, ANNOUNCEMENTS & GARENA CARD VERIFICATION */}
        <AdminSection
          isAdmin={isAdmin}
          adminUsername={adminUsername}
          items={catalogItems}
          orders={orders}
          garenaCards={garenaCards}
          announcements={announcements}
          editingAnnouncement={editingAnnouncement}
          walletBalance={walletBalance}
          onLoginSuccess={(username) => setAdminUsername(username)}
          onLogout={() => {
            setAdminUsername('');
            setEditingAnnouncement(null);
          }}
          onCreateItem={handleCreateItemAdmin}
          onDeleteItem={handleDeleteItemAdmin}
          onClearAllItems={handleClearAllItemsAdmin}
          onAdjustBalance={handleAdjustBalanceAdmin}
          onCompleteOrder={handleCompleteOrderAdmin}
          onSetGarenaCardStatus={handleSetGarenaCardStatusAdmin}
          onSelectEditAnnouncement={setEditingAnnouncement}
          onCreateAnnouncement={handleCreateAnnouncementAdmin}
          onUpdateAnnouncement={handleUpdateAnnouncementAdmin}
          onDeleteAnnouncement={handleDeleteAnnouncementAdmin}
        />

        {/* SECTION 03: WALLET BALANCE, ZALOPAY & GARENA CARD TOP-UP */}
        <TransferSection
          walletBalance={walletBalance}
          walletHistory={walletHistory}
          recentTransfers={transfers}
          garenaCards={garenaCards}
          prefillAmount={topUpPrefill}
          onRecordTransfer={handleRecordTransfer}
          onWithdrawBalance={handleWithdrawBalance}
          onSubmitGarenaCard={handleSubmitGarenaCard}
        />

        {/* SECTION 04: FREE FIRE TOOLS */}
        <ToolsSection />

        {/* SECTION 05: VIEWER PROFILE */}
        <ViewerProfileSection
          accounts={viewerAccounts}
          currentAccount={currentViewerAccount}
          onRegister={handleRegisterViewer}
          onLogin={handleLoginViewer}
          onLogout={handleLogoutViewer}
          onLinkGmail={handleLinkViewerGmail}
          onRenameUsername={handleRenameViewer}
          onUpdatePassword={handleUpdateViewerPassword}
        />

        {/* SECTION 06: ORDER LOOKUP */}
        <section id="tra-cuu" className="py-16 lg:py-20 bg-[#0B0D10] border-t border-[#262C38]">
          <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <p className="text-xs font-medium text-[#9BA3B0]">Kiểm tra đơn hàng</p>
                <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F7]">
                  Tra cứu trạng thái đơn hàng theo mã
                </h2>
              </div>

              <form onSubmit={handleOrderLookup} className="flex flex-col sm:flex-row gap-3">
                <label htmlFor="order-lookup-input" className="sr-only">
                  Nhập mã đơn hàng
                </label>
                <input
                  id="order-lookup-input"
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="Nhập mã đơn (ví dụ: FF-2711-4820)"
                  className="flex-1 h-11 px-4 text-sm font-mono uppercase bg-[#13161C] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                />
                <button
                  type="submit"
                  className="px-6 h-11 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  Kiểm tra đơn
                </button>
              </form>

              {lookupSearched && !lookupResult && (
                <div className="p-5 bg-[#13161C] border border-[#262C38] rounded-xl text-sm text-[#9BA3B0]">
                  {orders.length === 0
                    ? 'Chưa có đơn hàng nào được tạo trong phiên này.'
                    : `Không tìm thấy mã đơn "${lookupInput}". Hãy kiểm tra lại mã đơn đã xác nhận trong Giỏ hàng.`}
                </div>
              )}

              {lookupResult && (
                <div className="bg-[#13161C] border border-[#262C38] rounded-xl p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#262C38]">
                    <div>
                      <span className="font-mono text-base font-bold tabular-nums text-[#F4F5F7]">
                        #{lookupResult.orderCode}
                      </span>
                      <p className="mt-0.5 text-xs text-[#9BA3B0] tabular-nums">
                        Tạo lúc {lookupResult.createdAt} · {lookupResult.paymentMethod}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-[#34D399]">
                      {lookupResult.status}
                    </span>
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <dt className="text-xs text-[#9BA3B0]">UID nhận đồ</dt>
                      <dd className="mt-1 font-mono tabular-nums text-[#F4F5F7]">
                        {lookupResult.playerUid}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#9BA3B0]">Máy chủ</dt>
                      <dd className="mt-1 text-[#F4F5F7]">{lookupResult.server}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#9BA3B0]">Tổng giá trị</dt>
                      <dd className="mt-1 font-mono font-semibold tabular-nums text-[#F59E0B]">
                        {formatVnd(lookupResult.totalVnd)}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-[#13161C] border border-[#262C38] rounded-xl p-6 space-y-4">
              <p className="text-xs font-medium text-[#F59E0B]">Thông tin nhận chuyển khoản nhanh</p>
              <dl className="divide-y divide-[#262C38] text-sm">
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#9BA3B0]">Ngân hàng</dt>
                  <dd className="font-semibold text-[#F4F5F7]">{BANK_TRANSFER_INFO.bank}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#9BA3B0]">STK</dt>
                  <dd className="font-mono font-semibold text-[#F59E0B] tabular-nums">
                    {BANK_TRANSFER_INFO.accountNumber}
                  </dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#9BA3B0]">Tên</dt>
                  <dd className="font-semibold text-[#F4F5F7]">{BANK_TRANSFER_INFO.accountName}</dd>
                </div>
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#9BA3B0]">Nội dung</dt>
                  <dd className="font-mono font-semibold text-[#34D399]">
                    {BANK_TRANSFER_INFO.transferNote}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER WITH PHONE LINE ABOVE PROMINENT LOGO */}
      <footer className="border-t border-[#262C38] bg-[#080A0C] py-12">
        <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#191D26]">
            <div className="flex flex-wrap items-center gap-4 text-sm text-[#CBD0D8]">
              <span className="inline-flex items-center gap-2 font-mono font-semibold text-[#F59E0B] tabular-nums">
                <Phone className="w-4 h-4" />
                <span>Điện thoại / ZaloPay: {BANK_TRANSFER_INFO.accountNumber}</span>
              </span>
              <span aria-hidden="true" className="text-[#262C38]">
                |
              </span>
              <span>Chủ tài khoản: {BANK_TRANSFER_INFO.accountName}</span>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#9BA3B0]">
              <a href="#thong-bao" className="hover:text-[#F4F5F7] transition-colors">
                Thông báo
              </a>
              <a href="#kho-vat-pham" className="hover:text-[#F4F5F7] transition-colors">
                Kho vật phẩm
              </a>
              <a href="#chuyen-khoan" className="hover:text-[#F4F5F7] transition-colors">
                Số dư & Nạp
              </a>
              <a href="#ho-so" className="hover:text-[#F4F5F7] transition-colors">
                Hồ sơ
              </a>
              <a href="#cong-cu" className="hover:text-[#F4F5F7] transition-colors">
                Công cụ
              </a>
              <a href="#admin" className="hover:text-[#F4F5F7] transition-colors">
                Quyền Admin
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <BrandLogo variant="prominent" />
            <p className="text-xs text-[#6B7280] max-w-sm">
              © 2026 Shop Tuấn Hưng. Chỉ Quản trị viên mới có quyền đăng bán và quản lý danh mục
              vật phẩm.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductDetailModal
        item={selectedProduct}
        isSaved={selectedProduct ? savedIds.includes(selectedProduct.id) : false}
        onToggleSave={handleToggleSave}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onDeleteListing={isAdmin ? handleDeleteItemAdmin : undefined}
      />

      <CartDrawer
        isOpen={cartDrawerOpen}
        cartItems={cart}
        walletBalance={walletBalance}
        onClose={() => setCartDrawerOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onGoToTopUp={handleGoToTopUp}
        onCheckoutSuccess={handleCheckoutSuccess}
      />

      <BottomDock
        categories={CATEGORY_TABS}
        activeCategory={activeCategory}
        activeSection={activeSection}
        itemCount={allItems.length}
        savedCount={savedIds.length}
        cartCount={totalCartCount}
        walletBalance={walletBalance}
        isAdmin={isAdmin}
        onSelectCategory={(cat) => setActiveCategory(cat)}
        onOpenCart={() => setCartDrawerOpen(true)}
      />
    </div>
  );
}
