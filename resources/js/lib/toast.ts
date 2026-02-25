import toast from 'react-hot-toast';

// Custom toast configurations
const toastConfig = {
  success: {
    duration: 3000,
    style: {
      background: '#10B981',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  },
  error: {
    duration: 4000,
    style: {
      background: '#EF4444',
      color: '#fff',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  },
  loading: {
    style: {
      background: '#3B82F6',
      color: '#fff',
    },
  },
};

export const showToast = {
  success: (message: string) => {
    toast.success(message, toastConfig.success);
  },
  
  error: (message: string) => {
    toast.error(message, toastConfig.error);
  },
  
  loading: (message: string) => {
    return toast.loading(message, toastConfig.loading);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages, {
      success: toastConfig.success,
      error: toastConfig.error,
      loading: toastConfig.loading,
    });
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
};
