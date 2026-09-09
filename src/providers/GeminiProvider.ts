import { GoogleGenAI } from '@google/genai';
import { BaseProvider } from './BaseProvider';
import type { ChatMessage, ProviderConfig, ProviderResponse } from '../core/types';

export class GeminiProvider extends BaseProvider {
  readonly id = 'gemini' as const;
  readonly name = 'Google Gemini';
  private client: GoogleGenAI | null = null;

  constructor(config: ProviderConfig) {
    super(config);
    this.initClient();
  }

  private initClient() {
    if (!this.config.apiKey) {
      this.client = null;
      return;
    }
    this.client = new GoogleGenAI({ apiKey: this.config.apiKey });
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
    if (!this.client) throw new Error('Gemini is not configured (missing API key)');

    const model = options.model || this.config.model || 'gemini-2.0-flash';

    // Convert messages: system + user history into Gemini format
    const system = messages.find((m) => m.role === 'system')?.content ?? '';
    const contents = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const response = await this.client.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction: system || undefined,
        temperature: options.temperature ?? 0.4,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text ?? '';
    return {
      text,
      model,
    };
  }
}
