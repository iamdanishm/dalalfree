import toast from "react-hot-toast";

/**
 * Custom hook for toast notifications
 * Provides consistent toast methods throughout the application
 */
export const useToast = () => {
  // Success toast
  const success = (message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      ...options,
    });
  };

  // Error toast
  const error = (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      ...options,
    });
  };

  // Info toast
  const info = (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      ...options,
    });
  };

  // Loading toast
  const loading = (message, options = {}) => {
    return toast.loading(message, {
      ...options,
    });
  };

  // Dismiss toast
  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  // Dismiss all toasts
  const dismissAll = () => {
    toast.dismiss();
  };

  // Promise toast - handles async operations
  const promise = async (promise, messages, options = {}) => {
    const {
      loading = "Loading...",
      success: successMsg,
      error: errorMsg,
    } = messages;

    return toast.promise(
      promise,
      {
        loading,
        success: successMsg,
        error: errorMsg,
      },
      {
        ...options,
      }
    );
  };

  return {
    success,
    error,
    info,
    loading,
    dismiss,
    dismissAll,
    promise,
    // Direct access to toast methods for advanced usage
    toast,
  };
};
