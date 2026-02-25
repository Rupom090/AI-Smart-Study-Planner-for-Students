
export default function BehaviorInsights() {
    return (
        <section className="py-24 bg-surface-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">What data shows about top scorers</h2>
                    <p className="text-slate-400">Success leaves clues.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-12">
                    {[
                        { val: "60%", label: "Better Retention", desc: "For students who revise within 24 hours of learning." },
                        { val: "40m", label: "Ideal Session", desc: "Deep focus sessions above 40 minutes skyrocket recall." },
                        { val: "3x", label: "Less Stress", desc: "When difficult subjects are tackled in the morning." },
                    ].map((stat, i) => (
                        <div key={i} className="text-center group">
                            <div className="text-6xl font-black text-white mb-3 tracking-tighter group-hover:text-brand-400 transition-colors">{stat.val}</div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{stat.label}</div>
                            <p className="text-slate-400 text-sm max-w-xs mx-auto">{stat.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
