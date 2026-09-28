export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  path: string;
  method: string;
  timestamp: string;
}