import React, { PropsWithChildren } from 'react';
import SmoothScroll from '@/Components/Animation/SmoothScroll';
import { motion, AnimatePresence } from 'framer-motion';

export default function MainLayout({ children }: PropsWithChildren) {
    return (
        <SmoothScroll>
            {/* You can wrap a navbar or global header inside SmoothScroll but outside AnimatePresence so it doesn't animate out on page change */}
            <div className="min-h-screen bg-background text-foreground selection:bg-brand-500/30">
                <AnimatePresence mode="wait">
                    <motion.main
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="flex flex-col min-h-screen"
                    >
                        {children}
                    </motion.main>
                </AnimatePresence>
            </div>
        </SmoothScroll>
    );
}
