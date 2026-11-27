import { Calculator, Check, Copy, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { formatVnd } from '../data/marketplaceData';

const NICKNAME_STYLES = [
  { id: 'king', label: 'Hoàng Gia', prefix: '꧁༺', suffix: '༻꧂' },
  { id: 'clan', label: 'Chiến Đội', prefix: '乡', suffix: '亗' },
  { id: 'pro', label: 'Tối Giản', prefix: '『FF』', suffix: '⚡' },
  { id: 'dark', label: 'Hắc Báo', prefix: '〆', suffix: '么' },
];

const SUPERSCRIPT_MAP: Record<string, string> = {
  a: 'ᵃ',
  b: 'ᵇ',
  c: 'ᶜ',
  d: 'ᵈ',
  e: 'ᵉ',
  f: 'ᶠ',
  g: 'ᵍ',
  h: 'ʰ',
  i: 'ⁱ',
  j: 'ʲ',
  k: 'ᵏ',
  l: 'ˡ',
  m: 'ᵐ',
  n: 'ⁿ',
  o: 'ᵒ',
  p: 'ᵖ',
  r: 'ʳ',
  s: 'ˢ',
  t: 'ᵗ',
  u: 'ᵘ',
  v: 'ᵛ',
  w: 'ʷ',
  x: 'ˣ',
  y: 'ʸ',
  z: 'ᶻ',
};

function toMiniCaps(input: string): string {
  return input
    .split('')
    .map((ch) => SUPERSCRIPT_MAP[ch.toLowerCase()] ?? ch)
    .join('');
}

export function ToolsSection() {
  const [diamonds, setDiamonds] = useState<number>(520);
  const [channel, setChannel] = useState<'zalopay' | 'garena' | 'card'>('zalopay');

  const [rawName, setRawName] = useState<string>('AnhHung');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const ratePerDiamond =
    channel === 'zalopay' ? 190 : channel === 'garena' ? 200 : 225;
  const estimatedVnd = Math.round(diamonds * ratePerDiamond);
  const bonusDiamonds = diamonds >= 1000 ? Math.round(diamonds * 0.08) : 0;

  const handleCopyName = async (id: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedId(id);
      window.setTimeout(() => {
        setCopiedId((curr) => (curr === id ? null : curr));
      }, 1500);
    } catch {
      // Ignore clipboard failures
    }
  };

  return (
    <section
      id="cong-cu"
      className="py-16 lg:py-24 bg-[#13161C] border-t border-[#262C38]"
    >
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="max-w-2xl">
          <p className="text-xs font-medium text-[#9BA3B0]">
            Tiện ích hỗ trợ người chơi
          </p>
          <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F5F7] [text-wrap:balance]">
            04. Công cụ tính giá & Tạo tên Free Fire
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Tool 1: Diamond & Price Converter */}
          <div className="lg:col-span-6 bg-[#191D26] border border-[#262C38] rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0B0D10] border border-[#262C38] flex items-center justify-center text-[#F59E0B]">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#F4F5F7]">
                    Quy đổi Kim Cương & Định giá đồ
                  </h3>
                  <p className="text-xs text-[#9BA3B0]">
                    Ước tính giá trị vật phẩm theo mức nạp thực tế
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#9BA3B0]">Số lượng Kim Cương</span>
                  <span className="font-mono font-semibold text-[#F59E0B] tabular-nums">
                    {diamonds.toLocaleString('vi-VN')} KC
                  </span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={5600}
                  step={20}
                  value={diamonds}
                  onChange={(e) => setDiamonds(Number(e.target.value))}
                  aria-label="Chọn số lượng Kim Cương"
                  className="w-full accent-[#F59E0B] cursor-pointer"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {[100, 310, 520, 1060, 2180].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDiamonds(preset)}
                      className={`px-2.5 py-1 text-xs font-mono rounded border transition-colors cursor-pointer tabular-nums ${
                        diamonds === preset
                          ? 'bg-[#F59E0B] border-[#F59E0B] text-[#0B0D10] font-semibold'
                          : 'bg-[#0B0D10] border-[#262C38] text-[#9BA3B0] hover:text-[#F4F5F7]'
                      }`}
                    >
                      {preset} KC
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-xs font-medium text-[#9BA3B0] mb-2">
                  Kênh quy đổi
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'zalopay' as const, label: 'ZaloPay (Ưu đãi)' },
                    { id: 'garena' as const, label: 'Sò / Garena' },
                    { id: 'card' as const, label: 'Thẻ cào ĐT' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setChannel(opt.id)}
                      className={`py-2 px-3 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                        channel === opt.id
                          ? 'bg-[#F4F5F7] border-[#F4F5F7] text-[#0B0D10]'
                          : 'bg-[#0B0D10] border-[#262C38] text-[#9BA3B0] hover:text-[#F4F5F7]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-[#262C38] flex items-center justify-between gap-4">
              <div>
                <span className="block text-xs text-[#9BA3B0]">Chi phí ước tính</span>
                <span className="font-mono text-2xl font-bold tabular-nums text-[#F4F5F7]">
                  {formatVnd(estimatedVnd)}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-xs text-[#9BA3B0]">Khuyến mãi mốc</span>
                <span className="font-mono text-sm font-semibold tabular-nums text-[#34D399]">
                  +{bonusDiamonds} KC
                </span>
              </div>
            </div>
          </div>

          {/* Tool 2: Stylish Nickname Generator */}
          <div className="lg:col-span-6 bg-[#191D26] border border-[#262C38] rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#0B0D10] border border-[#262C38] flex items-center justify-center text-[#F59E0B]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-[#F4F5F7]">
                    Tạo tên & Ký tự đặc biệt Free Fire
                  </h3>
                  <p className="text-xs text-[#9BA3B0]">
                    Dùng ngay khi kích hoạt Thẻ Đổi Tên trong game
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="ff-nickname-input"
                  className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                >
                  Nhập tên gốc của bạn
                </label>
                <input
                  id="ff-nickname-input"
                  type="text"
                  maxLength={14}
                  value={rawName}
                  onChange={(e) => setRawName(e.target.value)}
                  placeholder="Nhập tên nhân vật..."
                  className="w-full h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>

              <div className="divide-y divide-[#262C38] border-t border-[#262C38]">
                {NICKNAME_STYLES.map((style) => {
                  const base = rawName.trim() || 'Booyah';
                  const formatted =
                    style.id === 'pro'
                      ? `${style.prefix}${toMiniCaps(base)}${style.suffix}`
                      : `${style.prefix}${base}${style.suffix}`;
                  const isCopied = copiedId === style.id;
                  return (
                    <div
                      key={style.id}
                      className="py-3 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <span className="block text-[11px] text-[#9BA3B0]">
                          {style.label}
                        </span>
                        <span className="font-medium text-sm text-[#F4F5F7] truncate block">
                          {formatted}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyName(style.id, formatted)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#F4F5F7] bg-[#0B0D10] hover:bg-[#F59E0B] hover:text-[#0B0D10] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
