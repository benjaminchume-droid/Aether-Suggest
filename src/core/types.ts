/**
 * Aether Suggest — Core Types
 */

export type MemoryCategory =
  | 'User Preference'
  | 'Design Pattern'
  | 'Website Insight'
  | 'Conversion Insight'
  | 'Behavioral Pattern'
  | 'Workflow Habit'
  | 'General';

export interface MemoryFact {
  id: string;
  category: MemoryCategory;
  content: string;
  updatedAt: number;
  source?: string;
}

export interface IssueItem {
  issue: string;
  impact: string;
  fix: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

export interface CopyRewrite {
  original: string;
  suggested: string;
  reason: string;
}

export interface AnalysisResult {
  score: number; // 0-100
  critical: IssueItem[];
  improvements: IssueItem[];
  strengths: string[];
  copyRewrites: CopyRewrite[];
  newMemories?: Array<{ category: MemoryCategory; content: string }>;
  summary?: string;
  intentPredictions?: string[];
}

export interface PageContext {
  url: string;
  title: string;
  headlines: string[];
  ctas: string[];
  metaDescription?: string;
  textSample?: string;
  layoutHints?: string;
  viewport?: { width: number; height: number };
  raw?: Record<string, unknown>;
}

export interface Suggestion {
  id: string;
  text: string;
  reason: string;
  intent: 'optimize' | 'edit' | 'explore' | 'act' | 'analyze';
  confidence?: number;
}

export type ProviderId = 'openai' | 'anthropic' | 'gemini' | 'groq' | 'deepseek' | 'custom';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  enabled: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ProviderResponse {
  text: string;
  model?: string;
  usage?: { promptTokens?: number; completionTokens?: number };
}
