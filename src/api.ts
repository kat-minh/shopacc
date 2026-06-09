import axios from "axios";
import { useAuthStore } from "./store/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const apiInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to attach JWT token to headers dynamically
apiInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("haina_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle API response errors and extract data
apiInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    let errorMessage = "Đã xảy ra lỗi hệ thống!";
    
    if (error.response) {
      const { status, data } = error.response;
      
      // If 401 Unauthorized (expired or invalid token), logout user automatically
      // EXCEPT for login attempts where we want to display the error message.
      if (status === 401 && !error.config?.url?.includes("auth/login")) {
        localStorage.removeItem("haina_token");
        useAuthStore.getState().logout();
      }
      
      errorMessage = data?.message || data?.title || errorMessage;
    }
    return Promise.reject(new Error(errorMessage));
  }
);

export const api = {
  get: <T>(endpoint: string, config?: any): Promise<T> =>
    apiInstance.get<any, T>(endpoint, config),

  post: <T>(endpoint: string, body?: any, config?: any): Promise<T> =>
    apiInstance.post<any, T>(endpoint, body, config),

  put: <T>(endpoint: string, body?: any, config?: any): Promise<T> =>
    apiInstance.put<any, T>(endpoint, body, config),

  delete: <T>(endpoint: string, config?: any): Promise<T> =>
    apiInstance.delete<any, T>(endpoint, config),
};

// ===== Upload ảnh lên BizFly Cloud (flow presigned URL) =====

/** Các định dạng ảnh backend chấp nhận (khớp StorageController). */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
/** Dung lượng ảnh tối đa: 5MB (khớp giới hạn backend khuyến nghị). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Kết quả xin presigned URL từ GET /api/storage/presigned-url. */
interface PresignedUploadDto {
  presignedUrl: string;
  key: string;
  fileUrl: string;
  contentType: string;
  uploadMethod: string;
  requiredHeaders: string[];
  expiresInSeconds: number;
  instructions: string;
}

/** File có phải ảnh upload được lên cloud không (để phân biệt với video...). */
export const isUploadableImage = (file: File): boolean =>
  ALLOWED_IMAGE_TYPES.includes(file.type);

/**
 * Upload ảnh lên BizFly Cloud theo flow presigned URL của backend:
 *  1) Xin presigned PUT URL (kèm token qua interceptor sẵn có).
 *  2) PUT raw binary ảnh thẳng lên cloud bằng axios "trần" (KHÔNG dùng apiInstance
 *     để tránh gắn header Authorization/JSON không nằm trong chữ ký).
 *  3) Trả về fileUrl công khai để lưu làm ảnh sản phẩm.
 */
export const uploadImage = async (file: File, folder = "general"): Promise<string> => {
  if (!isUploadableImage(file)) {
    throw new Error("Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPEG, PNG, WEBP, GIF.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Ảnh vượt quá dung lượng tối đa 5MB.");
  }

  const presigned = await api.get<PresignedUploadDto>("/storage/presigned-url", {
    params: { contentType: file.type, fileName: file.name, folder },
  });

  await axios.put(presigned.presignedUrl, file, {
    headers: { "Content-Type": presigned.contentType },
  });

  return presigned.fileUrl;
};
