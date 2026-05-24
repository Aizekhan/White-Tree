import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { AnalysisResult, NarrativeMode, MemorySuggestion, QuickFix, AdaptTarget } from "../../../types";
import {
    ScoreCard,
    ImprovedTextPanel,
    MemorySuggestionsPanel,
    QuickFixesPanel,
    StrengthsWeaknessesPanel,
    TensionPanel,
    SceneAnalysisPanel,
    EditorSuggestionsPanel,
} from "./AnalysisSubPanels";
import { useSubscription } from "../../../hooks/useSubscription";
import { FEATURES } from "../../../config/subscription";

export interface AnalysisResultsPanelProps {
    mode: NarrativeMode;
    isAnalyzing: boolean;
    result: AnalysisResult | null;
    t: any;
    setMode: (mode: NarrativeMode) => void;
    setText: (text: string) => void;
    addStringMemory: (key: string, value: string) => void;
    applyMemorySuggestion: (suggestion: MemorySuggestion) => void;
    setResult: (updater: (prev: AnalysisResult | null) => AnalysisResult | null) => void;
    activeScene: any;
    applyQuickFix: (fix: QuickFix) => void;
    scrollToScene: (segment: string) => void;
    onAnalyze?: () => void;
    onImprove?: () => void;
    onAdapt?: (target: AdaptTarget) => void;
    isLocal?: boolean;
    tier?: string;
    onShowSubscriptionGate?: (feature: string) => void;
}

export default function AnalysisResultsPanel({
    mode, isAnalyzing, result, t, setMode, setText,
    addStringMemory, applyMemorySuggestion, setResult,
    activeScene, applyQuickFix, scrollToScene,
    onAnalyze, onImprove, onAdapt, isLocal, tier, onShowSubscriptionGate
}: AnalysisResultsPanelProps) {
    const { checkAccess } = useSubscription(tier);
    if (mode === NarrativeMode.PROJECTS) return null;

    return (
        <div className="w-full overflow-y-auto overflow-x-hidden">
            <AnimatePresence mode="wait">
                {isAnalyzing ? (
                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full flex flex-col items-center justify-center text-center p-10 space-y-4">
                        <Loader2 size={32} className="animate-spin text-violet-500" />
                        <div>
                            <h3 className="font-serif text-lg font-bold text-ink">{t.analyzingNarrative}...</h3>
                            <p className="text-sm text-ink/40 max-w-[240px] mx-auto">{t.analyzingDescription}</p>
                        </div>
                    </motion.div>
                ) : !result ? (
                    <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col items-center justify-center text-center p-10 space-y-6">
                        <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center text-ink/20"><Activity size={32} /></div>
                        <div>
                            <h3 className="font-serif text-lg font-bold text-ink/80">
                                {isLocal ? (t.noLocalAnalysisYet || "No Local Analysis") : (t.noAnalysisYet || "No Analysis")}
                            </h3>
                            <p className="text-sm text-ink/50 max-w-[240px] mx-auto mt-2 leading-relaxed">
                                {isLocal
                                    ? (t.runLocalAnalysisDesc || "Run an AI analysis on this specific scene to see focused insights.")
                                    : (t.runAnalysisToSeeInsights || "Run an AI analysis on your narrative to see insights, improvements, and memory suggestions.")
                                }
                            </p>
                        </div>
                        {onAnalyze && (
                            <button
                                onClick={onAnalyze}
                                disabled={isAnalyzing}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-all font-bold text-[11px] uppercase tracking-widest shadow-md hover:shadow-lg mt-4"
                            >
                                <Sparkles size={16} />
                                {t.analyzeNarrative || "Analyze Narrative"}
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <motion.div key="results" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 pb-20">
                        {/* Panel Header Actions */}
                        <div className="flex flex-col gap-4 pt-6 px-6">
                            <h2 className="font-serif text-lg font-bold text-ink flex items-center gap-2">
                                <Sparkles className="text-violet-500" size={20} />
                                {isLocal ? (t.localAnalysis || "Local Analysis") : (t.analysisInsights || "AI Insights")}
                            </h2>
                            <div className="flex flex-col sm:flex-row items-stretch gap-2">
                                {onAnalyze && (
                                    <button
                                        onClick={onAnalyze}
                                        disabled={isAnalyzing}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-violet-50 text-violet-600 hover:bg-violet-100 transition-all font-bold text-[10px] uppercase tracking-widest border border-violet-100 shadow-sm"
                                    >
                                        <Activity size={12} />
                                        {t.reAnalyze || "Re-Analyze"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Improved Text Panel - Only in Local or when explicitly requested */}
                        {result.improvedText && isLocal && (mode === NarrativeMode.IMPROVE || mode === NarrativeMode.WRITE) && (
                            <ImprovedTextPanel
                                result={result}
                                mode={mode}
                                t={t}
                                activeScene={activeScene}
                                copyToClipboard={(text) => navigator.clipboard.writeText(text)}
                                setText={setText}
                                setMode={setMode}
                                addStringMemory={addStringMemory}
                                copied={false}
                            />
                        )}

                        {/* Memory Suggestions */}
                        <MemorySuggestionsPanel result={result} t={t} applyMemorySuggestion={applyMemorySuggestion} setResult={setResult} />
                        {/* Header */}
                        {result.score !== undefined && (
                            <div className="border-b border-ink/5 pb-6 flex flex-col gap-4 px-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center"><Activity size={18} /></div>
                                    <div>
                                        <h2 className="font-serif text-2xl font-bold">{t.storyHealthReport}</h2>
                                        <p className="text-[8px] text-ink/40 uppercase tracking-widest font-bold">{t.diagnosticResults}</p>
                                    </div>
                                </div>
                                {isLocal && (
                                    <button
                                        onClick={() => {
                                            if (!checkAccess(FEATURES.IMPROVE_NARRATIVE) && onShowSubscriptionGate) {
                                                onShowSubscriptionGate(t.improveNarrative);
                                                return;
                                            }
                                            if (onImprove) onImprove();
                                            else setMode(NarrativeMode.IMPROVE);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                        disabled={isAnalyzing}
                                        className={cn(
                                            "w-full text-[10px] px-4 py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest shadow-lg disabled:opacity-50 disabled:cursor-not-allowed",
                                            checkAccess(FEATURES.IMPROVE_NARRATIVE)
                                                ? "bg-pink-500 hover:bg-pink-600 text-white shadow-pink-100/50"
                                                : "bg-ink/5 text-ink/40 border border-ink/10 hover:bg-ink/10"
                                        )}
                                    >
                                        <Sparkles size={14} className={checkAccess(FEATURES.IMPROVE_NARRATIVE) ? "text-white" : "text-violet-400"} />
                                        {t.improveNarrative}
                                        {!checkAccess(FEATURES.IMPROVE_NARRATIVE) && <Lock size={10} className="ml-1" />}
                                    </button>
                                )}
                            </div>
                        )}

                        <ScoreCard result={result} t={t} />
                        {isLocal && <QuickFixesPanel result={result} t={t} applyQuickFix={applyQuickFix} />}
                        {isLocal && <EditorSuggestionsPanel result={result} t={t} />}
                        <StrengthsWeaknessesPanel result={result} t={t} />
                        <TensionPanel result={result} t={t} />
                        <SceneAnalysisPanel result={result} t={t} scrollToScene={scrollToScene} mode={mode} />

                        {/* Story Structure (Stages Analysis) */}
                        {Array.isArray(result.storyStructure) && result.storyStructure.length > 0 && mode === NarrativeMode.ANALYZE && (
                            <div className="narrative-card p-6">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2">
                                    <BookOpen size={14} className="text-blue-500" />
                                    {t.storyStructure}
                                </h3>
                                <div className="space-y-6">
                                    {result.storyStructure.map((stage, i) => (
                                        <div key={i} className={cn(
                                            "relative pl-6 border-l-2 transition-all",
                                            stage.found ? "border-blue-500 opacity-100" : "border-ink/10 opacity-40"
                                        )}>
                                            <div className={cn(
                                                "absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 bg-white",
                                                stage.found ? "border-blue-500" : "border-ink/20"
                                            )} />
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wider">{stage.stage}</span>
                                                {stage.found && <CheckCircle2 size={12} className="text-blue-500" />}
                                            </div>
                                            <p className="text-[11px] text-ink/60 leading-relaxed">{stage.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Theme Analysis */}
                        {Array.isArray(result.themes) && result.themes.length > 0 && (
                            <div className="narrative-card p-6">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2"><Palette size={14} className="text-pink-500" />{t.themeAnalysis}</h3>
                                <div className="space-y-6">
                                    {result.themes.map((theme, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-xs text-ink">{theme.name}</h4>
                                                <span className="text-[9px] font-bold text-pink-500 bg-pink-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">{theme.prevalence}</span>
                                            </div>
                                            <p className="text-[11px] text-ink/60 leading-relaxed italic">"{theme.description}"</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Transitions */}
                        {Array.isArray(result.transitions) && result.transitions.length > 0 && (
                            <div className="narrative-card p-6">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2"><ArrowRight size={14} className="text-blue-500" />{t.sceneTransitionAnalysis}</h3>
                                <div className="space-y-4">
                                    {result.transitions.map((tr, i) => (
                                        <div key={i} className="p-4 rounded-xl bg-ink/[0.02] border border-ink/5">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="text-[9px] font-bold text-ink/40 uppercase tracking-widest">{tr.fromScene?.slice(0, 20)}... → {tr.toScene?.slice(0, 20)}...</div>
                                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${tr.quality > 7 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{tr.type}</span>
                                            </div>
                                            <p className="text-[10px] text-ink/80 mb-2">{tr.description}</p>
                                            <div className="text-[9px] text-blue-600 font-bold italic">💡 {tr.suggestion}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Utility for App.tsx imports consistency - adding the local types if needed.
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Target, Palette, ArrowRight, CheckCircle2, Lock } from "lucide-react";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
