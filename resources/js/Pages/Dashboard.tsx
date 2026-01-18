import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

interface Subject {
    id: string;
    name: string;
    exam_date: string;
    priority_level: number;
    topics_count?: number;
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
    topic: {
        id: string;
        title: string;
        subject: Subject;
    };
}

interface DashboardProps extends PageProps {
    subjects: Subject[];
    todaysPlan: DailyPlan | null;
    stats: {
        totalSubjects: number;
        totalTopics: number;
        completedTopics: number;
        todayTasksCompleted: number;
        todayTasksTotal: number;
    };
}

export default function Dashboard({ subjects = [], todaysPlan = null, stats = { totalSubjects: 0, totalTopics: 0, completedTopics: 0, todayTasksCompleted: 0, todayTasksTotal: 0 } }: DashboardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority: number) => {
        if (priority >= 4) return 'bg-red-100 text-red-800';
        if (priority === 3) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    AI Smart Study Planner Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-sm text-gray-500">Total Subjects</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.totalSubjects}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-sm text-gray-500">Total Topics</div>
                            <div className="text-3xl font-bold text-gray-900">{stats.totalTopics}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-sm text-gray-500">Completed Topics</div>
                            <div className="text-3xl font-bold text-green-600">{stats.completedTopics}</div>
                        </div>
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                            <div className="text-sm text-gray-500">Today's Progress</div>
                            <div className="text-3xl font-bold text-blue-600">
                                {stats.todayTasksCompleted}/{stats.todayTasksTotal}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Today's Study Plan */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Today's Study Plan</h3>
                                    <a
                                        href="/study-plan"
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        View Full Plan
                                    </a>
                                </div>
                            </div>
                            <div className="p-6">
                                {todaysPlan && todaysPlan.tasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {todaysPlan.tasks.map((task) => (
                                            <div
                                                key={task.id}
                                                className="border rounded-lg p-4 hover:shadow-md transition"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex-1">
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
                                                <div className="text-sm text-gray-600">
                                                    ⏱️ {task.planned_minutes} minutes
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="mb-4">No study plan for today. Get started by adding subjects and generating your personalized AI study plan!</p>
                                        <a
                                            href="/study-plan"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Generate Study Plan
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subjects Overview */}
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold">Your Subjects</h3>
                                    <a
                                        href="/subjects"
                                        className="text-sm text-blue-600 hover:text-blue-800"
                                    >
                                        Manage Subjects
                                    </a>
                                </div>
                            </div>
                            <div className="p-6">
                                {subjects.length > 0 ? (
                                    <div className="space-y-3">
                                        {subjects.slice(0, 5).map((subject) => (
                                            <div
                                                key={subject.id}
                                                className="border rounded-lg p-4 hover:shadow-md transition"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-gray-900">
                                                            {subject.name}
                                                        </h4>
                                                        <p className="text-sm text-gray-500">
                                                            Exam: {new Date(subject.exam_date).toLocaleDateString()}
                                                        </p>
                                                        {subject.topics_count !== undefined && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {subject.topics_count} topics
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(subject.priority_level)}`}
                                                    >
                                                        Priority {subject.priority_level}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="mb-4">No subjects added yet. Start by adding your subjects and exam dates!</p>
                                        <a
                                            href="/subjects"
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                        >
                                            Add Your First Subject
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
