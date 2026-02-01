import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

interface ContactFormProps {
  productName: string;
  onClose: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ productName, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <div className="bg-dark-carbon w-full max-w-lg p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Accent Light */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-heat/20 blur-[100px]" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">訂購確認</h2>
              <p className="text-heat font-mono text-sm tracking-widest uppercase">{productName}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">您的姓名 / Name</label>
              <input 
                type="text" 
                placeholder="例如：Alex Yen" 
                className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 focus:border-heat focus:ring-1 focus:ring-heat outline-none transition-all placeholder:text-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">聯繫電話 / Phone</label>
              <input 
                type="tel" 
                placeholder="例如：0912-345-678" 
                className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 focus:border-heat focus:ring-1 focus:ring-heat outline-none transition-all placeholder:text-white/20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">面交地點或備註 / Note</label>
              <textarea 
                placeholder="請輸入偏好的面交地點（限台南）或寄送資訊..." 
                rows={3}
                className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 focus:border-heat focus:ring-1 focus:ring-heat outline-none transition-all placeholder:text-white/20 resize-none"
              />
            </div>

            <div className="p-4 bg-heat/5 border border-heat/10 rounded-2xl flex gap-4 mb-8">
              <div className="p-2 bg-heat/20 rounded-lg h-fit"><Info size={20} className="text-heat" /></div>
              <p className="text-xs text-white/60 leading-relaxed">
                送出後，Ameko 會第一時間通知 Alex。我們會透過電話或簡訊與您確認最終金額與預計交貨時間。
              </p>
            </div>

            <button className="w-full py-5 bg-heat text-white font-black uppercase tracking-[0.2em] text-sm rounded-xl hover:bg-heat/80 transition-all flex items-center justify-center gap-3 shadow-lg shadow-heat/20">
              確認送出訂單 <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Info = ({ size, className }: { size: number, className: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
  </svg>
);
