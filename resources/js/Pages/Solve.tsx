import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, UploadCloud, Search, Sparkles, Loader2, FileImage, FileText, X, Globe, Copy, Check, RotateCcw, Clock } from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { puterChatStream, uploadFileToPuter, deleteFromPuter, MODELS, getUserFriendlyAiError } from '@/Utils/puterAI';

const HISTORY_KEY = 'studley_solve_history';

interface SolveHistory {
    question: string;
    timestamp: number;
}

function loadHistory(): SolveHistory[] {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; }
}

function saveToHistory(question: string) {
    const prev = loadHistory();
    const updated = [{ question: question.substring(0, 80), timestamp: Date.now() }, ...prev].slice(0, 8);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}

function timeAgo(ts: number): string {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

/** Styled component map — gives every markdown element proper spacing & typography */
const mdComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
    h1: ({ children }) => <h1 className="text-2xl font-extrabold text-brand-700 dark:text-brand-300 mt-8 mb-3 border-b border-brand-200 dark:border-brand-700 pb-2">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold text-brand-600 dark:text-brand-400 mt-7 mb-3">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mt-5 mb-2">{children}</h3>,
    h4: ({ children }) => <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300 mt-4 mb-1">{children}</h4>,
    p:  ({ children }) => <p  className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{children}</p>,
    ul: ({ children }) => <ul className="list-disc list-outside pl-5 mb-4 space-y-1 text-slate-700 dark:text-slate-300">{children}</ul>,
    ol: ({ children }) => <ol className="list-decimal list-outside pl-5 mb-4 space-y-1 text-slate-700 dark:text-slate-300">{children}</ol>,
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
    em: ({ children }) => <em className="italic text-slate-600 dark:text-slate-400">{children}</em>,
    blockquote: ({ children }) => <blockquote className="border-l-4 border-brand-400 dark:border-brand-600 pl-4 my-4 text-slate-600 dark:text-slate-400 italic">{children}</blockquote>,
    code: ({ inline, children }: any) => inline
        ? <code className="bg-slate-100 dark:bg-slate-800 text-brand-600 dark:text-brand-300 rounded px-1.5 py-0.5 text-sm font-mono">{children}</code>
        : <code className="block bg-slate-900 dark:bg-slate-950 text-slate-50 rounded-xl p-4 my-4 text-sm font-mono overflow-x-auto whitespace-pre">{children}</code>,
    pre: ({ children }) => <>{children}</>,
    hr:  () => <hr className="my-6 border-slate-200 dark:border-slate-700" />,
    table: ({ children }) => <div className="overflow-x-auto my-4"><table className="w-full border-collapse text-sm">{children}</table></div>,
    th: ({ children }) => <th className="border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-left font-semibold">{children}</th>,
    td: ({ children }) => <td className="border border-slate-300 dark:border-slate-600 px-3 py-2">{children}</td>,
};

export default function Solve({ auth }: PageProps) {
    const [question, setQuestion] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadedDoc, setUploadedDoc] = useState<File | null>(null);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isSolving, setIsSolving] = useState(false);
    const [solution, setSolution] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [useWebSearch, setUseWebSearch] = useState(false);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState<SolveHistory[]>(loadHistory);
    const [lastPrompt, setLastPrompt] = useState<{ type: 'text' | 'image', payload: any } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const docInputRef = useRef<HTMLInputElement>(null);

    const refreshHistory = () => setHistory(loadHistory());

    const handleCopy = useCallback(async () => {
        if (!solution) return;
        await navigator.clipboard.writeText(solution);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [solution]);

    const handleTextSubmit = async () => {
        if (!question.trim() && !uploadedDoc) return;

        setIsSolving(true);
        setError(null);
        setSolution('');
        setImage(null);
        setImagePreview(null);
        setLastPrompt({ type: 'text', payload: { question, uploadedDoc, useWebSearch } });

        let puterPath: string | null = null;
        try {
            let prompt: string | object[];
            if (uploadedDoc) {
                puterPath = await uploadFileToPuter(uploadedDoc);
                prompt = [{
                    role: 'user',
                    content: [
                        { type: 'file', puter_path: puterPath },
                        {
                            type: 'text',
                            text: `You are an expert tutor. Analyze this uploaded document and solve all problems step-by-step.

Formatting rules (strictly follow):
- Use ## for major sections (e.g. ## Document Overview, ## Key Concepts, ## Solutions)
- Use ### for sub-sections or individual questions
- Use **bold** for key terms and important points
- Use numbered lists (1. 2. 3.) for sequential steps
- Use bullet lists for non-sequential points
- Add a blank line between every section
- Keep answers clear, concise, and well-spaced — avoid walls of text
- End with a ## Summary section

${question && question.startsWith('[Document loaded:') ? '' : `User instruction: ${question}`}`.trim()
                        }
                    ]
                }];
            } else {
                prompt = `You are an expert tutor. Solve the following problem step-by-step.

Formatting rules (strictly follow):
- Use ## headings for major sections
- Use ### for sub-steps or sub-topics
- Use **bold** for key terms
- Use numbered lists for sequential steps, bullet lists for concepts
- Add spacing between sections — avoid dense walls of text
- End with a ## Summary

Problem:
${question}`;
            }

            const opts = uploadedDoc
                ? { model: MODELS.DOCUMENT, max_tokens: 1200 }
                : useWebSearch
                    ? { model: MODELS.WEBSEARCH, tools: [{ type: 'web_search' }], max_tokens: 700 }
                    : { model: MODELS.DEFAULT, max_tokens: 900 };

            try {
                await puterChatStream(
                    prompt,
                    (_, accumulated) => setSolution(accumulated),
                    opts
                );
                if (question.trim()) { saveToHistory(question); refreshHistory(); }
            } catch (streamErr: any) {
                const canFallback = !uploadedDoc && useWebSearch;
                if (!canFallback) {
                    throw streamErr;
                }

                setSolution('');
                await puterChatStream(
                    prompt,
                    (_, accumulated) => setSolution(accumulated),
                    { model: MODELS.DEFAULT, max_tokens: 900 }
                );
            }
        } catch (err: any) {
            console.error('AI Solver Error:', err);
            setError(getUserFriendlyAiError(err, 'AI solver is temporarily unavailable. Please try again.'));
            setSolution(null);
        } finally {
            if (puterPath) await deleteFromPuter(puterPath);
            setIsSolving(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setQuestion('');
            setUploadedDoc(null);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDocChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedDoc(file);
        setImage(null);
        setImagePreview(null);
        setError(null);
        setIsExtracting(true);
        setQuestion(`[Document loaded: ${file.name}] Please analyze and solve any problems in this document.`);
        setIsExtracting(false);
    };

    const handleImageSubmit = async () => {
        if (!image) return;
        setIsSolving(true);
        setError(null);
        setSolution('');
        setLastPrompt({ type: 'image', payload: image });
        let puterPath: string | null = null;
        try {
            puterPath = await uploadFileToPuter(image);
            const messages = [{
                role: 'user',
                content: [
                    { type: 'file', puter_path: puterPath },
                    { type: 'text', text: `You are an expert tutor. Analyze this image and solve the problem shown step-by-step.

Formatting rules:
- Use ## for major sections
- Use ### for sub-steps
- Use **bold** for key terms
- Use numbered lists for steps, bullets for concepts
- Space out sections — no walls of text
- End with a ## Summary` }
                ]
            }];
            await puterChatStream(
                messages,
                (_, accumulated) => setSolution(accumulated),
                { model: MODELS.VISION, max_tokens: 900 }
            );
            saveToHistory(`[Image] ${image.name}`);
            refreshHistory();
        } catch (err: any) {
            console.error('Vision Error:', err);
            setError(getUserFriendlyAiError(err, 'Image analysis is temporarily unavailable. Please try again.'));
            setSolution(null);
        } finally {
            if (puterPath) await deleteFromPuter(puterPath);
            setIsSolving(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Solve - Studley AI" />

            <div className="p-6 md:p-10 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-10 text-center md:text-left"
                >
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center justify-center md:justify-start gap-3 tracking-tight">
                        <CheckSquare className="w-8 h-8 text-brand-500" />
                        AI Solver
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Upload a photo of a math problem, chemistry equation, or complex question to get step-by-step solutions.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Upload Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className={`bg-white dark:bg-surface-800 rounded-2xl border-2 border-dashed ${imagePreview ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10' : uploadedDoc ? 'border-green-400 bg-green-50/30 dark:bg-green-500/5' : 'border-brand-200 dark:border-surface-700'} p-12 text-center hover:border-brand-500 dark:hover:border-brand-500/50 transition-colors group cursor-default relative overflow-hidden`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                            />
                            <input
                                type="file"
                                ref={docInputRef}
                                onChange={handleDocChange}
                                accept=".pdf,.txt,.md,.docx"
                                className="hidden"
                            />

                            <AnimatePresence mode="wait">
                                {imagePreview ? (
                                    <motion.div
                                        key="preview"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative z-10 flex flex-col items-center"
                                    >
                                        <div className="w-32 h-32 rounded-xl overflow-hidden mb-6 shadow-md border-2 border-white dark:border-surface-700">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{image?.name}</h3>
                                        <div className="flex gap-4 mt-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="px-6 py-2 rounded-xl bg-slate-200 dark:bg-surface-700 text-slate-700 dark:text-slate-300 font-bold transition-all hover:bg-slate-300 dark:hover:bg-surface-600"
                                            >
                                                Clear
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleImageSubmit();
                                                }}
                                                disabled={isSolving}
                                                className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSolving && !question ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                                Solve Image
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : uploadedDoc ? (
                                    <motion.div
                                        key="doc-loaded"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative z-10 flex flex-col items-center"
                                    >
                                        {isExtracting ? (
                                            <>
                                                <Loader2 className="animate-spin w-12 h-12 text-brand-500 mb-4" />
                                                <p className="text-slate-600 dark:text-slate-400 font-medium">Extracting text from document...</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                                                    <FileText size={36} />
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{uploadedDoc.name}</h3>
                                                <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-4">✓ Document ready for AI analysis</p>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setUploadedDoc(null); setQuestion(''); }}
                                                    className="text-xs text-slate-400 hover:text-red-500 underline flex items-center gap-1"
                                                >
                                                    <X size={12} /> Remove document
                                                </button>
                                            </>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="upload"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="relative z-10 flex flex-col items-center"
                                    >
                                        <div className="absolute inset-0 bg-brand-50 dark:bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl -z-10" />
                                        <div className="w-20 h-20 bg-brand-100 dark:bg-surface-700 rounded-full flex items-center justify-center mb-6 text-brand-500 shadow-sm group-hover:scale-110 transition-transform">
                                            <UploadCloud size={32} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload a file to solve</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                                            Drag & drop or click. Supports: JPEG, PNG, WEBP (image), PDF, TXT, DOCX (document).
                                        </p>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                className="px-5 py-2.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                            >
                                                <FileImage size={16} /> Image
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); docInputRef.current?.click(); }}
                                                className="px-5 py-2.5 rounded-full bg-slate-700 hover:bg-slate-800 dark:bg-surface-700 dark:hover:bg-surface-600 text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                            >
                                                <FileText size={16} /> Document
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-surface-200 dark:border-surface-700 pb-4 mb-4">
                                <Search className="w-5 h-5 text-slate-400" />
                                {uploadedDoc && !isExtracting ? (
                                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium flex-1">Document loaded – click "Solve It" to analyze with AI</span>
                                ) : (
                                    <input
                                        type="text"
                                        value={question}
                                        onChange={(e) => setQuestion(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); }}
                                        placeholder="Or paste your question text here..."
                                        className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50"
                                        disabled={isSolving || !!imagePreview || isExtracting}
                                    />
                                )}
                            </div>

                            {/* Web Search Toggle */}
                            <div className="flex items-center gap-2 mb-4">
                                <button
                                    onClick={() => setUseWebSearch(w => !w)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                        useWebSearch
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'bg-slate-100 dark:bg-surface-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200'
                                    }`}
                                >
                                    <Globe size={13} />
                                    Web Search {useWebSearch ? 'ON' : 'OFF'}
                                </button>
                                {useWebSearch && (
                                    <span className="text-xs text-blue-500">AI will search the web for up-to-date answers</span>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <button
                                    onClick={handleTextSubmit}
                                    disabled={isSolving || isExtracting || (!question.trim() && !uploadedDoc) || !!imagePreview}
                                    className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSolving && question ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                                    {isSolving && question ? 'Solving...' : 'Solve It'}
                                </button>
                            </div>
                        </div>

                        {/* Solution Area */}
                        <AnimatePresence>
                            {(solution || error) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-500/30 rounded-2xl p-6 md:p-8"
                                >
                                    <div className="flex items-center justify-between gap-3 mb-6 border-b border-brand-200/50 dark:border-brand-500/20 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white shadow-sm">
                                                <Sparkles size={20} />
                                            </div>
                                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Solution</h2>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* Retry button */}
                                            {lastPrompt && (
                                                <button
                                                    onClick={() => lastPrompt.type === 'text' ? handleTextSubmit() : handleImageSubmit()}
                                                    disabled={isSolving}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors disabled:opacity-40"
                                                    title="Retry"
                                                >
                                                    <RotateCcw size={13} /> Retry
                                                </button>
                                            )}
                                            {/* Copy button */}
                                            {solution && (
                                                <button
                                                    onClick={handleCopy}
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                                        copied
                                                            ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400'
                                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-surface-700'
                                                    }`}
                                                >
                                                    {copied ? <Check size={13} /> : <Copy size={13} />}
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {error ? (
                                        <p className="text-red-500 text-sm font-medium">{error}</p>
                                    ) : (
                                        <div className="max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>{solution!}</ReactMarkdown>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* History Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm h-fit sticky top-4"
                    >
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" /> Recent Solutions
                        </h3>
                        {history.length === 0 ? (
                            <p className="text-sm text-slate-400 dark:text-slate-500 italic">No solutions yet. Ask your first question!</p>
                        ) : (
                            <div className="space-y-3">
                                {history.map((item, i) => (
                                    <button
                                        key={i}
                                        onClick={() => { setQuestion(item.question.replace(/^\[Image\] /, '')); }}
                                        className="w-full flex flex-col p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 border border-transparent hover:border-surface-200 dark:hover:border-surface-600 transition-all text-left"
                                    >
                                        <span className="font-medium text-slate-800 dark:text-slate-200 text-sm line-clamp-2">{item.question}</span>
                                        <span className="text-xs text-slate-400 mt-1">{timeAgo(item.timestamp)}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                        {history.length > 0 && (
                            <button
                                onClick={() => {
                                    if (window.confirm('Clear all solve history? This cannot be undone.')) {
                                        localStorage.removeItem(HISTORY_KEY);
                                        refreshHistory();
                                    }
                                }}
                                className="w-full mt-4 py-1.5 text-xs text-slate-400 hover:text-red-500 font-medium transition-colors"
                            >
                                Clear history
                            </button>
                        )}
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
