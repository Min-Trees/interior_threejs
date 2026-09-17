import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động gán JWT Bearer Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('phuquy_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Bắt lỗi xác thực
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Hết hạn phiên đăng nhập
      localStorage.removeItem('phuquy_token');
      localStorage.removeItem('phuquy_user');
    }
    const message = error.response?.data?.message || error.message || 'Đã xảy ra lỗi kết nối';
    return Promise.reject(new Error(message));
  }
);

export default api;
