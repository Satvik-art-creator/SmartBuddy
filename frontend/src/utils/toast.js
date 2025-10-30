// Simple event-based toast API so we don't add heavy deps
const EVENT = 'smartbuddy:toast';

export function toast(message, type = 'info') {
  try {
    window.dispatchEvent(new CustomEvent(EVENT, { detail: { id: Date.now() + Math.random(), type, message } }));
  } catch {}
}

export const toastSuccess = (message) => toast(message, 'success');
export const toastError = (message) => toast(message, 'error');
export const toastInfo = (message) => toast(message, 'info');
export const toastWarning = (message) => toast(message, 'warning');

export const TOAST_EVENT = EVENT;


