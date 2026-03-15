import { useRef, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
    children: ReactNode;
    className?: string;
    rotationFactor?: number;
}

export default function TiltCard({ children, className = '', rotationFactor = 15 }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        // Calculate mouse position relative to card center (normalized from -1 to 1)
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const percentX = (x - centerX) / centerX;
        const percentY = -((y - centerY) / centerY); // Invert Y so tilting feels natural

        setRotateX(percentY * rotationFactor);
        setRotateY(percentX * rotationFactor);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <motion.div
            ref={ref}
            className={`relative perspective-1000 ${className}`}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{
                rotateX,
                rotateY,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.5 }}
            style={{ transformStyle: 'preserve-3d' }}
        >
            <div style={{ transform: 'translateZ(30px)' }} className="w-full h-full pointer-events-none absolute inset-0 z-10">
                {/* Optional glare effect could go here */}
            </div>
            {children}

            <style dangerouslySetInnerHTML={{
                __html: `
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}} />
        </motion.div>
    );
}
