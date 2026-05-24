import React, { useState, useRef, useEffect } from "react";
import {
    BookOpen,
    ChevronRight,
    ArrowLeft,
    Save,
    BrainCircuit,
    Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { QuickFix, AdaptTarget } from "../../../types";
import { SubscriptionGate } from "../../shared/components/SubscriptionGate";
import { AudioPlayer } from "../../shared/components/AudioPlayer";
import { FEATURES } from "../../../config/subscription";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NarrativeWorkspaceProps {
    activeScene: any;
    text: string;
    setText: (text: string) => void;
    t: any;
    language: 'UA' | 'ENG';
    copyToClipboard: (text: string) => void;
    applyQuickFix: (fix: QuickFix) => void;
    onAdapt?: (target: AdaptTarget) => void;
    isAdapting?: boolean;
    onGenerate?: () => void;
    isGenerating?: boolean;
    tier?: string;
    onShowSubscriptionGate?: (feature: string) => void;
    saveStatus?: 'idle' | 'saving' | 'saved' | 'error';
    onManualSave?: () => void;
}

export default function NarrativeWorkspace({
    activeScene,
    text,
    setText,
    t,
    onAdapt,
    isAdapting,
    onGenerate,
    isGenerating,
    tier,
    onShowSubscriptionGate,
    language,
    saveStatus = 'saved',
    onManualSave
}: NarrativeWorkspaceProps) {
    const [view, setView] = useState<'draft' | 'adapted'>('draft');
    const [adaptTarget, setAdaptTarget] = useState<AdaptTarget>(AdaptTarget.SCREENPLAY);
    const [showDescription, setShowDescription] = useState(false);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-switch to adapted view if a new adaptation arrives
    useEffect(() => {
        if (activeScene?.adaptedText) {
            setView('adapted');
        } else {
            setView('draft');
        }
    }, [activeScene?.adaptedText, activeScene?.title]);

    const currentText = view === 'adapted'
        ? (activeScene?.adaptedText || "")
        : (typeof text === 'string' && text.length > 0 ? text : (activeScene?.description || ""));
    const isReadOnly = view === 'adapted';

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Header / Breadcrumbs */}
            <div className="p-4 border-b border-ink/5 flex flex-col gap-4 bg-ink/[0.02]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-ink/30 mb-0.5">
                                <span>{activeScene?.act}</span>
                                <ChevronRight size={10} />
                                <span>{activeScene?.chapter}</span>
                            </div>
                            <h2 className="font-serif font-bold text-ink/80 flex items-center gap-2 relative group">
                                <BookOpen size={16} className="text-violet-500" />
                                {activeScene?.title}
                                {activeScene?.description && (
                                    <div className="relative ml-1">
                                        <button
                                            onClick={() => setShowDescription(!showDescription)}
                                            onMouseEnter={() => setShowDescription(true)}
                                            onMouseLeave={() => setShowDescription(false)}
                                            className="ml-1 p-1 hover:bg-ink/5 rounded-full text-ink/40 transition-colors"
                                            title="View Scene Description"
                                        >
                                            <div className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">i</div>
                                        </button>

                                        <AnimatePresence>
                                            {showDescription && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 5 }}
                                                    className="absolute left-0 top-full mt-2 w-80 p-4 rounded-2xl bg-white border border-ink/10 shadow-xl z-50 text-sm font-normal text-ink/80 leading-relaxed pointer-events-none"
                                                >
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-2">
                                                        {t.sceneDescription || "Опис сцени"}
                                                    </div>
                                                    {activeScene.description}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* View Dependent Actions */}
                        {view === 'draft' ? (
                            <>
                                {/* Audio Reader for Pro+ - Only on Draft tab */}
                                <SubscriptionGate
                                    feature={FEATURES.AUDIO_READING}
                                    tier={tier}
                                    onShowGate={() => onShowSubscriptionGate?.(t.audioReading)}
                                    visualOnly
                                >
                                    <AudioPlayer text={currentText} language={language} tier={tier} />
                                </SubscriptionGate>

                                <div className="w-px h-4 bg-ink/10 mx-1" />

                                {onGenerate && (
                                    <button
                                        onClick={onGenerate}
                                        disabled={isGenerating}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all font-bold text-[10px] uppercase tracking-widest shadow-md hover:shadow-lg active:scale-95 border border-violet-500/50"
                                        title={t.whiteWrite || "White-Write"}
                                    >
                                        <Sparkles size={14} className={isGenerating ? "animate-pulse" : ""} />
                                        {isGenerating ? (t.generating || "Generating...") : (t.whiteWrite || "White-Write")}
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center gap-1 bg-emerald-50 rounded-xl p-1 border border-emerald-100 shadow-sm">
                                <select
                                    value={adaptTarget}
                                    onChange={(e) => setAdaptTarget(e.target.value as AdaptTarget)}
                                    className="bg-transparent border-none text-[10px] font-bold uppercase tracking-widest text-emerald-700 outline-none cursor-pointer px-2 py-1"
                                >
                                    <option value={AdaptTarget.SCREENPLAY}>{t.screenplay}</option>
                                    <option value={AdaptTarget.VIDEO_CARDS}>{t.videoCards}</option>
                                    <option value={AdaptTarget.TODDLER_BOOK}>{t.toddlerBook}</option>
                                    <option value={AdaptTarget.POETRY}>{t.poetry}</option>
                                    <option value={AdaptTarget.SOCIAL_POST}>{t.socialPost}</option>
                                </select>
                                <button
                                    onClick={() => onAdapt?.(adaptTarget)}
                                    disabled={isAdapting}
                                    className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-bold text-[10px] uppercase tracking-widest shadow-sm active:scale-95"
                                    title="Adapt Narrative"
                                >
                                    <BrainCircuit size={14} className={isAdapting ? "animate-spin" : ""} />
                                    {isAdapting ? (t.adapting || t.processing) : (t.adapt || "Adapt")}
                                </button>
                            </div>
                        )}

                        <button 
                            onClick={onManualSave}
                            className={cn(
                                "p-2 rounded-full transition-colors ml-2",
                                saveStatus === 'saving' ? "text-violet-600 animate-pulse" : "text-ink/40 hover:text-ink/80 hover:bg-ink/5"
                            )}
                            title={saveStatus === 'saving' ? "Saving..." : "Save Now"}
                            disabled={saveStatus === 'saving'}
                        >
                            <Save size={18} />
                        </button>
                    </div>
                </div>

                {/* View Toggles (Tabs) */}
                <div className="flex items-center gap-4">
                    <div className="flex bg-ink/5 p-1 rounded-xl shadow-inner">
                        <button
                            onClick={() => setView('draft')}
                            className={cn(
                                "px-6 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                                view === 'draft' ? "bg-white text-violet-600 shadow-sm" : "text-ink/40 hover:text-ink/60"
                            )}
                        >
                            <BookOpen size={12} />
                            {t.draft || "Draft"}
                        </button>
                        <button
                            onClick={() => setView('adapted')}
                            className={cn(
                                "px-6 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                                view === 'adapted' ? "bg-white text-emerald-600 shadow-sm" : "text-ink/40 hover:text-ink/60"
                            )}
                        >
                            <Sparkles size={12} />
                            {t.adapted || "Adapted"}
                            {activeScene?.adaptedText && <span className="opacity-40 ml-1">({activeScene.adaptedTarget})</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-paper flex flex-col">
                {view === 'adapted' && !activeScene?.adaptedText ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-6 shadow-sm">
                            <Sparkles size={40} />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-ink/80 mb-2">{t.adapted || "Adapted"}</h3>
                        <p className="max-w-md text-sm text-ink/40 leading-relaxed mb-8">
                            {t.adaptedEmptyState}
                        </p>
                        <button
                            onClick={() => onAdapt?.(adaptTarget)}
                            disabled={isAdapting}
                            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-bold text-xs uppercase tracking-widest shadow-lg hover:shadow-emerald-200 active:scale-95"
                        >
                            {isAdapting ? (
                                <>
                                    <BrainCircuit size={20} className="animate-spin" />
                                    {t.adapting || t.processing}
                                </>
                            ) : (
                                <>
                                    <BrainCircuit size={20} />
                                    {t.adapt} {t.to || "to"} {adaptTarget}
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <textarea
                        ref={textAreaRef}
                        value={currentText}
                        onChange={(e) => !isReadOnly && setText(e.target.value)}
                        placeholder={t.startWriting || "Start your scene here..."}
                        readOnly={isReadOnly}
                        className={cn(
                            "flex-1 w-full p-8 md:p-12 font-serif text-lg leading-relaxed focus:outline-none resize-none bg-transparent placeholder:text-ink/10 selection:bg-violet-100",
                            isReadOnly ? "text-ink/70" : "text-ink"
                        )}
                    />
                )}

                {/* Footer Info */}
                <div className="px-8 py-4 border-t border-ink/5 flex items-center justify-between bg-ink/[0.01]">
                    <div className="text-[10px] font-bold text-ink/20 uppercase tracking-widest flex items-center gap-4">
                        <span>{currentText.length} characters</span>
                        <span>{currentText.split(/\s+/).filter(Boolean).length} words</span>
                    </div>
                    {isReadOnly && (
                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                            {activeScene?.adaptedTarget} View (Read Only)
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        {saveStatus === 'saving' ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-violet-500 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                                {t.saving || "Saving..."}
                            </span>
                        ) : saveStatus === 'error' ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {t.saveError || "Sync Error"}
                            </span>
                        ) : saveStatus === 'idle' ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-ink/20 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-ink/20" />
                                {t.unsavedChanges || "Unsaved Changes"}
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-500/60 uppercase">
                                <Save size={10} />
                                {t.synchronized || "Synchronized"}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
