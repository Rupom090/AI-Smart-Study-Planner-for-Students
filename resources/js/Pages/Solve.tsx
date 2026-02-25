import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare, UploadCloud, Search, Sparkles, Loader2, FileImage } from 'lucide-react';
import { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

export default function Solve({ auth }: PageProps) {
    const [question, setQuestion] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSolving, setIsSolving] = useState(false);
    const [solution, setSolution] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleTextSubmit = async () => {
        if (!question.trim()) return;

        setIsSolving(true);
        setError(null);
        setSolution(null);
        setImage(null);
        setImagePreview(null);

        try {
            const response = await fetch('/api/v1/solve/text', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({ question })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to solve problem.");
            }

            setSolution(data.solution);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSolving(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setQuestion(''); // Clear text when image is uploaded

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageSubmit = async () => {
        if (!image) return;

        setIsSolving(true);
        setError(null);
        setSolution(null);

        try {
            const formData = new FormData();
            formData.append('image', image);

            const response = await fetch('/api/v1/solve/image', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to solve problem from image.");
            }

            setSolution(data.solution);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
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
                            onClick={() => fileInputRef.current?.click()}
                            className={`bg-white dark:bg-surface-800 rounded-2xl border-2 border-dashed ${imagePreview ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10' : 'border-brand-200 dark:border-surface-700'} p-12 text-center hover:border-brand-500 dark:hover:border-brand-500/50 transition-colors group cursor-pointer relative overflow-hidden`}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                                accept="image/png, image/jpeg, image/webp"
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
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Upload or drop an image</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">
                                            Supported formats: JPEG, PNG, WEBP. Make sure the text or math notation is clearly legible.
                                        </p>
                                        <button className="px-6 py-3 rounded-full bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-md hover:shadow-lg">
                                            Browse Files
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm">
                            <div className="flex items-center gap-3 border-b border-surface-200 dark:border-surface-700 pb-4 mb-4">
                                <Search className="w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleTextSubmit(); }}
                                    placeholder="Or paste your question text here..."
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 disabled:opacity-50"
                                    disabled={isSolving || !!imagePreview}
                                />
                            </div>

                            {error && (
                                <div className="mb-4 text-sm text-red-500">
                                    {error}
                                </div>
                            )}

                            <div className="flex justify-end">
                                <button
                                    onClick={handleTextSubmit}
                                    disabled={isSolving || !question.trim() || !!imagePreview}
                                    className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSolving && question ? <Loader2 className="animate-spin w-4 h-4" /> : <Sparkles size={16} />}
                                    {isSolving && question ? 'Solving...' : 'Solve It'}
                                </button>
                            </div>
                        </div>

                        {/* Solution Area */}
                        <AnimatePresence>
                            {solution && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-500/30 rounded-2xl p-6 md:p-8"
                                >
                                    <div className="flex items-center gap-3 mb-6 border-b border-brand-200/50 dark:border-brand-500/20 pb-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white shadow-sm">
                                            <Sparkles size={20} />
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">AI Solution</h2>
                                    </div>

                                    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:text-brand-700 dark:prose-headings:text-brand-300 prose-pre:bg-slate-900 prose-pre:text-slate-50">
                                        <ReactMarkdown>{solution}</ReactMarkdown>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* History Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 p-6 shadow-sm h-fit"
                    >
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Recent Solutions</h3>
                        <div className="space-y-4">
                            {[
                                { title: "Quadratic Equation", subject: "Math", status: "Solved" },
                                { title: "Cellular Respiration", subject: "Biology", status: "Solved" },
                                { title: "Newton's Second Law", subject: "Physics", status: "Pending" }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 border border-transparent hover:border-surface-200 dark:hover:border-surface-600 transition-all cursor-pointer">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1 line-clamp-1">{item.title}</span>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-brand-600 dark:text-brand-400 font-medium">{item.subject}</span>
                                        <span className={`px-2 py-0.5 rounded-md ${item.status === 'Solved' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-2 text-sm text-brand-600 dark:text-brand-400 font-medium hover:underline">
                            View all history
                        </button>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
