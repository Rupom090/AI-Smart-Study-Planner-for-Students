
const RESOURCES = {
    "DSA": [
        { title: "Striver's A2Z Sheet", type: "Web", link: "#" },
        { title: "NeetCode 150", type: "Video", link: "#" },
        { title: "Visualgo.net", type: "Tool", link: "#" }
    ],
    "OS": [
        { title: "OSTEP Book (Free)", type: "Book", link: "#" },
        { title: "Gate Smashers OS Playlist", type: "Video", link: "#" }
    ],
    "System Design": [
        { title: "ByteByteGo", type: "Web", link: "#" },
        { title: "System Design Primer (GitHub)", type: "Repo", link: "#" }
    ]
};

export default function ResourceHub() {
    return (
        <div className="glass-panel p-6 mb-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>📚</span> Curated Resource Hub
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(RESOURCES).map(([subject, items]) => (
                    <div key={subject} className="bg-surface-800/30 p-4 rounded-xl border border-white/5">
                        <h4 className="font-bold text-slate-200 mb-3 border-b border-white/5 pb-2">{subject}</h4>
                        <ul className="space-y-2">
                            {items.map((item, i) => (
                                <li key={i} className="flex justify-between items-center text-sm group cursor-pointer hover:bg-surface-700/50 p-1 rounded transition-colors">
                                    <span className="text-slate-400 group-hover:text-white transition-colors">{item.title}</span>
                                    <span className="text-[10px] bg-brand-500/10 text-brand-400 px-1.5 py-0.5 rounded border border-brand-500/20">{item.type}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
}
