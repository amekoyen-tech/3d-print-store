import React, { useState } from 'react';
import { Order, OrderStatus, DeliveryMethod, PaymentMethod } from '../types';
import { useOrders } from '../hooks/useOrders';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Calendar, ChevronDown, ChevronUp, Trash2, User, Truck, CreditCard } from 'lucide-react';

const statusColors: Record<OrderStatus, string> = {
  pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  accepted: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  printing: 'text-[#FF5722] bg-[#FF5722]/10 border-[#FF5722]/20',
  post_processing: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  rejected: 'text-red-500 bg-red-500/10 border-red-500/20',
  completed: 'text-green-500 bg-green-500/10 border-green-500/20',
  cancelled: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: '待處理 (Pending)',
  accepted: '已接單 (Accepted)',
  printing: '列印中 (Printing)',
  post_processing: '後處理 (Post-Processing)',
  rejected: '已拒絕 (Rejected)',
  completed: '已完成 (Completed)',
  cancelled: '已取消 (Cancelled)',
};

const deliveryLabels: Record<DeliveryMethod, string> = {
  in_person: '面交 (In Person)',
  mailing: '郵寄 (Mailing)'
};

const paymentLabels: Record<PaymentMethod, string> = {
  bank_transfer: '銀行匯款',
  line_pay: 'LINE Pay',
  cash: '現金'
};

export default function AdminOrderList() {
  const { orders, updateOrderStatus, deleteOrder, calculateEstimatedCompletion } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-widest mb-8 flex items-center gap-3">
        訂單管理 <span className="text-xs bg-[#FF5722] text-black px-2 py-1 rounded font-bold">{orders.length}</span>
      </h2>
      
      <div className="grid gap-6">
        {orders.map(order => (
          <OrderCard 
            key={order.id} 
            order={order} 
            expanded={selectedOrder === order.id}
            onToggle={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
            onUpdateStatus={updateOrderStatus}
            onDelete={deleteOrder}
            calculateEstimation={calculateEstimatedCompletion}
          />
        ))}
        {orders.length === 0 && (
           <div className="text-center py-20 text-gray-500 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm font-mono uppercase tracking-widest">
              目前沒有訂單 (NO ORDERS)
           </div>
        )}
      </div>
    </div>
  );
}

const OrderCard: React.FC<{
  order: Order;
  expanded: boolean;
  onToggle: () => void;
  onUpdateStatus: (id: string, status: OrderStatus, extra?: any) => void;
  onDelete: (id: string) => void;
  calculateEstimation: () => Promise<Date>;
}> = ({ order, expanded, onToggle, onUpdateStatus, onDelete, calculateEstimation }) => {
  const [actionNote, setActionNote] = useState('');
  const [estDate, setEstDate] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  
  const dateStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 
                 (order.createdAt instanceof Date ? order.createdAt.toLocaleString() : 'Unknown Date');

  // Auto-fill when expanded if pending
  React.useEffect(() => {
    if (expanded && order.status === 'pending' && !estDate) {
      setIsCalculating(true);
      calculateEstimation().then(date => {
        // Format to YYYY-MM-DD
        const iso = date.toISOString().split('T')[0];
        setEstDate(iso);
        setIsCalculating(false);
      });
    }
  }, [expanded, order.status]);

  const handleAccept = () => {
    onUpdateStatus(order.id, 'accepted', { estimatedCompletionDate: estDate, adminNotes: actionNote });
  };
  
  const handleReject = () => {
    onUpdateStatus(order.id, 'rejected', { adminNotes: actionNote });
  };

  const handleComplete = () => {
    onUpdateStatus(order.id, 'completed', { adminNotes: actionNote });
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('確定刪除此訂單？此動作無法復原。')) {
      try {
        await onDelete(order.id);
      } catch (err: any) {
        console.error('Delete error:', err);
        alert('刪除失敗: ' + (err.message || '未知錯誤'));
      }
    }
  };

  const currentStatus = order.status || 'pending';

  return (
    <motion.div 
      layout
      className={`bg-[#111] border rounded-2xl overflow-hidden transition-all ${expanded ? 'border-[#FF5722]/50 shadow-[0_0_30px_rgba(255,87,34,0.1)]' : 'border-white/5 hover:border-white/10'}`}
    >
      <div 
        onClick={onToggle}
        className="p-6 cursor-pointer flex items-center justify-between gap-6"
      >
        <div className="flex items-center gap-6">
           <div className={`w-3 h-3 rounded-full ${currentStatus === 'pending' ? 'bg-yellow-500 animate-pulse' : currentStatus === 'completed' ? 'bg-green-500' : 'bg-gray-500'}`} />
           <div>
              <h3 className="font-bold text-lg">{order.customer?.name || '無姓名 (No Name)'}</h3>
              <p className="text-xs text-gray-500 font-mono">{dateStr}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${statusColors[currentStatus] || statusColors.pending}`}>
              {statusLabels[currentStatus] || statusLabels.pending}
           </div>
           <div className="text-right">
              <p className="text-sm text-gray-400 font-mono">{(order.items || []).length} Items</p>
              <p className="text-lg font-bold text-[#FF5722] font-mono">${order.totalPrice + (order.shippingFee || 0)}</p>
           </div>
           {expanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-black/20"
          >
            <div className="p-8 grid lg:grid-cols-2 gap-8">
               {/* Order Details */}
               <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <User size={14} className="text-[#FF5722]" /> 客戶與物流 (Logistics)
                    </h4>
                    <div className="bg-[#050505] p-5 rounded-2xl border border-white/5 space-y-4 font-mono text-sm">
                       <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Name</p>
                            <p className="text-white font-bold">{order.customer?.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Phone</p>
                            <p className="text-white font-bold">{order.customer?.phone || '-'}</p>
                          </div>
                       </div>
                       
                       <div className="border-b border-white/5 pb-4">
                          <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Contact (LINE/IG/Email)</p>
                          <p className="text-white font-bold">{order.customer?.contactMethod || '-'}</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Method</p>
                            <p className="text-blue-400 font-bold">{deliveryLabels[order.deliveryMethod] || order.deliveryMethod}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Payment</p>
                            <p className="text-yellow-400 font-bold">{paymentLabels[order.paymentMethod] || order.paymentMethod}</p>
                          </div>
                       </div>

                       {order.deliveryMethod === 'mailing' && (
                         <div className="border-b border-white/5 pb-4">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Address</p>
                            <p className="text-white text-xs">{order.customer?.address || '未提供地址'}</p>
                         </div>
                       )}

                       <div>
                          <p className="text-[10px] text-gray-500 uppercase font-black mb-1">Note</p>
                          <p className="text-gray-400 italic text-xs leading-relaxed">{order.customer?.notes || '-'}</p>
                       </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Truck size={14} className="text-[#FF5722]" /> 訂購明細 (Items)
                    </h4>
                    <div className="space-y-3">
                       {(order.items || []).map((item, i) => (
                         <div key={i} className="flex gap-4 bg-[#050505] p-3 rounded-xl border border-white/5 items-center">
                            <div className="w-12 h-12 bg-[#222] rounded flex-shrink-0 overflow-hidden border border-white/5">
                               {item.image && <img src={item.image} className="w-full h-full object-cover" alt="" />}
                            </div>
                            <div className="flex-grow">
                               <p className="font-bold text-sm text-white">{item.name}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] text-gray-500 font-mono">${item.price} x {item.quantity}</span>
                                  {item.selectedColor && (
                                    <span className="text-[8px] px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-white/40 uppercase">
                                      {item.selectedColor === 'default' ? '預設' : item.selectedColor.name}
                                    </span>
                                  )}
                               </div>
                            </div>
                            <p className="font-mono font-bold text-white">${item.price * item.quantity}</p>
                         </div>
                       ))}
                       <div className="pt-4 flex justify-between items-center border-t border-white/10 px-2 mt-2">
                          <span className="text-[10px] text-gray-500 uppercase font-black">運費 Shipping</span>
                          <span className="font-mono font-bold text-white">${order.shippingFee || 0}</span>
                       </div>
                    </div>
                  </div>
               </div>

               {/* Actions */}
               <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <CreditCard size={14} className="text-[#FF5722]" /> 管理操作 (Actions)
                    </h4>
                    
                    {currentStatus === 'pending' && (
                      <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400">預計完成日 (Est. Date)</label>
                            <input 
                              type="date" 
                              value={estDate}
                              onChange={e => setEstDate(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FF5722] outline-none text-white"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400">管理員備註 (Admin Note)</label>
                            <textarea 
                              value={actionNote}
                              onChange={e => setActionNote(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FF5722] outline-none text-white placeholder:text-gray-700"
                              placeholder="給客戶的訊息..."
                              rows={2}
                            />
                         </div>
                         <div className="flex gap-3 pt-2">
                            <button 
                              onClick={handleAccept}
                              className="flex-1 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                              <CheckCircle2 size={16} /> 接受訂單
                            </button>
                            <button 
                              onClick={handleReject}
                              className="flex-1 py-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
                            >
                              <XCircle size={16} /> 拒絕
                            </button>
                         </div>
                      </div>
                    )}

                    {currentStatus === 'accepted' && (
                      <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                         <div className="flex items-center gap-3 text-blue-400 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                            <Calendar size={16} />
                            <span className="text-sm">預計: {order.estimatedCompletionDate || '未設定'}</span>
                         </div>
                         <button 
                            onClick={handleComplete}
                            className="w-full py-3 bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 size={16} /> 標記為完成 (Complete)
                          </button>
                      </div>
                    )}

                    {(currentStatus === 'completed' || currentStatus === 'rejected') && (
                       <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">此訂單已結案</p>
                       </div>
                    )}

                    <div className="pt-8 border-t border-white/5 flex justify-end">
                       <button 
                         onClick={handleDelete}
                         className="flex items-center gap-2 text-red-500/50 hover:text-red-500 text-xs font-bold uppercase tracking-widest transition-colors"
                       >
                         <Trash2 size={14} /> 刪除訂單
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
