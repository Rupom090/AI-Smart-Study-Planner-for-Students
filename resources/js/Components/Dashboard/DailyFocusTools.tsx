
import { useState } from 'react';
import TextInput from '@/Components/UI/TextInput';
import { Link } from '@inertiajs/react';

export default function DailyFocusTools() {
    const [tasks, setTasks] = useState(['', '', '']);
    const [energy, setEnergy] = useState(50);
    const [distractions, setDistractions] = useState({ social: false, gaming: false, scroll: false });

    const handleTaskChange = (i: number, val: string) => {
        const newTasks = [...tasks];
        newTasks[i] = val;
        setTasks(newTasks);
    };

    return (
        <div className="glass-panel p-6 mb-8 bg-gradient-to-br from-surface-900 via-surface-900 to-brand-900/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span>⚡</span> Daily Focus & Discipline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Top 3 Tasks */}
                <div>
                    <h4 className="text-sm font-bold text-brand-400 uppercase tracking-wider mb-4">Today's Absolute Must-Dos</h4>
                    <div className="space-y-3">
                        {tasks.map((task, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-slate-500 font-mono">0{i + 1}</span>
                                <TextInput
                                    value={task}
                                    onChange={(e) => handleTaskChange(i, e.target.value)}
                                    placeholder={`Priority Task #${i + 1}`}
                                    className="w-full bg-surface-800 border-surface-700 text-sm focus:ring-brand-500 py-1"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Interactive Tools */}
                <div>
                    <h4 className="text-sm font-bold text-brand-400 uppercase tracking-wider mb-4">Energy Level</h4>
                    <input
                        type="range"
                        min="0" max="100"
                        value={energy}
                        onChange={(e) => setEnergy(parseInt(e.target.value))}
                        className="w-full h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-2 mb-4">
                        <span>Low Battery 🪫</span>
                        <span>Full Power ⚡</span>
                    </div>

                    <Link
                        href={route('focus')}
                        className="block w-full py-3 bg-white text-surface-900 rounded-lg font-bold text-center text-sm shadow hover:shadow-lg hover:scale-[1.02] transition-all"
                    >
                        Enter Deep Focus 🧠
                    </Link>
                </div>

                {/* Distraction Checklist */}
                <div>
                    <h4 className="text-sm font-bold text-rose-400 uppercase tracking-wider mb-4">Anti-Distraction Pact</h4>
                    <div className="space-y-2">
                        <label className="flex items-center gap-3 p-2 rounded hover:bg-surface-800/50 cursor-pointer">
                            <input type="checkbox" className="rounded bg-surface-800 border-surface-600 text-rose-500 focus:ring-rose-500" />
                            <span className="text-slate-300 text-sm">No Social Media until 8 PM</span>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded hover:bg-surface-800/50 cursor-pointer">
                            <input type="checkbox" className="rounded bg-surface-800 border-surface-600 text-rose-500 focus:ring-rose-500" />
                            <span className="text-slate-300 text-sm">Phone in another room</span>
                        </label>
                        <label className="flex items-center gap-3 p-2 rounded hover:bg-surface-800/50 cursor-pointer">
                            <input type="checkbox" className="rounded bg-surface-800 border-surface-600 text-rose-500 focus:ring-rose-500" />
                            <span className="text-slate-300 text-sm">No gaming before goals met</span>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
