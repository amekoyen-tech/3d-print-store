import React, { useState, useRef, useEffect } from 'react';
import { OrderMessage } from '../types';
import { useOrderMessages } from '../hooks/useOrderMessages';
import { validateImageFile } from '../utils/imageUpload';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Loader2, User, Shield } from 'lucide-react';

interface OrderMessageBoxProps {
  orderId: string;
  customerName: string;
  onNewMessage?: () => void;
}

const OrderMessageBox: React.FC<OrderMessageBoxProps> = ({ orderId, customerName, onNewMessage }) => {
  const { messages, loading, uploading, addMessage, markAsRead } = useOrderMessages(orderId);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自動滾動到最新留言
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 標記為已讀（用戶角色）
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead('customer').catch(console.error);
    }
  }, [messages.length]);

  // 監聽新留言（觸發通知）
  useEffect(() => {
    if (messages.length > 0 && onNewMessage) {
      onNewMessage();
    }
  }, [messages.length, onNewMessage]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || '圖片驗證失敗');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() && !selectedImage) {
      setError('請輸入留言內容或選擇圖片');
      return;
    }

    try {
      setError(null);
      await addMessage(newMessage, 'customer', customerName, selectedImage || undefined);
      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || '發送失敗，請稍後再試');
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return '剛剛';
    if (diffMins < 60) return `${diffMins} 分鐘前`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} 小時前`;
    return date.toLocaleDateString('zh-TW', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="animate-spin text-[#FF5722]" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 留言列表 */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">尚無留言，開始對話吧！</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl p-4 ${
                    msg.type === 'system'
                      ? 'bg-white/5 border border-white/10 text-center mx-auto text-gray-400 text-sm'
                      : msg.sender === 'customer'
                      ? 'bg-[#FF5722] text-black'
                      : 'bg-[#2196F3] text-white'
                  }`}
                >
                  {/* 發送者標籤 */}
                  {msg.type !== 'system' && (
                    <div className="flex items-center gap-2 mb-2 text-xs opacity-80">
                      {msg.sender === 'customer' ? (
                        <User size={12} />
                      ) : (
                        <Shield size={12} />
                      )}
                      <span className="font-bold">{msg.senderName}</span>
                    </div>
                  )}

                  {/* 留言內容 */}
                  {msg.content && (
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                  )}

                  {/* 圖片 */}
                  {msg.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={msg.imageUrl}
                        alt="留言圖片"
                        className="rounded-xl max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.imageUrl, '_blank')}
                      />
                    </div>
                  )}

                  {/* 時間戳 */}
                  <p className={`text-[10px] mt-2 ${msg.type === 'system' ? 'text-gray-500' : 'opacity-70'}`}>
                    {formatTimestamp(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區域 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 圖片預覽 */}
        {imagePreview && (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="預覽"
              className="h-20 rounded-xl border-2 border-[#FF5722]"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              ✕
            </button>
          </div>
        )}

        {/* 錯誤訊息 */}
        {error && (
          <div className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-2">
            {error}
          </div>
        )}

        {/* 輸入框 */}
        <div className="flex gap-2">
          <div className="flex-grow relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="輸入留言..."
              rows={2}
              maxLength={500}
              disabled={uploading}
              className="w-full bg-[#111] border border-white/10 rounded-xl py-3 px-4 text-sm resize-none focus:border-[#FF5722] outline-none transition-all disabled:opacity-50"
            />
            <span className="absolute bottom-2 right-2 text-[10px] text-gray-600">
              {newMessage.length}/500
            </span>
          </div>

          {/* 按鈕組 */}
          <div className="flex flex-col gap-2">
            {/* 圖片上傳按鈕 */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors disabled:opacity-50"
              title="上傳圖片"
            >
              <ImageIcon size={18} className="text-gray-400" />
            </button>

            {/* 發送按鈕 */}
            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedImage) || uploading}
              className="p-3 bg-[#FF5722] hover:bg-[#E64A19] text-black rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>

          {/* 隱藏的文件輸入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
        </div>
      </form>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 87, 34, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 87, 34, 0.7);
        }
      `}</style>
    </div>
  );
};

export default OrderMessageBox;
