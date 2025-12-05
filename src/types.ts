export interface UserConfig {
  name: string;
  baseUrl: string;
  accessToken: string;
  userId: string;
}

export interface UserStatus {
  planName: string;
  remaining: number;
  used: number;
  total: number;
  unit: string;
}
