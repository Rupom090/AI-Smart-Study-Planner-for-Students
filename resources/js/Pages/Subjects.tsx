import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { useState, FormEventHandler } from 'react';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, CheckCircle2, Plus } from 'lucide-react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

interface Subject {
    id: string;
    name: string;
    exam_date: string;
    priority_level: number;
    topics: Topic[];
}

interface Topic {
    id: string;
    title: string;
    difficulty: number;
    estimated_hours: number | null;
    is_completed: boolean;
}

interface SubjectsProps extends PageProps {
    subjects: Subject[];
}

export default function Subjects({ subjects = [], auth }: SubjectsProps) {
    const [showAddModal, setShowAddModal] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        exam_date: '',
        priority_level: 3,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('subjects.store'), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const getPriorityColor = (priority: number) => {
        if (priority >= 4) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        if (priority === 3) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        return 'bg-brand-500/10 text-brand-400 border-brand-500/20';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center"
                >
                    <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white tracking-tight">
                        Manage Subjects
                    </h2>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/20 transition-all font-medium text-sm flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} />
                        Add Subject
                    </button>
                </motion.div>
            }
        >
            <Head title="Subjects" />

            <div className="py-8 sm:py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {subjects.length > 0 ? (
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
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {subjects.map((subject) => (
                                <motion.div
                                    variants={{ hidden: { opacity: 0, scale: 0.95, y: 20 }, visible: { opacity: 1, scale: 1, y: 0 } }}
                                    key={subject.id}
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="glass-card bg-white/50 dark:bg-surface-800/50 hover:bg-white/80 dark:hover:bg-surface-800/80 transition-all group relative overflow-hidden p-6 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:shadow-brand-500/5"
                                >
                                    {/* Decorative Blob */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl -mr-16 -mt-16 transition-opacity opacity-0 group-hover:opacity-100"></div>

                                    <div className="flex justify-between items-start mb-5 relative z-10">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                            {subject.name}
                                        </h3>
                                        <span className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full border ${getPriorityColor(subject.priority_level)} shadow-sm`}>
                                            P{subject.priority_level}
                                        </span>
                                    </div>

                                    <div className="space-y-3 relative z-10 max-w-sm">
                                        <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm font-medium">
                                            <Calendar className="w-4 h-4 mr-3 text-brand-500 dark:text-brand-400" />
                                            {new Date(subject.exam_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </div>
                                        <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm font-medium">
                                            <BookOpen className="w-4 h-4 mr-3 text-purple-500 dark:text-purple-400" />
                                            {subject.topics.length} Selected Topics
                                        </div>
                                        <div className="flex items-center text-slate-600 dark:text-slate-400 text-sm font-medium">
                                            <CheckCircle2 className="w-4 h-4 mr-3 text-emerald-500 dark:text-emerald-400" />
                                            {subject.topics.filter(t => t.is_completed).length} Sections Mastery
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row gap-3 relative z-10">
                                        <Link
                                            href={route('subjects.topics', subject.id)}
                                            className="flex-1 text-center py-2.5 bg-slate-100 dark:bg-surface-700 hover:bg-slate-200 dark:hover:bg-surface-600 text-slate-700 dark:text-white text-sm font-bold rounded-xl transition-colors border border-slate-200 dark:border-white/5"
                                        >
                                            Manage Topics
                                        </Link>
                                        <Link
                                            href={route('materials.index', subject.id)}
                                            className="flex-1 text-center py-2.5 bg-gradient-to-r from-brand-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white text-sm font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] flex items-center justify-center gap-2"
                                        >
                                            <span>🧠</span> Smart Tutor
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass-panel p-12 text-center max-w-2xl mx-auto border border-brand-200/50 dark:border-white/10"
                        >
                            <div className="w-24 h-24 bg-brand-50 dark:bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl relative">
                                📚
                                <div className="absolute inset-0 bg-brand-400/20 dark:bg-brand-500/20 rounded-full animate-ping"></div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">Your Study Journey Begins Here</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto text-lg">Add your first subject to start organizing your study plan, creating flashcards, and generating practice quizzes.</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/25 transition-transform hover:scale-105 active:scale-95 font-bold text-lg"
                            >
                                Add Your First Subject
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Add Subject Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-panel w-full max-w-md p-6 relative border border-white/10 shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Add New Subject</h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <InputLabel htmlFor="name" value="Subject Name" className="text-slate-300" />
                                <TextInput
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1 block w-full bg-surface-900/50 border-surface-700 text-slate-200 focus:border-brand-500 focus:ring-brand-500 placeholder-slate-600"
                                    placeholder="e.g. Mathematics"
                                    required
                                    autoFocus
                                />
                                <InputError message={errors.name} className="mt-2 text-rose-400" />
                            </div>

                            <div>
                                <InputLabel htmlFor="exam_date" value="Exam Date" className="text-slate-300" />
                                <TextInput
                                    id="exam_date"
                                    type="date"
                                    value={data.exam_date}
                                    onChange={(e) => setData('exam_date', e.target.value)}
                                    className="mt-1 block w-full bg-surface-900/50 border-surface-700 text-slate-200 focus:border-brand-500 focus:ring-brand-500"
                                    required
                                />
                                <InputError message={errors.exam_date} className="mt-2 text-rose-400" />
                            </div>

                            <div>
                                <InputLabel htmlFor="priority_level" value="Priority Level" className="text-slate-300" />
                                <select
                                    id="priority_level"
                                    value={data.priority_level}
                                    onChange={(e) => setData('priority_level', parseInt(e.target.value))}
                                    className="mt-1 block w-full bg-surface-900/50 border-surface-700 text-slate-200 focus:border-brand-500 focus:ring-brand-500 rounded-md shadow-sm"
                                >
                                    <option value={1}>1 - Low Priority</option>
                                    <option value={2}>2 - Low-Medium</option>
                                    <option value={3}>3 - Medium Priority</option>
                                    <option value={4}>4 - High Priority</option>
                                    <option value={5}>5 - Urgent / Critical</option>
                                </select>
                                <InputError message={errors.priority_level} className="mt-2 text-rose-400" />
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <SecondaryButton
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-surface-800 text-slate-300 border-surface-600 hover:bg-surface-700"
                                >
                                    Cancel
                                </SecondaryButton>
                                <PrimaryButton className="bg-brand-600 hover:bg-brand-500 text-white shadow-neon border-0" disabled={processing}>
                                    {processing ? 'Adding...' : 'Add Subject'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
