
export default function StudentDiagnostic() {
    return (
        <section className="py-24 bg-surface-950/50 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Most students fail because</h2>
                    <p className="text-slate-400">Avoid these common mistakes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { icon: "📖", title: "No Revision", desc: "They read without active recall.", fix: "Scheduled Review" },
                        { icon: "🐢", title: "Starting Late", desc: "They wait until the last week.", fix: "Daily Targets" },
                        { icon: "⚖️", title: "Equal Focus", desc: "They study everything equally.", fix: "Weighted Priority" },
                        { icon: "🧭", title: "No Clear Plan", desc: "They wake up and wonder what to study.", fix: "Auto-Roadmap" },
                    ].map((item, i) => (
                        <div key={i} className="group relative p-8 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-brand-500/30 transition-all duration-500 hover:-translate-y-1">
                            <div className="mb-6 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 text-3xl grayscale group-hover:grayscale-0">{item.icon}</div>
                            <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">{item.desc}</p>

                            {/* Insight Line */}
                            <div className="flex items-center gap-2 pt-4 border-t border-white/5">
                                <span className="w-1 h-1 rounded-full bg-brand-500"></span>
                                <span className="text-xs font-mono text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                                    Fix: {item.fix}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <p className="text-lg font-medium text-slate-300">
                        Cyber Focus fixes this with <span className="text-brand-400 font-bold">data driven study planning</span>.
                    </p>
                </div>
            </div>
        </section>
    );
}
