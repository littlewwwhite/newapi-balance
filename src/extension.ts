import * as vscode from "vscode";
import { apiClient } from "./api/client";
import { StatusController } from "./status/statusController";
import { configStore } from "./storage/configStore";
import { StatusBarPresenter } from "./ui/statusBar";

let controller: StatusController | null = null;

export function activate(context: vscode.ExtensionContext) {
  const statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusItem.name = "newapi-balances";
  statusItem.command = "newapi-balances.menu";
  statusItem.show();

  const presenter = new StatusBarPresenter(statusItem);
  controller = new StatusController(configStore, apiClient, presenter);

  const menuCmd = vscode.commands.registerCommand("newapi-balances.menu", () => controller?.showMenu());
  const refreshCmd = vscode.commands.registerCommand("newapi-balances.refresh", () => controller?.refresh());

  context.subscriptions.push(statusItem, menuCmd, refreshCmd, { dispose: () => controller?.dispose() });

  controller.initialize().catch(err => {
    controller?.dispose();
    statusItem.text = "$(balance-card) $—";
    statusItem.tooltip = new vscode.MarkdownString(`初始化失败：${(err as Error)?.message ?? "未知错误"}`);
    statusItem.tooltip.isTrusted = true;
  });
}

export function deactivate() {
  controller?.dispose();
}
