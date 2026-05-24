import React from 'react';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AIComparisonViewProps {
    originalText: string;
    improvedText: string;
    onAccept: (text: string) => void;
    onDiscard: () => void;
    t: any;
}

export default function AIComparisonView({
    originalText,
    improvedText,
    onAccept,
    onDiscard,
    t
}: AIComparisonViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col h-full bg-white rounded-3xl border border-violet-200 shadow-2xl overflow-hidden"
        >
            <div className="flex items-center justify-between p-5 bg-violet-50/50 border-b border-violet-100">
                <div className="flex items-center gap-2 text-violet-700">
                    <Sparkles size={20} className="animate-pulse" />
                    <span className="font-serif font-black text-sm uppercase tracking-[0.2em]">{t.aiReview || "AI Polish Review"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={onDiscard}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-ink/40 hover:bg-white hover:text-ink/60 transition-all border border-transparent hover:border-ink/5"
                    >
                        <X size={14} />
                        {t.discard || "Discard"}
                    </button>
                    <button
                        onClick={() => onAccept(improvedText)}
                        className="flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 shadow-md shadow-violet-100 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Check size={14} />
                        {t.applyChanges || "Apply Changes"}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row divide-x divide-violet-100 overflow-hidden">
                {/* Original */}
                <div className="flex-1 flex flex-col overflow-hidden bg-white/50">
                    <div className="px-6 py-3 border-b border-violet-50 text-[10px] font-bold uppercase tracking-widest text-ink/30 bg-ink/[0.02]">
                        {t.original || "Current Draft"}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 text-lg text-ink/60 font-serif leading-relaxed">
                        <div className="max-w-prose mx-auto">
                            <ReactMarkdown>{originalText}</ReactMarkdown>
                        </div>
                    </div>
                </div>

                {/* Improved */}
                <div className="flex-1 flex flex-col overflow-hidden bg-violet-50/10">
                    <div className="px-6 py-3 border-b border-violet-50 text-[10px] font-bold uppercase tracking-widest text-violet-500 bg-violet-50/30">
                        {t.improved || "AI Revision"}
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 text-lg text-ink font-serif leading-relaxed">
                        <div className="max-w-prose mx-auto">
                            <ReactMarkdown>{improvedText}</ReactMarkdown>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 bg-violet-50/20 border-t border-violet-100 flex items-center justify-center gap-8">
                <div className="flex items-center gap-2 text-[10px] text-violet-400 font-bold uppercase tracking-widest">
                    <ArrowRight size={12} />
                    Compare and Review
                </div>
                <p className="text-[10px] text-ink/40 italic">
                    {t.aiNotice || "Changes focus on pacing, sensory details, and narrative clarity."}
                </p>
            </div>
        </motion.div>
    );
}
