/* eslint-disable @typescript-eslint/no-explicit-any */
// Ambient type definitions for web workspace dependencies

declare module 'axios' {
  interface AxiosRequestConfig {
    headers?: any;
    [key: string]: any;
  }
  interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: any;
    config: AxiosRequestConfig;
    request?: any;
  }
  interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<AxiosResponse>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    interceptors: {
      request: { use(onFulfilled?: any, onRejected?: any): number };
      response: { use(onFulfilled?: any, onRejected?: any): number };
    };
  }
  const axios: AxiosInstance & {
    create(config?: AxiosRequestConfig): AxiosInstance;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  };
  export default axios;
}

declare module 'socket.io-client' {
  export interface Socket {
    id: string;
    connected: boolean;
    emit(event: string, ...args: any[]): this;
    on(event: string, fn: (...args: any[]) => void): this;
    off(event?: string, fn?: (...args: any[]) => void): this;
    disconnect(): this;
    connect(): this;
  }
  export function io(uri?: string, opts?: any): Socket;
}

declare module 'lucide-react';
