
export default function TipsCarousel() {
    return (
        <section className="py-20 bg-surface-950/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-white mb-4">Exam Success Habits</h2>
                    <p className="text-slate-400">Small changes, massive results.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[
                        { title: "Block Mode", text: "Study in 45 minute focused blocks. No phone. No tabs." },
                        { title: "Immediate Revision", text: "Revise what you studied the SAME day. Retention doubles." },
                        { title: "Attack Weakness", text: "Never skip weak subjects. They drag your CGPA down." },
                        { title: "Structure Answers", text: "Write point-wise. Examiners hate giant paragraphs." },
                    ].map((tip, i) => (
                        <div key={i} className="bg-surface-800/50 p-6 rounded-xl border border-white/5">
                            <h3 className="font-bold text-brand-300 mb-3">{tip.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{tip.text}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
