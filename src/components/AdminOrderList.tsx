import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { useOrders } from '../hooks/useOrders';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, AlertCircle, Calendar, MessageSquare, ChevronDown, ChevronUp, Package, Trash2 } from 'lucide-react';

const statusColors: Record<OrderStatus, string> = {
  pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  accepted: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  rejected: 'text-red-500 bg-red-500/10 border-red-500/20',
  completed: 'text-green-500 bg-green-500/10 border-green-500/20',
  cancelled: 'text-gray-500 bg-gray-500/10 border-gray-500/20',
};

const statusLabels: Record<OrderStatus, string> = {
  pending: '待處理 (Pending)',
  accepted: '已接單 (Accepted)',
  rejected: '已拒絕 (Rejected)',
  completed: '已完成 (Completed)',
  cancelled: '已取消 (Cancelled)',
};

export default function AdminOrderList() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
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
          />
        ))}
        {orders.length === 0 && (
           <div className="text-center py-20 text-gray-500 border border-white/5 rounded-2xl">
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
}> = ({ order, expanded, onToggle, onUpdateStatus, onDelete }) => {
  const [actionNote, setActionNote] = useState('');
  const [estDate, setEstDate] = useState('');
  
  // Convert timestamp to readable date if needed
  const dateStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 
                 (order.createdAt instanceof Date ? order.createdAt.toLocaleString() : 'Unknown Date');

  const handleAccept = () => {
    onUpdateStatus(order.id, 'accepted', { estimatedCompletionDate: estDate, adminNotes: actionNote });
  };
  
  const handleReject = () => {
    onUpdateStatus(order.id, 'rejected', { adminNotes: actionNote });
  };

  const handleComplete = () => {
    onUpdateStatus(order.id, 'completed', { adminNotes: actionNote });
  };

  const status = order.status || 'pending';

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
           <div className={`w-3 h-3 rounded-full ${status === 'pending' ? 'bg-yellow-500 animate-pulse' : status === 'completed' ? 'bg-green-500' : 'bg-gray-500'}`} />
           <div>
              <h3 className="font-bold text-lg">{order.customer?.name || '無姓名 (No Name)'}</h3>
              <p className="text-xs text-gray-500 font-mono">{dateStr}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${statusColors[status] || statusColors.pending}`}>
              {statusLabels[status] || statusLabels.pending}
           </div>
           <div className="text-right">
              <p className="text-sm text-gray-400 font-mono">{(order.items || []).length} Items</p>
              <p className="text-lg font-bold text-[#FF5722] font-mono">${order.totalPrice || 0}</p>
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
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">客戶資訊 (Customer)</h4>
                    <div className="bg-[#050505] p-4 rounded-xl border border-white/5 space-y-2 font-mono text-sm">
                       <p><span className="text-gray-500">Name:</span> {order.customer?.name || '-'}</p>
                       <p><span className="text-gray-500">Phone:</span> {order.customer?.phone || '-'}</p>
                       <p><span className="text-gray-500">Note:</span> <span className="text-white italic">{order.customer?.notes || '-'}</span></p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">訂購項目 (Items)</h4>
                    <div className="space-y-3">
                       {(order.items || []).map((item, i) => (
                         <div key={i} className="flex gap-4 bg-[#050505] p-3 rounded-xl border border-white/5 items-center">
                            <div className="w-12 h-12 bg-[#222] rounded flex-shrink-0 overflow-hidden">
                               {item.image && <img src={item.image} className="w-full h-full object-cover" alt="" />}
                            </div>
                            <div className="flex-grow">
                               <p className="font-bold text-sm">{item.name}</p>
                               <p className="text-xs text-gray-500 font-mono">${item.price} x {item.quantity}</p>
                            </div>
                            <p className="font-mono font-bold">${item.price * item.quantity}</p>
                         </div>
                       ))}
                    </div>
                  </div>
               </div>

               {/* Actions */}
               <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">管理操作 (Actions)</h4>
                    
                    {order.status === 'pending' && (
                      <div className="bg-[#1A1A1A] p-6 rounded-2xl border border-white/5 space-y-4">
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400">預計完成日 (Est. Date)</label>
                            <input 
                              type="date" 
                              value={estDate}
                              onChange={e => setEstDate(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FF5722] outline-none"
                            />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-gray-400">管理員備註 (Admin Note)</label>
                            <textarea 
                              value={actionNote}
                              onChange={e => setActionNote(e.target.value)}
                              className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FF5722] outline-none"
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

                    {order.status === 'accepted' && (
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

                    {(order.status === 'completed' || order.status === 'rejected') && (
                       <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5">
                          <p className="text-gray-500 text-sm">此訂單已結案</p>
                       </div>
                    )}

                    <div className="pt-8 border-t border-white/5 flex justify-end">
                       <button 
                         onClick={() => { if(confirm('確定刪除此訂單？')) onDelete(order.id); }}
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
