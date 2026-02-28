import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ArrowRight, CheckCircle, BarChart3, Clock, Loader2, RefreshCw, UploadCloud, X } from 'lucide-react';
import { useState, useRef } from 'react';

import Dropdown from '@/Components/Dropdown';

// Define the expected shape of the AI response
interface GradingResult {
    score: number;
    letter_grade: string;
    feedback_summary: string;
    grammar_syntax: string[];
    argument_structure: string[];
    actionable_tips: string[];
}

const RUBRIC_OPTIONS = [
    "Standard Academic Essay",
    "Creative Writing",
    "Technical Report",
    "Research Paper",
    "Short Story",
    "Poetry",
    "Casual Blog Post"
];

export default function PaperGrader({ auth }: PageProps) {
    const [content, setContent] = useState('');
    const [document, setDocument] = useState<File | null>(null);
    const [rubric, setRubric] = useState(RUBRIC_OPTIONS[0]);
    const [isGrading, setIsGrading] = useState(false);
    const [result, setResult] = useState<GradingResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError("File is too large. Maximum size is 10MB.");
                return;
            }
            setDocument(file);
            setContent(''); // Clear text when file is uploaded
            setError(null);
        }
    };

    const handleGrade = async () => {
        if (!document && content.length < 10) {
            setError("Please enter at least a few meaningful sentences or upload a document to grade.");
            return;
        }

        setIsGrading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('rubric', rubric);
            if (document) {
                formData.append('document', document);
            } else {
                formData.append('content', content);
            }

            const response = await fetch('/api/v1/paper-grader', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok || data.feedback?.error) {
                throw new Error(data.feedback?.message || data.message || "Failed to grade paper.");
            }

            setResult(data.feedback);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsGrading(false);
        }
    };
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Paper Grader - Studley AI" />

            <div className="p-6 md:p-10 max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-10 text-center md:text-left"
                >
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 flex items-center justify-center md:justify-start gap-3 tracking-tight">
                        <FileText className="w-8 h-8 text-brand-500" />
                        AI Paper Grader
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">
                        Submit your essays or assignments for instant AI-powered feedback, grading, and improvement suggestions.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Grading Area */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: 0.1 }}
                            className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-8 shadow-sm"
                        >
                            <div className="mb-6">
                                <div className="flex justify-between items-end mb-2">
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                                        Upload Document or Paste Essay
                                    </label>
                                    <span className="text-xs text-slate-500">PDF, TXT, DOCX</span>
                                </div>

                                {document ? (
                                    <div className="w-full h-64 p-6 rounded-xl border border-brand-300 dark:border-brand-500/50 bg-brand-50 dark:bg-brand-900/10 flex flex-col items-center justify-center relative transition-all">
                                        <div className="w-16 h-16 bg-white dark:bg-surface-800 rounded-full flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400 shadow-sm border border-brand-100 dark:border-surface-700">
                                            <FileText size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center line-clamp-1 break-all max-w-[80%]">{document.name}</h3>
                                        <p className="text-slate-500 text-sm mt-1">{(document.size / 1024 / 1024).toFixed(2)} MB</p>

                                        <button
                                            onClick={() => setDocument(null)}
                                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white dark:hover:bg-surface-800 text-slate-400 hover:text-red-500 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <textarea
                                            value={content}
                                            onChange={(e) => { setContent(e.target.value); setError(null); }}
                                            className={`w-full h-64 p-4 pb-16 rounded-xl border bg-surface-50 dark:bg-surface-900 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-brand-500 transition-shadow ${error ? 'border-red-300 focus:border-red-500' : 'border-surface-200 dark:border-surface-600 focus:border-brand-500'}`}
                                            placeholder="Start typing or paste your document here..."
                                            disabled={isGrading}
                                        ></textarea>

                                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span className={content.trim().split(/\s+/).filter(w => w.length > 0).length < 100 && content.length > 0 ? 'text-amber-500' : ''}>
                                                    {content.trim() === '' ? 0 : content.trim().split(/\s+/).length} words
                                                </span>
                                            </div>

                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-300 dark:hover:border-brand-500/50 transition-colors shadow-sm"
                                            >
                                                <UploadCloud size={16} />
                                                Attach File
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".pdf,.txt,.md"
                                    className="hidden"
                                />

                                <div className="mt-2 text-xs text-slate-500 flex justify-end">
                                    {error ? (
                                        <span className="text-red-500 break-words font-medium">{error}</span>
                                    ) : (
                                        <span>Min 100 words recommended</span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-brand-50 dark:bg-brand-500/10 p-4 rounded-xl border border-brand-100 dark:border-brand-500/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-brand-100 dark:bg-brand-500/20 text-brand-600 flex items-center justify-center rounded-lg">
                                        <BarChart3 size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">Grading Rubric</h4>
                                        <p className="text-xs text-brand-600 dark:text-brand-400">{rubric}</p>
                                    </div>
                                </div>

                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <button className="text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 underline focus:outline-none">Change Criteria</button>
                                    </Dropdown.Trigger>
                                    <Dropdown.Content contentClasses="py-1 bg-white dark:bg-studley-dark rounded-xl shadow-xl border border-slate-200 dark:border-white/10 w-56">
                                        {RUBRIC_OPTIONS.map(option => (
                                            <button
                                                key={option}
                                                onClick={() => setRubric(option)}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${rubric === option ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                                            >
                                                {option}
                                            </button>
                                        ))}
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleGrade}
                                    disabled={isGrading || (!document && content.trim() === '')}
                                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600 text-white font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGrading ? (
                                        <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
                                    ) : (
                                        <>Analyze & Grade <ArrowRight size={18} /></>
                                    )}
                                </button>
                            </div>

                            {/* Results Area */}
                            <AnimatePresence>
                                {result && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                        className="overflow-hidden border-t border-surface-200 dark:border-surface-700 pt-8"
                                    >
                                        <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4 mb-8">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Grading Results</h2>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm max-w-lg">{result.feedback_summary}</p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-surface-50 dark:bg-surface-900 p-4 rounded-2xl border border-surface-200 dark:border-surface-700">
                                                <div className="text-center">
                                                    <div className="text-3xl font-black text-brand-600 flex items-baseline justify-center">
                                                        {result.score}<span className="text-sm text-slate-400 font-medium ml-1">/100</span>
                                                    </div>
                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Score</div>
                                                </div>
                                                <div className="w-px h-12 bg-surface-200 dark:bg-surface-700"></div>
                                                <div className="text-center">
                                                    <div className="text-3xl font-black text-purple-600">{result.letter_grade}</div>
                                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Grade</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-red-50 dark:bg-red-500/10 p-5 rounded-2xl border border-red-100 dark:border-red-500/20">
                                                <h4 className="font-bold text-red-900 dark:text-red-400 mb-3 flex items-center gap-2">
                                                    <RefreshCw size={16} /> Grammar & Syntax
                                                </h4>
                                                <ul className="space-y-2">
                                                    {result.grammar_syntax.map((item, i) => (
                                                        <li key={i} className="text-sm text-red-800 dark:text-red-300 flex gap-2">
                                                            <span className="text-red-400 dark:text-red-500 mt-1">•</span> {item}
                                                        </li>
                                                    ))}
                                                    {result.grammar_syntax.length === 0 && <li className="text-sm text-red-800/70 italic">No major issues found.</li>}
                                                </ul>
                                            </div>

                                            <div className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-500/20">
                                                <h4 className="font-bold text-blue-900 dark:text-blue-400 mb-3 flex items-center gap-2">
                                                    <FileText size={16} /> Argument & Structure
                                                </h4>
                                                <ul className="space-y-2">
                                                    {result.argument_structure.map((item, i) => (
                                                        <li key={i} className="text-sm text-blue-800 dark:text-blue-300 flex gap-2">
                                                            <span className="text-blue-400 dark:text-blue-500 mt-1">•</span> {item}
                                                        </li>
                                                    ))}
                                                    {result.argument_structure.length === 0 && <li className="text-sm text-blue-800/70 italic">Looks solid.</li>}
                                                </ul>
                                            </div>

                                            <div className="md:col-span-2 bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                                                <h4 className="font-bold text-emerald-900 dark:text-emerald-400 mb-3 flex items-center gap-2">
                                                    <CheckCircle size={16} /> Actionable Tips to Improve
                                                </h4>
                                                <ul className="space-y-2">
                                                    {result.actionable_tips.map((item, i) => (
                                                        <li key={i} className="text-sm text-emerald-800 dark:text-emerald-300 flex gap-2 font-medium">
                                                            <ArrowRight size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* How It Works Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">How it works</h3>
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <div className="mt-0.5 text-brand-500"><CheckCircle size={18} /></div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white block">Grammar & Syntax</strong> Detailed checks for clarity and correctness.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-0.5 text-purple-500"><CheckCircle size={18} /></div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white block">Argument & Structure</strong> Feedback on thesis strength and logical flow.</p>
                                </li>
                                <li className="flex gap-3">
                                    <div className="mt-0.5 text-emerald-500"><CheckCircle size={18} /></div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white block">Actionable Advice</strong> Specific tips on how to improve your final score.</p>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-surface-100 dark:bg-surface-800/50 rounded-2xl border border-surface-200 dark:border-surface-700 p-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2"><Clock size={16} /> Recent Scans</h3>
                            <div className="text-sm text-slate-500 dark:text-slate-400 italic">No recent scans found. Grade your first paper!</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
