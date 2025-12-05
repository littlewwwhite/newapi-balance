# newapi Status（VS Code 扩展）

https://www.newapi.org

Repo: https://github.com/byebye-code/newapi-status-vscode-extension

一个轻量的插件，在 VS Code 右下角状态栏展示 newapi 订阅余额，支持手动刷新与定时自动刷新。

## 功能

- 状态栏显示：`剩余 $<sum>`，数值变化时短暂闪烁提示。
- Tooltip：按“活跃订阅”逐条显示：`[计划名] 当前/上限:$<cur>/$<limit> | 剩余重置:<n> | 总余额:$<cur + resetTimes*balanceLimit>`。
- 命令：`newapi-status.refresh`（命令面板：newapi: Refresh Balance）手动刷新。
- 自动刷新：每 1 分钟刷新一次。

## 数据来源

https://www.newapi.org

## 金额计算

- 主显示值：对所有“活跃订阅”累加 `currentBalances + resetTimes*balanceLimit`。
- Tooltip“总余额”：同上；`PAY_PER_USE` 订阅的重置次数视为 0。

## 配置（API Key）

扩展会自动从以下位置读取 Key：

- 环境变量：`key88`、`ANTHROPIC_AUTH_TOKEN`、`OPENAI_API_KEY`
- 配置文件：
  - `~/.codex/auth.json` 的 `OPENAI_API_KEY`
  - `~/.claude/settings.json` 的 `env.ANTHROPIC_AUTH_TOKEN`

未读取到 Key 时，状态栏显示 `剩余 $—`，Tooltip 提示“未配置 API Key”。
