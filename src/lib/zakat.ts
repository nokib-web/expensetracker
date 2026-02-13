/**
 * Zakat calculation utilities
 * Zakat is 2.5% of eligible wealth held for a full lunar year (Nisab threshold)
 */

export const ZAKAT_RATE = 0.025; // 2.5%
export const NISAB_GOLD_GRAMS = 87.48; // Approximately 87.48 grams of gold
export const NISAB_SILVER_GRAMS = 612.36; // Approximately 612.36 grams of silver

export interface ZakatCalculationInput {
    cash: number;
    bankBalance: number;
    investments: number;
    gold: number;
    silver: number;
    businessAssets: number;
    debtsOwed: number;
    debtsPayable: number;
}

export interface ZakatCalculationResult {
    totalWealth: number;
    netWealth: number;
    zakatDue: number;
    isEligible: boolean;
    nisabThreshold: number;
}

/**
 * Calculate Zakat based on wealth and nisab threshold
 * @param input - Wealth components
 * @param nisabThreshold - Current nisab threshold in currency
 * @returns Zakat calculation result
 */
export function calculateZakat(
    input: ZakatCalculationInput,
    nisabThreshold: number
): ZakatCalculationResult {
    const totalWealth =
        input.cash +
        input.bankBalance +
        input.investments +
        input.gold +
        input.silver +
        input.businessAssets +
        input.debtsOwed;

    const netWealth = totalWealth - input.debtsPayable;

    const isEligible = netWealth >= nisabThreshold;
    const zakatDue = isEligible ? netWealth * ZAKAT_RATE : 0;

    return {
        totalWealth,
        netWealth,
        zakatDue,
        isEligible,
        nisabThreshold,
    };
}

/**
 * Calculate Nisab threshold based on current gold price
 * @param goldPricePerGram - Current price of gold per gram in currency
 * @returns Nisab threshold amount
 */
export function calculateNisabFromGold(goldPricePerGram: number): number {
    return goldPricePerGram * NISAB_GOLD_GRAMS;
}

/**
 * Calculate Nisab threshold based on current silver price
 * @param silverPricePerGram - Current price of silver per gram in currency
 * @returns Nisab threshold amount
 */
export function calculateNisabFromSilver(silverPricePerGram: number): number {
    return silverPricePerGram * NISAB_SILVER_GRAMS;
}
