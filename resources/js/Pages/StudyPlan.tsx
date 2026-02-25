import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState, FormEventHandler } from 'react';
import { PageProps } from '@/types';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

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
            onSuccess: () => {
                // Plan generated successfully
            },
        });
    };

    const handleUpdateStatus = (taskId: string, newStatus: string) => {
        router.patch(`/tasks/${taskId}`, {
            status: newStatus
        }, {
            preserveScroll: true,
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'in_progress': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            default: return 'bg-surface-800 text-slate-400 border-surface-700';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="text-xl font-bold leading-tight text-white flex items-center gap-2">
                    <span className="text-brand-400">🤖</span> AI Study Planner
                </h2>
            }
        >
            <Head title="AI Study Plan" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Generate Plan Section */}
                    <div className="glass-panel p-8 mb-8 relative overflow-hidden">
                        {/* Background Splashes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>

                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-2">Generate Your Daily Schedule</h3>
                            <p className="text-slate-400 mb-6 max-w-2xl">
                                Our AI analyzes your subjects, exams, and weak spots to create the perfect study routine for today.
                            </p>

                            <div className="flex flex-col sm:flex-row items-end gap-4 bg-surface-900/50 p-6 rounded-xl border border-white/5">
                                <div className="flex-1 w-full">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        How many minutes can you study today?
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={data.available_minutes}
                                            onChange={(e) => setData('available_minutes', parseInt(e.target.value))}
                                            min={30}
                                            max={720}
                                            step={15}
                                            className={`w-full bg-surface-950 border-surface-700 text-white rounded-lg shadow-sm focus:border-brand-500 focus:ring-brand-500 pl-4 pr-12 py-3 text-lg font-mono ${errors.available_minutes ? 'border-red-500 focus:border-red-500 ring-red-500' : ''}`}
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">min</span>
                                    </div>
                                    {errors.available_minutes && (
                                        <p className="text-red-400 text-sm mt-1">{errors.available_minutes}</p>
                                    )}
                                    <p className="text-xs text-brand-400/80 mt-2 font-mono">
                                        ≈ {Math.floor(data.available_minutes / 60)}h {data.available_minutes % 60}m
                                    </p>
                                </div>
                                <PrimaryButton
                                    onClick={handleGenerate}
                                    disabled={processing}
                                    className="w-full sm:w-auto px-8 py-3.5 bg-brand-600 hover:bg-brand-500 text-white shadow-neon border-0 flex items-center justify-center gap-2 text-base"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Calculating...
                                        </>
                                    ) : (
                                        <>
                                            <span>✨</span> Generate Plan
                                        </>
                                    )}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>

                    {/* Today's Plan */}
                    {plan && plan.tasks.length > 0 ? (
                        <div className="glass-card overflow-hidden">
                            <div className="p-6 border-b border-white/10 bg-surface-900/50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        📅 Plan for {new Date(plan.plan_date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                                    </h3>
                                    <p className="text-sm text-brand-400 mt-1 font-mono">
                                        Total Load: {Math.floor(plan.total_hours)}h {Math.round((plan.total_hours % 1) * 60)}m
                                    </p>
                                </div>
                                <div className="text-xs text-slate-500 border border-white/5 px-2 py-1 rounded">
                                    AI Model: Heuristic v1
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {plan.tasks
                                        .sort((a, b) => a.task_order - b.task_order)
                                        .map((task, index) => (
                                            <div
                                                key={task.id}
                                                className={`border border-white/5 rounded-xl p-5 hover:bg-white/5 transition-all group ${task.status === 'completed' ? 'opacity-60 grayscale-[0.5]' : 'bg-surface-800/30'}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${task.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-500/20 text-brand-400'}`}>
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className={`font-bold text-lg truncate pr-4 ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-white'}`}>
                                                                    {task.task_title}
                                                                </h4>
                                                                <p className="text-sm text-slate-400 flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                                                                    {task.topic.subject.name}
                                                                    <span className="text-slate-600">/</span>
                                                                    {task.topic.title}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(task.status)}`}
                                                            >
                                                                {task.status.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-4">
                                                            <p className="text-sm text-slate-400 font-mono flex items-center gap-2">
                                                                ⏱️ {task.planned_minutes} min
                                                            </p>
                                                            <div className="flex gap-2">
                                                                {task.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                                                                        className="text-xs px-4 py-2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-colors font-medium"
                                                                    >
                                                                        Start Focus
                                                                    </button>
                                                                )}
                                                                {task.status === 'in_progress' && (
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                                                                        className="text-xs px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors font-medium"
                                                                    >
                                                                        Mark Complete
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-panel p-12 text-center border-dashed border-2 border-white/10 bg-transparent">
                            <div className="w-20 h-20 bg-surface-800 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">🧠</div>
                            <h3 className="text-xl font-bold text-white mb-2">Ready to plan your day?</h3>
                            <p className="text-slate-400 max-w-sm mx-auto">
                                Enter your available time above and let the AI build your personalized schedule.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
