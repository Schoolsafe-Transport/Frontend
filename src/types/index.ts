export * from './auth';
export * from './transportation';

export interface ServerHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
}
