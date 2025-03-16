import { IntervalEnum } from "../entities/enums/interval.enum";
import { MarketActionEnum } from "../entities/enums/market-action.enum";
import { MarketAction } from "../entities/market-action.entity";
import { Strategy } from "../entities/strategy.entity";
import { marketDataService } from "../services/market-data.service";
import { maxBuyableAmount } from "../utils/helpers/buy-sell-helper";
import { TradingStrategy } from "./trading-strategy";
import { IsNumber, ValidationError } from "class-validator";

/**
 *
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 * La stratégie n'est plus à jour depuis le refactoring de la gestion des MarketActions
 *
 */

/**
 * Stratégie de trading basée sur les moyennes mobiles
 * - Acheter lorsque la moyenne mobile courte passe en dessous de la moyenne mobile longue de plus de thresholdBuy%
 * - Vendre lorsque la moyenne mobile courte croise la moyenne mobile longue par le bas de plus de thresholdSell%
 *
 */
export interface MovingAverageStrategyConfig {
    shortPeriod: number; // Période de la moyenne mobile courte (en nombre de bougies)
    longPeriod: number; // Période de la moyenne mobile longue (en nombre de bougies)
    thresholdBuy: number; // Seuil de déclenchement du signal d'achat (en 1/100)
    thresholdSell: number; // Seuil de déclenchement du signal de vente (en 1/100)
    interval: IntervalEnum; // Interval de temps des bougies
}

export class MovingAverageStrategy extends TradingStrategy {
    constructor(strategy: Strategy) {
        super(strategy);
    }

    // Fonction de validation de la configuration (appelée par super())
    validateConfig(config: any): ValidationError[] {
        const errors: ValidationError[] = [];

        if (!config.shortPeriod) {
            errors.push({
                property: "shortPeriod",
                constraints: {
                    isDefined: "shortPeriod is required",
                },
            });
        }
        if (!config.longPeriod) {
            errors.push({
                property: "longPeriod",
                constraints: {
                    isDefined: "longPeriod is required",
                },
            });
        }

        if (config.shortPeriod && !IsNumber(config.shortPeriod)) {
            errors.push({
                property: "shortPeriod",
                constraints: {
                    isNumber: "shortPeriod must be a number",
                },
            });
        }

        if (config.longPeriod && !IsNumber(config.longPeriod)) {
            errors.push({
                property: "longPeriod",
                constraints: {
                    isNumber: "longPeriod must be a number",
                },
            });
        }

        if (config.shortPeriod && config.longPeriod) {
            if (config.shortPeriod >= config.longPeriod) {
                errors.push({
                    property: "shortPeriod",
                    constraints: {
                        isLessThan: "shortPeriod must be less than longPeriod",
                    },
                });
            }
        }

        if (!config.thresholdBuy) {
            errors.push({
                property: "thresholdBuy",
                constraints: {
                    isDefined: "thresholdBuy is required",
                },
            });
        }

        if (config.thresholdBuy && !IsNumber(config.thresholdBuy)) {
            errors.push({
                property: "thresholdBuy",
                constraints: {
                    isNumber: "thresholdBuy must be a number",
                },
            });
        }

        if (
            (config.thresholdBuy && config.thresholdBuy <= 0) ||
            config.thresholdBuy > 1
        ) {
            errors.push({
                property: "thresholdBuy",
                constraints: {
                    isNumber: "thresholdBuy must be between 0 and 1",
                },
            });
        }

        if (!config.thresholdSell) {
            errors.push({
                property: "thresholdSell",
                constraints: {
                    isDefined: "thresholdSell is required",
                },
            });
        }

        if (config.thresholdSell && !IsNumber(config.thresholdSell)) {
            errors.push({
                property: "thresholdSell",
                constraints: {
                    isNumber: "thresholdSell must be a number",
                },
            });
        }

        if (
            (config.thresholdSell && config.thresholdSell <= 0) ||
            config.thresholdSell > 1
        ) {
            errors.push({
                property: "thresholdSell",
                constraints: {
                    isNumber: "thresholdSell must be between 0 and 1",
                },
            });
        }

        if (!config.interval) {
            errors.push({
                property: "interval",
                constraints: {
                    isDefined: "interval is required",
                },
            });
        }

        if (
            config.interval &&
            !Object.values(IntervalEnum).includes(
                config.interval as IntervalEnum
            )
        ) {
            errors.push({
                property: "interval",
                constraints: {
                    isEnum: "interval must be a valid IntervalEnum value",
                },
            });
        }

        return errors;
    }

    async run(): Promise<MarketAction[]> {
        const config = this.strategy.config as MovingAverageStrategyConfig;
        let resultingActions: MarketAction[] = [];
        // Récupérer les bougies
        const startTime = new Date().getTime() - config.longPeriod * 60 * 1000;
        const endTime = new Date().getTime();
        const longPeriodCandles = await marketDataService.getMarketHistory(
            this.strategy.asset,
            config.interval,
            undefined, // Use default limit
            startTime,
            endTime
        );
        const currentPrice =
            longPeriodCandles[longPeriodCandles.length - 1].close;
        // Calculer les moyennes mobiles
        const longMovingAverage = this.calculateMovingAverage(
            longPeriodCandles,
            config.longPeriod
        );

        const shortMovingAverage = this.calculateMovingAverage(
            longPeriodCandles,
            config.shortPeriod
        );

        // Comparer les moyennes mobiles pour déclencher les signaux d'achat et de vente
        for (let i = 0; i < longMovingAverage.length; i++) {
            if (
                shortMovingAverage[i] < longMovingAverage[i] &&
                shortMovingAverage[i] <
                    longMovingAverage[i] * (1 - config.thresholdBuy)
            ) {
                // Signal d'achat
                resultingActions.push(
                    new MarketAction(
                        MarketActionEnum.BUY,
                        currentPrice,
                        maxBuyableAmount(
                            await this.getPortfolio(),
                            currentPrice
                        )
                    )
                );
            } else if (
                shortMovingAverage[i] > longMovingAverage[i] &&
                shortMovingAverage[i] >
                    longMovingAverage[i] * (1 + config.thresholdSell)
            ) {
                // Signal de vente
                resultingActions.push(
                    new MarketAction(
                        MarketActionEnum.SELL,
                        currentPrice,
                        (await this.getPortfolio()).amount
                    )
                );
            } else {
                // Pas de signal
                let noActionMarketAction = new MarketAction(
                    MarketActionEnum.HOLD,
                    currentPrice,
                    0
                );
                noActionMarketAction.failedAt = new Date();
                noActionMarketAction.failedReason = `Short MA: ${
                    shortMovingAverage[i]
                }, Long MA: ${longMovingAverage[i]}, Threshold Buy: ${
                    longMovingAverage[i] * (1 - config.thresholdBuy)
                }, Threshold Sell: ${
                    longMovingAverage[i] * (1 + config.thresholdSell)
                }`;
                resultingActions.push(noActionMarketAction);
            }
        }

        return resultingActions;
    }

    // Calculer la moyenne mobile sur les N dernières bougies
    private calculateMovingAverage(
        candles: { close: string }[],
        period: number
    ): number[] {
        const ma: number[] = [];

        if (candles.length < period) {
            return ma; // Pas assez de données sur la période données
        }

        let sum = 0;

        for (let i = 0; i < candles.length; i++) {
            const closeValue = parseFloat(candles[i].close);
            if (isNaN(closeValue)) continue;
            sum += closeValue;

            if (i >= period - 1) {
                ma.push(sum / period);
                sum -= parseFloat(candles[i - (period - 1)].close);
            }
        }

        return ma;
    }
}
