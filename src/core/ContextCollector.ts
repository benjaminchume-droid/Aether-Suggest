import type { PageContext } from './types';

/**
 * Collects real page context when running as extension content script
 * or when the app is loaded in a page context.
 * Falls back gracefully for standalone demo mode.
 */
export function collectPageContext(): PageContext {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return {
      url: 'about:blank',
      title: 'Aether Suggest',
      headlines: [],
      ctas: [],
      layoutHints: 'standalone',
    };
  }

  const headlines = Array.from(document.querySelectorAll('h1, h2, h3'))
    .map((el) => (el.textContent || '').trim())
    .filter(Boolean)
    .slice(0, 12);

  const ctas = Array.from(
    document.querySelectorAll(
      'button, a[role="button"], a.btn, a.button, [class*="btn"], [class*="cta"], input[type="submit"]'
    )
  )
    .map((el) => (el.textContent || (el as HTMLInputElement).value || '').trim())
    .filter((t) => t.length > 0 && t.length < 80)
    .slice(0, 15);

  const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;

  // Lightweight text sample from main content areas
  const main =
    document.querySelector('main') ||
    document.querySelector('article') ||
    document.querySelector('[role="main"]') ||
    document.body;
  const textSample = (main?.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 1800);

  // Crude layout hints
  const hasHero = !!document.querySelector('[class*="hero"], section:first-of-type');
  const formCount = document.querySelectorAll('form').length;
  const navCount = document.querySelectorAll('nav, header').length;

  const layoutHints = [
    hasHero ? 'hero present' : null,
    formCount > 0 ? `${formCount} form(s)` : null,
    navCount > 0 ? 'navigation present' : null,
    window.innerWidth < 768 ? 'mobile viewport' : 'desktop viewport',
  ]
    .filter(Boolean)
    .join(', ');

  return {
    url: window.location.href,
    title: document.title || 'Untitled',
    headlines,
    ctas,
    metaDescription: meta?.content,
    textSample,
    layoutHints,
    viewport: { width: window.innerWidth, height: window.innerHeight },
  };
}
