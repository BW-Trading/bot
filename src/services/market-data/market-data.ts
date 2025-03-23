export interface MarketDataService {
    /**
     * Récupérer le prix actuel d'une paire de trading
     */
    getTickerPrice(symbol: string, symbols: string[]): Promise<any>;

    /**
     * Récupérer l'order book d'une paire de trading
     */
    getOrderBook(symbol: string, limit: number): Promise<any>;

    /**
     * Récupérer l'historique des prix du marché (bougies)
     */
    getMarketHistory(
        symbol: string,
        interval: string,
        limit: number
    ): Promise<any>;
}
