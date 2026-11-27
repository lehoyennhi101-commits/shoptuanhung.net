import {
  Bell,
  ChevronUp,
  LayoutGrid,
  Package,
  Shield,
  ShoppingBag,
  User,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { formatVnd, ItemCategory } from '../data/marketplaceData';

interface CategoryOption {
  id: ItemCategory;
  label: string;
}

interface BottomDockProps {
  categories: CategoryOption[];
  activeCategory: ItemCategory;
  activeSection: string;
  itemCount: number;
  savedCount: number;
  cartCount: number;
  walletBalance: number;
  isAdmin: boolean;
  onSelectCategory: (category: ItemCategory) => void;
  onOpenCart: () => void;
}

export function BottomDock({
  categories,
  activeCategory,
  activeSection,
  itemCount,
  savedCount,
  cartCount,
  walletBalance,
  isAdmin,
  onSelectCategory,
  onOpenCart,
}: BottomDockProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleCategoryClick = (categoryId: ItemCategory) => {
    onSelectCategory(categoryId);
    setDrawerOpen(false);
    const el = document.getElementById('kho-vat-pham');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    {
      id: 'kho-vat-pham',
      href: '#kho-vat-pham',
      label: 'Kho đồ',
      icon: Package,
    },
    {
      id: 'thong-bao',
      href: '#thong-bao',
      label: 'Thông báo',
      icon: Bell,
    },
    {
      id: 'chuyen-khoan',
      href: '#chuyen-khoan',
      label: 'Số dư',
      icon: Wallet,
    },
    {
      id: 'ho-so',
      href: '#ho-so',
      label: 'Hồ sơ',
      icon: User,
    },
    {
      id: 'admin',
      href: '#admin',
      label: isAdmin ? 'Quản trị' : 'Admin',
      icon: Shield,
    },
  ];

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 pointer-events-none">
      {/* Expandable Product Categories Strip right above the Bottom Dock */}
      {drawerOpen && (
        <div className="max-w-[1360px] mx-auto px-3 sm:px-8 lg:px-12 pb-2 pointer-events-auto">
          <div className="bg-[#13161C]/95 backdrop-blur-xl border border-[#2D3544] rounded-xl p-3 shadow-[0_-12px_32px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between gap-4 mb-2.5 px-1">
              <p className="text-xs font-semibold text-[#F4F5F7]">
                Chọn nhanh danh mục vật phẩm
              </p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-xs text-[#9BA3B0] hover:text-[#F4F5F7] cursor-pointer"
              >
                Thu gọn
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                const count =
                  cat.id === 'all'
                    ? itemCount
                    : cat.id === 'saved'
                      ? savedCount
                      : undefined;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums ${
                      isActive
                        ? 'bg-[#F59E0B] text-[#0B0D10]'
                        : 'bg-[#0B0D10] text-[#CBD0D8] hover:text-[#F4F5F7] border border-[#262C38] hover:border-[#434C5E]'
                    }`}
                  >
                    {cat.label}
                    {count !== undefined ? ` (${count})` : ''}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Dock Bar */}
      <nav
        aria-label="Danh mục dưới màn hình"
        className="pointer-events-auto bg-[#0B0D10]/94 backdrop-blur-xl border-t border-[#262C38] shadow-[0_-8px_28px_rgba(0,0,0,0.45)]"
      >
        <div className="max-w-[1360px] mx-auto px-2 sm:px-8 lg:px-12 h-14 flex items-center justify-between gap-2 sm:gap-4">
          {/* Category Picker Trigger + Section Shortcuts */}
          <div className="flex-1 flex items-center justify-around sm:justify-start sm:gap-1.5 lg:gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-expanded={drawerOpen}
              className={`relative h-14 px-2.5 sm:px-3.5 inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                drawerOpen
                  ? 'text-[#F59E0B]'
                  : 'text-[#CBD0D8] hover:text-[#F4F5F7]'
              }`}
            >
              {drawerOpen && (
                <span className="absolute top-0 inset-x-3 h-0.5 bg-[#F59E0B] rounded-b" />
              )}
              <LayoutGrid className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span>Danh mục</span>
              <ChevronUp
                className={`hidden sm:inline w-3.5 h-3.5 transition-transform duration-150 ${
                  drawerOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            <span aria-hidden="true" className="hidden sm:block h-5 w-px bg-[#262C38] mx-1 shrink-0" />

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`relative h-14 px-2.5 sm:px-3.5 inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#F4F5F7]'
                      : 'text-[#9BA3B0] hover:text-[#F4F5F7]'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-0 inset-x-3 h-0.5 bg-[#F59E0B] rounded-b" />
                  )}
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#F59E0B]' : 'text-current'
                    }`}
                  />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Desktop Quick Wallet & Cart Status */}
          <div className="hidden md:flex items-center gap-3 shrink-0 pl-3 border-l border-[#262C38]">
            <a
              href="#chuyen-khoan"
              className="text-xs text-[#9BA3B0] hover:text-[#F4F5F7] transition-colors whitespace-nowrap"
            >
              Số dư:{' '}
              <span className="font-mono font-semibold text-[#F59E0B] tabular-nums">
                {formatVnd(walletBalance)}
              </span>
            </a>

            <button
              type="button"
              onClick={onOpenCart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 tabular-nums"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Giỏ ({cartCount})</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
