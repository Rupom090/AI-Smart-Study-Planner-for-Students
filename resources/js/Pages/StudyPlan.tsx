import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface StudyPlanProps extends PageProps {
    plan: DailyPlan | null;
}

interface DailyPlan {
    id: string;
    plan_date: string;
    total_hours: number;
    tasks: DailyTask[];
}

interface DailyTask {
    id: string;
    task_title: string;
    planned_minutes: number;
    status: 'pending' | 'in_progress' | 'completed';
    task_order: number;
    topic: {
        id: string;
        title: string;
        subject: {
            id: string;
            name: string;
        };
    };
}

export default function StudyPlan({ auth, plan = null }: StudyPlanProps) {
    const { data, setData, post, processing, errors } = useForm({
        available_minutes: 180,
    });

    const handleGenerate = () => {
        post('/plans/generate', {
            preserveScroll: true,
        });
    };

    const handleUpdateStatus = (taskId: string, newStatus: string) => {
        router.patch(`/tasks/${taskId}`, {
            status: newStatus
        }, {
            preserveScroll: true,
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
            case 'in_progress': return 'bg-brand-500/10 text-brand-400 border-brand-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]';
            default: return 'bg-surface-800 text-slate-400 border-surface-700';
        }
    };

    const completedTasks = plan ? plan.tasks.filter(t => t.status === 'completed').length : 0;
    const totalTasks = plan ? plan.tasks.length : 0;
    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-bold leading-tight text-white flex items-center gap-3">
                    <span className="p-2 bg-brand-500/20 rounded-xl border border-brand-500/30 text-brand-400">🤖</span>
                    AI Study Planner
                </h2>
            }
        >
            <Head title="AI Study Plan" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    {/* Generate Plan Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="glass-panel p-8 md:p-10 mb-8 relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
                    >
                        {/* Background Splashes */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>

                        <div className="relative z-10">
                            <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Generate Your Daily Schedule</h3>
                            <p className="text-slate-400 mb-8 max-w-2xl text-lg">
                                Our AI analyzes your subjects, exams, and weak spots to create the perfect hyper-optimized study routine for today.
                            </p>

                            <div className="flex flex-col md:flex-row items-end gap-6 bg-surface-900/60 p-6 md:p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-bold tracking-widest uppercase text-slate-400 mb-3">
                                        Time Commitment (Minutes)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.available_minutes}
                                            onChange={(e) => setData('available_minutes', parseInt(e.target.value))}
                                            min={30}
                                            max={720}
                                            step={15}
                                            className={`w-full bg-slate-950/50 border-surface-700 text-white rounded-xl shadow-inner focus:border-brand-500 focus:ring-brand-500 pl-5 pr-12 py-4 text-xl font-mono transition-all ${errors.available_minutes ? 'border-red-500 focus:border-red-500 ring-red-500' : ''}`}
                                        />
                                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">MIN</span>
                                    </div>
                                    {errors.available_minutes && (
                                        <p className="text-red-400 text-sm mt-2">{errors.available_minutes}</p>
                                    )}
                                    <div className="flex items-center gap-2 mt-3 text-sm text-brand-400/80 font-mono">
                                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                                        ≈ {Math.floor(data.available_minutes / 60)} hours {data.available_minutes % 60} minutes
                                    </div>
                                </div>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full md:w-auto">
                                    <PrimaryButton
                                        onClick={handleGenerate}
                                        disabled={processing}
                                        className="w-full md:w-auto px-10 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] border border-brand-400/30 flex items-center justify-center gap-3 text-lg font-bold transition-all"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-xl">✨</span> Build My Plan
                                            </>
                                        )}
                                    </PrimaryButton>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Today's Plan */}
                    <AnimatePresence mode="wait">
                        {plan && plan.tasks.length > 0 ? (
                            <motion.div
                                key="plan-view"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="glass-panel overflow-hidden rounded-3xl shadow-2xl border border-white/5"
                            >
                                {/* Header & Progress */}
                                <div className="p-8 border-b border-white/10 bg-slate-900/40 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-brand-500/10 to-transparent pointer-events-none"></div>

                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-2xl font-bold text-white tracking-tight">
                                                    Mission Timeline
                                                </h3>
                                                <span className="text-xs font-bold uppercase tracking-widest bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full border border-brand-500/30">
                                                    {new Date(plan.plan_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 font-mono text-sm">
                                                Total Load: <span className="text-white font-bold">{Math.floor(plan.total_hours)}h {Math.round((plan.total_hours % 1) * 60)}m</span>
                                            </p>
                                        </div>

                                        {/* Progress Ring Element */}
                                        <div className="flex items-center gap-4 bg-slate-950/50 p-3 pr-6 rounded-2xl border border-white/5 backdrop-blur-md">
                                            <div className="relative w-14 h-14 flex items-center justify-center">
                                                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                                    <path
                                                        className="text-surface-800"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                    />
                                                    <motion.path
                                                        className="text-brand-500 drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]"
                                                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="3"
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: progressPercentage / 100 }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                </svg>
                                                <div className="absolute font-bold text-xs text-brand-50">{progressPercentage}%</div>
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white">Day Progress</div>
                                                <div className="text-xs text-slate-400">{completedTasks} of {totalTasks} tasks complete</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Task Timeline */}
                                <div className="p-8 relative">
                                    {/* Vertical Timeline Rule */}
                                    <div className="absolute left-10 md:left-[3.25rem] top-8 bottom-8 w-px bg-gradient-to-b from-brand-500/50 via-surface-700 to-transparent"></div>

                                    <motion.div
                                        className="space-y-6 relative z-10"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="show"
                                    >
                                        {plan.tasks
                                            .sort((a, b) => a.task_order - b.task_order)
                                            .map((task, index) => (
                                                <motion.div
                                                    key={task.id}
                                                    variants={itemVariants}
                                                    whileHover={{ x: 4 }}
                                                    className={`relative ml-10 md:ml-16 border rounded-2xl p-6 transition-all duration-300 group
                                                        ${task.status === 'completed'
                                                            ? 'border-emerald-500/20 bg-emerald-500/5 opacity-70 grayscale-[0.3]'
                                                            : task.status === 'in_progress'
                                                                ? 'border-brand-500/40 bg-brand-500/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] scale-[1.01]'
                                                                : 'border-white/5 bg-surface-800/40 hover:bg-surface-800/80 hover:border-white/10'
                                                        }`}
                                                >
                                                    <div className={`absolute -left-10 md:-left-16 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-surface-950 flex items-center justify-center font-bold text-xs shadow-lg transition-colors duration-500 overflow-hidden cursor-pointer
                                                        ${task.status === 'completed' ? 'bg-emerald-500 text-slate-900 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                                                            : task.status === 'in_progress' ? 'bg-brand-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse hover:bg-emerald-500 hover:text-white'
                                                                : 'bg-surface-800 text-slate-500 hover:bg-emerald-500/50 hover:text-white'}`}
                                                        onClick={() => {
                                                            if (task.status !== 'completed') {
                                                                handleUpdateStatus(task.id, 'completed');
                                                            }
                                                        }}
                                                        title={task.status !== 'completed' ? "Mark as complete" : ""}
                                                    >
                                                        {task.status === 'completed' ? '✓' : index + 1}
                                                    </div>

                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border backdrop-blur-sm ${getStatusStyle(task.status)}`}>
                                                                    {task.status.replace('_', ' ')}
                                                                </span>
                                                                <p className="text-sm text-slate-400 font-mono flex items-center gap-2">
                                                                    <span className="text-brand-400">⏱</span> {task.planned_minutes} min
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center gap-3">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={task.status === 'completed'}
                                                                    onChange={() => {
                                                                        if (task.status !== 'completed') {
                                                                            handleUpdateStatus(task.id, 'completed');
                                                                        } else {
                                                                            handleUpdateStatus(task.id, 'pending'); // allow uncheck
                                                                        }
                                                                    }}
                                                                    className="w-5 h-5 rounded-md border-slate-600 bg-surface-900/50 text-emerald-500 focus:ring-emerald-500/50 transition-all cursor-pointer"
                                                                />
                                                                <h4 className={`font-bold text-xl mb-1 transition-colors ${task.status === 'completed' ? 'text-slate-300 line-through decoration-slate-500/50' : 'text-white'}`}>
                                                                    {task.task_title}
                                                                </h4>
                                                            </div>
                                                            <p className="text-sm text-slate-400 flex items-center gap-2">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                                                                <strong className="text-slate-300">{task.topic.subject.name}</strong>
                                                                <span className="text-slate-600">/</span>
                                                                <span>{task.topic.title}</span>
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            {task.status === 'pending' && (
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                                                                    className="px-6 py-3 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-colors shadow-lg"
                                                                >
                                                                    Start Module
                                                                </motion.button>
                                                            )}
                                                            {task.status === 'in_progress' && (
                                                                <>
                                                                    <Link
                                                                        href={route('focus')}
                                                                        className="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white border border-brand-400/30 rounded-xl font-bold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)] shadow-neon flex items-center gap-2"
                                                                    >
                                                                        <span>🎯</span> Open Focus Mode
                                                                    </Link>
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                                                                        className="px-5 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-500/20 transition-colors"
                                                                    >
                                                                        Mark Done
                                                                    </motion.button>
                                                                </>
                                                            )}
                                                            {task.status === 'completed' && (
                                                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 text-lg">
                                                                    ✓
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="empty-state"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="glass-panel p-16 text-center border-dashed border-2 border-white/10 bg-surface-900/30 rounded-3xl relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                        rotateZ: [0, -5, 5, 0]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-24 h-24 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-8 text-5xl shadow-2xl border border-white/5 relative z-10"
                                >
                                    🧠
                                </motion.div>
                                <h3 className="text-2xl font-bold text-white mb-3 relative z-10">Awaiting Your Command</h3>
                                <p className="text-slate-400 max-w-md mx-auto text-lg relative z-10">
                                    Dial in your available study time above, and let our AI architect your optimal mission plan for the day.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
