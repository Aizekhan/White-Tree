import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, Check, ChevronRight } from 'lucide-react';
import { SubscriptionTier, Feature, TIER_PERMISSIONS } from '../../../config/subscription';

interface SubscriptionGateProps {
    children?: React.ReactNode;
    feature?: Feature;
    tier?: string;
    onShowGate?: () => void;
    visualOnly?: boolean;
    featureName?: string; // For Modal mode
    onClose?: () => void; // For Modal mode
}

export function SubscriptionGate({
    children,
    feature,
    tier,
    onShowGate,
    visualOnly,
    featureName,
    onClose
}: SubscriptionGateProps) {
    // MODAL MODE: If featureName and onClose are provided, act as a full-screen modal
    if (featureName && onClose) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-ink/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
                >
                    <div className="relative p-10 text-center">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-violet-500 to-indigo-500" />

                        <div className="w-20 h-20 rounded-3xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-violet-100">
                            <Lock size={40} />
                        </div>

                        <h2 className="font-serif text-3xl font-black text-ink mb-2">Upgrade to Pro</h2>
                        <p className="text-sm text-ink/60 mb-10 max-w-sm mx-auto leading-relaxed">
                            Unlock <span className="text-violet-600 font-bold">{featureName}</span> and other professional narrative tools.
                        </p>

                        <div className="grid grid-cols-1 gap-4 mb-10">
                            {[
                                "Unlimited AI Analysis & Generation",
                                "Screenplay & Multi-format Adaptation",
                                "Advanced Character Consistency Tracking",
                                "High-Quality Neural TTS Voices",
                                "Future History Synchronization"
                            ].map((perk, i) => (
                                <div key={i} className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-violet-50/50 text-left border border-violet-100">
                                    <div className="shrink-0 w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-md">
                                        <Check size={14} />
                                    </div>
                                    <span className="text-xs font-bold text-ink/80">{perk}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <button className="w-full py-5 rounded-3xl bg-violet-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-violet-200 hover:bg-violet-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                Go Pro Now
                                <ChevronRight size={18} />
                            </button>
                            <button
                                onClick={onClose}
                                className="text-[10px] font-black text-ink/30 uppercase tracking-[0.2em] hover:text-ink transition-colors"
                            >
                                Continue with Free Plan
                            </button>
                        </div>
                    </div>

                    <div className="absolute top-6 right-6 px-4 py-1.5 rounded-full bg-pink-100 text-pink-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={12} />
                        Best Value
                    </div>
                </motion.div>
            </div>
        );
    }

    // WRAPPER MODE: Check permissions
    const currentTier = (tier?.toLowerCase() as SubscriptionTier) || SubscriptionTier.FREE;
    const permissions = TIER_PERMISSIONS[currentTier] || TIER_PERMISSIONS[SubscriptionTier.FREE];
    const hasAccess = feature ? permissions.includes(feature) : true;

    if (hasAccess) {
        return <>{children}</>;
    }

    // Locked UI for the wrapper
    return (
        <div className="relative group/gate">
            <div className="opacity-40 grayscale pointer-events-none filter blur-[1px] transition-all group-hover/gate:blur-[2px]">
                {children}
            </div>
            <div className="absolute inset-0 flex items-center justify-center z-10">
                <button
                    onClick={onShowGate}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ink text-paper text-[10px] font-black uppercase tracking-widest shadow-xl scale-95 group-hover/gate:scale-100 transition-all border border-white/10"
                >
                    <Lock size={12} className="text-violet-400" />
                    {visualOnly ? "" : "Unlock Pro"}
                </button>
            </div>
        </div>
    );
}

export const SubscriptionModal = SubscriptionGate;
