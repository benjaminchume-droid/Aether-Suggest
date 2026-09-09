import OpenAI from 'openai';
import { BaseProvider } from './BaseProvider';
import type { ChatMessage, ProviderConfig, ProviderResponse, ProviderId } from '../core/types';

export class OpenAICompatibleProvider extends BaseProvider {
  readonly id: ProviderId;
  readonly name: string;
  private client: OpenAI | null = null;

  constructor(config: ProviderConfig) {
    super(config);
    this.id = config.id;
    this.name = config.name;
    this.initClient();
  }

  private initClient() {
    if (!this.config.apiKey) {
      this.client = null;
      return;
    }
    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
      dangerouslyAllowBrowser: true, // intentional for client-side extension / local use
    });
  }

  isReady(): boolean {
    return !!this.config.apiKey && !!this.client;
  }

  updateConfig(partial: Partial<ProviderConfig>) {
    super.updateConfig(partial);
    this.initClient();
  }

  async chat(
    messages: ChatMessage[],
    options: { model?: string; temperature?: number } = {}
  ): Promise<ProviderResponse> {
    if (!this.client) throw new Error(`${this.name} is not configured (missing API key)`);

    const model = options.model || this.config.model || 'gpt-4o-mini';

    const response = await this.client.chat.completions.create({
      model,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: options.temperature ?? 0.4,
      response_format: { type: 'json_object' },
    });

    const text = response.choices[0]?.message?.content ?? '';
    return {
      text,
      model,
      usage: {
        promptTokens: response.usage?.prompt_tokens,
        completionTokens: response.usage?.completion_tokens,
      },
    };
  }
}
