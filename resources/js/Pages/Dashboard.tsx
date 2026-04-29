import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Link as LinkIcon, Mic, X, Loader2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
import confetti from 'canvas-confetti';
import MagneticButton from '@/Components/Animation/MagneticButton';
import TiltCard from '@/Components/Animation/TiltCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { puterChat, MODELS } from '@/Utils/puterAI';

interface Subject {
    id: string;
    name: string;
    topics_count?: number;
}

interface ActivityData {
    name: string;
    materials: number;
    topics: number;
}

function toReadableErrorMessage(error: any, fallback: string): string {
    if (!error) return fallback;

    if (typeof error === 'string') return error;

    if (typeof error?.message === 'string' && error.message.trim()) {
        return error.message;
    }

    const serverError = error?.response?.data?.error;
    if (typeof serverError === 'string' && serverError.trim()) {
        return serverError;
    }

    const responseMessage = error?.response?.data?.message;
    if (typeof responseMessage === 'string' && responseMessage.trim()) {
        return responseMessage;
    }

    return fallback;
}

function buildLocalUrlSummary(url: string, title: string, text: string): string {
    const cleanTitle = (title || 'Document').trim();
    const cleanText = (text || '').replace(/\s+/g, ' ').trim();

    let host = 'the source page';
    try {
        host = new URL(url).hostname.replace(/^www\./, '') || host;
    } catch {
    }

    const sentenceCandidates = cleanText
        .split(/(?<=[.!?])\s+/)
        .map((item) => item.trim())
        .filter((item) => item.length >= 40 && item.length <= 220);

    const unique: string[] = [];
    for (const sentence of sentenceCandidates) {
        const normalized = sentence.toLowerCase();
        if (!unique.some((existing) => existing.toLowerCase() === normalized)) {
            unique.push(sentence);
        }
        if (unique.length >= 3) break;
    }

    const bullets = [
        `- **Source:** ${cleanTitle} (${host})`,
        unique.length > 0
            ? `- **Key points:** ${unique.join(' ')}`
            : '- **Key points:** The page content was fetched successfully, but AI summarization is temporarily unavailable.',
        '- **Next step:** Save now and ask AI chat later for a deeper breakdown if needed.'
    ];

    return bullets.join('\n');
}

export default function Dashboard({ auth, subjects = [], stats, weeklyActivity = [] }: PageProps<{
    subjects: Subject[],
    stats: { tasks_completed: number, tasks_total: number, hours_studied: number },
    weeklyActivity: ActivityData[]
}>) {
    // Fallback if subjects is undefined
    const safeSubjects = subjects || [];

    // Chart mounting state to prevent Recharts sizing issues
    const [isMounted, setIsMounted] = useState(false);

    // Paste Modal State
    const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
    const [pasteTitle, setPasteTitle] = useState('');
    const [pasteContent, setPasteContent] = useState('');
    const [pasteSummary, setPasteSummary] = useState('');
    const [pasteAnalysisError, setPasteAnalysisError] = useState('');
    const [isPasting, setIsPasting] = useState(false);
    const [isFetchingTitle, setIsFetchingTitle] = useState(false);
    const [isAnalyzingUrl, setIsAnalyzingUrl] = useState(false);

    const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcript, setTranscript] = useState('');
    const recognitionRef  = useRef<any>(null);
    const timerRef        = useRef<NodeJS.Timeout | null>(null);
    // Ref mirrors isRecording so recognition.onend can read the live value (avoids stale closure)
    const isRecordingRef  = useRef(false);

    // Auto-detect URL and analyze with Grok
    useEffect(() => {
        const urlMatch = pasteContent.trim().match(/^https?:\/\/[^\s]+$/);
        if (!urlMatch) return;

        setPasteSummary('');
        setPasteAnalysisError('');
        // AbortController so that navigating away or re-typing cancels the in-flight request
        const controller = new AbortController();

        const timeoutId = setTimeout(async () => {
            setIsFetchingTitle(true);
            setIsAnalyzingUrl(true);
            try {
                // Step 1: Backend scrapes the page, strips HTML, returns plain text + title
                const response = await axios.post('/api/v1/files/paste/fetch-content', {
                    url: pasteContent.trim()
                }, { signal: controller.signal });

                const pageTitle = response.data?.data?.title;
                const pageText  = response.data?.data?.text || '';
                const fallbackSummary = buildLocalUrlSummary(pasteContent.trim(), pageTitle || 'Document', pageText);

                // Auto-fill title if the field is empty and we got a real title
                if (pageTitle && pageTitle !== 'Document' && !pasteTitle.trim()) {
                    setPasteTitle(pageTitle);
                }

                // Step 2: Send the ACTUAL scraped text to AI (not the raw URL)
                if (pageText.trim().length > 50) {
                    try {
                        const safeText = pageText.substring(0, 6000);
                        let summary = await puterChat(
                            `You are a study assistant. Summarize the following web page content in 3-5 clear bullet points, focusing on key concepts and takeaways. Keep it concise.\n\nCONTENT:\n${safeText}`,
                            { model: MODELS.DEFAULT, max_tokens: 320 }
                        );

                        if (!summary?.trim()) {
                            summary = await puterChat(
                                `You are a study assistant. Summarize the following web page content in 3-5 clear bullet points, focusing on key concepts and takeaways. Keep it concise.\n\nCONTENT:\n${safeText}`,
                                { model: MODELS.DOCUMENT, max_tokens: 320 }
                            );
                        }

                        if (summary) {
                            setPasteSummary(summary);
                        } else {
                            setPasteSummary(fallbackSummary);
                            setPasteAnalysisError('AI summary is temporarily unavailable, but a local summary was generated.');
                        }
                    } catch (aiError: any) {
                        const readable = toReadableErrorMessage(
                            aiError,
                            'AI summary is temporarily unavailable. You can still save the URL manually.'
                        );

                        if (readable.includes('No response received from AI')) {
                            console.info('AI returned empty output for URL summary; manual save still available.');
                            setPasteSummary(fallbackSummary);
                            setPasteAnalysisError('AI summary is temporarily unavailable, but a local summary was generated.');
                        } else {
                            console.warn('AI service unavailable, skipping URL analysis', aiError);
                            setPasteSummary(fallbackSummary);
                            setPasteAnalysisError('AI summary is temporarily unavailable, but a local summary was generated.');
                        }
                    }
                } else {
                    setPasteSummary(fallbackSummary);
                    setPasteAnalysisError('Readable text is limited, but a local summary was generated from available metadata.');
                }
            } catch (error: any) {
                if (axios.isCancel(error) || error?.name === 'CanceledError') return; // aborted — ignore
                console.error('Failed to analyze URL', error);
                const status = error?.response?.status;
                if (status === 429) {
                    setPasteAnalysisError('Too many URL analysis requests. Please wait a minute and try again.');
                } else if (status === 401) {
                    setPasteAnalysisError('Your session expired. Refresh the page and try again.');
                } else {
                    setPasteAnalysisError(
                        toReadableErrorMessage(
                            error,
                            'Could not fetch URL content. Please check the link or paste text directly.'
                        )
                    );
                }
            } finally {
                setIsFetchingTitle(false);
                setIsAnalyzingUrl(false);
            }
        }, 800);

        return () => {
            clearTimeout(timeoutId);
            controller.abort(); // cancel in-flight request on re-render / unmount
        };
    }, [pasteContent]);


    // Set mounted state to prevent chart sizing issues
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handlePasteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pasteTitle || !pasteContent) return;

        setIsPasting(true);
        try {
            // Save the original URL + summary as content (if we have a summary)
            const contentToSave = pasteSummary
                ? `Source: ${pasteContent}\n\n${pasteSummary}`
                : pasteContent;

            await axios.post('/api/v1/files/paste', {
                title: pasteTitle,
                content: contentToSave
            });
            showToast.success('Content saved to your Folders!');
            setIsPasteModalOpen(false);
            setPasteTitle('');
            setPasteContent('');
            setPasteSummary('');
            setPasteAnalysisError('');
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
            setIsRecordingModalOpen(true);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const startRecording = async () => {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                showToast.error('Your browser does not support Speech Recognition.');
                return;
            }

            const recognition = new SpeechRecognition();
            recognition.continuous     = true;
            recognition.interimResults = true;
            recognition.lang           = 'en-US';

            recognitionRef.current = recognition;
            setTranscript('');

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript((prev) => prev + finalTranscript + ' ');
                }
            };

            recognition.onerror = (event: any) => {
                console.error('Speech recognition error:', event.error);
                if (event.error !== 'no-speech') {
                    showToast.error('Microphone or recognition error occurred.');
                    stopRecording();
                }
            };

            // FIX: use isRecordingRef (not the stale isRecording closure) so onend always
            // reads the current recording state at the time it fires.
            recognition.onend = () => {
                if (isRecordingRef.current) {
                    handleSaveTranscript();
                }
            };

            recognition.start();
            isRecordingRef.current = true;
            setIsRecording(true);
            setRecordingTime(0);

            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            showToast.error('Could not access microphone.');
        }
    };

    const stopRecording = () => {
        if (recognitionRef.current && isRecordingRef.current) {
            isRecordingRef.current = false; // update ref BEFORE calling stop() so onend doesn't re-trigger save
            recognitionRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const handleSaveTranscript = async () => {
        // Use the current state value which might be slightly updated
        setTranscript((currentStr) => {
            const finalStr = currentStr.trim();
            if (!finalStr) {
                showToast.error("No speech detected.");
                return currentStr;
            }

            setIsTranscribing(true); // Reusing this for "Saving" state visually

            // Send exactly to our existing paste API as a text document
            const titleDate = new Date().toLocaleString();
            axios.post('/api/v1/files/paste', {
                title: `Voice Memo - ${titleDate}`,
                content: finalStr
            }).then(() => {
                showToast.success('Voice Memo saved to Folders!');
                setIsRecordingModalOpen(false);
                fireConfetti();
            }).catch((err) => {
                console.error("Save error:", err);
                showToast.error('Failed to save transcription.');
            }).finally(() => {
                setIsTranscribing(false);
                setRecordingTime(0);
                setTranscript('');
            });

            return currentStr;
        });
    };

    const closeRecordingModal = () => {
        if (isRecording) {
            stopRecording();
        }
        setIsRecordingModalOpen(false);
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

                    {/* Record - Initialized */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <MagneticButton className="w-full">
                            <button
                                onClick={() => handleAction('Record')}
                                className="flex flex-col items-start p-8 rounded-2xl glass-panel w-full group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-rose-500/10 hover:border-rose-500/30 text-left h-full"
                            >
                                <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                                    <Mic size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Record Voice</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Live lecture transcription</p>
                            </button>
                        </MagneticButton>
                    </motion.div>
                </motion.div>

                {/* Analytics & Progress Section */}
                <div className="w-full max-w-4xl mt-4">
                    <div className="flex items-center gap-2 mb-8 text-slate-900 dark:text-white font-bold text-2xl border-l-[4px] border-brand-500 pl-4">
                        <h2>Your Progress</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="glass-panel p-6 rounded-2xl bg-white/60 dark:bg-surface-800/60 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Tasks Completed</h3>
                            <div className="text-4xl font-extrabold text-brand-600 dark:text-brand-400">
                                {stats?.tasks_completed || 0} <span className="text-xl text-slate-400">/ {stats?.tasks_total || 0}</span>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl bg-white/60 dark:bg-surface-800/60 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Hours Studied</h3>
                            <div className="text-4xl font-extrabold text-purple-600 dark:text-purple-400">
                                {stats?.hours_studied || 0} <span className="text-xl text-slate-400">hrs</span>
                            </div>
                        </div>
                        <div className="glass-panel p-6 rounded-2xl bg-white/60 dark:bg-surface-800/60 border border-slate-200 dark:border-white/10 flex flex-col items-center justify-center text-center">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Active Subjects</h3>
                            <div className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                                {Array.isArray(safeSubjects) ? safeSubjects.length : 0}
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-surface-800/80 border border-slate-200 dark:border-white/10 shadow-lg">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-6">Weekly Activity</h3>
                        <div className="w-full" style={{ height: 320 }}>
                            {isMounted && weeklyActivity.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-emerald-400/20 flex items-center justify-center">
                                        <svg className="w-8 h-8 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700 dark:text-slate-300">No activity yet</p>
                                        <p className="text-sm text-slate-400 mt-1">Upload materials to start tracking your study streak</p>
                                    </div>
                                    <Link href={route('dashboard')} className="text-xs font-bold text-brand-600 hover:underline">
                                        Upload your first document →
                                    </Link>
                                </div>
                            ) : isMounted && (
                                <ResponsiveContainer width="100%" height={320} minWidth={0}>
                                    <AreaChart
                                        data={weeklyActivity}
                                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                    >
                                    <defs>
                                        <linearGradient id="colorMaterials" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTopics" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#fff',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                        }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="materials"
                                        name="Materials Uploaded"
                                        stroke="#8b5cf6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorMaterials)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="topics"
                                        name="Topics Completed"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTopics)"
                                    />
                                </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
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
                                            {isAnalyzingUrl && (
                                                <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                                                    <Loader2 size={12} className="animate-spin" />
                                                    Analyzing URL content with AI...
                                                </div>
                                            )}
                                            {pasteSummary && !isAnalyzingUrl && (
                                                <div className="mt-3 p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20">
                                                    <p className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-2">✨ AI Summary</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{pasteSummary}</p>
                                                </div>
                                            )}
                                            {pasteAnalysisError && !isAnalyzingUrl && (
                                                <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                                                    <p className="text-sm text-amber-700 dark:text-amber-300">{pasteAnalysisError}</p>
                                                </div>
                                            )}
                                            <p className="text-xs text-slate-500 mt-2">
                                                {pasteSummary ? 'The AI summary above will be saved to your Folders.' : 'Paste a URL to get an AI summary, or type/paste raw text directly.'}
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

                {/* Voice Recording Modal */}
                {isRecordingModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={closeRecordingModal}
                            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-50 transition-opacity"
                        />
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-12 px-6 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="w-full max-w-md glass-panel bg-white/90 dark:bg-surface-800/90 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden pointer-events-auto flex flex-col items-center text-center p-8 relative"
                            >
                                <button
                                    onClick={closeRecordingModal}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-white/5"
                                >
                                    <X size={20} />
                                </button>

                                <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${isRecording ? 'bg-rose-500/20 text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)] shadow-rose-500/30' : 'bg-slate-100 dark:bg-surface-700 text-slate-400'}`}>
                                    <Mic size={40} className={isRecording ? 'animate-pulse' : ''} />
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                    {isTranscribing ? 'Transcribing...' : isRecording ? 'Recording Audio' : 'Ready to Record'}
                                </h3>

                                <div className="text-3xl font-mono text-slate-700 dark:text-slate-300 mb-8 font-light tracking-wider">
                                    {formatTime(recordingTime)}
                                </div>

                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 px-4">
                                    {isTranscribing
                                        ? "Saving your transcribed audio to Folders..."
                                        : "Click start to begin capturing your lecture, thoughts, or ideas."}
                                </p>

                                {isRecording && transcript && (
                                    <div className="w-full bg-slate-50 dark:bg-black/20 rounded-xl p-4 mb-8 text-left max-h-32 overflow-y-auto text-sm text-slate-600 dark:text-slate-300 italic border border-slate-100 dark:border-white/5 shadow-inner">
                                        "{transcript}"
                                        <span className="w-1.5 h-4 ml-1 inline-block bg-rose-400 animate-pulse"></span>
                                    </div>
                                )}

                                <div className="w-full">
                                    {!isRecording && !isTranscribing && (
                                        <button
                                            onClick={startRecording}
                                            className="w-full py-4 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-500/30 text-lg"
                                        >
                                            Start Recording
                                        </button>
                                    )}

                                    {isRecording && (
                                        <button
                                            onClick={stopRecording}
                                            className="w-full py-4 rounded-xl font-bold text-rose-600 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 border-2 border-rose-500/30 transition-all text-lg flex items-center justify-center gap-2"
                                        >
                                            <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Stop & Transcribe
                                        </button>
                                    )}

                                    {isTranscribing && (
                                        <div className="w-full py-4 rounded-xl font-bold text-purple-600 bg-purple-50 dark:bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center gap-3">
                                            <Loader2 size={24} className="animate-spin" />
                                            Processing...
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
