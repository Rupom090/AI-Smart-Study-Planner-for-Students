import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';

export default function InteractiveBackground() {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            // Calculate normalized mouse position (-1 to 1) for parallax
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
            {/* Dynamic Interactive Blob 1 */}
            <motion.div
                animate={{
                    x: mousePos.x * 50,
                    y: mousePos.y * 50,
                    scale: [1, 1.1, 1],
                    rotate: [0, 90, 0]
                }}
                transition={{
                    scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                    x: { type: "spring", stiffness: 50, damping: 20 },
                    y: { type: "spring", stiffness: 50, damping: 20 }
                }}
                className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"
            />

            {/* Dynamic Interactive Blob 2 */}
            <motion.div
                animate={{
                    x: mousePos.x * -70,
                    y: mousePos.y * -70,
                    scale: [1, 1.2, 1],
                    rotate: [0, -90, 0]
                }}
                transition={{
                    scale: { duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 },
                    rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                    x: { type: "spring", stiffness: 40, damping: 20 },
                    y: { type: "spring", stiffness: 40, damping: 20 }
                }}
                className="absolute top-[30%] right-[15%] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen"
            />

            {/* Subtle overlay texture using CSS instead of missing SVG */}
            <div className="absolute inset-0 bg-repeat opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundSize: '24px 24px', backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)' }} />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-studley-dark/50 dark:to-studley-dark" />
        </div>
    );
}
