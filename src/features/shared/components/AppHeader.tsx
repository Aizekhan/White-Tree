import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BrainCircuit, BookOpen, User as UserIcon, LogOut, Loader2, Sparkles, Zap, Menu, Activity, PanelLeftOpen, PanelLeftClose, Cloud, CheckCircle2, AlertCircle } from "lucide-react";
import { useStoryStore } from "../../../store/useStoryStore";
import { auth } from "../../../firebase";
import logo from "../../../../assets/logo.png";
import { signOut } from "firebase/auth";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NarrativeMode } from "../../../types";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface AppHeaderProps {
    t: any;
    user: any;
    tokens: number;
    tier?: string;
    onToggleLeftSidebar?: () => void;
    showLeftSidebar?: boolean;
    currentMode: string;
    onSelectMode: (mode: any) => void;
}

export default function AppHeader({
    t, user,
    tokens, tier,
    onToggleLeftSidebar, showLeftSidebar,
    currentMode, onSelectMode
}: AppHeaderProps) {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { isSaving, isDirty, saveStatus } = useStoryStore();

    return (
        <header className="h-16 bg-white border-b border-ink/5 px-6 flex items-center justify-between z-50 shrink-0">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg shadow-ink/10">
                        <img src={logo} alt="WhiteWrite Logo" className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="font-serif text-lg font-black tracking-tight text-ink leading-none uppercase">WhiteWrite <span className="opacity-20 text-[10px]">v5.1.0</span></h1>
                        <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-violet-500 mt-1">{t.narrativeEngine || "Narrative Engine"}</p>
                    </div>
                </div>

                <div className="h-6 w-px bg-ink/5 hidden md:block" />

                <nav className="hidden md:flex items-center gap-1">
                    <button
                        onClick={() => onSelectMode(NarrativeMode.PROJECTS)}
                        className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                            currentMode === NarrativeMode.PROJECTS ? "bg-violet-50 text-violet-600" : "text-ink/40 hover:text-ink hover:bg-ink/5"
                        )}
                    >
                        {t.projects}
                    </button>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-ink/[0.02] border border-ink/5 group hover:border-violet-200 transition-all cursor-default">
                    <Activity size={14} className="text-violet-500 group-hover:animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-ink/30 uppercase tracking-tighter leading-none mb-1">Compute Power</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xs font-black text-ink">{tokens}</span>
                            <span className="text-[9px] font-bold text-violet-400 uppercase tracking-tighter">THz</span>
                        </div>
                    </div>
                </div>

                {/* [VER_6_SAVE_STATUS] Visual feedback for ChatGPT-style saving */}
                <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-300",
                    isSaving ? "bg-violet-50 border-violet-100" : 
                    isDirty ? "bg-orange-50 border-orange-100" : 
                    saveStatus === 'error' ? "bg-red-50 border-red-100" : 
                    "bg-emerald-50 border-emerald-100"
                )}>
                    {isSaving ? (
                        <Loader2 size={12} className="animate-spin text-violet-500" />
                    ) : isDirty ? (
                        <Cloud size={12} className="text-orange-400" />
                    ) : saveStatus === 'error' ? (
                        <AlertCircle size={12} className="text-red-500" />
                    ) : (
                        <CheckCircle2 size={12} className="text-emerald-500" />
                    )}
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        isSaving ? "text-violet-500" : 
                        isDirty ? "text-orange-400" : 
                        saveStatus === 'error' ? "text-red-500" : 
                        "text-emerald-500"
                    )}>
                        {isSaving ? t.saving : isDirty ? t.unsaved : saveStatus === 'error' ? t.saveError : t.saved}
                    </span>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="w-10 h-10 rounded-2xl bg-ink/5 flex items-center justify-center hover:bg-ink/10 transition-all border border-transparent hover:border-ink/5 overflow-hidden"
                    >
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={18} className="text-ink/40" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-ink/5 p-2 overflow-hidden"
                            >
                                <div className="p-4 border-b border-ink/5 mb-2">
                                    <p className="text-xs font-black text-ink truncate">{user?.displayName || user?.email}</p>
                                    <p className="text-[10px] text-ink/40 font-bold uppercase tracking-widest mt-1">
                                        {tier === 'pro' ? '★ Pro Narrator' : 'Free Journey'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => signOut(auth)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all"
                                >
                                    <LogOut size={16} />
                                    {t.signOut}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
