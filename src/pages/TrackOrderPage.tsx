import React, { useState } from 'react';
import { useOrders } from '../hooks/useOrders';
import { Order, OrderStatus } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Package, Clock, CheckCircle2, AlertCircle, Printer, Hammer, Truck, MessageCircle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import OrderMessageBox from '../components/OrderMessageBox';
import OrderModificationForm from '../components/OrderModificationForm';

const statusSteps: { id: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { id: 'pending', label: '待處理', icon: <Clock size={16} /> },
  { id: 'accepted', label: '已接單', icon: <CheckCircle2 size={16} /> },
  { id: 'printing', label: '列印中', icon: <Printer size={16} /> },
  { id: 'post_processing', label: '後處理', icon: <Hammer size={16} /> },
  { id: 'completed', label: '已完成', icon: <Package size={16} /> },
];

const TrackOrderPage: React.FC = () => {
  const { orders, loading } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [searched, setSearched] = useState(false);
  const [foundOrders, setFoundOrders] = useState<Order[]>([]);
  const [expandedMessages, setExpandedMessages] = useState<{ [key: string]: boolean }>({});
  const [expandedModRequests, setExpandedModRequests] = useState<{ [key: string]: boolean }>({});
  const [showModForm, setShowModForm] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    const term = searchTerm.toLowerCase().trim();
    const results = orders.filter(order => {
      const phone = order.customer?.phone?.toLowerCase() || '';
      const contact = order.customer?.contactMethod?.toLowerCase() || '';
      return phone.includes(term) || contact.includes(term);
    });

    setFoundOrders(results);
    setSearched(true);
  };

  const getStepStatus = (currentStatus: OrderStatus, stepId: OrderStatus) => {
    const stepOrder = ['pending', 'accepted', 'printing', 'post_processing', 'completed'];
    const currentIndex = stepOrder.indexOf(currentStatus);
    const stepIndex = stepOrder.indexOf(stepId);

    if (currentStatus === 'rejected' || currentStatus === 'cancelled') return 'error';
    if (currentIndex === -1) return 'waiting'; 
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'waiting';
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF5722] selection:text-black pb-20">
      {/* Background Decor */}
      <div className="fixed inset-0 industrial-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 industrial-grid-dots opacity-30 pointer-events-none" />
      
      <header className="border-b border-white/10 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
           <Link to="/" className="text-xl font-black tracking-tighter flex items-center gap-2">
             D*3<span className="text-[#FF5722]">.</span>TRACKER
           </Link>
           <Link to="/" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
             回首頁 (Home)
           </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">
            訂單追蹤 <span className="text-[#FF5722]">.</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-lg mx-auto">
            輸入您的電話號碼或聯絡方式 (Email/ID) 以查詢訂單進度。
          </p>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-16">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="請輸入電話或 Email / ID..."
            className="w-full bg-[#111] border border-white/10 rounded-2xl py-5 pl-6 pr-16 text-lg font-bold placeholder:text-gray-700 focus:border-[#FF5722] outline-none transition-all shadow-2xl shadow-black/50"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 aspect-square bg-[#FF5722] text-black rounded-xl flex items-center justify-center hover:bg-[#E64A19] transition-colors"
          >
            <Search size={24} />
          </button>
        </form>

        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4 text-[#FF5722]">
            <Loader2 className="animate-spin" size={40} />
            <span className="font-mono uppercase tracking-widest text-xs">Loading System Data...</span>
          </div>
        ) : searched ? (
          <div className="space-y-8">
            {foundOrders.length > 0 ? (
              foundOrders.map(order => (
                <motion.div 
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden"
                >
                  <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div>
                        <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">Order ID</p>
                        <p className="font-mono text-white/50 text-xs">{order.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">下單日期</p>
                        <p className="font-mono font-bold">
                           {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : new Date().toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(order.status === 'rejected' || order.status === 'cancelled') ? (
                       <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-500 space-y-2">
                          <AlertCircle className="mx-auto mb-2" size={32} />
                          <h3 className="font-bold text-lg">
                             訂單{order.status === 'rejected' ? '已拒絕' : '已取消'}
                          </h3>
                          <p className="text-xs opacity-70">
                             {order.rejectionReason || '如有疑問請聯繫客服'}
                          </p>
                       </div>
                    ) : (
                       <div className="relative pt-4 pb-8">
                          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/5 -translate-y-1/2 rounded-full" />
                          <div className="relative flex justify-between">
                             {statusSteps.map((step, idx) => {
                                const status = getStepStatus(order.status, step.id);
                                const isCompleted = status === 'completed';
                                const isCurrent = status === 'current';
                                
                                return (
                                   <div key={step.id} className="flex flex-col items-center relative z-10 group">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isCompleted ? 'bg-[#FF5722] border-[#FF5722] text-black scale-100' : isCurrent ? 'bg-[#050505] border-[#FF5722] text-[#FF5722] scale-125 shadow-[0_0_20px_rgba(255,87,34,0.4)]' : 'bg-[#050505] border-[#222] text-gray-700'}`}>
                                         {step.icon}
                                      </div>
                                      <span className={`absolute top-14 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-colors duration-300 ${isCompleted || isCurrent ? 'text-white' : 'text-gray-700'}`}>
                                         {step.label}
                                      </span>
                                   </div>
                                );
                             })}
                          </div>
                       </div>
                    )}
                  </div>

                  {/* Items */}
                  <div className="p-6 md:p-8 space-y-4">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">訂購項目 (Items)</h3>
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-4 bg-[#080808] p-4 rounded-2xl border border-white/5 items-center">
                         <div className="w-16 h-16 bg-[#1a1a1a] rounded-xl flex-shrink-0 overflow-hidden border border-white/5">
                            {item.image && <img src={item.image} alt="" className="w-full h-full object-cover" />}
                         </div>
                         <div className="flex-grow">
                            <h4 className="font-bold text-sm">{item.name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                               <span className="text-xs text-gray-500">Qty: {item.quantity}</span>
                               {item.selectedColor && item.selectedColor !== 'default' && (
                                  <span className="text-[9px] bg-white/5 px-2 py-0.5 rounded border border-white/10 text-gray-400">
                                     {item.selectedColor.name}
                                  </span>
                               )}
                            </div>
                         </div>
                         <div className="text-right">
                            {/* Per Item Status */}
                            <span className={`inline-block px-3 py-1 rounded text-xs font-black uppercase tracking-widest border ${item.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : item.status === 'printing' ? 'bg-[#FF5722]/10 text-[#FF5722] border-[#FF5722]/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                               {item.status === 'completed' ? '已完成' : item.status === 'printing' ? '製作中' : '排程中'}
                            </span>
                         </div>
                      </div>
                    ))}
                  </div>

                  {order.estimatedCompletionDate && (order.status === 'accepted' || order.status === 'printing' || order.status === 'post_processing') && (
                     <div className="bg-[#FF5722]/5 p-4 text-center border-t border-[#FF5722]/20">
                        <p className="text-[#FF5722] text-xs font-bold uppercase tracking-widest">
                           預計完成日期: {order.estimatedCompletionDate}
                        </p>
                     </div>
                  )}

                  {/* 留言和修改請求區域 */}
                  <div className="border-t border-white/5 bg-white/[0.02]">
                    {/* 留言區塊 */}
                    <div className="p-6 md:p-8 border-b border-white/5">
                      <button
                        onClick={() => setExpandedMessages({ ...expandedMessages, [order.id]: !expandedMessages[order.id] })}
                        className="w-full flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <MessageCircle size={20} className="text-[#FF5722]" />
                          <h3 className="text-sm font-black uppercase tracking-widest">
                            訂單留言 (Messages)
                          </h3>
                          {order.hasUnreadReplies && (
                            <span className="px-2 py-0.5 bg-[#FF5722] text-black text-xs font-black rounded-full animate-pulse">
                              有新回覆
                            </span>
                          )}
                          {order.messages && order.messages.length > 0 && (
                            <span className="text-xs text-gray-500">
                              ({order.messages.length})
                            </span>
                          )}
                        </div>
                        <div className={`transition-transform ${expandedMessages[order.id] ? 'rotate-180' : ''}`}>
                          ▼
                        </div>
                      </button>

                      <AnimatePresence>
                        {expandedMessages[order.id] && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 overflow-hidden"
                          >
                            <OrderMessageBox
                              orderId={order.id}
                              customerName={order.customer.name}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* 修改請求區塊 */}
                    <div className="p-6 md:p-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Settings size={20} className="text-[#2196F3]" />
                          <h3 className="text-sm font-black uppercase tracking-widest">
                            修改請求 (Modifications)
                          </h3>
                        </div>
                        {order.status !== 'completed' && order.status !== 'rejected' && order.status !== 'cancelled' && (
                          <button
                            onClick={() => setShowModForm(order.id)}
                            className="px-4 py-2 bg-[#2196F3] hover:bg-[#1976D2] text-white text-xs font-bold rounded-lg transition-colors uppercase tracking-widest"
                          >
                            申請修改
                          </button>
                        )}
                      </div>

                      {/* 修改請求列表 */}
                      {order.modificationRequests && order.modificationRequests.length > 0 ? (
                        <div className="space-y-3">
                          {order.modificationRequests.map((req) => (
                            <div
                              key={req.id}
                              className={`p-4 rounded-xl border-2 ${
                                req.status === 'pending'
                                  ? 'border-[#FF9800] bg-[#FF9800]/5'
                                  : req.status === 'approved'
                                  ? 'border-green-500 bg-green-500/5'
                                  : 'border-red-500 bg-red-500/5'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-gray-400 uppercase">
                                  {req.requestType === 'change_color' && '變更顏色'}
                                  {req.requestType === 'change_quantity' && '調整數量'}
                                  {req.requestType === 'change_address' && '修改地址'}
                                  {req.requestType === 'other' && '其他'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                                  req.status === 'pending'
                                    ? 'bg-[#FF9800] text-black'
                                    : req.status === 'approved'
                                    ? 'bg-green-500 text-black'
                                    : 'bg-red-500 text-white'
                                }`}>
                                  {req.status === 'pending' && '待處理'}
                                  {req.status === 'approved' && '已批准'}
                                  {req.status === 'rejected' && '已拒絕'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-300 mb-2">{req.description}</p>
                              {req.adminResponse && (
                                <div className="mt-3 pt-3 border-t border-white/10">
                                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">商家回應:</p>
                                  <p className="text-xs text-gray-400">{req.adminResponse}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-600 text-center py-4">尚無修改請求</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20 border border-white/5 rounded-3xl bg-white/5">
                <Package className="mx-auto mb-4 text-gray-700" size={48} />
                <p className="text-gray-500 font-mono text-sm">找不到相關訂單 (No Orders Found)</p>
              </div>
            )}
          </div>
        ) : (
           <div className="text-center py-20 opacity-30">
              <Search className="mx-auto mb-4" size={48} />
              <p className="font-mono text-sm uppercase tracking-widest">請輸入資料開始查詢</p>
           </div>
        )}
      </main>

      {/* 修改請求表單模態框 */}
      <AnimatePresence>
        {showModForm && (
          <OrderModificationForm
            orderId={showModForm}
            onClose={() => setShowModForm(null)}
            onSuccess={() => {
              // 可以在這裡添加成功提示
              console.log('修改請求已提交');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TrackOrderPage;