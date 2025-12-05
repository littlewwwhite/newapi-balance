import * as vscode from "vscode";
import type { StatusClient } from "../api/client";
import type { ConfigStore } from "../storage/configStore";
import { StatusBarPresenter } from "../ui/statusBar";
import type { UserConfig, UserStatus } from "../types";

export class StatusController {
  private lastRemaining: number | undefined;
  private flashTimeout: NodeJS.Timeout | undefined;
  private refreshInterval: NodeJS.Timeout | undefined;
  private latestStatus: UserStatus | null = null;
  private currentConfig: UserConfig | null = null;

  constructor(
    private readonly store: ConfigStore,
    private readonly client: StatusClient,
    private readonly presenter: StatusBarPresenter
  ) {}

  async initialize(): Promise<void> {
    await this.refreshStatus();
    this.refreshInterval = setInterval(() => void this.refreshStatus(), 60 * 1000);
  }

  dispose(): void {
    if (this.refreshInterval) clearInterval(this.refreshInterval);
    if (this.flashTimeout) clearTimeout(this.flashTimeout);
  }

  async showMenu(): Promise<void> {
    const configs = await this.store.readAllConfigs();
    if (!configs.length) {
      await this.addNewConfig();
      return;
    }

    const items: vscode.QuickPickItem[] = [
      { label: "$(refresh) 刷新", description: "立即刷新状态" },
      { label: "$(add) 添加配置", description: "添加新的 API 配置" },
    ];

    if (configs.length > 1) {
      items.push({ label: "$(list-selection) 切换配置", description: "选择其他 API 配置" });
    }

    if (this.latestStatus && this.currentConfig) {
      items.push({
        label: "$(info) 查看详情",
        description: `${this.currentConfig.name}: $${this.latestStatus.remaining.toFixed(2)}`,
      });
    }

    const pick = await vscode.window.showQuickPick(items, { placeHolder: "选择操作" });
    if (!pick) return;

    if (pick.label.includes("刷新")) {
      await this.refreshStatus();
    } else if (pick.label.includes("添加")) {
      await this.addNewConfig();
    } else if (pick.label.includes("切换")) {
      await this.switchConfig(configs);
    } else if (pick.label.includes("详情") && this.latestStatus && this.currentConfig) {
      vscode.window.showInformationMessage(
        `${this.currentConfig.name}\n套餐: ${this.latestStatus.planName}\n已用: $${this.latestStatus.used.toFixed(
          2
        )}\n剩余: $${this.latestStatus.remaining.toFixed(2)}\n总额: $${this.latestStatus.total.toFixed(2)}`,
        { modal: true }
      );
    }
  }

  async refresh(): Promise<void> {
    await this.refreshStatus();
  }

  private async addNewConfig(): Promise<void> {
    const form = { name: "", baseUrl: "", accessToken: "", userId: "" };
    const fields = [
      { key: "name", label: "配置名称", placeholder: "例如: 我的API" },
      { key: "baseUrl", label: "供应商地址", placeholder: "例如: https://api.example.com" },
      { key: "accessToken", label: "Access Token", placeholder: "Bearer Token" },
      { key: "userId", label: "User ID", placeholder: "用户ID" },
    ] as const;

    while (true) {
      const items = fields.map(f => ({
        label: `$(edit) ${f.label}`,
        description: form[f.key] || "(未填写)",
        field: f,
      }));
      const allFilled = form.name && form.baseUrl && form.accessToken && form.userId;
      items.push({ label: allFilled ? "$(check) 保存配置" : "$(circle-slash) 取消", description: "", field: null as any });

      const pick = await vscode.window.showQuickPick(items, { placeHolder: "填写配置信息（点击字段编辑）", ignoreFocusOut: true });
      if (!pick) return;

      if (!pick.field) {
        if (allFilled) {
          await this.store.saveConfig(form);
          vscode.window.showInformationMessage("配置已保存");
          await this.refreshStatus();
        }
        return;
      }

      const value = await vscode.window.showInputBox({
        prompt: pick.field.label,
        placeHolder: pick.field.placeholder,
        value: form[pick.field.key],
        password: pick.field.key === "accessToken",
        ignoreFocusOut: true,
      });
      if (value !== undefined) {
        form[pick.field.key] = value;
      }
    }
  }

  private async switchConfig(configs: UserConfig[]): Promise<void> {
    const picks = configs.map((c, i) => ({ label: c.name || `配置 ${i + 1}`, index: i }));
    const pick = await vscode.window.showQuickPick(picks, { placeHolder: "选择配置" });
    if (pick) {
      await this.store.saveSelectedIndex(pick.index);
      await this.refreshStatus();
    }
  }

  private async refreshStatus(): Promise<void> {
    try {
      const configs = await this.store.readAllConfigs();
      if (!configs.length) {
        this.resetState();
        this.presenter.showNoConfig();
        return;
      }

      const idx = Math.min(await this.store.readSelectedIndex(), configs.length - 1);
      this.currentConfig = configs[idx];
      const status = await this.client.fetchStatus(this.currentConfig);
      this.latestStatus = status;

      this.applyFlashOrRender(status);
    } catch (err) {
      this.resetState();
      this.presenter.showError((err as Error)?.message ?? "未知错误");
    }
  }

  private applyFlashOrRender(status: UserStatus): void {
    const targetColor = this.presenter.backgroundFor(status);
    const changed = this.lastRemaining !== undefined && Math.abs(status.remaining - this.lastRemaining) > 1e-6;

    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
      this.flashTimeout = undefined;
    }

    if (changed) {
      this.presenter.showStatus(this.currentConfig!, status, new vscode.ThemeColor("statusBarItem.warningBackground"));
      this.flashTimeout = setTimeout(() => {
        this.presenter.showStatus(this.currentConfig!, status, targetColor);
        this.flashTimeout = undefined;
      }, 600);
    } else {
      this.presenter.showStatus(this.currentConfig!, status, targetColor);
    }

    this.lastRemaining = status.remaining;
  }

  private resetState(): void {
    if (this.flashTimeout) {
      clearTimeout(this.flashTimeout);
      this.flashTimeout = undefined;
    }
    this.presenter.clearBackground();
    this.lastRemaining = undefined;
    this.latestStatus = null;
    this.currentConfig = null;
  }
}
