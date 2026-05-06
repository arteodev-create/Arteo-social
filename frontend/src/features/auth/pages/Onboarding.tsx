import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Sparkle, CaretLeft } from '@phosphor-icons/react';
import { useAuth } from '@entities/session/model';
import OnboardingIdentity from '../ui/onboarding/OnboardingIdentity';
import OnboardingAvatar from '../ui/onboarding/OnboardingAvatar';
import OnboardingFollows from '../ui/onboarding/OnboardingFollows';
import { Button } from '@shared/ui';

const Onboarding: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const nextStep = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        } else {
            navigate('/');
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const progress = (step / totalSteps) * 100;

    const getStepTitle = () => {
        switch (step) {
            case 1: return 'Your identity';
            case 2: return 'Profile photo';
            case 3: return 'Discover people';
            default: return '';
        }
    };

    const getStepDesc = () => {
        switch (step) {
            case 1: return 'Tell people who you are and what makes your presence on Arteo recognizable.';
            case 2: return 'A clear image helps people recognize you across conversations and posts.';
            case 3: return 'Follow a few people to start shaping your first Arteo feed.';
            default: return '';
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            <Helmet>
                <title>Complete profile | Arteo</title>
            </Helmet>

            <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-zinc-900 rounded-[8px] blur-[150px]" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-zinc-900 rounded-[8px] blur-[150px]" />
            </div>

            <div className="w-full max-w-[500px] relative z-10">
                <div className="text-center mb-10 space-y-3">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-[8px] text-[11px] font-black mb-2"
                    >
                        <Sparkle size={14} weight="bold" />
                        Welcome {user?.username}
                    </motion.div>
                    <h1 className="text-[32px] md:text-[42px] font-black text-white leading-[1.1] tracking-tighter">
                        {getStepTitle()}
                    </h1>
                    <p className="text-zinc-500 text-[15px] font-bold px-8 leading-relaxed">
                        {getStepDesc()}
                    </p>
                </div>

                <div className="w-full h-1 bg-zinc-900 rounded-[8px] mb-10 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.6, ease: "circOut" }}
                        className="h-full bg-white"
                    />
                </div>

                <div className="bg-zinc-950 border border-zinc-900 rounded-[8px] shadow-none shadow-black/50 overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ x: 10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -10, opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            className="p-8 pb-10"
                        >
                            {step === 1 && <OnboardingIdentity onNext={nextStep} />}
                            {step === 2 && <OnboardingAvatar onNext={nextStep} />}
                            {step === 3 && <OnboardingFollows onNext={nextStep} />}
                        </motion.div>
                    </AnimatePresence>

                    <div className="px-8 py-6 bg-black/50 border-t border-zinc-900 flex items-center justify-between">
                        {step > 1 ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={prevStep}
                                className="flex items-center gap-2 text-zinc-500 hover:text-white font-black text-[11px]"
                            >
                                <CaretLeft size={16} weight="bold" />
                                Back
                            </Button>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-1.5">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-[8px] transition-all duration-500 ${i + 1 === step ? 'w-5 bg-white' : 'bg-zinc-800'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate('/')}
                        className="text-zinc-600 hover:text-white font-black text-[12px]"
                    >
                        Skip all
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Onboarding;
