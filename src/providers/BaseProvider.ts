import type { ChatMessage, ProviderConfig, ProviderResponse, ProviderId } from '../core/types';

export abstract class BaseProvider {
  abstract readonly id: ProviderId;
  abstract readonly name: string;

  constructor(protected config: ProviderConfig) {}

  abstract isReady(): boolean;

  abstract chat(messages: ChatMessage[], options?: { model?: string; temperature?: number }): Promise<ProviderResponse>;

  getConfig(): ProviderConfig {
    return this.config;
  }

  updateConfig(partial: Partial<ProviderConfig>) {
    this.config = { ...this.config, ...partial };
  }
}

export class ProviderRegistry {
  private providers = new Map<ProviderId, BaseProvider>();
  private activeId: ProviderId | null = null;

  register(provider: BaseProvider) {
    this.providers.set(provider.id, provider);
    if (!this.activeId && provider.isReady()) {
      this.activeId = provider.id;
    }
  }

  setActive(id: ProviderId) {
    if (!this.providers.has(id)) throw new Error(`Provider ${id} not registered`);
    this.activeId = id;
  }

  getActive(): BaseProvider | null {
    if (!this.activeId) return null;
    return this.providers.get(this.activeId) ?? null;
  }

  get(id: ProviderId): BaseProvider | undefined {
    return this.providers.get(id);
  }

  list(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  listReady(): BaseProvider[] {
    return this.list().filter((p) => p.isReady());
  }
}

export const providerRegistry = new ProviderRegistry();
