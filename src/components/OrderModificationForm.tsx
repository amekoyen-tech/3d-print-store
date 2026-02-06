import React, { useState } from 'react';
import { OrderModificationRequest } from '../types';
import { useModificationRequests } from '../hooks/useModificationRequests';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Palette, Hash, MapPin, Edit3, Loader2 } from 'lucide-react';

interface OrderModificationFormProps {
  orderId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const requestTypes: Array<{
  value: OrderModificationRequest['requestType'];
  label: string;
  icon: React.ReactNode;
  description: string;
}> = [
  {
    value: 'change_color',
    label: '變更顏色',
    icon: <Palette size={20} />,
    description: '想更換產品的顏色'
  },
  {
    value: 'change_quantity',
    label: '調整數量',
    icon: <Hash size={20} />,
    description: '增加或減少訂購數量'
  },
  {
    value: 'change_address',
    label: '修改地址',
    icon: <MapPin size={20} />,
    description: '更改配送地址'
  },
  {
    value: 'other',
    label: '其他需求',
    icon: <Edit3 size={20} />,
    description: '其他修改需求'
  }
];

const OrderModificationForm: React.FC<OrderModificationFormProps> = ({
  orderId,
  onClose,
  onSuccess
}) => {
  const { createRequest } = useModificationRequests();
  const [selectedType, setSelectedType] = useState<OrderModificationRequest['requestType'] | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      setError('請選擇修改類型');
      return;
    }

    if (!description.trim()) {
      setError('請描述您的修改需求');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await createRequest(orderId, selectedType, description);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || '提交失敗，請稍後再試');
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.3 }}
        className="bg-[#0A0A0A] border border-white/10 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#0A0A0A] border-b border-white/10 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">
              申請修改訂單 <span className="text-[#FF5722]">.</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">請選擇修改類型並說明需求</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 選擇修改類型 */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-3">
              修改類型 (Modification Type)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {requestTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSelectedType(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedType === type.value
                      ? 'border-[#FF5722] bg-[#FF5722]/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`${selectedType === type.value ? 'text-[#FF5722]' : 'text-gray-400'}`}>
                      {type.icon}
                    </div>
                    <span className="font-bold text-sm">{type.label}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    {type.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 描述修改需求 */}
          <div>
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest block mb-3">
              詳細說明 (Description)
            </label>
            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="請詳細描述您的修改需求..."
                rows={5}
                maxLength={500}
                disabled={submitting}
                className="w-full bg-[#111] border border-white/10 rounded-xl py-3 px-4 text-sm resize-none focus:border-[#FF5722] outline-none transition-all disabled:opacity-50"
              />
              <span className="absolute bottom-2 right-2 text-[10px] text-gray-600">
                {description.length}/500
              </span>
            </div>
          </div>

          {/* 錯誤訊息 */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-3"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 提示說明 */}
          <div className="bg-[#FF5722]/5 border border-[#FF5722]/20 rounded-xl p-4">
            <p className="text-[10px] text-gray-400 leading-relaxed">
              ℹ️ 提交後商家會盡快審核您的修改請求。您可以在訂單頁面查看處理狀態。
            </p>
          </div>

          {/* 按鈕組 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold uppercase tracking-widest text-sm transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!selectedType || !description.trim() || submitting}
              className="flex-1 py-3 px-6 bg-[#FF5722] hover:bg-[#E64A19] text-black rounded-xl font-bold uppercase tracking-widest text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Send size={16} />
                  提交申請
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default OrderModificationForm;
