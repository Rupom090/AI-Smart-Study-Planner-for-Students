
export default function FocusPhilosophy() {
    return (
        <section className="py-24 relative overflow-hidden bg-brand-900/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">

                <div className="flex-1 order-2 md:order-1 relative">
                    {/* Decorative Blur */}
                    <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-[80px] opacity-20 animate-pulse-slow"></div>

                    <div className="relative grid grid-cols-2 gap-4">
                        {/* Mock Timer Card */}
                        <div className="col-span-2 bg-surface-900/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Deep Work Session</span>
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                </div>
                            </div>
                            <div className="text-center mb-8">
                                <div className="text-7xl font-mono font-bold text-white tracking-widest mb-2 tabular-nums">45:00</div>
                                <div className="text-sm text-brand-400 font-medium">Focus Mode Active</div>
                            </div>
                            <div className="w-full bg-surface-800 h-1.5 rounded-full overflow-hidden">
                                <div className="h-full bg-brand-500 w-[100%] animate-[width_45m_linear]"></div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="bg-surface-900/60 backdrop-blur p-4 rounded-xl border border-white/5">
                            <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Focus Score</div>
                            <div className="text-2xl font-bold text-white">94<span className="text-sm text-slate-600">/100</span></div>
                        </div>
                        <div className="bg-surface-900/60 backdrop-blur p-4 rounded-xl border border-white/5">
                            <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Distractions</div>
                            <div className="text-2xl font-bold text-white">0<span className="text-sm text-slate-600">/hr</span></div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 order-1 md:order-2">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Focus is a skill.<br />We train it.</h2>
                    <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                        Studying longer does not mean studying better. An hour of deep work beats 4 hours of distracted reading.
                        <br /><br />
                        Cyber Focus helps you protect attention, measure effort, and eliminate digital noise.
                    </p>
                </div>

            </div>
        </section>
    );
}
