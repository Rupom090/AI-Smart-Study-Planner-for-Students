
import { Link } from '@inertiajs/react';

export default function FooterCTA() {
    return (
        <section className="py-24 text-center">
            <div className="max-w-3xl mx-auto px-4 relative z-10">
                <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter">
                    Your exams are coming. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">Do not study blindly.</span>
                </h2>
                <p className="text-xl text-slate-400 mb-12">Study with clarity.</p>
                <div className="w-24 h-1 bg-gradient-to-r from-brand-500 to-transparent mx-auto rounded-full mb-12"></div>

                <Link
                    href={route('register')}
                    className="group relative px-10 py-5 bg-white text-surface-950 rounded-full font-bold text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all inline-block overflow-hidden"
                >
                    <span className="relative z-10 group-hover:tracking-wider transition-all">Start Studying Smarter</span>
                    <div className="absolute inset-0 bg-slate-200 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                </Link>

                <p className="mt-8 text-sm text-slate-500">
                    © 2026 Cyber Focus AI. Built for CSE Students.
                </p>
            </div>
        </section>
    );
}
