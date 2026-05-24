import React from "react";
import { motion } from "motion/react";
import { Activity, Sparkles, Heart, Zap, Palette, ArrowRight, BookOpen, AlertCircle, CheckCircle2, Wand2, BrainCircuit, Copy, Check, History, Search, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import StoryMap from "../../story/components/StoryMap";
import { AnalysisResult, NarrativeMode, MemorySuggestion, QuickFix } from "../../../types";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ── ScoreCard ─────────────────────────────────────────────────────────────────
export const ScoreCard = ({ result, t }: { result: AnalysisResult; t: any }) => {
    if (result.score === undefined || !result.detailedScores) return null;
    const score = result.score <= 10 ? result.score * 10 : result.score;
    return (
        <div className="narrative-card p-8 bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none shadow-xl shadow-violet-200">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{t.storyHealth}</h3>
                    <div className="text-5xl font-serif font-bold">
                        {score.toFixed(0)}<span className="text-xl opacity-40">/100</span>
                    </div>
                </div>
                <div className="w-16 h-16 rounded-full border-4 border-white/20 flex items-center justify-center">
                    <Heart size={32} className={cn("fill-current", score > 70 ? "text-emerald-400" : score > 40 ? "text-amber-400" : "text-red-400")} />
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
                {[
                    { label: t.plot, val: result.detailedScores.plot },
                    { label: t.characters, val: result.detailedScores.characters },
                    { label: t.conflict, val: result.detailedScores.conflict },
                    { label: t.atmosphere, val: result.detailedScores.atmosphere },
                    { label: t.dialogue, val: result.detailedScores.dialogue },
                    { label: t.style, val: result.detailedScores.style },
                ].map((item) => {
                    const n = item.val <= 10 ? item.val * 10 : item.val;
                    return (
                        <div key={item.label} className="space-y-1.5 min-w-0">
                            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider opacity-70">
                                <span className="truncate">{item.label}</span>
                                <span>{n.toFixed(0)}%</span>
                            </div>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${n}%` }} className="h-full bg-white" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ── ImprovedTextPanel ──────────────────────────────────────────────────────────
export const ImprovedTextPanel = ({ result, mode, t, copied, setText, setMode, addStringMemory, copyToClipboard, activeScene }: {
    result: AnalysisResult; mode: NarrativeMode; t: any; copied: boolean;
    setText?: (s: string) => void; setMode?: (m: NarrativeMode) => void;
    addStringMemory?: (key: string, val: string) => void;
    copyToClipboard: (s: string) => void; activeScene: any;
}) => {
    if (!result.improvedText || !(mode === NarrativeMode.WRITE || mode === NarrativeMode.IMPROVE)) return null;

    const isImproveOrWriteMode = mode === NarrativeMode.IMPROVE || mode === NarrativeMode.WRITE;

    return (
        <div className={cn("narrative-card p-6 shadow-xl", isImproveOrWriteMode ? "bg-violet-50/50 border-violet-100" : "bg-ink text-paper")}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={cn("font-serif text-lg font-bold", isImproveOrWriteMode ? "text-violet-900" : "text-paper")}>
                    {mode === NarrativeMode.WRITE ? t.generatedScene : t.improvedVersion}
                </h3>
            </div>

            <div className="flex flex-col gap-2 mb-4">
                <div className="flex gap-2">
                    <button onClick={() => copyToClipboard(result.improvedText!)} className={cn("flex-1 text-[10px] px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider shadow-sm", isImproveOrWriteMode ? "bg-white border border-violet-100 text-violet-600 hover:bg-violet-100" : "bg-paper/10 hover:bg-paper/20")}>
                        {copied ? <Check size={12} /> : <Copy size={12} />}{copied ? t.copied : t.copy}
                    </button>
                    {addStringMemory && (
                        <button onClick={() => { addStringMemory('plotEvents', `Scene: ${activeScene?.title || 'Draft'}. Summary: ${result.improvedText?.slice(0, 100)}...`); }} className={cn("flex-[1.5] text-[10px] px-3 py-2 rounded-xl transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-wider shadow-sm", isImproveOrWriteMode ? "bg-white border border-violet-100 text-violet-600 hover:bg-violet-100" : "bg-paper/10 hover:bg-paper/20")}>
                            <History size={12} /> <span className="truncate">{t.addToMemory}</span>
                        </button>
                    )}
                </div>
                {!isImproveOrWriteMode && setText && (
                    <button onClick={() => { setText(result.improvedText!); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="w-full text-[10px] bg-paper/20 hover:bg-paper/30 px-3 py-2 rounded-xl transition-all font-bold uppercase tracking-wider text-center">
                        {t.applyToEditor}
                    </button>
                )}
            </div>

            {!isImproveOrWriteMode && (
                <div className="markdown-body prose-invert opacity-90 font-serif text-lg leading-relaxed">
                    <ReactMarkdown>{typeof result.improvedText === 'string' ? result.improvedText : JSON.stringify(result.improvedText)}</ReactMarkdown>
                </div>
            )}

            {isImproveOrWriteMode && (
                <p className="text-[10px] text-violet-400 font-medium italic">
                    {mode === NarrativeMode.WRITE ? "Текст додано до редактора сцени." : "Текст відображається у вікні порівняння по центру."}
                </p>
            )}
        </div>
    );
};

// ── MemorySuggestionsPanel ─────────────────────────────────────────────────────
export const MemorySuggestionsPanel = ({ result, t, applyMemorySuggestion, setResult }: {
    result: AnalysisResult; t: any;
    applyMemorySuggestion: (s: MemorySuggestion) => void;
    setResult: (updater: (prev: AnalysisResult | null) => AnalysisResult | null) => void;
}) => {
    if (!result.memorySuggestions || result.memorySuggestions.length === 0) return null;
    return (
        <div className="narrative-card p-8 bg-violet-50 border-violet-200">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center"><BrainCircuit size={20} /></div>
                <div>
                    <h3 className="font-bold text-lg text-violet-900">{t.memorySuggestions}</h3>
                    <p className="text-xs text-violet-600 font-medium uppercase tracking-widest">{t.memorySuggestionsDescription}</p>
                </div>
            </div>
            <div className="flex flex-col gap-3">
                {Array.isArray(result.memorySuggestions) && result.memorySuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="bg-white border border-violet-100 p-4 rounded-xl shadow-sm flex flex-col justify-between">
                        <div className="space-y-2">
                            <span className={cn("text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border",
                                suggestion.type === 'character' ? "bg-blue-50 text-blue-600 border-blue-100" :
                                    suggestion.type === 'location' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                        suggestion.type === 'event' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                            "bg-slate-50 text-slate-600 border-slate-100"
                            )}>
                                {suggestion.type} • {suggestion.action}
                            </span>
                            <div className="text-sm font-bold text-ink">
                                {suggestion.type === 'character' ? suggestion.newData.name :
                                    suggestion.type === 'location' ? (suggestion.newData.name || suggestion.newData) :
                                        suggestion.type === 'event' ? (suggestion.newData.event || suggestion.newData) :
                                            suggestion.type === 'timeline' ? (suggestion.newData.date || suggestion.newData) :
                                                (suggestion.newData.rule || suggestion.newData)}
                            </div>
                            <p className="text-xs text-ink/60 italic">"{suggestion.reason}"</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => applyMemorySuggestion(suggestion)} className="flex-[2] bg-violet-600 hover:bg-violet-700 text-white text-[10px] uppercase tracking-widest font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 min-w-0">
                                <Check size={12} className="shrink-0" />
                                <span className="truncate">{t.approve}</span>
                            </button>
                            <button onClick={() => setResult(prev => prev ? { ...prev, memorySuggestions: prev.memorySuggestions?.filter(s => s.id !== suggestion.id) } : null)} className="flex-1 bg-ink/5 hover:bg-ink/10 text-ink/40 hover:text-red-500 rounded-xl transition-all flex items-center justify-center min-w-0">
                                <X size={14} className="shrink-0" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── QuickFixesPanel ─────────────────────────────────────────────────────────────
export const QuickFixesPanel = ({ result, t, applyQuickFix }: { result: AnalysisResult; t: any; applyQuickFix: (f: QuickFix) => void }) => {
    if (!result.quickFixes || result.quickFixes.length === 0) return null;
    return (
        <div className="narrative-card p-6 bg-violet-50/50 border-violet-100">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-6 flex items-center gap-2">
                <Wand2 size={14} />Quick Fix Suggestions
            </h3>
            <div className="space-y-4">
                {Array.isArray(result.quickFixes) && result.quickFixes.map((fix, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white border border-violet-100 shadow-sm space-y-3">
                        <div><div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-1">Issue</div><p className="text-xs font-bold text-ink">{fix.issue}</p></div>
                        <div><div className="text-[9px] font-bold text-violet-400 uppercase tracking-widest mb-1">Recommendation</div><p className="text-[11px] text-ink/60 leading-relaxed italic">"{fix.improvement.slice(0, 100)}..."</p></div>
                        <button onClick={() => applyQuickFix(fix)} className="w-full py-2 rounded-lg bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-violet-700 transition-all flex items-center justify-center gap-2">
                            <Sparkles size={12} />Apply Fix
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── StrengthsWeaknessesPanel ───────────────────────────────────────────────────
export const StrengthsWeaknessesPanel = ({ result, t }: { result: AnalysisResult; t: any }) => {
    if (!result.strengths || !result.weaknesses) return null;
    return (
        <div className="grid grid-cols-1 gap-4">
            <div className="narrative-card p-6 bg-emerald-50/30 border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-widest mb-4"><CheckCircle2 size={16} />{t.strengths}</div>
                <ul className="space-y-3">
                    {Array.isArray(result.strengths) && result.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-emerald-900/70 flex gap-2 leading-relaxed">
                            <span className="text-emerald-400 shrink-0">•</span>
                            {typeof s === 'string' ? s : JSON.stringify(s)}
                        </li>
                    ))}
                </ul>
            </div>
            <div className="narrative-card p-6 bg-amber-50/30 border-amber-100">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-widest mb-4"><AlertCircle size={16} />{t.weaknesses}</div>
                <ul className="space-y-3">
                    {Array.isArray(result.weaknesses) && result.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-amber-900/70 flex gap-2 leading-relaxed">
                            <span className="text-amber-400 shrink-0">•</span>
                            {typeof w === 'string' ? w : JSON.stringify(w)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// ── TensionPanel ─────────────────────────────────────────────────────────────
export const TensionPanel = ({ result, t }: { result: AnalysisResult; t: any }) => {
    if (!result.tensionAnalysis || result.tensionAnalysis.length === 0) {
        return (
            <div className="narrative-card p-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2"><Zap size={14} className="text-orange-500" />{t.tensionAnalysis}</h3>
                <div className="flex flex-col items-center justify-center h-24 border-b border-ink/10 pb-2 text-ink/20 italic text-[10px]">
                    {t.noTensionData || "No tension data available"}
                </div>
                <div className="flex justify-between text-[8px] text-ink/30 uppercase tracking-widest font-bold mt-4">
                    <span>{t.beginning}</span><span>{t.end}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="narrative-card p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2"><Zap size={14} className="text-orange-500" />{t.tensionAnalysis}</h3>
            <div className="space-y-6">
                <div className="flex items-end gap-1 h-32 border-b border-ink/10 pb-2">
                    {Array.isArray(result.tensionAnalysis) && result.tensionAnalysis.map((point, i) => (
                        <div key={i} className="flex-1 flex flex-col items-end group relative h-full justify-end">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${Math.max(point.level * 10, 5)}%` }}
                                className={cn(
                                    "w-full rounded-t-sm transition-all relative overflow-hidden",
                                    point.hasConflict ? "bg-gradient-to-t from-orange-400 to-orange-500" : "bg-ink/5 hover:bg-ink/10"
                                )}
                            >
                                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.4),transparent)]" />
                            </motion.div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2 bg-ink text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-[10px] shadow-xl">
                                <div className="font-bold border-b border-white/10 pb-1 mb-1 flex justify-between">
                                    <span className="truncate">{point.segment || `Point ${i + 1}`}</span>
                                    <span className="text-orange-400">{point.level}/10</span>
                                </div>
                                <div className="text-[8px] opacity-70 mb-1">{t.pacing}: {point.pacing}</div>
                                <p className="leading-tight">{point.note}</p>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-top-ink" style={{ borderTopColor: 'var(--ink)' }}></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[8px] text-ink/30 uppercase tracking-widest font-bold">
                    <span>{t.beginning}</span><span>{t.end}</span>
                </div>
            </div>
        </div>
    );
};

// ── SceneAnalysisPanel ─────────────────────────────────────────────────────────
export const SceneAnalysisPanel = ({ result, t, scrollToScene, mode }: { result: AnalysisResult; t: any; scrollToScene: (s: string) => void; mode: NarrativeMode }) => {
    if (!result.sceneAnalysis || result.sceneAnalysis.length === 0) return null;
    return (
        <div className="narrative-card p-6">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-6 flex items-center gap-2"><Activity size={14} className="text-violet-500" />{t.scenePurposeAnalysis}</h3>
            <div className="space-y-4">
                {Array.isArray(result.sceneAnalysis) && result.sceneAnalysis.map((scene, i) => (
                    <div key={i} className="relative pl-4 border-l-2 border-violet-100">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-ink/80">{scene.segment}</span>
                            <span className="text-[9px] font-bold text-violet-500">{t.impact}: {scene.impact}/10</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                            {Array.isArray(scene.purposes) && scene.purposes.map((p, j) => (
                                <span key={j} className="text-[8px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 font-bold uppercase tracking-tighter">{p}</span>
                            ))}
                        </div>
                        <p className="text-[10px] text-ink/50 leading-relaxed">{scene.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
// ── EditorSuggestionsPanel ─────────────────────────────────────────────────────
export const EditorSuggestionsPanel = ({ result, t }: { result: AnalysisResult; t: any }) => {
    if (!result.editorSuggestions || result.editorSuggestions.length === 0) return null;
    return (
        <div className="narrative-card p-6 border-blue-100 bg-blue-50/10">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-6 flex items-center gap-2">
                <Search size={14} />{t.editorSuggestions || "Editor Suggestions"}
            </h3>
            <div className="space-y-4">
                {Array.isArray(result.editorSuggestions) && result.editorSuggestions.map((s, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm space-y-2">
                        <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest text-ink/40">
                            <Search size={10} /> {t.suggestion || "Suggestion"}
                        </div>
                        <div className="text-xs">
                            <span className="line-through text-red-400 mr-2">{s.original}</span>
                            <span className="text-emerald-600 font-bold">{s.suggested}</span>
                        </div>
                        <p className="text-[10px] text-ink/50 italic leading-relaxed">{s.reason}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
