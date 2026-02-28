import { useState, useEffect } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link as LinkIcon, Mic, X, Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import confetti from 'canvas-confetti';
import MagneticButton from '@/Components/MagneticButton';
import TiltCard from '@/Components/TiltCard';

interface Subject {
    id: string;
    name: string;
    topics_count?: number;
}

export default function Dashboard({ auth, subjects = [] }: PageProps<{ subjects: Subject[] }>) {
    // Fallback if subjects is undefined
    const safeSubjects = subjects || [];

    // Paste Modal State
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [pasteTitle, setPasteTitle] = useState('');
    const [pasteContent, setPasteContent] = useState('');
    const [isPasting, setIsPasting] = useState(false);
    const [isFetchingTitle, setIsFetchingTitle] = useState(false);

    // Auto-detect URL and fetch title
    useEffect(() => {
        const urlMatch = pasteContent.trim().match(/^https?:\/\/[^\s]+$/);
        if (!urlMatch) return;

        const timeoutId = setTimeout(async () => {
            setIsFetchingTitle(true);
            try {
                const response = await axios.post('/api/v1/files/paste/fetch-title', {
                    url: pasteContent.trim()
                });

                if (response.data?.data?.title && response.data.data.title !== 'Document') {
                    // Overwrite title if it's currently empty
                    if (!pasteTitle.trim()) {
                        setPasteTitle(response.data.data.title);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch URL title", error);
            } finally {
                setIsFetchingTitle(false);
            }
        }, 800);

        return () => clearTimeout(timeoutId);
    }, [pasteContent]);

    const handlePasteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pasteTitle || !pasteContent) return;

        setIsPasting(true);
        try {
            await axios.post('/api/v1/files/paste', {
                title: pasteTitle,
                content: pasteContent
            });
            showToast.success('Content saved successfully to your Folders!');
            setIsPasteModalOpen(false);
            setPasteTitle('');
            setPasteContent('');
            fireConfetti();
        } catch (error) {
            console.error(error);
            showToast.error('Failed to save content.');
        } finally {
            setIsPasting(false);
        }
    };

    const fireConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleAction = (action: string) => {
        if (action === 'Record') {
            showToast.success('Voice recording coming soon!');
        }
    };

    const examples = [
        { title: 'Partial Fractions', desc: 'Integration techniques', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400' },
        { title: 'French Revolution', desc: 'Timeline and key figures', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
        { title: 'Cell Biology', desc: 'Mitosis vs Meiosis', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' },
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
        >
            <Head title="Dashboard" />

            <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[80vh]">

                {/* Hero / Welcome */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 text-slate-900 dark:text-white tracking-tight">
                        Hey {auth.user.name}, what do you want to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600 dark:from-brand-400 dark:to-purple-400">master</span> today?
                    </h1>
                    <p className="text-slate-600 dark:text-slate-300 text-xl font-medium max-w-2xl mx-auto">
                        Upload anything and get beautiful, interactive notes, flashcards, quizzes, and podcasts.
                    </p>
                </motion.div>

                {/* Quick Actions Grid */}
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.1 }
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-24"
                >
                    {/* Upload - Links to File Upload Page */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <MagneticButton className="w-full">
                            <Link
                                href={route('file-upload')}
                                className="flex flex-col items-start p-8 rounded-2xl glass-panel group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-brand-500/10 hover:border-brand-500/30"
                            >
                                <div className="mb-6 p-4 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300">
                                    <Upload size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">Upload Files</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">PDF, PPT, DOCX, Images & more</p>
                            </Link>
                        </MagneticButton>
                    </motion.div>

                    {/* Paste - Interactive */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <MagneticButton className="w-full">
                            <button
                                onClick={() => setIsPasteModalOpen(true)}
                                className="flex flex-col items-start p-8 rounded-2xl glass-panel w-full group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 text-left h-full"
                            >
                                <div className="mb-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                                    <LinkIcon size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Paste Link</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">YouTube, Website, or raw text</p>
                            </button>
                        </MagneticButton>
                    </motion.div>

                    {/* Record - Upcoming */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <div className="relative flex flex-col items-start p-8 rounded-2xl glass-panel w-full cursor-not-allowed opacity-80 border-dashed border-2 text-left h-full">
                            <div className="absolute top-4 right-4 bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                Coming Soon
                            </div>
                            <div className="mb-6 p-4 rounded-xl bg-slate-100 dark:bg-surface-800 text-slate-400 dark:text-slate-500">
                                <Mic size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500 mb-2">Record Voice</h3>
                            <p className="text-sm text-slate-400 dark:text-slate-500">Live lecture transcription</p>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Explore Section */}
                <div className="w-full max-w-6xl">
                    <div className="flex items-center gap-2 mb-6 text-slate-900 dark:text-white font-bold text-xl border-l-[3px] border-white pl-3">
                        <h2>Explore</h2>
                    </div>

                    {/* Topics Filter (Now Subjects) */}
                    <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide mb-8">
                        <Link
                            href={route('subjects')}
                            className="px-6 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold shadow-md whitespace-nowrap hover:scale-105 transition-all"
                        >
                            All Subjects
                        </Link>
                        {safeSubjects.length > 0 ? (
                            safeSubjects.map((subject, idx) => (
                                <Link
                                    key={idx}
                                    href={route('subjects.topics', subject.id)}
                                    className="px-6 py-2.5 rounded-full glass-card hover:bg-white hover:dark:bg-white/10 hover:border-brand-500/30 text-slate-700 dark:text-slate-300 text-sm font-medium whitespace-nowrap transition-all hover:scale-105"
                                >
                                    {subject.name}
                                </Link>
                            ))
                        ) : (
                            <span className="text-slate-500 text-sm italic px-2">No subjects yet. Create one to get started!</span>
                        )}
                    </div>

                    {/* Example Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {examples.map((ex, idx) => (
                            <TiltCard key={idx} className="w-full h-full">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
                                    whileHover={{ scale: 1.03 }}
                                    className={`w-full aspect-[16/9] rounded-3xl overflow-hidden relative group cursor-pointer border border-white/20 shadow-lg ${ex.color.split(' ')[0]} dark:${ex.color.split(' ')[1]}`}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                    <div className="absolute inset-0 p-8 flex flex-col justify-end transform transition-transform duration-300 group-hover:translate-y-[-5px]">
                                        <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{ex.title}</h3>
                                        <p className="text-white/80 font-medium text-sm">{ex.desc}</p>
                                    </div>
                                </motion.div>
                            </TiltCard>
                        ))}
                    </div>
                </div>

            </div>

            {/* Paste Link Modal */}
            <AnimatePresence>
                {isPasteModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPasteModalOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-12 px-6 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-lg glass-panel bg-white/90 dark:bg-surface-800/90 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden pointer-events-auto flex flex-col max-h-full"
                            >
                                <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-surface-900/50 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg">
                                            <LinkIcon size={20} />
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Paste Content</h3>
                                    </div>
                                    <button
                                        onClick={() => setIsPasteModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto">
                                    <form id="paste-form" onSubmit={handlePasteSubmit} className="space-y-5">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    Title
                                                </label>
                                                {isFetchingTitle && (
                                                    <span className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 font-medium">
                                                        <Loader2 size={12} className="animate-spin" />
                                                        Detecting title...
                                                    </span>
                                                )}
                                            </div>
                                            <input
                                                type="text"
                                                value={pasteTitle}
                                                onChange={(e) => setPasteTitle(e.target.value)}
                                                placeholder="e.g. History Lecture Notes"
                                                className="w-full rounded-xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-surface-900/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all dark:text-white"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                                Content
                                            </label>
                                            <textarea
                                                value={pasteContent}
                                                onChange={(e) => setPasteContent(e.target.value)}
                                                placeholder="Paste a URL or raw text here..."
                                                rows={5}
                                                className="w-full rounded-xl border-slate-200 dark:border-white/10 bg-white/50 dark:bg-surface-900/50 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all dark:text-white resize-y"
                                                required
                                            />
                                            <p className="text-xs text-slate-500 mt-2">
                                                Text will be saved as a document in your Folders.
                                            </p>
                                        </div>
                                    </form>
                                </div>

                                <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-surface-900/50 flex justify-end gap-3 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => setIsPasteModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        form="paste-form"
                                        disabled={isPasting || !pasteTitle || !pasteContent}
                                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center min-w-[120px]"
                                    >
                                        {isPasting ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            'Save Content'
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
