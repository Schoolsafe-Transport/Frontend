export * from './auth';

export interface ServerHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
}
