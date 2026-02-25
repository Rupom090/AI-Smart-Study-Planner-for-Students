
export default function RealityCheck() {
    return (
        <section className="py-20 bg-surface-950/50 border-y border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Why Most Students Fail Exams</h2>
                    <p className="text-slate-400">It's not lack of talent. It's lack of strategy.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: "📖", title: "Passive Reading", desc: "Reading without revision creates an illusion of competence." },
                        { icon: "⏳", title: "Starting Late", desc: "Cramming effectively is a myth. You need spaced repetition." },
                        { icon: "⚖️", title: "Equality Trap", desc: "Studying low-weight topics as much as high-weight ones." },
                        { icon: "🧭", title: "No Clear Plan", desc: "Waking up and guessing what to study leads to burnout." },
                    ].map((item, i) => (
                        <div key={i} className="glass-card p-8 border-t-4 border-t-rose-500 hover:bg-surface-800/80 transition-all">
                            <div className="text-4xl mb-4">{item.icon}</div>
                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <div className="inline-block p-4 bg-brand-900/20 border border-brand-500/20 rounded-xl">
                        <p className="text-brand-300 font-bold text-lg">✨ Cyber Focus fixes this with data-driven study planning.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
