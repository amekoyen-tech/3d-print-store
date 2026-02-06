import React, { useState } from 'react';
import { Order, OrderStatus, DeliveryMethod, PaymentMethod } from '../types';
import { useOrders } from '../hooks/useOrders';
import { useOrderMessages } from '../hooks/useOrderMessages';
import { useModificationRequests } from '../hooks/useModificationRequests';
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
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{order.customer?.name || '無姓名 (No Name)'}</h3>
                {order.hasUnreadMessages && (
                  <span className="px-2 py-0.5 bg-[#FF5722] text-black text-[10px] font-black rounded-full flex items-center gap-1 animate-pulse">
                    <MessageCircle size={10} />
                    新留言
                  </span>
                )}
              </div>
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
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {msg.senderName}
                </span>
                <span className="text-[9px] text-gray-600">
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
  const [selectedReq, setSelectedReq] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleApprove = async (reqId: string) => {
    if (!response.trim()) {
      alert('請填寫回應內容');
      return;
    }

    try {
      setProcessing(true);
      await approveRequest(orderId, reqId, response, requests || []);
      setSelectedReq(null);
      setResponse('');
    } catch (err) {
      alert('操作失敗');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (reqId: string) => {
    if (!response.trim()) {
      alert('請填寫拒絕理由');
      return;
    }

    try {
      setProcessing(true);
      await rejectRequest(orderId, reqId, response, requests || []);
      setSelectedReq(null);
      setResponse('');
    } catch (err) {
      alert('操作失敗');
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
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                req.status === 'pending'
                  ? 'bg-[#FF9800] text-black'
                  : req.status === 'approved'
                  ? 'bg-green-500 text-black'
                  : 'bg-red-500 text-white'
              }`}
            >
              {req.status === 'pending' && '待處理'}
              {req.status === 'approved' && '已批准'}
              {req.status === 'rejected' && '已拒絕'}
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

          {selectedReq === req.id && req.status === 'pending' && (
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

          {req.adminResponse && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">
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
