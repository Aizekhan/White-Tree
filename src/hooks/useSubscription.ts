import { SubscriptionTier, TIER_PERMISSIONS, Feature } from '../config/subscription';

/**
 * Хук для перевірки доступу до функцій на основі поточної підписки.
 * 
 * @param currentTier Поточний рівень підписки користувача (або проєкту)
 */
export function useSubscription(currentTier?: string) {
    // Приводимо рядок з БД до нашого ENUM
    const tier = (currentTier?.toLowerCase() as SubscriptionTier) || SubscriptionTier.FREE;

    /**
     * Перевіряє, чи має користувач доступ до конкретної функції.
     */
    const checkAccess = (feature: Feature): boolean => {
        const permissions = TIER_PERMISSIONS[tier] || TIER_PERMISSIONS[SubscriptionTier.FREE];
        return permissions.includes(feature);
    };

    /**
     * Чи є користувач підписником будь-якого платного рівня.
     */
    const isPaid = tier !== SubscriptionTier.FREE;

    return {
        tier,
        checkAccess,
        isPaid,
        isPro: tier === SubscriptionTier.PRO || tier === SubscriptionTier.PRO_PLUS,
        isProPlus: tier === SubscriptionTier.PRO_PLUS
    };
}
