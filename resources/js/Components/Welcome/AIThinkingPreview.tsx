
import { Link } from '@inertiajs/react';

export default function AIThinkingPreview() {
    return (
        <section className="py-24 bg-surface-950/30 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row gap-16 items-center">

                    <div className="flex-1">
                        <div className="inline-block mb-4 px-3 py-1 rounded bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                            The Algorithm
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">How your daily plan looks.</h2>
                        <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                            It's not random. It's calculated. We parse your syllabus and build a mathematically optimal path to an A Grade.
                        </p>

                        <div className="space-y-6">
                            <div className="bg-surface-900/80 rounded-xl p-6 border border-white/5 shadow-2xl">
                                {[
                                    { time: "09:00 - 10:00", task: "DSA Arrays Revision", type: "High Focus" },
                                    { time: "10:15 - 10:45", task: "Operating Systems Notes", type: "Quick Review" },
                                    { time: "02:00 - 03:00", task: "CN MCQ Practice", type: "Testing" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                                        <div className="text-xs font-mono text-slate-500 w-24">{item.time}</div>
                                        <div className="flex-1 text-sm font-medium text-white">{item.task}</div>
                                        <div className="text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded">{item.type}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8">
                            <Link href={route('register')} className="inline-flex items-center justify-center px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-lg transition-all hover:scale-105">
                                Generate my plan now
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative">
                        {/* Visual representation of the 'Brain' */}
                        <div className="aspect-square max-w-md mx-auto relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-brand-500/20 to-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
                            <div className="relative z-10 glass-card h-full flex flex-col justify-center items-center text-center p-8 border-indigo-500/20">
                                <div className="text-6xl mb-6 animate-float">🧠</div>
                                <div className="text-2xl font-bold text-white mb-2">Processing...</div>
                                <div className="font-mono text-xs text-indigo-300 bg-surface-950/50 px-4 py-2 rounded">
                                    OPTIMIZING_PATH_TO_A_GRADE
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
