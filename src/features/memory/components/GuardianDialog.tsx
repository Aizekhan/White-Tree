/**
 * GuardianDialog.tsx — Canon Guardian Dialog
 *
 * Purpose: Human-in-the-loop confirmation for inline editing changes
 * Appears after user edits prose text and extractFromEdit detects changes
 *
 * Features:
 * - Natural language display of detected entities
 * - Conflict warnings with impact visualization
 * - Entity type promotion (user can change type)
 * - Onboarding coach tip (first-time only)
 *
 * @see handoff/EDIT_TO_CANON.md
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
    Shield, Check, X, Edit2, AlertTriangle, Sparkles,
    Users as UsersIcon, MapPin, Clock, Zap, Info
} from "lucide-react";
import type { ExtractFromEditResult } from "../../../canon/extractFromEdit";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type EntityType = 'character' | 'location' | 'event';

export interface ConfirmedEntity {
    name: string;
    type: EntityType;
    role?: string;
    trait?: string;
    description?: string;
    originalType: EntityType; // For tracking if user changed type
}

export interface GuardianDialogProps {
    isOpen: boolean;
    result: ExtractFromEditResult | null;
    onConfirm: (entities: ConfirmedEntity[]) => void;
    onReject: () => void;
    onClose: () => void;
    showOnboarding?: boolean; // First-time user
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity Type Helpers
// ─────────────────────────────────────────────────────────────────────────────

function getEntityIcon(type: EntityType) {
    switch (type) {
        case 'character': return UsersIcon;
        case 'location': return MapPin;
        case 'event': return Clock;
        default: return Sparkles;
    }
}

function getTypeLabel(type: EntityType): string {
    switch (type) {
        case 'character': return 'Персонаж';
        case 'location': return 'Локація';
        case 'event': return 'Подія';
        default: return type;
    }
}

function getImpactColor(impact: 'low' | 'medium' | 'high'): string {
    switch (impact) {
        case 'high': return 'red';
        case 'medium': return 'amber';
        case 'low': return 'emerald';
    }
}

function getImpactLabel(impact: 'low' | 'medium' | 'high'): string {
    switch (impact) {
        case 'high': return 'Високий вплив';
        case 'medium': return 'Середній вплив';
        case 'low': return 'Низький вплив';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Entity Card (with type promotion)
// ─────────────────────────────────────────────────────────────────────────────

interface EntityCardProps {
    entity: {
        name: string;
        role?: string;
        trait?: string;
        description?: string;
        confidence: number;
        extractedFrom: string;
    };
    initialType: EntityType;
    onTypeChange: (newType: EntityType) => void;
    onSelect: (selected: boolean) => void;
    isSelected: boolean;
}

const EntityCard: React.FC<EntityCardProps> = ({
    entity,
    initialType,
    onTypeChange,
    onSelect,
    isSelected
}) => {
    const [currentType, setCurrentType] = useState<EntityType>(initialType);
    const Icon = getEntityIcon(currentType);
    const confidence = Math.round(entity.confidence * 100);

    const handleTypeChange = (newType: EntityType) => {
        setCurrentType(newType);
        onTypeChange(newType);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "bg-gradient-to-br from-violet-50 to-amber-50 border-2 p-4 rounded-xl transition-all",
                isSelected ? "border-violet-400 shadow-lg" : "border-violet-200 shadow-sm"
            )}
        >
            {/* Header with checkbox */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => onSelect(e.target.checked)}
                        className="w-4 h-4 rounded border-violet-300 text-violet-600 focus:ring-violet-500"
                    />
                    <div className="bg-violet-100 text-violet-600 p-2 rounded-lg">
                        <Icon size={16} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-ink">{entity.name}</h4>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-violet-500">
                            {getTypeLabel(currentType)}
                        </span>
                    </div>
                </div>

                {/* Confidence badge */}
                <div className="flex items-center gap-1 bg-amber-100 px-2 py-1 rounded-full">
                    <Sparkles size={10} className="text-amber-600" />
                    <span className="text-[10px] font-bold text-amber-700">{confidence}%</span>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-1.5 text-[11px] mb-3 ml-7">
                {entity.role && (
                    <div className="flex gap-2">
                        <span className="text-ink/40 font-medium uppercase shrink-0">Role:</span>
                        <span className="text-ink/70">{entity.role}</span>
                    </div>
                )}
                {entity.trait && (
                    <div className="flex gap-2">
                        <span className="text-ink/40 font-medium uppercase shrink-0">Trait:</span>
                        <span className="text-ink/70">{entity.trait}</span>
                    </div>
                )}
                {entity.description && (
                    <div className="flex gap-2">
                        <span className="text-ink/40 font-medium uppercase shrink-0">Desc:</span>
                        <span className="text-ink/70">{entity.description}</span>
                    </div>
                )}
                <div className="flex gap-2">
                    <span className="text-ink/40 font-medium uppercase shrink-0">Знайдено:</span>
                    <span className="text-ink/50 italic text-[10px]">"{entity.extractedFrom}"</span>
                </div>
            </div>

            {/* Type promotion dropdown */}
            <div className="ml-7 flex items-center gap-2">
                <span className="text-[10px] text-ink/40 uppercase font-medium">Тип:</span>
                <select
                    value={currentType}
                    onChange={(e) => handleTypeChange(e.target.value as EntityType)}
                    className="text-xs bg-white border border-violet-200 rounded px-2 py-1 text-violet-700 font-medium focus:outline-none focus:ring-2 focus:ring-violet-400"
                >
                    <option value="character">Персонаж</option>
                    <option value="location">Локація</option>
                    <option value="event">Подія</option>
                </select>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Conflict Card
// ─────────────────────────────────────────────────────────────────────────────

interface ConflictCardProps {
    conflict: {
        type: string;
        entityId: string;
        entityType: string;
        oldValue: string;
        newValue: string;
        impact: 'low' | 'medium' | 'high';
        affectedScenes: string[];
        explanation: string;
    };
}

const ConflictCard: React.FC<ConflictCardProps> = ({ conflict }) => {
    const impactColor = getImpactColor(conflict.impact);

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
                "border-l-4 p-4 rounded-r-xl bg-white",
                `border-${impactColor}-500`
            )}
            style={{ borderLeftColor: `var(--${impactColor}-500)` }}
        >
            <div className="flex items-start gap-3">
                <AlertTriangle size={18} className={`text-${impactColor}-600 shrink-0 mt-0.5`} />
                <div className="flex-1">
                    <p className="text-sm text-ink font-medium mb-2">{conflict.explanation}</p>

                    {/* Old vs New */}
                    <div className="flex items-center gap-3 text-[11px] mb-2">
                        <div className="flex items-center gap-1">
                            <span className="text-red-500 font-bold">—</span>
                            <span className="text-ink/50 line-through">{conflict.oldValue}</span>
                        </div>
                        <span className="text-ink/30">→</span>
                        <div className="flex items-center gap-1">
                            <span className="text-emerald-500 font-bold">+</span>
                            <span className="text-emerald-700 font-medium">{conflict.newValue}</span>
                        </div>
                    </div>

                    {/* Impact badge */}
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full",
                            `bg-${impactColor}-100 text-${impactColor}-700`
                        )}>
                            {getImpactLabel(conflict.impact)}
                        </span>
                        {conflict.affectedScenes.length > 0 && (
                            <span className="text-[10px] text-ink/40">
                                {conflict.affectedScenes.length} сцен потребують оновлення
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding Coach Tip
// ─────────────────────────────────────────────────────────────────────────────

const OnboardingTip: React.FC<{ onDismiss: () => void }> = ({ onDismiss }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-violet-100 to-amber-100 border border-violet-300 p-4 rounded-xl mb-6"
        >
            <div className="flex items-start gap-3">
                <div className="bg-violet-500 text-white p-2 rounded-lg shrink-0">
                    <Info size={16} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm text-ink mb-2">👋 Коуч-підказка</h4>
                    <p className="text-xs text-ink/70 leading-relaxed mb-3">
                        Коли ви редагуєте текст, я автоматично відстежую:
                        <ul className="list-disc ml-4 mt-1 space-y-0.5">
                            <li>Нових персонажів, локації, події</li>
                            <li>Суперечності з попереднім canon</li>
                            <li>Сцени, які потребують оновлення</li>
                        </ul>
                    </p>
                    <p className="text-xs text-violet-700 font-medium">
                        Ви завжди контролюєте, що стає правдою історії.
                    </p>
                </div>
                <button
                    onClick={onDismiss}
                    className="text-ink/40 hover:text-ink/70 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </motion.div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Guardian Dialog
// ─────────────────────────────────────────────────────────────────────────────

export default function GuardianDialog({
    isOpen,
    result,
    onConfirm,
    onReject,
    onClose,
    showOnboarding = false,
}: GuardianDialogProps) {
    const [selectedEntities, setSelectedEntities] = useState<Map<string, {
        entity: any;
        type: EntityType;
        originalType: EntityType
    }>>(new Map());
    const [showTip, setShowTip] = useState(showOnboarding);

    // Reset selection when result changes
    useEffect(() => {
        if (!result) return;

        const newSelection = new Map<string, { entity: any; type: EntityType; originalType: EntityType }>();

        // Auto-select all new entities by default
        result.newEntities.characters.forEach(char => {
            newSelection.set(char.name, {
                entity: char,
                type: 'character',
                originalType: 'character'
            });
        });
        result.newEntities.locations.forEach(loc => {
            newSelection.set(loc.name, {
                entity: loc,
                type: 'location',
                originalType: 'location'
            });
        });
        result.newEntities.events.forEach(evt => {
            newSelection.set(evt.name, {
                entity: evt,
                type: 'event',
                originalType: 'event'
            });
        });

        setSelectedEntities(newSelection);
    }, [result]);

    if (!isOpen || !result) return null;

    const totalEntities =
        result.newEntities.characters.length +
        result.newEntities.locations.length +
        result.newEntities.events.length;

    const hasConflicts = result.conflicts.length > 0;
    const hasSuggestions = result.suggestions.length > 0;

    const handleEntitySelect = (name: string, selected: boolean) => {
        setSelectedEntities(prev => {
            const newMap = new Map(prev);
            if (!selected) {
                newMap.delete(name);
            }
            return newMap;
        });
    };

    const handleTypeChange = (name: string, newType: EntityType) => {
        setSelectedEntities(prev => {
            const newMap = new Map(prev);
            const existing = newMap.get(name);
            if (existing) {
                newMap.set(name, { ...existing, type: newType });
            }
            return newMap;
        });
    };

    const handleConfirm = () => {
        const confirmedEntities: ConfirmedEntity[] = Array.from(selectedEntities.values()).map(
            ({ entity, type, originalType }) => ({
                name: entity.name,
                type,
                originalType,
                role: entity.role,
                trait: entity.trait,
                description: entity.description,
            })
        );

        onConfirm(confirmedEntities);
        onClose();
    };

    const handleReject = () => {
        onReject();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-paper w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gradient-to-br from-violet-500 to-amber-500 p-6 rounded-t-2xl">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                                        <Shield size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="font-serif text-2xl font-bold text-white">
                                            Хранитель Канону
                                        </h2>
                                        <p className="text-white/80 text-sm mt-1">
                                            Я помітив зміни у вашому тексті
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-white/70 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Onboarding tip */}
                            {showTip && <OnboardingTip onDismiss={() => setShowTip(false)} />}

                            {/* Conflicts (if any) */}
                            {hasConflicts && (
                                <div className="mb-6">
                                    <h3 className="font-serif text-lg font-bold text-ink mb-3 flex items-center gap-2">
                                        <AlertTriangle size={18} className="text-amber-600" />
                                        Можливі конфлікти ({result.conflicts.length})
                                    </h3>
                                    <div className="space-y-3">
                                        {result.conflicts.map((conflict, idx) => (
                                            <ConflictCard key={idx} conflict={conflict} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* New entities */}
                            {totalEntities > 0 && (
                                <div className="mb-6">
                                    <h3 className="font-serif text-lg font-bold text-ink mb-3 flex items-center gap-2">
                                        <Sparkles size={18} className="text-violet-600" />
                                        Нові сутності ({totalEntities})
                                    </h3>
                                    <p className="text-xs text-ink/50 mb-4">
                                        Оберіть сутності для додання до canon. Ви можете змінити тип, якщо AI помилився.
                                    </p>
                                    <div className="space-y-3">
                                        {result.newEntities.characters.map(char => (
                                            <EntityCard
                                                key={char.name}
                                                entity={char}
                                                initialType="character"
                                                onTypeChange={(newType) => handleTypeChange(char.name, newType)}
                                                onSelect={(selected) => handleEntitySelect(char.name, selected)}
                                                isSelected={selectedEntities.has(char.name)}
                                            />
                                        ))}
                                        {result.newEntities.locations.map(loc => (
                                            <EntityCard
                                                key={loc.name}
                                                entity={loc}
                                                initialType="location"
                                                onTypeChange={(newType) => handleTypeChange(loc.name, newType)}
                                                onSelect={(selected) => handleEntitySelect(loc.name, selected)}
                                                isSelected={selectedEntities.has(loc.name)}
                                            />
                                        ))}
                                        {result.newEntities.events.map(evt => (
                                            <EntityCard
                                                key={evt.name}
                                                entity={evt}
                                                initialType="event"
                                                onTypeChange={(newType) => handleTypeChange(evt.name, newType)}
                                                onSelect={(selected) => handleEntitySelect(evt.name, selected)}
                                                isSelected={selectedEntities.has(evt.name)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suggestions (if any) */}
                            {hasSuggestions && (
                                <div className="mb-6">
                                    <h3 className="font-serif text-lg font-bold text-ink mb-3 flex items-center gap-2">
                                        <Zap size={18} className="text-violet-600" />
                                        Підказки ({result.suggestions.length})
                                    </h3>
                                    <div className="space-y-2">
                                        {result.suggestions.map((suggestion, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "p-3 rounded-lg text-xs",
                                                    suggestion.severity === 'warning'
                                                        ? "bg-amber-50 border border-amber-200 text-amber-800"
                                                        : "bg-blue-50 border border-blue-200 text-blue-800"
                                                )}
                                            >
                                                {suggestion.message}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-ink/10">
                                <button
                                    onClick={handleConfirm}
                                    disabled={selectedEntities.size === 0}
                                    className={cn(
                                        "flex-1 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2",
                                        selectedEntities.size > 0
                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg hover:shadow-xl"
                                            : "bg-ink/10 text-ink/30 cursor-not-allowed"
                                    )}
                                >
                                    <Check size={18} />
                                    Підтвердити зміни ({selectedEntities.size})
                                </button>
                                <button
                                    onClick={handleReject}
                                    className="px-6 py-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
                                >
                                    Відхилити все
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
