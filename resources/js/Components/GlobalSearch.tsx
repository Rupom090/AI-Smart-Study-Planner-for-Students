import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FolderClosed, CheckSquare, FileText, Layers, LayoutDashboard, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Toggle on CMD+K or CTRL+K
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen((open) => !open);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        } else {
            setQuery(''); // Reset query on close
        }
    }, [isOpen]);

    const staticLinks = [
        { title: 'Study Sets (Dashboard)', icon: LayoutDashboard, route: 'dashboard', section: 'Navigate' },
        { title: 'AI Solver', icon: CheckSquare, route: 'solve', section: 'Navigate' },
        { title: 'Paper Grader', icon: FileText, route: 'paper-grader', section: 'Navigate' },
        { title: 'Flashcards', icon: Layers, route: 'flashcards', section: 'Navigate' },
    ];

    const filteredLinks = staticLinks.filter((link) =>
        link.title.toLowerCase().includes(query.toLowerCase())
    );

    const navigateTo = (routeName: string) => {
        setIsOpen(false);
        router.visit(route(routeName));
    };

    return (
        <>
            {/* The visible trigger in the header */}
            <button
                onClick={() => setIsOpen(true)}
                className="relative group hidden lg:flex items-center text-left"
            >
                <Search className="absolute left-3 text-slate-400 group-hover:text-brand-500 transition-colors" size={18} />
                <div className="bg-white/50 dark:bg-white/5 border border-brand-200/50 dark:border-white/10 text-sm text-slate-400 w-64 rounded-full py-2 pl-10 pr-4 transition-all duration-300 shadow-sm backdrop-blur-sm group-hover:border-brand-500/50 flex justify-between items-center">
                    <span>Search materials...</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
                        ⌘K
                    </kbd>
                </div>
            </button>

            {/* The Search Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm"
                        />
                        <div className="fixed inset-0 z-[101] flex items-start justify-center pt-[10vh] sm:pt-[20vh] px-4 pointer-events-none">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                className="w-full max-w-xl bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-700 overflow-hidden pointer-events-auto flex flex-col max-h-[60vh]"
                            >
                                <div className="flex items-center px-4 py-4 border-b border-surface-100 dark:border-surface-800">
                                    <Search className="text-brand-500 mr-3" size={24} />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Type a command or search..."
                                        className="flex-1 bg-transparent border-none text-lg text-slate-900 dark:text-white placeholder-slate-400 focus:ring-0 p-0"
                                    />
                                    <kbd className="hidden sm:inline-block px-2 border border-surface-200 dark:border-surface-700 rounded-md text-xs font-medium text-slate-400 bg-surface-50 dark:bg-surface-800 shadow-sm ml-2 py-1">
                                        ESC
                                    </kbd>
                                </div>

                                <div className="overflow-y-auto p-2">
                                    {filteredLinks.length > 0 ? (
                                        <div className="mb-2">
                                            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Navigation
                                            </div>
                                            {filteredLinks.map((link) => (
                                                <button
                                                    key={link.title}
                                                    onClick={() => navigateTo(link.route)}
                                                    className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-left hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-700 dark:hover:text-brand-300 transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-slate-100 dark:bg-surface-800 p-2 rounded-lg text-slate-500 group-hover:bg-brand-100 dark:group-hover:bg-brand-500/20 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                                            <link.icon size={18} />
                                                        </div>
                                                        <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand-700 dark:group-hover:text-brand-300">
                                                            {link.title}
                                                        </span>
                                                    </div>
                                                    <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 group-hover:text-brand-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-14 text-center">
                                            <Search className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600 mb-3" />
                                            <p className="text-sm text-slate-500 dark:text-slate-400">No results found for "{query}"</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
