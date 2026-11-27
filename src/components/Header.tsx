import { Menu, ShoppingBag, X } from 'lucide-react';
import { useState } from 'react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  cartCount: number;
  isAdmin: boolean;
  onOpenCart: () => void;
}

export function Header({ cartCount, isAdmin, onOpenCart }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '#thong-bao', label: 'Thông báo' },
    { href: '#kho-vat-pham', label: 'Kho vật phẩm' },
    { href: '#chuyen-khoan', label: 'Số dư & Nạp' },
    { href: '#ho-so', label: 'Hồ sơ' },
    { href: '#admin', label: isAdmin ? 'Quản trị Admin' : 'Quyền Admin' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B0D10]/92 backdrop-blur-xl border-b border-[#262C38]/90">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12 h-14 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#"
          className="whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F59E0B]"
        >
          <BrandLogo variant="inline" />
        </a>

        {/* Zone 2: 4 concise single-line text nav links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#9BA3B0]"
        >
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative py-1 hover:text-[#F4F5F7] transition-colors duration-150 whitespace-nowrap shrink-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-px after:bg-[#F59E0B] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200 after:origin-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F59E0B]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action button + mobile menu trigger */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Giỏ hàng ({cartCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Đóng trình đơn' : 'Mở trình đơn'}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-[#F4F5F7] hover:bg-[#191D26] rounded-md transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#262C38] bg-[#13161C] px-5 py-4 space-y-2">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2.5 text-sm font-medium text-[#F4F5F7] hover:text-[#F59E0B] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
