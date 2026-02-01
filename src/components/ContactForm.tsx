import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrderSubmission } from '../hooks/useOrderSubmission';

interface ContactFormProps {
  productName: string;
  price: number;
  onClose: () => void;
}

export const ContactForm: React.FC<ContactFormProps> = ({ productName, price, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    note: ''
  });

  const { submitOrder, isSubmitting, error, success } = useOrderSubmission();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    await submitOrder({
      productName,
      price,
      ...formData
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#111] w-full max-w-lg p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden"
      >
        {/* Accent Light */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FF5722]/20 blur-[100px]" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-1">訂購確認</h2>
              <p className="text-[#FF5722] font-mono text-sm tracking-widest uppercase">{productName}</p>
            </div>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              ✕
            </button>
          </div>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-12 text-center space-y-4"
              >
                <div className="flex justify-center">
                  <CheckCircle2 size={64} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold uppercase">訂單已送出！</h3>
                <p className="text-gray-400">Ameko 會盡快與您聯繫確認細節。</p>
                <button 
                  onClick={onClose}
                  className="mt-8 px-8 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold uppercase tracking-widest transition-colors"
                >
                  關閉視窗
                </button>
              </motion.div>
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">您的姓名 / Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="例如：Alex Yen" 
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">聯繫電話 / Phone</label>
                  <input 
                    required
                    type="tel" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="例如：0912-345-678" 
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">面交地點或備註 / Note</label>
                  <textarea 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    placeholder="請輸入偏好的面交地點（限台南）或寄送資訊..." 
                    rows={3}
                    className="w-full bg-black/40 border border-white/5 rounded-xl px-5 py-4 focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] outline-none transition-all placeholder:text-white/20 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-500 text-sm">
                    <AlertCircle size={18} />
                    {error}
                  </div>
                )}

                <div className="p-4 bg-[#FF5722]/5 border border-[#FF5722]/10 rounded-2xl flex gap-4 mb-8">
                  <div className="p-2 bg-[#FF5722]/20 rounded-lg h-fit">
                    <Info size={20} className="text-[#FF5722]" />
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    送出後，Ameko 會第一時間通知 Alex。我們會透過電話或簡訊與您確認最終金額與預計交貨時間。
                  </p>
                </div>

                <button 
                  disabled={isSubmitting}
                  className="w-full py-5 bg-[#FF5722] text-white font-black uppercase tracking-[0.2em] text-sm rounded-xl hover:bg-[#FF5722]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg shadow-[#FF5722]/20"
                >
                  {isSubmitting ? '處理中...' : '確認送出訂單'} <Send size={18} />
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

