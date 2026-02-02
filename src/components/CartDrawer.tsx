import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useOrderSubmission } from '../hooks/useOrderSubmission';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [customer, setCustomer] = useState({ name: '', phone: '', notes: '' });
  const { submitOrder, isSubmitting, error, success } = useOrderSubmission();

  const handleClose = () => {
    setIsCartOpen(false);
    // Reset state after closing animation
    setTimeout(() => {
      setStep('cart');
      setCustomer({ name: '', phone: '', notes: '' });
      // clearCart is NOT called here on success, maybe we want to keep it or clear it?
      // Usually clear on success.
    }, 500);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitOrder(customer, items, totalPrice);
    if (!error) {
      clearCart();
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#111]">
              <div className="flex items-center gap-3">
                <ShoppingCart className="text-[#FF5722]" size={20} />
                <h2 className="text-xl font-black uppercase tracking-widest">
                  {success ? '訂單完成' : step === 'cart' ? '購物車' : '結帳資訊'}
                </h2>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {success ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                   <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                     <CheckCircle2 size={40} className="text-green-500" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold mb-2">感謝您的訂購！</h3>
                     <p className="text-gray-400">我們會盡快與您聯繫確認細節。</p>
                   </div>
                   <button 
                     onClick={handleClose}
                     className="px-8 py-3 bg-[#FF5722] text-black font-bold uppercase tracking-widest rounded-xl hover:bg-[#E64A19] transition-colors"
                   >
                     關閉視窗
                   </button>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p className="font-mono text-sm">您的購物車是空的</p>
                  <button 
                    onClick={handleClose}
                    className="text-[#FF5722] text-sm hover:underline uppercase tracking-widest font-bold"
                  >
                    去逛逛
                  </button>
                </div>
              ) : step === 'cart' ? (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.productId} className="flex gap-4 bg-[#111] p-3 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                      <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-700">NO IMG</div>
                        )}
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                          <p className="text-[#FF5722] font-mono text-sm font-bold">${item.price}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-black rounded-lg p-1 border border-white/5">
                             <button 
                               onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                               className="p-1 hover:text-white text-gray-500 transition-colors"
                             >
                               <Minus size={14} />
                             </button>
                             <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                             <button 
                               onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                               className="p-1 hover:text-white text-gray-500 transition-colors"
                             >
                               <Plus size={14} />
                             </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.productId)}
                            className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">姓名 / Name</label>
                      <input 
                        required
                        type="text" 
                        value={customer.name}
                        onChange={(e) => setCustomer({...customer, name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF5722] outline-none transition-all placeholder:text-white/20"
                        placeholder="您的稱呼"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">電話 / Phone</label>
                      <input 
                        required
                        type="tel" 
                        value={customer.phone}
                        onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF5722] outline-none transition-all placeholder:text-white/20"
                        placeholder="聯絡電話"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">備註 / Note</label>
                      <textarea 
                        value={customer.notes}
                        onChange={(e) => setCustomer({...customer, notes: e.target.value})}
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:border-[#FF5722] outline-none transition-all placeholder:text-white/20 resize-none"
                        placeholder="面交地點或特殊需求..."
                      />
                   </div>
                   {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex gap-2 text-red-500 text-sm items-center">
                      <AlertCircle size={16} />
                      {error}
                    </div>
                   )}
                </form>
              )}
            </div>

            {/* Footer */}
            {!success && items.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-[#111]">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-gray-400 text-sm uppercase tracking-widest">總計 Total</span>
                  <span className="text-2xl font-mono font-black text-[#FF5722]">${totalPrice}</span>
                </div>
                {step === 'cart' ? (
                  <button 
                    onClick={() => setStep('checkout')}
                    className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 group"
                  >
                    前往結帳 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setStep('cart')}
                      className="px-6 py-4 bg-[#222] text-white font-bold uppercase tracking-widest rounded-xl hover:bg-[#333] transition-colors"
                    >
                      返回
                    </button>
                    <button 
                      form="checkout-form"
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-grow py-4 bg-[#FF5722] text-black font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#E64A19] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : '確認送出'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
