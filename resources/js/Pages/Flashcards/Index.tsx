import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Sparkles, BookOpen, Loader2, ArrowRight, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface Flashcard {
    term: string;
    definition: string;
}

export default function Flashcards({ auth, subjects }: PageProps<{ subjects: any[] }>) {
    const [sourceText, setSourceText] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleGenerate = async () => {
        if (sourceText.length < 50) {
            setError("Please provide more text (at least 50 characters) to generate meaningful flashcards.");
            return;
        }

        setIsGenerating(true);
        setError(null);
        setFlashcards([]);
        setCurrentCardIndex(0);
        setIsFlipped(false);

        try {
            const response = await fetch('/api/v1/flashcards/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    source_text: sourceText,
                    card_count: 10,
                    difficulty: 'intermediate'
                })
            });

            const data = await response.json();

            if (!response.ok || data.flashcards?.error) {
                throw new Error(data.flashcards?.message || data.message || "Failed to generate flashcards.");
            }

            setFlashcards(data.flashcards || []);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
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

                {flashcards.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-8 shadow-sm max-w-3xl mx-auto"
                    >
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                Paste your notes, syllabus, or study material
                            </label>
                            <textarea
                                value={sourceText}
                                onChange={(e) => { setSourceText(e.target.value); setError(null); }}
                                className={`w-full h-64 p-4 rounded-xl border bg-surface-50 dark:bg-surface-900 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-brand-500 transition-shadow ${error ? 'border-red-300 focus:border-red-500' : 'border-surface-200 dark:border-surface-600 focus:border-brand-500'}`}
                                placeholder="E.g., Photosynthesis is the process used by plants, algae and certain bacteria to harness energy from sunlight and turn it into chemical energy..."
                                disabled={isGenerating}
                            ></textarea>
                            <div className="flex justify-end items-center mt-2 text-xs text-slate-500">
                                {error ? (
                                    <span className="text-red-500 font-medium">{error}</span>
                                ) : (
                                    <span>Min 50 characters required</span>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end border-t border-surface-200 dark:border-surface-700 pt-6 mt-6">
                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || sourceText.trim().length < 50}
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
