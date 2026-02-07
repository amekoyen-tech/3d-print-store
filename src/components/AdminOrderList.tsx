import React, { useState } from 'react';
import { Order, OrderStatus, DeliveryMethod, PaymentMethod } from '../types';
import { useOrders } from '../hooks/useOrders';
import { useOrderMessages } from '../hooks/useOrderMessages';
import { useModificationRequests } from '../hooks/useModificationRequests';
import { useOrderModificationRequests } from '../hooks/useOrderModificationRequests';
import { useDialog } from '../contexts/DialogContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Calendar, ChevronDown, ChevronUp, Trash2, User, Truck, CreditCard, MessageCircle, Settings, ThumbsUp, ThumbsDown } from 'lucide-react';
import OrderMessageBox from './OrderMessageBox';

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
  const { orders, updateOrderStatus, deleteOrder, calculateEstimatedCompletion, updateEstimatedDate, batchUpdateEstimatedDate } = useOrders();
  const { confirm, alert } = useDialog();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [batchDate, setBatchDate] = useState('');
  const [batchUpdating, setBatchUpdating] = useState(false);
  const [showBatchBar, setShowBatchBar] = useState(false);

  // 只顯示非生產狀態的訂單
  const displayOrders = React.useMemo(() => {
    return orders.filter(o =>
      ['pending', 'rejected', 'completed', 'cancelled'].includes(o.status)
    );
  }, [orders]);

  const toggleOrderSelection = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
    setShowBatchBar(newSelected.size > 0);
  };

  const selectAllAccepted = () => {
    const acceptedIds = displayOrders
      .filter(o => o.status === 'accepted')
      .map(o => o.id);
    setSelectedOrders(new Set(acceptedIds));
    setShowBatchBar(acceptedIds.length > 0);
  };

  const clearSelection = () => {
    setSelectedOrders(new Set());
    setShowBatchBar(false);
    setBatchDate('');
  };

  const handleBatchUpdate = async () => {
    if (!batchDate) {
      await alert('請選擇日期', '提示', 'warning');
      return;
    }

    const confirmed = await confirm(
      `確定要將 ${selectedOrders.size} 個訂單的預計完成日期更新為 ${batchDate} 嗎？`,
      '批量更新'
    );

    if (!confirmed) return;

    try {
      setBatchUpdating(true);
      const { success, failed } = await batchUpdateEstimatedDate(
        Array.from(selectedOrders),
        batchDate
      );

      if (failed.length === 0) {
        await alert(`成功更新 ${success.length} 個訂單`, '成功', 'success');
      } else {
        await alert(
          `成功: ${success.length} 個，失敗: ${failed.length} 個`,
          '部分成功',
          'warning'
        );
      }

      clearSelection();
    } catch (err: any) {
      await alert('批量更新失敗: ' + err.message, '錯誤', 'error');
    } finally {
      setBatchUpdating(false);
    }
  };

  const handleAutoCalculate = async () => {
    try {
      const suggestedDate = await calculateEstimatedCompletion();
      const formatted = suggestedDate.toISOString().split('T')[0];
      setBatchDate(formatted);
    } catch (err) {
      await alert('計算失敗', '錯誤', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-black uppercase tracking-widest flex items-center gap-3">
          訂單管理
          <span className="text-xs bg-[#FF5722] text-black px-2 py-1 rounded font-bold">
            {displayOrders.length}
          </span>
        </h2>

        <div className="flex gap-2">
          <button
            onClick={selectAllAccepted}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase transition-colors"
          >
            全選已接單
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {displayOrders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            expanded={selectedOrder === order.id}
            onToggle={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
            onUpdateStatus={updateOrderStatus}
            onDelete={deleteOrder}
            calculateEstimation={calculateEstimatedCompletion}
            onUpdateEstimatedDate={updateEstimatedDate}
            isSelected={selectedOrders.has(order.id)}
            onToggleSelection={toggleOrderSelection}
          />
        ))}
        {displayOrders.length === 0 && (
           <div className="text-center py-20 text-gray-500 border border-white/5 rounded-2xl bg-white/5 backdrop-blur-sm font-mono uppercase tracking-widest">
              目前沒有訂單 (NO ORDERS)
           </div>
        )}
      </div>

      {/* 批量操作工具欄 */}
      <AnimatePresence>
        {showBatchBar && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-white/10 p-6 z-50"
          >
            <div className="max-w-7xl mx-auto flex items-center gap-6">
              {/* 選擇數量 */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-[#FF5722] rounded-full flex items-center justify-center">
                  <span className="text-black font-black">{selectedOrders.size}</span>
                </div>
                <span className="text-sm font-bold uppercase tracking-wider">
                  已選擇訂單
                </span>
              </div>

              {/* 日期選擇器 */}
              <div className="flex-1 max-w-xs">
                <input
                  type="date"
                  value={batchDate}
                  onChange={(e) => setBatchDate(e.target.value)}
                  className="w-full bg-[#222] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-[#FF5722] outline-none"
                />
              </div>

              {/* 自動計算按鈕 */}
              <button
                onClick={handleAutoCalculate}
                className="px-4 py-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500/20 rounded-lg font-bold uppercase text-xs tracking-widest transition-colors flex items-center gap-2"
              >
                <Clock size={16} />
                自動計算
              </button>

              {/* 批量更新按鈕 */}
              <button
                onClick={handleBatchUpdate}
                disabled={batchUpdating || !batchDate}
                className="px-6 py-3 bg-[#FF5722] text-black rounded-lg font-bold uppercase text-sm hover:bg-[#E64A19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {batchUpdating ? '更新中...' : '批量更新日期'}
              </button>

              {/* 取消按鈕 */}
              <button
                onClick={clearSelection}
                className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold uppercase transition-colors"
              >
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
  onUpdateEstimatedDate: (id: string, newDate: string) => Promise<void>;
  isSelected: boolean;
  onToggleSelection: (orderId: string) => void;
}> = ({ order, expanded, onToggle, onUpdateStatus, onDelete, calculateEstimation, onUpdateEstimatedDate, isSelected, onToggleSelection }) => {
  const { confirm, alert } = useDialog();
  const [actionNote, setActionNote] = useState('');
  const [estDate, setEstDate] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newEstDate, setNewEstDate] = useState('');
  
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

  const handleUpdateEstimatedDate = async () => {
    if (!newEstDate) {
      await alert('請選擇新的預計完成日期', '提示', 'warning');
      return;
    }

    const confirmed = await confirm(
      `確定要將預計完成日期更新為 ${newEstDate} 嗎？`,
      '更新交貨日期'
    );

    if (confirmed) {
      try {
        await onUpdateEstimatedDate(order.id, newEstDate);
        setIsEditingDate(false);
        setNewEstDate('');
        await alert('交貨日期已更新', '成功', 'success');
      } catch (err: any) {
        await alert('更新失敗: ' + (err.message || '未知錯誤'), '錯誤', 'error');
      }
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = await confirm('確定刪除此訂單？此動作無法復原。', '刪除訂單');
    if (confirmed) {
      try {
        await onDelete(order.id);
      } catch (err: any) {
        console.error('Delete error:', err);
        await alert('刪除失敗: ' + (err.message || '未知錯誤'), '錯誤', 'error');
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
           {/* Checkbox */}
           <input
             type="checkbox"
             checked={isSelected}
             onChange={(e) => {
               e.stopPropagation();
               onToggleSelection(order.id);
             }}
             className="w-5 h-5 rounded bg-[#222] border-2 border-white/20 checked:bg-[#FF5722] checked:border-[#FF5722] cursor-pointer"
           />
           <div className={`w-3 h-3 rounded-full ${currentStatus === 'pending' ? 'bg-yellow-500 animate-pulse' : currentStatus === 'completed' ? 'bg-green-500' : 'bg-gray-500'}`} />
           <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{order.customer?.name || '無姓名 (No Name)'}</h3>
                {order.hasUnreadMessages && (
                  <span className="px-2 py-0.5 bg-[#FF5722] text-black text-xs font-black rounded-full flex items-center gap-1 animate-pulse">
                    <MessageCircle size={10} />
                    新留言
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 font-mono">{dateStr}</p>
           </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className={`px-3 py-1 rounded text-xs font-black uppercase tracking-widest border ${statusColors[currentStatus] || statusColors.pending}`}>
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
                            <p className="text-xs text-gray-500 uppercase font-black mb-1">Name</p>
                            <p className="text-white font-bold">{order.customer?.name || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-black mb-1">Phone</p>
                            <p className="text-white font-bold">{order.customer?.phone || '-'}</p>
                          </div>
                       </div>
                       
                       <div className="border-b border-white/5 pb-4">
                          <p className="text-xs text-gray-500 uppercase font-black mb-1">Contact (LINE/IG/Email)</p>
                          <p className="text-white font-bold">{order.customer?.contactMethod || '-'}</p>
                       </div>

                       <div className="grid grid-cols-2 gap-4 border-b border-white/5 pb-4">
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-black mb-1">Method</p>
                            <p className="text-blue-400 font-bold">{deliveryLabels[order.deliveryMethod] || order.deliveryMethod}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase font-black mb-1">Payment</p>
                            <p className="text-yellow-400 font-bold">{paymentLabels[order.paymentMethod] || order.paymentMethod}</p>
                          </div>
                       </div>

                       {order.deliveryMethod === 'mailing' && (
                         <div className="border-b border-white/5 pb-4">
                            <p className="text-xs text-gray-500 uppercase font-black mb-1">Address</p>
                            <p className="text-white text-xs">{order.customer?.address || '未提供地址'}</p>
                         </div>
                       )}

                       <div>
                          <p className="text-xs text-gray-500 uppercase font-black mb-1">Note</p>
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
                                  <span className="text-xs text-gray-500 font-mono">${item.price} x {item.quantity}</span>
                                  {item.selectedColor && (
                                    <span className="text-micro px-1.5 py-0.5 bg-white/5 rounded border border-white/10 text-white/40 uppercase">
                                      {item.selectedColor === 'default' ? '預設' : item.selectedColor.name}
                                    </span>
                                  )}
                               </div>
                            </div>
                            <p className="font-mono font-bold text-white">${item.price * item.quantity}</p>
                         </div>
                       ))}
                       <div className="pt-4 flex justify-between items-center border-t border-white/10 px-2 mt-2">
                          <span className="text-xs text-gray-500 uppercase font-black">運費 Shipping</span>
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
                            <div className="flex items-center justify-between">
                              <label className="text-xs uppercase tracking-widest text-gray-400">
                                預計完成日 (Est. Date)
                              </label>
                              {isCalculating && (
                                <span className="text-xs text-blue-500 flex items-center gap-1">
                                  <Clock size={12} className="animate-spin" />
                                  自動計算中...
                                </span>
                              )}
                            </div>
                            <input
                              type="date"
                              value={estDate}
                              onChange={e => setEstDate(e.target.value)}
                              disabled={isCalculating}
                              className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FF5722] outline-none text-white disabled:opacity-50"
                            />
                            {!isCalculating && estDate && (
                              <p className="text-micro text-gray-600 italic flex items-center gap-1">
                                <CheckCircle2 size={10} className="text-green-500" />
                                已根據當前未完成訂單的工作量自動計算
                              </p>
                            )}
                         </div>
                         <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-400">管理員備註 (Admin Note)</label>
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
                         {!isEditingDate ? (
                           <>
                             <div className="flex items-center justify-between gap-3 text-blue-400 bg-blue-500/5 p-3 rounded-lg border border-blue-500/10">
                               <div className="flex items-center gap-2">
                                 <Calendar size={16} />
                                 <span className="text-sm">預計: {order.estimatedCompletionDate || '未設定'}</span>
                               </div>
                               <button
                                 onClick={() => {
                                   setIsEditingDate(true);
                                   setNewEstDate(order.estimatedCompletionDate || '');
                                 }}
                                 className="text-xs text-[#FF5722] hover:underline font-bold uppercase"
                               >
                                 修改
                               </button>
                             </div>
                           </>
                         ) : (
                           <div className="space-y-3 bg-blue-500/5 p-4 rounded-lg border border-blue-500/10">
                             <div className="flex items-center justify-between">
                               <label className="text-xs uppercase tracking-widest text-gray-400">新預計完成日期</label>
                               <button
                                 onClick={async (e) => {
                                   e.stopPropagation();
                                   try {
                                     const suggestedDate = await calculateEstimation();
                                     const formatted = suggestedDate.toISOString().split('T')[0];
                                     setNewEstDate(formatted);
                                   } catch (err) {
                                     console.error('Auto-calculation failed:', err);
                                   }
                                 }}
                                 className="text-xs text-blue-500 hover:underline font-bold uppercase flex items-center gap-1"
                               >
                                 <Clock size={12} />
                                 自動計算
                               </button>
                             </div>
                             <input
                               type="date"
                               value={newEstDate}
                               onChange={(e) => setNewEstDate(e.target.value)}
                               className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm focus:border-[#FF5722] outline-none text-white"
                             />
                             <div className="flex gap-2">
                               <button
                                 onClick={() => {
                                   setIsEditingDate(false);
                                   setNewEstDate('');
                                 }}
                                 className="flex-1 bg-[#333] text-white py-2 rounded-lg font-bold uppercase text-xs hover:bg-[#444] transition-colors"
                               >
                                 取消
                               </button>
                               <button
                                 onClick={handleUpdateEstimatedDate}
                                 className="flex-1 bg-[#FF5722] text-black py-2 rounded-lg font-bold uppercase text-xs hover:bg-[#E64A19] transition-colors"
                               >
                                 確認更新
                               </button>
                             </div>
                           </div>
                         )}
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

                  {/* 留言區塊 */}
                  <div className="pt-6">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <MessageCircle size={14} className="text-[#FF5722]" /> 訂單留言 (Messages)
                    </h4>
                    <div className="bg-[#1A1A1A] p-4 rounded-2xl border border-white/5">
                      <AdminMessageSection orderId={order.id} />
                    </div>
                  </div>

                  {/* 修改請求區塊 */}
                  {order.modificationRequests && order.modificationRequests.length > 0 && (
                    <div className="pt-6">
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Settings size={14} className="text-[#2196F3]" /> 修改請求 (Mod Requests)
                      </h4>
                      <ModificationRequestsAdmin
                        orderId={order.id}
                        requests={order.modificationRequests}
                      />
                    </div>
                  )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Admin 留言區組件
const AdminMessageSection: React.FC<{ orderId: string }> = ({ orderId }) => {
  const { messages, uploading, addMessage, markAsRead } = useOrderMessages(orderId);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (messages.length > 0) {
      markAsRead('admin').catch(console.error);
    }
  }, [messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) {
      setError('請輸入留言內容');
      return;
    }

    try {
      setError(null);
      await addMessage(newMessage, 'admin', 'Alex Print Lab');
      setNewMessage('');
    } catch (err: any) {
      setError(err.message || '發送失敗');
    }
  };

  return (
    <div className="space-y-3">
      {/* 留言列表 */}
      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-4">尚無留言</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-3 rounded-lg text-sm ${
                msg.sender === 'customer'
                  ? 'bg-white/5 border border-white/10'
                  : 'bg-[#FF5722]/10 border border-[#FF5722]/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-gray-500 uppercase">
                  {msg.senderName}
                </span>
                <span className="text-micro text-gray-600">
                  {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString('zh-TW', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : ''}
                </span>
              </div>
              <p className="text-gray-300 whitespace-pre-wrap">{msg.content}</p>
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="留言圖片"
                  className="mt-2 max-h-32 rounded cursor-pointer"
                  onClick={() => window.open(msg.imageUrl, '_blank')}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* 回覆表單 */}
      <form onSubmit={handleSubmit} className="space-y-2">
        {error && (
          <div className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded p-2">
            {error}
          </div>
        )}
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="輸入回覆..."
          rows={2}
          maxLength={500}
          disabled={uploading}
          className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm resize-none focus:border-[#FF5722] outline-none text-white placeholder:text-gray-700 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || uploading}
          className="w-full py-2 bg-[#FF5722] hover:bg-[#E64A19] text-black rounded-lg font-bold uppercase text-xs tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? '發送中...' : '發送回覆'}
        </button>
      </form>
    </div>
  );
};

// 修改請求處理組件
const ModificationRequestsAdmin: React.FC<{
  orderId: string;
  requests: Order['modificationRequests'];
}> = ({ orderId, requests }) => {
  const { approveRequest, rejectRequest } = useModificationRequests();
  const {
    approveWithPriceAdjustment,
  } = useOrderModificationRequests(orderId);
  const { alert, confirm } = useDialog();
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showPriceAdjustmentForm, setShowPriceAdjustmentForm] = useState(false);
  const [priceFormData, setPriceFormData] = useState({
    amount: 0,
    reason: '',
    adminResponse: '',
    estimatedDate: '',
  });

  const handleApprove = async (reqId: string) => {
    if (!response.trim()) {
      await alert('請填寫回應內容', '提示', 'warning');
      return;
    }

    try {
      setProcessing(true);
      await approveRequest(orderId, reqId, response);
      setSelectedReq(null);
      setResponse('');
      await alert('已批准修改請求', '成功', 'success');
    } catch (err) {
      await alert('操作失敗', '錯誤', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reqId: string) => {
    if (!response.trim()) {
      await alert('請填寫拒絕理由', '提示', 'warning');
      return;
    }

    try {
      setProcessing(true);
      await rejectRequest(orderId, reqId, response);
      setSelectedReq(null);
      setResponse('');
      await alert('已拒絕修改請求', '完成', 'info');
    } catch (err) {
      await alert('操作失敗', '錯誤', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleApproveWithPrice = async (reqId: string) => {
    if (!priceFormData.adminResponse.trim()) {
      await alert('請填寫管理員回應', '提示', 'warning');
      return;
    }
    if (!priceFormData.reason.trim()) {
      await alert('請填寫調整原因', '提示', 'warning');
      return;
    }
    if (priceFormData.amount === 0) {
      await alert('請輸入調整金額（不可為 0）', '提示', 'warning');
      return;
    }

    let confirmMessage = `確定要批准此修改請求並調整價格 ${priceFormData.amount >= 0 ? '+' : ''}$${priceFormData.amount}`;
    if (priceFormData.estimatedDate) {
      confirmMessage += ` 並更新預計完成日期為 ${priceFormData.estimatedDate}`;
    }
    confirmMessage += ' 嗎？';

    const confirmed = await confirm(confirmMessage, '確認價格調整');

    if (!confirmed) return;

    try {
      setProcessing(true);
      await approveWithPriceAdjustment(
        reqId,
        orderId,
        priceFormData.adminResponse,
        {
          amount: priceFormData.amount,
          reason: priceFormData.reason,
        },
        priceFormData.estimatedDate || undefined
      );
      setShowPriceAdjustmentForm(false);
      setSelectedReq(null);
      setPriceFormData({ amount: 0, reason: '', adminResponse: '', estimatedDate: '' });
      await alert('已批准修改請求，等待客戶確認價格調整。', '成功', 'success');
    } catch (err: any) {
      await alert('批准失敗: ' + (err.message || '未知錯誤'), '錯誤', 'error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      {requests?.map((req) => (
        <div
          key={req.id}
          className={`p-4 rounded-xl border-2 ${
            req.status === 'pending'
              ? 'border-[#FF9800] bg-[#FF9800]/5'
              : req.status === 'approved'
              ? 'border-green-500 bg-green-500/5'
              : req.status === 'pending_customer_confirmation'
              ? 'border-[#FF5722] bg-[#FF5722]/5'
              : req.status === 'rejected_by_customer'
              ? 'border-red-500/50 bg-red-500/5'
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
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                req.status === 'pending'
                  ? 'bg-[#FF9800] text-black'
                  : req.status === 'approved'
                  ? 'bg-green-500 text-black'
                  : req.status === 'pending_customer_confirmation'
                  ? 'bg-[#FF5722] text-black animate-pulse'
                  : req.status === 'rejected_by_customer'
                  ? 'bg-red-500/50 text-white'
                  : 'bg-red-500 text-white'
              }`}
            >
              {req.status === 'pending' && '待處理'}
              {req.status === 'approved' && '已批准'}
              {req.status === 'rejected' && '已拒絕'}
              {req.status === 'pending_customer_confirmation' && '待確認'}
              {req.status === 'rejected_by_customer' && '客戶拒絕'}
            </span>
          </div>

          <p className="text-sm text-gray-300 mb-3">{req.description}</p>

          {req.status === 'pending' && selectedReq !== req.id && (
            <button
              onClick={() => setSelectedReq(req.id)}
              className="text-xs text-[#FF5722] hover:underline font-bold"
            >
              處理此請求 →
            </button>
          )}

          {selectedReq === req.id && req.status === 'pending' && !showPriceAdjustmentForm && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-3">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="填寫回應或理由..."
                rows={2}
                className="w-full bg-black border border-white/10 rounded-lg p-3 text-sm resize-none focus:border-[#FF5722] outline-none text-white placeholder:text-gray-700"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleApprove(req.id)}
                  disabled={processing}
                  className="flex-1 py-2 bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500/20 rounded-lg font-bold uppercase text-xs tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <ThumbsUp size={12} /> 批准
                </button>
                <button
                  onClick={() => {
                    setShowPriceAdjustmentForm(true);
                    setPriceFormData(prev => ({ ...prev, adminResponse: response }));
                  }}
                  disabled={processing}
                  className="flex-1 py-2 bg-[#FF5722]/10 text-[#FF5722] border border-[#FF5722]/20 hover:bg-[#FF5722]/20 rounded-lg font-bold uppercase text-xs tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <CreditCard size={12} /> 價格調整
                </button>
                <button
                  onClick={() => handleReject(req.id)}
                  disabled={processing}
                  className="flex-1 py-2 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 rounded-lg font-bold uppercase text-xs tracking-widest transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <ThumbsDown size={12} /> 拒絕
                </button>
                <button
                  onClick={() => {
                    setSelectedReq(null);
                    setResponse('');
                  }}
                  disabled={processing}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-gray-400 transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {selectedReq === req.id && req.status === 'pending' && showPriceAdjustmentForm && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-3 bg-[#0A0A0A] p-4 rounded-lg">
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  調整金額（正數增加，負數折扣）
                </label>
                <input
                  type="number"
                  value={priceFormData.amount || ''}
                  onChange={(e) => setPriceFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#FF5722] transition-colors text-sm"
                  placeholder="例如: 200 或 -50"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  調整原因
                </label>
                <input
                  type="text"
                  value={priceFormData.reason}
                  onChange={(e) => setPriceFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#FF5722] transition-colors text-sm"
                  placeholder="例如: 增加 2 個單位"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  管理員回應
                </label>
                <textarea
                  value={priceFormData.adminResponse}
                  onChange={(e) => setPriceFormData(prev => ({ ...prev, adminResponse: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#FF5722] transition-colors text-sm resize-none"
                  rows={2}
                  placeholder="回應客戶的修改請求..."
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  新預計完成日期（選填）
                </label>
                <input
                  type="date"
                  value={priceFormData.estimatedDate}
                  onChange={(e) => setPriceFormData(prev => ({ ...prev, estimatedDate: e.target.value }))}
                  className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-[#FF5722] transition-colors text-sm"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowPriceAdjustmentForm(false);
                    setPriceFormData({ amount: 0, reason: '', adminResponse: '', estimatedDate: '' });
                  }}
                  disabled={processing}
                  className="flex-1 bg-[#333] text-white py-2 rounded-lg font-bold uppercase text-xs hover:bg-[#444] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleApproveWithPrice(req.id)}
                  disabled={!priceFormData.amount || !priceFormData.reason || !priceFormData.adminResponse || processing}
                  className="flex-1 bg-[#FF5722] text-black py-2 rounded-lg font-bold uppercase text-xs hover:bg-[#E64A19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? '處理中...' : '批准並發送'}
                </button>
              </div>
            </div>
          )}

          {req.status === 'pending_customer_confirmation' && (
            <div className="mt-3 p-3 bg-[#FF9800]/10 border border-[#FF9800]/30 rounded-lg">
              <p className="text-xs font-bold text-[#FF9800] uppercase">⏳ 等待客戶確認價格調整</p>
              {req.priceAdjustment && (
                <p className="text-xs text-gray-400 mt-1">
                  調整金額: {req.priceAdjustment.amount >= 0 ? '+' : ''}${req.priceAdjustment.amount}
                </p>
              )}
            </div>
          )}

          {req.status === 'rejected_by_customer' && (
            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-xs font-bold text-red-500 uppercase">❌ 客戶已拒絕價格調整</p>
            </div>
          )}

          {req.adminResponse && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                回應:
              </p>
              <p className="text-xs text-gray-400">{req.adminResponse}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
