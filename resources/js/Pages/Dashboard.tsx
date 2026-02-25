import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import { motion } from 'framer-motion';
import { Upload, Link as LinkIcon, Mic } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface Subject {
    id: string;
    name: string;
    topics_count?: number;
}

export default function Dashboard({ auth, subjects = [] }: PageProps<{ subjects: Subject[] }>) {
    // Fallback if subjects is undefined
    const safeSubjects = subjects || [];

    const handleAction = (action: string) => {
        if (action === 'Paste') {
            showToast.success('Paste feature coming soon!');
        } else if (action === 'Record') {
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
                    </motion.div>

                    {/* Paste - Placeholder */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <button
                            onClick={() => handleAction('Paste')}
                            className="flex flex-col items-start p-8 rounded-2xl glass-panel w-full group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10 hover:border-purple-500/30 text-left"
                        >
                            <div className="mb-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                                <LinkIcon size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Paste Link</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">YouTube, Website, or raw text</p>
                        </button>
                    </motion.div>

                    {/* Record - Placeholder */}
                    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <button
                            onClick={() => handleAction('Record')}
                            className="flex flex-col items-start p-8 rounded-2xl glass-panel w-full group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30 text-left"
                        >
                            <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                                <Mic size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Record Voice</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Live lecture transcription</p>
                        </button>
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
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
                                whileHover={{ scale: 1.03, y: -5 }}
                                className={`aspect-[16/9] rounded-3xl overflow-hidden relative group cursor-pointer border border-white/20 shadow-lg ${ex.color.split(' ')[0]} dark:${ex.color.split(' ')[1]}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                                <div className="absolute inset-0 p-8 flex flex-col justify-end transform transition-transform duration-300 group-hover:translate-y-[-5px]">
                                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight">{ex.title}</h3>
                                    <p className="text-white/80 font-medium text-sm">{ex.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

            </div>
        </AuthenticatedLayout>
    );
}
