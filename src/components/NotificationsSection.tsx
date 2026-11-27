import { Bell, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AnnouncementRecord,
  formatAnnouncementDate,
  formatHoursAgo,
} from '../data/marketplaceData';

interface NotificationsSectionProps {
  announcements: AnnouncementRecord[];
  isAdmin: boolean;
  onEditInAdmin: (item: AnnouncementRecord) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export function NotificationsSection({
  announcements,
  isAdmin,
  onEditInAdmin,
  onDeleteAnnouncement,
}: NotificationsSectionProps) {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const sortedAnnouncements = [...announcements].sort(
    (a, b) => b.createdAtTimestamp - a.createdAtTimestamp
  );

  return (
    <section id="thong-bao" className="py-12 lg:py-16 bg-[#0B0D10] border-t border-[#262C38]">
      <div className="max-w-[1360px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#262C38]">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-medium text-[#F59E0B]">
              <Bell className="w-3.5 h-3.5" />
              <span>Bản tin hệ thống · Phiên bản OB55</span>
            </p>
            <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F5F7] [text-wrap:balance]">
              Thông báo từ Quản trị viên
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#9BA3B0]">
            <span className="font-mono tabular-nums">
              {sortedAnnouncements.length} thông báo
            </span>
            {isAdmin ? (
              <a
                href="#admin-thong-bao"
                className="px-4 py-2 text-xs font-semibold text-[#0B0D10] bg-[#F59E0B] hover:bg-[#D97706] rounded-md transition-colors whitespace-nowrap shrink-0"
              >
                Thêm & Sửa thông báo
              </a>
            ) : (
              <a
                href="#admin"
                className="text-xs font-medium text-[#CBD0D8] hover:text-[#F59E0B] underline whitespace-nowrap shrink-0"
              >
                Quyền Admin chỉnh thông báo
              </a>
            )}
          </div>
        </div>

        {sortedAnnouncements.length === 0 ? (
          <div className="mt-8 py-12 px-6 bg-[#13161C] border border-[#262C38] rounded-xl text-center space-y-2">
            <p className="font-display text-lg font-bold text-[#F4F5F7]">
              Chưa có thông báo nào
            </p>
            <p className="text-sm text-[#9BA3B0] max-w-md mx-auto">
              Quản trị viên chưa đăng thông báo mới. Vui lòng quay lại sau hoặc đăng nhập Quyền
              Admin để tạo thông báo.
            </p>
          </div>
        ) : (
          <div className="mt-8 bg-[#13161C] border border-[#262C38] rounded-xl divide-y divide-[#262C38]">
            {sortedAnnouncements.map((item) => (
              <article
                key={item.id}
                className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
              >
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#9BA3B0]">
                    <span className="font-mono font-semibold text-[#F59E0B] tabular-nums">
                      {formatHoursAgo(item.createdAtTimestamp, nowMs)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#CBD0D8] font-medium">{item.author}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      {formatAnnouncementDate(item.createdAtTimestamp)}
                    </span>
                  </div>

                  <h3 className="font-display text-lg sm:text-xl font-bold text-[#F4F5F7]">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-[#9BA3B0] whitespace-pre-line">
                    {item.content}
                  </p>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2 shrink-0 sm:pt-1">
                    <button
                      type="button"
                      onClick={() => onEditInAdmin(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#F4F5F7] bg-[#191D26] hover:bg-[#232833] border border-[#262C38] rounded-md transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Chỉnh sửa</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteAnnouncement(item.id)}
                      aria-label={`Xóa thông báo ${item.title}`}
                      className="inline-flex items-center justify-center w-9 h-9 text-[#F87171] bg-[#191D26] hover:bg-[#2A1619] border border-[#262C38] rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
