
export default function DailyInsight() {
    return (
        <section className="py-12 bg-surface-950 border-y border-white/5">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-surface-900/50 border border-brand-500/20 rounded-2xl p-6 flex gap-4 items-start shadow-lg hover:shadow-brand-500/5 transition-shadow">
                    <div className="p-3 bg-brand-500/10 rounded-full text-brand-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-brand-400 uppercase tracking-wider mb-1">Exam Success Tip</div>
                        <h3 className="text-lg text-white font-medium">"Study in 45 minute focused blocks. Revise the same day you study. Never skip weak subjects."</h3>
                    </div>
                </div>
            </div>
        </section>
    );
}
