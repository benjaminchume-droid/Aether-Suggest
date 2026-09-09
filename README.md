# Aether Suggest

**Production-grade intelligent suggestion & predictive intent layer for computers.**

Monochrome liquid-glass UI with deep blur, refraction and layered depth.  
Multi-provider AI engine. Persistent local memory. Real page context analysis.  
**Not a demo.** Part of the Aether ecosystem.

---

## What it is

Aether Suggest is a predictive layer that sits between the user and any web/desktop surface. It:

- Analyzes the current page/environment for conversion friction, UX issues, and intent signals
- Surfaces smart next-step suggestions
- Maintains a persistent compressed memory of preferences, patterns and insights
- Works as a standalone web app **and** as a thin Chrome extension client

It is deliberately **not** locked to Gemini (or any single model). Providers are pluggable.

## Architecture (clean)

```
src/
├── core/
│   ├── SuggestEngine.ts      # Provider-agnostic analysis + intent
│   ├── ContextCollector.ts   # Real DOM context extraction
│   ├── MemoryStore.ts        # Local persistent soul-like memory
│   └── types.ts
├── providers/
│   ├── BaseProvider.ts       # Interface + registry
│   ├── OpenAICompatible.ts   # OpenAI / Groq / DeepSeek / any OpenAI-compatible
│   └── GeminiProvider.ts     # Optional Gemini path
└── App.tsx                   # Liquid glass UI surface
```

Future: **Aether-Suggest-Sources** repo will hold pluggable analysis scripts / web-source runners (similar to OmniHub Sources).

## Design language

- Pure monochrome (void blacks → pure whites)
- Heavy liquid glass: multi-layer blur, refraction simulation, specular edges, depth stacking
- No strong accent color by default
- Tight tracking, high-density information without visual noise

## Quick start

```bash
npm install
# Optional keys
# VITE_OPENAI_API_KEY=sk-...
# VITE_GEMINI_API_KEY=...

npm run dev
```

Or load as Chrome extension (load unpacked from `dist` after `npm run build`).

Keys can also live in `localStorage` under `aether-suggest-providers`:

```json
{
  "openai": "sk-...",
  "groq": "gsk-...",
  "gemini": "AIza...",
  "deepseek": "..."
}
```

## Relationship to OmniHub

OmniHub = Android multi-provider assistant + soul.  
Aether Suggest = computer-side predictive / conversion / UX intelligence layer.  
Shared concepts: memory, provider registry, extensible sources. Designed to connect later.

## Status

- Core engine: production-shaped
- UI: heavy monochrome liquid glass
- Providers: multi (OpenAI-compatible family + Gemini)
- Extension: thin client
- Sources marketplace: planned (`Aether-Suggest-Sources`)

Built to be continued, not thrown away.
