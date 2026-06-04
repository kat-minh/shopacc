import { ShieldCheck, HelpCircle, Gamepad2, Info, Facebook, MessageCircle, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1a0202] border-t-4 border-amber-600/60 mt-20 text-stone-300 pb-12 pt-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* About column */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-amber-400 text-red-950 px-2.5 py-1 rounded-lg font-black text-sm">
              HN
            </div>
            <h4 className="text-lg font-black text-amber-400 uppercase tracking-widest">
              HAINAGAMING.COM
            </h4>
          </div>
          <p className="text-xs text-stone-400 leading-relaxed">
            Hệ thống phân phối nick game, acc Reroll, VIP Dragon Ball Legends hàng đầu Việt Nam. Tự động giao dịch bảo mật, cấp tốc 24/7. Hỗ trợ khôi phục, bảo hành trọn đời mọi đơn hàng.
          </p>
          <div className="flex items-center gap-2 bg-[#2d0505] p-2.5 rounded-lg border border-amber-500/10">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-[11px]">
              <p className="font-bold text-stone-200">Cam Kết Bảo Mật 100%</p>
              <p className="text-stone-400">Khóa giao dịch, thu hồi đền 200%</p>
            </div>
          </div>
        </div>

        {/* Categories / Games column */}
        <div>
          <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            SẢN PHẨM KHU VỰC
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li>
              <a href="#cua-hang" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                🎮 Acc Reroll Android/iOS giá rẻ
              </a>
            </li>
            <li>
              <a href="#cua-hang" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                💎 Acc Hũ Siêu Khủng Chrono Crystals
              </a>
            </li>
            <li>
              <a href="#cua-hang" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                🔥 Acc VIP Rank PvP Đấu Giải Cao Thủ
              </a>
            </li>
            <li>
              <a href="#quay-thu" className="hover:text-amber-300 transition-colors flex items-center gap-1">
                🎡 Vòng xoay may mắn nhận Ultra Gogeta
              </a>
            </li>
          </ul>
        </div>

        {/* Contact info support details */}
        <div>
          <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider mb-4 border-l-2 border-amber-500 pl-2">
            HỖ TRỢ KHÁCH HÀNG
          </h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Hotline 24/7: <strong className="text-amber-400">0399.XXX.XXX</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Zalo Admin: <strong className="text-amber-400">0399.XXX.XXX</strong></span>
            </li>
            <li className="flex items-center gap-2">
              <Facebook className="w-4 h-4 text-blue-500 shrink-0" />
              <span>Fanpage: <a href="#" className="underline hover:text-white">Hải Na Gaming Shop</a></span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-400">⏱</span>
              <span>Thời gian hoạt động: <strong className="text-stone-200">Sáng 07:00 - Khuya 23:30</strong></span>
            </li>
          </ul>
        </div>

        {/* Guidelines Terms Column */}
        <div className="space-y-3 text-xs">
          <h4 className="text-sm font-black text-amber-400 uppercase tracking-wider border-l-2 border-amber-500 pl-2">
            CHÍNH SÁCH BÁN HÀNG
          </h4>
          <p className="text-stone-400 text-xs leading-relaxed">
            Mọi thông tin chuyển khoản qua Ngân hàng hoặc Ví MoMo, quý khách vui lòng nhập đúng nội dung chuyển khoản được in trên hệ thống để được cộng tệ tự động ngay lập tức.
          </p>
          <div className="bg-red-950/40 p-2 rounded-lg border border-red-800/20 text-[10px] text-justify text-stone-500 leading-normal">
            Co-branding và vận hành bởi <span className="text-stone-300 font-semibold">hainagaming.com</span>. Bản quyền thuộc về Hải Na Gaming 2026.
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-amber-950/80 text-center text-xs text-stone-500">
        <p>© 2026 hainagaming.com All rights reserved - Hệ Thống Vận Hành Tự Động Toàn Diện.</p>
        <p className="mt-1 text-stone-600 font-mono">Powered by Google AI Studio React Framework with Antigravity VM Engine.</p>
      </div>
    </footer>
  );
}
