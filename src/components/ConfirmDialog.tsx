import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type DialogType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

interface ConfirmDialogProps {
  isOpen: boolean;
  type: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  type,
  title,
  message,
  confirmText = '確定',
  cancelText = '取消',
  onConfirm,
  onCancel,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={48} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={48} className="text-red-500" />;
      case 'warning':
        return <AlertTriangle size={48} className="text-[#FF9800]" />;
      case 'confirm':
        return <AlertCircle size={48} className="text-[#FF5722]" />;
      default:
        return <Info size={48} className="text-blue-500" />;
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500/30 bg-green-500/5';
      case 'error':
        return 'border-red-500/30 bg-red-500/5';
      case 'warning':
        return 'border-[#FF9800]/30 bg-[#FF9800]/5';
      case 'confirm':
        return 'border-[#FF5722]/30 bg-[#FF5722]/5';
      default:
        return 'border-blue-500/30 bg-blue-500/5';
    }
  };

  const showCancel = type === 'confirm';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998]"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="bg-[#0A0A0A] border-2 border-white/10 rounded-2xl max-w-md w-full shadow-2xl pointer-events-auto relative overflow-hidden"
            >
              {/* Industrial accent line */}
              <div className={`h-1 w-full ${
                type === 'success' ? 'bg-green-500' :
                type === 'error' ? 'bg-red-500' :
                type === 'warning' ? 'bg-[#FF9800]' :
                type === 'confirm' ? 'bg-[#FF5722]' :
                'bg-blue-500'
              }`} />

              {/* Close button */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className={`p-4 rounded-2xl border-2 ${getAccentColor()}`}>
                    {getIcon()}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-black text-white uppercase tracking-tight text-center mb-4">
                  {title}
                </h3>

                {/* Message */}
                <p className="text-gray-400 text-center leading-relaxed mb-8">
                  {message}
                </p>

                {/* Buttons */}
                <div className={`flex gap-3 ${showCancel ? 'flex-row' : 'flex-col'}`}>
                  {showCancel && (
                    <button
                      onClick={onCancel}
                      className="flex-1 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-bold uppercase text-sm hover:bg-white/10 transition-all active:scale-95"
                    >
                      {cancelText}
                    </button>
                  )}
                  <button
                    onClick={onConfirm}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold uppercase text-sm transition-all active:scale-95 shadow-lg ${
                      type === 'success' ? 'bg-green-500 text-black hover:bg-green-600' :
                      type === 'error' ? 'bg-red-500 text-white hover:bg-red-600' :
                      type === 'warning' ? 'bg-[#FF9800] text-black hover:bg-[#E68900]' :
                      type === 'confirm' ? 'bg-[#FF5722] text-black hover:bg-[#E64A19]' :
                      'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>

              {/* Industrial grid pattern */}
              <div className="absolute inset-0 industrial-grid opacity-5 pointer-events-none" />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
