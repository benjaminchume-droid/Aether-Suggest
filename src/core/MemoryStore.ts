import type { MemoryFact, MemoryCategory } from './types';

const STORAGE_KEY = 'aether-suggest-memories';

function generateId() {
  return `mem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export class MemoryStore {
  private facts: MemoryFact[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this.facts = JSON.parse(raw);
    } catch {
      this.facts = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.facts.slice(0, 100)));
    } catch (e) {
      console.warn('MemoryStore save failed', e);
    }
  }

  list(limit = 30): MemoryFact[] {
    return [...this.facts]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit);
  }

  add(category: MemoryCategory, content: string, source?: string): MemoryFact {
    // Deduplicate loosely
    const existing = this.facts.find(
      (f) => f.category === category && f.content.toLowerCase() === content.toLowerCase()
    );
    if (existing) {
      existing.updatedAt = Date.now();
      this.save();
      return existing;
    }

    const fact: MemoryFact = {
      id: generateId(),
      category,
      content,
      updatedAt: Date.now(),
      source,
    };
    this.facts.unshift(fact);
    this.save();
    return fact;
  }

  addMany(items: Array<{ category: MemoryCategory; content: string }>, source?: string) {
    items.forEach((i) => this.add(i.category, i.content, source));
  }

  remove(id: string) {
    this.facts = this.facts.filter((f) => f.id !== id);
    this.save();
  }

  clear() {
    this.facts = [];
    this.save();
  }
}

export const memoryStore = new MemoryStore();
