import React, { createContext, useContext, useState, ReactNode } from 'react';
import ConfirmDialog, { DialogType } from '../components/ConfirmDialog';

interface DialogOptions {
  type: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

interface DialogContextType {
  showDialog: (options: DialogOptions) => Promise<boolean>;
  alert: (message: string, title?: string, type?: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
  confirm: (message: string, title?: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOptions, setDialogOptions] = useState<DialogOptions>({
    type: 'info',
    title: '',
    message: '',
  });
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const showDialog = (options: DialogOptions): Promise<boolean> => {
    setDialogOptions(options);
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) {
      resolver(true);
      setResolver(null);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) {
      resolver(false);
      setResolver(null);
    }
  };

  // Alert helper (只有確定按鈕)
  const alert = async (
    message: string,
    title: string = '提示',
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<void> => {
    await showDialog({
      type,
      title,
      message,
      confirmText: '確定',
    });
  };

  // Confirm helper (確定 + 取消)
  const confirm = async (
    message: string,
    title: string = '確認'
  ): Promise<boolean> => {
    return showDialog({
      type: 'confirm',
      title,
      message,
      confirmText: '確定',
      cancelText: '取消',
    });
  };

  return (
    <DialogContext.Provider value={{ showDialog, alert, confirm }}>
      {children}
      <ConfirmDialog
        isOpen={isOpen}
        type={dialogOptions.type}
        title={dialogOptions.title}
        message={dialogOptions.message}
        confirmText={dialogOptions.confirmText}
        cancelText={dialogOptions.cancelText}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </DialogContext.Provider>
  );
};

export const useDialog = (): DialogContextType => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
};
