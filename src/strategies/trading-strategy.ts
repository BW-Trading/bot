import { ValidationError } from "class-validator";
import { MarketAction } from "../entities/market-action.entity";
import { Strategy } from "../entities/strategy.entity";
import { ITradingStrategy } from "./trading-strategy.interface";
import { strategyService } from "../services/strategy.service";

export abstract class TradingStrategy implements ITradingStrategy {
    strategy: Strategy;
    isRunning: boolean;

    constructor(strategy: Strategy) {
        this.strategy = strategy;
        this.isRunning = false;
    }

    /**
     * Fonction abstraite à implémenter par les classes filles
     * Décrit les actions à effectuer lors de l'exécution de la stratégie
     */
    abstract run(): Promise<MarketAction[]>;

    /**
     * Fonction de validation de la configuration appelée par le service de stratégie à la création d'une instance
     */
    abstract validateConfig(config: any): ValidationError[];

    start() {
        this.isRunning = true;
    }

    stop() {
        this.isRunning = false;
    }

    getRunning(): boolean {
        return this.isRunning;
    }

    getPortfolio() {
        return strategyService.getPortfolioForUserStrategy(
            this.strategy.user.id,
            this.strategy.id
        );
    }
}
