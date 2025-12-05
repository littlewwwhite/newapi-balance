import type { UserConfig, UserStatus } from "../types";

export interface StatusClient {
  fetchStatus(config: UserConfig): Promise<UserStatus>;
}

export class ApiClient implements StatusClient {
  async fetchStatus(config: UserConfig): Promise<UserStatus> {
    const { baseUrl, accessToken, userId } = config;
    if (!baseUrl || !accessToken || !userId) {
      throw new Error("配置不完整");
    }

    const ctrl = typeof globalThis.AbortController === "function"
      ? new globalThis.AbortController()
      : undefined;
    const timeout = setTimeout(() => ctrl?.abort(), 8000);

    try {
      const r = await fetch(`${baseUrl}/api/user/self`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "New-Api-User": userId,
        },
        signal: ctrl?.signal,
      });

      if (!r.ok) {
        throw new Error(`HTTP error: ${r.status}`);
      }

      const resp = await r.json();
      if (!resp.success || !resp.data) {
        throw new Error(resp.message || "查询失败");
      }

      const { group, quota, used_quota } = resp.data;
      return {
        planName: group || "默认套餐",
        remaining: quota / 500000,
        used: used_quota / 500000,
        total: (quota + used_quota) / 500000,
        unit: "USD",
      };
    } finally {
      clearTimeout(timeout);
    }
  }
}

export const apiClient = new ApiClient();
