import toast from 'react-hot-toast';

export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#10b981',
      color: 'white',
      fontWeight: '500',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    icon: '✓',
  });
};

export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#ef4444',
      color: 'white',
      fontWeight: '500',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    icon: '✕',
  });
};

export const showWarningToast = (message) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#f59e0b',
      color: 'white',
      fontWeight: '500',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    icon: '⚠',
  });
};

export const showInfoToast = (message) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      background: '#3b82f6',
      color: 'white',
      fontWeight: '500',
      borderRadius: '8px',
      padding: '12px 16px',
    },
    icon: 'ℹ',
  });
};

export const showLoadingToast = (message) => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      background: '#6366f1',
      color: 'white',
      fontWeight: '500',
      borderRadius: '8px',
      padding: '12px 16px',
    },
  });
};

export const dismissToast = (toastId) => {
  if (toastId) {
    toast.dismiss(toastId);
  }
};
