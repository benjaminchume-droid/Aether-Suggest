import type {
  AnalysisResult,
  MemoryFact,
  PageContext,
  Suggestion,
  ChatMessage,
} from './types';
import { providerRegistry } from '../providers/BaseProvider';

const ANALYSIS_SYSTEM = `You are Aether Suggest — a high-precision Conversion Rate Optimizer, UX strategist, and predictive intent engine for desktop/web environments.

Rules:
- Be brutally honest but precise. Prioritize business impact and friction reduction.
- Use psychology (cognitive load, trust, F-pattern, Hick's law, etc.).
- Output ONLY valid JSON matching the schema. No markdown, no commentary.

Schema:
{
  "score": number (0-100),
  "critical": [{ "issue": string, "impact": string, "fix": string, "severity": "critical"|"high"|"medium"|"low" }],
  "improvements": [{ "issue": string, "impact": string, "fix": string, "severity": string }],
  "strengths": [string],
  "copyRewrites": [{ "original": string, "suggested": string, "reason": string }],
  "newMemories": [{ "category": "User Preference"|"Design Pattern"|"Website Insight"|"Conversion Insight"|"Behavioral Pattern"|"Workflow Habit"|"General", "content": string }],
  "summary": string,
  "intentPredictions": [string]
}`;

export class SuggestEngine {
  async analyze(
    context: PageContext,
    memories: MemoryFact[] = []
  ): Promise<AnalysisResult> {
    const provider = providerRegistry.getActive();
    if (!provider || !provider.isReady()) {
      throw new Error('No AI provider is ready. Configure an API key in settings.');
    }

    const memoryBlock =
      memories.length > 0
        ? memories.map((m) => `[${m.category}] ${m.content}`).join('\n')
        : 'No prior memory.';

    const userContent = `USER MEMORY / CONTEXT:
${memoryBlock}

PAGE CONTEXT TO ANALYZE:
URL: ${context.url}
Title: ${context.title}
Headlines: ${JSON.stringify(context.headlines)}
CTAs / Buttons: ${JSON.stringify(context.ctas)}
Meta: ${context.metaDescription || 'n/a'}
Layout hints: ${context.layoutHints || 'n/a'}
Text sample: ${context.textSample?.slice(0, 1200) || 'n/a'}

Produce the full analysis JSON now.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: ANALYSIS_SYSTEM },
      { role: 'user', content: userContent },
    ];

    const response = await provider.chat(messages, { temperature: 0.35 });

    let parsed: AnalysisResult;
    try {
      // Clean possible markdown fences if a provider ignores response_format
      const cleaned = response.text.replace(/```json\n?|```/g, '').trim();
      parsed = JSON.parse(cleaned) as AnalysisResult;
    } catch (e) {
      console.error('Failed to parse analysis JSON', response.text);
      throw new Error('AI returned invalid analysis format. Try another provider or retry.');
    }

    // Normalize
    parsed.score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    parsed.critical = parsed.critical || [];
    parsed.improvements = parsed.improvements || [];
    parsed.strengths = parsed.strengths || [];
    parsed.copyRewrites = parsed.copyRewrites || [];
    parsed.newMemories = parsed.newMemories || [];
    parsed.intentPredictions = parsed.intentPredictions || [];

    return parsed;
  }

  /** Quick predictive suggestions without full analysis */
  getQuickSuggestions(hasAnalysis: boolean, hasUser: boolean): Suggestion[] {
    if (!hasUser) {
      return [
        {
          id: 'auth',
          text: 'Connect a provider',
          reason: 'Add an API key to unlock the full suggestion engine.',
          intent: 'act',
        },
      ];
    }
    if (!hasAnalysis) {
      return [
        {
          id: 'analyze',
          text: 'Analyze current context',
          reason: 'Extract conversion leaks, UX friction and intent signals from the active page or environment.',
          intent: 'analyze',
        },
        {
          id: 'memory',
          text: 'Review memory',
          reason: 'Surface persistent preferences and past insights.',
          intent: 'explore',
        },
      ];
    }
    return [
      {
        id: 'copy',
        text: 'Refine conversion copy',
        reason: 'Improve headlines and CTAs based on the latest analysis.',
        intent: 'edit',
      },
      {
        id: 'friction',
        text: 'Attack layout friction',
        reason: 'Reduce cognitive load and scanning cost.',
        intent: 'optimize',
      },
      {
        id: 'reanalyze',
        text: 'Re-analyze',
        reason: 'Run a fresh pass with updated memory.',
        intent: 'analyze',
      },
    ];
  }
}

export const suggestEngine = new SuggestEngine();
