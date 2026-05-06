import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';

interface Props {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    thickness?: number;
}

export const InteractiveTiltWrapper: React.FC<Props> = ({ children, className, onClick, thickness = 30 }) => {
    const mouseX = useMotionValue(0.5);
    const mouseY = useMotionValue(0.5);

    const xSpring = useSpring(mouseX, { stiffness: 150, damping: 20 });
    const ySpring = useSpring(mouseY, { stiffness: 150, damping: 20 });

    const rotateX = useTransform(ySpring, [0, 1], [35, -35]);
    const rotateY = useTransform(xSpring, [0, 1], [-35, 35]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
    };

    const handleMouseLeave = () => {
        mouseX.set(0.5);
        mouseY.set(0.5);
    };

    return (
        <div className="relative perspective-[3000px] py-4 flex justify-center" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
            <motion.div
                onClick={onClick}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className={`${className} relative z-10 flex items-center justify-center`}
            >
                {/* Depth stack for the crystal extrusion effect */}
                <div 
                    className="absolute inset-0 pointer-events-none" 
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {[...Array(thickness)].map((_, i) => (
                        <div 
                            key={i}
                            className="absolute inset-0 rounded-full"
                            style={{ 
                                transform: `translateZ(${i}px)`, 
                                backgroundColor: 'transparent',
                                border: 'none',
                                backdropFilter: 'blur(0.5px)', 
                             }}
                        />
                    ))}
                </div>

                {/* Hologram front face */}
                <div 
                    style={{ 
                        transform: `translateZ(${thickness}px)`, 
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "hidden"
                    }} 
                    className="relative w-full h-full z-20 flex items-center justify-center p-2"
                >
                    {/* Layered transparent glow surface */}
                    <div className="relative w-full h-full rounded-full overflow-hidden flex items-center justify-center mix-blend-screen bg-transparent">
                        <div className="w-full h-full relative flex items-center justify-center">
                            {children}
                            
                            {/* Hologram glow effects */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-purple-500/5 pointer-events-none z-30 opacity-40" />
                            
                            {/* Scanning line effect */}
                            <motion.div 
                                animate={{ top: ['-100%', '200%'] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-[1.5px] bg-cyan-400/10 blur-[1px] z-40 pointer-events-none"
                            />
                        </div>
                    </div>

                    {/* Subtle outer border */}
                    <div className="absolute inset-0 rounded-full border border-white/[0.02] pointer-events-none z-10" />
                </div>

                {/* Dark ambient floor shadow */}
                <div 
                    className="absolute inset-8 bg-black/40 blur-3xl rounded-full pointer-events-none"
                    style={{ transform: "translateZ(-5px) translateY(35px) scale(0.95)" }}
                />
            </motion.div>
        </div>
    );
};

