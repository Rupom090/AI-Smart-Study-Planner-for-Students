import { Link, Head } from '@inertiajs/react';
import { PageProps } from '@/types';

export default function Welcome({
    auth,
}: PageProps) {
    return (
        <>
            <Head title="AI Smart Study Planner - Welcome" />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
                {/* Navigation */}
                <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">📚</span>
                        </div>
                        <span className="text-white text-xl font-bold">AI Study Planner</span>
                    </div>
                    <div className="flex gap-4">
                        {auth.user ? (
                            <Link
                                href="/dashboard"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="px-6 py-2 text-white hover:text-blue-300 font-semibold"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                                >
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </nav>

                {/* Hero Section */}
                <div className="max-w-7xl mx-auto px-6 py-20">
                    <div className="text-center mb-20">
                        <h1 className="text-5xl font-bold text-white mb-6">
                            AI-Powered Study Planning for Students
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Create personalized study schedules powered by artificial intelligence. 
                            Optimize your learning, ace your exams, and manage your time effectively.
                        </p>
                        {!auth.user && (
                            <Link
                                href={route('register')}
                                className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg"
                            >
                                Get Started Free
                            </Link>
                        )}
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        <div className="bg-slate-800 rounded-lg p-8 hover:shadow-lg hover:shadow-blue-500/30 transition">
                            <div className="text-4xl mb-4">🤖</div>
                            <h3 className="text-xl font-bold text-white mb-3">AI-Powered Planning</h3>
                            <p className="text-gray-300">
                                Our intelligent algorithm creates optimal study schedules based on exam dates, 
                                subject priorities, and your available time.
                            </p>
                        </div>

                        <div className="bg-slate-800 rounded-lg p-8 hover:shadow-lg hover:shadow-blue-500/30 transition">
                            <div className="text-4xl mb-4">📚</div>
                            <h3 className="text-xl font-bold text-white mb-3">Subject Management</h3>
                            <p className="text-gray-300">
                                Organize multiple subjects with exam dates and priority levels. 
                                Break down each subject into manageable topics.
                            </p>
                        </div>

                        <div className="bg-slate-800 rounded-lg p-8 hover:shadow-lg hover:shadow-blue-500/30 transition">
                            <div className="text-4xl mb-4">✅</div>
                            <h3 className="text-xl font-bold text-white mb-3">Progress Tracking</h3>
                            <p className="text-gray-300">
                                Monitor your study progress with detailed analytics. 
                                Track completed tasks and measure your improvement over time.
                            </p>
                        </div>

                        <div className="bg-slate-800 rounded-lg p-8 hover:shadow-lg hover:shadow-blue-500/30 transition">
                            <div className="text-4xl mb-4">📊</div>
                            <h3 className="text-xl font-bold text-white mb-3">Smart Dashboard</h3>
                            <p className="text-gray-300">
                                Get a complete overview of your study plan with visual insights. 
                                See today's tasks and upcoming exams at a glance.
                            </p>
                        </div>

                        <div className="bg-slate-800 rounded-lg p-8 hover:shadow-lg hover:shadow-blue-500/30 transition">
                            <div className="text-4xl mb-4">⏱️</div>
                            <h3 className="text-xl font-bold text-white mb-3">Time Management</h3>
                            <p className="text-gray-300">
                                Set your available study time and let AI allocate it intelligently 
                                across your subjects and topics.
                            </p>
                        </div>

                        <div className="bg-slate-800 rounded-lg p-8 hover:shadow-lg hover:shadow-blue-500/30 transition">
                            <div className="text-4xl mb-4">🎯</div>
                            <h3 className="text-xl font-bold text-white mb-3">Personalized Plans</h3>
                            <p className="text-gray-300">
                                Get study plans tailored to your needs. Regenerate plans anytime 
                                to adapt to your changing schedule.
                            </p>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-12 text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Ready to Transform Your Study Habits?
                        </h2>
                        <p className="text-lg text-blue-100 mb-8">
                            Join thousands of students using AI Smart Study Planner to ace their exams.
                        </p>
                        {!auth.user && (
                            <Link
                                href={route('register')}
                                className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 font-bold text-lg"
                            >
                                Start Your Free Account
                            </Link>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-slate-700 mt-20 py-10">
                    <div className="max-w-7xl mx-auto px-6 text-center text-gray-400">
                        <p>© 2026 AI Smart Study Planner. Built to help students succeed.</p>
                    </div>
                </footer>
            </div>
        </>
    );
}
