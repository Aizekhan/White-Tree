import React from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { EngineLog } from '../../../types';
import { storyEngineConfig } from '../../../config/storyEngineConfig';

interface EngineLogicPanelProps {
    engineLogs: EngineLog[];
}

export default function EngineLogicPanel({ engineLogs }: EngineLogicPanelProps) {
    return (
        <motion.div
            key="engine-logic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 pb-20"
        >
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif font-bold">Story Engine Logic</h2>
                    <p className="text-sm text-ink/40">Internal documentation for the narrative engine.</p>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-violet-50 border border-violet-100 text-xs text-violet-800 font-mono flex flex-wrap items-center gap-2">
                <span className="font-bold">Pipeline:</span>
                {storyEngineConfig.pipeline.map((step, index) => (
                    <React.Fragment key={step}>
                        <span>{step}</span>
                        {index < storyEngineConfig.pipeline.length - 1 && <span>→</span>}
                    </React.Fragment>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Live Engine Log */}
                <div className="narrative-card p-6 bg-ink text-paper shadow-sm">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-400 mb-4 flex items-center gap-2">
                        <Activity size={14} />
                        Live Engine Log
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2 font-mono text-xs">
                        {engineLogs.length === 0 ? (
                            <p className="text-ink/40 italic">No engine activity yet. Generate or analyze a scene to see logs.</p>
                        ) : (
                            engineLogs.map((log) => (
                                <div key={log.id} className="flex flex-col gap-1 p-2 rounded bg-paper/5 border border-paper/10">
                                    <div className="flex items-center justify-between">
                                        <span className={`font-bold ${log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' ? 'text-amber-400' : 'text-blue-400'}`}>
                                            {log.action}
                                        </span>
                                        <span className="text-[9px] text-ink/40">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                    <span className="text-ink/60">{log.details}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Dynamic Modules */}
                {Object.entries(storyEngineConfig.modules).map(([key, module], index) => {
                    const Icon = module.icon;
                    return (
                        <div key={key} className="narrative-card p-6 bg-white border-ink/5 shadow-sm">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-violet-600 mb-4 flex items-center gap-2">
                                <Icon size={14} />
                                {index + 1}. {module.title}
                            </h3>
                            <div className="space-y-4 text-sm text-ink/70 leading-relaxed">
                                <p>{module.description}</p>
                                {module.details && module.details.length > 0 && (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {module.details.map((detail, i) => {
                                            const colonIndex = detail.indexOf(':');
                                            if (colonIndex !== -1) {
                                                const boldPart = detail.substring(0, colonIndex + 1);
                                                const restPart = detail.substring(colonIndex + 1);
                                                return (
                                                    <li key={i}>
                                                        <strong>{boldPart}</strong>{restPart}
                                                    </li>
                                                );
                                            }
                                            return <li key={i}>{detail}</li>;
                                        })}
                                    </ul>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
