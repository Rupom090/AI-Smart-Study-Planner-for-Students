
import { useState, useEffect } from 'react';

const QUOTES = [
    "You are not behind. You just need a better system.",
    "Consistency beats intelligence every time.",
    "Studying 2 focused hours beats 6 distracted hours.",
    "Your future job depends on today's effort.",
    "Exams are temporary. Skills stay forever.",
    "Code is like humor. When you have to explain it, it’s bad. Write clean code.",
    "First, solve the problem. Then, write the code.",
];

export default function MotivationBanner() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % QUOTES.length);
        }, 10000); // 10 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full bg-gradient-to-r from-brand-900/50 to-surface-900 border-y border-white/5 py-3 px-4 mb-8 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
                <span className="text-brand-400 text-lg">💡</span>
                <p className="text-slate-300 text-sm md:text-base italic font-medium text-center animate-fade-in key={index}">
                    "{QUOTES[index]}"
                </p>
            </div>
        </div>
    );
}
