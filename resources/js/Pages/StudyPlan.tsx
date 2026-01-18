import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { PageProps } from '@/types';

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

export default function StudyPlan({ plan = null }: StudyPlanProps) {
    const [availableMinutes, setAvailableMinutes] = useState(180);
    const [generating, setGenerating] = useState(false);

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const response = await fetch('/api/plans/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ available_minutes: availableMinutes }),
            });
            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Error generating plan:', error);
        } finally {
            setGenerating(false);
        }
    };

    const handleUpdateStatus = async (taskId: string, newStatus: string) => {
        try {
            await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ status: newStatus }),
            });
            window.location.reload();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    AI Study Plan
                </h2>
            }
        >
            <Head title="Study Plan" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    {/* Generate Plan Section */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4">Generate New Study Plan</h3>
                            <div className="flex items-end space-x-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Available Study Time (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={availableMinutes}
                                        onChange={(e) => setAvailableMinutes(parseInt(e.target.value))}
                                        min={30}
                                        max={720}
                                        className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {Math.floor(availableMinutes / 60)}h {availableMinutes % 60}m
                                    </p>
                                </div>
                                <button
                                    onClick={handleGenerate}
                                    disabled={generating}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {generating ? 'Generating...' : 'Generate Plan'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Today's Plan */}
                    {plan && plan.tasks.length > 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <h3 className="text-lg font-semibold">
                                    Study Plan for {new Date(plan.plan_date).toLocaleDateString()}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Total time: {Math.floor(plan.total_hours)}h {Math.round((plan.total_hours % 1) * 60)}m
                                </p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {plan.tasks
                                        .sort((a, b) => a.task_order - b.task_order)
                                        .map((task, index) => (
                                            <div
                                                key={task.id}
                                                className="border rounded-lg p-4 hover:shadow-md transition"
                                            >
                                                <div className="flex items-start space-x-4">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">
                                                                    {task.task_title}
                                                                </h4>
                                                                <p className="text-sm text-gray-500">
                                                                    {task.topic.subject.name} - {task.topic.title}
                                                                </p>
                                                            </div>
                                                            <span
                                                                className={`px-2 py-1 text-xs rounded-full ${getStatusColor(task.status)}`}
                                                            >
                                                                {task.status.replace('_', ' ')}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-sm text-gray-600">
                                                                ⏱️ {task.planned_minutes} minutes
                                                            </p>
                                                            <div className="space-x-2">
                                                                {task.status === 'pending' && (
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(task.id, 'in_progress')}
                                                                        className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                                                                    >
                                                                        Start
                                                                    </button>
                                                                )}
                                                                {task.status === 'in_progress' && (
                                                                    <button
                                                                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                                                                        className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200"
                                                                    >
                                                                        Complete
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
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center text-gray-500">
                                <p className="mb-4">No study plan generated yet.</p>
                                <p className="text-sm">Set your available time above and click "Generate Plan" to create your AI-powered study schedule!</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
