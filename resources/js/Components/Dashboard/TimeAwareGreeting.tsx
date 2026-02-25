
import { useState, useEffect } from 'react';

export default function TimeAwareGreeting({ userName }: { userName: string }) {
    const [timeBlock, setTimeBlock] = useState<'morning' | 'afternoon' | 'evening' | 'night'>('morning');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) setTimeBlock('morning');
        else if (hour >= 12 && hour < 17) setTimeBlock('afternoon');
        else if (hour >= 17 && hour < 22) setTimeBlock('evening');
        else setTimeBlock('night');
    }, []);

    const content = {
        morning: {
            greeting: "Good morning",
            icon: "☀️",
            advice: "High cognitive energy detected. Tackle your hardest theory subjects now.",
            color: "text-amber-400"
        },
        afternoon: {
            greeting: "Good afternoon",
            icon: "🌤️",
            advice: "Energy dip possible. Switch to problem solving or active recall tasks.",
            color: "text-sky-400"
        },
        evening: {
            greeting: "Good evening",
            icon: "🌙",
            advice: "Wrap up new topics. Focus on revision and consolidation.",
            color: "text-indigo-400"
        },
        night: {
            greeting: "Late night session",
            icon: "🦉",
            advice: "Avoid heavy logic. Review formulas and prepare for sleep.",
            color: "text-purple-400"
        }
    };

    const current = content[timeBlock];

    return (
        <div className="mb-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">{current.icon}</span>
                <span>{current.greeting}, <span className={current.color}>{userName}</span></span>
            </h2>
            <p className="text-slate-400 mt-1 ml-10 text-sm border-l-2 border-white/10 pl-3">
                {current.advice}
            </p>
        </div>
    );
}
