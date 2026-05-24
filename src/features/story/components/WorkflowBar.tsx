import React from "react";
import {
    BookOpen, Layout, PenLine, Search, Sparkles, Clapperboard, BrainCircuit,
    ChevronDown
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NarrativeMode, NarrativeAspect } from "../../../types";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface WorkflowBarProps {
    t: Record<string, string>;
    mode: NarrativeMode;
    setMode: (mode: NarrativeMode) => void;
    sceneType: "Auto" | "Action" | "Reflection";
    setSceneType: (type: "Auto" | "Action" | "Reflection") => void;
    aspect: NarrativeAspect;
    setAspect: (aspect: NarrativeAspect) => void;
    compact?: boolean;
    hasText?: boolean;
    hasAnalysis?: boolean;
}

const WORKFLOW_STEPS = (t: Record<string, string>) => [
    { id: NarrativeMode.PROJECTS, label: t.projects, icon: BookOpen },
    { id: NarrativeMode.ARCHITECT, label: t.architect, icon: Layout },
    { id: NarrativeMode.WRITE, label: t.write, icon: PenLine },
    { id: NarrativeMode.ANALYZE, label: t.analyze, icon: Search },
    { id: NarrativeMode.IMPROVE, label: t.improve, icon: Sparkles },
    { id: NarrativeMode.ADAPT, label: t.adapt, icon: Clapperboard },
];

const WORKFLOW_ORDER = [
    NarrativeMode.PROJECTS,
    NarrativeMode.ARCHITECT,
    NarrativeMode.WRITE,
    NarrativeMode.ANALYZE,
    NarrativeMode.IMPROVE,
    NarrativeMode.ADAPT,
];

export default function WorkflowBar({
    t,
    mode,
    setMode,
    sceneType,
    setSceneType,
    aspect,
    setAspect,
    compact = false,
    hasText = true, // Default true for backwards compatibility if not provided
    hasAnalysis = true
}: WorkflowBarProps) {
    const currentStepIdx = WORKFLOW_ORDER.indexOf(mode);

    const isStepDisabled = (stepId: NarrativeMode) => {
        if (stepId === NarrativeMode.ANALYZE) return !hasText;
        if (stepId === NarrativeMode.IMPROVE || stepId === NarrativeMode.ADAPT) return !hasText || !hasAnalysis;
        return false;
    };

    if (compact) {
        return (
            <div className="flex items-center gap-1 bg-ink/5 p-1 rounded-xl">
                {WORKFLOW_STEPS(t).map((step) => {
                    const isActive = mode === step.id;
                    const disabled = isStepDisabled(step.id);
                    return (
                        <button
                            key={step.id}
                            onClick={() => !disabled && setMode(step.id)}
                            title={step.label}
                            disabled={disabled}
                            className={cn(
                                "p-2 rounded-lg transition-all",
                                isActive
                                    ? "bg-white text-violet-600 shadow-sm"
                                    : disabled
                                        ? "text-ink/20 cursor-not-allowed"
                                        : "text-ink/40 hover:text-ink/60 hover:bg-white/50"
                            )}
                        >
                            <step.icon size={14} />
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink/40">{t.creativeWorkflow}</h2>
                {mode !== NarrativeMode.ARCHITECT && (
                    <div className="flex items-center gap-4">
                        {mode === NarrativeMode.WRITE && (
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                                <span>{t.sceneType}:</span>
                                <div className="relative">
                                    <select
                                        value={sceneType}
                                        onChange={(e) => setSceneType(e.target.value as "Auto" | "Action" | "Reflection")}
                                        className="appearance-none bg-transparent font-bold text-violet-600 border-b border-violet-200 pr-6 cursor-pointer focus:outline-none"
                                    >
                                        <option value="Auto">{t.auto}</option>
                                        <option value="Action">{t.action}</option>
                                        <option value="Reflection">{t.reflection}</option>
                                    </select>
                                    <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400" />
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-ink/40">
                            <span>{t.focus}:</span>
                            <div className="relative">
                                <select
                                    value={aspect}
                                    onChange={(e) => setAspect(e.target.value as NarrativeAspect)}
                                    className="appearance-none bg-transparent font-bold text-violet-600 border-b border-violet-200 pr-6 cursor-pointer focus:outline-none"
                                >
                                    {Object.values(NarrativeAspect).map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                                <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-violet-400" />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between px-2 py-4 border-b border-ink/5">
                {WORKFLOW_STEPS(t).map((step, i, arr) => {
                    const stepIdx = WORKFLOW_ORDER.indexOf(step.id);
                    const disabled = isStepDisabled(step.id);
                    return (
                        <React.Fragment key={step.id}>
                            <div
                                className={cn("flex flex-col items-center gap-2 group", disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer")}
                                onClick={() => !disabled && setMode(step.id)}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                                    mode === step.id
                                        ? "bg-violet-600 text-white shadow-lg shadow-violet-200 scale-110"
                                        : disabled
                                            ? "bg-ink/5 text-ink/20"
                                            : "bg-ink/5 text-ink/30 group-hover:bg-ink/10 group-hover:text-ink/50"
                                )}>
                                    <step.icon size={18} className={mode === step.id ? "animate-pulse" : ""} />
                                </div>
                                <span className={cn(
                                    "text-[9px] font-bold uppercase tracking-widest transition-colors",
                                    mode === step.id ? "text-violet-600" : disabled ? "text-ink/20" : "text-ink/30 group-hover:text-ink/60"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                            {i < arr.length - 1 && (
                                <div className="flex-1 h-px bg-ink/5 mx-4 relative">
                                    <div className={cn(
                                        "absolute inset-0 bg-violet-200 transition-all duration-500 origin-left",
                                        currentStepIdx > i ? "scale-x-100" : "scale-x-0"
                                    )} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
