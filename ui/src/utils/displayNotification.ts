import type { ToastContent, ToastOptions } from 'react-toastify';

import { toast } from 'react-toastify';

export const displayNotification = (
  content: ToastContent,
  status: 'success' | 'error' | 'info' | 'warning' | 'custom',
  options?: ToastOptions
) => {
  switch (status) {
    case 'success':
      toast.success(content, {
        ...options,
      });
      break;
    case 'error':
      toast.error(content, {
        ...options,
      });
      break;
    case 'info':
      toast.info(content, {
        ...options,
      });
      break;
    case 'warning':
      toast.warning(content, {
        ...options,
      });
      break;
    case 'custom':
      toast(content, { ...options });
      break;
    default:
      /* eslint-disable no-console */
      console.error('Unknown notification toast status');
  }
};
