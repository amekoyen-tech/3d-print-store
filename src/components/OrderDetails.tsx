import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Printer, Hammer, Package, MessageCircle, Settings } from 'lucide-react';
import { useOrderModificationRequests } from '../hooks/useOrderModificationRequests';
import { useDialog } from '../contexts/DialogContext';
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
  const {
    requests,
    loading: requestsLoading,
    confirmPriceAdjustment,
    rejectPriceAdjustment,
  } = useOrderModificationRequests(order.id);
  const { confirm, alert } = useDialog();
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

  const handleConfirmPriceAdjustment = async (requestId: string) => {
    const confirmed = await confirm(
      '確認接受此價格調整？調整後的金額將成為新的訂單總價。',
      '確認價格調整'
    );

    if (confirmed) {
      try {
        await confirmPriceAdjustment(requestId, order.id);
        await alert('價格調整已確認！請依新總價完成付款。', '成功', 'success');
      } catch (err: any) {
        await alert('確認失敗: ' + (err.message || '未知錯誤'), '錯誤', 'error');
      }
    }
  };

  const handleRejectPriceAdjustment = async (requestId: string) => {
    const confirmed = await confirm(
      '確定拒絕此價格調整？修改請求將被取消。',
      '拒絕調整'
    );

    if (confirmed) {
      try {
        await rejectPriceAdjustment(requestId, order.id);
        await alert('已拒絕價格調整，修改請求已取消。', '已拒絕', 'warning');
      } catch (err: any) {
        await alert('操作失敗: ' + (err.message || '未知錯誤'), '錯誤', 'error');
      }
    }
  };

  // Check if there are pending price adjustments
  const hasPendingPriceAdjustment = requests.some(
    (req) => req.status === 'pending_customer_confirmation'
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#111] border border-white/5 rounded-3xl overflow-hidden"
    >
      {/* 待確認價格調整提示 */}
      {hasPendingPriceAdjustment && (
        <div className="p-6 md:p-8 border-b border-white/5 bg-[#FF9800]/5">
          {requests
            .filter((req) => req.status === 'pending_customer_confirmation')
            .map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-[#FF9800]/10 border-2 border-[#FF9800] rounded-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#FF9800] rounded-full flex items-center justify-center">
                    <Settings size={24} className="text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black uppercase tracking-wider text-[#FF9800]">
                      待確認價格調整
                    </h3>
                    <p className="text-xs text-gray-400">您的修改請求需要額外費用調整</p>
                  </div>
                </div>

                <div className="bg-[#111] border border-white/10 rounded-xl p-4 mb-4">
                  <p className="text-sm text-gray-300 mb-4">{req.description}</p>

                  {req.priceAdjustment && (
                    <>
                      <div className="bg-[#222] rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">原始金額</p>
                            <p className="text-xl font-mono text-gray-400">${order.totalPrice}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">調整金額</p>
                            <p
                              className={`text-xl font-mono font-bold ${
                                req.priceAdjustment.amount >= 0 ? 'text-[#FF5722]' : 'text-green-500'
                              }`}
                            >
                              {req.priceAdjustment.amount >= 0 ? '+' : ''}${req.priceAdjustment.amount}
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-white/10 pt-3">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">調整原因</p>
                          <p className="text-sm text-gray-300">{req.priceAdjustment.reason}</p>
                        </div>

                        <div className="border-t border-white/10 pt-3 mt-3">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">新總價</p>
                          <p className="text-3xl font-black text-[#FF5722]">
                            ${(order.effectiveTotalPrice || order.totalPrice) + req.priceAdjustment.amount}
                          </p>
                        </div>

                        {req.estimatedDateAdjustment && (
                          <div className="border-t border-white/10 pt-3 mt-3">
                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">新預計完成日期</p>
                            <p className="text-lg font-bold text-blue-400">{req.estimatedDateAdjustment}</p>
                          </div>
                        )}
                      </div>

                      {req.adminResponse && (
                        <div className="bg-[#222] rounded-lg p-4 mb-4 border border-white/10">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-2">商家回應</p>
                          <p className="text-sm text-gray-300">{req.adminResponse}</p>
                        </div>
                      )}

                      <div className="flex gap-3">
                        <button
                          onClick={() => handleRejectPriceAdjustment(req.id)}
                          className="flex-1 bg-[#333] text-white py-3 rounded-xl font-bold uppercase text-sm hover:bg-[#444] transition-colors"
                        >
                          拒絕調整
                        </button>
                        <button
                          onClick={() => handleConfirmPriceAdjustment(req.id)}
                          className="flex-1 bg-[#FF5722] text-black py-3 rounded-xl font-bold uppercase text-sm hover:bg-[#E64A19] transition-colors"
                        >
                          確認並接受
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
        </div>
      )}

      <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02]">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">Order ID</p>
            <p className="text-2xl font-mono text-[#FF5722]">{order.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-black uppercase tracking-widest mb-1">
              {order.effectiveTotalPrice ? '當前總價' : '總金額'}
            </p>
            <p className="text-3xl font-black">${order.effectiveTotalPrice || order.totalPrice}</p>
            {order.effectiveTotalPrice && order.effectiveTotalPrice !== order.totalPrice && (
              <p className="text-xs text-gray-500 line-through mt-1">原價: ${order.totalPrice}</p>
            )}
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
          <p className="text-xs font-black text-gray-500 uppercase tracking-widest">訂購項目</p>
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

      {/* 價格調整歷史 */}
      {order.priceAdjustments && order.priceAdjustments.length > 0 && (
        <div className="p-6 md:p-8 border-b border-white/5">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings size={16} className="text-[#FF5722]" />
            價格調整歷史
          </h3>

          <div className="space-y-3">
            {order.priceAdjustments.map((adj, index) => (
              <div key={index} className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-lg font-mono font-bold ${
                      adj.amount >= 0 ? 'text-[#FF5722]' : 'text-green-500'
                    }`}
                  >
                    {adj.amount >= 0 ? '+' : ''}${adj.amount}
                  </span>
                  <span className="text-xs text-gray-500 uppercase">
                    {adj.appliedAt?.toDate
                      ? adj.appliedAt.toDate().toLocaleDateString('zh-TW')
                      : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{adj.reason}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-[#FF5722]/10 border border-[#FF5722]/30 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                當前有效金額
              </span>
              <span className="text-2xl font-black text-[#FF5722]">
                ${order.effectiveTotalPrice || order.totalPrice}
              </span>
            </div>
          </div>
        </div>
      )}

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
              <span className="bg-[#FF5722] text-black text-xs font-black px-2 py-1 rounded-full">
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
                        {req.status === 'rejected_by_customer' && '已拒絕調整'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">{req.description}</p>
                    {req.adminResponse && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">商家回應:</p>
                        <p className="text-xs text-gray-400">{req.adminResponse}</p>
                      </div>
                    )}
                    {req.priceAdjustment && req.status !== 'pending_customer_confirmation' && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">價格調整:</p>
                        <p className={`text-sm font-bold ${req.priceAdjustment.amount >= 0 ? 'text-[#FF5722]' : 'text-green-500'}`}>
                          {req.priceAdjustment.amount >= 0 ? '+' : ''}${req.priceAdjustment.amount} - {req.priceAdjustment.reason}
                        </p>
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
