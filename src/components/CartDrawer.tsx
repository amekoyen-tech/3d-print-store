import React, { useState, useMemo } from 'react';
import { useCart } from '../contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingCart, ArrowRight, CheckCircle2, AlertCircle, Loader2, Truck, User, CreditCard, Home } from 'lucide-react';
import { useOrderSubmission } from '../hooks/useOrderSubmission';
import { DeliveryMethod, PaymentMethod } from '../types';
import { formatCurrency } from '../utils';

export const CartDrawer: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [customer, setCustomer] = useState({ 
    name: '', 
    phone: '', 
    contactMethod: '', // LINE/IG/Email
    address: '', 
    notes: '' 
  });
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('in_person');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  
  const { submitOrder, isSubmitting, error, success } = useOrderSubmission();

  // Shipping Logic
  const freeShippingThreshold = 2000;
  const baseShippingFee = 100;
  const shippingFee = useMemo(() => {
    if (deliveryMethod === 'in_person') return 0;
    return totalPrice >= freeShippingThreshold ? 0 : baseShippingFee;
  }, [deliveryMethod, totalPrice]);

  const finalTotal = totalPrice + shippingFee;

  const handleClose = () => {
    setIsCartOpen(false);
    if (success) {
       setTimeout(() => {
          setStep('cart');
          setCustomer({ name: '', phone: '', contactMethod: '', address: '', notes: '' });
       }, 500);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitOrder(customer, items, totalPrice, deliveryMethod, paymentMethod, shippingFee);
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
              <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8">
              {success ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                   <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                     <CheckCircle2 size={40} className="text-green-500" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-bold mb-2 uppercase tracking-tighter">感謝您的訂購！</h3>
                     <p className="text-gray-400 text-sm">請注意手機通訊軟體，我們將主動與您聯繫。</p>
                   </div>
                   <button onClick={handleClose} className="px-8 py-4 bg-[#FF5722] text-black font-black uppercase tracking-widest rounded-xl hover:bg-[#E64A19] transition-colors">
                     關閉視窗
                   </button>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <ShoppingCart size={48} className="opacity-20" />
                  <p className="font-mono text-sm uppercase tracking-widest">您的購物車是空的</p>
                </div>
              ) : step === 'cart' ? (
                <div className="space-y-4">
                  {items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="flex gap-4 bg-[#111] p-3 rounded-xl border border-white/5 group hover:border-white/10 transition-colors">
                      <div className="w-20 h-20 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-700 font-black">NO IMAGE</div>
                        )}
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                             <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                             <button onClick={() => removeFromCart(item.productId)} className="text-gray-600 hover:text-red-500 transition-colors p-1">
                               <X size={14} />
                             </button>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-[#FF5722] font-mono text-sm font-bold">${item.price}</span>
                             {item.selectedColor && (
                               <span className="text-[9px] uppercase bg-white/5 px-2 py-0.5 rounded-full border border-white/10 text-gray-400">
                                 {item.selectedColor === 'default' ? '預設顏色' : item.selectedColor.name}
                               </span>
                             )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                           <div className="flex items-center gap-3 bg-black rounded-lg p-1 border border-white/5">
                              <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 hover:text-white text-gray-500 transition-colors">
                                <Minus size={14} />
                              </button>
                              <span className="text-xs font-mono w-4 text-center">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 hover:text-white text-gray-500 transition-colors">
                                <Plus size={14} />
                              </button>
                           </div>
                           <span className="ml-auto text-xs font-mono font-bold text-white/40">${item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8 pb-10">
                   {/* Contact Section */}
                   <section className="space-y-4">
                      <h3 className="text-xs font-black text-[#FF5722] uppercase tracking-[0.2em] flex items-center gap-2">
                         <User size={14} /> 基本資訊
                      </h3>
                      <div className="space-y-4">
                         <input 
                           required type="text" 
                           value={customer.name}
                           onChange={(e) => setCustomer({...customer, name: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-[#FF5722] outline-none transition-all placeholder:text-white/20 font-bold"
                           placeholder="姓名 / Name *"
                         />
                         <input 
                           required type="tel" 
                           value={customer.phone}
                           onChange={(e) => setCustomer({...customer, phone: e.target.value})}
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-[#FF5722] outline-none transition-all placeholder:text-white/20 font-bold font-mono"
                           placeholder="聯絡電話 / Phone *"
                         />
                         <div className="space-y-1">
                            <input 
                              required type="text" 
                              value={customer.contactMethod}
                              onChange={(e) => setCustomer({...customer, contactMethod: e.target.value})}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-[#FF5722] outline-none transition-all placeholder:text-white/20 font-bold"
                              placeholder="Email / LINE ID / IG 帳號 *"
                            />
                            <p className="text-[9px] text-[#FF5722] font-black uppercase tracking-widest ml-1 animate-pulse">
                               💡 提醒：Email 將作為日後「查詢訂單」的唯一識別鑰匙
                            </p>
                         </div>
                      </div>
                   </section>

                   {/* Delivery Section */}
                   <section className="space-y-4">
                      <h3 className="text-xs font-black text-[#FF5722] uppercase tracking-[0.2em] flex items-center gap-2">
                         <Truck size={14} /> 交貨方式
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                         {[
                           { id: 'in_person', label: '面交 (台南)', icon: <Home size={14}/> },
                           { id: 'mailing', label: '郵寄 (+運費)', icon: <Truck size={14}/> }
                         ].map(method => (
                           <button
                             key={method.id}
                             type="button"
                             onClick={() => setDeliveryMethod(method.id as DeliveryMethod)}
                             className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all gap-2 ${deliveryMethod === method.id ? 'bg-[#FF5722] text-black border-[#FF5722] font-black' : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'}`}
                           >
                              {method.icon}
                              <span className="text-xs">{method.label}</span>
                           </button>
                         ))}
                      </div>
                      {deliveryMethod === 'mailing' && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                           <input 
                             required type="text" 
                             value={customer.address}
                             onChange={(e) => setCustomer({...customer, address: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-[#FF5722] outline-none transition-all placeholder:text-white/20 font-bold"
                             placeholder="郵寄地址 (含郵遞區號) *"
                           />
                        </motion.div>
                      )}
                   </section>

                   {/* Payment Section */}
                   <section className="space-y-4">
                      <h3 className="text-xs font-black text-[#FF5722] uppercase tracking-[0.2em] flex items-center gap-2">
                         <CreditCard size={14} /> 付款方式
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                         {[
                           { id: 'bank_transfer', label: '銀行匯款' },
                           { id: 'line_pay', label: 'LINE Pay' },
                           { id: 'cash', label: '面交現金', disabled: deliveryMethod === 'mailing' }
                         ].map(method => (
                           <button
                             key={method.id}
                             type="button"
                             disabled={method.disabled}
                             onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                             className={`p-3 rounded-xl border transition-all text-[10px] uppercase font-black ${paymentMethod === method.id ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20 disabled:opacity-20 disabled:cursor-not-allowed'}`}
                           >
                              {method.label}
                           </button>
                         ))}
                      </div>
                   </section>

                   <section className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">特別需求備註</label>
                      <textarea 
                        value={customer.notes}
                        onChange={(e) => setCustomer({...customer, notes: e.target.value})}
                        rows={3}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 focus:border-[#FF5722] outline-none transition-all placeholder:text-white/20 resize-none text-sm font-bold"
                        placeholder="例如：特定的列印參數或包裝需求"
                      />
                   </section>
                </form>
              )}
            </div>

            {/* Footer */}
            {!success && items.length > 0 && (
              <div className="p-8 border-t border-white/5 bg-[#111] space-y-6">
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-gray-500 text-[10px] font-black uppercase tracking-widest">
                     <span>小計 Subtotal</span>
                     <span>${totalPrice}</span>
                   </div>
                   {deliveryMethod === 'mailing' && (
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-500">運費 Shipping</span>
                        <span className={shippingFee === 0 ? 'text-green-500' : 'text-white'}>
                           {shippingFee === 0 ? 'FREE 免運' : `$${shippingFee}`}
                        </span>
                      </div>
                   )}
                   <div className="flex justify-between items-center pt-2">
                     <span className="text-white text-xs font-black uppercase tracking-[0.2em]">應付總額 Total</span>
                     <span className="text-3xl font-mono font-black text-[#FF5722] drop-shadow-[0_0_10px_rgba(255,87,34,0.3)]">${finalTotal}</span>
                   </div>
                   {deliveryMethod === 'mailing' && totalPrice < freeShippingThreshold && (
                     <p className="text-[9px] text-gray-600 text-right font-bold italic">
                       再購滿 ${freeShippingThreshold - totalPrice} 即可享免運費
                     </p>
                   )}
                </div>

                {step === 'cart' ? (
                  <button 
                    onClick={() => setStep('checkout')}
                    className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-[#FF5722] hover:text-black transition-all flex items-center justify-center gap-3 group shadow-xl active:scale-95"
                  >
                    前往結帳資訊 <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setStep('cart')}
                      className="px-6 py-4 bg-white/5 text-gray-400 font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all border border-white/5"
                    >
                      返回
                    </button>
                    <button 
                      form="checkout-form"
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-grow py-4 bg-[#FF5722] text-black font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-[#E64A19] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(255,87,34,0.3)] active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : '確認送出訂單'}
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
