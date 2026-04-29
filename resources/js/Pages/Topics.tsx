import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { useState, FormEventHandler } from 'react';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Calendar, CheckCircle2, ChevronLeft, Plus, Trash2, Clock, BarChart } from 'lucide-react';
import InputLabel from '@/Components/UI/InputLabel';
import TextInput from '@/Components/UI/TextInput';
import InputError from '@/Components/UI/InputError';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import SecondaryButton from '@/Components/UI/SecondaryButton';

interface Topic {
    id: string;
    title: string;
    difficulty: number;
    estimated_hours: number | null;
    is_completed: boolean;
}

interface Subject {
    id: string;
    name: string;
    exam_date: string;
    priority_level: number;
    topics: Topic[];
}

interface TopicsProps extends PageProps {
    subject: Subject;
}

export default function Topics({ subject, auth }: TopicsProps) {
    const [showAddModal, setShowAddModal] = useState(false);

    // Add Topic Form
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        difficulty: 3,
        estimated_hours: 1,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('topics.store', subject.id), {
            onSuccess: () => {
                setShowAddModal(false);
                reset();
            },
        });
    };

    const toggleCompletion = (topic: Topic) => {
        router.patch(route('topics.update', topic.id), {
            is_completed: !topic.is_completed
        }, {
            preserveScroll: true,
        });
    };

    const deleteTopic = (topic: Topic) => {
        if (confirm('Are you sure you want to delete this topic?')) {
            router.delete(route('topics.destroy', topic.id));
        }
    };

    const getDifficultyColor = (level: number) => {
        if (level >= 4) return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        if (level === 3) return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
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
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('subjects')}
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-surface-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold leading-tight text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                {subject.name} <span className="text-slate-300 dark:text-slate-600 text-base font-normal">/</span> <span className="text-brand-600 dark:text-brand-400">Section Mastery</span>
                            </h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" /> Exam: {new Date(subject.exam_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/20 transition-all font-medium text-sm flex items-center gap-2 hover:scale-105 active:scale-95"
                    >
                        <Plus size={18} />
                        Add Section
                    </button>
                </motion.div>
            }
        >
            <Head title={`Topics - ${subject.name}`} />

            <div className="py-8 sm:py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    {subject.topics && subject.topics.length > 0 ? (
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: { staggerChildren: 0.05 }
                                }
                            }}
                            className="grid gap-4"
                        >
                            {subject.topics.map((topic) => (
                                <motion.div
                                    variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
                                    key={topic.id}
                                    className={`glass-card p-4 sm:p-5 flex items-center justify-between group transition-all bg-white/50 dark:bg-surface-800/50 border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md ${topic.is_completed ? 'opacity-60 grayscale-[0.3]' : 'hover:border-brand-300 dark:hover:border-brand-500/30'}`}
                                >
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <button
                                            onClick={() => toggleCompletion(topic)}
                                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${topic.is_completed
                                                ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-400'
                                                }`}
                                        >
                                            {topic.is_completed && <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                                        </button>

                                        <div>
                                            <h3 className={`font-bold text-lg sm:text-xl transition-colors ${topic.is_completed ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400'}`}>
                                                {topic.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm mt-1.5 font-medium">
                                                <span className={`px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${getDifficultyColor(topic.difficulty)}`}>
                                                    <BarChart className="w-3.5 h-3.5" /> Diff: {topic.difficulty}/5
                                                </span>
                                                <span className="text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                                                    <Clock className="w-3.5 h-3.5 text-purple-500" /> {topic.estimated_hours}h est.
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => deleteTopic(topic)}
                                            className="p-2 sm:p-2.5 text-slate-400 hover:text-rose-500 bg-white dark:bg-surface-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-white/5 rounded-full transition-colors shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
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
                                🎯
                                <div className="absolute inset-0 bg-brand-400/20 dark:bg-brand-500/20 rounded-full animate-ping"></div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">No sections defined yet</h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-sm mx-auto text-lg">Break down <strong className="text-brand-600 dark:text-brand-400">{subject.name}</strong> into smaller, manageable sections to start tracking your mastery.</p>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/25 transition-transform hover:scale-105 active:scale-95 font-bold text-lg inline-flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" /> Add First Section
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Add Topic Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white dark:bg-surface-800 w-full max-w-md p-6 sm:p-8 rounded-2xl relative border border-slate-200 dark:border-white/10 shadow-2xl"
                        >
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Add New Section</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="title" value="Section Title" className="text-slate-700 dark:text-slate-300 font-semibold" />
                                    <TextInput
                                        id="title"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        className="mt-1.5 block w-full bg-slate-50 dark:bg-surface-900/50 border-slate-200 dark:border-surface-700 text-slate-900 dark:text-slate-200 focus:border-brand-500 focus:ring-brand-500 placeholder-slate-400 dark:placeholder-slate-600 rounded-lg"
                                        placeholder="e.g. Algebra Basics"
                                        required
                                        autoFocus
                                    />
                                    <InputError message={errors.title} className="mt-2 text-rose-500 dark:text-rose-400" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="difficulty" value="Difficulty (1-5)" className="text-slate-700 dark:text-slate-300 font-semibold" />
                                        <input
                                            type="number"
                                            id="difficulty"
                                            min="1"
                                            max="5"
                                            value={data.difficulty}
                                            onChange={(e) => setData('difficulty', parseInt(e.target.value))}
                                            className="mt-1.5 block w-full bg-slate-50 dark:bg-surface-900/50 border-slate-200 dark:border-surface-700 text-slate-900 dark:text-slate-200 focus:border-brand-500 focus:ring-brand-500 rounded-lg shadow-sm"
                                            required
                                        />
                                        <InputError message={errors.difficulty} className="mt-2 text-rose-500 dark:text-rose-400" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="estimated_hours" value="Est. Hours" className="text-slate-700 dark:text-slate-300 font-semibold" />
                                        <input
                                            type="number"
                                            id="estimated_hours"
                                            min="0.5"
                                            step="0.5"
                                            value={data.estimated_hours}
                                            onChange={(e) => setData('estimated_hours', parseFloat(e.target.value))}
                                            className="mt-1.5 block w-full bg-slate-50 dark:bg-surface-900/50 border-slate-200 dark:border-surface-700 text-slate-900 dark:text-slate-200 focus:border-brand-500 focus:ring-brand-500 rounded-lg shadow-sm"
                                            required
                                        />
                                        <InputError message={errors.estimated_hours} className="mt-2 text-rose-500 dark:text-rose-400" />
                                    </div>
                                </div>

                                <div className="mt-8 pt-4 border-t border-slate-200 dark:border-surface-700 flex justify-end gap-3">
                                    <SecondaryButton
                                        onClick={() => setShowAddModal(false)}
                                        className="bg-white dark:bg-surface-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-surface-600 hover:bg-slate-50 dark:hover:bg-surface-700"
                                    >
                                        Cancel
                                    </SecondaryButton>
                                    <PrimaryButton className="bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/25 border-0" disabled={processing}>
                                        {processing ? 'Adding...' : 'Add Section'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthenticatedLayout>
    );
}
