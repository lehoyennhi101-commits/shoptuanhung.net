import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  Copy,
  CreditCard,
  Landmark,
  QrCode,
  Wallet,
} from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import {
  BANK_TRANSFER_INFO,
  formatVnd,
  GarenaCardRecord,
  GarenaCardStatus,
  TransferRecord,
  WalletTransaction,
} from '../data/marketplaceData';

interface TransferSectionProps {
  walletBalance: number;
  walletHistory: WalletTransaction[];
  recentTransfers: TransferRecord[];
  garenaCards: GarenaCardRecord[];
  prefillAmount?: number | null;
  onRecordTransfer: (record: TransferRecord) => void;
  onWithdrawBalance: (amount: number, targetAccount: string) => boolean;
  onSubmitGarenaCard: (card: GarenaCardRecord) => void;
}

const PRESET_AMOUNTS = [20000, 50000, 100000, 200000, 500000];
const GARENA_DENOMINATIONS = [20000, 50000, 100000, 200000, 500000];

function formatGarenaStatus(status: GarenaCardStatus): { label: string; colorClass: string } {
  if (status === 'valid') return { label: 'Thẻ đúng', colorClass: 'text-[#34D399]' };
  if (status === 'invalid') return { label: 'Thẻ sai', colorClass: 'text-[#F87171]' };
  return { label: 'Chờ Admin duyệt', colorClass: 'text-[#F59E0B]' };
}

export function TransferSection({
  walletBalance,
  walletHistory,
  recentTransfers,
  garenaCards,
  prefillAmount,
  onRecordTransfer,
  onWithdrawBalance,
  onSubmitGarenaCard,
}: TransferSectionProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [purpose, setPurpose] = useState<'topup' | 'donate'>('topup');
  const [activePanel, setActivePanel] = useState<'deposit' | 'garena' | 'withdraw'>('deposit');

  const [amount, setAmount] = useState<number>(50000);
  const [customAmount, setCustomAmount] = useState<string>('50000');
  const [senderName, setSenderName] = useState<string>('');
  const [extraNote, setExtraNote] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successReceipt, setSuccessReceipt] = useState<TransferRecord | null>(null);

  const [garenaAmount, setGarenaAmount] = useState<number>(50000);
  const [garenaCardCode, setGarenaCardCode] = useState<string>('');
  const [garenaSerial, setGarenaSerial] = useState<string>('');
  const [garenaError, setGarenaError] = useState<string>('');
  const [garenaSubmitted, setGarenaSubmitted] = useState<GarenaCardRecord | null>(null);

  const [withdrawAmount, setWithdrawAmount] = useState<string>('50000');
  const [withdrawTarget, setWithdrawTarget] = useState<string>('');
  const [withdrawFeedback, setWithdrawFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (prefillAmount && prefillAmount >= 10000) {
      setActivePanel('deposit');
      setPurpose('topup');
      setAmount(prefillAmount);
      setCustomAmount(String(prefillAmount));
    }
  }, [prefillAmount]);

  const composedContent = extraNote.trim()
    ? `${BANK_TRANSFER_INFO.transferNote} ${extraNote.trim()}`
    : BANK_TRANSFER_INFO.transferNote;

  const totalToppedUp = walletHistory
    .filter((t) => t.type === 'topup')
    .reduce((sum, t) => sum + t.amountDelta, 0);

  const totalSpent = walletHistory
    .filter((t) => t.type === 'purchase')
    .reduce((sum, t) => sum + Math.abs(t.amountDelta), 0);

  const handleCopy = async (field: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      window.setTimeout(() => {
        setCopiedField((curr) => (curr === field ? null : curr));
      }, 1600);
    } catch {
      // Ignore clipboard failures
    }
  };

  const handleCopyAll = () => {
    const fullText = [
      `Ngân hàng: ${BANK_TRANSFER_INFO.bank}`,
      `STK: ${BANK_TRANSFER_INFO.accountNumber}`,
      `Tên: ${BANK_TRANSFER_INFO.accountName}`,
      `Số tiền: ${formatVnd(amount)}`,
      `Nội dung: ${composedContent}`,
    ].join('\n');
    handleCopy('all', fullText);
  };

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount(String(val));
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    const parsed = Number(val);
    if (Number.isFinite(parsed) && parsed >= 0) {
      setAmount(parsed);
    }
  };

  const handleConfirmTransfer = (e: FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(amount) || amount < 10000) {
      setErrorMsg('Số tiền chuyển khoản tối thiểu là 10.000₫.');
      return;
    }

    setErrorMsg('');
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const record: TransferRecord = {
      id: `ZP-${pad(now.getDate())}${pad(now.getMonth() + 1)}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      createdAt: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} · ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}`,
      bank: BANK_TRANSFER_INFO.bank,
      accountNumber: BANK_TRANSFER_INFO.accountNumber,
      accountName: BANK_TRANSFER_INFO.accountName,
      amountVnd: amount,
      content: composedContent,
      senderName: senderName.trim() || (purpose === 'topup' ? 'Nạp vào Số dư' : 'Ủng hộ trực tiếp'),
      purpose,
      status:
        purpose === 'topup'
          ? 'Đã cộng vào Số dư tài khoản'
          : 'Đã ghi nhận chuyển khoản ủng hộ',
    };

    onRecordTransfer(record);
    setSuccessReceipt(record);
    setSenderName('');
    setExtraNote('');
  };

  const handleSubmitGarena = (e: FormEvent) => {
    e.preventDefault();
    const cleanCard = garenaCardCode.trim();
    const cleanSerial = garenaSerial.trim();

    if (cleanCard.length < 8) {
      setGarenaError('Vui lòng nhập mã Thẻ Garena hợp lệ (tối thiểu 8 ký tự).');
      return;
    }
    if (cleanSerial.length < 6) {
      setGarenaError('Vui lòng nhập Số seri thẻ Garena hợp lệ (tối thiểu 6 ký tự).');
      return;
    }

    setGarenaError('');
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const cardRecord: GarenaCardRecord = {
      id: `GRN-${pad(now.getDate())}${pad(now.getMonth() + 1)}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      createdAt: `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} · ${pad(
        now.getHours()
      )}:${pad(now.getMinutes())}`,
      amountVnd: garenaAmount,
      cardCode: cleanCard,
      serialNumber: cleanSerial,
      source: 'topup',
      status: 'pending',
      credited: false,
    };

    onSubmitGarenaCard(cardRecord);
    setGarenaSubmitted(cardRecord);
    setGarenaCardCode('');
    setGarenaSerial('');
  };

  const parsedWithdrawInput = Number(withdrawAmount);
  const validWithdrawAmount =
    Number.isFinite(parsedWithdrawInput) && parsedWithdrawInput > 0
      ? Math.floor(parsedWithdrawInput)
      : 0;
  const withdrawDiscountFee = Math.round(validWithdrawAmount * 0.1);
  const withdrawNetReceived = Math.max(0, validWithdrawAmount - withdrawDiscountFee);

  const handleWithdrawSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Math.floor(Number(withdrawAmount));
    if (!Number.isFinite(parsed) || parsed < 10000) {
      setWithdrawFeedback({
        type: 'error',
        text: 'Số tiền rút tối thiểu là 10.000₫.',
      });
      return;
    }
    if (parsed > walletBalance) {
      setWithdrawFeedback({
        type: 'error',
        text: 'Số dư khả dụng không đủ để thực hiện lệnh rút này.',
      });
      return;
    }
    if (!withdrawTarget.trim()) {
      setWithdrawFeedback({
        type: 'error',
        text: 'Vui lòng nhập số ZaloPay hoặc số tài khoản nhận tiền.',
      });
      return;
    }

    const ok = onWithdrawBalance(parsed, withdrawTarget.trim());
    if (ok) {
      const fee = Math.round(parsed * 0.1);
      const netReceived = parsed - fee;
      setWithdrawFeedback({
        type: 'success',
        text: `Đã tạo lệnh rút ${formatVnd(parsed)} (Chiết khấu 10%: -${formatVnd(fee)} · Thực nhận: ${formatVnd(netReceived)}) về ${withdrawTarget.trim()}.`,
      });
      setWithdrawTarget('');
    }
  };

  return (
    <section
      id="chuyen-khoan"
      className="py-16 lg:py-24 bg-[#0B0D10] border-t border-[#262C38]"
    >
      <div id="so-du" className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="text-xs font-medium text-[#F59E0B]">
              Ví giao dịch · ZaloPay & Thẻ Garena
            </p>
            <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F5F7] [text-wrap:balance]">
              03. Số dư tài khoản, Chuyển khoản & Nạp thẻ Garena
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#9BA3B0]">
              Nạp tiền vào Số dư qua chuyển khoản ZaloPay hoặc gửi mã thẻ & số seri Garena để
              Admin kiểm duyệt cộng tiền vào ví.
            </p>
          </div>
        </div>

        {/* Wallet Balance Overview Bar */}
        <div className="mt-8 bg-[#13161C] border border-[#262C38] rounded-xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#191D26] border border-[#262C38] flex items-center justify-center text-[#F59E0B] shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#9BA3B0]">Số dư khả dụng hiện tại</p>
              <p className="mt-1 font-mono text-3xl font-bold tabular-nums text-[#F59E0B]">
                {formatVnd(walletBalance)}
              </p>
            </div>
          </div>

          <div className="md:col-span-4 grid grid-cols-2 gap-4 border-t md:border-t-0 md:border-l border-[#262C38] pt-4 md:pt-0 md:pl-6">
            <div>
              <p className="text-xs text-[#9BA3B0]">Tổng đã nạp</p>
              <p className="mt-1 font-mono text-base font-semibold tabular-nums text-[#34D399]">
                +{formatVnd(totalToppedUp)}
              </p>
            </div>
            <div>
              <p className="text-xs text-[#9BA3B0]">Đã mua sắm</p>
              <p className="mt-1 font-mono text-base font-semibold tabular-nums text-[#F4F5F7]">
                {formatVnd(totalSpent)}
              </p>
            </div>
          </div>

          <div className="md:col-span-4 flex flex-wrap items-center md:justify-end gap-2">
            <button
              type="button"
              onClick={() => setActivePanel('deposit')}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activePanel === 'deposit'
                  ? 'bg-[#F59E0B] text-[#0B0D10]'
                  : 'bg-[#191D26] text-[#F4F5F7] border border-[#262C38] hover:border-[#434C5E]'
              }`}
            >
              Chuyển khoản
            </button>
            <button
              type="button"
              onClick={() => setActivePanel('garena')}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activePanel === 'garena'
                  ? 'bg-[#F59E0B] text-[#0B0D10]'
                  : 'bg-[#191D26] text-[#F4F5F7] border border-[#262C38] hover:border-[#434C5E]'
              }`}
            >
              Nạp thẻ Garena
            </button>
            <button
              type="button"
              onClick={() => setActivePanel('withdraw')}
              className={`px-3.5 py-2.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activePanel === 'withdraw'
                  ? 'bg-[#F59E0B] text-[#0B0D10]'
                  : 'bg-[#191D26] text-[#F4F5F7] border border-[#262C38] hover:border-[#434C5E]'
              }`}
            >
              Rút số dư
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Official Bank / ZaloPay Card */}
          <div className="lg:col-span-6 bg-[#13161C] border border-[#262C38] rounded-xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#262C38]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#191D26] border border-[#262C38] flex items-center justify-center text-[#F59E0B]">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#9BA3B0]">Cổng nhận chuyển khoản</p>
                  <p className="font-display text-lg font-bold text-[#F4F5F7]">
                    {BANK_TRANSFER_INFO.bank}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {copiedField === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã chép tất cả</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép toàn bộ</span>
                  </>
                )}
              </button>
            </div>

            <dl className="divide-y divide-[#262C38] text-sm">
              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <dt className="text-xs text-[#9BA3B0]">Ngân hàng / Ví</dt>
                  <dd className="mt-1 text-base font-semibold text-[#F4F5F7]">
                    {BANK_TRANSFER_INFO.bank}
                  </dd>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('bank', BANK_TRANSFER_INFO.bank)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#CBD0D8] hover:text-[#F4F5F7] bg-[#191D26] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedField === 'bank' ? (
                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedField === 'bank' ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <dt className="text-xs text-[#9BA3B0]">Số tài khoản (STK)</dt>
                  <dd className="mt-1 font-mono text-xl font-bold tracking-wider tabular-nums text-[#F59E0B]">
                    {BANK_TRANSFER_INFO.accountNumber}
                  </dd>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('stk', BANK_TRANSFER_INFO.accountNumber)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#CBD0D8] hover:text-[#F4F5F7] bg-[#191D26] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedField === 'stk' ? (
                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedField === 'stk' ? 'Đã chép' : 'Chép STK'}</span>
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <dt className="text-xs text-[#9BA3B0]">Tên chủ tài khoản</dt>
                  <dd className="mt-1 text-base font-semibold text-[#F4F5F7]">
                    {BANK_TRANSFER_INFO.accountName}
                  </dd>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('name', BANK_TRANSFER_INFO.accountName)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#CBD0D8] hover:text-[#F4F5F7] bg-[#191D26] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedField === 'name' ? (
                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedField === 'name' ? 'Đã chép' : 'Chép'}</span>
                </button>
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <dt className="text-xs text-[#9BA3B0]">Nội dung chuyển khoản</dt>
                  <dd className="mt-1 font-mono text-base font-semibold text-[#34D399]">
                    {composedContent}
                  </dd>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy('note', composedContent)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#CBD0D8] hover:text-[#F4F5F7] bg-[#191D26] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  {copiedField === 'note' ? (
                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedField === 'note' ? 'Đã chép' : 'Chép nội dung'}</span>
                </button>
              </div>
            </dl>

            <div className="p-4 bg-[#191D26] border border-[#262C38] rounded-lg flex items-center gap-4">
              <div className="w-12 h-12 rounded-md bg-[#0B0D10] border border-[#262C38] flex items-center justify-center text-[#F59E0B] shrink-0">
                <QrCode className="w-6 h-6" />
              </div>
              <div className="text-xs leading-relaxed text-[#9BA3B0]">
                Mở ứng dụng <strong className="text-[#F4F5F7]">ZaloPay</strong> hoặc ngân hàng,
                chuyển tới{' '}
                <span className="font-mono text-[#F4F5F7]">
                  {BANK_TRANSFER_INFO.accountNumber}
                </span>{' '}
                với nội dung <span className="font-mono text-[#34D399]">{composedContent}</span>.
              </div>
            </div>
          </div>

          {/* Right: Active Panel (ZaloPay Deposit / Garena Card Top-Up / Withdraw) + Ledgers */}
          <div className="lg:col-span-6 space-y-6">
            {activePanel === 'deposit' && (
              <form
                onSubmit={handleConfirmTransfer}
                className="bg-[#13161C] border border-[#262C38] rounded-xl p-6 sm:p-8 space-y-5"
                noValidate
              >
                <div>
                  <h3 className="font-display text-xl font-bold text-[#F4F5F7]">
                    Nạp số dư / Ghi nhận chuyển khoản
                  </h3>
                  <p className="mt-1 text-xs text-[#9BA3B0]">
                    Chọn mục đích chuyển khoản để cập nhật Số dư ví hoặc lưu biên lai ủng hộ.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0D10] border border-[#262C38] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPurpose('topup')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      purpose === 'topup'
                        ? 'bg-[#F59E0B] text-[#0B0D10]'
                        : 'text-[#9BA3B0] hover:text-[#F4F5F7]'
                    }`}
                  >
                    Cộng vào Số dư ví
                  </button>
                  <button
                    type="button"
                    onClick={() => setPurpose('donate')}
                    className={`py-2 px-3 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                      purpose === 'donate'
                        ? 'bg-[#F59E0B] text-[#0B0D10]'
                        : 'text-[#9BA3B0] hover:text-[#F4F5F7]'
                    }`}
                  >
                    Donate trực tiếp
                  </button>
                </div>

                <div>
                  <span className="block text-xs font-medium text-[#9BA3B0] mb-2">
                    Chọn nhanh mức tiền
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AMOUNTS.map((preset) => {
                      const active = amount === preset;
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-md border transition-colors cursor-pointer tabular-nums ${
                            active
                              ? 'bg-[#F59E0B] border-[#F59E0B] text-[#0B0D10]'
                              : 'bg-[#191D26] border-[#262C38] text-[#F4F5F7] hover:border-[#434C5E]'
                          }`}
                        >
                          {formatVnd(preset)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="transfer-amount"
                      className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                    >
                      Số tiền (VNĐ)
                    </label>
                    <input
                      id="transfer-amount"
                      type="number"
                      min={10000}
                      step={5000}
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      className="w-full h-11 px-3.5 text-sm font-mono tabular-nums bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="transfer-sender"
                      className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                    >
                      Tên / UID người gửi
                    </label>
                    <input
                      id="transfer-sender"
                      type="text"
                      placeholder="Ví dụ: Anh Hùng FF"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="transfer-extra"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Lời nhắn thêm (nối sau nội dung {BANK_TRANSFER_INFO.transferNote})
                  </label>
                  <input
                    id="transfer-extra"
                    type="text"
                    placeholder="Không bắt buộc (ví dụ: UID 1849203812)"
                    value={extraNote}
                    onChange={(e) => setExtraNote(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                {errorMsg && (
                  <p role="alert" className="text-xs font-medium text-[#F87171]">
                    {errorMsg}
                  </p>
                )}

                {successReceipt && (
                  <div className="p-4 bg-[#191D26] border border-[#262C38] rounded-lg space-y-1.5 text-xs">
                    <div className="flex items-center gap-2 text-[#34D399] font-semibold">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>
                        {successReceipt.purpose === 'topup'
                          ? `Đã cộng ${formatVnd(successReceipt.amountVnd)} vào Số dư`
                          : `Đã lưu biên lai donate #${successReceipt.id}`}
                      </span>
                    </div>
                    <p className="text-[#9BA3B0]">
                      Mã: <span className="font-mono text-[#F4F5F7]">{successReceipt.id}</span> ·
                      Nội dung: <span className="font-mono text-[#F4F5F7]">{successReceipt.content}</span>
                    </p>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-xs text-[#9BA3B0]">
                      {purpose === 'topup' ? 'Số tiền nạp vào ví' : 'Số tiền ủng hộ'}
                    </span>
                    <span className="font-mono text-xl font-bold tabular-nums text-[#F59E0B]">
                      {formatVnd(amount)}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-3 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {purpose === 'topup' ? 'Xác nhận nạp Số dư' : 'Xác nhận chuyển khoản'}
                  </button>
                </div>
              </form>
            )}

            {activePanel === 'garena' && (
              <form
                onSubmit={handleSubmitGarena}
                className="bg-[#13161C] border border-[#262C38] rounded-xl p-6 sm:p-8 space-y-5"
                noValidate
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#191D26] border border-[#262C38] flex items-center justify-center text-[#F59E0B] shrink-0">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#F4F5F7]">
                      Nạp thẻ Garena
                    </h3>
                    <p className="mt-0.5 text-xs text-[#9BA3B0]">
                      Nhập chính xác mã Thẻ và Số seri. Admin sẽ duyệt Thẻ đúng / Thẻ sai.
                    </p>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-[#9BA3B0] mb-2">
                    Mệnh giá thẻ Garena
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {GARENA_DENOMINATIONS.map((val) => {
                      const active = garenaAmount === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setGarenaAmount(val)}
                          className={`px-3.5 py-2 text-xs font-mono font-semibold rounded-md border transition-colors cursor-pointer tabular-nums ${
                            active
                              ? 'bg-[#F59E0B] border-[#F59E0B] text-[#0B0D10]'
                              : 'bg-[#191D26] border-[#262C38] text-[#F4F5F7] hover:border-[#434C5E]'
                          }`}
                        >
                          {formatVnd(val)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="garena-card-code"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Thẻ (Mã thẻ Garena)
                  </label>
                  <input
                    id="garena-card-code"
                    type="text"
                    placeholder="Nhập mã thẻ Garena..."
                    value={garenaCardCode}
                    onChange={(e) => setGarenaCardCode(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm font-mono tabular-nums bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="garena-serial-number"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Số seri
                  </label>
                  <input
                    id="garena-serial-number"
                    type="text"
                    placeholder="Nhập số seri trên thẻ..."
                    value={garenaSerial}
                    onChange={(e) => setGarenaSerial(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm font-mono tabular-nums bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                {garenaError && (
                  <p role="alert" className="text-xs font-medium text-[#F87171]">
                    {garenaError}
                  </p>
                )}

                {garenaSubmitted && (
                  <div className="p-4 bg-[#191D26] border border-[#262C38] rounded-lg space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-[#F59E0B] font-semibold">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>Đã gửi thẻ #{garenaSubmitted.id} — Đang chờ Admin kiểm tra</span>
                    </div>
                    <p className="text-[#9BA3B0] font-mono">
                      Thẻ: {garenaSubmitted.cardCode} · Số seri: {garenaSubmitted.serialNumber}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-xs text-[#9BA3B0]">Mệnh giá gửi duyệt</span>
                    <span className="font-mono text-xl font-bold tabular-nums text-[#F59E0B]">
                      {formatVnd(garenaAmount)}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-3 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Gửi nạp thẻ Garena
                  </button>
                </div>
              </form>
            )}

            {activePanel === 'withdraw' && (
              <form
                onSubmit={handleWithdrawSubmit}
                className="bg-[#13161C] border border-[#262C38] rounded-xl p-6 sm:p-8 space-y-5"
                noValidate
              >
                <div>
                  <h3 className="font-display text-xl font-bold text-[#F4F5F7]">
                    Rút tiền từ Số dư
                  </h3>
                  <p className="mt-1 text-xs text-[#9BA3B0]">
                    Số dư khả dụng:{' '}
                    <span className="font-mono text-[#F59E0B]">{formatVnd(walletBalance)}</span> ·
                    Áp dụng chiết khấu 10% mỗi lần rút
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="withdraw-amount"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Số tiền muốn rút (VNĐ)
                  </label>
                  <input
                    id="withdraw-amount"
                    type="number"
                    min={10000}
                    step={5000}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm font-mono tabular-nums bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="withdraw-target"
                    className="block text-xs font-medium text-[#9BA3B0] mb-1.5"
                  >
                    Số ZaloPay / Tài khoản nhận
                  </label>
                  <input
                    id="withdraw-target"
                    type="text"
                    placeholder="Ví dụ: ZaloPay 0345265717 - Ho Thi Nga"
                    value={withdrawTarget}
                    onChange={(e) => setWithdrawTarget(e.target.value)}
                    className="w-full h-11 px-3.5 text-sm bg-[#0B0D10] border border-[#262C38] rounded-md text-[#F4F5F7] placeholder:text-[#5B6270] focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>

                <div className="bg-[#0B0D10] border border-[#262C38] rounded-lg p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#9BA3B0]">Số tiền rút khỏi ví</span>
                    <span className="font-mono tabular-nums text-[#F4F5F7]">
                      {formatVnd(validWithdrawAmount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#9BA3B0]">Chiết khấu rút tiền (10%)</span>
                    <span className="font-mono tabular-nums text-[#F87171]">
                      -{formatVnd(withdrawDiscountFee)}
                    </span>
                  </div>
                  <div className="pt-2.5 border-t border-[#262C38] flex items-center justify-between gap-4">
                    <span className="font-medium text-[#F4F5F7]">Số tiền thực nhận (90%)</span>
                    <span className="font-mono text-sm font-bold tabular-nums text-[#34D399]">
                      {formatVnd(withdrawNetReceived)}
                    </span>
                  </div>
                </div>

                {withdrawFeedback && (
                  <p
                    role="alert"
                    className={`text-xs font-medium ${
                      withdrawFeedback.type === 'success' ? 'text-[#34D399]' : 'text-[#F87171]'
                    }`}
                  >
                    {withdrawFeedback.text}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-end">
                  <button
                    type="submit"
                    className="px-5 py-3 text-sm font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Tạo lệnh rút tiền
                  </button>
                </div>
              </form>
            )}

            {/* Garena Cards Status List */}
            {garenaCards.length > 0 && (
              <div className="bg-[#13161C] border border-[#262C38] rounded-xl p-6 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold text-[#F4F5F7]">
                    Trạng thái Thẻ Garena đã gửi
                  </p>
                  <span className="text-xs font-mono tabular-nums text-[#9BA3B0]">
                    {garenaCards.length} thẻ
                  </span>
                </div>
                <ul className="divide-y divide-[#262C38] text-xs">
                  {garenaCards.slice(0, 5).map((card) => {
                    const statusInfo = formatGarenaStatus(card.status);
                    return (
                      <li key={card.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-mono font-medium text-[#F4F5F7] truncate">
                            Thẻ: {card.cardCode} · Seri: {card.serialNumber}
                          </p>
                          <p className="mt-0.5 text-[#9BA3B0] tabular-nums">
                            {card.createdAt} · Mệnh giá {formatVnd(card.amountVnd)}
                          </p>
                        </div>
                        <span className={`font-semibold shrink-0 ${statusInfo.colorClass}`}>
                          {statusInfo.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Wallet Balance History Ledger */}
            <div className="bg-[#13161C] border border-[#262C38] rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-semibold text-[#F4F5F7]">
                  Biến động Số dư & Giao dịch gần đây
                </p>
                <span className="text-xs font-mono tabular-nums text-[#9BA3B0]">
                  {walletHistory.length} mục
                </span>
              </div>

              {walletHistory.length === 0 && recentTransfers.length === 0 ? (
                <p className="text-xs text-[#9BA3B0] py-3">
                  Chưa có giao dịch nào. Nạp tiền qua ZaloPay hoặc Thẻ Garena để bắt đầu sử dụng
                  Số dư.
                </p>
              ) : (
                <ul className="divide-y divide-[#262C38] text-xs">
                  {walletHistory.slice(0, 5).map((tx) => {
                    const isPositive = tx.amountDelta >= 0;
                    return (
                      <li key={tx.id} className="py-3 flex items-center justify-between gap-4">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span
                            className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                              isPositive
                                ? 'bg-[#34D399]/15 text-[#34D399]'
                                : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                            }`}
                          >
                            {isPositive ? (
                              <ArrowDownLeft className="w-3.5 h-3.5" />
                            ) : (
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <p className="font-medium text-[#F4F5F7] truncate">{tx.label}</p>
                            <p className="mt-0.5 text-[#9BA3B0] tabular-nums">
                              {tx.createdAt} · Số dư sau: {formatVnd(tx.balanceAfter)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-mono font-semibold tabular-nums shrink-0 ${
                            isPositive ? 'text-[#34D399]' : 'text-[#F4F5F7]'
                          }`}
                        >
                          {isPositive
                            ? `+${formatVnd(tx.amountDelta)}`
                            : `-${formatVnd(Math.abs(tx.amountDelta))}`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
