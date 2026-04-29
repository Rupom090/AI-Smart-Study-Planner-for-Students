/**
 * puterAI.ts — Centralized Puter.js AI utility (v2)
 *
 * Improvements based on official Puter.js docs:
 *  1. Waits for window.puter CDN load before any call
 *  2. Forces auth sign-in if session expired
 *  3. Streaming support via puterChatStream()
 *  4. Puter filesystem helper for client-side file uploads
 *  5. Per-task model constants
 *  6. Auto-retry when a delegate rejects unsupported options (e.g., temperature)
 */

// ─── Model Constants ────────────────────────────────────────────────────────
export const MODELS = {
    /** Fast, general purpose — good for chat and solve */
    DEFAULT:   'gpt-5-nano',
    /** Best for long document analysis and grading */
    DOCUMENT:  'claude-sonnet-4',
    /** Fast, good for structured JSON output (flashcards) */
    JSON:      'gpt-5-nano',
    /** Vision: image analysis for Solve */
    VISION:    'gpt-5-nano',
    /** Web-search capable (OpenAI web-search supported) */
    WEBSEARCH: 'openai/gpt-5.2-chat',
} as const;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Normalises any error thrown by the Puter SDK into a human-readable message.
 * Specifically catches "Low Balance" / funding errors and explains what to do.
 */
function normalizePuterError(err: any): Error {
    const messageCandidates = [
        err?.message,
        err?.error?.message,
        err?.data?.message,
        err?.response?.data?.message,
        err?.response?.data?.error,
        err?.toString?.(),
    ]
        .filter((v: any) => typeof v === 'string' && v.trim().length > 0)
        .map((v: string) => v.trim());

    const primaryMessage = messageCandidates[0] ?? '';
    const raw: string = primaryMessage.toLowerCase();

    if (
        raw.includes('low balance') ||
        raw.includes('not enough funding') ||
        raw.includes('insufficient') ||
        raw.includes('upgrade') ||
        raw.includes('balance')
    ) {
        return new Error(
            'Your Puter AI credits have run out. ' +
            'Sign in with a different free Puter account at puter.com to get $0.50 in fresh credits, ' +
            'or upgrade your current account at puter.com/billing.'
        );
    }

    if (
        raw.includes('not signed in') ||
        raw.includes('unauthorized') ||
        raw.includes('forbidden') ||
        raw.includes('auth') ||
        raw.includes('login')
    ) {
        return new Error(
            'Puter authentication failed. Please sign out at puter.com, sign in again, then refresh this page.'
        );
    }

    if (primaryMessage && primaryMessage.toLowerCase() !== '[object object]') {
        return new Error(primaryMessage);
    }

    return new Error(
        'Puter returned an unknown error. If you recently switched Puter accounts, ' +
        'sign out at puter.com, sign in again, and refresh this page.'
    );
}

export function getUserFriendlyAiError(
    err: any,
    fallback = 'AI is temporarily unavailable. Please try again in a moment.'
): string {
    try {
        const normalized = normalizePuterError(err);
        const message = normalized?.message?.trim();
        if (message) {
            return message;
        }
    } catch {
    }

    if (typeof err === 'string' && err.trim()) {
        return err.trim();
    }

    if (typeof err?.message === 'string' && err.message.trim()) {
        return err.message.trim();
    }

    return fallback;
}

function isPuterBalanceError(err: any): boolean {
    const raw: string = (err?.message ?? err?.toString() ?? '').toLowerCase();
    return (
        raw.includes('low balance') ||
        raw.includes('not enough funding') ||
        raw.includes('insufficient') ||
        raw.includes('balance')
    );
}

function isUnsupportedTemperatureError(err: any): boolean {
    const raw = (
        err?.message ??
        err?.error?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        err?.toString?.() ??
        ''
    ).toString().toLowerCase();

    return raw.includes('unsupported value') && raw.includes('temperature');
}

function isAuthError(err: any): boolean {
    const raw = (
        err?.message ??
        err?.error?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        err?.toString?.() ??
        ''
    ).toString().toLowerCase();

    return (
        raw.includes('not signed in') ||
        raw.includes('unauthorized') ||
        raw.includes('forbidden') ||
        raw.includes('auth') ||
        raw.includes('login')
    );
}

function shouldTryFallbackModel(err: any): boolean {
    if (isAuthError(err) || isPuterBalanceError(err)) {
        return false;
    }

    const raw = (
        err?.message ??
        err?.error?.message ??
        err?.response?.data?.error ??
        err?.response?.data?.message ??
        err?.toString?.() ??
        ''
    ).toString().toLowerCase();

    return (
        raw.includes('no response received from ai') ||
        raw.includes('model') ||
        raw.includes('delegate') ||
        raw.includes('unsupported') ||
        raw.includes('unavailable') ||
        raw.includes('timeout') ||
        raw.includes('network')
    );
}

function getFallbackModels(preferredModel: string): string[] {
    const candidates = [preferredModel, MODELS.DEFAULT, 'gpt-5-nano'];
    return Array.from(new Set(candidates.filter((item) => typeof item === 'string' && item.trim().length > 0)));
}

/** Wait for window.puter CDN script to load (up to 8 s) */
async function waitForPuter(timeoutMs = 8000): Promise<any> {
    return new Promise((resolve, reject) => {
        if ((window as any).puter) {
            resolve((window as any).puter);
            return;
        }
        const start = Date.now();
        const iv = setInterval(() => {
            if ((window as any).puter) {
                clearInterval(iv);
                resolve((window as any).puter);
            } else if (Date.now() - start > timeoutMs) {
                clearInterval(iv);
                reject(new Error(
                    'Puter.js did not load. Check your internet connection and refresh the page.'
                ));
            }
        }, 100);
    });
}

/** Ensure the user is signed in to puter.com. Opens sign-in popup if not. */
async function ensurePuterAuth(p: any): Promise<void> {
    let signedIn = false;
    try {
        signedIn = await p.auth.isSignedIn();
    } catch {
        signedIn = false; // treat any error as "not signed in"
    }
    if (!signedIn) {
        try {
            await p.auth.signIn();
        } catch (err: any) {
            throw new Error(
                'Please sign in to your free puter.com account to use AI features. ' +
                (err?.message || '')
            );
        }
    }
}

async function refreshPuterSession(p: any): Promise<void> {
    try {
        if (typeof p?.auth?.signOut === 'function') {
            await p.auth.signOut();
        }
    } catch {
        // ignore sign-out failures; we'll still try sign-in next
    }

    try {
        await p.auth.signIn();
    } catch (err: any) {
        throw new Error(
            'Could not refresh Puter login session. Please sign out at puter.com and sign in again. ' +
            (err?.message || '')
        );
    }
}

function normalizePuterPath(pathValue: unknown): string {
    if (typeof pathValue !== 'string') {
        return '';
    }

    const trimmed = pathValue.trim();
    if (!trimmed) {
        return '';
    }

    if (trimmed.startsWith('~/') || trimmed.startsWith('/')) {
        return trimmed;
    }

    return `~/${trimmed}`;
}

function resolveWrittenFilePath(writeResult: any, fallbackFilename: string): string {
    if (Array.isArray(writeResult) && writeResult.length > 0) {
        const firstResolved = resolveWrittenFilePath(writeResult[0], fallbackFilename);
        if (firstResolved) {
            return firstResolved;
        }
    }

    const directPath = normalizePuterPath(writeResult);
    if (directPath) {
        return directPath;
    }

    const candidatePaths = [
        writeResult?.path,
        writeResult?.puter_path,
        writeResult?.name,
        writeResult?.filename,
    ];

    for (const candidate of candidatePaths) {
        const normalized = normalizePuterPath(candidate);
        if (normalized) {
            return normalized;
        }
    }

    return `~/${fallbackFilename}`;
}

// ─── Public API ─────────────────────────────────────────────────────────────

export interface PuterChatOptions {
    model?: string;
    temperature?: number;
    max_tokens?: number;
    tools?: object[];
    /** Controls reasoning depth (OpenAI only): 'none'|'low'|'medium'|'high'|'xhigh' */
    reasoning_effort?: 'none' | 'minimal' | 'low' | 'medium' | 'high' | 'xhigh';
    /** Controls response verbosity (OpenAI only): 'low'|'medium'|'high' */
    text?: 'low' | 'medium' | 'high';
}

function extractStreamChunkText(part: any): string {
    if (!part) return '';
    if (typeof part === 'string') return part;
    if (typeof part?.text === 'string') return part.text;
    if (typeof part?.delta === 'string') return part.delta;
    if (typeof part?.content === 'string') return part.content;
    if (typeof part?.message?.content === 'string') return part.message.content;

    if (Array.isArray(part?.content)) {
        return part.content
            .map((item: any) => {
                if (typeof item === 'string') return item;
                if (typeof item?.text === 'string') return item.text;
                if (typeof item?.content === 'string') return item.content;
                return '';
            })
            .join('');
    }

    return '';
}

/**
 * Single non-streaming AI call. Returns the full response string.
 */
function extractChatText(response: any): string {
    if (typeof response === 'string') {
        return response;
    }

    // Tool-call response: AI wants to invoke a function, not return text.
    // Return empty string rather than throwing a cryptic error.
    if (Array.isArray(response?.message?.tool_calls) && response.message.tool_calls.length > 0) {
        return '';
    }

    const directTextCandidates = [
        response?.message?.content,
        response?.content,
        response?.text,
        response?.output_text,
        response?.choices?.[0]?.message?.content,
        response?.choices?.[0]?.text,
        response?.output?.[0]?.content,
        response?.output?.[0]?.text,
        response?.result,
    ];

    for (const candidate of directTextCandidates) {
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate;
        }

        if (Array.isArray(candidate)) {
            const joined = candidate
                .map((part: any) => {
                    if (typeof part === 'string') return part;
                    if (typeof part?.text === 'string') return part.text;
                    if (typeof part?.content === 'string') return part.content;
                    return '';
                })
                .join('')
                .trim();

            if (joined) {
                return joined;
            }
        }
    }

    if (Array.isArray(response)) {
        const joined = response
            .map((item: any) => extractChatText(item))
            .join('')
            .trim();

        if (joined) {
            return joined;
        }
    }

    return '';
}

async function callPuterChatWithRetry(
    p: any,
    prompt: string | object[],
    callOptions: Record<string, any>
): Promise<string> {
    const response = await p.ai.chat(prompt, callOptions);
    const content = extractChatText(response);
    if (content) {
        return content;
    }

    const retryResponse = await p.ai.chat(prompt, callOptions);
    const retryContent = extractChatText(retryResponse);
    if (retryContent) {
        return retryContent;
    }

    throw new Error('No response received from AI. Please try again.');
}

export async function puterChat(
    prompt: string | object[],
    options: PuterChatOptions = {}
): Promise<string> {
    const p = await waitForPuter();
    await ensurePuterAuth(p);

    const preferredModel = options.model ?? MODELS.DEFAULT;
    const modelsToTry = getFallbackModels(preferredModel);
    let lastError: any = null;

    for (let index = 0; index < modelsToTry.length; index += 1) {
        const model = modelsToTry[index];
        const isLastModel = index === modelsToTry.length - 1;
        const callOptions: Record<string, any> = { model };
        if (options.temperature      !== undefined) callOptions.temperature      = options.temperature;
        if (options.max_tokens       !== undefined) callOptions.max_tokens       = options.max_tokens;
        if (options.tools            !== undefined) callOptions.tools            = options.tools;
        if (options.reasoning_effort !== undefined) callOptions.reasoning_effort = options.reasoning_effort;
        if (options.text             !== undefined) callOptions.text             = options.text;

        try {
            return await callPuterChatWithRetry(p, prompt, callOptions);
        } catch (err: any) {
            lastError = err;

            if (isUnsupportedTemperatureError(err) && callOptions.temperature !== undefined) {
                try {
                    const retryOptions = { ...callOptions };
                    delete retryOptions.temperature;
                    return await callPuterChatWithRetry(p, prompt, retryOptions);
                } catch (retryErr: any) {
                    lastError = retryErr;
                }
            }

            if (isPuterBalanceError(err)) {
                try {
                    await refreshPuterSession(p);
                    return await callPuterChatWithRetry(p, prompt, callOptions);
                } catch (retryErr: any) {
                    lastError = retryErr;
                }
            }

            if (isLastModel || !shouldTryFallbackModel(lastError)) {
                throw normalizePuterError(lastError);
            }
        }
    }

    throw normalizePuterError(lastError);
}

/**
 * Streaming AI call. Calls `onChunk` for every text chunk received.
 * Returns the full accumulated text when done.
 */
export async function puterChatStream(
    prompt: string | object[],
    onChunk: (chunk: string, accumulated: string) => void,
    options: PuterChatOptions = {}
): Promise<string> {
    const p = await waitForPuter();
    await ensurePuterAuth(p);

    const preferredModel = options.model ?? MODELS.DEFAULT;
    const modelsToTry = getFallbackModels(preferredModel);
    let lastError: any = null;

    for (let index = 0; index < modelsToTry.length; index += 1) {
        const model = modelsToTry[index];
        const isLastModel = index === modelsToTry.length - 1;
        const callOptions: Record<string, any> = { model, stream: true };
        if (options.temperature      !== undefined) callOptions.temperature      = options.temperature;
        if (options.max_tokens       !== undefined) callOptions.max_tokens       = options.max_tokens;
        if (options.tools            !== undefined) callOptions.tools            = options.tools;
        if (options.reasoning_effort !== undefined) callOptions.reasoning_effort = options.reasoning_effort;
        if (options.text             !== undefined) callOptions.text             = options.text;

        try {
            const stream = await p.ai.chat(prompt, callOptions);
            let accumulated = '';

            for await (const part of stream) {
                const text = extractStreamChunkText(part);
                if (text) {
                    accumulated += text;
                    onChunk(text, accumulated);
                }
            }

            if (!accumulated) {
                const retryStream = await p.ai.chat(prompt, callOptions);
                for await (const part of retryStream) {
                    const text = extractStreamChunkText(part);
                    if (text) {
                        accumulated += text;
                        onChunk(text, accumulated);
                    }
                }
            }

            if (!accumulated) {
                const nonStreamed = await puterChat(prompt, {
                    ...options,
                    model,
                });
                if (nonStreamed) {
                    onChunk(nonStreamed, nonStreamed);
                    return nonStreamed;
                }
                throw new Error('No response received from AI. Please try again.');
            }

            return accumulated;
        } catch (err: any) {
            lastError = err;

            if (isUnsupportedTemperatureError(err) && callOptions.temperature !== undefined) {
                try {
                    const retryOptions = { ...callOptions };
                    delete retryOptions.temperature;
                    const retryStream = await p.ai.chat(prompt, retryOptions);
                    let retryAccumulated = '';
                    for await (const part of retryStream) {
                        const text = extractStreamChunkText(part);
                        if (text) {
                            retryAccumulated += text;
                            onChunk(text, retryAccumulated);
                        }
                    }
                    if (retryAccumulated) return retryAccumulated;
                } catch (retryErr: any) {
                    lastError = retryErr;
                }
            }

            if (isPuterBalanceError(err)) {
                try {
                    await refreshPuterSession(p);
                    const retryStream = await p.ai.chat(prompt, callOptions);
                    let retryAccumulated = '';
                    for await (const part of retryStream) {
                        const text = extractStreamChunkText(part);
                        if (text) {
                            retryAccumulated += text;
                            onChunk(text, retryAccumulated);
                        }
                    }
                    if (retryAccumulated) return retryAccumulated;
                } catch (retryErr: any) {
                    lastError = retryErr;
                }
            }

            if (isLastModel || !shouldTryFallbackModel(lastError)) {
                throw normalizePuterError(lastError);
            }
        }
    }

    throw normalizePuterError(lastError);
}

/**
 * Upload a browser File to Puter's filesystem and return the Puter path.
 * The file is stored in a temp folder and should be deleted after AI use.
 */
export async function uploadFileToPuter(file: File): Promise<string> {
    const p = await waitForPuter();
    await ensurePuterAuth(p);

    const rawName = typeof file?.name === 'string' ? file.name : 'upload.bin';
    const sanitizedName = rawName
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '_');
    const filename = `studley_tmp_${Date.now()}_${sanitizedName}`;

    const writeResult = await p.fs.write(filename, file, { overwrite: true });
    return resolveWrittenFilePath(writeResult, filename);
}

/**
 * Delete a file from Puter's filesystem (cleanup after AI use).
 */
export async function deleteFromPuter(path: string): Promise<void> {
    try {
        const p = await waitForPuter();
        const normalizedPath = normalizePuterPath(path);
        if (!normalizedPath) {
            return;
        }
        await p.fs.delete(normalizedPath);
    } catch {
        // Non-critical cleanup — swallow errors silently
    }
}

/**
 * Strip markdown code fences from AI output.
 * Grok/Claude sometimes wraps JSON in ```json … ```
 */
export function stripMarkdownFences(text: string): string {
    return text.replace(/^```[\w]*\n?/gm, '').replace(/```$/gm, '').trim();
}

export function parseJsonFromAi(text: string): any {
    const cleaned = stripMarkdownFences(text).trim();
    const candidates: string[] = [cleaned];

    const arrayStart = cleaned.indexOf('[');
    const arrayEnd = cleaned.lastIndexOf(']');
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
        candidates.push(cleaned.slice(arrayStart, arrayEnd + 1));
    }

    const objectStart = cleaned.indexOf('{');
    const objectEnd = cleaned.lastIndexOf('}');
    if (objectStart !== -1 && objectEnd !== -1 && objectEnd > objectStart) {
        candidates.push(cleaned.slice(objectStart, objectEnd + 1));
    }

    for (const candidate of candidates) {
        try {
            return JSON.parse(candidate);
        } catch {
        }
    }

    return null;
}
