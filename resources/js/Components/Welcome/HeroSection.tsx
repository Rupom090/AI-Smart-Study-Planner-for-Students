
import { Link } from '@inertiajs/react';

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-20 pb-32">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-500/20 rounded-full blur-3xl -mr-32 -mt-32 opacity-50 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-3xl -ml-32 -mb-32 opacity-50"></div>

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-surface-800/80 border border-brand-500/30 backdrop-blur-sm">
                    <span className="text-brand-400 text-sm font-bold tracking-wider uppercase">Cyber Focus AI v2.0</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
                    Dominate Your <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">CSE Exams</span>
                </h1>

                <p className="text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed">
                    Study smarter for CSE exams with structured plans, focused revision, and real progress tracking.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <Link
                        href={route('register')}
                        className="px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-bold text-lg shadow-neon transition-all hover:scale-105"
                    >
                        Create My Study Plan
                    </Link>
                    <Link
                        href="#subjects"
                        className="px-8 py-4 bg-surface-800 hover:bg-surface-700 text-slate-200 rounded-full font-bold text-lg border border-white/10 transition-all hover:scale-105"
                    >
                        Explore Subjects
                    </Link>
                </div>
            </div>
        </section>
    );
}
