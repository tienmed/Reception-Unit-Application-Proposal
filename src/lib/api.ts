import axios from 'axios';
import { toast } from 'sonner';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

api.interceptors.request.use(
  (config) => {
    // Check for token in localStorage (client-side) or environment variable (fallback)
    let token: string | null = null;

    if (typeof window !== 'undefined') {
      token = localStorage.getItem('api_token');
    }

    // Fallback to env var if not in local storage or if we are server-side (though this specific interceptor logic is mostly client-centric)
    if (!token) {
      token = process.env.NEXT_PUBLIC_API_TOKEN || null;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.';

    if (status === 401) {
      if (typeof window !== 'undefined') {
        const envToken = process.env.NEXT_PUBLIC_API_TOKEN;
        if (!envToken) {
          toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          localStorage.removeItem('api_token');
          // Optional: Delay redirect to let toast show
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        } else {
          toast.error('Lỗi xác thực (401). Kiểm tra cấu hình Token.');
          console.error('API Error 401 with Env Token. Check token validity or Proxy.');
        }
      }
    } else if (status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này.');
    } else if (status === 500) {
      toast.error('Lỗi máy chủ (500). ' + message);
    } else if (status === 404) {
      // toast.error('Không tìm thấy dữ liệu.'); // Optional, might be too noisy
    } else if (!window.navigator.onLine) {
      toast.error('Mất kết nối Internet.');
    } else {
      // Generic error
      // toast.error(message); 
    }

    return Promise.reject(error);
  }
);

export default api;
