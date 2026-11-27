import { Bookmark, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatVnd, MarketplaceItem } from '../data/marketplaceData';
import { ResilientImage } from './ResilientImage';

interface ProductDetailModalProps {
  item: MarketplaceItem | null;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onClose: () => void;
  onAddToCart: (item: MarketplaceItem, qty: number, openDrawer?: boolean) => void;
  onDeleteListing?: (id: string) => void;
}

export function ProductDetailModal({
  item,
  isSaved,
  onToggleSave,
  onClose,
  onAddToCart,
  onDeleteListing,
}: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [item]);

  useEffect(() => {
    if (!item) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto bg-[#13161C] border border-[#262C38] rounded-xl shadow-2xl grid grid-cols-1 lg:grid-cols-12"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng chi tiết vật phẩm"
          className="absolute top-4 right-4 z-10 inline-flex items-center justify-center w-10 h-10 bg-[#0B0D10]/90 hover:bg-[#F59E0B] text-[#F4F5F7] hover:text-[#0B0D10] border border-[#262C38] rounded-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="lg:col-span-6 bg-[#0B0D10] p-5 sm:p-8 flex flex-col justify-between">
          <div className="aspect-[4/3] w-full rounded-lg overflow-hidden border border-[#262C38]">
            <ResilientImage
              src={item.image}
              alt={item.imageAlt}
              fallbackTitle={item.title}
              className="w-full h-full"
            />
          </div>

          <div className="mt-4 flex items-center justify-between gap-4 text-xs text-[#9BA3B0]">
            <span className="font-mono tabular-nums">{item.sku}</span>
            <span className="tabular-nums">Kho hiện còn {item.stock} lượt giao</span>
          </div>
        </div>

        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9BA3B0]">
              <span>{item.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{item.rarityLabel}</span>
              <span aria-hidden="true">·</span>
              <span>Giao trong {item.deliveryEta}</span>
            </div>

            <h2
              id="pdp-title"
              className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F4F5F7] [text-wrap:balance]"
            >
              {item.title}
            </h2>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-mono text-2xl font-semibold tabular-nums text-[#F59E0B]">
                {formatVnd(item.priceVnd)}
              </span>
              {item.diamondRef && (
                <span className="text-xs font-mono tabular-nums text-[#9BA3B0]">
                  (Tương đương {item.diamondRef} Kim Cương)
                </span>
              )}
            </div>

            <p className="mt-4 text-sm leading-relaxed text-[#CBD0D8]">{item.description}</p>

            <dl className="mt-6 border-t border-[#262C38] divide-y divide-[#262C38] text-sm">
              <div className="py-3 grid grid-cols-3 gap-4">
                <dt className="text-[#9BA3B0]">Người bán</dt>
                <dd className="col-span-2 text-[#F4F5F7] font-medium">
                  {item.sellerName}
                </dd>
              </div>
              {item.specs.map((spec) => (
                <div key={spec.label} className="py-3 grid grid-cols-3 gap-4">
                  <dt className="text-[#9BA3B0]">{spec.label}</dt>
                  <dd className="col-span-2 text-[#F4F5F7]">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-8 pt-5 border-t border-[#262C38] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#9BA3B0]">Số lượng</span>
                <div className="h-10 px-1.5 flex items-center gap-2 bg-[#0B0D10] border border-[#262C38] rounded-md">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                    className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-[#191D26] text-[#F4F5F7] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-mono text-sm tabular-nums text-[#F4F5F7]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(item.stock, q + 1))}
                    aria-label="Tăng số lượng"
                    className="w-7 h-7 inline-flex items-center justify-center rounded hover:bg-[#191D26] text-[#F4F5F7] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <span className="font-mono text-sm tabular-nums text-[#9BA3B0]">
                Tạm tính:{' '}
                <strong className="text-[#F4F5F7]">{formatVnd(item.priceVnd * quantity)}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(item, quantity, true);
                  onClose();
                }}
                className="flex-1 min-w-[150px] py-3 px-5 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                Mua ngay
              </button>

              <button
                type="button"
                onClick={() => {
                  onAddToCart(item, quantity, false);
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-[#F4F5F7] bg-[#191D26] hover:bg-[#232833] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm vào giỏ</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleSave(item.id)}
                aria-label={isSaved ? 'Bỏ lưu vật phẩm' : 'Lưu vật phẩm'}
                className={`inline-flex items-center justify-center w-11 h-11 border rounded-md transition-colors cursor-pointer ${
                  isSaved
                    ? 'bg-[#F59E0B]/15 border-[#F59E0B] text-[#F59E0B]'
                    : 'bg-[#191D26] border-[#262C38] text-[#9BA3B0] hover:text-[#F4F5F7]'
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {onDeleteListing && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteListing(item.id);
                    onClose();
                  }}
                  aria-label="Xóa vật phẩm khỏi danh mục"
                  className="inline-flex items-center justify-center w-11 h-11 text-[#F87171] hover:bg-[#2A1619] border border-[#262C38] rounded-md transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
