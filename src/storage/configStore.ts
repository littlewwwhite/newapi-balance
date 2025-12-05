import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import type { UserConfig } from "../types";

export interface ConfigStore {
  readAllConfigs(): Promise<UserConfig[]>;
  readSelectedIndex(): Promise<number>;
  saveSelectedIndex(index: number): Promise<void>;
  saveConfig(config: UserConfig): Promise<void>;
  getConfigPath(): string;
}

function resolveConfigPath(): string {
  return path.join(os.homedir(), ".newapi-balances", "config.json");
}

export class FileConfigStore implements ConfigStore {
  private configPath = resolveConfigPath();

  getConfigPath(): string {
    return this.configPath;
  }

  async readAllConfigs(): Promise<UserConfig[]> {
    try {
      const raw = JSON.parse(await fs.readFile(this.configPath, "utf8"));
      const configs: UserConfig[] = Array.isArray(raw) ? raw : (raw.configs || [raw]);
      return configs.filter(c => c.baseUrl && c.accessToken && c.userId);
    } catch {
      return [];
    }
  }

  async readSelectedIndex(): Promise<number> {
    try {
      const raw = JSON.parse(await fs.readFile(this.configPath, "utf8"));
      return typeof raw.selectedIndex === "number" ? raw.selectedIndex : 0;
    } catch {
      return 0;
    }
  }

  async saveSelectedIndex(index: number): Promise<void> {
    try {
      const raw = JSON.parse(await fs.readFile(this.configPath, "utf8"));
      const data = Array.isArray(raw)
        ? { configs: raw, selectedIndex: index }
        : { ...raw, selectedIndex: index };
      await fs.writeFile(this.configPath, JSON.stringify(data, null, 2));
    } catch {
      // 读取失败说明文件不存在，直接忽略。
    }
  }

  async saveConfig(config: UserConfig): Promise<void> {
    const dir = path.dirname(this.configPath);
    await fs.mkdir(dir, { recursive: true });

    let configs: UserConfig[] = [];
    let selectedIndex = 0;
    try {
      const raw = JSON.parse(await fs.readFile(this.configPath, "utf8"));
      configs = Array.isArray(raw) ? raw : (raw.configs || (raw.baseUrl ? [raw] : []));
      selectedIndex = raw.selectedIndex || 0;
    } catch {
      // ignore
    }

    configs.push(config);
    await fs.writeFile(this.configPath, JSON.stringify({ configs, selectedIndex }, null, 2));
  }
}

export const configStore = new FileConfigStore();
