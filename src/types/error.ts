// 定义通用错误类型接口
export interface AppError extends Error {
  status?: number;
  code?: string;
  response?: {
    status?: number;
    data?: unknown;
  };
  data?: unknown;
  message: string;
} 