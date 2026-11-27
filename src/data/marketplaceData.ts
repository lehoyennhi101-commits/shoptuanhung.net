export type ItemCategory =
  | 'all'
  | 'gun-skin'
  | 'outfit'
  | 'utility'
  | 'supply'
  | 'saved';

export type DeliveryMethod = 'Tặng quà Hộp thư' | 'Mã Giftcode Garena' | 'Nạp trực tiếp UID';

export interface MarketplaceItem {
  id: string;
  sku: string;
  category: Exclude<ItemCategory, 'all' | 'saved'>;
  categoryLabel: string;
  rarityLabel: string;
  title: string;
  priceVnd: number;
  diamondRef?: number;
  sellerName: string;
  sellerUid: string;
  deliveryMethod: DeliveryMethod;
  deliveryEta: string;
  stock: number;
  description: string;
  specs: {
    label: string;
    value: string;
  }[];
  image: string;
  imageAlt: string;
  isCommunityListing?: boolean;
}

export interface CartItem {
  item: MarketplaceItem;
  quantity: number;
}

export interface OrderRecord {
  orderCode: string;
  createdAt: string;
  playerUid: string;
  server: string;
  paymentMethod: string;
  items: {
    id: string;
    title: string;
    quantity: number;
    priceVnd: number;
    deliveryMethod: DeliveryMethod;
  }[];
  totalVnd: number;
  status: string;
}

export interface TransferRecord {
  id: string;
  createdAt: string;
  bank: string;
  accountNumber: string;
  accountName: string;
  amountVnd: number;
  content: string;
  senderName: string;
  purpose: 'topup' | 'donate';
  status: string;
}

export interface WalletTransaction {
  id: string;
  createdAt: string;
  type: 'topup' | 'purchase' | 'withdraw';
  label: string;
  amountDelta: number;
  balanceAfter: number;
}

export type GarenaCardStatus = 'pending' | 'valid' | 'invalid';

export interface GarenaCardRecord {
  id: string;
  createdAt: string;
  amountVnd: number;
  cardCode: string;
  serialNumber: string;
  source: 'topup' | 'checkout';
  orderCode?: string;
  status: GarenaCardStatus;
  credited: boolean;
}

export const BANK_TRANSFER_INFO = {
  bank: 'Zalopay',
  accountNumber: '0345265717',
  accountName: 'Ho Thi Nga',
  transferNote: 'donateanhhung',
};

export const HERO_BANNER = {
  image: '/src/assets/images/ff_hero_arsenal_1795785167473.jpg',
  alt: 'Kho vũ khí chiến thuật Free Fire gồm súng trường khắc vàng, mũ giáp carbon và hòm tiếp tế',
};

export const CATEGORY_IMAGES: Record<
  Exclude<ItemCategory, 'all' | 'saved'>,
  { src: string; label: string }
> = {
  'gun-skin': {
    src: '/src/assets/images/ff_item_gun_skin_1795785167768.jpg',
    label: 'Mẫu ảnh Skin Súng',
  },
  outfit: {
    src: '/src/assets/images/ff_item_bundle_outfit_1795785167969.jpg',
    label: 'Mẫu ảnh Trang Phục',
  },
  utility: {
    src: '/src/assets/images/ff_item_gloo_wall_pet_1795785168875.jpg',
    label: 'Mẫu ảnh Bom Keo & Pet',
  },
  supply: {
    src: '/src/assets/images/ff_item_diamonds_crate_1795785169061.jpg',
    label: 'Mẫu ảnh Kim Cương & Hòm',
  },
};

export interface AnnouncementRecord {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAtTimestamp: number;
}

export const INITIAL_ANNOUNCEMENTS: AnnouncementRecord[] = [
  {
    id: 'ann-ob55-launch',
    title: 'Cập nhật cửa hàng phiên bản Free Fire OB55',
    content:
      'Hệ thống Shop Tuấn Hưng đã đồng bộ dữ liệu vật phẩm, skin súng và gói tiếp tế tương thích hoàn toàn với phiên bản OB55. Mọi vật phẩm mới đều do Admin kiểm duyệt trước khi mở bán.',
    author: 'TuanHungAdmin36',
    createdAtTimestamp: Date.now() - 2 * 3600000,
  },
  {
    id: 'ann-withdraw-fee',
    title: 'Quy định rút số dư & nạp Thẻ Garena mới nhất',
    content:
      'Mỗi lệnh rút số dư về ZaloPay áp dụng mức chiết khấu 10% (thực nhận 90% giá trị lệnh rút). Khi nạp Thẻ Garena vui lòng nhập đầy đủ Mã thẻ và Số seri để Admin duyệt cộng tiền nhanh chóng.',
    author: 'TuanHungAdmin36',
    createdAtTimestamp: Date.now() - 6 * 3600000,
  },
];

// Danh mục khởi tạo rỗng theo yêu cầu người dùng
export const INITIAL_ITEMS: MarketplaceItem[] = [];

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + '₫';
}

export function formatHoursAgo(createdAtTimestamp: number, nowMs: number = Date.now()): string {
  const diffHours = Math.max(0, Math.floor((nowMs - createdAtTimestamp) / 3600000));
  return `${diffHours} giờ trước`;
}

export function formatAnnouncementDate(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} · ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export interface ViewerAccount {
  id: string; // Định dạng STH-{số id}
  username: string;
  gmail: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
}

export function generateUniqueAccountId(existingAccounts: ViewerAccount[]): string {
  const existingIds = new Set(existingAccounts.map((acc) => acc.id));
  let candidate = '';
  do {
    const num = Math.floor(100000 + Math.random() * 900000);
    candidate = `STH-${num}`;
  } while (existingIds.has(candidate));
  return candidate;
}

export function hashAccountPassword(password: string, salt: string): string {
  const input = `${salt}::${password}::sth_profile_v1`;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `${(h2 >>> 0).toString(16).padStart(8, '0')}${(h1 >>> 0).toString(16).padStart(8, '0')}`;
}

