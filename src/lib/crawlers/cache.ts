import * as fs from "fs/promises";
import * as path from "path";

export class FileCache {
  private cacheDir: string;

  constructor(cacheDirName = ".cache/crawlers") {
    this.cacheDir = path.resolve(process.cwd(), cacheDirName);
  }

  private async ensureDir() {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (err) {
      // Ignore existing dir error
    }
  }

  private getFilePath(key: string) {
    const safeKey = key.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    return path.join(this.cacheDir, `${safeKey}.json`);
  }

  async get<T>(key: string): Promise<T | null> {
    const filePath = this.getFilePath(key);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as T;
    } catch (err) {
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.ensureDir();
    const filePath = this.getFilePath(key);
    await fs.writeFile(filePath, JSON.stringify(value, null, 2), "utf-8");
  }
}
