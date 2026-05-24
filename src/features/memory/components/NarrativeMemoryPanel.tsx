import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, X, MapPin, Clock, Zap, History, Plus } from "lucide-react";
import { Character, NarrativeMemory } from "../../../types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CharacterTrackerProps {
    characters: Character[];
    t: any;
    onAdd: (char: Character) => void;
    onRemove: (index: number) => void;
}

const CharacterTracker: React.FC<CharacterTrackerProps> = ({ characters, t, onAdd, onRemove }) => {
    const [newChar, setNewChar] = useState<Character>({ name: "", role: "", trait: "", status: "Active", location: "Unknown", goal: "", relationships: "", developmentArc: "" });
    const [isAdding, setIsAdding] = useState(false);

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-ink/60 text-sm font-medium uppercase tracking-wider">
                    <Users size={14} />
                    {t.characterTracker}
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs bg-ink/5 hover:bg-ink/10 px-2 py-1 rounded-md transition-all"
                >
                    {isAdding ? t.cancel : t.addCharacter}
                </button>
            </div>

            {isAdding && (
                <div className="bg-ink/5 p-4 rounded-xl space-y-3 mb-4">
                    <input
                        placeholder={t.characterName}
                        className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
                        value={newChar.name}
                        onChange={e => setNewChar({ ...newChar, name: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            placeholder={t.characterRole}
                            className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
                            value={newChar.role}
                            onChange={e => setNewChar({ ...newChar, role: e.target.value })}
                        />
                        <input
                            placeholder={t.characterTrait}
                            className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
                            value={newChar.trait}
                            onChange={e => setNewChar({ ...newChar, trait: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <input
                            placeholder="Status (e.g. Poisoned)"
                            className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
                            value={newChar.status}
                            onChange={e => setNewChar({ ...newChar, status: e.target.value })}
                        />
                        <input
                            placeholder="Location"
                            className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
                            value={newChar.location}
                            onChange={e => setNewChar({ ...newChar, location: e.target.value })}
                        />
                    </div>
                    <input
                        placeholder={t.characterGoals}
                        className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
                        value={newChar.goal}
                        onChange={e => setNewChar({ ...newChar, goal: e.target.value })}
                    />
                    <input
                        placeholder={t.characterRelationships}
                        className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
                        value={newChar.relationships}
                        onChange={e => setNewChar({ ...newChar, relationships: e.target.value })}
                    />
                    <input
                        placeholder={t.characterArc}
                        className="w-full bg-white px-3 py-2 rounded-lg text-sm border border-ink/10 outline-none"
                        value={newChar.developmentArc}
                        onChange={e => setNewChar({ ...newChar, developmentArc: e.target.value })}
                    />
                    <button
                        onClick={() => {
                            if (newChar.name) {
                                onAdd(newChar);
                                setNewChar({ name: "", role: "", trait: "", status: "Active", location: "Unknown", goal: "", relationships: "", developmentArc: "" });
                                setIsAdding(false);
                            }
                        }}
                        className="w-full bg-ink text-paper py-2 rounded-lg text-sm font-medium"
                    >
                        {t.save}
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {characters.map((char, idx) => (
                    <div key={idx} className="bg-white border border-ink/5 p-4 rounded-xl shadow-sm group relative">
                        <button
                            onClick={() => onRemove(idx)}
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-ink/20 hover:text-red-500 transition-all"
                        >
                            <X size={14} />
                        </button>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-sm">{char.name}</h4>
                            <span className="text-[9px] font-bold uppercase tracking-widest text-violet-500 bg-violet-50 px-1.5 py-0.5 rounded">
                                {char.role}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-[11px]">
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Status:</span>
                                <span className={cn("font-bold", char.status !== 'Active' ? "text-red-500" : "text-emerald-600")}>{char.status}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-target/40 font-medium uppercase shrink-0 w-16">Location:</span>
                                <span className="text-ink/70">{char.location}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Trait:</span>
                                <span className="text-ink/70">{char.trait}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Goal:</span>
                                <span className="text-ink/70">{char.goal}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Rel:</span>
                                <span className="text-ink/70">{char.relationships}</span>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Arc:</span>
                                <span className="text-ink/70">{char.developmentArc}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MemorySection = ({ title, icon: Icon, items, onAdd, onRemove }: {
    title: string,
    icon: any,
    items: string[],
    onAdd: (val: string) => void,
    onRemove: (idx: number) => void
}) => {
    const [input, setInput] = useState("");
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-ink/60 text-sm font-medium uppercase tracking-wider">
                    <Icon size={14} />
                    {title}
                </div>
            </div>
            <div className="space-y-2">
                {items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group bg-ink/5 px-3 py-1.5 rounded-lg text-sm">
                        <span className="truncate">{item}</span>
                        <button
                            onClick={() => onRemove(idx)}
                            className="opacity-0 group-hover:opacity-100 text-ink/40 hover:text-red-500 transition-all"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                onAdd(input);
                                setInput("");
                            }
                        }}
                        placeholder={`Add ${title.toLowerCase()}...`}
                        className="w-full bg-transparent border-b border-ink/10 py-1 text-sm focus:border-ink/30 outline-none placeholder:text-ink/20"
                    />
                    <button
                        onClick={() => { onAdd(input); setInput(""); }}
                        className="absolute right-0 top-1 text-ink/40 hover:text-ink"
                    >
                        <Plus size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export interface NarrativeMemoryPanelProps {
    memory: NarrativeMemory;
    showMemory: boolean;
    setShowMemory: (show: boolean) => void;
    t: any;
    onResetMemory: () => void;
    onAddCharacter: (char: Character) => void;
    onRemoveCharacter: (idx: number) => void;
    onAddStringMemory: (key: keyof Omit<NarrativeMemory, 'characters'>, value: string) => void;
    onRemoveStringMemory: (key: keyof NarrativeMemory, index: number) => void;
}

export default function NarrativeMemoryPanel({
    memory,
    showMemory,
    setShowMemory,
    t,
    onResetMemory,
    onAddCharacter,
    onRemoveCharacter,
    onAddStringMemory,
    onRemoveStringMemory
}: NarrativeMemoryPanelProps) {
    return (
        <div className="flex flex-col h-full bg-white overflow-y-auto p-6 scrollbar-hide">
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-xl font-bold">{t.narrativeMemory}</h2>
                <button
                    onClick={onResetMemory}
                    className="text-[9px] font-bold uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors"
                >
                    {t.reset}
                </button>
            </div>

            <CharacterTracker
                characters={memory.characters}
                t={t}
                onAdd={onAddCharacter}
                onRemove={onRemoveCharacter}
            />

            <MemorySection
                title={t.locations}
                icon={MapPin}
                items={memory.locations}
                onAdd={(v) => onAddStringMemory('locations', v)}
                onRemove={(i) => onRemoveStringMemory('locations', i)}
            />
            <MemorySection
                title={t.timeline}
                icon={Clock}
                items={memory.timeline}
                onAdd={(v) => onAddStringMemory('timeline', v)}
                onRemove={(i) => onRemoveStringMemory('timeline', i)}
            />
            <MemorySection
                title={t.worldRules}
                icon={Zap}
                items={memory.worldRules}
                onAdd={(v) => onAddStringMemory('worldRules', v)}
                onRemove={(i) => onRemoveStringMemory('worldRules', i)}
            />
            <MemorySection
                title={t.plotEvents}
                icon={History}
                items={memory.plotEvents}
                onAdd={(v) => onAddStringMemory('plotEvents', v)}
                onRemove={(i) => onRemoveStringMemory('plotEvents', i)}
            />

            <div className="mt-12 p-4 rounded-2xl bg-violet-50 border border-violet-100">
                <p className="text-xs text-violet-700 leading-relaxed mb-4">
                    {t.proTip}
                </p>
                <div className="pt-4 border-t border-violet-200">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-violet-900 mb-2">Story Engine Logic</h4>
                    <p className="text-[10px] text-violet-700 leading-relaxed mb-2">
                        <strong>Scene Generation:</strong> The AI uses the active scene's Goal and Conflict as a blueprint.
                    </p>
                    <p className="text-[10px] text-violet-700 leading-relaxed mb-2">
                        <strong>Action Scenes:</strong> Structured as Goal → Conflict → Escalation → Outcome.
                    </p>
                    <p className="text-[10px] text-violet-700 leading-relaxed mb-2">
                        <strong>Reflection Scenes:</strong> Structured as Reaction → Dilemma → Decision.
                    </p>
                    <p className="text-[10px] text-violet-700 leading-relaxed">
                        <strong>Outcomes:</strong> The AI extracts the scene's outcome (Success, Failure, Complication) and suggests it as a new Plot Event to maintain continuity.
                    </p>
                </div>
            </div>
        </div>
    );
}
