
import { Link } from '@inertiajs/react';

export default function PlanPreview() {
    return (
        <section className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">

                <div className="flex-1 text-left">
                    <h2 className="text-3xl font-bold text-white mb-6">How your daily plan looks</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        We don't just tell you to study. We tell you exactly **what**, **when**, and **how long**.
                        Our AI breaks your syllabus into manageable chunks so you never feel overwhelmed.
                    </p>
                    <Link
                        href={route('register')}
                        className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-bold shadow-neon transition-all hover:scale-105 inline-block"
                    >
                        Generate my plan now ⚡
                    </Link>
                </div>

                <div className="flex-1 w-full max-w-md">
                    <div className="glass-panel p-6 border border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/5">
                            <span className="text-slate-400 text-sm">Today's Mission</span>
                            <span className="text-brand-400 font-bold">3h 45m Goal</span>
                        </div>

                        <ul className="space-y-4">
                            <li className="flex items-center gap-4 bg-surface-800/50 p-3 rounded-lg">
                                <span className="text-slate-500 font-mono text-xs">09:00</span>
                                <div>
                                    <div className="text-white text-sm font-bold">DSA Arrays Revision</div>
                                    <div className="text-slate-500 text-xs">Dry run insertion logic</div>
                                </div>
                            </li>
                            <li className="flex items-center gap-4 bg-surface-800/50 p-3 rounded-lg">
                                <span className="text-slate-500 font-mono text-xs">10:15</span>
                                <div>
                                    <div className="text-white text-sm font-bold">OS Short Notes</div>
                                    <div className="text-slate-500 text-xs">Paging & Segmentation</div>
                                </div>
                            </li>
                            <li className="flex items-center gap-4 bg-surface-800/50 p-3 rounded-lg border-l-2 border-brand-500">
                                <span className="text-brand-400 font-mono text-xs">20:00</span>
                                <div>
                                    <div className="text-white text-sm font-bold">CN MCQ Practice</div>
                                    <div className="text-slate-500 text-xs">Solve 20 GATE questions</div>
                                </div>
                            </li>
                        </ul>

                        <div className="mt-6 pt-4 border-t border-white/5 text-center text-xs text-slate-500">
                            Updates dynamically based on your progress
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}
