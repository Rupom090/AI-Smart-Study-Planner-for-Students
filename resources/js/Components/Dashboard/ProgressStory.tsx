
export default function ProgressStory({ messages }: { messages: string[] }) {
    if (!messages || messages.length === 0) return null;

    return (
        <div className="mb-8 space-y-2">
            {messages.map((msg, i) => (
                <div key={i} className="bg-surface-800/50 border-l-4 border-brand-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3">
                    <span className="text-brand-400 text-lg">🤖</span>
                    <p className="text-slate-300 text-sm md:text-base font-medium leading-relaxed">
                        {msg}
                    </p>
                </div>
            ))}
        </div>
    );
}
