import { Strategy } from "../entities/strategy.entity";
import { TradeSignal } from "./trade-signal";

export enum SignalAction {
    BUY = "BUY",
    SELL = "SELL",
}

export abstract class TradingStrategy {
    protected strategyId: number;
    protected config: any;
    protected state: any;
    protected activeOrders: Array<{
        id: number;
        action: SignalAction;
        symbol: string;
        timestamp: number;
    }> = [];

    constructor(strategy: Strategy) {
        this.strategyId = strategy.id;
        this.validateConfig(strategy.config);
        this.config = strategy.config;
        this.state = strategy.state || {};
    }

    // Fonction de validation de la configuration
    public abstract validateConfig(config: any): any;

    // Fonction qui retourne les types de données nécessaires pour cette stratégie ex: ["orderBook", "tickerPrice"]
    public abstract getRequiredMarketData(): string[];

    // Analyse les données de marché et met à jour l'état
    public abstract analyze(marketData: any): void;

    // Génère un signal ou un ensemble de signaux
    public abstract generateSignals(): TradeSignal[];

    public getState(): any {
        return this.state;
    }

    public addActiveOrder(orderId: number, signal: any): void {
        this.activeOrders.push({
            id: orderId,
            action: signal.action,
            symbol: signal.symbol,
            timestamp: Date.now(),
        });
    }

    public removeActiveOrder(orderId: number): void {
        this.activeOrders = this.activeOrders.filter(
            (order) => order.id !== orderId
        );
    }
}
