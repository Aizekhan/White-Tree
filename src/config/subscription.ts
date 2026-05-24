/**
 * Перелік усіх функцій програми, які можуть бути обмежені підпискою.
 */
export const FEATURES = {
    IMPROVE_NARRATIVE: 'improve_narrative',
    GLOBAL_ANALYSIS: 'global_analysis',
    ADAPT_SCREENPLAY: 'adapt_screenplay',
    HISTORY_UNLIMITED: 'history_unlimited',
    TENSION_ANALYSIS: 'tension_analysis',
    AUDIO_READING: 'audio_reading',
} as const;

export type Feature = typeof FEATURES[keyof typeof FEATURES];

/**
 * Рівні підписки
 */
export enum SubscriptionTier {
    FREE = 'free',
    PRO = 'pro',
    PRO_PLUS = 'pro_plus'
}

/**
 * Мапа дозволів для кожного рівня
 */
export const TIER_PERMISSIONS: Record<SubscriptionTier, Feature[]> = {
    [SubscriptionTier.FREE]: [
        FEATURES.GLOBAL_ANALYSIS,
        FEATURES.TENSION_ANALYSIS
    ],
    [SubscriptionTier.PRO]: [
        FEATURES.GLOBAL_ANALYSIS,
        FEATURES.TENSION_ANALYSIS,
        FEATURES.IMPROVE_NARRATIVE
    ],
    [SubscriptionTier.PRO_PLUS]: [
        FEATURES.GLOBAL_ANALYSIS,
        FEATURES.TENSION_ANALYSIS,
        FEATURES.IMPROVE_NARRATIVE,
        FEATURES.ADAPT_SCREENPLAY,
        FEATURES.HISTORY_UNLIMITED,
        FEATURES.AUDIO_READING
    ],
};
