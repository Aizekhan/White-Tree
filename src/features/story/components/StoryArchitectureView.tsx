import React from "react";
import { motion } from "motion/react";
import { Layout, PenLine, Plus, Lock, Clock, AlertTriangle, Loader2, Check } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { StoryArchitecture, ArchitectScene, ArchitectAct, Project } from "../../../types";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface StoryArchitectureViewProps {
    architecture: StoryArchitecture;
    t: Record<string, string>;
    sceneProgress: Record<string, "Planned" | "Drafted" | "Analyzed" | "Improved" | "Adapted">;
    editingScene: { act: string; chapter: string; title: string } | null;
    setEditingScene: (scene: { act: string; chapter: string; title: string } | null) => void;
    onWriteScene: (actTitle: string, chapterTitle: string, sceneTitle: string, sceneDescription: string, goals: string[], conflicts: string[], actKey: string, chapterIdx: number, sceneIdx: number) => void;
    onManualEditScene: (actTitle: string, chapterTitle: string, sceneTitle: string, newDescription: string) => void;
    onInsertScene: (actKey: string, chapterIdx: number, sceneIdx: number) => void;
    onFutureHistoryEdit?: (actKey: string, chapterIdx: number, sceneIdx: number, updatedScene: ArchitectScene) => void;
    onTrueHistoryEdit?: (scene: ArchitectScene, actKey: string, chapterIdx: number, sceneIdx: number) => void;
    onSelectScene?: (actTitle: string, chapterTitle: string, sceneTitle: string, sceneDescription: string, goals: string[], conflicts: string[], actKey: string, chapterIdx: number, sceneIdx: number) => void;
    isResyncingArchitecture?: boolean;
    tier?: "free" | "pro_plus";
    activeScene?: Project['activeScene'];
    compact?: boolean;
}

export default function StoryArchitectureView({
    architecture,
    t,
    sceneProgress,
    editingScene,
    setEditingScene,
    onWriteScene,
    onManualEditScene,
    onInsertScene,
    onTrueHistoryEdit,
    onFutureHistoryEdit,
    onSelectScene,
    isResyncingArchitecture,
    tier = 'free',
    activeScene,
    compact = false
}: StoryArchitectureViewProps) {
    const actKeys = ["act1", "act2", "act3"] as const;

    const [showKeyEvents, setShowKeyEvents] = React.useState<Record<string, boolean>>({});

    const toggleKeyEvents = (e: React.MouseEvent, sceneTitle: string) => {
        e.stopPropagation();
        setShowKeyEvents(prev => ({ ...prev, [sceneTitle]: !prev[sceneTitle] }));
    };

    const SceneStatusBadge = ({ scene }: { scene: ArchitectScene }) => {
        if (scene.isLocked) {
            return (
                <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                    <Lock size={8} /> True History
                </span>
            );
        }
        if (scene.writtenText) {
            return (
                <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Clock size={8} /> Written
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100">
                Future History
            </span>
        );
    }

    return (
        <motion.div
            key="architecture"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 pb-20"
        >
            {isResyncingArchitecture && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-700">
                    <Loader2 size={16} className="animate-spin" />
                    AI is re-syncing Future History with your changes...
                </div>
            )}

            {!compact && (
                <div className="narrative-card p-8 space-y-12 border-violet-100 bg-violet-50/10">
                    <div className="border-b border-ink/10 pb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-violet-600 text-paper flex items-center justify-center shadow-lg shadow-violet-200">
                                <Layout size={24} />
                            </div>
                            <div>
                                <h2 className="font-serif text-3xl font-bold text-ink">{architecture.title}</h2>
                                <p className="text-xs text-ink/40 uppercase tracking-widest font-bold">{t.storyArchitecture}</p>
                            </div>
                        </div>
                        <p className="text-lg text-ink/70 leading-relaxed italic font-serif">
                            "{architecture.premise}"
                        </p>
                    </div>
                </div>
            )}

            <div className={cn("grid grid-cols-1", compact ? "gap-6 px-4" : "gap-12")}>
                {actKeys.map((actKey, actIdx) => {
                    const act = architecture.acts[actKey];
                    if (!act) return null;
                    return (
                        <div key={actIdx} className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center font-bold text-sm">
                                    {actIdx + 1}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight">{act.title}</h3>
                                    <p className="text-sm text-ink/50">{act.description}</p>
                                </div>
                            </div>

                            <div className={cn("grid", compact ? "grid-cols-1 gap-4" : "grid-cols-1 md:grid-cols-2 gap-6")}>
                                {!compact && (
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/30">{t.keyMilestones}</h4>
                                        <div className="space-y-3">
                                            {act.milestones.map((m, i) => (
                                                <div key={i} className="p-4 rounded-2xl bg-violet-50/50 border border-violet-100/50">
                                                    <div className="font-bold text-xs text-violet-900 mb-1">{m.label}</div>
                                                    <p className="text-[11px] text-violet-900/60 leading-relaxed">{m.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className={cn("space-y-6", compact ? "col-span-1" : "")}>
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink/30">{t.chaptersAndScenes}</h4>
                                    <div className="space-y-6">
                                        {act.chapters.map((chapter, chapterIdx) => (
                                            <div key={chapterIdx} className="space-y-4">
                                                <div className="text-sm font-bold border-b border-ink/5 pb-2">{chapter.title}</div>
                                                <div className="space-y-4">
                                                    {chapter.scenes.map((scene, sceneIdx) => (
                                                        <React.Fragment key={sceneIdx}>
                                                            <div className={cn(
                                                                "pl-4 border-l-2 space-y-2 group/scene relative transition-all duration-200 cursor-pointer p-2 rounded-r-xl",
                                                                activeScene?.title === scene.title ? "bg-violet-50/50 ring-1 ring-inset ring-violet-500/30" : "hover:bg-ink/[0.02]",
                                                                scene.isLocked ? "border-slate-300 opacity-80" :
                                                                    scene.writtenText ? "border-emerald-300" : "border-blue-200"
                                                            )}
                                                                onClick={() => onSelectScene?.(act.title, chapter.title, scene.title, scene.description, scene.characterGoals, scene.conflicts, actKey, chapterIdx, sceneIdx)}
                                                            >
                                                                {/* Active Indicator */}
                                                                {activeScene?.title === scene.title && (
                                                                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)] z-10" />
                                                                )}
                                                                <div className="flex items-start gap-3">
                                                                    {/* Selection Radio / Check Indicator */}
                                                                    <div className="pt-0.5 opacity-60 group-hover/scene:opacity-100 transition-opacity flex-shrink-0">
                                                                        <div className={cn(
                                                                            "w-4 h-4 rounded-full border flex items-center justify-center transition-all",
                                                                            activeScene?.title === scene.title
                                                                                ? "bg-violet-600 border-violet-600 text-white shadow-sm"
                                                                                : "border-ink/20 bg-white"
                                                                        )}>
                                                                            {activeScene?.title === scene.title && <Check size={10} strokeWidth={3} />}
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center justify-between">
                                                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                                                <div className={cn("text-xs font-bold", activeScene?.title === scene.title ? "text-violet-700" : "text-ink/80")}>
                                                                                    {scene.title}
                                                                                </div>
                                                                                <SceneStatusBadge scene={scene} />
                                                                                {sceneProgress[scene.title] && !scene.isLocked && (
                                                                                    <span className={cn(
                                                                                        "text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full border",
                                                                                        sceneProgress[scene.title] === "Adapted" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                                                                            sceneProgress[scene.title] === "Improved" ? "bg-pink-50 text-pink-600 border-pink-100" :
                                                                                                sceneProgress[scene.title] === "Analyzed" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                                                                    sceneProgress[scene.title] === "Drafted" ? "bg-violet-50 text-violet-600 border-violet-100" :
                                                                                                        "bg-ink/5 text-ink/40 border-ink/10"
                                                                                    )}>
                                                                                        {sceneProgress[scene.title]}
                                                                                    </span>
                                                                                )}
                                                                                {/* Inconsistency badge */}
                                                                                {scene.inconsistencies && scene.inconsistencies.length > 0 && (
                                                                                    <span
                                                                                        className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-100 cursor-help"
                                                                                        title={scene.inconsistencies.map(i => `${i.severity.toUpperCase()}: ${i.description}`).join("\n")}
                                                                                    >
                                                                                        <AlertTriangle size={8} /> {scene.inconsistencies.length} conflict{scene.inconsistencies.length > 1 ? "s" : ""}
                                                                                    </span>
                                                                                )}
                                                                            </div>

                                                                            {/* Action buttons — differ by scene state */}
                                                                            <div className={cn("flex items-center gap-1.5 transition-opacity", activeScene?.title === scene.title ? "opacity-100" : "opacity-0 group-hover/scene:opacity-100")}>
                                                                                {scene.isLocked ? (
                                                                                    // True History — only Pro+ manual edit
                                                                                    tier === 'pro_plus' && (
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); onTrueHistoryEdit?.(scene, actKey, chapterIdx, sceneIdx); }}
                                                                                            className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-600 text-[9px] font-bold uppercase tracking-widest hover:bg-amber-100 transition-all border border-amber-100"
                                                                                            title="Edit True History (Pro+ — no AI sync)"
                                                                                        >
                                                                                            <Lock size={8} /> Edit
                                                                                        </button>
                                                                                    )
                                                                                ) : scene.writtenText ? (
                                                                                    // Written but not locked — still free to Write/Improve
                                                                                    null
                                                                                ) : (
                                                                                    <>
                                                                                        <button
                                                                                            onClick={(e) => toggleKeyEvents(e, scene.title)}
                                                                                            className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest text-ink/40 hover:bg-ink/5 hover:text-ink transition-all"
                                                                                            title={t.keyEvents || "Key Events"}
                                                                                        >
                                                                                            <Clock size={10} /> {showKeyEvents[scene.title] ? (t.hideEvents || "Hide Events") : (t.keyEvents || "Key Events")}
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={(e) => { e.stopPropagation(); onManualEditScene(act.title, chapter.title, scene.title, scene.description); }}
                                                                                            className="flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-widest text-ink/40 hover:bg-ink/5 hover:text-ink transition-all"
                                                                                            title={t.editBlueprint || "Edit Outline"}
                                                                                        >
                                                                                            <Layout size={10} /> {t.editOutline || "Edit Outline"}
                                                                                        </button>
                                                                                    </>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Edit textarea for Future History */}
                                                                {!scene.isLocked && editingScene?.title === scene.title ? (
                                                                    <div className="mt-2 space-y-2 bg-paper p-3 rounded-xl border border-blue-100">
                                                                        <textarea
                                                                            defaultValue={scene.description}
                                                                            onBlur={(e) => {
                                                                                const updated = { ...scene, description: e.target.value };
                                                                                if (onFutureHistoryEdit) {
                                                                                    onFutureHistoryEdit(actKey, chapterIdx, sceneIdx, updated);
                                                                                } else {
                                                                                    onManualEditScene(act.title, chapter.title, scene.title, e.target.value);
                                                                                }
                                                                                setEditingScene(null);
                                                                            }}
                                                                            className="w-full bg-transparent text-[11px] text-ink/70 leading-relaxed outline-none resize-none"
                                                                            rows={3}
                                                                            autoFocus
                                                                        />
                                                                        <div className="flex justify-end gap-2">
                                                                            <button
                                                                                onClick={() => setEditingScene(null)}
                                                                                className="text-[8px] font-bold uppercase text-ink/30"
                                                                            >
                                                                                {t.cancel || "Cancel"}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-[11px] text-ink/50 leading-relaxed">{scene.description}</p>
                                                                )}

                                                                <div className="flex flex-wrap gap-2 pt-1 border-t border-ink/5 mt-2 pt-2">
                                                                    {/* Always show Goals and Conflicts */}
                                                                    {scene.characterGoals?.map((goal, k) => (
                                                                        <span key={k} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-bold uppercase tracking-wider border border-emerald-100">
                                                                            {t.goal || "Goal"}: {goal}
                                                                        </span>
                                                                    ))}
                                                                    {scene.conflicts?.map((conflict, k) => (
                                                                        <span key={k} className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[8px] font-bold uppercase tracking-wider border border-red-100">
                                                                            {t.conflict || "Conflict"}: {conflict}
                                                                        </span>
                                                                    ))}

                                                                    {/* Show Key Events only if toggled ON */}
                                                                    {showKeyEvents[scene.title] && scene.keyEvents?.map((event, k) => (
                                                                        <span key={k} className="px-2 py-0.5 rounded-md bg-violet-50 text-violet-600 text-[8px] font-bold uppercase tracking-wider border border-violet-100 flex items-center gap-1">
                                                                            <Clock size={8} /> {event}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Insert Scene Button between scenes */}
                                                            < div className="relative h-4 flex items-center justify-center group/insert" >
                                                                <div className="absolute inset-0 flex items-center">
                                                                    <div className="w-full h-px bg-violet-100 opacity-0 group-hover/insert:opacity-100 transition-opacity" />
                                                                </div>
                                                                <button
                                                                    onClick={() => onInsertScene(actKey, chapterIdx, sceneIdx + 1)}
                                                                    className="relative z-10 w-6 h-6 rounded-full bg-paper border border-violet-200 text-violet-400 flex items-center justify-center opacity-0 group-hover/insert:opacity-100 transition-all hover:scale-110 hover:bg-violet-600 hover:text-white"
                                                                >
                                                                    <Plus size={12} />
                                                                </button>
                                                            </div>
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
