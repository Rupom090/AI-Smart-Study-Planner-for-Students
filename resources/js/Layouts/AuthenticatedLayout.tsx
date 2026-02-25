import { useState, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { User } from '@/types';
import { LayoutDashboard, CheckSquare, FileText, Smartphone, Search, Menu, X, ChevronDown, FolderClosed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Dropdown from '@/Components/Dropdown';
import ThemeToggle from '@/Components/ThemeToggle';

export default function Authenticated({ user, header, children }: PropsWithChildren<{ user: User, header?: ReactNode }>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-white dark:bg-studley-dark text-slate-900 dark:text-studley-gray font-sans selection:bg-brand-500/30 flex">

            {/* Sidebar (Desktop) */}
            <aside className="hidden lg:flex flex-col w-64 fixed inset-y-0 z-50 bg-white/60 dark:bg-studley-dark/60 backdrop-blur-xl border-r border-brand-200/50 dark:border-white/10 transition-colors duration-300">
                {/* Logo */}
                <div className="h-16 flex items-center px-6">
                    <Link href="/" className="flex items-center gap-2 text-brand-600 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                            S
                        </div>
                        Studley
                    </Link>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-6 space-y-1">
                    <Link
                        href={route('dashboard')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${route().current('dashboard')
                            ? 'bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white hover:scale-[1.02]'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        Study Sets
                    </Link>

                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all text-left">
                        <CheckSquare size={20} />
                        Solve
                    </button>

                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all text-left">
                        <FileText size={20} />
                        Paper Grader
                    </button>

                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all text-left">
                        <Smartphone size={20} />
                        App
                    </button>
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-brand-200/50 dark:border-white/10">
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center w-full gap-3 p-2 rounded-lg hover:bg-slate-100/50 dark:hover:bg-white/5 transition-all outline-none">
                                <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1 text-left overflow-hidden">
                                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                                </div>
                                <ChevronDown size={16} className="text-slate-400" />
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content contentClasses="py-1 bg-white dark:bg-studley-dark border border-slate-200 dark:border-white/10 shadow-xl">
                            <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button">
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {showingNavigationDropdown && (
                <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setShowingNavigationDropdown(false)}></div>
            )}

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-50 dark:bg-studley-dark shadow-xl transform transition-transform duration-300 lg:hidden ${showingNavigationDropdown ? 'translate-x-0' : '-translate-x-full'
                }`}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5">
                    <Link href="/" className="flex items-center gap-2 text-brand-600 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                            S
                        </div>
                        Studley
                    </Link>
                    <button onClick={() => setShowingNavigationDropdown(false)} className="text-slate-500 dark:text-slate-400">
                        <X size={24} />
                    </button>
                </div>
                <nav className="p-4 space-y-1">
                    <Link
                        href={route('dashboard')}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${route().current('dashboard')
                            ? 'bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        onClick={() => setShowingNavigationDropdown(false)}
                    >
                        <LayoutDashboard size={20} />
                        Study Sets
                    </Link>
                    {/* Repeated items for mobile... */}
                </nav>
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3 p-2">
                        <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white font-bold text-sm">
                            {user.name.charAt(0)}
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.name}</p>
                            <Link href={route('logout')} method="post" as="button" className="text-xs text-brand-500 hover:text-brand-400">
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-64 flex flex-col min-h-screen bg-slate-50/50 dark:bg-studley-dark/95 transition-colors duration-300">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white/80 dark:bg-studley-dark/80 backdrop-blur-xl border-b border-brand-200/50 dark:border-white/10 px-4 flex items-center justify-between sticky top-0 z-30">
                    <button onClick={() => setShowingNavigationDropdown(true)} className="text-slate-500 dark:text-slate-400 hover:text-brand-500 transition-colors">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">Studley</span>
                    <ThemeToggle />
                </header>

                {/* Top Bar for Desktop (Search, Helpers) */}
                <header className="hidden lg:flex h-16 items-center justify-end px-8 gap-6 sticky top-0 z-30 bg-transparent">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search materials..."
                            className="bg-white/50 dark:bg-white/5 border border-brand-200/50 dark:border-white/10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-brand-500 focus:border-brand-500 w-64 rounded-full py-2 pl-10 pr-4 transition-all duration-300 shadow-sm backdrop-blur-sm"
                        />
                    </div>
                    <ThemeToggle />
                    <button className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                        <FolderClosed size={18} />
                        Folders
                    </button>
                </header>

                {/* Main Slot with Framer Motion Page Transitions */}
                <AnimatePresence mode="wait">
                    <motion.main
                        key={usePage().url}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="flex-1 w-full"
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>
            </div>
        </div>
    );
}
