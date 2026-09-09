import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  BrainCircuit,
  Settings,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { cn } from './lib/utils';
import { suggestEngine } from './core/SuggestEngine';
import { memoryStore } from './core/MemoryStore';
import { collectPageContext } from './core/ContextCollector';
import { providerRegistry } from './providers/BaseProvider';
import { OpenAICompatibleProvider } from './providers/OpenAICompatible';
import { GeminiProvider } from './providers/GeminiProvider';
import type { AnalysisResult, MemoryFact, Suggestion, ProviderId } from './core/types';

// Bootstrap providers (keys from localStorage or env later)
function bootstrapProviders() {
  const saved = localStorage.getItem('aether-suggest-providers');
  const keys = saved ? JSON.parse(saved) : {};

  providerRegistry.register(
    new OpenAICompatibleProvider({
      id: 'openai',
      name: 'OpenAI',
      apiKey: keys.openai || import.meta.env.VITE_OPENAI_API_KEY || '',
      model: 'gpt-4o-mini',
      enabled: true,
    })
  );
  providerRegistry.register(
    new OpenAICompatibleProvider({
      id: 'groq',
      name: 'Groq',
      apiKey: keys.groq || '',
      baseUrl: 'https://api.groq.com/openai/v1',
      model: 'llama-3.3-70b-versatile',
      enabled: true,
    })
  );
  providerRegistry.register(
    new OpenAICompatibleProvider({
      id: 'deepseek',
      name: 'DeepSeek',
      apiKey: keys.deepseek || '',
      baseUrl: 'https://api.deepseek.com',
      model: 'deepseek-chat',
      enabled: true,
    })
  );
  providerRegistry.register(
    new GeminiProvider({
      id: 'gemini',
      name: 'Google Gemini',
      apiKey: keys.gemini || import.meta.env.VITE_GEMINI_API_KEY || '',
      model: 'gemini-2.0-flash',
      enabled: true,
    })
  );

  // Prefer first ready
  const ready = providerRegistry.listReady();
  if (ready.length > 0) providerRegistry.setActive(ready[0].id);
}

bootstrapProviders();

export default function App() {
  const [open, setOpen] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [memories, setMemories] = useState<MemoryFact[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [activeProvider, setActiveProvider] = useState<ProviderId | null>(
    providerRegistry.getActive()?.id ?? null
  );

  const refreshMemories = useCallback(() => {
    setMemories(memoryStore.list());
  }, []);

  useEffect(() => {
    refreshMemories();
  }, [refreshMemories]);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const ctx = collectPageContext();
      const result = await suggestEngine.analyze(ctx, memories);
      setAnalysis(result);

      if (result.newMemories?.length) {
        memoryStore.addMany(result.newMemories, 'analysis');
        refreshMemories();
      }
    } catch (e: any) {
      setError(e.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const suggestions: Suggestion[] = suggestEngine.getQuickSuggestions(
    !!analysis,
    providerRegistry.listReady().length > 0
  );

  const handleSuggestion = (s: Suggestion) => {
    if (s.intent === 'analyze') runAnalysis();
    if (s.intent === 'explore') {
      // stay on memory view conceptually
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full glass-heavy glass-refract depth-5 flex items-center justify-center text-lg hover:scale-105 transition-transform"
        title="Open Aether Suggest"
      >
        <Sparkles className="w-5 h-5 text-white/80" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] pointer-events-none flex justify-end">
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        className={cn(
          'relative h-full w-full max-w-[400px] pointer-events-auto flex flex-col',
          'glass-heavy glass-refract glass-noise depth-5',
          focusMode && 'bg-black/90'
        )}
      >
        {/* Top bar */}
        <div className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            {analysis ? (
              <button
                onClick={() => setAnalysis(null)}
                className="p-1.5 rounded-md hover:bg-white/5 text-white/50 hover:text-white transition"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-white/5 text-white/50 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <span className="text-[11px] font-semibold tracking-[0.18em] text-white/90 uppercase">
              Aether Suggest
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border transition',
                focusMode
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'bg-white/[0.03] border-white/[0.08] text-white/50 hover:text-white'
              )}
            >
              {focusMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              Focus
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-white transition"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Settings panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/[0.06]"
            >
              <div className="p-4 space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">
                  Active Provider
                </p>
                <div className="space-y-1.5">
                  {providerRegistry.list().map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        if (p.isReady()) {
                          providerRegistry.setActive(p.id);
                          setActiveProvider(p.id);
                        }
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-[12px] transition',
                        activeProvider === p.id
                          ? 'glass-btn-primary text-white'
                          : 'glass-light text-white/60 hover:text-white'
                      )}
                    >
                      <span>{p.name}</span>
                      <span className="text-[9px] uppercase tracking-wider opacity-60">
                        {p.isReady() ? 'ready' : 'no key'}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-white/30 leading-relaxed">
                  Set keys via localStorage key <code className="text-white/50">aether-suggest-providers</code> or
                  VITE_*_API_KEY env vars. No provider is hardcoded.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary CTA */}
        <div className="px-4 py-4 shrink-0">
          <button
            onClick={runAnalysis}
            disabled={loading || providerRegistry.listReady().length === 0}
            className={cn(
              'w-full h-12 rounded-xl glass-btn-primary glass-refract flex items-center justify-center gap-3',
              'text-[13px] font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-white/70" />
            ) : (
              <Zap className="w-4 h-4 text-white/80" />
            )}
            <div className="flex flex-col items-start leading-tight">
              <span>Analyze Environment</span>
              <span className="text-[9px] font-normal text-white/40 tracking-tight">
                Predictive intent + conversion pass
              </span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-5 custom-scrollbar">
          {error && (
            <div className="glass-light rounded-xl p-3 flex gap-2 text-[12px] text-red-300/90">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick suggestions */}
          {!analysis && !loading && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 px-1">
                <BrainCircuit className="w-3.5 h-3.5 text-white/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">
                  Intent Layer
                </span>
              </div>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => handleSuggestion(s)}
                  className="w-full glass-light glass-refract rounded-xl p-3.5 text-left group hover:bg-white/[0.05] transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-white/90">{s.text}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition" />
                  </div>
                  <p className="text-[11px] text-white/40 mt-1 leading-snug">{s.reason}</p>
                </button>
              ))}
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass-light rounded-xl h-20" />
              ))}
            </div>
          )}

          {/* Analysis results */}
          {analysis && !loading && (
            <div className="space-y-5">
              {/* Score */}
              <div className="glass rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Score</p>
                  <p className="text-3xl font-semibold tracking-tightest text-white">
                    {analysis.score}
                    <span className="text-base text-white/40 font-normal">/100</span>
                  </p>
                </div>
                {analysis.summary && (
                  <p className="text-[12px] text-white/50 max-w-[55%] text-right leading-snug">
                    {analysis.summary}
                  </p>
                )}
              </div>

              {/* Critical */}
              {analysis.critical.length > 0 && (
                <Section title="Critical" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
                  {analysis.critical.map((item, i) => (
                    <IssueCard key={i} item={item} critical />
                  ))}
                </Section>
              )}

              {/* Improvements */}
              {analysis.improvements.length > 0 && (
                <Section title="Improvements">
                  {analysis.improvements.map((item, i) => (
                    <IssueCard key={i} item={item} />
                  ))}
                </Section>
              )}

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <Section title="Strengths" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                  <ul className="space-y-1.5">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="text-[12px] text-white/60 flex gap-2">
                        <span className="text-white/30">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Copy rewrites */}
              {analysis.copyRewrites.length > 0 && (
                <Section title="Copy Rewrites">
                  {analysis.copyRewrites.map((r, i) => (
                    <div key={i} className="glass-light rounded-xl p-3 space-y-1.5">
                      <p className="text-[11px] text-white/40 line-through">{r.original}</p>
                      <p className="text-[13px] text-white/90 font-medium">{r.suggested}</p>
                      <p className="text-[10px] text-white/35">{r.reason}</p>
                    </div>
                  ))}
                </Section>
              )}
            </div>
          )}

          {/* Memory strip */}
          {!focusMode && memories.length > 0 && (
            <div className="pt-2">
              <div className="flex items-center gap-2 px-1 mb-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">
                  Memory ({memories.length})
                </span>
              </div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {memories.slice(0, 8).map((m) => (
                  <div
                    key={m.id}
                    className="text-[11px] text-white/45 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                  >
                    <span className="text-white/25 uppercase text-[9px] tracking-wider mr-1.5">
                      {m.category}
                    </span>
                    {m.content}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.aside>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        {icon && <span className="text-white/40">{icon}</span>}
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{title}</span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function IssueCard({
  item,
  critical,
}: {
  item: { issue: string; impact: string; fix: string; severity?: string };
  critical?: boolean;
}) {
  return (
    <div
      className={cn(
        'glass-light rounded-xl p-3.5 space-y-1.5',
        critical && 'border-white/15'
      )}
    >
      <p className="text-[13px] font-medium text-white/90">{item.issue}</p>
      <p className="text-[11px] text-white/45 leading-snug">{item.impact}</p>
      <p className="text-[11px] text-white/60">
        <span className="text-white/30">Fix → </span>
        {item.fix}
      </p>
    </div>
  );
}
