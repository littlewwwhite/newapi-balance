import * as assert from "assert";
import { apiClient } from "../api/client";

suite("api.fetchUserStatus", () => {
  const origFetch = (globalThis as any).fetch;

  teardown(() => {
    (globalThis as any).fetch = origFetch;
  });

  test("sends correct headers and maps response", async () => {
    const config = {
      name: "Test",
      baseUrl: "https://example.com",
      accessToken: "test_token",
      userId: "123",
    };
    let captured: { url?: string; headers?: any } = {};

    (globalThis as any).fetch = async (url: string, init: any) => {
      captured.url = url;
      captured.headers = init?.headers;
      return {
        ok: true,
        status: 200,
        async json() {
          return {
            success: true,
            data: {
              group: "VIP",
              quota: 5000000,
              used_quota: 2500000,
            },
          };
        },
      } as any;
    };

    const status = await apiClient.fetchStatus(config as any);
    assert.strictEqual(captured.url, "https://example.com/api/user/self");
    assert.strictEqual(captured.headers?.["Authorization"], "Bearer test_token");
    assert.strictEqual(captured.headers?.["New-Api-User"], "123");
    assert.strictEqual(status.planName, "VIP");
    assert.strictEqual(status.remaining, 10);
    assert.strictEqual(status.used, 5);
    assert.strictEqual(status.total, 15);
  });

  test("throws when config incomplete", async () => {
    await assert.rejects(() => apiClient.fetchStatus({ name: "", baseUrl: "", accessToken: "", userId: "" } as any));
  });
});
