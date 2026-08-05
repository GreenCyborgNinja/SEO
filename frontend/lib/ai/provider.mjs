/**
 * Thin AI provider abstraction.
 *
 * Default is Google's Gemini free tier (API key from AI Studio, no credit card).
 * Ollama covers the fully offline case. Both are plain `fetch` calls — no SDK, so
 * nothing to keep up to date and swapping providers is a few lines.
 *
 * When no provider is configured, getProvider() returns null and callers fall
 * back to the deterministic templates in template.mjs. The shop is never
 * description-less and never requires an API key.
 */

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const GEMINI_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models'

const MAX_ATTEMPTS = 4
const BASE_DELAY_MS = 2000

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

/** Exponential backoff with jitter, honouring Retry-After when the API sends it. */
async function withRetry(label, fn) {
  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!error.retryable || attempt === MAX_ATTEMPTS) break
      const wait = error.retryAfterMs ?? BASE_DELAY_MS * 2 ** (attempt - 1) + Math.random() * 500
      console.warn(`  ! ${label} failed (${error.message}) — retrying in ${Math.round(wait / 1000)}s`)
      await sleep(wait)
    }
  }
  throw lastError
}

function httpError(status, body, retryAfterHeader) {
  const error = new Error(`HTTP ${status}: ${String(body).slice(0, 200)}`)
  // 429 = rate limit, 5xx = transient. Anything else is our bug, not theirs.
  error.retryable = status === 429 || status >= 500
  const retryAfter = Number(retryAfterHeader)
  if (Number.isFinite(retryAfter) && retryAfter > 0) error.retryAfterMs = retryAfter * 1000
  return error
}

function geminiProvider(apiKey) {
  return {
    name: `gemini:${GEMINI_MODEL}`,
    async generate(prompt, { json = false } = {}) {
      return withRetry('gemini', async () => {
        let response
        try {
          response = await fetch(`${GEMINI_ENDPOINT}/${GEMINI_MODEL}:generateContent`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 4096,
                ...(json ? { responseMimeType: 'application/json' } : {}),
              },
            }),
          })
        } catch (cause) {
          const error = new Error(`network error: ${cause.message}`)
          error.retryable = true
          throw error
        }

        if (!response.ok) {
          throw httpError(response.status, await response.text(), response.headers.get('retry-after'))
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text).join('') ?? ''
        if (!text.trim()) {
          const error = new Error('empty completion')
          error.retryable = true
          throw error
        }
        return text
      })
    },
  }
}

function ollamaProvider(baseUrl) {
  const model = process.env.OLLAMA_MODEL || 'llama3.2'
  return {
    name: `ollama:${model}`,
    async generate(prompt, { json = false } = {}) {
      return withRetry('ollama', async () => {
        let response
        try {
          response = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model,
              prompt,
              stream: false,
              ...(json ? { format: 'json' } : {}),
              options: { temperature: 0.6 },
            }),
          })
        } catch (cause) {
          const error = new Error(`network error: ${cause.message} (is Ollama running?)`)
          error.retryable = true
          throw error
        }

        if (!response.ok) throw httpError(response.status, await response.text())
        const data = await response.json()
        return data.response ?? ''
      })
    },
  }
}

/**
 * Resolves the provider from the environment:
 *   AI_PROVIDER=gemini|ollama|template  (default: auto-detect)
 * Auto-detect prefers Gemini when GEMINI_API_KEY is present, then Ollama when
 * OLLAMA_URL is set, otherwise returns null (→ template mode).
 */
export function getProvider() {
  const requested = (process.env.AI_PROVIDER || '').toLowerCase()
  const geminiKey = process.env.GEMINI_API_KEY?.trim()
  const ollamaUrl = process.env.OLLAMA_URL?.trim()

  if (requested === 'template') return null

  if (requested === 'gemini') {
    if (!geminiKey) {
      console.warn('[ai] AI_PROVIDER=gemini but GEMINI_API_KEY is missing — using templates.')
      return null
    }
    return geminiProvider(geminiKey)
  }

  if (requested === 'ollama') {
    return ollamaProvider(ollamaUrl || 'http://localhost:11434')
  }

  if (geminiKey) return geminiProvider(geminiKey)
  if (ollamaUrl) return ollamaProvider(ollamaUrl)
  return null
}
