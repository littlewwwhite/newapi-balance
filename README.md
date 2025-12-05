<div align="center">

# NewAPI Balances

[![VS Marketplace](https://img.shields.io/visual-studio-marketplace/v/zjding.newapi-balances?style=for-the-badge&logo=visualstudiocode&logoColor=white&label=VS%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=zjding.newapi-balances)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/zjding.newapi-balances?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=zjding.newapi-balances)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/zjding.newapi-balances?style=for-the-badge&logo=visualstudiocode&logoColor=white)](https://marketplace.visualstudio.com/items?itemName=zjding.newapi-balances)

[![License](https://img.shields.io/github/license/littlewwwhite/newapi-balance?style=for-the-badge)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/littlewwwhite/newapi-balance?style=for-the-badge&logo=github)](https://github.com/littlewwwhite/newapi-balance)
[![GitHub Issues](https://img.shields.io/github/issues/littlewwwhite/newapi-balance?style=for-the-badge&logo=github)](https://github.com/littlewwwhite/newapi-balance/issues)

**在 VS Code / Cursor 状态栏实时显示 NewAPI 账户余额，支持多账户切换和余额预警**

[📦 安装扩展](https://marketplace.visualstudio.com/items?itemName=zjding.newapi-balances) · [🐛 报告问题](https://github.com/littlewwwhite/newapi-balance/issues) · [⭐ Star 支持](https://github.com/littlewwwhite/newapi-balance)

</div>

---

> 借鉴了 [cc-switch](https://github.com/farion1231/cc-switch) 和 [88code](https://github.com/byebye-code/88code-status-vscode-extension) 的余额查询功能。

## 功能特性

| 功能 | 说明 |
|------|------|
| 状态栏显示 | 右下角显示 `[配置名称] $余额` |
| 余额预警 | 根据余额百分比自动变色（紫 > 蓝 > 黄 > 红） |
| 多账户支持 | 可配置多个 API 账户，随时切换 |
| 自动刷新 | 每分钟自动更新余额 |
| 手动刷新 | 点击状态栏可立即刷新 |

### 余额预警颜色

- 🟣 **紫色**：余额 > 75%
- 🔵 **蓝色**：余额 50-75%
- 🟡 **黄色**：余额 25-50%
- 🔴 **红色**：余额 ≤ 25%

## 安装

在 VS Code / Cursor 扩展市场搜索 `NewAPI Balances` 安装，或通过命令行：

```bash
code --install-extension zjding.newapi-balances
```

## 快速开始

### 1. 获取 API 信息

从 NewAPI 中转站获取以下信息：

![获取 Token](image/README/1764914623195.png)

### 2. 配置插件

点击状态栏，填写配置信息：

![配置插件](image/README/1764914681385.png)

![填写信息](image/README/1764914771014.png)

### 3. 完成

配置完成后，状态栏将显示余额信息：

![效果展示](image/README/1764914363293.png)
![详情展示](image/README/1764914829015.png)

## 使用方法

点击状态栏可进行以下操作：

- **刷新** - 立即获取最新余额
- **添加配置** - 添加新的 API 账户
- **切换配置** - 在多个账户间切换
- **查看详情** - 查看套餐、已用、剩余、总额等信息

## 命令

| 命令 | 说明 |
|------|------|
| `NewAPI Balances: Show Menu` | 打开操作菜单 |
| `NewAPI Balances: Refresh` | 刷新余额 |

## 配置文件

配置保存在 `~/.newapi-balances/config.json`：

```json
[
  {
    "name": "我的账户",
    "baseUrl": "https://api.example.com",
    "accessToken": "your-token",
    "userId": "your-user-id"
  }
]
```

## License

[MIT](LICENSE)
