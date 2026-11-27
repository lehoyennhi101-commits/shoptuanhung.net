import { Check, Copy, Minus, Plus, Trash2, Wallet, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  BANK_TRANSFER_INFO,
  CartItem,
  formatVnd,
  OrderRecord,
} from '../data/marketplaceData';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  cartItems: CartItem[];
  walletBalance: number;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onGoToTopUp: (missingAmount: number) => void;
  onCheckoutSuccess: (
    order: OrderRecord,
    paidWithBalance: boolean,
    garenaCard?: { cardCode: string; serialNumber: string }
  ) => void;
}

export function CartDrawer({
  isOpen,
  cartItems,
  walletBalance,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onGoToTopUp,
  onCheckoutSuccess,
}: CartDrawerProps) {
  const [playerUid, setPlayerUid] = useState('');
  const [server, setServer] = useState('Việt Nam');
  const [paymentMethod, setPaymentMethod] = useState('Số dư tài khoản');
  const [garenaCardCode, setGarenaCardCode] = useState('');
  const [garenaSerial, setGarenaSerial] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, entry) => sum + entry.item.priceVnd * entry.quantity,
    0
  );
  const isUsingBalance = paymentMethod === 'Số dư tài khoản';
  const isUsingGarena = paymentMethod === 'Thẻ Garena';
  const balanceShortfall = Math.max(0, subtotal - walletBalance);

  const handleCopy = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => {
        setCopiedKey((curr) => (curr === key ? null : curr));
      }, 1500);
    } catch {
      // Ignore clipboard error
    }
  };

  const handleCheckout = (e: FormEvent) => {
    e.preventDefault();
    const cleanedUid = playerUid.trim();
    if (!/^\d{8,12}$/.test(cleanedUid)) {
      setErrorMsg('Vui lòng nhập UID Free Fire hợp lệ (gồm 8 đến 12 chữ số).');
      return;
    }
    if (cartItems.length === 0) {
      setErrorMsg('Giỏ hàng đang trống.');
      return;
    }
    if (isUsingBalance && walletBalance < subtotal) {
      setErrorMsg(
        `Số dư hiện tại (${formatVnd(walletBalance)}) chưa đủ. Hãy nạp thêm ${formatVnd(
          balanceShortfall
        )} hoặc chọn phương thức khác.`
      );
      return;
    }
    if (isUsingGarena) {
      if (garenaCardCode.trim().length < 8 || garenaSerial.trim().length < 6) {
        setErrorMsg('Vui lòng nhập đầy đủ mã Thẻ và Số seri thẻ Garena hợp lệ.');
        return;
      }
    }

    setErrorMsg('');
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const orderCode = `FF-${pad(now.getDate())}${pad(now.getMonth() + 1)}-${Math.floor(
      1000 + Math.random() * 9000
    )}`;

    const newOrder: OrderRecord = {
      orderCode,
      createdAt: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} · ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}`,
      playerUid: cleanedUid,
      server,
      paymentMethod,
      items: cartItems.map((entry) => ({
        id: entry.item.id,
        title: entry.item.title,
        quantity: entry.quantity,
        priceVnd: entry.item.priceVnd,
        deliveryMethod: entry.item.deliveryMethod,
      })),
      totalVnd: subtotal,
      status: isUsingBalance
        ? 'Đã trừ Số dư · Đang giao vật phẩm vào UID'
        : isUsingGarena
          ? 'Đang chờ Admin kiểm tra Thẻ Garena'
          : 'Đang kiểm tra chuyển khoản & chuẩn bị giao đồ',
    };

    setConfirmedOrder(newOrder);
    onCheckoutSuccess(
      newOrder,
      isUsingBalance,
      isUsingGarena
        ? {
            cardCode: garenaCardCode.trim(),
            serialNumber: garenaSerial.trim(),
          }
        : undefined
    );
    setGarenaCardCode('');
    setGarenaSerial('');
  };

  const handleCloseDrawer = () => {
    setConfirmedOrder(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-title"
      onClick={handleCloseDrawer}
    >
      <div
        className="w-full max-w-md h-full bg-[#13161C] border-l border-[#262C38] flex flex-col justify-between overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[#262C38] flex items-center justify-between gap-4">
          <div>
            <h2
              id="cart-drawer-title"
              className="font-display text-lg font-bold text-[#F4F5F7]"
            >
              {confirmedOrder ? 'Xác nhận đơn hàng' : 'Giỏ hàng & Thanh toán'}
            </h2>
            <p className="text-xs text-[#9BA3B0]">
              Số dư khả dụng:{' '}
              <span className="font-mono font-semibold text-[#F59E0B] tabular-nums">
                {formatVnd(walletBalance)}
              </span>
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Đóng giỏ hàng"
            className="w-9 h-9 inline-flex items-center justify-center rounded-md text-[#9BA3B0] hover:text-[#F4F5F7] hover:bg-[#191D26] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="p-6 flex-1 space-y-6">
            <div className="p-4 bg-[#191D26] border border-[#262C38] rounded-lg flex items-start gap-3">
              <span className="w-8 h-8 rounded-md bg-[#F59E0B] text-[#0B0D10] inline-flex items-center justify-center shrink-0">
                <Check className="w-4 h-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#F4F5F7]">
                  Đơn hàng #{confirmedOrder.orderCode} đã tạo
                </p>
                <p className="mt-1 text-xs text-[#9BA3B0] leading-relaxed">
                  Vật phẩm sẽ được gửi tới UID{' '}
                  <span className="font-mono text-[#F4F5F7]">{confirmedOrder.playerUid}</span>.
                </p>
              </div>
            </div>

            <dl className="border-t border-b border-[#262C38] divide-y divide-[#262C38] text-sm">
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-[#9BA3B0]">Mã đơn hàng</dt>
                <dd className="font-mono font-semibold text-[#F59E0B] tabular-nums">
                  {confirmedOrder.orderCode}
                </dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-[#9BA3B0]">UID nhận đồ</dt>
                <dd className="font-mono text-[#F4F5F7] tabular-nums">
                  {confirmedOrder.playerUid} ({confirmedOrder.server})
                </dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-[#9BA3B0]">Thanh toán</dt>
                <dd className="text-[#F4F5F7]">{confirmedOrder.paymentMethod}</dd>
              </div>
              <div className="py-3 flex justify-between gap-4">
                <dt className="text-[#9BA3B0]">Tổng thanh toán</dt>
                <dd className="font-mono font-semibold text-[#F4F5F7] tabular-nums">
                  {formatVnd(confirmedOrder.totalVnd)}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleCloseDrawer}
              className="w-full py-3 px-4 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer"
            >
              Đóng cửa sổ
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 flex-1 space-y-6">
              {cartItems.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <p className="text-sm font-medium text-[#F4F5F7]">Giỏ hàng chưa có vật phẩm</p>
                  <p className="text-xs text-[#9BA3B0] max-w-xs mx-auto leading-relaxed">
                    Chọn mua vật phẩm trong kho để thanh toán bằng Số dư, ZaloPay hoặc Thẻ
                    Garena.
                  </p>
                </div>
              ) : (
                <>
                  <ul className="divide-y divide-[#262C38]">
                    {cartItems.map(({ item, quantity }) => (
                      <li key={item.id} className="py-4 first:pt-0 flex gap-3.5">
                        <div className="w-20 h-16 rounded-md overflow-hidden border border-[#262C38] shrink-0">
                          <ResilientImage
                            src={item.image}
                            alt={item.imageAlt}
                            fallbackTitle={item.title}
                            className="w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-semibold text-[#F4F5F7] line-clamp-2">
                              {item.title}
                            </p>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              aria-label={`Xóa ${item.title}`}
                              className="text-[#9BA3B0] hover:text-[#F87171] p-1 cursor-pointer shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs text-[#9BA3B0]">{item.deliveryMethod}</p>

                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="inline-flex items-center gap-1.5 bg-[#0B0D10] border border-[#262C38] rounded px-1 py-0.5">
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                aria-label="Giảm"
                                className="w-6 h-6 inline-flex items-center justify-center text-[#F4F5F7] hover:bg-[#191D26] rounded cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-5 text-center font-mono text-xs tabular-nums">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                aria-label="Tăng"
                                className="w-6 h-6 inline-flex items-center justify-center text-[#F4F5F7] hover:bg-[#191D26] rounded cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <span className="font-mono text-sm font-semibold tabular-nums text-[#F59E0B]">
                              {formatVnd(item.priceVnd * quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <form
                    id="checkout-form"
                    onSubmit={handleCheckout}
                    className="space-y-4 pt-4 border-t border-[#262C38]"
                    noValidate
                  >
                    <div>
                      <label
                        htmlFor="checkout-uid"
                        className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                      >
                        UID Nhân vật Free Fire (8–12 số)
                      </label>
                      <input
                        id="checkout-uid"
                        type="text"
                        inputMode="numeric"
                        placeholder="Ví dụ: 1849203812"
                        value={playerUid}
                        onChange={(e) => setPlayerUid(e.target.value)}
                        className="w-full h-11 px-3.5 text-sm font-mono tabular-nums bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="checkout-server"
                          className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                        >
                          Máy chủ
                        </label>
                        <select
                          id="checkout-server"
                          value={server}
                          onChange={(e) => setServer(e.target.value)}
                          className="w-full h-11 px-3 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                        >
                          <option value="Việt Nam">Việt Nam</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Thái Lan">Thái Lan</option>
                        </select>
                      </div>
                      <div>
                        <label
                          htmlFor="checkout-payment"
                          className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                        >
                          Thanh toán
                        </label>
                        <select
                          id="checkout-payment"
                          value={paymentMethod}
                          onChange={(e) => {
                            setPaymentMethod(e.target.value);
                            setErrorMsg('');
                          }}
                          className="w-full h-11 px-3 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                        >
                          <option value="Số dư tài khoản">Số dư tài khoản</option>
                          <option value="Chuyển khoản ZaloPay">Chuyển khoản ZaloPay</option>
                          <option value="Thẻ Garena">Thẻ Garena</option>
                        </select>
                      </div>
                    </div>

                    {isUsingBalance && (
                      <div className="p-4 bg-[#191D26] border border-[#262C38] rounded-lg space-y-2.5 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1.5 text-[#9BA3B0]">
                            <Wallet className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span>Số dư hiện có:</span>
                          </span>
                          <span className="font-mono font-semibold tabular-nums text-[#F4F5F7]">
                            {formatVnd(walletBalance)}
                          </span>
                        </div>
                        {balanceShortfall > 0 ? (
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#262C38]">
                            <span className="text-[#F87171]">
                              Thiếu {formatVnd(balanceShortfall)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleCloseDrawer();
                                onGoToTopUp(balanceShortfall);
                              }}
                              className="font-semibold text-[#F59E0B] underline cursor-pointer"
                            >
                              Nạp thêm ngay
                            </button>
                          </div>
                        ) : (
                          <p className="text-[#34D399]">
                            Đủ số dư — trừ tự động ngay khi xác nhận đơn.
                          </p>
                        )}
                      </div>
                    )}

                    {isUsingGarena && (
                      <div className="p-4 bg-[#191D26] border border-[#262C38] rounded-lg space-y-3 text-xs">
                        <p className="font-semibold text-[#F59E0B]">
                          Nhập thông tin Thẻ Garena
                        </p>
                        <div>
                          <label
                            htmlFor="cart-garena-card"
                            className="block text-[#9BA3B0] mb-1"
                          >
                            Thẻ (Mã thẻ)
                          </label>
                          <input
                            id="cart-garena-card"
                            type="text"
                            placeholder="Nhập mã thẻ Garena..."
                            value={garenaCardCode}
                            onChange={(e) => setGarenaCardCode(e.target.value)}
                            className="w-full h-10 px-3 font-mono bg-[#0B0D10] border border-[#262C38] rounded text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="cart-garena-serial"
                            className="block text-[#9BA3B0] mb-1"
                          >
                            Số seri
                          </label>
                          <input
                            id="cart-garena-serial"
                            type="text"
                            placeholder="Nhập số seri..."
                            value={garenaSerial}
                            onChange={(e) => setGarenaSerial(e.target.value)}
                            className="w-full h-10 px-3 font-mono bg-[#0B0D10] border border-[#262C38] rounded text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                          />
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'Chuyển khoản ZaloPay' && (
                      <div className="p-4 bg-[#191D26] border border-[#262C38] rounded-lg space-y-2.5 text-xs">
                        <p className="font-semibold text-[#F59E0B]">
                          Thông tin chuyển khoản thanh toán
                        </p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#9BA3B0]">Ngân hàng:</span>
                          <span className="font-medium text-[#F4F5F7]">
                            {BANK_TRANSFER_INFO.bank}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#9BA3B0]">STK:</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy('stk', BANK_TRANSFER_INFO.accountNumber)
                            }
                            className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#F4F5F7] hover:text-[#F59E0B] cursor-pointer"
                          >
                            <span>{BANK_TRANSFER_INFO.accountNumber}</span>
                            {copiedKey === 'stk' ? (
                              <Check className="w-3.5 h-3.5 text-[#34D399]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#9BA3B0]">Tên:</span>
                          <span className="font-medium text-[#F4F5F7]">
                            {BANK_TRANSFER_INFO.accountName}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#9BA3B0]">Nội dung:</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy('note', BANK_TRANSFER_INFO.transferNote)
                            }
                            className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#34D399] hover:text-[#F59E0B] cursor-pointer"
                          >
                            <span>{BANK_TRANSFER_INFO.transferNote}</span>
                            {copiedKey === 'note' ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {errorMsg && (
                      <p role="alert" className="text-xs font-medium text-[#F87171]">
                        {errorMsg}
                      </p>
                    )}
                  </form>
                </>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-[#262C38] bg-[#0B0D10] space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#9BA3B0]">Tổng thanh toán</span>
                  <span className="font-mono text-xl font-semibold tabular-nums text-[#F4F5F7]">
                    {formatVnd(subtotal)}
                  </span>
                </div>
                <button
                  type="submit"
                  form="checkout-form"
                  className="w-full py-3.5 px-5 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer"
                >
                  {isUsingBalance
                    ? 'Thanh toán bằng Số dư'
                    : 'Xác nhận đơn & Giao vào UID'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
