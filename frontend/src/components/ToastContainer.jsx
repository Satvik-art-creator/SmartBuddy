import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { TOAST_EVENT } from '../utils/toast';

const stylesByType = {
  success: 'bg-gradient-to-r from-green-500 to-purple-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-amber-400 text-white',
};

export default function ToastContainer() {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    const onToast = (e) => {
      const t = e.detail;
      setToasts((prev) => [...prev, t]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== t.id));
      }, 3000);
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, []);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] space-y-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className={`rounded-xl shadow-lg px-4 py-3 border border-white/10 backdrop-blur ${stylesByType[t.type] || stylesByType.info}`}
          >
            <div className="text-sm font-medium">
              {t.type === 'success' && '✅ '}
              {t.type === 'error' && '❌ '}
              {t.type === 'warning' && '⚠ '}
              {t.type === 'info' && 'ℹ '}
              {t.message}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}


