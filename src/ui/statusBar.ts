import * as vscode from "vscode";
import type { UserConfig, UserStatus } from "../types";

export class StatusBarPresenter {
  constructor(private readonly item: vscode.StatusBarItem) {}

  showNoConfig(): void {
    this.clearBackground();
    this.item.text = "$(balance-card) 点击配置";
    this.item.tooltip = new vscode.MarkdownString("点击添加 API 配置");
    this.item.tooltip.isTrusted = true;
  }

  showStatus(config: UserConfig, status: UserStatus, background?: vscode.ThemeColor): void {
    this.item.text = `[${config.name}] $${status.remaining.toFixed(2)}`;
    this.item.tooltip = new vscode.MarkdownString(
      `${status.planName} | 已用: $${status.used.toFixed(2)} | 总额: $${status.total.toFixed(2)}`
    );
    this.item.tooltip.isTrusted = true;
    this.item.backgroundColor = background ?? this.backgroundFor(status);
  }

  showError(message: string): void {
    this.clearBackground();
    this.item.text = "$(balance-card) $—";
    this.item.tooltip = new vscode.MarkdownString(`刷新失败：${message}`);
    this.item.tooltip.isTrusted = true;
  }

  flashChange(targetColor: vscode.ThemeColor | undefined): NodeJS.Timeout {
    this.item.backgroundColor = new vscode.ThemeColor("statusBarItem.warningBackground");
    return setTimeout(() => {
      this.item.backgroundColor = targetColor;
    }, 600);
  }

  clearBackground(): void {
    this.item.backgroundColor = undefined;
  }

  setBackground(color: vscode.ThemeColor | undefined): void {
    this.item.backgroundColor = color;
  }

  backgroundFor(status: UserStatus): vscode.ThemeColor | undefined {
    const percent = status.total > 0 ? (status.remaining / status.total) * 100 : 100;
    if (percent <= 25) {
      return new vscode.ThemeColor("statusBarItem.errorBackground");
    }
    if (percent <= 50) {
      return new vscode.ThemeColor("statusBarItem.warningBackground");
    }
    if (percent <= 75) {
      return new vscode.ThemeColor("newapi.blueBackground");
    }
    return new vscode.ThemeColor("newapi.purpleBackground");
  }
}
