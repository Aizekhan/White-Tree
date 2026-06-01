import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, X, Edit2, Sparkles, MapPin, Clock, Users as UsersIcon, Package, Zap } from "lucide-react";
import { ProjectCanon, CanonCharacter, CanonLocation, CanonEvent, CanonFaction, CanonArtifact, CanonBase } from "../../../canon";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CanonConfirmationQueueProps {
    canon?: ProjectCanon;
    onConfirm: (entityId: string, entityType: string) => void;
    onReject: (entityId: string, entityType: string) => void;
    onEdit: (entity: CanonBase, entityType: string) => void;
}

// Helper to get icon by entity type
function getEntityIcon(type: string) {
    switch (type) {
        case "characters": return UsersIcon;
        case "locations": return MapPin;
        case "events": return Clock;
        case "factions": return Zap;
        case "artifacts": return Package;
        default: return Sparkles;
    }
}

// Helper to get type label in Ukrainian
function getTypeLabel(type: string) {
    switch (type) {
        case "characters": return "Персонаж";
        case "locations": return "Локація";
        case "events": return "Подія";
        case "factions": return "Фракція";
        case "artifacts": return "Артефакт";
        default: return type;
    }
}

// Entity card component
interface EntityCardProps {
    entity: CanonBase;
    type: string;
    onConfirm: () => void;
    onReject: () => void;
    onEdit: () => void;
}

const EntityCard: React.FC<EntityCardProps> = ({ entity, type, onConfirm, onReject, onEdit }) => {
    const Icon = getEntityIcon(type);
    const confidence = Math.round((entity.origin?.confidence ?? 0.5) * 100);

    // Type-specific details
    const charDetails = type === "characters" ? (entity as CanonCharacter) : null;
    const locDetails = type === "locations" ? (entity as CanonLocation) : null;
    const eventDetails = type === "events" ? (entity as CanonEvent) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-br from-violet-50 to-amber-50 border border-violet-200 p-4 rounded-xl shadow-sm group relative"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-violet-100 text-violet-600 p-2 rounded-lg">
                        <Icon size={16} />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-ink">{entity.name}</h4>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-violet-500">
                            {getTypeLabel(type)}
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
            <div className="space-y-1.5 text-[11px] mb-4">
                {charDetails && (
                    <>
                        {charDetails.role && (
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Role:</span>
                                <span className="text-ink/70">{charDetails.role}</span>
                            </div>
                        )}
                        {charDetails.trait && (
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Trait:</span>
                                <span className="text-ink/70">{charDetails.trait}</span>
                            </div>
                        )}
                        {charDetails.goal && (
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Goal:</span>
                                <span className="text-ink/70">{charDetails.goal}</span>
                            </div>
                        )}
                        {charDetails.relations && charDetails.relations.length > 0 && (
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Relations:</span>
                                <span className="text-ink/70">
                                    {charDetails.relations.map(r => r.kind).join(", ")}
                                </span>
                            </div>
                        )}
                    </>
                )}

                {locDetails && locDetails.desc && (
                    <div className="flex gap-2">
                        <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Desc:</span>
                        <span className="text-ink/70">{locDetails.desc}</span>
                    </div>
                )}

                {eventDetails && (
                    <>
                        {eventDetails.when && (
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">When:</span>
                                <span className="text-ink/70">{eventDetails.when}</span>
                            </div>
                        )}
                        {eventDetails.act && (
                            <div className="flex gap-2">
                                <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Act:</span>
                                <span className="text-ink/70">Act {eventDetails.act}</span>
                            </div>
                        )}
                    </>
                )}

                {/* Slug */}
                <div className="flex gap-2">
                    <span className="text-ink/40 font-medium uppercase shrink-0 w-16">Slug:</span>
                    <span className="text-ink/40 font-mono text-[10px]">{entity.slug}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onConfirm}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                >
                    <Check size={14} />
                    Підтвердити
                </button>
                <button
                    onClick={onEdit}
                    className="bg-violet-100 hover:bg-violet-200 text-violet-700 px-3 py-2 rounded-lg transition-all"
                >
                    <Edit2 size={14} />
                </button>
                <button
                    onClick={onReject}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-2 rounded-lg transition-all"
                >
                    <X size={14} />
                </button>
            </div>
        </motion.div>
    );
};

export default function CanonConfirmationQueue({
    canon,
    onConfirm,
    onReject,
    onEdit
}: CanonConfirmationQueueProps) {
    if (!canon) return null;

    // Gather all inferred (unconfirmed) entities
    const inferredEntities: Array<{ entity: CanonBase; type: string }> = [];

    (canon.characters || []).forEach(e => {
        if (!e.origin?.confirmed) inferredEntities.push({ entity: e, type: "characters" });
    });
    (canon.locations || []).forEach(e => {
        if (!e.origin?.confirmed) inferredEntities.push({ entity: e, type: "locations" });
    });
    (canon.events || []).forEach(e => {
        if (!e.origin?.confirmed) inferredEntities.push({ entity: e, type: "events" });
    });
    (canon.factions || []).forEach(e => {
        if (!e.origin?.confirmed) inferredEntities.push({ entity: e, type: "factions" });
    });
    (canon.artifacts || []).forEach(e => {
        if (!e.origin?.confirmed) inferredEntities.push({ entity: e, type: "artifacts" });
    });

    if (inferredEntities.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-violet-500 to-amber-500 p-2 rounded-lg">
                    <Sparkles size={16} className="text-white" />
                </div>
                <div>
                    <h3 className="font-serif text-lg font-bold text-ink">AI-запропоновані сутності</h3>
                    <p className="text-[10px] text-ink/50 uppercase tracking-wider">
                        {inferredEntities.length} {inferredEntities.length === 1 ? "сутність" : "сутностей"} потребує підтвердження
                    </p>
                </div>
            </div>

            {/* Info banner */}
            <div className="bg-violet-50 border border-violet-200 p-3 rounded-xl mb-4">
                <p className="text-xs text-violet-700 leading-relaxed">
                    <strong>Інферовані сутності</strong> — це те, що AI витягнув з вашого тексту і Memory.
                    Вони не впливають на генерацію, поки ви їх не підтвердите.
                    Confidence показує впевненість AI (вищий % = більше доказів у тексті).
                </p>
            </div>

            {/* Entity cards */}
            <div className="space-y-3">
                <AnimatePresence>
                    {inferredEntities.map(({ entity, type }) => (
                        <EntityCard
                            key={entity.id}
                            entity={entity}
                            type={type}
                            onConfirm={() => onConfirm(entity.id, type)}
                            onReject={() => onReject(entity.id, type)}
                            onEdit={() => onEdit(entity, type)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
