import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Plus, Trash2, Users, Edit2, Check, X } from "lucide-react";
import { Project } from "../../../types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ProjectListProps {
    projects: Project[];
    activeProjectId: string | null;
    t: any;
    onCreateProject: (title?: string, description?: string, language?: 'UA' | 'ENG') => void;
    onSelectProject: (id: string) => void;
    onDeleteProject: (id: string) => void;
    onUpdateProject: (id: string, data: Partial<Project>) => void;
}

export default function ProjectList({
    projects,
    activeProjectId,
    t,
    onCreateProject,
    onSelectProject,
    onDeleteProject,
    onUpdateProject
}: ProjectListProps) {
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [newLang, setNewLang] = useState<'UA' | 'ENG'>('UA');

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [countdown, setCountdown] = useState(0);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        onCreateProject(newTitle || t.newStory, newDescription || t.newJourney, newLang);
        setNewTitle("");
        setNewDescription("");
        setIsCreating(false);
    };

    const startEditing = (project: Project) => {
        setEditingId(project.id);
        setEditTitle(project.title);
        setEditDesc(project.description);
    };

    const saveEdit = (id: string) => {
        onUpdateProject(id, { title: editTitle, description: editDesc });
        setEditingId(null);
    };

    const startDeleteCountdown = (id: string) => {
        setDeletingId(id);
        setCountdown(5);
        if (timerRef.current) clearInterval(timerRef.current);

        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    if (timerRef.current) clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const confirmDelete = (id: string) => {
        onDeleteProject(id);
        setDeletingId(null);
        setCountdown(0);
    };

    const cancelDelete = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        setDeletingId(null);
        setCountdown(0);
    };

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key="projects"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-serif font-bold">{t.storyProjects}</h2>
                        <p className="text-sm text-ink/40">{t.manageUniverses}</p>
                    </div>
                    {!isCreating ? (
                        <button
                            onClick={() => setIsCreating(true)}
                            className="flex items-center gap-2 bg-ink text-paper px-4 py-2 rounded-xl text-sm font-medium hover:bg-ink/90 transition-all shadow-sm"
                        >
                            <Plus size={18} />
                            {t.newProject}
                        </button>
                    ) : (
                        <div className="bg-white border border-violet-100 p-6 rounded-2xl shadow-xl w-full max-w-2xl mt-4">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center">
                                    <BookOpen size={20} />
                                </div>
                                <div>
                                    <h3 className="font-serif font-bold text-lg text-violet-900">{t.newProject || "New Project"}</h3>
                                    <p className="text-xs text-violet-600/70 font-medium">{t.startJourney || "Start your narrative journey"}</p>
                                </div>
                            </div>

                            <form onSubmit={handleCreate} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <input
                                                autoFocus
                                                value={newTitle}
                                                onChange={(e) => setNewTitle(e.target.value)}
                                                placeholder={t.newStory || "Story Title"}
                                                className="w-full bg-ink/[0.02] border border-ink/10 px-4 py-3 rounded-xl text-base font-bold focus:ring-2 focus:ring-violet-200 focus:border-violet-300 outline-none transition-all placeholder:font-normal placeholder:opacity-50"
                                            />
                                        </div>
                                        <div className="flex bg-ink/[0.02] border border-ink/10 rounded-xl p-1">
                                            {(['ENG', 'UA'] as const).map((lang) => (
                                                <button
                                                    key={lang}
                                                    type="button"
                                                    onClick={() => setNewLang(lang)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-lg text-xs font-bold transition-all",
                                                        newLang === lang
                                                            ? "bg-white text-violet-600 shadow-sm border border-black/5"
                                                            : "text-ink/40 hover:text-ink/60"
                                                    )}
                                                >
                                                    {lang}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-ink/40 mb-2 ml-1">
                                            {t.storyPremise || "Story Premise / Description"}
                                        </label>
                                        <textarea
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            placeholder={t.newJourney || "Describe the core conflict, main character, and setting..."}
                                            className="w-full h-32 bg-ink/[0.02] border border-ink/10 px-4 py-3 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-violet-200 focus:border-violet-300 outline-none resize-none transition-all placeholder:opacity-50"
                                        />
                                        <p className="text-[10px] text-ink/30 mt-2 ml-1">
                                            {t.premiseTip || "This will be used by the AI to automatically construct the initial architecture tree."}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreating(false)}
                                        className="px-6 py-2.5 bg-ink/5 text-ink/60 rounded-xl hover:bg-ink/10 hover:text-ink/80 text-xs font-bold transition-all"
                                    >
                                        {t.cancel || "Cancel"}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 hover:shadow-lg text-xs font-bold transition-all"
                                    >
                                        <Check size={16} />
                                        {t.createProject || "Create Project"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {projects.map(project => {
                        const isEditing = editingId === project.id;
                        const isDeleting = deletingId === project.id;

                        return (
                            <div
                                key={project.id}
                                onClick={() => !isEditing && !isDeleting && onSelectProject(project.id)}
                                className={cn(
                                    "p-6 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden",
                                    project.id === activeProjectId
                                        ? "bg-violet-50 border-violet-200 shadow-sm"
                                        : "bg-white border-ink/5 hover:border-ink/10 hover:shadow-md",
                                    isDeleting && "border-red-200 bg-red-50/30"
                                )}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-ink/5 flex items-center justify-center text-ink/40 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                                        <BookOpen size={20} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!isEditing && !isDeleting ? (
                                            <>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startEditing(project);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-ink/20 hover:text-violet-600 transition-all"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        startDeleteCountdown(project.id);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-2 text-ink/20 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        ) : isEditing ? (
                                            <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                                                <button
                                                    onClick={() => saveEdit(project.id)}
                                                    className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                                >
                                                    <Check size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingId(null)}
                                                    className="p-2 text-ink/20 hover:text-ink/60 rounded-lg transition-all"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                                <button
                                                    disabled={countdown > 0}
                                                    onClick={() => confirmDelete(project.id)}
                                                    className={cn(
                                                        "px-3 py-1 rounded-lg text-[10px] font-bold transition-all shadow-sm",
                                                        countdown > 0
                                                            ? "bg-red-100 text-red-300 cursor-not-allowed"
                                                            : "bg-red-600 text-white hover:bg-red-700"
                                                    )}
                                                >
                                                    {countdown > 0 ? `Delete (${countdown}s)` : "Confirm Delete"}
                                                </button>
                                                <button
                                                    onClick={cancelDelete}
                                                    className="bg-ink/5 text-ink/40 px-3 py-1 rounded-lg text-[10px] font-bold hover:bg-ink/10 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {isEditing ? (
                                    <div className="space-y-2 mb-4" onClick={e => e.stopPropagation()}>
                                        <input
                                            autoFocus
                                            value={editTitle}
                                            onChange={e => setEditTitle(e.target.value)}
                                            className="w-full bg-violet-100/50 border-none rounded-lg px-3 py-1 text-lg font-bold outline-none focus:ring-2 focus:ring-violet-200"
                                        />
                                        <textarea
                                            value={editDesc}
                                            onChange={e => setEditDesc(e.target.value)}
                                            className="w-full bg-violet-100/50 border-none rounded-lg px-3 py-1 text-xs outline-none focus:ring-2 focus:ring-violet-200 resize-none h-16"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h3 className={cn("font-bold text-lg mb-1", isDeleting && "text-red-900/40")}>
                                            {project.title}
                                        </h3>
                                        <p className={cn("text-xs text-ink/50 line-clamp-2 mb-4", isDeleting && "text-red-900/20")}>
                                            {project.description}
                                        </p>
                                    </>
                                )}

                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-ink/30">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-ink/5 px-2 py-0.5 rounded text-[9px] font-bold text-ink/40">
                                            {project.language}
                                        </span>
                                        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                    <span className="flex items-center gap-1">
                                        <Users size={10} />
                                        {project.memory?.characters?.length || 0}
                                    </span>
                                </div>

                                {isDeleting && (
                                    <motion.div
                                        initial={{ width: "100%" }}
                                        animate={{ width: "0%" }}
                                        transition={{ duration: 5, ease: "linear" }}
                                        className="absolute bottom-0 left-0 h-1 bg-red-500/30"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
