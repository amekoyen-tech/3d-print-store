import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Printer, Hammer, Package, MessageCircle, Settings } from 'lucide-react';
import { useOrderModificationRequests } from '../hooks/useOrderModificationRequests';
import OrderMessageBox from './OrderMessageBox';
import OrderModificationForm from './OrderModificationForm';

const statusSteps: { id: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { id: 'pending', label: '待處理', icon: <Clock size={16} /> },
  { id: 'accepted', label: '已接單', icon: <CheckCircle2 size={16} /> },
  { id: 'printing', label: '列印中', icon: <Printer size={16} /> },
  { id: 'post_processing', label: '後處理', icon: <Hammer size={16} /> },
  { id: 'completed', label: '已完成', icon: <Package size={16} /> },
];

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const { requests, loading: requestsLoading } = useOrderModificationRequests(order.id);
  const [expandedMessages, setExpandedMessages] = useState(false);
  const [expandedModRequests, setExpandedModRequests] = useState(false);
  const [showModForm, setShowModForm] = useState(false);

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden"
    >
      <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Order ID</p>
            <p className="text-2xl font-mono text-[#FF5722]">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">總金額</p>
            <p className="text-3xl font-black">${order.totalPrice}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {statusSteps.map((step, index) => {
            const status = getStepStatus(order.status, step.id);
            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                      status === 'completed'
                        ? 'bg-[#FF5722] text-black'
                        : status === 'current'
                        ? 'bg-[#FF5722]/30 text-[#FF5722] border-2 border-[#FF5722]'
                        : 'bg-[#222] text-gray-600'
                    }`}
                  >
                    {step.icon}
                  </div>
                  <span className="text-[9px] text-gray-500 font-bold uppercase hidden md:block">{step.label}</span>
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-2 ${
                    getStepStatus(order.status, statusSteps[index + 1].id) === 'completed' ? 'bg-[#FF5722]' : 'bg-[#333]'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Order Items */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">訂購項目</p>
          {order.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] rounded-xl border border-white/5">
              <div>
                <p className="font-bold text-white">{item.name}</p>
                {item.selectedColor && item.selectedColor !== 'default' && (
                  <p className="text-xs text-gray-400 mt-1">
                    顏色: <span className="text-[#FF5722]">{typeof item.selectedColor === 'object' ? item.selectedColor.name : '預設'}</span>
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-mono text-[#FF5722]">${item.price} × {item.quantity}</p>
                <p className="text-xs text-gray-500 mt-1">${item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Section */}
      <div className="p-6 md:p-8 border-b border-white/5">
        <button
          onClick={() => setExpandedMessages(!expandedMessages)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <MessageCircle size={16} className="text-[#FF5722]" />
            <span className="text-sm font-bold uppercase tracking-wider">留言訊息</span>
          </div>
          <span className="text-xs text-gray-500">{expandedMessages ? '收起' : '展開'}</span>
        </button>
        {expandedMessages && <OrderMessageBox orderId={order.id} customerName={order.customer?.name || '客戶'} />}
      </div>

      {/* Modification Requests Section */}
      <div className="p-6 md:p-8">
        <button
          onClick={() => setExpandedModRequests(!expandedModRequests)}
          className="w-full flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-[#FF5722]" />
            <span className="text-sm font-bold uppercase tracking-wider">訂單修改</span>
            {requests.length > 0 && (
              <span className="bg-[#FF5722] text-black text-[10px] font-black px-2 py-1 rounded-full">
                {requests.length}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{expandedModRequests ? '收起' : '展開'}</span>
        </button>

        {expandedModRequests && (
          <div>
            <div className="mb-4">
              {order.status !== 'completed' && order.status !== 'cancelled' && !showModForm && (
                <button
                  onClick={() => setShowModForm(true)}
                  className="w-full bg-[#FF5722] text-black py-3 rounded-xl font-bold uppercase text-sm hover:bg-[#E64A19] transition-colors"
                >
                  申請修改
                </button>
              )}
            </div>

            {showModForm && (
              <div className="mb-6">
                <OrderModificationForm
                  orderId={order.id}
                  onClose={() => setShowModForm(false)}
                  onSuccess={() => setShowModForm(false)}
                />
              </div>
            )}

            {/* Modification Requests List */}
            {requestsLoading ? (
              <p className="text-xs text-gray-600 text-center py-4">載入中...</p>
            ) : requests.length > 0 ? (
              <div className="space-y-3">
                {requests.map((req) => (
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
                    <p className="text-sm text-gray-300 mb-2">{req.description}</p>
                    {req.adminResponse && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-[10px] font-bold text-gray-500 uppercase mb-1">商家回應:</p>
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
        )}
      </div>
    </motion.div>
  );
};

export default OrderDetails;
