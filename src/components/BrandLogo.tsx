interface BrandLogoProps {
  variant?: 'prominent' | 'inline';
}

export function BrandLogo({ variant = 'prominent' }: BrandLogoProps) {
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-2.5">
        <svg
          className="w-6 h-6 shrink-0"
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M18 2L32 9.5V22.5C32 28.5 25.5 32.8 18 34.5C10.5 32.8 4 28.5 4 22.5V9.5L18 2Z"
            fill="#191D26"
            stroke="#F59E0B"
            strokeWidth="2"
          />
          <path
            d="M18 8.5L23.5 16.5L18 26.5L12.5 16.5L18 8.5Z"
            fill="#F59E0B"
          />
          <path
            d="M18 13L20.5 17L18 22L15.5 17L18 13Z"
            fill="#0B0D10"
          />
        </svg>
        <span className="font-display text-xl font-bold tracking-tight text-[#F4F5F7]">
          Shop Tuấn Hưng
        </span>
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-4 px-6 py-4 bg-gradient-to-br from-[#171B24] to-[#101319] border border-[#2D3544] rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_28px_rgba(0,0,0,0.35)]">
      <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
        <svg
          className="w-14 h-14"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="booyahShieldGrad" x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1F2430" />
              <stop offset="100%" stopColor="#0D1015" />
            </linearGradient>
            <linearGradient id="booyahGoldGrad" x1="20" y1="12" x2="44" y2="50" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="55%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
          </defs>
          <path
            d="M32 4L56 15.5V37.5C56 49.2 44.8 57.2 32 60C19.2 57.2 8 49.2 8 37.5V15.5L32 4Z"
            fill="url(#booyahShieldGrad)"
            stroke="url(#booyahGoldGrad)"
            strokeWidth="2.5"
          />
          <path
            d="M32 10L50 18.8V36.8C50 45.4 41.4 51.6 32 54C22.6 51.6 14 45.4 14 36.8V18.8L32 10Z"
            stroke="#2D3444"
            strokeWidth="1.2"
          />
          <path
            d="M32 15L42.5 29L32 47L21.5 29L32 15Z"
            fill="url(#booyahGoldGrad)"
          />
          <path
            d="M32 21.5L37 29L32 39L27 29L32 21.5Z"
            fill="#0B0D10"
          />
          <path
            d="M17 24L22 29L17 34M47 24L42 29L47 34"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold tracking-tight text-[#F4F5F7]">
            Shop Tuấn Hưng
          </span>
        </div>
        <p className="mt-0.5 text-xs font-medium tracking-wider uppercase text-[#F59E0B]">
          Hệ Thống Giao Dịch Vật Phẩm Free Fire
        </p>
      </div>
    </div>
  );
}
