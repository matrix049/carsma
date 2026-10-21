/**
 * Gemini client with automatic model fallback (free tier).
 *
 * Free-tier Gemini models are often overloaded (503) or rate-limited (429),
 * and individual model names get retired. So instead of one fixed model:
 *
 *  1. Candidates come from GEMINI_MODELS (comma-separated) or, by default,
 *     from the models this API key can actually use — every Gemini *Flash*
 *     text model, newest version first (so "3.9-flash" is picked up the day it
 *     appears), then the "-latest" aliases.
 *  2. Each request races the two healthiest models; whenever one fails,
 *     the next candidate starts, until one answers or the deadline passes.
 *  3. A model that fails is benched for a while (overloaded: ~90 s,
 *     rate-limited: 10 min, unknown/unsupported: 1 day), and models that
 *     answered quickly recently are tried first.
 */

const API = 'https://generativelanguage.googleapis.com/v1beta';

const ATTEMPT_TIMEOUT_MS = 14_000;
const DEFAULT_DEADLINE_MS = 26_000;
const PARALLEL = 2;
const DISCOVERY_TTL_MS = 6 * 60 * 60 * 1000;

/** Used if discovery fails (e.g. offline at boot). */
const FALLBACK_MODELS = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-flash-lite-latest'];

export interface GeminiContent {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export interface GenerateOptions {
  system: string;
  contents: GeminiContent[];
  /** Gemini response schema; when set the reply is JSON text. */
  schema?: Record<string, unknown>;
  temperature?: number;
  maxOutputTokens?: number;
  deadlineMs?: number;
}

export class GeminiUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiUnavailableError';
  }
}

class AttemptError extends Error {
  constructor(message: string, public benchMs: number) {
    super(message);
  }
}

interface Health {
  benchedUntil: number;
  /** Smoothed response time; undefined until the model has answered once. */
  avgMs?: number;
  /** false once the model rejected `thinkingConfig.thinkingLevel`. */
  thinkingLevel: boolean;
}

const health = new Map<string, Health>();
let discovered: { models: string[]; at: number } | null = null;

const apiKey = () => process.env.GEMINI_API_KEY?.trim() || '';

export function isGeminiConfigured(): boolean {
  return apiKey().length > 0;
}

function healthOf(model: string): Health {
  let h = health.get(model);
  if (!h) {
    h = { benchedUntil: 0, thinkingLevel: true };
    health.set(model, h);
  }
  return h;
}

/** "gemini-3.8-flash-lite" → [3.8, lite]. Higher version first, full Flash before Lite. */
function rank(name: string): number {
  const m = name.match(/^gemini-(\d+(?:\.\d+)?)-flash(-lite)?$/);
  if (!m) return name.endsWith('-latest') ? -1 : -2;
  return parseFloat(m[1]) * 10 - (m[2] ? 0.5 : 0);
}

async function discoverModels(): Promise<string[]> {
  const fromEnv = (process.env.GEMINI_MODELS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (fromEnv.length) return fromEnv;

  if (discovered && Date.now() - discovered.at < DISCOVERY_TTL_MS) return discovered.models;

  try {
    const res = await fetch(`${API}/models?pageSize=200`, { headers: { 'x-goog-api-key': apiKey() } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = (await res.json()) as { models?: { name: string; supportedGenerationMethods?: string[] }[] };
    const names = (data.models || [])
      .filter((m) => (m.supportedGenerationMethods || []).includes('generateContent'))
      .map((m) => m.name.replace(/^models\//, ''))
      // Plain text Flash models only: no Pro (slow, tiny free quota), TTS, image, live or tool variants.
      .filter((n) => /^gemini-(\d+(\.\d+)?-flash(-lite)?|flash(-lite)?-latest)$/.test(n));
    const models = names.sort((a, b) => rank(b) - rank(a));
    if (!models.length) throw new Error('no Flash models listed');
    discovered = { models, at: Date.now() };
    console.log('✓ Gemini models available:', models.join(', '));
    return models;
  } catch (err) {
    console.warn('⚠ Gemini model discovery failed, using fallback list:', (err as Error).message);
    discovered = { models: FALLBACK_MODELS, at: Date.now() - DISCOVERY_TTL_MS + 5 * 60 * 1000 };
    return FALLBACK_MODELS;
  }
}

/** Healthy models first; among them, recently fast ones first, then by version. */
function orderCandidates(models: string[]): string[] {
  const now = Date.now();
  const ready = models.filter((m) => healthOf(m).benchedUntil <= now);
  const pool = ready.length ? ready : [...models].sort((a, b) => healthOf(a).benchedUntil - healthOf(b).benchedUntil);
  return pool
    .map((m, i) => ({ m, i, avg: healthOf(m).avgMs }))
    .sort((a, b) => {
      if (a.avg !== undefined && b.avg !== undefined) return a.avg - b.avg;
      if (a.avg !== undefined) return a.avg < 8000 ? -1 : 1;
      if (b.avg !== undefined) return b.avg < 8000 ? 1 : -1;
      return a.i - b.i;
    })
    .map((x) => x.m);
}

async function callModel(model: string, opts: GenerateOptions, signal: AbortSignal): Promise<string> {
  const h = healthOf(model);
  const generationConfig: Record<string, unknown> = {
    temperature: opts.temperature ?? 0.4,
    // Thinking tokens count against this budget, so leave headroom.
    maxOutputTokens: opts.maxOutputTokens ?? 1024,
  };
  if (h.thinkingLevel) generationConfig.thinkingConfig = { thinkingLevel: 'low' };
  if (opts.schema) {
    generationConfig.responseMimeType = 'application/json';
    generationConfig.responseSchema = opts.schema;
  }

  const res = await fetch(`${API}/models/${model}:generateContent`, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey() },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: opts.system }] },
      contents: opts.contents,
      generationConfig,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 400 && /thinking/i.test(body) && h.thinkingLevel) {
      h.thinkingLevel = false; // retry this model once without the thinking setting
      return callModel(model, opts, signal);
    }
    const bench =
      res.status === 429 ? 10 * 60_000 : res.status === 404 || res.status === 400 || res.status === 403 ? 24 * 3600_000 : 90_000;
    throw new AttemptError(`${model}: HTTP ${res.status}`, bench);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] }; finishReason?: string }[];
  };
  const parts = data.candidates?.[0]?.content?.parts || [];
  const text = parts
    .filter((p) => !p.thought)
    .map((p) => p.text || '')
    .join('')
    .trim();
  if (!text) throw new AttemptError(`${model}: empty reply (${data.candidates?.[0]?.finishReason || 'no candidate'})`, 60_000);
  return text;
}

/**
 * Ask Gemini, falling back across free models until one answers.
 * Throws GeminiUnavailableError when none does before the deadline.
 */
export async function generate(opts: GenerateOptions): Promise<string> {
  if (!isGeminiConfigured()) throw new GeminiUnavailableError('GEMINI_API_KEY is not set');

  const queue = orderCandidates(await discoverModels());
  const deadline = Date.now() + (opts.deadlineMs ?? DEFAULT_DEADLINE_MS);
  const errors: string[] = [];

  return new Promise<string>((resolve, reject) => {
    let inFlight = 0;
    let settled = false;
    const controllers = new Set<AbortController>();

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      controllers.forEach((c) => c.abort());
      fn();
    };

    const launchNext = () => {
      while (!settled && inFlight < PARALLEL && queue.length && Date.now() < deadline) {
        const model = queue.shift()!;
        const ctrl = new AbortController();
        controllers.add(ctrl);
        const timer = setTimeout(() => ctrl.abort(), Math.min(ATTEMPT_TIMEOUT_MS, deadline - Date.now()));
        const started = Date.now();
        inFlight++;

        callModel(model, opts, ctrl.signal)
          .then((text) => {
            const h = healthOf(model);
            const ms = Date.now() - started;
            h.avgMs = h.avgMs === undefined ? ms : h.avgMs * 0.6 + ms * 0.4;
            finish(() => resolve(text));
          })
          .catch((err: unknown) => {
            if (settled) return;
            const h = healthOf(model);
            const aborted = (err as Error)?.name === 'AbortError';
            const bench = err instanceof AttemptError ? err.benchMs : aborted ? 90_000 : 60_000;
            h.benchedUntil = Date.now() + bench;
            if (aborted) h.avgMs = Math.max(h.avgMs ?? 0, ATTEMPT_TIMEOUT_MS);
            errors.push(aborted ? `${model}: timeout` : (err as Error).message);
          })
          .finally(() => {
            clearTimeout(timer);
            controllers.delete(ctrl);
            inFlight--;
            if (settled) return;
            if (inFlight === 0 && (!queue.length || Date.now() >= deadline)) {
              finish(() => reject(new GeminiUnavailableError(errors.join('; ') || 'no model available')));
            } else {
              launchNext();
            }
          });
      }
    };

    launchNext();
    if (inFlight === 0) finish(() => reject(new GeminiUnavailableError('no model available')));
  });
}
