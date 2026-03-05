import { createClient } from "@/lib/supabase/server";

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export class OpenRouterService {
  private static keyLocks = new Map<string, boolean>();

  private static MAX_RETRIES = 3;
  private static BASE_DELAY = 500;
  private static TIMEOUT = 30000;

  private static sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  private static lockKey(id: string) {
    if (this.keyLocks.get(id)) return false;
    this.keyLocks.set(id, true);
    return true;
  }

  private static unlockKey(id: string) {
    this.keyLocks.delete(id);
  }

  static async getAvailableKeys() {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("openrouter_keys")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("limit_remaining", { ascending: false });

    if (error) throw error;
    if (!data?.length) throw new Error("No active API keys");

    return data;
  }

  private static async fetchWithTimeout(url: string, options: RequestInit) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.TIMEOUT);

    try {
      return await fetch(url, {
        ...options,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  static async createChatCompletion(
    messages: Message[],
    model = "qwen/qwen3-next-80b-a3b-instruct",
  ) {
    const keys = await this.getAvailableKeys();
    let lastError: any;

    for (const key of keys) {
      if (key.limit_remaining !== null && key.limit_remaining <= 0) {
        continue;
      }

      if (!this.lockKey(key.id)) continue;

      try {
        for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
          try {
            const res = await this.fetchWithTimeout(
              "https://openrouter.ai/api/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${key.key_value}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model,
                  messages,
                }),
              },
            );

            if (!res.ok) {
              if (res.status === 402) {
                const supabase = await createClient();
                await supabase
                  .from("openrouter_keys")
                  .update({ is_active: false })
                  .eq("id", key.id);
              }

              if (res.status === 429) {
                await this.sleep(this.BASE_DELAY * Math.pow(2, attempt));
                continue;
              }

              throw new Error(`OpenRouter error ${res.status}`);
            }

            const data = await res.json();
            return data.choices[0].message.content;
          } catch (err) {
            lastError = err;

            if (attempt === this.MAX_RETRIES - 1) throw err;

            await this.sleep(this.BASE_DELAY * Math.pow(2, attempt));
          }
        }
      } finally {
        this.unlockKey(key.id);
      }
    }

    throw new Error(`All keys failed: ${lastError}`);
  }

  static async createEmbeddingsBatch(
    inputs: string[],
    model = "baai/bge-m3",
  ): Promise<number[][]> {
    const keys = await this.getAvailableKeys();
    let lastError: any;

    for (const key of keys) {
      if (!this.lockKey(key.id)) continue;

      try {
        const res = await this.fetchWithTimeout(
          "https://openrouter.ai/api/v1/embeddings",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key.key_value}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              input: inputs,
            }),
          },
        );

        if (!res.ok) throw new Error("Embedding request failed");

        const json = await res.json();

        return json.data.map((x: any) => x.embedding);
      } catch (err) {
        lastError = err;
      } finally {
        this.unlockKey(key.id);
      }
    }

    throw new Error(`Embedding failed: ${lastError}`);
  }
}
