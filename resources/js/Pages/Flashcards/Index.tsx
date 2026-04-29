import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Sparkles, BookOpen, Loader2, ArrowRight, RefreshCw, UploadCloud, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { puterChat, parseJsonFromAi, uploadFileToPuter, deleteFromPuter, MODELS, getUserFriendlyAiError } from '@/Utils/puterAI';

interface Flashcard {
    term: string;
    definition: string;
}

function normalizeFlashcards(payload: any): Flashcard[] {
    const possibleCards = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.flashcards)
            ? payload.flashcards
            : Array.isArray(payload?.cards)
                ? payload.cards
                : [];

    return possibleCards
        .map((item: any) => {
            const term = (item?.term ?? item?.title ?? item?.front ?? item?.question ?? item?.concept ?? '').toString().trim();
            const definition = (item?.definition ?? item?.back ?? item?.answer ?? item?.explanation ?? item?.details ?? '').toString().trim();

            if (!term || !definition) {
                return null;
            }

            return { term, definition } as Flashcard;
        })
        .filter((card: Flashcard | null): card is Flashcard => Boolean(card));
}

export default function Flashcards({ auth, subjects }: PageProps<{ subjects: any[] }>) {
    const [sourceText, setSourceText] = useState('');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    // Keep file locally; upload to Puter only when generating
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFile(file);
        setSourceText('');
        setError(null);
    };

    const handleGenerate = async () => {
        if (!uploadedFile && sourceText.length < 50) {
            setError('Please provide more text (at least 50 characters) or upload a file to generate flashcards.');
            return;
        }

        setIsGenerating(true);
        setError(null);
        setFlashcards([]);
        setCurrentCardIndex(0);
        setIsFlipped(false);

        let puterPath: string | null = null;
        try {
            let prompt: string | object[];

            if (uploadedFile) {
                puterPath = await uploadFileToPuter(uploadedFile);
                prompt = [{
                    role: 'user',
                    content: [
                        { type: 'file', puter_path: puterPath },
                        { type: 'text', text: `You are an expert tutor. Extract exactly 10 key concepts from this document and create flashcards.

Reply STRICTLY with a valid JSON array (no markdown, no extra text):
[{"term": "Concept Name", "definition": "Clear, concise definition."}]` }
                    ]
                }];
            } else {
                const safeText = sourceText.substring(0, 6000);
                prompt = `You are an expert tutor. Extract exactly 10 key concepts from the text and create flashcards.

Reply STRICTLY with a valid JSON array (no markdown, no extra text):
[{"term": "Concept Name", "definition": "Clear, concise definition."}]

SOURCE TEXT:
${safeText}`;
            }

            const rawOutput = await puterChat(prompt, {
                model: MODELS.JSON,
                max_tokens: 700,
            });

            const parsedPayload = parseJsonFromAi(rawOutput);
            const parsedCards = normalizeFlashcards(parsedPayload).slice(0, 10);

            if (parsedCards.length === 0) {
                throw new Error('Invalid structure returned from AI.');
            }

            setFlashcards(parsedCards);
        } catch (err: any) {
            console.error('Flashcard Error:', err);
            setError(getUserFriendlyAiError(err, 'Flashcard generation is temporarily unavailable. Please try again.'));
        } finally {
            if (puterPath) await deleteFromPuter(puterPath);
            setIsGenerating(false);
        }
    };

    const nextCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
        }, 150); // small delay to allow flip back before changing content
    };

    const prevCard = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        }, 150);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="AI Flashcard Generator - Studley AI" />

            <div className="p-6 md:p-10 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-10 text-center md:text-left"
                >
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center justify-center md:justify-start gap-3 tracking-tight">
                        <Layers className="w-8 h-8 text-brand-500" />
                        AI Flashcard Generator
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Turn any study material into an interactive deck of flashcards instantly.
                    </p>
                </motion.div>

                {isGenerating ? (
                    /* Skeleton loading state — AI is generating */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center shadow-lg mb-4 animate-pulse">
                                <Sparkles size={28} className="text-white" />
                            </div>
                            <p className="text-lg font-bold text-slate-700 dark:text-slate-300">Generating your flashcard deck...</p>
                            <p className="text-sm text-slate-400 mt-1">AI is reading your material and creating cards</p>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-28 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
                                    <div className="h-full relative overflow-hidden">
                                        <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/60 dark:via-white/5 to-transparent" style={{ animationDelay: `${i * 0.2}s` }} />
                                        <div className="p-5 flex flex-col gap-3">
                                            <div className="h-3 bg-slate-200 dark:bg-surface-700 rounded-full w-1/3" />
                                            <div className="h-4 bg-slate-200 dark:bg-surface-700 rounded-full w-3/4" />
                                            <div className="h-3 bg-slate-200 dark:bg-surface-700 rounded-full w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <style dangerouslySetInnerHTML={{ __html: `@keyframes shimmer { to { transform: translateX(200%); } }` }} />
                    </motion.div>
                ) : flashcards.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-8 shadow-sm max-w-3xl mx-auto"
                    >
                        {/* File Upload Section */}
                        <div className="mb-5">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.txt,.md,.docx"
                                onChange={handleFileChange}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl border-2 border-dashed border-brand-200 dark:border-brand-500/30 bg-brand-50/50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 hover:bg-brand-100/60 dark:hover:bg-brand-500/20 transition-all font-semibold"
                            >
                                {uploadedFile ? (
                                        <><BookOpen size={18} /> {uploadedFile.name} (ready for AI analysis)</>
                                ) : (
                                    <><UploadCloud size={18} /> Upload PDF, TXT, or DOCX</>
                                )}
                            </button>
                            {uploadedFile && (
                                <button
                                    type="button"
                                    onClick={() => { setUploadedFile(null); setSourceText(''); }}
                                    className="mt-2 text-xs text-slate-400 hover:text-red-500 underline flex items-center gap-1"
                                >
                                    <X size={12} /> Clear file and type manually instead
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3 my-4 text-xs text-slate-400">
                            <div className="flex-1 h-px bg-slate-200 dark:bg-surface-600" />
                            <span className="font-medium uppercase tracking-wider">or paste text below</span>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-surface-600" />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Paste your notes, syllabus, or study material
                            </label>
                            <textarea
                                value={sourceText}
                                onChange={(e) => { setSourceText(e.target.value); setError(null); }}
                                className={`w-full h-48 p-4 rounded-xl border bg-surface-50 dark:bg-surface-900 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-brand-500 transition-shadow ${error ? 'border-red-300 focus:border-red-500' : 'border-surface-200 dark:border-surface-600 focus:border-brand-500'}`}
                                placeholder="E.g., Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight..."
                                disabled={isGenerating}
                            ></textarea>
                            <div className="flex justify-end items-center mt-2 text-xs text-slate-500">
                                {error ? (
                                    <span className="text-red-500 font-medium">{error}</span>
                                ) : (
                                    <span>{sourceText.length} characters – min 50 required</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-surface-200 dark:border-surface-700 pt-6 mt-6">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || (!uploadedFile && sourceText.trim().length < 50)}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isGenerating ? (
                                    <><Loader2 size={18} className="animate-spin" /> Generating Deck...</>
                                ) : (
                                    <><Sparkles size={18} /> Generate 10 Flashcards</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="max-w-3xl mx-auto">
                        {/* 3D Flashcard Container */}
                        <div className="perspective-1000 relative h-96 w-full mb-8">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentCardIndex + (isFlipped ? '-flipped' : '-front')}
                                    initial={{ opacity: 0, rotateY: isFlipped ? -90 : 90 }}
                                    animate={{ opacity: 1, rotateY: 0 }}
                                    exit={{ opacity: 0, rotateY: isFlipped ? 90 : -90 }}
                                    transition={{ duration: 0.3 }}
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    className={`absolute inset-0 w-full h-full rounded-2xl cursor-pointer preserve-3d shadow-xl border-2 flex flex-col items-center justify-center p-8 text-center
                                        ${isFlipped
                                            ? 'bg-gradient-to-br from-brand-50 to-brand-100 dark:from-brand-900/40 dark:to-brand-800/20 border-brand-200 dark:border-brand-500/30'
                                            : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 hover:border-brand-300 dark:hover:border-brand-500/50 transition-colors'
                                        }`}
                                >
                                    {/* Small hint at the top */}
                                    <div className="absolute top-4 left-0 w-full text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                        {isFlipped ? 'Definition' : 'Term'}
                                    </div>

                                    <h2 className={`font-bold text-slate-900 dark:text-white ${isFlipped ? 'text-2xl leading-relaxed' : 'text-4xl md:text-5xl'}`}>
                                        {isFlipped ? flashcards[currentCardIndex].definition : flashcards[currentCardIndex].term}
                                    </h2>

                                    {/* Tap to flip hint */}
                                    <div className="absolute bottom-4 left-0 w-full text-center flex justify-center text-slate-400 dark:text-slate-500">
                                        <div className="flex items-center gap-1.5 text-xs bg-slate-100 dark:bg-surface-900 px-3 py-1.5 rounded-full">
                                            <RefreshCw size={12} className={isFlipped ? 'text-brand-500' : ''} />
                                            Tap to flip
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between bg-white dark:bg-surface-800 p-4 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
                            <button
                                onClick={prevCard}
                                className="px-6 py-2.5 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-surface-700 transition-colors"
                            >
                                Previous
                            </button>

                            <div className="font-bold text-slate-700 dark:text-slate-300">
                                Card {currentCardIndex + 1} <span className="text-slate-400 dark:text-slate-500 font-normal">of {flashcards.length}</span>
                            </div>

                            <button
                                onClick={nextCard}
                                className="px-6 py-2.5 rounded-lg bg-brand-50 dark:bg-brand-500/10 font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 transition-colors"
                            >
                                Next Card
                            </button>
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => setFlashcards([])}
                                className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
                            >
                                Generate a new deck
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CSS for 3D Perspective */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 {
                    perspective: 1000px;
                }
                .preserve-3d {
                    transform-style: preserve-3d;
                }
            `}} />
        </AuthenticatedLayout>
    );
}
